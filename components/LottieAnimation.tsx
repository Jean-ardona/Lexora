import LottieView from 'lottie-react-native';
import { View } from 'react-native';

interface LottieAnimationProps {
  source: any; // URL string, objet URI, ou require()
  autoPlay?: boolean;
  loop?: boolean;
  size?: number;
}

export const LottieAnimation = ({
  source,
  autoPlay = true,
  loop = true,
  size = 200,
}: LottieAnimationProps) => {
  // Si c'est une string URL, la convertir en objet uri
  const finalSource = typeof source === 'string' ? { uri: source } : source;

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <LottieView
        source={finalSource}
        autoPlay={autoPlay}
        loop={loop}
        style={{ width: '100%', height: '100%' }}
      />
    </View>
  );
};

