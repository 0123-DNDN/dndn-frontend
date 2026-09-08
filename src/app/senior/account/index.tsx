import { router } from 'expo-router';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import {
  fonts,
  seniorTypography,
} from '@/constants/typography';
import {
  getAccountBalance,
  getMainAccount,
} from '@/services/account';
import {
  getTransactions,
} from '@/services/transaction';
import type { AccountResponse } from '@/types/account';
import type { TransactionResponse } from '@/types/transaction';

function formatMoney(
  value: number,
) {
  return `${value.toLocaleString(
    'ko-KR',
  )}원`;
}

function maskAccountNumber(
  value: string,
) {
  if (!value) {
    return '';
  }

  if (value.length <= 4) {
    return value;
  }

  return `${value.slice(
    0,
    Math.min(8, value.length - 4),
  )}-****`;
}

function formatDateTime(
  value: string,
) {
  const date = new Date(value);

  const month =
    date.getMonth() + 1;

  const day =
    date.getDate();

  const hour =
    String(
      date.getHours(),
    ).padStart(2, '0');

  const minute =
    String(
      date.getMinutes(),
    ).padStart(2, '0');

  return `${month}월 ${day}일 ${hour}:${minute}`;
}

function getStatusText(
  transaction: TransactionResponse,
) {
  switch (
    transaction.status
  ) {
    case 'COMPLETED':
      return '송금 완료';

    case 'CANCELLED':
      return '송금 취소';

    case 'WAITING_GUARDIAN':
      return '보호자 확인 중';

    case 'GUARDIAN_APPROVED':
      return '보호자 승인';

    case 'HIGH_RISK':
      return '위험 거래 확인 중';

    case 'FINAL_CONFIRMED':
      return '송금 확인 완료';

    case 'NORMAL':
      return '송금 확인 중';

    case 'AMOUNT_CONFIRMED':
      return '금액 확인 완료';

    case 'RECIPIENT_CONFIRMED':
      return '받는 분 확인 완료';

    case 'CREATED':
      return '송금 진행 중';

    default:
      return transaction.status;
  }
}

function getTransactionDescription(
  transaction: TransactionResponse,
) {
  return `${formatDateTime(
    transaction.createdAt,
  )} · ${getStatusText(
    transaction,
  )}`;
}

export default function AccountScreen() {
  const [
    account,
    setAccount,
  ] =
    useState<AccountResponse | null>(
      null,
    );

  const [
    balance,
    setBalance,
  ] =
    useState<number | null>(
      null,
    );

  const [
    transactions,
    setTransactions,
  ] =
    useState<
      TransactionResponse[]
    >([]);

  const [
    isLoading,
    setIsLoading,
  ] =
    useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState('');

  const loadAccount =
    useCallback(async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');

        const [
          mainAccount,
          transactionList,
        ] = await Promise.all([
          getMainAccount(),
          getTransactions(),
        ]);

        setAccount(
          mainAccount,
        );

        setTransactions(
          transactionList,
        );

        const balanceResponse =
          await getAccountBalance(
            mainAccount.accountId,
          );

        setBalance(
          balanceResponse.balance,
        );
      } catch (error) {
        console.log(
          'ACCOUNT LOAD ERROR:',
          error,
        );

        setAccount(null);
        setBalance(null);
        setTransactions([]);

        setErrorMessage(
          '통장 정보를 불러오지 못했어요.',
        );
      } finally {
        setIsLoading(false);
      }
    }, []);

  useEffect(() => {
    loadAccount();
  }, [loadAccount]);

  return (
    <SafeAreaView
      style={
        styles.container
      }
    >
      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        <View
          style={
            styles.header
          }
        >
          <View
            style={
              styles.backRow
            }
          >
            <TouchableOpacity
              style={
                styles.backButton
              }
              onPress={() =>
                router.back()
              }
              activeOpacity={
                0.6
              }
            >
              <Text
                style={
                  styles.back
                }
              >
                ‹
              </Text>
            </TouchableOpacity>

            <Text
              style={
                styles.backLabel
              }
            >
              뒤로가기
            </Text>
          </View>

          <View
            style={
              styles.titleRow
            }
          >
            <Text
              style={
                styles.title
              }
            >
              내 통장
            </Text>

            <TouchableOpacity
              style={
                styles.otherAccountButton
              }
              activeOpacity={
                0.75
              }
              onPress={() =>
                router.push(
                  '/senior/account/other-accounts',
                )
              }
            >
              <Text
                style={
                  styles.otherAccountText
                }
              >
                다른 통장 보기
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {isLoading ? (
          <View
            style={
              styles.loadingCard
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
              통장 정보를
              불러오고 있어요
            </Text>
          </View>
        ) : errorMessage ? (
          <View
            style={
              styles.errorCard
            }
          >
            <Text
              style={
                styles.errorTitle
              }
            >
              통장 정보를 확인할 수
              없어요
            </Text>

            <Text
              style={
                styles.errorDescription
              }
            >
              {errorMessage}
            </Text>

            <TouchableOpacity
              style={
                styles.retryButton
              }
              onPress={
                loadAccount
              }
              activeOpacity={
                0.8
              }
            >
              <Text
                style={
                  styles.retryText
                }
              >
                다시 불러오기
              </Text>
            </TouchableOpacity>
          </View>
        ) : account ? (
          <>
            <View
              style={
                styles.accountCard
              }
            >
              <Text
                style={
                  styles.accountName
                }
              >
                {
                  account.accountName
                }
              </Text>

              <Text
                style={
                  styles.accountNumber
                }
              >
                {maskAccountNumber(
                  account.accountNumber,
                )}
              </Text>

              <Text
                style={
                  styles.balanceLabel
                }
              >
                총 잔액
              </Text>

              <Text
                style={
                  styles.balance
                }
              >
                {formatMoney(
                  balance ??
                    account.balance ??
                    0,
                )}
              </Text>
            </View>

            <Text
              style={
                styles.sectionTitle
              }
            >
              거래내역
            </Text>

            {transactions.length ===
            0 ? (
              <View
                style={
                  styles.emptyCard
                }
              >
                <Text
                  style={
                    styles.emptyTitle
                  }
                >
                  아직 거래내역이
                  없어요
                </Text>

                <Text
                  style={
                    styles.emptyDescription
                  }
                >
                  송금이 완료되면
                  이곳에서 확인할 수
                  있어요.
                </Text>
              </View>
            ) : (
              <View
                style={
                  styles.transactionList
                }
              >
                {transactions.map(
                  (item) => {
                    const isCancelled =
                      item.status ===
                      'CANCELLED';

                    const isRisk =
                      item.riskLevel ===
                        'HIGH' ||
                      item.riskLevel ===
                        'CRITICAL';

                    return (
                      <TouchableOpacity
                        key={
                          item.transactionId
                        }
                        style={
                          styles.transactionCard
                        }
                        activeOpacity={
                          0.75
                        }
                        onPress={() =>
                          router.push(
                            `/senior/transaction/${item.transactionId}`,
                          )
                        }
                      >
                        <View
                          style={
                            styles.transactionRow
                          }
                        >
                          <View
                            style={
                              styles.transactionLeft
                            }
                          >
                            <Text
                              style={
                                styles.transactionName
                              }
                              numberOfLines={
                                1
                              }
                            >
                              {item.receiverName ||
                                '받는 분'}
                            </Text>

                            <Text
                              style={
                                styles.transactionDescription
                              }
                              numberOfLines={
                                1
                              }
                              ellipsizeMode="tail"
                            >
                              {getTransactionDescription(
                                item,
                              )}
                            </Text>

                            {!!item.purpose && (
                              <Text
                                style={
                                  styles.purpose
                                }
                                numberOfLines={
                                  1
                                }
                              >
                                {
                                  item.purpose
                                }
                              </Text>
                            )}
                          </View>

                          <View
                            style={
                              styles.transactionRight
                            }
                          >
                            {isCancelled ? (
                              <View
                                style={
                                  styles.cancelBadge
                                }
                              >
                                <Text
                                  style={
                                    styles.cancelBadgeText
                                  }
                                >
                                  송금 취소
                                </Text>
                              </View>
                            ) : (
                              <Text
                                style={[
                                  styles.transactionValue,
                                  isRisk &&
                                    styles.riskValue,
                                ]}
                                numberOfLines={
                                  1
                                }
                              >
                                -
                                {formatMoney(
                                  item.amount,
                                )}
                              </Text>
                            )}

                            {item.riskLevel &&
                              item.riskLevel !==
                                'LOW' && (
                                <Text
                                  style={
                                    styles.riskLabel
                                  }
                                >
                                  {item.riskLevel ===
                                  'CRITICAL'
                                    ? '고위험'
                                    : item.riskLevel ===
                                      'HIGH'
                                    ? '위험'
                                    : '주의'}
                                </Text>
                              )}
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  },
                )}
              </View>
            )}
          </>
        ) : (
          <View
            style={
              styles.errorCard
            }
          >
            <Text
              style={
                styles.errorTitle
              }
            >
              연결된 통장이
              없어요
            </Text>

            <Text
              style={
                styles.errorDescription
              }
            >
              회원가입 과정에서 통장을
              연결해 주세요.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        '#F7F8FA',
    },

    content: {
      paddingHorizontal:
        spacing.page,
      paddingBottom:
        spacing.section,
    },

    header: {
      paddingTop:
        spacing.item,
      marginBottom:
        spacing.content,
    },

    backRow: {
      flexDirection:
        'row',
      alignItems: 'center',
    },

    backButton: {
      width: 32,
      minHeight:
        spacing.touchTarget,
      justifyContent:
        'flex-start',
      alignItems:
        'flex-start',
    },

    back: {
      fontSize: 38,
      color:
        colors.text,
    },

    backLabel: {
      fontSize:
        seniorTypography.body,
      fontFamily:
        fonts.semiBold,
      color:
        colors.text,
    },

    titleRow: {
      marginTop:
        spacing.item,
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'space-between',
      gap: 16,
    },

    title: {
      flexShrink: 0,
      fontSize: 32,
      lineHeight: 40,
      fontFamily:
        fonts.bold,
      color:
        '#191F28',
    },

    otherAccountButton: {
      minHeight: 60,
      paddingHorizontal: 22,
      borderRadius: 20,
      backgroundColor:
        '#FFFFFF',
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    otherAccountText: {
      fontSize:
        seniorTypography.body,
      lineHeight: 30,
      fontFamily:
        fonts.bold,
      color:
        '#191F28',
    },

    accountCard: {
      backgroundColor:
        '#FFFFFF',
      borderRadius:
        spacing.cardRadius,
      padding:
        spacing.page,
    },

    accountName: {
      fontSize: 26,
      lineHeight: 36,
      fontFamily:
        fonts.bold,
      color:
        '#191F28',
    },

    accountNumber: {
      marginTop: 8,
      fontSize:
        seniorTypography.body,
      lineHeight: 30,
      fontFamily:
        fonts.regular,
      color:
        '#8B95A1',
    },

    balanceLabel: {
      marginTop: 28,
      fontSize:
        seniorTypography.body,
      lineHeight: 30,
      fontFamily:
        fonts.regular,
      color:
        '#8B95A1',
    },

    balance: {
      marginTop: 8,
      fontSize: 36,
      lineHeight: 46,
      fontFamily:
        fonts.bold,
      color:
        '#191F28',
    },

    loadingCard: {
      minHeight: 220,
      backgroundColor:
        '#FFFFFF',
      borderRadius:
        spacing.cardRadius,
      alignItems:
        'center',
      justifyContent:
        'center',
      padding: 24,
    },

    loadingText: {
      marginTop: 16,
      fontSize:
        seniorTypography.body,
      lineHeight: 30,
      fontFamily:
        fonts.regular,
      color:
        '#8B95A1',
      textAlign:
        'center',
    },

    errorCard: {
      backgroundColor:
        '#FFFFFF',
      borderRadius:
        spacing.cardRadius,
      padding: 24,
    },

    errorTitle: {
      fontSize: 24,
      lineHeight: 34,
      fontFamily:
        fonts.bold,
      color:
        '#191F28',
    },

    errorDescription: {
      marginTop: 8,
      fontSize: 18,
      lineHeight: 28,
      fontFamily:
        fonts.regular,
      color:
        '#8B95A1',
    },

    retryButton: {
      marginTop: 20,
      height: 56,
      borderRadius: 16,
      backgroundColor:
        colors.primary,
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    retryText: {
      fontSize: 18,
      fontFamily:
        fonts.bold,
      color:
        '#FFFFFF',
    },

    sectionTitle: {
      marginTop:
        spacing.section,
      marginBottom:
        spacing.content,
      fontSize: 30,
      lineHeight: 40,
      fontFamily:
        fonts.bold,
      color:
        '#191F28',
    },

    transactionList: {
      gap:
        spacing.item,
    },

    transactionCard: {
      backgroundColor:
        '#FFFFFF',
      borderRadius:
        spacing.cardRadius,
      paddingHorizontal: 20,
      paddingVertical: 20,
    },

    transactionRow: {
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'space-between',
      gap: 12,
    },

    transactionLeft: {
      flex: 1,
      minWidth: 0,
    },

    transactionName: {
      fontSize: 22,
      lineHeight: 30,
      fontFamily:
        fonts.bold,
      color:
        '#191F28',
    },

    transactionDescription: {
      marginTop: 4,
      fontSize: 17,
      lineHeight: 24,
      fontFamily:
        fonts.regular,
      color:
        '#8B95A1',
    },

    purpose: {
      marginTop: 4,
      fontSize: 15,
      lineHeight: 22,
      fontFamily:
        fonts.regular,
      color:
        '#B0B8C1',
    },

    transactionRight: {
      flexShrink: 0,
      alignItems:
        'flex-end',
      justifyContent:
        'center',
    },

    transactionValue: {
      fontSize: 22,
      lineHeight: 30,
      fontFamily:
        fonts.bold,
      color:
        '#191F28',
    },

    riskValue: {
      color:
        '#F04452',
    },

    riskLabel: {
      marginTop: 4,
      fontSize: 15,
      lineHeight: 22,
      fontFamily:
        fonts.semiBold,
      color:
        '#F04452',
    },

    cancelBadge: {
      minHeight: 38,
      paddingHorizontal: 14,
      borderRadius: 12,
      backgroundColor:
        '#FFF1F3',
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    cancelBadgeText: {
      fontSize: 18,
      lineHeight: 24,
      fontFamily:
        fonts.bold,
      color:
        '#F04452',
    },

    emptyCard: {
      backgroundColor:
        '#FFFFFF',
      borderRadius:
        spacing.cardRadius,
      padding: 24,
    },

    emptyTitle: {
      fontSize: 22,
      lineHeight: 30,
      fontFamily:
        fonts.bold,
      color:
        '#191F28',
    },

    emptyDescription: {
      marginTop: 8,
      fontSize: 17,
      lineHeight: 26,
      fontFamily:
        fonts.regular,
      color:
        '#8B95A1',
    },
  });