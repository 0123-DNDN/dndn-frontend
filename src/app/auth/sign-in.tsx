import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
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
  seniorTypography,
} from '@/constants/typography';

const MOCK_AUTH_CODE = '123456';

type LoginStep = 'phone' | 'code';

export default function SignInScreen() {
  const scrollRef = useRef<ScrollView>(null);
  const codeInputRef = useRef<TextInput>(null);

  const [step, setStep] =
    useState<LoginStep>('phone');

  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');

  const phoneValid =
    phone.replace(/\D/g, '').length === 11;

  const codeValid = code.length === 6;

  const focusCodeInput = () => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({
        animated: true,
      });

      setTimeout(() => {
        codeInputRef.current?.focus();
      }, 280);
    }, 180);
  };

  const handleRequestCode = () => {
    if (!phoneValid) return;

    Keyboard.dismiss();

    setCode('');
    setStep('code');

    // TODO:
    // 실제 인증번호 발급 API 호출
    //
    // POST /api/auth/verification-code
    // {
    //   phone
    // }

    focusCodeInput();
  };

  const handleResendCode = () => {
    Keyboard.dismiss();

    setCode('');

    // TODO:
    // 실제 인증번호 재발급 API 호출

    focusCodeInput();
  };

  const handleCodeChange = (
    value: string,
  ) => {
    const numbersOnly = value
      .replace(/\D/g, '')
      .slice(0, 6);

    setCode(numbersOnly);
  };

  const handleLogin = () => {
    if (!codeValid) return;

    Keyboard.dismiss();

    // TODO:
    // 실제 인증번호 검증 및 로그인 API 연동
    //
    // 로그인 성공 후 백에서 role을 받아
    // SENIOR / GUARDIAN에 따라 이동
    //
    // 예:
    //
    // if (user.role === 'SENIOR') {
    //   router.replace('/senior/home');
    // } else {
    //   router.replace('/guardian/home');
    // }

    // 현재 시연용
    router.replace('/senior/home');
  };

  const disabled =
    step === 'phone'
      ? !phoneValid
      : !codeValid;

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
          <View style={styles.wrapper}>
            <ScrollView
              ref={scrollRef}
              style={styles.scrollView}
              contentContainerStyle={
                styles.scrollContent
              }
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <SlideFadeIn
                delay={80}
                distance={18}
              >
                <Text style={styles.title}>
                  다시 만나서{`\n`}
                  반가워요
                </Text>
              </SlideFadeIn>

              <SlideFadeIn
                delay={150}
                distance={14}
              >
                <Text style={styles.subtitle}>
                  가입한 휴대폰 번호로
                  로그인할게요.
                </Text>
              </SlideFadeIn>

              <SlideFadeIn
                delay={230}
                distance={14}
              >
                <View>
                  <Text style={styles.label}>
                    휴대폰 번호
                  </Text>

                  <TextInput
                    value={phone}
                    onChangeText={(value) => {
                      const numbersOnly =
                        value
                          .replace(/\D/g, '')
                          .slice(0, 11);

                      setPhone(numbersOnly);
                    }}
                    style={styles.input}
                    placeholder="01012345678"
                    placeholderTextColor="#B0B8C1"
                    keyboardType="phone-pad"
                    maxLength={11}
                    autoFocus
                  />
                </View>
              </SlideFadeIn>

              {step === 'code' && (
                <SlideFadeIn
                  duration={380}
                  distance={14}
                >
                  <View>
                    <View
                      style={styles.codeLabelRow}
                    >
                      <Text style={styles.labelNoMargin}>
                        인증번호
                      </Text>

                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={handleResendCode}
                      >
                        <Text style={styles.resend}>
                          다시 받기
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <TextInput
                      ref={codeInputRef}
                      value={code}
                      onChangeText={handleCodeChange}
                      style={[
                        styles.input,
                        styles.codeInput,
                      ]}
                      placeholder="6자리 입력"
                      placeholderTextColor="#B0B8C1"
                      keyboardType="number-pad"
                      maxLength={6}
                    />

                    <Text style={styles.mockHint}>
                      시연용 인증번호:{' '}
                      {MOCK_AUTH_CODE}
                    </Text>
                  </View>
                </SlideFadeIn>
              )}

              <View style={styles.bottomSpacer} />
            </ScrollView>

            <View style={styles.buttonArea}>
              <TouchableOpacity
                style={[
                  styles.button,
                  disabled &&
                    styles.disabledButton,
                ]}
                disabled={disabled}
                activeOpacity={0.85}
                onPress={
                  step === 'phone'
                    ? handleRequestCode
                    : handleLogin
                }
              >
                <Text style={styles.buttonText}>
                  {step === 'phone'
                    ? '인증번호 받기'
                    : '로그인'}
                </Text>
              </TouchableOpacity>
            </View>
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

  wrapper: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 24,
  },

  title: {
    fontSize: seniorTypography.pageTitle,
    lineHeight: 42,
    fontFamily: fonts.bold,
    color: colors.text,
  },

  subtitle: {
    marginTop: 12,
    fontSize: seniorTypography.body,
    lineHeight: 30,
    fontFamily: fonts.regular,
    color: colors.muted,
  },

  label: {
    marginTop: 40,
    marginBottom: 10,
    fontSize: 18,
    fontFamily: fonts.semiBold,
    color: '#4E5968',
  },

  labelNoMargin: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
    color: '#4E5968',
  },

  input: {
    height: 68,
    borderRadius: 16,
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    fontSize: 20,
    fontFamily: fonts.regular,
    color: colors.text,
  },

  codeLabelRow: {
    marginTop: 32,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  resend: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
    color: colors.primary,
  },

  codeInput: {
    fontSize: 24,
    fontFamily: fonts.semiBold,
    letterSpacing: 4,
  },

  mockHint: {
    marginTop: 10,
    fontSize: 16,
    lineHeight: 24,
    fontFamily: fonts.regular,
    color: colors.muted,
  },

  bottomSpacer: {
    height: 240,
  },

  buttonArea: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
    backgroundColor: colors.background,
  },

  button: {
    height: 64,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  disabledButton: {
    backgroundColor: '#D1D6DB',
  },

  buttonText: {
    fontSize: seniorTypography.button,
    fontFamily: fonts.bold,
    color: colors.white,
  },
});