import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const drops = sqliteTable('drops', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  term: text('term').notNull(),
  type: text('type').notNull(), // 'word' | 'expression' | 'phrasal_verb'
  phonetic: text('phonetic'),
  definition: text('definition').notNull(),
  examples: text('examples', { mode: 'json' }).$type<string[]>(),
  isLearned: integer('is_learned', { mode: 'boolean' }).default(false),
  dropDate: text('drop_date'), // YYYY-MM-DD
});

export const userStats = sqliteTable('user_stats', {
  id: integer('id').primaryKey().default(1),
  streak: integer('streak').default(0),
  bestStreak: integer('best_streak').default(0), // 🏆 Record all-time
  lastActiveDate: text('last_active_date'), // YYYY-MM-DD
  firstActiveDate: text('first_active_date'), // YYYY-MM-DD — pour calculer daysActive
  lastMilestoneShown: integer('last_milestone_shown').default(0),
});

// ─── Practice Attempts ────────────────────────────────────────────────────────
// Une ligne par tentative de l'utilisateur sur un mot donné.
// - dropId    : référence au mot pratiqué
// - sentence  : la phrase écrite par l'utilisateur
// - attemptNb : numéro de la tentative (1 ou 2)
// - practiceDate : date YYYY-MM-DD pour retrouver les tentatives du jour
// - aiFeedback : le feedback IA (null tant que l'IA n'est pas intégrée)
export const practiceAttempts = sqliteTable('practice_attempts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  dropId: integer('drop_id').notNull(),
  sentence: text('sentence').notNull(),
  attemptNb: integer('attempt_nb').notNull(), // 1 | 2
  practiceDate: text('practice_date').notNull(), // YYYY-MM-DD
  aiFeedback: text('ai_feedback', { mode: 'json' }), // null pour l'instant, rempli plus tard
  createdAt: text('created_at').notNull(), // ISO timestamp complet
});