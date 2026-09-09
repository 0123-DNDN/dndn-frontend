import { router } from 'expo-router';
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import SlideFadeIn from '@/components/SlideFadeIn';
import DevQuickLogin from '@/components/dev/DevQuickLogin';
import { colors } from '@/constants/colors';
import {
  fonts,
  seniorTypography,
} from '@/constants/typography';

export default function StartScreen() {
  const handleLogin = () => {
    router.push('/auth/sign-in');
  };

  const handleSignup = () => {
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
            <Image
              source={require('@/assets/images/dndn-logo.png')}
              style={styles.logo}
              resizeMode="contain"
              accessibilityLabel="든든 DNDN 로고"
            />
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

        <View style={styles.buttonArea}>
          {process.env.EXPO_PUBLIC_APP_ENV === 'local' && (
            <DevQuickLogin />
          )}

          <TouchableOpacity
            style={styles.loginButton}
            activeOpacity={0.85}
            onPress={handleLogin}
          >
            <Text style={styles.loginButtonText}>
              로그인
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signupButton}
            activeOpacity={0.85}
            onPress={handleSignup}
          >
            <Text style={styles.signupButtonText}>
              회원가입
            </Text>
          </TouchableOpacity>
        </View>
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

  logo: {
    width: 88,
    height: 88,
    marginBottom: 28,
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

  buttonArea: {
    gap: 12,
  },

  loginButton: {
    height: 64,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loginButtonText: {
    fontSize: seniorTypography.button,
    lineHeight: 28,
    fontFamily: fonts.bold,
    color: colors.white,
  },

  signupButton: {
    height: 64,
    borderRadius: 18,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },

  signupButtonText: {
    fontSize: seniorTypography.button,
    lineHeight: 28,
    fontFamily: fonts.bold,
    color: colors.primary,
  },
});
