import { router } from 'expo-router';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function RecipientNotFoundScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View />
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.cancel}>취소</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.centerArea}>
          <Text style={styles.heroText}>
            이전 거래내역에서{'\n'}
            <Text style={styles.highlight}>김상우님</Text>을 찾지 못했어요.
          </Text>

          <Text style={styles.description}>
            처음 보내는 분이라면{'\n'}
            계좌번호로 보내주세요.
          </Text>

          <TouchableOpacity
            style={styles.accountButton}
            onPress={() =>
              router.push('/senior/transfer/new-recipient')
            }
          >
            <Text style={styles.accountButtonText}>
              계좌번호로 보내기
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.voiceInput}>
          <Text style={styles.placeholder}>내용을 입력해 주세요</Text>

          <View style={styles.inputActions}>
            <TouchableOpacity style={styles.micButton}>
              <Text style={styles.mic}>🎙</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sendButton}>
              <Text style={styles.send}>↑</Text>
            </TouchableOpacity>
          </View>
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

  cancel: {
    fontSize: 18,
    color: '#4E5968',
  },

  centerArea: {
    alignItems: 'center',
  },

  heroText: {
    marginTop: 90,
    fontSize: 30,
    lineHeight: 42,
    fontWeight: '700',
    textAlign: 'center',
    color: '#191F28',
  },

  highlight: {
    color: '#318866',
  },

  description: {
    marginTop: 28,
    fontSize: 18,
    lineHeight: 28,
    textAlign: 'center',
    color: '#6B7684',
  },

  accountButton: {
    marginTop: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },

  accountButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#191F28',
  },

  voiceInput: {
    minHeight: 132,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    padding: 20,
    justifyContent: 'space-between',
  },

  placeholder: {
    fontSize: 18,
    color: '#8B95A1',
  },

  inputActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },

  micButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F2F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  mic: {
    fontSize: 22,
  },

  sendButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#DFF2EA',
    alignItems: 'center',
    justifyContent: 'center',
  },

  send: {
    fontSize: 26,
    color: '#318866',
  },
});