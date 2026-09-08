import { router, useLocalSearchParams } from 'expo-router';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ListeningScreen() {
  const { mode, risk } = useLocalSearchParams<{
    mode?: 'transfer' | 'purpose';
    risk?: string;
  }>();

  const handleStopRecording = async () => {
    // TODO:
    // 실제 구현:
    // 1. 녹음 종료
    // 2. 녹음 파일을 C 백엔드 STT API로 전달
    // 3. 반환된 transcript 사용

    const mockTranscript =
      mode === 'purpose' && risk === 'true'
        ? '검찰에서 내 통장이 위험하니까 이쪽 계좌로 500만 원 보내라고 했어'
        : mode === 'purpose'
          ? '아들 생활비로 보내는 거야'
        : '아들에게 50만 원 보내줘';

    if (mode === 'purpose') {
      router.replace({
        pathname: '/senior/transfer/purpose',
        params: {
          transcript: mockTranscript,
        },
      });

      return;
    }

    router.replace({
      pathname: '/senior/transfer/request',
      params: {
        transcript: mockTranscript,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.back}>‹</Text>
          </TouchableOpacity>

          <TouchableOpacity>
            <Text style={styles.guide}>안내</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.centerArea}>
          <View style={styles.listeningCircle}>
            <Text style={styles.listeningText}>
              듣고 있어요
            </Text>
          </View>
        </View>

        <View style={styles.voiceInput}>
          <Text style={styles.listeningStatus}>
            내용을 듣고 있어요...
          </Text>

          <View style={styles.inputActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => router.back()}
            >
              <Text style={styles.cancelText}>×</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.stopButton}
              onPress={handleStopRecording}
            >
              <View style={styles.stopIcon} />
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
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  back: {
    fontSize: 40,
    color: '#191F28',
  },

  guide: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4E5968',
  },

  centerArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  listeningCircle: {
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#55C8B0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  listeningText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  voiceInput: {
    minHeight: 132,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },

  listeningStatus: {
    flex: 1,
    fontSize: 18,
    color: '#8B95A1',
  },

  inputActions: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },

  cancelButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F2F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelText: {
    fontSize: 30,
    color: '#4E5968',
  },

  stopButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#191F28',
    alignItems: 'center',
    justifyContent: 'center',
  },

  stopIcon: {
    width: 18,
    height: 18,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
});