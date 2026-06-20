import LottieView from 'lottie-react-native';
import { View } from 'react-native';

export function LoadingSpinner() {
  return (
    <View className="flex-1 justify-center items-center bg-bg-light dark:bg-bg-dark">
      <LottieView
        source={require('../app/loading.json')}
        autoPlay
        loop
        style={{ width: 120, height: 120 }}
      />
    </View>
  );
}
