import { router } from 'expo-router';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const reasons = [
  '처음 보내는 계좌예요',
  '평소보다 큰 금액이에요',
  '검찰 관련 위험 표현이 확인됐어요',
];

export default function FdsWarningScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.back}>‹</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.warningIcon}>
            <Text style={styles.warningIconText}>!</Text>
          </View>

          <Text style={styles.heroText}>
            주의가 필요한{'\n'}
            거래예요
          </Text>

          <Text style={styles.description}>
            지금 송금을 잠시 멈췄어요
          </Text>

          <View style={styles.reasonSection}>
            <Text style={styles.reasonTitle}>
              든든이 이렇게 판단했어요
            </Text>

            {reasons.map((reason) => (
              <View key={reason} style={styles.reasonItem}>
                <View style={styles.dot} />
                <Text style={styles.reasonText}>{reason}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.actionArea}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() =>
              router.push('/senior/transfer/guardian-waiting')
            }
          >
            <Text style={styles.primaryButtonText}>
              가족에게 확인 요청
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.callButton}
            onPress={() => {}}
          >
            <Text style={styles.callButtonText}>
              가족에게 전화하기
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.replace('/senior/home')}
          >
            <Text style={styles.cancelButtonText}>
              송금 취소
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
    backgroundColor: '#FFF7F7',
  },

  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 20,
  },

  header: {
    minHeight: 56,
    justifyContent: 'center',
  },

  back: {
    fontSize: 40,
    color: '#191F28',
  },

  warningIcon: {
    marginTop: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFE5E7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  warningIconText: {
    fontSize: 30,
    fontWeight: '800',
    color: '#F04452',
  },

  heroText: {
    marginTop: 24,
    fontSize: 32,
    lineHeight: 43,
    fontWeight: '800',
    color: '#191F28',
    letterSpacing: -0.6,
  },

  description: {
    marginTop: 12,
    fontSize: 18,
    color: '#6B7684',
  },

  reasonSection: {
    marginTop: 40,
  },

  reasonTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#191F28',
    marginBottom: 16,
  },

  reasonItem: {
    minHeight: 56,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F04452',
    marginRight: 12,
  },

  reasonText: {
    flex: 1,
    fontSize: 18,
    lineHeight: 26,
    color: '#333D4B',
  },

  actionArea: {
    gap: 12,
  },

  callButton: {
    height: 60,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  callButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4E5968',
  },

  primaryButton: {
    height: 60,
    borderRadius: 16,
    backgroundColor: '#318866',
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryButtonText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  cancelButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F04452',
  },
});