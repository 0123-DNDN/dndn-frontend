import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function TransferRequestScreen() {
  const { transcript } = useLocalSearchParams<{
    transcript?: string;
  }>();

  const [recognizedText, setRecognizedText] = useState(
    typeof transcript === 'string' ? transcript : '',
  );

  const hasText = recognizedText.trim().length > 0;

  const handleBack = () => {
    router.replace('/senior/(tabs)/home');
  };

  const handleSend = () => {
    if (!hasText) return;

    if (recognizedText === '아들에게 50만 원 보내줘') {
      router.push('/senior/transfer/recipient-check');
      return;
    }

    router.push('/senior/transfer/recipient-not-found');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack}>
            <Text style={styles.back}>‹</Text>
          </TouchableOpacity>

          <TouchableOpacity>
            <Text style={styles.guide}>안내</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.centerArea}>
          <Text style={styles.heroText}>
            누구에게 얼마를{'\n'}
            보낼지 알려주세요
          </Text>

          {!hasText && (
            <View style={styles.suggestionGroup}>
              <TouchableOpacity style={styles.suggestion}>
                <Text style={styles.suggestionText}>
                  아들에게 10만 원 보내줘
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.suggestion}>
                <Text style={styles.suggestionText}>
                  최근 보낸 사람에게 보내줘
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.voiceInput}>
          <TextInput
            style={styles.textInput}
            placeholder="보낼 사람과 금액을 알려주세요"
            placeholderTextColor="#8B95A1"
            value={recognizedText}
            multiline
            editable
            onChangeText={setRecognizedText}
          />

          <View style={styles.inputActions}>
            <TouchableOpacity
              style={styles.micButton}
              onPress={() =>
                router.push({
                  pathname: '/senior/transfer/listening',
                  params: {
                    mode: 'transfer',
                  },
                })
              }
            >
              <Text style={styles.mic}>🎙</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.sendButton,
                !hasText && styles.sendButtonDisabled,
              ]}
              disabled={!hasText}
              onPress={handleSend}
            >
              <Text
                style={[
                  styles.send,
                  !hasText && styles.sendDisabled,
                ]}
              >
                ↑
              </Text>
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
    alignItems: 'center',
    marginTop: 80,
  },

  heroText: {
    fontSize: 32,
    lineHeight: 43,
    fontWeight: '700',
    textAlign: 'center',
    color: '#191F28',
    letterSpacing: -0.6,
  },

  suggestionGroup: {
    marginTop: 40,
    gap: 12,
    alignItems: 'center',
  },

  suggestion: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },

  suggestionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333D4B',
  },

  voiceInput: {
    minHeight: 132,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },

  textInput: {
    flex: 1,
    minHeight: 48,
    fontSize: 18,
    lineHeight: 26,
    color: '#191F28',
    padding: 0,
  },

  inputActions: {
    marginTop: 12,
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
    backgroundColor: '#D7F1E7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  sendButtonDisabled: {
    backgroundColor: '#F2F4F6',
  },

  send: {
    fontSize: 27,
    fontWeight: '700',
    color: '#318866',
  },

  sendDisabled: {
    color: '#B0B8C1',
  },
});