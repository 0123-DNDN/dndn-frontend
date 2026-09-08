import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import { routes } from '@/constants/routes';
import {
  getApiErrorMessage,
  loginAndSaveToken,
} from '@/services/auth';
import type { ApiUserRole } from '@/types/user';

type DevAccount = {
  label: string;
  phone: string;
  role: ApiUserRole;
};

const DEV_PASSWORD = 'testtest';

const DEV_ACCOUNTS: DevAccount[] = [
  {
    label: '시니어',
    phone: '01011111111',
    role: 'SENIOR',
  },
  {
    label: '보호자',
    phone: '01022222222',
    role: 'GUARDIAN',
  },
];

export default function DevQuickLogin() {
  const [submittingRole, setSubmittingRole] =
    useState<ApiUserRole | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleQuickLogin = async (account: DevAccount) => {
    if (submittingRole) return;

    setSubmittingRole(account.role);
    setErrorMessage('');

    try {
      const response = await loginAndSaveToken({
        phone: account.phone,
        password: DEV_PASSWORD,
      });

      router.replace(
        response.role === 'SENIOR'
          ? routes.seniorHome
          : routes.guardianHome,
      );
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, '개발 계정 로그인에 실패했습니다.'),
      );
    } finally {
      setSubmittingRole(null);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>개발용 빠른 로그인</Text>
      <View style={styles.accountRow}>
        {DEV_ACCOUNTS.map((account) => (
          <TouchableOpacity
            key={account.role}
            style={styles.accountButton}
            activeOpacity={0.8}
            disabled={submittingRole !== null}
            onPress={() => handleQuickLogin(account)}
          >
            {submittingRole === account.role ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <>
                <Text style={styles.role}>{account.label}</Text>
                <Text style={styles.phone}>{account.phone}</Text>
              </>
            )}
          </TouchableOpacity>
        ))}
      </View>
      {!!errorMessage && <Text style={styles.error}>{errorMessage}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  heading: {
    marginBottom: 10,
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.muted,
  },
  accountRow: {
    flexDirection: 'row',
    gap: 10,
  },
  accountButton: {
    flex: 1,
    minHeight: 76,
    paddingHorizontal: 12,
    paddingVertical: 12,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    backgroundColor: colors.white,
  },
  role: {
    fontSize: 17,
    fontFamily: fonts.bold,
    color: colors.primary,
  },
  phone: {
    marginTop: 4,
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.muted,
  },
  error: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 19,
    fontFamily: fonts.medium,
    color: '#F04452',
  },
});
