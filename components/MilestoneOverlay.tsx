import LottieView from 'lottie-react-native';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

interface MilestoneOverlayProps {
  visible: boolean;
  streak: number;
  onClose: () => void;
}

export default function MilestoneOverlay({ visible, streak, onClose }: MilestoneOverlayProps) {
  if (!visible) return null;

  return (
    <Modal visible transparent animationType="fade">
      <View className="flex-1 bg-[#FAF8F4] dark:bg-[#121212]/95 justify-center items-center px-6">
        <LottieView
          source={require('../app/Trophy.json')}
          autoPlay
          loop={false}
          style={{ width: 280, height: 280 }}
        />
        <Text className="text-accentText-light dark:text-accentText-dark text-xs font-black tracking-widest uppercase mb-2">
          Milestone Unlocked! 🏆
        </Text>
        <Text className="text-primary-light dark:text-white text-3xl font-black text-center mb-4 px-4 leading-none uppercase tracking-wide">
          You're on fire!
        </Text>
        <TouchableOpacity
          onPress={onClose}
          className="bg-accentText-dark w-full py-4 rounded-2xl items-center justify-center shadow-lg active:opacity-90"
        >
          <Text className="text-white text-lg font-bold">Let's Go! 🔥</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}
