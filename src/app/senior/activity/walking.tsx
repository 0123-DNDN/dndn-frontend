import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import {
  fonts,
  seniorTypography,
} from '@/constants/typography';

const CURRENT_STEPS = 1840;
const TARGET_STEPS = 3000;

export default function WalkingScreen() {
  const progress = Math.min(
    CURRENT_STEPS / TARGET_STEPS,
    1,
  );

  const remaining = Math.max(
    TARGET_STEPS - CURRENT_STEPS,
    0,
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.screen}>
        <View>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons
              name="chevron-back"
              size={30}
              color="#191F28"
            />
          </TouchableOpacity>

          <Text style={styles.pageLabel}>
            오늘 걷기
          </Text>

          <Text style={styles.title}>
            오늘도 천천히{'\n'}
            걸어볼까요?
          </Text>

          <Text style={styles.description}>
            평소처럼 걸으면 걸음 수가
            자동으로 기록돼요.
          </Text>
        </View>

        <View style={styles.stepCard}>
          <View style={styles.walkIcon}>
            <Ionicons
              name="walk-outline"
              size={38}
              color={colors.primary}
            />
          </View>

          <Text style={styles.stepLabel}>
            오늘 걸은 걸음
          </Text>

          <View style={styles.stepCountRow}>
            <Text style={styles.stepCount}>
              {CURRENT_STEPS.toLocaleString()}
            </Text>

            <Text style={styles.stepUnit}>
              보
            </Text>
          </View>

          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>
              오늘의 목표
            </Text>

            <Text style={styles.targetText}>
              {TARGET_STEPS.toLocaleString()}보
            </Text>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progress * 100}%`,
                },
              ]}
            />
          </View>

          <Text style={styles.remaining}>
            목표까지{' '}
            <Text style={styles.remainingStrong}>
              {remaining.toLocaleString()}보
            </Text>
            {' '}남았어요
          </Text>
        </View>

        <View style={styles.bottomArea}>
          <View style={styles.infoBox}>
            <Ionicons
              name="sync-outline"
              size={23}
              color="#6B7684"
            />

            <Text style={styles.infoText}>
              휴대폰의 걸음 수와 자동으로
              동기화돼요.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.refreshButton}
            activeOpacity={0.75}
            onPress={() => {
              // TODO
              // HealthKit / Health Connect 걸음 수 재조회
              //
              // 이후
              // POST /api/activities/{activityId}/results
              //
              // {
              //   stepCount
              // }
            }}
          >
            <Ionicons
              name="refresh"
              size={24}
              color={colors.primary}
            />

            <Text style={styles.refreshText}>
              걸음 수 새로고침
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
    backgroundColor: '#F7F8FA',
  },

  screen: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.page,
    paddingTop: 12,
    paddingBottom: 32,
  },

  backButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
  },

  pageLabel: {
    marginTop: 24,
    fontSize: 18,
    fontFamily: fonts.semiBold,
    color: colors.primary,
  },

  title: {
    marginTop: 10,
    fontSize: seniorTypography.pageTitle,
    lineHeight: 42,
    fontFamily: fonts.bold,
    color: '#191F28',
  },

  description: {
    marginTop: 12,
    fontSize: 18,
    lineHeight: 28,
    fontFamily: fonts.regular,
    color: '#6B7684',
  },

  stepCard: {
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    padding: 26,
  },

  walkIcon: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: '#EAF5F0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  stepLabel: {
    marginTop: 26,
    fontSize: 18,
    fontFamily: fonts.regular,
    color: '#8B95A1',
  },

  stepCountRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'baseline',
  },

  stepCount: {
    fontSize: 48,
    lineHeight: 58,
    fontFamily: fonts.bold,
    color: '#191F28',
  },

  stepUnit: {
    marginLeft: 6,
    fontSize: 22,
    fontFamily: fonts.bold,
    color: '#191F28',
  },

  progressHeader: {
    marginTop: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  progressLabel: {
    fontSize: 17,
    fontFamily: fonts.medium,
    color: '#6B7684',
  },

  targetText: {
    fontSize: 17,
    fontFamily: fonts.semiBold,
    color: '#191F28',
  },

  progressTrack: {
    marginTop: 12,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#E5E8EB',
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 7,
    backgroundColor: colors.primary,
  },

  remaining: {
    marginTop: 14,
    fontSize: 18,
    lineHeight: 27,
    fontFamily: fonts.regular,
    color: '#6B7684',
  },

  remainingStrong: {
    fontFamily: fonts.bold,
    color: colors.primary,
  },

  bottomArea: {
    gap: 12,
  },

  infoBox: {
    padding: 18,
    borderRadius: 18,
    backgroundColor: '#EEF0F2',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  infoText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    fontFamily: fonts.regular,
    color: '#6B7684',
  },

  refreshButton: {
    minHeight: 60,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },

  refreshText: {
    fontSize: 19,
    fontFamily: fonts.bold,
    color: colors.primary,
  },
});