import {
  Animated,
  StyleProp,
  ViewStyle,
} from 'react-native';
import {
  PropsWithChildren,
  useEffect,
  useRef,
} from 'react';

type SlideFadeInProps = PropsWithChildren<{
  delay?: number;
  duration?: number;
  distance?: number;
  style?: StyleProp<ViewStyle>;
}>;

export default function SlideFadeIn({
  children,
  delay = 0,
  duration = 420,
  distance = 16,
  style,
}: SlideFadeInProps) {
  const opacity = useRef(
    new Animated.Value(0),
  ).current;

  const translateY = useRef(
    new Animated.Value(distance),
  ).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),

      Animated.timing(translateY, {
        toValue: 0,
        duration,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [
    delay,
    distance,
    duration,
    opacity,
    translateY,
  ]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}