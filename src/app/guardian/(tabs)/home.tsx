import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { colors } from '@/constants/colors';
import { getNotifications } from '@/services/notification';
import type { Notification } from '@/types/notification';
import {
  fonts,
  guardianTypography,
} from '@/constants/typography';

const CURRENT_STEPS = 1840;
const TARGET_STEPS = 3000;

export default function GuardianHomeScreen() {
  const [riskNotification, setRiskNotification] =
    useState<Notification | null>(null);

  useFocusEffect(
    useCallback(() => {
      getNotifications()
        .then((notifications) => {
          setRiskNotification(
            notifications.find(
              (notification) =>
                notification.type === 'HIGH_RISK_TRANSFER' &&
                !notification.isRead &&
                notification.relatedTransactionId !== null,
            ) ?? null,
          );
        })
        .catch((error) => {
          console.warn('GUARDIAN NOTIFICATIONS ERROR:', error);
        });
    }, []),
  );

  const hasRiskAlert = riskNotification !== null;

  const cognitiveCompleted = true;
  const voiceCompleted = true;
  const walkingCompleted = false;

  const completedCount = [
    cognitiveCompleted,
    voiceCompleted,
    walkingCompleted,
  ].filter(Boolean).length;

  const walkingProgress = Math.min(
    CURRENT_STEPS / TARGET_STEPS,
    1,
  );

  const handleRiskTransaction = () => {
    if (!riskNotification?.relatedTransactionId) {
      return;
    }

    router.push(
      `/guardian/transaction/${riskNotification.relatedTransactionId}`,
    );
  };

  const handleSendPhoto = () => {
    router.push('/guardian/family-post/create');
  };

  const handleSendMessage = () => {
    // TODO:
    // 응원 메시지 작성 화면 생성 후 연결
    //
    // router.push('/guardian/message/create');
  };

  const handleReport = () => {
    router.push('/guardian/(tabs)/report');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* 페이지 제목 */}
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>
            김영희님의 오늘
          </Text>

          <Text style={styles.pageDescription}>
            오늘의 활동과 금융 상태를 확인해보세요.
          </Text>
        </View>

        {/* 위험 거래 알림 */}
        {hasRiskAlert ? (
          <View style={styles.riskCard}>
            <View style={styles.riskHeader}>
              <View style={styles.riskIcon}>
                <Ionicons
                  name="warning-outline"
                  size={24}
                  color="#F04452"
                />
              </View>

              <Text style={styles.riskLabel}>
                확인이 필요해요
              </Text>
            </View>

            <Text style={styles.riskTitle}>
              확인이 필요한 송금이 있어요
            </Text>

            <Text style={styles.riskDescription}>
              김영희님이 김상우님에게{'\n'}
              5,000,000원을 보내려고 해요.
            </Text>

            <TouchableOpacity
              style={styles.riskButton}
              activeOpacity={0.8}
              onPress={handleRiskTransaction}
            >
              <Text style={styles.riskButtonText}>
                거래 확인하기
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.safeCard}>
            <View>
              <Text style={styles.safeTitle}>
                오늘 확인할 알림이 없어요
              </Text>

              <Text style={styles.safeDescription}>
                필요한 일이 생기면 알려드릴게요.
              </Text>
            </View>

            <View style={styles.safeIcon}>
              <Ionicons
                name="checkmark"
                size={26}
                color={colors.primary}
              />
            </View>
          </View>
        )}

        {/* 오늘의 활동 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>
                오늘의 활동
              </Text>

              <Text style={styles.sectionDescription}>
                김영희님의 오늘 활동 현황이에요.
              </Text>
            </View>

            <View style={styles.activityCountBadge}>
              <Text style={styles.activityCount}>
                {completedCount} / 3
              </Text>
            </View>
          </View>

          <View style={styles.activityCard}>
            {/* 인지 게임 */}
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons
                  name="extension-puzzle-outline"
                  size={22}
                  color={colors.primary}
                />
              </View>

              <View style={styles.activityTextArea}>
                <Text style={styles.activityTitle}>
                  인지 게임
                </Text>

                <Text style={styles.activityDescription}>
                  간단한 인지 활동
                </Text>
              </View>

              {cognitiveCompleted ? (
                <View style={styles.completeStatus}>
                  <Ionicons
                    name="checkmark-circle"
                    size={19}
                    color={colors.primary}
                  />

                  <Text style={styles.completeStatusText}>
                    완료
                  </Text>
                </View>
              ) : (
                <Text style={styles.waitingStatus}>
                  아직
                </Text>
              )}
            </View>

            <View style={styles.divider} />

            {/* 음성 대화 */}
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={21}
                  color={colors.primary}
                />
              </View>

              <View style={styles.activityTextArea}>
                <Text style={styles.activityTitle}>
                  이야기 나누기
                </Text>

                <Text style={styles.activityDescription}>
                  오늘의 음성 대화
                </Text>
              </View>

              {voiceCompleted ? (
                <View style={styles.completeStatus}>
                  <Ionicons
                    name="checkmark-circle"
                    size={19}
                    color={colors.primary}
                  />

                  <Text style={styles.completeStatusText}>
                    완료
                  </Text>
                </View>
              ) : (
                <Text style={styles.waitingStatus}>
                  아직
                </Text>
              )}
            </View>

            <View style={styles.divider} />

            {/* 걷기 */}
            <View style={styles.walkingItem}>
              <View style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Ionicons
                    name="walk-outline"
                    size={23}
                    color={colors.primary}
                  />
                </View>

                <View style={styles.activityTextArea}>
                  <Text style={styles.activityTitle}>
                    오늘 걷기
                  </Text>

                  <Text style={styles.activityDescription}>
                    {CURRENT_STEPS.toLocaleString()}보 /{' '}
                    {TARGET_STEPS.toLocaleString()}보
                  </Text>
                </View>

                {walkingCompleted ? (
                  <View style={styles.completeStatus}>
                    <Ionicons
                      name="checkmark-circle"
                      size={19}
                      color={colors.primary}
                    />

                    <Text style={styles.completeStatusText}>
                      완료
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.progressStatus}>
                    진행 중
                  </Text>
                )}
              </View>

              {!walkingCompleted && (
                <View style={styles.walkingProgressTrack}>
                  <View
                    style={[
                      styles.walkingProgressFill,
                      {
                        width: `${walkingProgress * 100}%`,
                      },
                    ]}
                  />
                </View>
              )}
            </View>
          </View>
        </View>

        {/* 가족과 함께 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            가족과 함께
          </Text>

          <Text style={styles.sectionDescription}>
            사진이나 응원 메시지로 마음을 전해보세요.
          </Text>

          <View style={styles.familyActionList}>
            {/* 사진 보내기 */}
            <TouchableOpacity
              style={styles.familyActionCard}
              activeOpacity={0.8}
              onPress={handleSendPhoto}
            >
              <View style={styles.familyActionIcon}>
                <Ionicons
                  name="image-outline"
                  size={25}
                  color={colors.primary}
                />
              </View>

              <View style={styles.familyActionTextArea}>
                <Text style={styles.familyActionTitle}>
                  부모님께 사진 보내기
                </Text>

                <Text style={styles.familyActionDescription}>
                  오늘의 활동을 모두 마치면{'\n'}
                  부모님이 사진을 볼 수 있어요.
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={22}
                color="#B0B8C1"
              />
            </TouchableOpacity>

            {/* 응원 메시지 */}
            <TouchableOpacity
              style={styles.familyActionCard}
              activeOpacity={0.8}
              onPress={handleSendMessage}
            >
              <View style={styles.familyActionIcon}>
                <Ionicons
                  name="heart-outline"
                  size={25}
                  color={colors.primary}
                />
              </View>

              <View style={styles.familyActionTextArea}>
                <Text style={styles.familyActionTitle}>
                  응원 메시지 보내기
                </Text>

                <Text style={styles.familyActionDescription}>
                  오늘도 힘낼 수 있도록{'\n'}
                  짧은 응원을 전해보세요.
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={22}
                color="#B0B8C1"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* 이번 주 리포트 */}
        <TouchableOpacity
          style={styles.reportButton}
          activeOpacity={0.8}
          onPress={handleReport}
        >
          <View style={styles.reportButtonContent}>
            <Text style={styles.reportButtonTitle}>
              이번 주 리포트
            </Text>

            <Text style={styles.reportButtonDescription}>
              활동과 변화 추이를 확인해보세요
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={23}
            color="#6B7684"
          />
        </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 36,
  },

  /*
   * Header
   */

  titleSection: {
    marginBottom: 24,
  },

  pageTitle: {
    fontSize: guardianTypography.pageTitle,
    lineHeight: 38,
    fontFamily: fonts.bold,
    color: '#191F28',
  },

  pageDescription: {
    marginTop: 6,
    fontSize: guardianTypography.secondary,
    lineHeight: 24,
    fontFamily: fonts.regular,
    color: '#8B95A1',
  },

  /*
   * Risk Alert
   */

  riskCard: {
    padding: 20,
    borderRadius: 20,
    backgroundColor: '#FFF1F3',
    marginBottom: 30,
  },

  riskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  riskIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  riskLabel: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: fonts.bold,
    color: '#F04452',
  },

  riskTitle: {
    marginTop: 16,
    fontSize: 21,
    lineHeight: 29,
    fontFamily: fonts.bold,
    color: '#191F28',
  },

  riskDescription: {
    marginTop: 8,
    fontSize: 16,
    lineHeight: 24,
    fontFamily: fonts.regular,
    color: '#6B4B50',
  },

  riskButton: {
    marginTop: 18,
    height: 52,
    borderRadius: 15,
    backgroundColor: '#F04452',

    alignItems: 'center',
    justifyContent: 'center',
  },

  riskButtonText: {
    fontSize: 17,
    lineHeight: 24,
    fontFamily: fonts.bold,
    color: '#FFFFFF',
  },

  /*
   * Safe State
   */

  safeCard: {
    minHeight: 102,
    padding: 20,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    marginBottom: 30,
  },

  safeTitle: {
    fontSize: 19,
    lineHeight: 27,
    fontFamily: fonts.bold,
    color: '#191F28',
  },

  safeDescription: {
    marginTop: 5,
    fontSize: 15,
    lineHeight: 22,
    fontFamily: fonts.regular,
    color: '#8B95A1',
  },

  safeIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: '#EAF5F0',

    alignItems: 'center',
    justifyContent: 'center',
  },

  /*
   * Section
   */

  section: {
    marginBottom: 30,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',

    marginBottom: 14,
  },

  sectionHeaderText: {
    flex: 1,
    paddingRight: 12,
  },

  sectionTitle: {
    fontSize: guardianTypography.sectionTitle,
    lineHeight: 30,
    fontFamily: fonts.bold,
    color: '#191F28',
  },

  sectionDescription: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.regular,
    color: '#8B95A1',
  },

  /*
   * Activity
   */

  activityCountBadge: {
    paddingHorizontal: 12,
    paddingVertical: 7,

    borderRadius: 12,
    backgroundColor: '#EAF5F0',
  },

  activityCount: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: fonts.bold,
    color: colors.primary,
  },

  activityCard: {
    borderRadius: 20,
    backgroundColor: '#FFFFFF',

    paddingHorizontal: 18,
  },

  activityItem: {
    minHeight: 82,

    flexDirection: 'row',
    alignItems: 'center',
  },

  walkingItem: {
    paddingBottom: 16,
  },

  activityIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,

    backgroundColor: '#EAF5F0',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 13,
  },

  activityTextArea: {
    flex: 1,
  },

  activityTitle: {
    fontSize: 17,
    lineHeight: 25,
    fontFamily: fonts.bold,
    color: '#191F28',
  },

  activityDescription: {
    marginTop: 2,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.regular,
    color: '#8B95A1',
  },

  completeStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  completeStatusText: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: fonts.semiBold,
    color: colors.primary,
  },

  waitingStatus: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: fonts.medium,
    color: '#8B95A1',
  },

  progressStatus: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: fonts.semiBold,
    color: colors.primary,
  },

  divider: {
    height: 1,
    backgroundColor: '#F2F4F6',
  },

  walkingProgressTrack: {
    height: 8,
    borderRadius: 4,

    backgroundColor: '#E5E8EB',

    overflow: 'hidden',
  },

  walkingProgressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: colors.primary,
  },

  /*
   * Family Actions
   */

  familyActionList: {
    marginTop: 14,
    gap: 12,
  },

  familyActionCard: {
    minHeight: 102,

    paddingHorizontal: 18,
    paddingVertical: 16,

    borderRadius: 20,
    backgroundColor: '#FFFFFF',

    flexDirection: 'row',
    alignItems: 'center',
  },

  familyActionIcon: {
    width: 48,
    height: 48,

    borderRadius: 16,
    backgroundColor: '#EAF5F0',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 14,
  },

  familyActionTextArea: {
    flex: 1,
    paddingRight: 8,
  },

  familyActionTitle: {
    fontSize: 17,
    lineHeight: 25,
    fontFamily: fonts.bold,
    color: '#191F28',
  },

  familyActionDescription: {
    marginTop: 3,
    fontSize: 14,
    lineHeight: 21,
    fontFamily: fonts.regular,
    color: '#8B95A1',
  },

  /*
   * Report
   */

  reportButton: {
    minHeight: 82,

    paddingHorizontal: 20,
    paddingVertical: 16,

    borderRadius: 20,
    backgroundColor: '#FFFFFF',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  reportButtonContent: {
    flex: 1,
    paddingRight: 12,
  },

  reportButtonTitle: {
    fontSize: 18,
    lineHeight: 26,
    fontFamily: fonts.bold,
    color: '#191F28',
  },

  reportButtonDescription: {
    marginTop: 3,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.regular,
    color: '#8B95A1',
  },
});