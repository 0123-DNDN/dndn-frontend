import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';
import { fonts, guardianTypography } from '@/constants/typography';

const WEEK_DAYS = ['월', '화', '수', '목', '금', '토', '일'];

function getWeekPeriod() {
  const today = new Date();
  const monday = new Date(today);
  const day = today.getDay();
  const daysSinceMonday = day === 0 ? 6 : day - 1;

  monday.setDate(today.getDate() - daysSinceMonday);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const formatDate = (date: Date) =>
    `${date.getMonth() + 1}월 ${date.getDate()}일`;

  return `${formatDate(monday)} - ${formatDate(sunday)}`;
}

export default function GuardianReportScreen() {
  const weekPeriod = getWeekPeriod();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.pageLabel}>리포트</Text>

          <Text style={styles.pageTitle}>이번 주 활동 리포트</Text>

          <Text style={styles.period}>{weekPeriod}</Text>
        </View>

        <View style={styles.reportCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIcon}>
              <Ionicons
                name="calendar-outline"
                size={23}
                color={colors.primary}
              />
            </View>

            <Text style={styles.cardTitle}>이번 주 활동</Text>
          </View>

          <Text style={styles.statLabel}>활동 완료 일수</Text>

          <Text style={styles.unavailableMainStat}>기록 없음</Text>

          <View style={styles.weekRow}>
            {WEEK_DAYS.map((day) => (
              <View key={day} style={styles.dayItem}>
                <View style={styles.dayCircle}>
                  <View style={styles.emptyDayDot} />
                </View>

                <Text style={styles.dayText}>{day}</Text>
              </View>
            ))}
          </View>

          <EmptyNotice>이번 주 완료 기록을 아직 확인할 수 없어요.</EmptyNotice>
        </View>

        <View style={styles.reportCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIcon}>
              <Ionicons name="mic-outline" size={23} color={colors.primary} />
            </View>

            <Text style={styles.cardTitle}>음성 활동</Text>
          </View>

          <View style={styles.statList}>
            {['말하기 속도', '말 사이 멈춤', '발화량'].map((label, index) => (
              <View key={label}>
                {index > 0 && <View style={styles.rowDivider} />}

                <View style={styles.statRow}>
                  <Text style={styles.statName}>{label}</Text>

                  <Text style={styles.emptyValue}>기록 없음</Text>
                </View>
              </View>
            ))}
          </View>

          <EmptyNotice>
            최근 음성 활동 지표를 아직 확인할 수 없어요.
          </EmptyNotice>
        </View>

        <View style={styles.reportCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIcon}>
              <Ionicons
                name="extension-puzzle-outline"
                size={23}
                color={colors.primary}
              />
            </View>

            <Text style={styles.cardTitle}>인지 활동 기록</Text>
          </View>

          <Text style={styles.statLabel}>이번 주 평균</Text>

          <Text style={styles.unavailableMainStat}>—점</Text>

          <EmptyNotice>
            최근 인지 활동 점수를 아직 확인할 수 없어요.
          </EmptyNotice>
        </View>

        <View style={styles.reportCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIcon}>
              <Ionicons name="walk-outline" size={24} color={colors.primary} />
            </View>

            <Text style={styles.cardTitle}>걷기 활동</Text>
          </View>

          <Text style={styles.statLabel}>이번 주 걸음 기록</Text>

          <Text style={styles.unavailableMainStat}>기록 없음</Text>

          <EmptyNotice>
            이번 주 걸음 수와 완료 일수를 아직 확인할 수 없어요.
          </EmptyNotice>
        </View>

        <View style={styles.guideNotice}>
          <Ionicons
            name="information-circle-outline"
            size={21}
            color="#6B7684"
          />

          <Text style={styles.guideNoticeText}>
            활동 리포트는 수행 결과를 확인하기 위한 참고 정보예요.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function EmptyNotice({ children }: { children: string }) {
  return (
    <View style={styles.noticeBox}>
      <Text style={styles.noticeText}>{children}</Text>
    </View>
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

  statLabel: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.regular,
    color: '#8B95A1',
  },

  unavailableMainStat: {
    marginTop: 5,
    fontSize: 28,
    lineHeight: 38,
    fontFamily: fonts.bold,
    color: '#6B7684',
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

  emptyValue: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: fonts.semiBold,
    color: '#8B95A1',
  },

  rowDivider: {
    height: 1,
    backgroundColor: '#F2F4F6',
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

  guideNotice: {
    marginTop: 4,
    padding: 17,
    borderRadius: 16,
    backgroundColor: '#EEF0F2',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
  },

  guideNoticeText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 21,
    fontFamily: fonts.regular,
    color: '#6B7684',
  },
});
