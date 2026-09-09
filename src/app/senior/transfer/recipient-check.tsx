import { router } from 'expo-router';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function RecipientCheckScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.back}>‹</Text>
          </TouchableOpacity>

          <TouchableOpacity>
            <Text style={styles.cancel}>취소</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.centerArea}>
          <Text style={styles.heroText}>
            박윤아님에게{'\n'}
            500,000원을{'\n'}
            보내시겠어요?
          </Text>

          <View style={styles.recipientCard}>
            <Text style={styles.name}>박윤아</Text>
            <Text style={styles.detail}>KB국민은행</Text>
            <Text style={styles.detail}>123-***-8890</Text>
          </View>

          <View style={styles.accountCard}>
            <Text style={styles.accountLabel}>출금계좌</Text>
            <Text style={styles.accountName}>KB 국민 든든통장</Text>
            <Text style={styles.accountDetail}>123456-01-**** · 잔액 3,450,000원</Text>
          </View>
        </View>

        <View>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() =>
              router.push({
                pathname: '/senior/transfer/purpose',
                params: { risk: 'false' },
              })
            }
          >
            <Text style={styles.primaryButtonText}>맞아요</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.secondaryButtonText}>
              다른 사람에게 보낼게요
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

  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },

  header: {
    minHeight: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  back: {
    fontSize: 40,
    color: '#191F28',
  },

  cancel: {
    fontSize: 18,
    color: '#4E5968',
  },

  centerArea: {
    alignItems: 'center',
  },

  heroText: {
    marginTop: 80,
    fontSize: 32,
    lineHeight: 43,
    fontWeight: '700',
    textAlign: 'center',
    color: '#191F28',
  },

  recipientCard: {
    marginTop: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    alignItems: 'center',
  },

  accountCard: {
    marginTop: 12,
    backgroundColor: '#EAF3EE',
    borderRadius: 20,
    padding: 16,
    width: '100%',
  },

  accountLabel: {
    fontSize: 15,
    color: '#318866',
    fontWeight: '700',
  },

  accountName: {
    marginTop: 6,
    fontSize: 18,
    color: '#191F28',
    fontWeight: '800',
  },

  accountDetail: {
    marginTop: 4,
    fontSize: 15,
    color: '#6B7684',
  },

  name: {
    fontSize: 24,
    fontWeight: '800',
    color: '#191F28',
  },

  detail: {
    marginTop: 8,
    fontSize: 18,
    color: '#8B95A1',
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

  secondaryButton: {
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },

  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7684',
  },
});