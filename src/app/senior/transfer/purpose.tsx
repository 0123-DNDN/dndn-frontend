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

export default function TransferPurposeScreen() {
  const { transcript, risk } = useLocalSearchParams<{
    transcript?: string;
    risk?: string;
  }>();

  const [recognizedText, setRecognizedText] = useState(
    typeof transcript === 'string' ? transcript : '',
  );

  const hasText = recognizedText.trim().length > 0;

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
          <Text style={styles.heroText}>
            어떤 이유로{'\n'}
            보내시는 돈인가요?
          </Text>

          {!hasText && (
              <TouchableOpacity
                style={styles.suggestion}
                onPress={() => setRecognizedText('아들 생활비로 보내는 거야')}
              >
              <Text style={styles.suggestionText}>
                아들 생활비로 보내는 거야
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.voiceInput}>
          <TextInput
            style={styles.textInput}
            value={recognizedText}
            placeholder="보내는 이유를 알려주세요"
            placeholderTextColor="#8B95A1"
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
                    mode: 'purpose',
                    risk: risk === 'true' ? 'true' : 'false',
                  },
                })
              }
            >
              <Text style={styles.mic}>🎙</Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={!hasText}
              style={[
                styles.sendButton,
                !hasText && styles.sendButtonDisabled,
              ]}
              onPress={() =>
                router.push({
                  pathname: '/senior/transfer/confirm',
                  params: { risk: risk === 'true' ? 'true' : 'false' },
                })
              }
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
  },

  suggestion: {
    marginTop: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingVertical: 15,
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
    padding: 0,
    fontSize: 18,
    lineHeight: 26,
    color: '#191F28',
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