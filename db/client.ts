import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';
import * as schema from './schema';

// On ouvre (ou crée) le fichier de base de données en local
export const expoDb = openDatabaseSync('dailydrop.db');

// On initialise Drizzle avec notre schéma
export const db = drizzle(expoDb, { schema });