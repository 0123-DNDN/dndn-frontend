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
  ActivityIndicator,
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
import {
  connectFamily,
  createFamilyConnectionCode,
} from '@/services/family';
import type {
  ConnectionCodeResponse,
  FamilyRelationResponse,
} from '@/types/family';
import type { UserRole } from '@/types/user';

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
  const [
    connectionCode,
    setConnectionCode,
  ] =
    useState<ConnectionCodeResponse | null>(
      null,
    );

  const [
    remaining,
    setRemaining,
  ] = useState(0);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('');

  useEffect(() => {
    loadConnectionCode();
  }, []);

  useEffect(() => {
    if (!connectionCode) {
      return;
    }

    const calculateRemaining = () => {
      const expiresAt =
        new Date(
          connectionCode.expiresAt,
        ).getTime();

      const now =
        new Date().getTime();

      const seconds =
        Math.max(
          Math.floor(
            (expiresAt - now) /
              1000,
          ),
          0,
        );

      setRemaining(seconds);
    };

    calculateRemaining();

    const timer =
      setInterval(
        calculateRemaining,
        1000,
      );

    return () =>
      clearInterval(timer);
  }, [connectionCode]);

  const loadConnectionCode =
    async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');

        const result =
          await createFamilyConnectionCode();

        setConnectionCode(
          result,
        );
      } catch (error) {
        console.log(
          'CREATE FAMILY CODE ERROR:',
          error,
        );

        setErrorMessage(
          '가족 연결 코드를 만들지 못했어요.',
        );
      } finally {
        setIsLoading(false);
      }
    };

  const time = useMemo(() => {
    const minutes =
      Math.floor(
        remaining / 60,
      )
        .toString()
        .padStart(2, '0');

    const seconds =
      (remaining % 60)
        .toString()
        .padStart(2, '0');

    return `${minutes}:${seconds}`;
  }, [remaining]);

  if (isLoading) {
    return (
      <SafeAreaView
        style={styles.container}
      >
        <View
          style={
            styles.loadingContainer
          }
        >
          <ActivityIndicator
            size="large"
            color={
              colors.primary
            }
          />

          <Text
            style={
              styles.loadingText
            }
          >
            가족 연결 코드를
            만들고 있어요
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.container}
    >
      <View
        style={styles.content}
      >
        <View>
          <SlideFadeIn
            delay={30}
            distance={10}
          >
            <Text
              style={styles.step}
            >
              3단계
            </Text>
          </SlideFadeIn>

          <SlideFadeIn
            delay={90}
            distance={18}
          >
            <Text
              style={
                styles.seniorTitle
              }
            >
              가족과 연결할까요?
            </Text>
          </SlideFadeIn>

          <SlideFadeIn
            delay={160}
            distance={14}
          >
            <Text
              style={
                styles.seniorSubtitle
              }
            >
              아래 코드를 가족에게
              알려주세요.
              {`\n`}
              가족이 코드를 입력하면
              연결돼요.
            </Text>
          </SlideFadeIn>

          {connectionCode ? (
            <SlideFadeIn
              delay={240}
              duration={460}
              distance={16}
            >
              <View
                style={
                  styles.codeCard
                }
              >
                <Text
                  style={
                    styles.code
                  }
                >
                  {
                    connectionCode.code
                  }
                </Text>

                <Text
                  style={
                    styles.timer
                  }
                >
                  남은 시간 {time}
                </Text>
              </View>
            </SlideFadeIn>
          ) : (
            <View
              style={
                styles.codeErrorCard
              }
            >
              <Text
                style={
                  styles.errorText
                }
              >
                {errorMessage ||
                  '가족 연결 코드를 불러오지 못했어요.'}
              </Text>

              <TouchableOpacity
                style={
                  styles.retryButton
                }
                onPress={
                  loadConnectionCode
                }
              >
                <Text
                  style={
                    styles.retryButtonText
                  }
                >
                  다시 만들기
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {!!connectionCode &&
            remaining === 0 && (
              <TouchableOpacity
                style={
                  styles.newCodeButton
                }
                onPress={
                  loadConnectionCode
                }
                activeOpacity={0.8}
              >
                <Text
                  style={
                    styles.newCodeText
                  }
                >
                  새 연결 코드 만들기
                </Text>
              </TouchableOpacity>
            )}

          <SlideFadeIn
            delay={310}
            distance={10}
          >
            <Text
              style={
                styles.helper
              }
            >
              연결 코드는 정해진 시간
              동안 사용할 수 있어요.
            </Text>
          </SlideFadeIn>
        </View>

        <View
          style={styles.footer}
        >
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
            style={
              styles.skipButton
            }
            activeOpacity={0.7}
            onPress={() =>
              router.replace(
                '/auth/account-connect',
              )
            }
          >
            <Text
              style={
                styles.skipText
              }
            >
              가족 연결은 나중에 하기
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

function GuardianFamilyConnect() {
  const [code, setCode] =
    useState('');

  const [
    relation,
    setRelation,
  ] =
    useState<FamilyRelationResponse | null>(
      null,
    );

  const [
    isConnecting,
    setIsConnecting,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('');

  const valid =
    /^\d{6}$/.test(code);

  const handleCodeChange = (
    value: string,
  ) => {
    const numbersOnly =
      value
        .replace(/\D/g, '')
        .slice(0, 6);

    setCode(numbersOnly);
    setErrorMessage('');

    if (
      numbersOnly.length === 6
    ) {
      Keyboard.dismiss();
    }
  };

  const handleConnect =
    async () => {
      if (
        !valid ||
        isConnecting
      ) {
        return;
      }

      try {
        Keyboard.dismiss();
        setIsConnecting(true);
        setErrorMessage('');

        const result =
          await connectFamily({
            code,
          });

        setRelation(result);
      } catch (error) {
        console.log(
          'CONNECT FAMILY ERROR:',
          error,
        );

        setErrorMessage(
          '가족 연결에 실패했어요. 연결 코드를 다시 확인해 주세요.',
        );
      } finally {
        setIsConnecting(false);
      }
    };

  if (relation) {
    return (
      <SafeAreaView
        style={styles.container}
      >
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
                style={
                  styles.successBadge
                }
              >
                <Text
                  style={
                    styles.successMark
                  }
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
                style={
                  styles.guardianTitle
                }
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
                이제 가족의 안전한 금융
                생활을 함께 확인할 수
                있어요.
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
                <View>
                  <Text
                    style={
                      styles.relationshipLabel
                    }
                  >
                    시니어
                  </Text>

                  <Text
                    style={
                      styles.relationshipName
                    }
                  >
                    {
                      relation.seniorName
                    }
                  </Text>
                </View>

                <Text
                  style={
                    styles.relationshipArrow
                  }
                >
                  ↔
                </Text>

                <View>
                  <Text
                    style={
                      styles.relationshipLabel
                    }
                  >
                    보호자
                  </Text>

                  <Text
                    style={
                      styles.relationshipName
                    }
                  >
                    {
                      relation.guardianName
                    }
                  </Text>
                </View>
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
    <SafeAreaView
      style={styles.container}
    >
      <TouchableWithoutFeedback
        onPress={
          Keyboard.dismiss
        }
        accessible={false}
      >
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={
            Platform.OS ===
            'ios'
              ? 'padding'
              : undefined
          }
        >
          <View
            style={styles.content}
          >
            <View>
              <SlideFadeIn
                delay={30}
                distance={10}
              >
                <Text
                  style={styles.step}
                >
                  3단계
                </Text>
              </SlideFadeIn>

              <SlideFadeIn
                delay={90}
                distance={18}
              >
                <Text
                  style={
                    styles.guardianTitle
                  }
                >
                  가족 연결 코드를
                  {`\n`}
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
                  시니어 화면에 표시된
                  6자리 코드를 입력해
                  주세요.
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
                  editable={
                    !isConnecting
                  }
                />
              </SlideFadeIn>

              {!!errorMessage && (
                <Text
                  style={
                    styles.guardianErrorText
                  }
                >
                  {errorMessage}
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.guardianPrimaryButton,
                (!valid ||
                  isConnecting) &&
                  styles.disabledButton,
              ]}
              disabled={
                !valid ||
                isConnecting
              }
              onPress={
                handleConnect
              }
              activeOpacity={0.85}
            >
              {isConnecting ? (
                <ActivityIndicator
                  color="#FFFFFF"
                />
              ) : (
                <Text
                  style={
                    styles.guardianPrimaryText
                  }
                >
                  가족 연결하기
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        colors.background,
    },

    flex: {
      flex: 1,
    },

    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
    },

    loadingText: {
      marginTop: 16,
      fontSize:
        seniorTypography.body,
      lineHeight: 30,
      fontFamily:
        fonts.regular,
      color: colors.muted,
      textAlign: 'center',
    },

    content: {
      flex: 1,
      justifyContent:
        'space-between',
      paddingHorizontal: 24,
      paddingTop: 56,
      paddingBottom: 24,
    },

    step: {
      fontSize: 16,
      fontFamily:
        fonts.semiBold,
      color: colors.primary,
      marginBottom: 16,
    },

    seniorTitle: {
      fontSize:
        seniorTypography.pageTitle,
      lineHeight: 42,
      fontFamily: fonts.bold,
      color: colors.text,
    },

    seniorSubtitle: {
      marginTop: 12,
      fontSize:
        seniorTypography.body,
      lineHeight: 30,
      fontFamily:
        fonts.regular,
      color: colors.muted,
    },

    codeCard: {
      marginTop: 40,
      paddingVertical: 32,
      borderRadius: 22,
      backgroundColor:
        colors.white,
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
      fontFamily:
        fonts.semiBold,
      color: colors.primary,
    },

    helper: {
      marginTop: 14,
      fontSize: 18,
      lineHeight: 26,
      fontFamily:
        fonts.regular,
      textAlign: 'center',
      color: colors.muted,
    },

    footer: {
      gap: 10,
    },

    seniorPrimaryButton: {
      height: 64,
      borderRadius: 18,
      backgroundColor:
        colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },

    seniorPrimaryText: {
      fontSize:
        seniorTypography.button,
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
      fontFamily:
        fonts.semiBold,
      color: '#6B7684',
    },

    codeErrorCard: {
      marginTop: 40,
      padding: 24,
      borderRadius: 22,
      backgroundColor:
        '#FFFFFF',
    },

    errorText: {
      fontSize: 17,
      lineHeight: 26,
      fontFamily:
        fonts.medium,
      color: '#F04452',
      textAlign: 'center',
    },

    retryButton: {
      marginTop: 18,
      height: 54,
      borderRadius: 16,
      backgroundColor:
        colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },

    retryButtonText: {
      fontSize: 18,
      fontFamily: fonts.bold,
      color: '#FFFFFF',
    },

    newCodeButton: {
      marginTop: 16,
      minHeight: 52,
      alignItems: 'center',
      justifyContent: 'center',
    },

    newCodeText: {
      fontSize: 18,
      fontFamily:
        fonts.semiBold,
      color: colors.primary,
    },

    guardianTitle: {
      fontSize:
        guardianTypography.pageTitle,
      lineHeight: 38,
      fontFamily: fonts.bold,
      color: colors.text,
    },

    guardianSubtitle: {
      marginTop: 12,
      fontSize:
        guardianTypography.body,
      lineHeight: 26,
      fontFamily:
        fonts.regular,
      color: colors.muted,
    },

    guardianCodeInput: {
      marginTop: 36,
      height: 64,
      borderRadius: 16,
      backgroundColor:
        colors.white,
      paddingHorizontal: 20,
      fontSize: 24,
      fontFamily:
        fonts.semiBold,
      letterSpacing: 8,
      textAlign: 'center',
      color: colors.text,
    },

    guardianErrorText: {
      marginTop: 12,
      fontSize: 15,
      lineHeight: 22,
      fontFamily:
        fonts.medium,
      color: '#F04452',
      textAlign: 'center',
    },

    guardianPrimaryButton: {
      height: 56,
      borderRadius: 16,
      backgroundColor:
        colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },

    guardianPrimaryText: {
      fontSize:
        guardianTypography.button,
      fontFamily: fonts.bold,
      color: colors.white,
    },

    disabledButton: {
      backgroundColor:
        '#D1D6DB',
    },

    guardianConnectedContent: {
      flex: 1,
      justifyContent:
        'space-between',
      paddingHorizontal: 24,
      paddingTop: 100,
      paddingBottom: 24,
    },

    successBadge: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor:
        '#EAF5F0',
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
      backgroundColor:
        colors.white,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 18,
    },

    relationshipLabel: {
      fontSize: 13,
      lineHeight: 18,
      fontFamily:
        fonts.regular,
      color: colors.muted,
      textAlign: 'center',
    },

    relationshipName: {
      marginTop: 4,
      fontSize: 18,
      fontFamily: fonts.bold,
      color: colors.text,
      textAlign: 'center',
    },

    relationshipArrow: {
      fontSize: 20,
      fontFamily:
        fonts.regular,
      color: colors.muted,
    },

  });
