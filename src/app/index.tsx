import { router } from 'expo-router';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import SlideFadeIn from '@/components/SlideFadeIn';
import { colors } from '@/constants/colors';
import {
  fonts,
  seniorTypography,
} from '@/constants/typography';

export default function StartScreen() {
  const handleStart = () => {
    router.push('/auth/role');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.hero}>
          <SlideFadeIn
            delay={80}
            duration={520}
            distance={18}
          >
            <View style={styles.logoBadge}>
              <Text style={styles.logoText}>
                든든 DNDN
              </Text>
            </View>
          </SlideFadeIn>

          <SlideFadeIn
            delay={160}
            duration={520}
            distance={20}
          >
            <Text style={styles.title}>
              일상은 편하게,{`\n`}
              금융은 더 안전하게
            </Text>
          </SlideFadeIn>

          <SlideFadeIn
            delay={240}
            duration={500}
            distance={16}
          >
            <Text style={styles.subtitle}>
              든든이 쉬운 금융 생활과
              {`\n`}
              가족의 안심을 함께 도와드려요.
            </Text>
          </SlideFadeIn>
        </View>

        <TouchableOpacity
          style={styles.startButton}
          activeOpacity={0.85}
          onPress={handleStart}
        >
          <Text style={styles.startButtonText}>
            시작하기
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 120,
    paddingBottom: 24,
  },

  hero: {
    alignItems: 'flex-start',
  },

  logoBadge: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: '#EAF5F0',
    marginBottom: 28,
  },

  logoText: {
    fontSize: 20,
    lineHeight: 28,
    fontFamily: fonts.bold,
    color: colors.primary,
  },

  title: {
    fontSize: seniorTypography.hero,
    lineHeight: 48,
    fontFamily: fonts.bold,
    color: colors.text,
  },

  subtitle: {
    marginTop: 18,
    fontSize: seniorTypography.body,
    lineHeight: 30,
    fontFamily: fonts.regular,
    color: colors.muted,
  },

  startButton: {
    height: 64,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  startButtonText: {
    fontSize: seniorTypography.button,
    lineHeight: 28,
    fontFamily: fonts.bold,
    color: colors.white,
  },
});