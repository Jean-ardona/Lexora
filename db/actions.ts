import { count, desc, eq, sql } from 'drizzle-orm';
import { db } from './client';
import { drops, practiceAttempts, userStats } from './schema';

const getTodayDateString = () => new Date().toISOString().split('T')[0];

// ─── Word of the day ──────────────────────────────────────────────────────────

export const getTodayDrop = async () => {
  const today = getTodayDateString();

  const existingDrop = await db
    .select()
    .from(drops)
    .where(eq(drops.dropDate, today))
    .limit(1);

  if (existingDrop.length > 0) {
    const existingWord = existingDrop[0];
    await db
      .update(drops)
      .set({ isLearned: true })
      .where(eq(drops.id, existingWord.id));
    return { ...existingWord, isLearned: true };
  }

  const randomDropList = await db
    .select()
    .from(drops)
    .where(eq(drops.isLearned, false))
    .orderBy(sql`RANDOM()`)
    .limit(1);

  if (randomDropList.length === 0) return null;

  const newDrop = randomDropList[0];

  await db
    .update(drops)
    .set({ dropDate: today, isLearned: true })
    .where(eq(drops.id, newDrop.id));

  return { ...newDrop, dropDate: today, isLearned: true };
};

export const getLearnedWords = async () => {
  return db
    .select()
    .from(drops)
    .where(eq(drops.isLearned, true))
    .orderBy(desc(drops.dropDate));
};

// ─── Practice Attempts ────────────────────────────────────────────────────────

export const getTodayPracticeAttempts = async (dropId: number) => {
  const today = getTodayDateString();
  return db
    .select()
    .from(practiceAttempts)
    .where(
      sql`${practiceAttempts.dropId} = ${dropId} AND ${practiceAttempts.practiceDate} = ${today}`
    )
    .orderBy(practiceAttempts.attemptNb);
};

export const savePracticeAttempt = async ({
  dropId,
  sentence,
  attemptNb,
}: {
  dropId: number;
  sentence: string;
  attemptNb: number;
}) => {
  const today = getTodayDateString();
  const now = new Date().toISOString();

  const [created] = await db
    .insert(practiceAttempts)
    .values({
      dropId,
      sentence,
      attemptNb,
      practiceDate: today,
      aiFeedback: null,
      createdAt: now,
    })
    .returning();

  return created;
};

/**
 * Nombre total de tentatives de practice (toutes dates confondues).
 * Utilisé dans la page Progress pour la stat "Practices done".
 */
export const getTotalPracticesCount = async (): Promise<number> => {
  const result = await db
    .select({ total: count() })
    .from(practiceAttempts);
  return result[0]?.total ?? 0;
};

// ─── Stats globales pour Progress ────────────────────────────────────────────

/**
 * Calcule le nombre de jours actifs depuis la première ouverture de l'app.
 * Basé sur firstActiveDate stocké dans userStats.
 */
export const getDaysActive = async (): Promise<number> => {
  const rows = await db.select().from(userStats).where(eq(userStats.id, 1)).limit(1);
  if (rows.length === 0 || !rows[0].firstActiveDate) return 1;

  const first = new Date(rows[0].firstActiveDate);
  const today = new Date();
  const diffMs = today.getTime() - first.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return diffDays + 1; // +1 pour inclure le premier jour
};

// ─── Milestones ───────────────────────────────────────────────────────────────

const isLearningMilestone = (wordsLearned: number): boolean => {
  const milestones = [7, 30, 60, 100, 180, 270, 365];
  return milestones.includes(wordsLearned);
};

export const checkAndUpdateLearningMilestone = async (): Promise<{
  wordsLearned: number;
  isNewMilestone: boolean;
}> => {
  const learnedWords = await getLearnedWords();
  const wordsLearned = learnedWords.length;

  const stats = await db.select().from(userStats).where(eq(userStats.id, 1)).limit(1);
  const lastMilestoneShown = stats.length > 0 ? stats[0].lastMilestoneShown || 0 : 0;

  const isNewMilestone = isLearningMilestone(wordsLearned) && wordsLearned > lastMilestoneShown;

  if (isNewMilestone) {
    await db
      .update(userStats)
      .set({ lastMilestoneShown: wordsLearned })
      .where(eq(userStats.id, 1));
  }

  return { wordsLearned, isNewMilestone };
};

// ─── Streak ───────────────────────────────────────────────────────────────────

const getYesterdayString = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
};

export const checkAndUpdateStreak = async (): Promise<{
  streak: number;
  bestStreak: number;
}> => {
  const today = getTodayDateString();
  const yesterday = getYesterdayString();

  const rows = await db.select().from(userStats).where(eq(userStats.id, 1)).limit(1);

  // Première ouverture
  if (rows.length === 0) {
    await db.insert(userStats).values({
      id: 1,
      streak: 1,
      bestStreak: 1,
      lastActiveDate: today,
      firstActiveDate: today, // 📅 on note le premier jour
    });
    return { streak: 1, bestStreak: 1 };
  }

  const stats = rows[0];
  const lastActive = stats.lastActiveDate;
  const currentStreak = stats.streak || 0;
  const currentBest = stats.bestStreak || 0;

  // Déjà ouvert aujourd'hui
  if (lastActive === today) {
    return { streak: currentStreak, bestStreak: currentBest };
  }

  // Streak continue
  if (lastActive === yesterday) {
    const newStreak = currentStreak + 1;
    const newBest = Math.max(newStreak, currentBest);
    await db
      .update(userStats)
      .set({ streak: newStreak, bestStreak: newBest, lastActiveDate: today })
      .where(eq(userStats.id, 1));
    return { streak: newStreak, bestStreak: newBest };
  }

  // Streak brisé → reset à 1 mais bestStreak reste intact
  await db
    .update(userStats)
    .set({ streak: 1, bestStreak: currentBest, lastActiveDate: today })
    .where(eq(userStats.id, 1));
  return { streak: 1, bestStreak: currentBest };
};

// ─── Notification Actions ─────────────────────────────────────────────────────

/**
 * Récupère le mot prévu pour aujourd'hui (ou en assigne un nouveau)
 * sans le marquer comme appris — utilisé pour construire la notification.
 */
export const getOrAssignTodayDropForNotif = async (): Promise<{
  id: number;
  term: string;
  definition: string;
} | null> => {
  const today = getTodayDateString();

  // Cherche un mot déjà assigné aujourd'hui
  const existing = await db
    .select({ id: drops.id, term: drops.term, definition: drops.definition })
    .from(drops)
    .where(eq(drops.dropDate, today))
    .limit(1);

  if (existing.length > 0) return existing[0];

  // Sinon, on en choisit un aléatoirement sans l'apprendre encore
  const random = await db
    .select({ id: drops.id, term: drops.term, definition: drops.definition })
    .from(drops)
    .where(eq(drops.isLearned, false))
    .orderBy(sql`RANDOM()`)
    .limit(1);

  if (random.length === 0) return null;

  // On assigne la date du jour sans marquer isLearned
  await db
    .update(drops)
    .set({ dropDate: today })
    .where(eq(drops.id, random[0].id));

  return random[0];
};

/**
 * Appelé quand l'utilisateur tape "Got it" dans la notification.
 * Marque le mot du jour comme appris et met à jour le streak,
 * tout ça sans ouvrir l'app.
 */
export const markTodayDropLearnedFromNotif = async (): Promise<void> => {
  const today = getTodayDateString();

  // Marquer le mot comme appris
  await db
    .update(drops)
    .set({ isLearned: true })
    .where(eq(drops.dropDate, today));

  // Mettre à jour le streak
  await checkAndUpdateStreak();
};
