// Doit être chargé avant tout pour que TaskManager.defineTask soit disponible
// quand Android exécute la tâche background (action "Got it" sans ouvrir l'app).
import './lib/dailyNotifications';
import 'expo-router/entry';
