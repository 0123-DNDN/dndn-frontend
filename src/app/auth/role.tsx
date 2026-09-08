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
import type { UserRole } from '@/types/user';

export default function RoleScreen() {
  const handleSelectRole = (role: UserRole) => {
    router.push({
      pathname: '/auth/login',
      params: {
        role,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View>
          <SlideFadeIn
            delay={40}
            distance={10}
          >
            <Text style={styles.step}>
              1단계
            </Text>
          </SlideFadeIn>

          <SlideFadeIn
            delay={100}
            distance={18}
          >
            <Text style={styles.title}>
              누구로{`\n`}
              시작할까요?
            </Text>
          </SlideFadeIn>

          <SlideFadeIn
            delay={170}
            distance={14}
          >
            <Text style={styles.subtitle}>
              든든을 이용할 역할을
              선택해 주세요.
            </Text>
          </SlideFadeIn>

          <View style={styles.roleList}>
            <SlideFadeIn
              delay={250}
              distance={14}
            >
              <TouchableOpacity
                style={styles.roleCard}
                activeOpacity={0.85}
                onPress={() =>
                  handleSelectRole('senior')
                }
              >
                <Text style={styles.roleTitle}>
                  시니어
                </Text>

                <Text style={styles.roleDescription}>
                  쉽고 안전하게 금융 생활을
                  이용해요
                </Text>
              </TouchableOpacity>
            </SlideFadeIn>

            <SlideFadeIn
              delay={320}
              distance={14}
            >
              <TouchableOpacity
                style={styles.roleCard}
                activeOpacity={0.85}
                onPress={() =>
                  handleSelectRole('guardian')
                }
              >
                <Text style={styles.roleTitle}>
                  가족
                </Text>

                <Text style={styles.roleDescription}>
                  가족의 금융 생활을
                  함께 확인해요
                </Text>
              </TouchableOpacity>
            </SlideFadeIn>
          </View>
        </View>

        <Text style={styles.footerText}>
          역할은 가입 후에도 확인할 수 있어요.
        </Text>
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
    paddingTop: 56,
    paddingBottom: 32,
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
    fontSize: 20,
    lineHeight: 30,
    fontFamily: fonts.regular,
    color: colors.muted,
  },

  roleList: {
    marginTop: 40,
    gap: 16,
  },

  roleCard: {
    minHeight: 138,
    borderRadius: 22,
    backgroundColor: colors.white,
    padding: 24,
    justifyContent: 'center',
  },

  roleTitle: {
    fontSize: 24,
    lineHeight: 32,
    fontFamily: fonts.bold,
    color: colors.text,
  },

  roleDescription: {
    marginTop: 8,
    fontSize: 18,
    lineHeight: 27,
    fontFamily: fonts.regular,
    color: colors.muted,
  },

  footerText: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: fonts.regular,
    textAlign: 'center',
    color: colors.muted,
  },
});