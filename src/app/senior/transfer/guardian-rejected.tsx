import { router } from 'expo-router';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function GuardianRejectedScreen() {
  const handleConfirm = () => {
    router.replace('/senior/account');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.centerArea}>
          <View style={styles.iconCircle}>
            <Text style={styles.icon}>!</Text>
          </View>

          <Text style={styles.title}>
            이번 송금은{'\n'}
            진행하지 않아요
          </Text>

          <Text style={styles.description}>
            가족과 확인한 뒤{'\n'}
            다시 시도해 주세요.
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

            <View style={styles.divider} />

            <View style={styles.row}>
              <Text style={styles.label}>상태</Text>
              <Text style={styles.cancelValue}>송금 취소</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleConfirm}
        >
          <Text style={styles.primaryButtonText}>확인</Text>
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
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
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
    backgroundColor: '#FFE8EA',
    alignItems: 'center',
    justifyContent: 'center',
  },

  icon: {
    fontSize: 30,
    fontWeight: '800',
    color: '#F04452',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    gap: 16,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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

  cancelValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F04452',
  },

  divider: {
    height: 1,
    backgroundColor: '#F2F4F6',
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