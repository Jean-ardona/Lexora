# Journal de développement

---

## 20 Juin 2025

### 🔔 Notifications — Audit & corrections

**Audit complet de l'architecture existante.**
Le système était bien conçu (scheduling, GOT_IT, LEARN_MORE, background task, settings) mais avait plusieurs bugs bloquants.

**Bugs corrigés :**

- `DateTimePicker` utilisait `onValueChange` avec la mauvaise signature (API v8) → corrigé pour l'API v9 : `onValueChange(event, date)` où `date` est garanti non-null. Le time picker ne sauvegardait jamais l'heure choisie.
- Le picker ne se fermait pas après sélection sur Android → ajout de `setShowPicker(false)` dans le handler.
- Le picker ne toggleait pas sur iOS → `onPress` changé en `() => setShowPicker(v => !v)`.
- Channel Android avec `sound: 'default'` → interprété comme un fichier audio custom inexistant → supprimé (Android utilise le son système par défaut).
- Ordre du dismiss sur "Got it" : la notification attendait toute la mise à jour DB avant de se fermer → dismiss déplacé en **premier** pour un feedback immédiat.
- Import mort `NotificationBootstrap` dans `_layout.tsx` → supprimé (déjà rendu dans `db/Provider.tsx`).

---

### 🐛 Race condition au premier lancement — 2 mots appris d'un coup

**Cause :** `NotificationBootstrap` et `index.tsx` appelaient tous les deux `getTodayDrop()` en parallèle au démarrage. Les deux calls faisaient leur SELECT avant que l'un ait commis son UPDATE → deux mots différents se retrouvaient marqués comme appris.

**Fix :** Suppression de `getTodayDrop()` dans `NotificationBootstrap`. L'écran d'accueil (`index.tsx`) est le seul responsable du mot du jour. `checkAndUpdateStreak()` reste dans `NotificationBootstrap` (idempotent, nécessaire même si l'user n'est pas sur l'onglet home).

---

### 🖼️ Loading screen `DatabaseProvider` — Redesign complet

**Avant :** Fond noir slate + texte bleu "Initializing DailyDrop..."

**Après :** Écran brandé respectant le design system :
- Fond immédiatement opaque (`#FAF8F4` / `#131210`) pour couvrir `index.tsx` dès le premier frame
- Logo DAILY DR**O**P avec flamme (Ionicons)
- Animation Lottie "Water Drop" en boucle
- Texte "Preparing your daily word…"
- Fade-in sur le contenu uniquement (pas sur le fond)
- Dark/Light mode via `useColorScheme()` (ThemeProvider n'existe pas encore à ce stade)
- Écran d'erreur de migration également redesigné

---

### ⚠️ Warning expo-router — "State update on unmounted component"

**Cause :** `DatabaseProvider` remplaçait ses enfants par le loading screen, ce qui démontait le `Stack` d'expo-router. Le hook `useLinking` d'expo-router résolvait l'URL initiale de façon async et essayait de mettre à jour `ContextNavigator` qui n'existait plus.

**Fix :** Passage à une architecture **overlay** :
- Les enfants (y compris le `Stack`) sont **toujours montés**
- Le loading screen est un `View` en `StyleSheet.absoluteFill` + `zIndex: 9999` posé par-dessus
- Export d'un hook `useIsDbReady()` pour que `index.tsx` ne fetche pas avant que la DB soit prête
- `useFocusEffect` dans `index.tsx` re-déclenche le fetch quand `isDbReady` passe à `true`

---

### 🖼️ Assets manquants & migrations

- `notification-icon.png` manquant dans `assets/images/` → copié depuis `android-icon-monochrome.png` (icône blanche sur fond transparent, format requis par Android)
- Fichier migration orphelin `0002_add_last_milestone.sql` → supprimé

---

### ⏳ Spinners — Remplacement par Lottie custom

Remplacement de tous les `ActivityIndicator` de page par le spinner Lottie custom (`app/loading.json`) via un composant réutilisable `components/LoadingSpinner.tsx`.

| Page | Avant | Après |
|---|---|---|
| `index.tsx` | `ActivityIndicator` | `LoadingSpinner` |
| `quiz.tsx` | `ActivityIndicator` | `LoadingSpinner` |
| `history.tsx` | `ActivityIndicator` | `LoadingSpinner` |
| `progress.tsx` | Aucun (affichait des zéros) | `LoadingSpinner` + `try/finally` |
| `settings.tsx` | Aucun | `LoadingSpinner` |

Le petit `ActivityIndicator` inline dans le bouton Submit de `quiz.tsx` est conservé (contextuel).

---

### ⌨️ Clavier cache le TextInput dans Practice (quiz.tsx)

**Cause :** Le clavier remontait sans que le `ScrollView` suive pour garder le `TextInput` visible.

**Fix :**
- `keyboardVerticalOffset={90}` sur iOS pour compenser la tab bar
- `ref` sur `ScrollView` + `onFocus` → `scrollToEnd` après 100ms
- `onBlur` → `scrollTo({ y: 0 })` pour revenir en haut à la fermeture du clavier
- `paddingBottom: 40 → 120` pour que le bouton Submit reste accessible
- `automaticallyAdjustKeyboardInsets` pour iOS natif

---

### 📦 Commits du jour

| Hash | Message |
|---|---|
| `e19ca70` | fix: notifications, loading screen, and init race condition |
| `00dcffa` | feat: replace ActivityIndicator with custom Lottie spinner |
| `8a5b239` | feat: add Lottie spinner to settings screen |
| `b107377` | fix: keyboard hides input in quiz screen |

---

### 📋 À tester demain

- [ ] Notification reçue à l'heure configurée dans les settings
- [ ] Bouton **"Got it"** → fermeture rapide + mot marqué appris sans ouvrir l'app
- [ ] Bouton **"Learn more"** → ouverture sur la page d'accueil
- [ ] Tap sur le corps de la notification → même comportement que Learn more
- [ ] Premier lancement (désinstall/réinstall) → 1 seul mot appris
- [ ] Bouton **"Test notification (5s)"** dans Settings → notification arrive en background
- [ ] Time picker dans Settings → heure bien sauvegardée et notification reprogrammée
