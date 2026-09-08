import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
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
  guardianTypography,
  seniorTypography,
} from '@/constants/typography';
import type { UserRole } from '@/types/user';

const MOCK_AUTH_CODE = '123456';

type SignupStep =
  | 'name'
  | 'birth'
  | 'phone'
  | 'code';

export default function LoginScreen() {
  const params =
    useLocalSearchParams<{ role?: UserRole }>();

  const role: UserRole =
    params.role === 'guardian'
      ? 'guardian'
      : 'senior';

  const isSenior = role === 'senior';

  const typography = isSenior
    ? seniorTypography
    : guardianTypography;

  const scrollRef = useRef<ScrollView>(null);
  const birthInputRef = useRef<TextInput>(null);
  const phoneInputRef = useRef<TextInput>(null);
  const codeInputRef = useRef<TextInput>(null);

  const [step, setStep] =
    useState<SignupStep>('name');

  const [name, setName] = useState('');
  const [birthDate, setBirthDate] =
    useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');

  const nameValid = useMemo(() => {
    return name.trim().length >= 2;
  }, [name]);

  const birthDateValid = useMemo(() => {
    if (birthDate.length !== 8) {
      return false;
    }

    const year = Number(
      birthDate.slice(0, 4),
    );

    const month = Number(
      birthDate.slice(4, 6),
    );

    const day = Number(
      birthDate.slice(6, 8),
    );

    if (year < 1900) return false;

    if (month < 1 || month > 12) {
      return false;
    }

    const lastDay = new Date(
      year,
      month,
      0,
    ).getDate();

    if (day < 1 || day > lastDay) {
      return false;
    }

    return true;
  }, [birthDate]);

  const phoneValid = useMemo(() => {
    const numbersOnly =
      phone.replace(/\D/g, '');

    return (
      numbersOnly.length >= 10 &&
      numbersOnly.length <= 11
    );
  }, [phone]);

  const codeValid = code.length === 6;

  const focusNextInput = (
    ref: React.RefObject<TextInput | null>,
  ) => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({
        animated: true,
      });

      setTimeout(() => {
        ref.current?.focus();
      }, 280);
    }, 180);
  };

  const handleNameNext = () => {
    if (!nameValid) return;

    Keyboard.dismiss();

    setStep('birth');
    focusNextInput(birthInputRef);
  };

  const handleBirthNext = () => {
    if (!birthDateValid) return;

    Keyboard.dismiss();

    setStep('phone');
    focusNextInput(phoneInputRef);
  };

  const handleRequestCode = () => {
    if (!phoneValid) return;

    Keyboard.dismiss();

    setCode('');
    setStep('code');

    focusNextInput(codeInputRef);
  };

  const handleResendCode = () => {
    Keyboard.dismiss();

    setCode('');

    focusNextInput(codeInputRef);
  };

  const handleCodeChange = (
    value: string,
  ) => {
    const numbersOnly = value
      .replace(/\D/g, '')
      .slice(0, 6);

    setCode(numbersOnly);
  };

  const handleComplete = () => {
    if (!codeValid) return;

    Keyboard.dismiss();

    router.push({
      pathname: '/auth/family-connect',
      params: {
        role,
        name: name.trim(),
        birthDate,
        phone,
      },
    });
  };

  const getButtonInfo = () => {
    switch (step) {
      case 'name':
        return {
          text: '다음',
          disabled: !nameValid,
          onPress: handleNameNext,
        };

      case 'birth':
        return {
          text: '다음',
          disabled: !birthDateValid,
          onPress: handleBirthNext,
        };

      case 'phone':
        return {
          text: '인증번호 받기',
          disabled: !phoneValid,
          onPress: handleRequestCode,
        };

      case 'code':
        return {
          text: '확인',
          disabled: !codeValid,
          onPress: handleComplete,
        };
    }
  };

  const buttonInfo = getButtonInfo();

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
              showsVerticalScrollIndicator={
                false
              }
              keyboardShouldPersistTaps="handled"
            >
              <SlideFadeIn
                delay={30}
                distance={10}
              >
                <Text style={styles.step}>
                  2단계
                </Text>
              </SlideFadeIn>

              <SlideFadeIn
                delay={90}
                distance={18}
              >
                <Text
                  style={[
                    styles.title,
                    {
                      fontSize:
                        typography.pageTitle,
                      lineHeight: isSenior
                        ? 42
                        : 38,
                    },
                  ]}
                >
                  회원 정보를{`\n`}
                  알려주세요
                </Text>
              </SlideFadeIn>

              <SlideFadeIn
                delay={160}
                distance={14}
              >
                <Text
                  style={[
                    styles.subtitle,
                    {
                      fontSize: isSenior
                        ? 20
                        : 17,
                      lineHeight: isSenior
                        ? 30
                        : 26,
                    },
                  ]}
                >
                  본인 확인에 필요한 정보를
                  하나씩 확인할게요.
                </Text>
              </SlideFadeIn>

              <SlideFadeIn
                delay={230}
                distance={14}
              >
                <View>
                  <Text
                    style={[
                      styles.label,
                      {
                        fontSize: isSenior
                          ? 18
                          : 15,
                      },
                    ]}
                  >
                    이름
                  </Text>

                  <TextInput
                    value={name}
                    onChangeText={setName}
                    style={[
                      styles.input,
                      {
                        height: isSenior
                          ? 68
                          : 60,
                        fontSize: isSenior
                          ? 20
                          : 17,
                      },
                    ]}
                    placeholder="이름을 입력해 주세요"
                    placeholderTextColor="#B0B8C1"
                    autoCapitalize="none"
                    returnKeyType="next"
                    autoFocus
                    onSubmitEditing={() => {
                      if (nameValid) {
                        handleNameNext();
                      }
                    }}
                  />
                </View>
              </SlideFadeIn>

              {(
                step === 'birth' ||
                step === 'phone' ||
                step === 'code'
              ) && (
                <SlideFadeIn
                  key="birth-step"
                  duration={380}
                  distance={14}
                >
                  <View>
                    <Text
                      style={[
                        styles.label,
                        {
                          fontSize: isSenior
                            ? 18
                            : 15,
                        },
                      ]}
                    >
                      생년월일
                    </Text>

                    <TextInput
                      ref={birthInputRef}
                      value={birthDate}
                      onChangeText={(value) => {
                        const numbersOnly =
                          value
                            .replace(/\D/g, '')
                            .slice(0, 8);

                        setBirthDate(
                          numbersOnly,
                        );
                      }}
                      style={[
                        styles.input,
                        {
                          height: isSenior
                            ? 68
                            : 60,
                          fontSize: isSenior
                            ? 20
                            : 17,
                        },
                      ]}
                      placeholder="19580412"
                      placeholderTextColor="#B0B8C1"
                      keyboardType="number-pad"
                      maxLength={8}
                    />

                    <Text
                      style={styles.inputHint}
                    >
                      생년월일 8자리를 입력해 주세요.
                    </Text>
                  </View>
                </SlideFadeIn>
              )}

              {(
                step === 'phone' ||
                step === 'code'
              ) && (
                <SlideFadeIn
                  key="phone-step"
                  duration={380}
                  distance={14}
                >
                  <View>
                    <Text
                      style={[
                        styles.label,
                        {
                          fontSize: isSenior
                            ? 18
                            : 15,
                        },
                      ]}
                    >
                      휴대폰 번호
                    </Text>

                    <TextInput
                      ref={phoneInputRef}
                      value={phone}
                      onChangeText={(value) => {
                        const numbersOnly =
                          value
                            .replace(/\D/g, '')
                            .slice(0, 11);

                        setPhone(numbersOnly);
                      }}
                      style={[
                        styles.input,
                        {
                          height: isSenior
                            ? 68
                            : 60,
                          fontSize: isSenior
                            ? 20
                            : 17,
                        },
                      ]}
                      placeholder="01012345678"
                      placeholderTextColor="#B0B8C1"
                      keyboardType="phone-pad"
                      maxLength={11}
                    />
                  </View>
                </SlideFadeIn>
              )}

              {step === 'code' && (
                <SlideFadeIn
                  key="code-step"
                  duration={380}
                  distance={14}
                >
                  <View>
                    <View
                      style={
                        styles.codeLabelRow
                      }
                    >
                      <Text
                        style={[
                          styles.codeLabel,
                          {
                            fontSize: isSenior
                              ? 18
                              : 15,
                          },
                        ]}
                      >
                        인증번호
                      </Text>

                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={
                          handleResendCode
                        }
                      >
                        <Text
                          style={[
                            styles.resend,
                            {
                              fontSize:
                                isSenior
                                  ? 18
                                  : 15,
                            },
                          ]}
                        >
                          다시 받기
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <TextInput
                      ref={codeInputRef}
                      value={code}
                      onChangeText={
                        handleCodeChange
                      }
                      style={[
                        styles.input,
                        styles.codeInput,
                        {
                          height: isSenior
                            ? 68
                            : 60,
                          fontSize: isSenior
                            ? 24
                            : 20,
                        },
                      ]}
                      placeholder="6자리 입력"
                      placeholderTextColor="#B0B8C1"
                      keyboardType="number-pad"
                      maxLength={6}
                    />

                    <Text
                      style={[
                        styles.mockHint,
                        {
                          fontSize: isSenior
                            ? 16
                            : 14,
                        },
                      ]}
                    >
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
                  {
                    height: isSenior
                      ? 64
                      : 56,
                  },
                  buttonInfo.disabled &&
                    styles.disabledButton,
                ]}
                disabled={
                  buttonInfo.disabled
                }
                activeOpacity={0.85}
                onPress={
                  buttonInfo.onPress
                }
              >
                <Text
                  style={[
                    styles.buttonText,
                    {
                      fontSize:
                        typography.button,
                    },
                  ]}
                >
                  {buttonInfo.text}
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
    paddingTop: 48,
    paddingBottom: 24,
  },

  step: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: colors.primary,
    marginBottom: 16,
  },

  title: {
    fontFamily: fonts.bold,
    color: colors.text,
  },

  subtitle: {
    marginTop: 12,
    fontFamily: fonts.regular,
    color: colors.muted,
  },

  label: {
    marginTop: 32,
    marginBottom: 10,
    fontFamily: fonts.semiBold,
    color: '#4E5968',
  },

  input: {
    borderRadius: 16,
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    fontFamily: fonts.regular,
    color: colors.text,
  },

  inputHint: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.regular,
    color: colors.muted,
  },

  codeLabelRow: {
    marginTop: 32,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  codeLabel: {
    fontFamily: fonts.semiBold,
    color: '#4E5968',
  },

  resend: {
    fontFamily: fonts.semiBold,
    color: colors.primary,
  },

  codeInput: {
    letterSpacing: 4,
    fontFamily: fonts.semiBold,
  },

  mockHint: {
    marginTop: 10,
    fontFamily: fonts.regular,
    color: colors.muted,
  },

  bottomSpacer: {
    height: 260,
  },

  buttonArea: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
    backgroundColor: colors.background,
  },

  button: {
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  disabledButton: {
    backgroundColor: '#D1D6DB',
  },

  buttonText: {
    fontFamily: fonts.bold,
    color: colors.white,
  },
});