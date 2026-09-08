import { router } from 'expo-router';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function GuardianWaitingScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.back}>‹</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.centerArea}>
          <View style={styles.iconCircle}>
            <Text style={styles.icon}>✓</Text>
          </View>

          <Text style={styles.title}>
            가족에게 확인을{'\n'}
            요청했어요
          </Text>

          <Text style={styles.description}>
            가족이 거래를 확인하면{'\n'}
            바로 알려드릴게요.
          </Text>

          <View style={styles.transferCard}>
            <View style={styles.row}>
              <Text style={styles.label}>받는 분</Text>
              <Text style={styles.value}>김상우</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>금액</Text>
              <Text style={styles.value}>5,000,000원</Text>
            </View>
          </View>
        </View>

        {/* 현재는 시연용 Mock */}
        <TouchableOpacity
          style={styles.mockButton}
          onPress={() =>
            router.replace('/senior/transfer/guardian-rejected')
          }
        >
          <Text style={styles.mockButtonText}>
            시연용 · 보호자 거절 결과 받기
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },

  content: {
    flex: 1,
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

  centerArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EAF3EE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  icon: {
    fontSize: 30,
    fontWeight: '800',
    color: '#318866',
  },

  title: {
    marginTop: 40,
    fontSize: 30,
    lineHeight: 41,
    fontWeight: '800',
    color: '#191F28',
    textAlign: 'center',
  },

  description: {
    marginTop: 16,
    fontSize: 18,
    lineHeight: 28,
    color: '#8B95A1',
    textAlign: 'center',
  },

  transferCard: {
    width: '100%',
    marginTop: 40,
    padding: 20,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    gap: 16,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  label: {
    fontSize: 18,
    color: '#8B95A1',
  },

  value: {
    fontSize: 18,
    fontWeight: '700',
    color: '#191F28',
  },

  mockButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },

  mockButtonText: {
    fontSize: 14,
    color: '#B0B8C1',
  },
});