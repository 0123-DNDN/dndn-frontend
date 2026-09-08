import { router } from 'expo-router';
import {
  useMemo,
  useState,
} from 'react';
import {
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

const accounts = [
  {
    id: '2001',
    name: 'KB 국민 든든통장',
    number: '123456-01-****',
    balance: '3,450,000원',
    balanceValue: 3450000,
  },
  {
    id: '2004',
    name: 'KB 생활비 통장',
    number: '123456-02-****',
    balance: '1,280,000원',
    balanceValue: 1280000,
  },
  {
    id: '2005',
    name: 'KB 저축통장',
    number: '123456-03-****',
    balance: '850,000원',
    balanceValue: 850000,
  },
];

export default function AccountConnectScreen() {
  const [selectedIds, setSelectedIds] =
    useState<string[]>([]);

  const primaryAccount = useMemo(() => {
    const selectedAccounts =
      accounts.filter((account) =>
        selectedIds.includes(account.id),
      );

    if (selectedAccounts.length === 0) {
      return null;
    }

    return selectedAccounts.reduce(
      (currentPrimary, account) =>
        account.balanceValue >
        currentPrimary.balanceValue
          ? account
          : currentPrimary,
    );
  }, [selectedIds]);

  const toggleAccount = (
    accountId: string,
  ) => {
    setSelectedIds((prev) => {
      if (prev.includes(accountId)) {
        return prev.filter(
          (id) => id !== accountId,
        );
      }

      return [...prev, accountId];
    });
  };

  const handleConnect = () => {
    if (
      selectedIds.length === 0 ||
      !primaryAccount
    ) {
      return;
    }

    router.replace('/senior/home');
  };

  const disabled =
    selectedIds.length === 0;

  return (
    <SafeAreaView style={styles.container}>
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
            <Text style={styles.subtitle}>
              여러 개의 통장을 선택할 수 있어요.
              {`\n`}
              대표 출금계좌는 자동으로 정해드려요.
            </Text>
          </SlideFadeIn>

          <View style={styles.accountList}>
            {accounts.map(
              (account, index) => {
                const selected =
                  selectedIds.includes(
                    account.id,
                  );

                const isPrimary =
                  primaryAccount?.id ===
                  account.id;

                return (
                  <SlideFadeIn
                    key={account.id}
                    delay={240 + index * 70}
                    duration={420}
                    distance={14}
                  >
                    <TouchableOpacity
                      activeOpacity={0.85}
                      style={[
                        styles.accountCard,
                        selected &&
                          styles.selectedCard,
                      ]}
                      onPress={() =>
                        toggleAccount(
                          account.id,
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
                          {account.name}
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
                        {account.number}
                      </Text>

                      <Text
                        style={
                          styles.balanceLabel
                        }
                      >
                        잔액
                      </Text>

                      <Text
                        style={styles.balance}
                      >
                        {account.balance}
                      </Text>

                      {selected &&
                        isPrimary && (
                          <Text
                            style={
                              styles.primaryLabel
                            }
                          >
                            대표 출금계좌로 자동 설정돼요
                          </Text>
                        )}
                    </TouchableOpacity>
                  </SlideFadeIn>
                );
              },
            )}
          </View>

          {selectedIds.length > 0 &&
            primaryAccount && (
              <SlideFadeIn
                duration={360}
                distance={12}
              >
                <View style={styles.summary}>
                  <Text
                    style={
                      styles.summaryTitle
                    }
                  >
                    {selectedIds.length}개의 통장을
                    선택했어요
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
                    {primaryAccount.name}
                  </Text>
                </View>
              </SlideFadeIn>
            )}

          <View style={styles.bottomSpacer} />
        </ScrollView>

        <View style={styles.bottomArea}>
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
            <Text style={styles.buttonText}>
              연결하고 시작하기
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

  step: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: colors.primary,
    marginBottom: 16,
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

  accountList: {
    marginTop: 32,
    gap: 14,
  },

  accountCard: {
    borderRadius: 22,
    backgroundColor: colors.white,
    padding: 22,
    borderWidth: 2,
    borderColor: 'transparent',
  },

  selectedCard: {
    borderColor: colors.primary,
  },

  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },

  accountName: {
    flex: 1,
    fontSize: 22,
    lineHeight: 30,
    fontFamily: fonts.bold,
    color: colors.text,
  },

  radio: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#D1D6DB',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  radioSelected: {
    borderColor: colors.primary,
  },

  radioDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.primary,
  },

  accountNumber: {
    marginTop: 8,
    fontSize: 18,
    fontFamily: fonts.regular,
    color: colors.muted,
  },

  balanceLabel: {
    marginTop: 22,
    fontSize: 18,
    fontFamily: fonts.regular,
    color: colors.muted,
  },

  balance: {
    marginTop: 4,
    fontSize: 30,
    fontFamily: fonts.bold,
    color: colors.text,
  },

  primaryLabel: {
    marginTop: 16,
    fontSize: 16,
    lineHeight: 24,
    fontFamily: fonts.semiBold,
    color: colors.primary,
  },

  summary: {
    marginTop: 24,
    padding: 20,
    borderRadius: 20,
    backgroundColor: colors.white,
  },

  summaryTitle: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: colors.text,
  },

  summaryLabel: {
    marginTop: 16,
    fontSize: 17,
    fontFamily: fonts.regular,
    color: colors.muted,
  },

  summaryAccount: {
    marginTop: 4,
    fontSize: 20,
    fontFamily: fonts.bold,
    color: colors.text,
  },

  bottomSpacer: {
    height: 24,
  },

  bottomArea: {
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