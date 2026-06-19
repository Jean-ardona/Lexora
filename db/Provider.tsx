import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { NotificationBootstrap } from '../components/NotificationBootstrap';
import migrations from '../drizzle/migrations';

import { db } from './client';
import { seedDatabase } from './seed';

// 2. On laisse TypeScript déduire le type de la base de données tout seul
const DatabaseContext = createContext<typeof db | null>(null);

export const DatabaseProvider = ({ children }: { children: React.ReactNode }) => {
  const { success, error } = useMigrations(db, migrations);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (success) {
      seedDatabase().then(() => setIsReady(true)).catch((err) => {
        console.error('Seeding error:', err);
        setIsReady(true); // Continue even if seeding fails
      });
    }
  }, [success]);

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-900">
        <Text className="text-red-400">Migration Error: {error.message}</Text>
      </View>
    );
  }

  if (!isReady) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-900">
        <Text className="text-sky-400 font-bold">Initializing DailyDrop...</Text>
      </View>
    );
  }

  return (
    <DatabaseContext.Provider value={db}>
      <NotificationBootstrap />
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDb = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDb must be used within a DatabaseProvider');
  }
  return context;
};