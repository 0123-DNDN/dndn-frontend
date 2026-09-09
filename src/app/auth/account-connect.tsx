import { router } from 'expo-router';
import {
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
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
import {
  connectAccount,
  getAvailableAccounts,
  getCurrentUser,
} from '@/services/account';
import type {
  AccountResponse,
  CurrentUserResponse,
} from '@/types/account';

export default function AccountConnectScreen() {
  const [selectedIds, setSelectedIds] =
    useState<number[]>([]);

  const [accounts, setAccounts] =
    useState<AccountResponse[]>([]);

  const [
    currentUser,
    setCurrentUser,
  ] = useState<CurrentUserResponse | null>(
    null,
  );

  const [
    isLoadingUser,
    setIsLoadingUser,
  ] = useState(true);

  const [
    isConnecting,
    setIsConnecting,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('');

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser =
    async () => {
      try {
        setIsLoadingUser(true);
        setErrorMessage('');

        const user =
          await getCurrentUser();

        setCurrentUser(user);
        setAccounts(
          await getAvailableAccounts(),
        );
      } catch (error) {
        console.log(
          'GET CURRENT USER ERROR:',
          error,
        );

        setErrorMessage(
          '회원 정보를 불러오지 못했어요.',
        );
      } finally {
        setIsLoadingUser(false);
      }
    };

  const primaryAccount =
    useMemo(() => {
      const selectedAccounts =
        accounts.filter((account) =>
          selectedIds.includes(
            account.accountId,
          ),
        );

      if (
        selectedAccounts.length === 0
      ) {
        return null;
      }

      return selectedAccounts.reduce(
        (
          currentPrimary,
          account,
        ) =>
          account.balance >
          currentPrimary.balance
            ? account
            : currentPrimary,
      );
    }, [accounts, selectedIds]);

  const toggleAccount = (accountId: number) => {
    if (isConnecting) return;

    setSelectedIds((prev) => {
      if (
        prev.includes(accountId)
      ) {
        return prev.filter(
          (id) => id !== accountId,
        );
      }

      return [...prev, accountId];
    });

    setErrorMessage('');
  };

  const handleConnect =
    async () => {
      if (
        selectedIds.length === 0 ||
        !primaryAccount ||
        !currentUser ||
        isConnecting
      ) {
        return;
      }

      try {
        setIsConnecting(true);
        setErrorMessage('');

        const selectedAccounts =
          accounts.filter(
            (account) =>
              selectedIds.includes(
                account.accountId,
              ),
          );

        /*
         * 백엔드는 사용자의 첫 번째 연결 계좌를
         * 대표 계좌로 자동 지정한다.
         *
         * 따라서 프론트에서 잔액이 가장 큰 계좌를
         * 가장 먼저 연결해서 기존 UX와 맞춘다.
         */
        const orderedAccounts = [
          primaryAccount,
          ...selectedAccounts.filter(
            (account) =>
              account.accountId !==
              primaryAccount.accountId,
          ),
        ];

        for (const account of orderedAccounts) {
          await connectAccount({
            accountId: account.accountId,
          });
        }

        router.replace(
          '/senior/home',
        );
      } catch (error) {
        console.log(
          'ACCOUNT CONNECT ERROR:',
          error,
        );

        if (
          error instanceof Error &&
          error.message
        ) {
          setErrorMessage(
            error.message,
          );
        } else {
          setErrorMessage(
            '계좌 연결에 실패했어요. 다시 시도해 주세요.',
          );
        }
      } finally {
        setIsConnecting(false);
      }
    };

  const disabled =
    selectedIds.length === 0 ||
    !currentUser ||
    isConnecting ||
    isLoadingUser;

  if (isLoadingUser) {
    return (
      <SafeAreaView
        style={styles.container}
      >
        <View
          style={styles.loadingContainer}
        >
          <ActivityIndicator
            size="large"
            color={colors.primary}
          />

          <Text
            style={styles.loadingText}
          >
            회원 정보를 확인하고 있어요
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.container}
    >
      <View style={styles.wrapper}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={
            styles.scrollContent
          }
          showsVerticalScrollIndicator={
            false
          }
        >
          <SlideFadeIn
            delay={30}
            distance={10}
          >
            <Text style={styles.step}>
              4단계
            </Text>
          </SlideFadeIn>

          <SlideFadeIn
            delay={90}
            distance={18}
          >
            <Text style={styles.title}>
              사용할 통장을{`\n`}
              선택해 주세요
            </Text>
          </SlideFadeIn>

          <SlideFadeIn
            delay={160}
            distance={14}
          >
            <Text
              style={styles.subtitle}
            >
              여러 개의 통장을 선택할 수
              있어요.
              {`\n`}
              대표 출금계좌는 자동으로
              정해드려요.
            </Text>
          </SlideFadeIn>

          <View
            style={styles.accountList}
          >
            {accounts.map(
              (
                account,
                index,
              ) => {
                const selected =
                  selectedIds.includes(
                    account.accountId,
                  );

                  const isPrimary =
                    primaryAccount?.accountId ===
                    account.accountId;

                return (
                  <SlideFadeIn
                    key={account.accountId}
                    delay={
                      240 +
                      index * 70
                    }
                    duration={420}
                    distance={14}
                  >
                    <TouchableOpacity
                      activeOpacity={0.85}
                      disabled={
                        isConnecting
                      }
                      style={[
                        styles.accountCard,
                        selected &&
                          styles.selectedCard,
                      ]}
                      onPress={() =>
                        toggleAccount(
                          account.accountId,
                        )
                      }
                    >
                      <View
                        style={
                          styles.accountHeader
                        }
                      >
                        <Text
                          style={
                            styles.accountName
                          }
                        >
                          {account.accountName}
                        </Text>

                        <View
                          style={[
                            styles.radio,
                            selected &&
                              styles.radioSelected,
                          ]}
                        >
                          {selected && (
                            <View
                              style={
                                styles.radioDot
                              }
                            />
                          )}
                        </View>
                      </View>

                      <Text
                        style={
                          styles.accountNumber
                        }
                      >
                        {
                          account.accountNumber
                        }
                      </Text>

                      <Text
                        style={
                          styles.balanceLabel
                        }
                      >
                        잔액
                      </Text>

                      <Text
                        style={
                          styles.balance
                        }
                      >
                        {account.balance.toLocaleString()}원
                      </Text>

                      {selected &&
                        isPrimary && (
                          <Text
                            style={
                              styles.primaryLabel
                            }
                          >
                            대표 출금계좌로 자동
                            설정돼요
                          </Text>
                        )}
                    </TouchableOpacity>
                  </SlideFadeIn>
                );
              },
            )}
          </View>

          {selectedIds.length >
            0 &&
            primaryAccount && (
              <SlideFadeIn
                duration={360}
                distance={12}
              >
                <View
                  style={styles.summary}
                >
                  <Text
                    style={
                      styles.summaryTitle
                    }
                  >
                    {
                      selectedIds.length
                    }
                    개의 통장을 선택했어요
                  </Text>

                  <Text
                    style={
                      styles.summaryLabel
                    }
                  >
                    대표 출금계좌
                  </Text>

                  <Text
                    style={
                      styles.summaryAccount
                    }
                  >
                    {
                      primaryAccount.accountName
                    }
                  </Text>
                </View>
              </SlideFadeIn>
            )}

          {!!errorMessage && (
            <Text
              style={styles.errorText}
            >
              {errorMessage}
            </Text>
          )}

          <View
            style={
              styles.bottomSpacer
            }
          />
        </ScrollView>

        <View
          style={styles.bottomArea}
        >
          <TouchableOpacity
            style={[
              styles.button,
              disabled &&
                styles.disabledButton,
            ]}
            disabled={disabled}
            activeOpacity={0.85}
            onPress={handleConnect}
          >
            {isConnecting ? (
              <ActivityIndicator
                color="#FFFFFF"
              />
            ) : (
              <Text
                style={
                  styles.buttonText
                }
              >
                연결하고 시작하기
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
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

    wrapper: {
      flex: 1,
    },

    scrollView: {
      flex: 1,
    },

    scrollContent: {
      paddingHorizontal: 24,
      paddingTop: 56,
      paddingBottom: 24,
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
    },

    step: {
      fontSize: 16,
      fontFamily:
        fonts.semiBold,
      color: colors.primary,
      marginBottom: 16,
    },

    title: {
      fontSize:
        seniorTypography.pageTitle,
      lineHeight: 42,
      fontFamily: fonts.bold,
      color: colors.text,
    },

    subtitle: {
      marginTop: 12,
      fontSize:
        seniorTypography.body,
      lineHeight: 30,
      fontFamily:
        fonts.regular,
      color: colors.muted,
    },

    accountList: {
      marginTop: 36,
      gap: 16,
    },

    accountCard: {
      padding: 24,
      borderRadius: 20,
      backgroundColor:
        colors.white,
      borderWidth: 2,
      borderColor:
        'transparent',
    },

    selectedCard: {
      borderColor:
        colors.primary,
    },

    accountHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      gap: 16,
    },

    accountName: {
      flex: 1,
      fontSize:
        seniorTypography.sectionTitle,
      lineHeight: 38,
      fontFamily: fonts.bold,
      color: colors.text,
    },

    accountNumber: {
      marginTop: 8,
      fontSize:
        seniorTypography.body,
      lineHeight: 30,
      fontFamily:
        fonts.regular,
      color: colors.muted,
    },

    balanceLabel: {
      marginTop: 24,
      fontSize: 18,
      lineHeight: 26,
      fontFamily:
        fonts.regular,
      color: colors.muted,
    },

    balance: {
      marginTop: 4,
      fontSize:
        seniorTypography.amount,
      lineHeight: 50,
      fontFamily: fonts.bold,
      color: colors.text,
    },

    radio: {
      width: 28,
      height: 28,
      borderRadius: 14,
      borderWidth: 2,
      borderColor: '#D1D6DB',
      alignItems: 'center',
      justifyContent: 'center',
    },

    radioSelected: {
      borderColor:
        colors.primary,
    },

    radioDot: {
      width: 14,
      height: 14,
      borderRadius: 7,
      backgroundColor:
        colors.primary,
    },

    primaryLabel: {
      marginTop: 16,
      fontSize: 17,
      lineHeight: 24,
      fontFamily:
        fonts.semiBold,
      color: colors.primary,
    },

    summary: {
      marginTop: 28,
      padding: 24,
      borderRadius: 20,
      backgroundColor:
        '#EDF7F3',
    },

    summaryTitle: {
      fontSize:
        seniorTypography.bodyStrong,
      lineHeight: 30,
      fontFamily: fonts.bold,
      color: colors.text,
    },

    summaryLabel: {
      marginTop: 16,
      fontSize: 17,
      lineHeight: 24,
      fontFamily:
        fonts.regular,
      color: colors.muted,
    },

    summaryAccount: {
      marginTop: 4,
      fontSize:
        seniorTypography.bodyStrong,
      lineHeight: 30,
      fontFamily: fonts.bold,
      color: colors.primary,
    },

    errorText: {
      marginTop: 20,
      fontSize: 17,
      lineHeight: 26,
      fontFamily:
        fonts.medium,
      color: '#F04452',
    },

    bottomSpacer: {
      height: 160,
    },

    bottomArea: {
      paddingHorizontal: 24,
      paddingTop: 12,
      paddingBottom: 24,
      backgroundColor:
        colors.background,
    },

    button: {
      height: 64,
      borderRadius: 18,
      backgroundColor:
        colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },

    disabledButton: {
      backgroundColor:
        '#D1D6DB',
    },

    buttonText: {
      fontSize:
        seniorTypography.button,
      lineHeight: 28,
      fontFamily: fonts.bold,
      color: '#FFFFFF',
    },
  });