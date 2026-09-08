import {
  router,
  useLocalSearchParams,
} from 'expo-router';
import {
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import SlideFadeIn from '@/components/SlideFadeIn';
import { colors } from '@/constants/colors';
import {
  fonts,
  guardianTypography,
  seniorTypography,
} from '@/constants/typography';
import type { UserRole } from '@/types/user';

const FAMILY_CODE = '482731';
const SESSION_SECONDS = 10 * 60;

export default function FamilyConnectScreen() {
  const params =
    useLocalSearchParams<{
      role?: UserRole;
    }>();

  const role: UserRole =
    params.role === 'guardian'
      ? 'guardian'
      : 'senior';

  return role === 'senior'
    ? <SeniorFamilyConnect />
    : <GuardianFamilyConnect />;
}

function SeniorFamilyConnect() {
  const [remaining, setRemaining] =
    useState(SESSION_SECONDS);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining((prev) =>
        prev > 0 ? prev - 1 : 0,
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const time = useMemo(() => {
    const minutes = Math.floor(
      remaining / 60,
    )
      .toString()
      .padStart(2, '0');

    const seconds = (remaining % 60)
      .toString()
      .padStart(2, '0');

    return `${minutes}:${seconds}`;
  }, [remaining]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View>
          <SlideFadeIn
            delay={30}
            distance={10}
          >
            <Text style={styles.step}>
              3단계
            </Text>
          </SlideFadeIn>

          <SlideFadeIn
            delay={90}
            distance={18}
          >
            <Text style={styles.seniorTitle}>
              가족과 연결할까요?
            </Text>
          </SlideFadeIn>

          <SlideFadeIn
            delay={160}
            distance={14}
          >
            <Text
              style={styles.seniorSubtitle}
            >
              아래 코드를 가족에게 알려주세요.
              {`\n`}
              가족이 코드를 입력하면 연결돼요.
            </Text>
          </SlideFadeIn>

          <SlideFadeIn
            delay={240}
            duration={460}
            distance={16}
          >
            <View style={styles.codeCard}>
              <Text style={styles.code}>
                {FAMILY_CODE}
              </Text>

              <Text style={styles.timer}>
                남은 시간 {time}
              </Text>
            </View>
          </SlideFadeIn>

          <SlideFadeIn
            delay={310}
            distance={10}
          >
            <Text style={styles.helper}>
              연결 코드는 10분 동안 사용할 수 있어요.
            </Text>
          </SlideFadeIn>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={
              styles.seniorPrimaryButton
            }
            activeOpacity={0.85}
            onPress={() =>
              router.push(
                '/auth/account-connect',
              )
            }
          >
            <Text
              style={
                styles.seniorPrimaryText
              }
            >
              가족 연결 완료
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            activeOpacity={0.7}
            onPress={() =>
              router.replace(
                '/auth/account-connect',
              )
            }
          >
            <Text style={styles.skipText}>
              가족 연결은 나중에 하기
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

function GuardianFamilyConnect() {
  const [code, setCode] = useState('');
  const [connected, setConnected] =
    useState(false);

  const valid = code.length === 6;

  const handleCodeChange = (
    value: string,
  ) => {
    const numbersOnly = value
      .replace(/\D/g, '')
      .slice(0, 6);

    setCode(numbersOnly);

    if (numbersOnly.length === 6) {
      Keyboard.dismiss();
    }
  };

  const handleConnect = () => {
    if (!valid) return;

    Keyboard.dismiss();

    setConnected(true);
  };

  if (connected) {
    return (
      <SafeAreaView style={styles.container}>
        <View
          style={
            styles.guardianConnectedContent
          }
        >
          <View>
            <SlideFadeIn
              delay={40}
              distance={14}
            >
              <View
                style={styles.successBadge}
              >
                <Text
                  style={styles.successMark}
                >
                  ✓
                </Text>
              </View>
            </SlideFadeIn>

            <SlideFadeIn
              delay={110}
              distance={18}
            >
              <Text
                style={styles.guardianTitle}
              >
                가족 연결이 완료됐어요
              </Text>
            </SlideFadeIn>

            <SlideFadeIn
              delay={180}
              distance={14}
            >
              <Text
                style={
                  styles.guardianSubtitle
                }
              >
                이제 가족의 안전한 금융 생활을
                함께 확인할 수 있어요.
              </Text>
            </SlideFadeIn>

            <SlideFadeIn
              delay={250}
              distance={14}
            >
              <View
                style={
                  styles.relationshipCard
                }
              >
                <Text
                  style={
                    styles.relationshipName
                  }
                >
                  김영희
                </Text>

                <Text
                  style={
                    styles.relationshipArrow
                  }
                >
                  ↔
                </Text>

                <Text
                  style={
                    styles.relationshipName
                  }
                >
                  허경민
                </Text>
              </View>
            </SlideFadeIn>
          </View>

          <TouchableOpacity
            style={
              styles.guardianPrimaryButton
            }
            activeOpacity={0.85}
            onPress={() =>
              router.replace(
                '/guardian/home',
              )
            }
          >
            <Text
              style={
                styles.guardianPrimaryText
              }
            >
              든든 시작하기
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback
        onPress={Keyboard.dismiss}
        accessible={false}
      >
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={
            Platform.OS === 'ios'
              ? 'padding'
              : undefined
          }
        >
          <View style={styles.content}>
            <View>
              <SlideFadeIn
                delay={30}
                distance={10}
              >
                <Text style={styles.step}>
                  3단계
                </Text>
              </SlideFadeIn>

              <SlideFadeIn
                delay={90}
                distance={18}
              >
                <Text
                  style={styles.guardianTitle}
                >
                  가족 연결 코드를{`\n`}
                  입력해 주세요
                </Text>
              </SlideFadeIn>

              <SlideFadeIn
                delay={160}
                distance={14}
              >
                <Text
                  style={
                    styles.guardianSubtitle
                  }
                >
                  시니어 화면에 표시된 6자리 코드를
                  입력해 주세요.
                </Text>
              </SlideFadeIn>

              <SlideFadeIn
                delay={240}
                duration={440}
                distance={14}
              >
                <TextInput
                  value={code}
                  onChangeText={
                    handleCodeChange
                  }
                  style={
                    styles.guardianCodeInput
                  }
                  placeholder="000000"
                  placeholderTextColor="#B0B8C1"
                  keyboardType="number-pad"
                  maxLength={6}
                  autoFocus
                />
              </SlideFadeIn>

              <Text style={styles.mockHint}>
                시연용 연결 코드:{' '}
                {FAMILY_CODE}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.guardianPrimaryButton,
                !valid &&
                  styles.disabledButton,
              ]}
              disabled={!valid}
              onPress={handleConnect}
              activeOpacity={0.85}
            >
              <Text
                style={
                  styles.guardianPrimaryText
                }
              >
                가족 연결하기
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  flex: {
    flex: 1,
  },

  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 24,
  },

  step: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: colors.primary,
    marginBottom: 16,
  },

  seniorTitle: {
    fontSize: seniorTypography.pageTitle,
    lineHeight: 42,
    fontFamily: fonts.bold,
    color: colors.text,
  },

  seniorSubtitle: {
    marginTop: 12,
    fontSize: seniorTypography.body,
    lineHeight: 30,
    fontFamily: fonts.regular,
    color: colors.muted,
  },

  codeCard: {
    marginTop: 40,
    paddingVertical: 32,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: 'center',
  },

  code: {
    fontSize: 42,
    letterSpacing: 9,
    fontFamily: fonts.bold,
    color: colors.text,
  },

  timer: {
    marginTop: 16,
    fontSize: 18,
    fontFamily: fonts.semiBold,
    color: colors.primary,
  },

  helper: {
    marginTop: 14,
    fontSize: 18,
    lineHeight: 26,
    fontFamily: fonts.regular,
    textAlign: 'center',
    color: colors.muted,
  },

  footer: {
    gap: 10,
  },

  seniorPrimaryButton: {
    height: 64,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  seniorPrimaryText: {
    fontSize: seniorTypography.button,
    fontFamily: fonts.bold,
    color: colors.white,
  },

  skipButton: {
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },

  skipText: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
    color: '#6B7684',
  },

  guardianTitle: {
    fontSize: guardianTypography.pageTitle,
    lineHeight: 38,
    fontFamily: fonts.bold,
    color: colors.text,
  },

  guardianSubtitle: {
    marginTop: 12,
    fontSize: guardianTypography.body,
    lineHeight: 26,
    fontFamily: fonts.regular,
    color: colors.muted,
  },

  guardianCodeInput: {
    marginTop: 36,
    height: 64,
    borderRadius: 16,
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    fontSize: 24,
    fontFamily: fonts.semiBold,
    letterSpacing: 8,
    textAlign: 'center',
    color: colors.text,
  },

  mockHint: {
    marginTop: 10,
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.muted,
    textAlign: 'center',
  },

  guardianPrimaryButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  guardianPrimaryText: {
    fontSize: guardianTypography.button,
    fontFamily: fonts.bold,
    color: colors.white,
  },

  disabledButton: {
    backgroundColor: '#D1D6DB',
  },

  guardianConnectedContent: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 100,
    paddingBottom: 24,
  },

  successBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EAF5F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },

  successMark: {
    fontSize: 28,
    fontFamily: fonts.bold,
    color: colors.primary,
  },

  relationshipCard: {
    marginTop: 36,
    padding: 22,
    borderRadius: 20,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
  },

  relationshipName: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: colors.text,
  },

  relationshipArrow: {
    fontSize: 20,
    fontFamily: fonts.regular,
    color: colors.muted,
  },
});