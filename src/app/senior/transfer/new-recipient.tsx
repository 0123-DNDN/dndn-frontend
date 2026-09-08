import { router } from 'expo-router';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function NewRecipientScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.back}>‹</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.replace('/senior/home')}>
              <Text style={styles.cancel}>취소</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.heroText}>
            새 계좌 정보를{'\n'}
            알려주세요
          </Text>

            <View style={styles.recipientSummary}>
              <Text style={styles.recipientName}>김상우</Text>
              <Text style={styles.recipientDetail}>신한은행 · 5,000,000원</Text>
            </View>

          <View style={styles.form}>
            <Text style={styles.label}>은행</Text>

            <TouchableOpacity style={styles.selectInput}>
              <Text style={styles.inputText}>신한은행</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            <Text style={[styles.label, styles.secondLabel]}>
              계좌번호
            </Text>

            <TextInput
              style={styles.textInput}
              placeholder="계좌번호 입력"
              placeholderTextColor="#B0B8C1"
              keyboardType="number-pad"
              value="110-***-4821"
            />

            <View style={styles.noticeBox}>
              <Text style={styles.noticeText}>
                처음 보내는 계좌예요.{'\n'}
                계좌번호를 다시 한번 확인해 주세요.
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() =>
            router.push({
              pathname: '/senior/transfer/purpose',
              params: { risk: 'true' },
            })
          }
        >
          <Text style={styles.primaryButtonText}>계좌 확인하기</Text>
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
    fontWeight: '600',
    color: '#4E5968',
  },

  heroText: {
    marginTop: 40,
    fontSize: 32,
    lineHeight: 43,
    fontWeight: '700',
    color: '#191F28',
    letterSpacing: -0.6,
  },

  form: {
    marginTop: 40,
  },

    recipientSummary: {
      marginTop: 24,
      backgroundColor: '#FFFFFF',
      borderRadius: 20,
      padding: 20,
    },

    recipientName: {
      fontSize: 20,
      fontWeight: '800',
      color: '#191F28',
    },

    recipientDetail: {
      marginTop: 8,
      fontSize: 18,
      color: '#6B7684',
    },

  label: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333D4B',
    marginBottom: 12,
  },

  secondLabel: {
    marginTop: 24,
  },

  selectInput: {
    height: 64,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  textInput: {
    height: 64,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    fontSize: 18,
    color: '#191F28',
  },

  inputText: {
    fontSize: 18,
    color: '#191F28',
  },

  chevron: {
    fontSize: 30,
    color: '#B0B8C1',
  },

  noticeBox: {
    marginTop: 24,
    padding: 20,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },

  noticeText: {
    fontSize: 18,
    lineHeight: 28,
    color: '#6B7684',
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