import { router } from 'expo-router';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { guardianTypography } from '@/constants/typography';

export default function GuardianHomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.eyebrow}>든든 보호자</Text>

        <Text style={styles.title}>
          김영희님의 금융 안전을{'\n'}
          함께 지켜보고 있어요.
        </Text>

        <View style={styles.summaryCard}>
          <Text style={styles.cardLabel}>오늘 확인할 거래</Text>

          <Text style={styles.number}>1건</Text>

          <Text style={styles.muted}>
            확인이 필요한 송금이 있어요.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.riskCard}
          activeOpacity={0.85}
          onPress={() =>
            router.push('/guardian/transaction/1')
          }
        >
          <View style={styles.row}>
            <Text style={styles.riskLabel}>확인 필요</Text>

            <Text style={styles.arrow}>›</Text>
          </View>

          <Text style={styles.riskTitle}>
            김상우님에게 5,000,000원
          </Text>

          <Text style={styles.muted}>
            처음 보내는 계좌 · 오늘 14:20
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.reportLink}
          activeOpacity={0.85}
          onPress={() =>
            router.push('/guardian/report')
          }
        >
          <Text style={styles.reportText}>
            이번 달 안전 리포트 보기
          </Text>

          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF7',
  },

  scrollView: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 32,
  },

  eyebrow: {
    fontSize: guardianTypography.bodyStrong,
    fontWeight: '700',
    color: '#318866',
    marginBottom: 16,
  },

  title: {
    fontSize: guardianTypography.pageTitle,
    lineHeight: 38,
    fontWeight: '800',
    color: '#191F28',
  },

  summaryCard: {
    marginTop: 32,
    padding: 20,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },

  cardLabel: {
    fontSize: guardianTypography.secondary,
    lineHeight: 24,
    color: '#6B7684',
  },

  number: {
    marginTop: 8,
    fontSize: guardianTypography.amount,
    lineHeight: 46,
    fontWeight: '900',
    color: '#191F28',
  },

  muted: {
    marginTop: 8,
    fontSize: guardianTypography.secondary,
    lineHeight: 24,
    color: '#8B95A1',
  },

  riskCard: {
    marginTop: 16,
    padding: 20,
    borderRadius: 20,
    backgroundColor: '#FFF7F7',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  riskLabel: {
    fontSize: guardianTypography.secondary,
    fontWeight: '800',
    color: '#F04452',
  },

  riskTitle: {
    marginTop: 16,
    fontSize: guardianTypography.bodyStrong,
    lineHeight: 26,
    fontWeight: '800',
    color: '#191F28',
  },

  arrow: {
    fontSize: 28,
    lineHeight: 28,
    color: '#8B95A1',
  },

  reportLink: {
    minHeight: 60,
    marginTop: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  reportText: {
    fontSize: guardianTypography.button,
    fontWeight: '700',
    color: '#191F28',
  },
});