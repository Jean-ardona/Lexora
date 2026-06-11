import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';

export function useTheme() {
  const colorScheme = useColorScheme() ?? 'light';
  return Colors[colorScheme];
}