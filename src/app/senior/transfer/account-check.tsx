import { router } from 'expo-router';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function TransferAccountCheckScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View>
          <Text style={styles.title}>돈 보내기</Text>

          <Text style={styles.question}>
            이 통장에서{'\n'}
            돈을 보내시겠어요?
          </Text>

          <View style={styles.accountCard}>
            <Text style={styles.accountName}>KB 국민 든든통장</Text>
            <Text style={styles.accountNumber}>123456-01-****</Text>

            <View style={styles.balanceRow}>
              <Text style={styles.label}>잔액</Text>
              <Text style={styles.balance}>3,450,000원</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomArea}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => {}}
          >
            <Text style={styles.secondaryButtonText}>
              다른 통장 선택
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/senior/transfer/request')}
          >
            <Text style={styles.primaryButtonText}>맞아요</Text>
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

  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#191F28',
  },

  question: {
    marginTop: 40,
    fontSize: 32,
    lineHeight: 42,
    fontWeight: '800',
    color: '#191F28',
  },

  accountCard: {
    marginTop: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
  },

  accountName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#191F28',
  },

  accountNumber: {
    marginTop: 12,
    fontSize: 18,
    color: '#8B95A1',
  },

  balanceRow: {
    marginTop: 40,
  },

  label: {
    fontSize: 18,
    color: '#8B95A1',
  },

  balance: {
    marginTop: 8,
    fontSize: 34,
    fontWeight: '800',
    color: '#191F28',
  },

  bottomArea: {
    gap: 12,
  },

  secondaryButton: {
    height: 60,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  secondaryButtonText: {
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
});