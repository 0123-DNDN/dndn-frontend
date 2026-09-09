import { Ionicons } from '@expo/vector-icons';
import {
  router,
  useFocusEffect,
} from 'expo-router';
import {
  useCallback,
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

import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import {
  fonts,
  seniorTypography,
} from '@/constants/typography';
import {
  getTodayActivities,
} from '@/services/activity';
import { getTodayStepCount } from '@/services/healthConnect';
import type {
  TodayActivityResponse,
} from '@/types/activity';

export default function ActivityScreen() {
  const [activities, setActivities] = useState<
    TodayActivityResponse[]
  >([]);

  const [stepCount, setStepCount] = useState(0);

  const loadActivities = useCallback(async () => {
    try {
      const result = await getTodayActivities();
      setActivities(result);
    } catch (error) {
      console.log('ACTIVITY LOAD ERROR:', error);
    }
  }, []);

  const loadStepCount = useCallback(async () => {
    try {
      const result = await getTodayStepCount();

      if (result !== null) {
        setStepCount(result);
      }
    } catch (error) {
      console.log('HEALTH CONNECT STEPS ERROR:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadActivities();
      void loadStepCount();
    }, [loadActivities, loadStepCount]),
  );

  const cognitiveActivity = activities.find(
    (item) => item.activityType === 'COGNITIVE_GAME',
  );

  const voiceActivity = activities.find(
    (item) => item.activityType === 'VOICE_TALK',
  );

  const walkingActivity = activities.find(
    (item) => item.activityType === 'WALKING',
  );

  const cognitiveCompleted =
    cognitiveActivity?.completed ?? false;

  const voiceCompleted =
    voiceActivity?.completed ?? false;

  const walkingCompleted =
    walkingActivity?.completed ?? false;

  const completedCount = [
    cognitiveCompleted,
    voiceCompleted,
    walkingCompleted,
  ].filter(Boolean).length;

  const allCompleted = completedCount === 3;

  const walkingTarget =
    walkingActivity?.targetValue ?? 3000;

  const currentSteps =
    stepCount;

  const walkingProgress = Math.min(
    currentSteps / walkingTarget,
    1,
  );

  const remainingSteps = Math.max(
    walkingTarget - currentSteps,
    0,
  );

  const remainingActivities = Math.max(
    3 - completedCount,
    0,
  );

  const handleCognitiveGame = () => {
    router.push('/senior/activity/cognitive');
  };

  const handleVoiceTalk = () => {
    router.push('/senior/activity/voice');
  };

  const handleWalking = () => {
    router.push('/senior/activity/walking');
  };

  const handleFamilyPhoto = () => {
    if (!allCompleted) return;

    router.push('/senior/family-news');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* 상단 소개 */}
        <View style={styles.heroSection}>
          {/* <Text style={styles.pageLabel}>
            오늘의 활동
          </Text> */}

          <Text style={styles.heroTitle}>
            오늘의 활동,{'\n'}
            하나씩 해볼까요?
          </Text>

          {/* <Text style={styles.heroDescription}>
            부담 없이 세 가지 활동을
            천천히 해보세요.
          </Text> */}
        </View>

        {/* 오늘 완료 현황 */}
        <View style={styles.summaryCard}>
          <View>
            <Text style={styles.summaryLabel}>
              오늘 완료한 활동
            </Text>

            <View style={styles.summaryCountRow}>
              <Text style={styles.summaryCount}>
                {completedCount}
              </Text>

              <Text style={styles.summaryTotal}>
                / 3
              </Text>
            </View>

            {!allCompleted && (
              <Text style={styles.summaryHint}>
                가족의 오늘 사진까지{' '}
                {remainingActivities}개 남았어요
              </Text>
            )}

            {allCompleted && (
              <Text style={styles.summaryCompletedHint}>
                오늘 활동을 모두 완료했어요
              </Text>
            )}
          </View>

          <View style={styles.summaryIcon}>
            <Ionicons
              name={
                allCompleted
                  ? 'checkmark-circle'
                  : 'checkmark'
              }
              size={32}
              color={colors.primary}
            />
          </View>
        </View>

        {/* 가족 소식 */}
        <View style={styles.familySection}>
          <Text style={styles.sectionTitle}>
            오늘의 가족 소식
          </Text>

          {!allCompleted ? (
            <View style={styles.familyLockedCard}>
              <View style={styles.familyLockedTop}>
                <View style={styles.lockIconBox}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={28}
                    color={colors.primary}
                  />
                </View>

                <View style={styles.familyLockedTitleArea}>
                  <Text style={styles.familyLockedTitle}>
                    가족이 사진을 보냈어요
                  </Text>

                  <Text style={styles.familyLockedStatus}>
                    아직 잠겨 있어요
                  </Text>
                </View>
              </View>

              <Text style={styles.familyLockedDescription}>
                오늘의 활동 3가지를 모두 마치면{'\n'}
                가족이 보낸 사진을 확인할 수 있어요.
              </Text>

              <View style={styles.lockedPhotoPreview}>
                <Ionicons
                  name="image-outline"
                  size={42}
                  color="#B0B8C1"
                />

                <Text style={styles.lockedPhotoText}>
                  가족 사진
                </Text>
              </View>

              <View style={styles.familyProgressRow}>
                <Text style={styles.familyProgressText}>
                  현재 {completedCount} / 3 완료
                </Text>

                <Text style={styles.familyRemainingText}>
                  {remainingActivities}개 남았어요
                </Text>
              </View>

              <View style={styles.familyProgressTrack}>
                <View
                  style={[
                    styles.familyProgressFill,
                    {
                      width: `${
                        (completedCount / 3) * 100
                      }%`,
                    },
                  ]}
                />
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.familyUnlockedCard}
              activeOpacity={0.85}
              onPress={handleFamilyPhoto}
            >
              <View style={styles.familyUnlockedHeader}>
                <View style={styles.unlockedIconBox}>
                  <Ionicons
                    name="heart-outline"
                    size={28}
                    color={colors.primary}
                  />
                </View>

                <View style={styles.familyUnlockedTitleArea}>
                  <Text style={styles.familyUnlockedTitle}>
                    가족이 보낸 사진이 도착했어요
                  </Text>

                  <Text style={styles.familyUnlockedStatus}>
                    오늘 활동 완료
                  </Text>
                </View>
              </View>

              <View style={styles.photoArea}>
                <View style={styles.photoPlaceholder}>
                  <Ionicons
                    name="image-outline"
                    size={46}
                    color="#8B95A1"
                  />

                  <Text style={styles.photoPlaceholderText}>
                    가족 사진
                  </Text>
                </View>
              </View>

              <Text style={styles.familyMessage}>
                오늘 엄마가 좋아하는 꽃이 피었어요 🌷
              </Text>

              <View style={styles.viewPhotoRow}>
                <Text style={styles.viewPhotoText}>
                  사진 크게 보기
                </Text>

                <Ionicons
                  name="chevron-forward"
                  size={21}
                  color={colors.primary}
                />
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* 활동 목록 */}
        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>
            오늘 할 활동
          </Text>

          {/* 인지 게임 */}
          <View style={styles.activityCard}>
            <View style={styles.cardHeader}>
              <View style={styles.iconBox}>
                <Ionicons
                  name="extension-puzzle-outline"
                  size={29}
                  color={colors.primary}
                />
              </View>

              <View style={styles.cardTitleArea}>
                <Text style={styles.cardTitle}>
                  인지 게임
                </Text>

                {cognitiveCompleted ? (
                  <View style={styles.completedStatus}>
                    <Ionicons
                      name="checkmark-circle"
                      size={21}
                      color={colors.primary}
                    />

                    <Text style={styles.completedStatusText}>
                      완료했어요
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.statusWaiting}>
                    아직 안 했어요
                  </Text>
                )}
              </View>
            </View>

            <Text style={styles.cardDescription}>
              간단한 문제를 풀면서{'\n'}
              머리를 가볍게 깨워봐요.
            </Text>

            {!cognitiveCompleted && (
              <TouchableOpacity
                style={styles.primaryButton}
                activeOpacity={0.8}
                onPress={handleCognitiveGame}
              >
                <Text style={styles.primaryButtonText}>
                  게임 시작하기
                </Text>

                <Ionicons
                  name="chevron-forward"
                  size={22}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            )}

            {cognitiveCompleted && (
              <View style={styles.completedMessage}>
                <Ionicons
                  name="checkmark"
                  size={22}
                  color={colors.primary}
                />

                <Text style={styles.completedMessageText}>
                  오늘의 인지 게임을 완료했어요
                </Text>
              </View>
            )}
          </View>

          {/* 음성 대화 */}
          <View
            style={[
              styles.activityCard,
              voiceCompleted &&
                styles.completedCard,
            ]}
          >
            <View style={styles.cardHeader}>
              <View style={styles.iconBox}>
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={28}
                  color={colors.primary}
                />
              </View>

              <View style={styles.cardTitleArea}>
                <Text style={styles.cardTitle}>
                  이야기 나누기
                </Text>

                {voiceCompleted ? (
                  <View style={styles.completedStatus}>
                    <Ionicons
                      name="checkmark-circle"
                      size={21}
                      color={colors.primary}
                    />

                    <Text style={styles.completedStatusText}>
                      완료했어요
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.statusWaiting}>
                    아직 안 했어요
                  </Text>
                )}
              </View>
            </View>

            <Text style={styles.cardDescription}>
              오늘의 질문에 편하게 이야기하며{'\n'}
              하루를 돌아봐요.
            </Text>

            {voiceCompleted ? (
              <TouchableOpacity
                style={styles.completedMessage}
                activeOpacity={0.75}
                onPress={handleVoiceTalk}
              >
                <Ionicons
                  name="checkmark"
                  size={22}
                  color={colors.primary}
                />

                <Text style={styles.completedMessageText}>
                  오늘의 이야기를 잘 나눴어요
                </Text>

                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.primary}
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.primaryButton}
                activeOpacity={0.8}
                onPress={handleVoiceTalk}
              >
                <Text style={styles.primaryButtonText}>
                  이야기 시작하기
                </Text>

                <Ionicons
                  name="chevron-forward"
                  size={22}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            )}
          </View>

          {/* 걷기 */}
          <TouchableOpacity
            style={[
              styles.activityCard,
              walkingCompleted &&
                styles.completedCard,
            ]}
            activeOpacity={0.8}
            onPress={handleWalking}
          >
            <View style={styles.cardHeader}>
              <View style={styles.iconBox}>
                <Ionicons
                  name="walk-outline"
                  size={30}
                  color={colors.primary}
                />
              </View>

              <View style={styles.cardTitleArea}>
                <Text style={styles.cardTitle}>
                  걷기
                </Text>

                {walkingCompleted ? (
                  <View style={styles.completedStatus}>
                    <Ionicons
                      name="checkmark-circle"
                      size={21}
                      color={colors.primary}
                    />

                    <Text style={styles.completedStatusText}>
                      완료했어요
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.statusProgress}>
                    걷는 중이에요
                  </Text>
                )}
              </View>

              <Ionicons
                name="chevron-forward"
                size={24}
                color="#B0B8C1"
              />
            </View>

            <Text style={styles.cardDescription}>
              평소처럼 걸으면 걸음 수가{'\n'}
              자동으로 기록돼요.
            </Text>

            <View style={styles.walkingArea}>
              <View style={styles.stepRow}>
                <View style={styles.currentStepArea}>
                  <Text style={styles.currentSteps}>
                    {currentSteps.toLocaleString()}
                  </Text>

                  <Text style={styles.stepUnit}>
                    보
                  </Text>
                </View>

                <Text style={styles.targetSteps}>
                  목표 {walkingTarget.toLocaleString()}보
                </Text>
              </View>

              <View style={styles.progressBackground}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${walkingProgress * 100}%`,
                    },
                  ]}
                />
              </View>

              {!walkingCompleted && (
                <Text style={styles.remainingText}>
                  목표까지{' '}
                  <Text style={styles.remainingStrong}>
                    {remainingSteps.toLocaleString()}보
                  </Text>
                  {' '}남았어요
                </Text>
              )}

              {walkingCompleted && (
                <Text style={styles.walkingCompletedText}>
                  오늘의 걷기 목표를 완료했어요
                </Text>
              )}
            </View>

            <View style={styles.syncNotice}>
              <Ionicons
                name="sync-outline"
                size={20}
                color="#6B7684"
              />

              <Text style={styles.syncNoticeText}>
                걸음 수는 자동으로 반영돼요
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* 안내 */}
        <View style={styles.guideBox}>
          <Ionicons
            name="information-circle-outline"
            size={24}
            color="#6B7684"
          />

          <Text style={styles.guideText}>
            세 가지 활동은 순서와 상관없이
            편한 시간에 할 수 있어요.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },

  content: {
    paddingHorizontal: spacing.page,
    paddingTop: 24,
    paddingBottom: 40,
  },

  heroSection: {
    marginBottom: 28,
  },

  pageLabel: {
    fontSize: 18,
    lineHeight: 26,
    fontFamily: fonts.semiBold,
    color: colors.primary,
    marginBottom: 8,
  },

  heroTitle: {
    fontSize: seniorTypography.pageTitle,
    lineHeight: 42,
    fontFamily: fonts.bold,
    color: '#191F28',
  },

  heroDescription: {
    marginTop: 12,
    fontSize: 18,
    lineHeight: 27,
    fontFamily: fonts.regular,
    color: '#8B95A1',
  },

  summaryCard: {
    minHeight: 142,
    paddingHorizontal: 24,
    paddingVertical: 22,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    marginBottom: 34,
  },

  summaryLabel: {
    fontSize: 18,
    lineHeight: 26,
    fontFamily: fonts.regular,
    color: '#6B7684',
  },

  summaryCountRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'baseline',
  },

  summaryCount: {
    fontSize: 36,
    lineHeight: 44,
    fontFamily: fonts.bold,
    color: '#191F28',
  },

  summaryTotal: {
    marginLeft: 4,
    fontSize: 22,
    lineHeight: 30,
    fontFamily: fonts.semiBold,
    color: '#8B95A1',
  },

  summaryHint: {
    marginTop: 6,
    fontSize: 16,
    lineHeight: 23,
    fontFamily: fonts.medium,
    color: '#6B7684',
  },

  summaryCompletedHint: {
    marginTop: 6,
    fontSize: 16,
    lineHeight: 23,
    fontFamily: fonts.semiBold,
    color: colors.primary,
  },

  summaryIcon: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: '#EAF5F0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  familySection: {
    marginBottom: 36,
  },

  sectionTitle: {
    marginBottom: 14,
    fontSize: 28,
    lineHeight: 38,
    fontFamily: fonts.bold,
    color: '#191F28',
  },

  familyLockedCard: {
    padding: 24,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
  },

  familyLockedTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  lockIconBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#EAF5F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },

  familyLockedTitleArea: {
    flex: 1,
  },

  familyLockedTitle: {
    fontSize: 22,
    lineHeight: 30,
    fontFamily: fonts.bold,
    color: '#191F28',
  },

  familyLockedStatus: {
    marginTop: 4,
    fontSize: 16,
    lineHeight: 23,
    fontFamily: fonts.medium,
    color: '#8B95A1',
  },

  familyLockedDescription: {
    marginTop: 20,
    fontSize: 18,
    lineHeight: 28,
    fontFamily: fonts.regular,
    color: '#6B7684',
  },

  lockedPhotoPreview: {
    height: 150,
    marginTop: 22,
    borderRadius: 20,
    backgroundColor: '#F2F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  lockedPhotoText: {
    fontSize: 17,
    lineHeight: 24,
    fontFamily: fonts.medium,
    color: '#8B95A1',
  },

  familyProgressRow: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  familyProgressText: {
    fontSize: 16,
    lineHeight: 23,
    fontFamily: fonts.semiBold,
    color: '#191F28',
  },

  familyRemainingText: {
    fontSize: 16,
    lineHeight: 23,
    fontFamily: fonts.medium,
    color: '#8B95A1',
  },

  familyProgressTrack: {
    height: 10,
    marginTop: 10,
    borderRadius: 5,
    backgroundColor: '#E5E8EB',
    overflow: 'hidden',
  },

  familyProgressFill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: colors.primary,
  },

  familyUnlockedCard: {
    padding: 24,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D7EDE4',
  },

  familyUnlockedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  unlockedIconBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#EAF5F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },

  familyUnlockedTitleArea: {
    flex: 1,
  },

  familyUnlockedTitle: {
    fontSize: 22,
    lineHeight: 30,
    fontFamily: fonts.bold,
    color: '#191F28',
  },

  familyUnlockedStatus: {
    marginTop: 4,
    fontSize: 16,
    lineHeight: 23,
    fontFamily: fonts.semiBold,
    color: colors.primary,
  },

  photoArea: {
    marginTop: 22,
  },

  photoPlaceholder: {
    height: 190,
    borderRadius: 20,
    backgroundColor: '#F2F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  photoPlaceholderText: {
    fontSize: 17,
    lineHeight: 24,
    fontFamily: fonts.medium,
    color: '#8B95A1',
  },

  familyMessage: {
    marginTop: 18,
    fontSize: 18,
    lineHeight: 28,
    fontFamily: fonts.regular,
    color: '#333D4B',
  },

  viewPhotoRow: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  viewPhotoText: {
    fontSize: 18,
    lineHeight: 26,
    fontFamily: fonts.bold,
    color: colors.primary,
  },

  activitySection: {
    gap: 16,
  },

  activityCard: {
    padding: 24,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
  },

  completedCard: {
    borderWidth: 1,
    borderColor: '#D7EDE4',
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#EAF5F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },

  cardTitleArea: {
    flex: 1,
  },

  cardTitle: {
    fontSize: 23,
    lineHeight: 31,
    fontFamily: fonts.bold,
    color: '#191F28',
  },

  statusWaiting: {
    marginTop: 3,
    fontSize: 16,
    lineHeight: 23,
    fontFamily: fonts.medium,
    color: '#8B95A1',
  },

  statusProgress: {
    marginTop: 3,
    fontSize: 16,
    lineHeight: 23,
    fontFamily: fonts.medium,
    color: colors.primary,
  },

  completedStatus: {
    marginTop: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  completedStatusText: {
    fontSize: 16,
    lineHeight: 23,
    fontFamily: fonts.semiBold,
    color: colors.primary,
  },

  cardDescription: {
    marginTop: 20,
    fontSize: 18,
    lineHeight: 28,
    fontFamily: fonts.regular,
    color: '#6B7684',
  },

  primaryButton: {
    height: 60,
    marginTop: 22,
    borderRadius: 18,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  primaryButtonText: {
    fontSize: 20,
    lineHeight: 28,
    fontFamily: fonts.bold,
    color: '#FFFFFF',
  },

  completedMessage: {
    minHeight: 56,
    marginTop: 22,
    paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: '#EAF5F0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  completedMessageText: {
    flex: 1,
    fontSize: 17,
    lineHeight: 25,
    fontFamily: fonts.semiBold,
    color: '#318866',
  },

  walkingArea: {
    marginTop: 24,
  },

  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },

  currentStepArea: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },

  currentSteps: {
    fontSize: 36,
    lineHeight: 44,
    fontFamily: fonts.bold,
    color: '#191F28',
  },

  stepUnit: {
    marginLeft: 4,
    fontSize: 20,
    lineHeight: 28,
    fontFamily: fonts.semiBold,
    color: '#191F28',
  },

  targetSteps: {
    paddingBottom: 3,
    fontSize: 17,
    lineHeight: 24,
    fontFamily: fonts.medium,
    color: '#6B7684',
  },

  progressBackground: {
    width: '100%',
    height: 12,
    marginTop: 16,
    borderRadius: 6,
    backgroundColor: '#E5E8EB',
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 6,
    backgroundColor: colors.primary,
  },

  remainingText: {
    marginTop: 12,
    fontSize: 17,
    lineHeight: 25,
    fontFamily: fonts.regular,
    color: '#6B7684',
  },

  remainingStrong: {
    fontFamily: fonts.bold,
    color: '#191F28',
  },

  walkingCompletedText: {
    marginTop: 12,
    fontSize: 17,
    lineHeight: 25,
    fontFamily: fonts.semiBold,
    color: colors.primary,
  },

  syncNotice: {
    minHeight: 52,
    marginTop: 20,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#F7F8FA',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  syncNoticeText: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: fonts.regular,
    color: '#6B7684',
  },

  guideBox: {
    marginTop: 24,
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderRadius: 18,
    backgroundColor: '#EEF0F2',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },

  guideText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 25,
    fontFamily: fonts.regular,
    color: '#6B7684',
  },
});
