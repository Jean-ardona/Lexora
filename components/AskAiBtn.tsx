import { MaterialIcons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

interface AskAIButtonProps {
  onPress: () => void;
}


export default function AskAIButton({ onPress } : AskAIButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className="flex-row items-center  justify-center gap-2 rounded-2xl bg-accentText-dark mt-5 px-8 py-4"
    >
      {/* Icône ? */}
      <View className="w-6 h-6 rounded-full border-2 border-white items-center justify-center">
        <Text className="text-white text-xs font-bold">?</Text>
      </View>

      {/* Texte */}
      <Text className="text-white text-base font-semibold tracking-wide">
        Ask AI
      </Text>

      {/* Étoile */}
      <MaterialIcons name="star" size={16} color="white" />
    </TouchableOpacity>
  );
}