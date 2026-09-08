import { Ionicons } from '@expo/vector-icons';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '@/constants/colors';
import {
  fonts,
  guardianTypography,
} from '@/constants/typography';

const weeklyActivity = [
  { day: '월', completed: true },
  { day: '화', completed: true },
  { day: '수', completed: false },
  { day: '목', completed: true },
  { day: '금', completed: true },
  { day: '토', completed: false },
  { day: '일', completed: true },
];

const cognitiveTrend = [66, 72, 70, 68];

export default function GuardianReportScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.pageLabel}>
            리포트
          </Text>

          <Text style={styles.pageTitle}>
            김영희님의{'\n'}
            이번 주 리포트
          </Text>

          <Text style={styles.period}>
            9월 1일 - 9월 7일
          </Text>
        </View>

        {/* 이번 주 활동 */}
        <View style={styles.reportCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIcon}>
              <Ionicons
                name="calendar-outline"
                size={23}
                color={colors.primary}
              />
            </View>

            <Text style={styles.cardTitle}>
              이번 주 활동
            </Text>
          </View>

          <View style={styles.mainStatRow}>
            <View>
              <Text style={styles.statLabel}>
                활동 참여
              </Text>

              <Text style={styles.mainStat}>
                5일 / 7일
              </Text>
            </View>

            <View style={styles.todayActivity}>
              <Text style={styles.todayActivityLabel}>
                오늘
              </Text>

              <Text style={styles.todayActivityValue}>
                2 / 3 완료
              </Text>
            </View>
          </View>

          <View style={styles.weekRow}>
            {weeklyActivity.map((item) => (
              <View
                key={item.day}
                style={styles.dayItem}
              >
                <View
                  style={[
                    styles.dayCircle,
                    item.completed &&
                      styles.dayCircleCompleted,
                  ]}
                >
                  {item.completed ? (
                    <Ionicons
                      name="checkmark"
                      size={17}
                      color="#FFFFFF"
                    />
                  ) : (
                    <View style={styles.emptyDayDot} />
                  )}
                </View>

                <Text style={styles.dayText}>
                  {item.day}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.noticeBox}>
            <Text style={styles.noticeText}>
              이번 주에는 7일 중 5일 활동에 참여했어요.
            </Text>
          </View>
        </View>

        {/* 인지 활동 */}
        <View style={styles.reportCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIcon}>
              <Ionicons
                name="extension-puzzle-outline"
                size={23}
                color={colors.primary}
              />
            </View>

            <Text style={styles.cardTitle}>
              인지 활동 변화
            </Text>
          </View>

          <View style={styles.statList}>
            <View style={styles.statRow}>
              <Text style={styles.statName}>
                기억 활동
              </Text>

              <Text style={styles.stableStatus}>
                큰 변화 없음
              </Text>
            </View>

            <View style={styles.rowDivider} />

            <View style={styles.statRow}>
              <Text style={styles.statName}>
                언어 활동
              </Text>

              <Text style={styles.stableStatus}>
                지난주와 비슷함
              </Text>
            </View>

            <View style={styles.rowDivider} />

            <View style={styles.statRow}>
              <Text style={styles.statName}>
                판단 활동
              </Text>

              <Text style={styles.watchStatus}>
                조금 느려짐
              </Text>
            </View>
          </View>

          <View style={styles.chartArea}>
            <View style={styles.barRow}>
              {cognitiveTrend.map((value, index) => (
                <View
                  key={index}
                  style={styles.barWrapper}
                >
                  <View
                    style={[
                      styles.bar,
                      {
                        height: value,
                      },
                    ]}
                  />
                </View>
              ))}
            </View>

            <View style={styles.axisRow}>
              <Text style={styles.axisText}>1주</Text>
              <Text style={styles.axisText}>2주</Text>
              <Text style={styles.axisText}>3주</Text>
              <Text style={styles.axisText}>4주</Text>
            </View>
          </View>

          <View style={styles.noticeBox}>
            <Text style={styles.noticeText}>
              최근 4주간 전반적인 활동 변화는 크지 않아요.
            </Text>
          </View>
        </View>

        {/* 음성 변화 */}
        <View style={styles.reportCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIcon}>
              <Ionicons
                name="mic-outline"
                size={23}
                color={colors.primary}
              />
            </View>

            <Text style={styles.cardTitle}>
              음성 변화
            </Text>
          </View>

          <View style={styles.statList}>
            <View style={styles.statRow}>
              <Text style={styles.statName}>
                말하기 속도
              </Text>

              <Text style={styles.watchStatus}>
                조금 느려짐
              </Text>
            </View>

            <View style={styles.rowDivider} />

            <View style={styles.statRow}>
              <Text style={styles.statName}>
                말 사이 멈춤
              </Text>

              <Text style={styles.watchStatus}>
                조금 늘어남
              </Text>
            </View>

            <View style={styles.rowDivider} />

            <View style={styles.statRow}>
              <Text style={styles.statName}>
                음성 안정성
              </Text>

              <Text style={styles.stableStatus}>
                큰 변화 없음
              </Text>
            </View>
          </View>

          <View style={styles.noticeBox}>
            <Text style={styles.noticeText}>
              최근 활동에서 평소보다 말 사이의 멈춤이
              조금 길어진 경향이 있어요.
            </Text>
          </View>
        </View>

        {/* 걷기 */}
        <View style={styles.reportCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIcon}>
              <Ionicons
                name="walk-outline"
                size={24}
                color={colors.primary}
              />
            </View>

            <Text style={styles.cardTitle}>
              걷기 활동
            </Text>
          </View>

          <View style={styles.walkSummary}>
            <View>
              <Text style={styles.statLabel}>
                목표 달성
              </Text>

              <Text style={styles.walkCount}>
                이번 주 4회
              </Text>
            </View>

            <View style={styles.walkBadge}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={colors.primary}
              />

              <Text style={styles.walkBadgeText}>
                지난주와 비슷해요
              </Text>
            </View>
          </View>

          <View style={styles.noticeBox}>
            <Text style={styles.noticeText}>
              무리하지 않고 꾸준히 활동에 참여하고 있어요.
            </Text>
          </View>
        </View>

        {/* 안내 */}
        <View style={styles.medicalNotice}>
          <Ionicons
            name="information-circle-outline"
            size={21}
            color="#6B7684"
          />

          <Text style={styles.medicalNoticeText}>
            이 정보는 의료적 진단을 위한 정보가 아니며,
            일상적인 변화 추이를 확인하기 위한 참고 정보예요.
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 36,
  },

  header: {
    marginBottom: 26,
  },

  pageLabel: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: fonts.semiBold,
    color: colors.primary,
  },

  pageTitle: {
    marginTop: 7,
    fontSize: guardianTypography.pageTitle,
    lineHeight: 38,
    fontFamily: fonts.bold,
    color: '#191F28',
  },

  period: {
    marginTop: 8,
    fontSize: guardianTypography.secondary,
    lineHeight: 24,
    fontFamily: fonts.regular,
    color: '#8B95A1',
  },

  reportCard: {
    padding: 20,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },

  cardIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#EAF5F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  cardTitle: {
    fontSize: 20,
    lineHeight: 28,
    fontFamily: fonts.bold,
    color: '#191F28',
  },

  mainStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },

  statLabel: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.regular,
    color: '#8B95A1',
  },

  mainStat: {
    marginTop: 5,
    fontSize: 30,
    lineHeight: 38,
    fontFamily: fonts.bold,
    color: '#191F28',
  },

  todayActivity: {
    alignItems: 'flex-end',
  },

  todayActivityLabel: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: '#8B95A1',
  },

  todayActivityValue: {
    marginTop: 5,
    fontSize: 17,
    fontFamily: fonts.bold,
    color: colors.primary,
  },

  weekRow: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  dayItem: {
    alignItems: 'center',
    gap: 7,
  },

  dayCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F2F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  dayCircleCompleted: {
    backgroundColor: colors.primary,
  },

  emptyDayDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#B0B8C1',
  },

  dayText: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: '#6B7684',
  },

  statList: {
    gap: 0,
  },

  statRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  statName: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: fonts.medium,
    color: '#333D4B',
  },

  stableStatus: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: fonts.semiBold,
    color: colors.primary,
  },

  watchStatus: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: fonts.semiBold,
    color: '#D97706',
  },

  rowDivider: {
    height: 1,
    backgroundColor: '#F2F4F6',
  },

  chartArea: {
    marginTop: 24,
  },

  barRow: {
    height: 92,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
  },

  barWrapper: {
    width: 34,
    height: 82,
    justifyContent: 'flex-end',
  },

  bar: {
    width: '100%',
    borderRadius: 8,
    backgroundColor: '#8FC4AE',
  },

  axisRow: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  axisText: {
    width: 34,
    textAlign: 'center',
    fontSize: 12,
    fontFamily: fonts.medium,
    color: '#8B95A1',
  },

  noticeBox: {
    marginTop: 20,
    padding: 16,
    borderRadius: 15,
    backgroundColor: '#F7F8FA',
  },

  noticeText: {
    fontSize: 15,
    lineHeight: 23,
    fontFamily: fonts.regular,
    color: '#6B7684',
  },

  walkSummary: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },

  walkCount: {
    marginTop: 5,
    fontSize: 24,
    lineHeight: 32,
    fontFamily: fonts.bold,
    color: '#191F28',
  },

  walkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  walkBadgeText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.primary,
  },

  medicalNotice: {
    marginTop: 4,
    padding: 17,
    borderRadius: 16,
    backgroundColor: '#EEF0F2',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
  },

  medicalNoticeText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 21,
    fontFamily: fonts.regular,
    color: '#6B7684',
  },
});