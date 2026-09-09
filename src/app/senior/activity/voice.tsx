import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Speech from 'expo-speech';
import {
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import {
  fonts,
  seniorTypography,
} from '@/constants/typography';
import {
  getTodayActivityByType,
  startVoiceTalkSession,
  submitVoiceTalkAnswer,
} from '@/services/activity';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import type {
  TodayActivityResponse,
} from '@/types/activity';

export default function VoiceTalkScreen() {
  const [
    activity,
    setActivity,
  ] =
    useState<TodayActivityResponse | null>(
      null,
    );

  const [
    started,
    setStarted,
  ] = useState(false);

  const [sessionId, setSessionId] = useState<number | null>(null);
  const [question, setQuestion] = useState('');
  const [answeredCount, setAnsweredCount] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(4);
  const [summary, setSummary] = useState<string | null>(null);
  const shouldSubmitRef = useRef(false);

  const {
    transcript,
    finalTranscript,
    isListening: listening,
    error: speechError,
    startListening,
    stopListening,
    cancelListening,
    resetTranscript,
  } = useSpeechRecognition();

  const [
    finished,
    setFinished,
  ] = useState(false);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    isSaving,
    setIsSaving,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('');

  useEffect(() => {
    loadActivity();
    return () => {
      Speech.stop();
      cancelListening();
    };
  }, []);

  useEffect(() => {
    if (!shouldSubmitRef.current || listening) return;
    const text = (finalTranscript || transcript).trim();
    if (!text) return;
    shouldSubmitRef.current = false;
    void submitAnswer(text);
  }, [finalTranscript, listening, transcript]);

  const loadActivity =
    async () => {
      try {
        setIsLoading(true);

        const result =
          await getTodayActivityByType(
            'VOICE_TALK',
          );

        setActivity(result);

        if (result?.completed) {
          setFinished(true);
        }
      } catch (error) {
        console.log(
          'VOICE ACTIVITY LOAD ERROR:',
          error,
        );

        setErrorMessage(
          '음성 활동 정보를 불러오지 못했어요.',
        );
      } finally {
        setIsLoading(false);
      }
    };

  const speakAndListen = (text: string) => {
    cancelListening();
    Speech.stop();
    Speech.speak(text, {
      language: 'ko-KR',
      rate: 0.85,
      onDone: () => void startListening(),
      onStopped: () => undefined,
      onError: () => setErrorMessage('질문을 읽어드리지 못했어요.'),
    });
  };

  const startConversation = async () => {
    try {
      setIsSaving(true);
      setErrorMessage('');
      resetTranscript();
      const response = await startVoiceTalkSession();
      setSessionId(response.sessionId);
      setQuestion(response.question);
      setTotalQuestions(response.totalQuestions);
      setAnsweredCount(0);
      setStarted(true);
      speakAndListen(response.question);
    } catch (error) {
      console.log('VOICE TALK START ERROR:', error);
      setErrorMessage('오늘 이야기를 시작하지 못했어요.');
    } finally {
      setIsSaving(false);
    }
  };

  const submitAnswer = async (text: string) => {
    if (sessionId === null) return;
    try {
      setIsSaving(true);
      setErrorMessage('');
      const response = await submitVoiceTalkAnswer(sessionId, text);
      setAnsweredCount(response.answeredCount);
      resetTranscript();

      if (response.completed) {
        const finalSummary = response.summary ?? '오늘 이야기 들려주셔서 고마워요.';
        setSummary(finalSummary);
        setFinished(true);
        Speech.stop();
        Speech.speak(finalSummary, { language: 'ko-KR', rate: 0.85 });
        return;
      }

      if (response.nextQuestion) {
        setQuestion(response.nextQuestion);
        speakAndListen(response.nextQuestion);
      }
    } catch (error) {
      console.log('VOICE TALK ANSWER ERROR:', error);
      setErrorMessage('답변을 저장하지 못했어요. 다시 말씀해 주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleMic =
    async () => {
      if (isSaving) {
        return;
      }

      if (!started) {
        await startConversation();
        return;
      }

      if (listening) {
        shouldSubmitRef.current = true;
        stopListening();
        return;
      }

      resetTranscript();
      await startListening();
    };

  if (isLoading) {
    return (
      <SafeAreaView
        style={styles.container}
      >
        <View
          style={
            styles.loadingContainer
          }
        >
          <ActivityIndicator
            size="large"
            color={
              colors.primary
            }
          />
        </View>
      </SafeAreaView>
    );
  }

  if (finished) {
    return (
      <SafeAreaView
        style={styles.container}
      >
        <View
          style={
            styles.completeContainer
          }
        >
          <View
            style={
              styles.completeIcon
            }
          >
            <Ionicons
              name="chatbubble-ellipses"
              size={38}
              color={
                colors.primary
              }
            />
          </View>

          <Text
            style={
              styles.completeTitle
            }
          >
            오늘 이야기를{'\n'}
            잘 나눴어요
          </Text>

          <Text
            style={
              styles.completeDescription
            }
          >
            {summary ?? '편하게 이야기를 들려주셔서 고마워요.'}
          </Text>

          <TouchableOpacity
            style={
              styles.completeButton
            }
            onPress={() =>
              router.back()
            }
          >
            <Text
              style={
                styles.completeButtonText
              }
            >
              활동으로 돌아가기
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.container}
    >
      <View
        style={styles.screen}
      >
        <View>
          <View
            style={styles.topBar}
          >
            <TouchableOpacity
              style={
                styles.backButton
              }
              onPress={() =>
                router.back()
              }
            >
              <Ionicons
                name="chevron-back"
                size={30}
                color="#191F28"
              />
            </TouchableOpacity>

            <Text
              style={
                styles.turnText
              }
            >
              {Math.min(answeredCount + 1, totalQuestions)} /{' '}
              {totalQuestions}
            </Text>
          </View>

          <Text
            style={
              styles.pageLabel
            }
          >
            오늘 이야기 나누기
          </Text>

          <Text
            style={styles.title}
          >
            편하게 이야기해 주세요
          </Text>

          <Text
            style={
              styles.description
            }
          >
            정답은 없어요.{'\n'}
            평소 이야기하듯 말씀해
            주세요.
          </Text>
        </View>

        <View
          style={
            styles.conversationArea
          }
        >
          <View
            style={
              styles.questionBubble
            }
          >
            <Text
              style={
                styles.questionLabel
              }
            >
              든든
            </Text>

            <Text
              style={
                styles.questionText
              }
            >
              {question || '시작 버튼을 누르면 첫 질문을 들려드릴게요.'}
            </Text>
          </View>

          {transcript.trim().length > 0 && (
            <View style={styles.answerBubble}>
              <Text style={styles.answerLabel}>나</Text>
              <Text style={styles.answerText}>{transcript}</Text>
            </View>
          )}

          {started && (
            <View
              style={
                styles.statusArea
              }
            >
              <View
                style={[
                  styles.statusDot,
                  listening &&
                    styles.statusDotListening,
                ]}
              />

              <Text
                style={
                  styles.statusText
                }
              >
                {listening
                  ? '말씀을 듣고 있어요'
                  : '다음 답변을 시작하려면 눌러주세요'}
              </Text>
            </View>
          )}

          {!!(errorMessage || speechError) && (
            <Text
              style={
                styles.errorText
              }
            >
              {errorMessage || speechError}
            </Text>
          )}
        </View>

        <View
          style={styles.micArea}
        >
          <TouchableOpacity
            style={[
              styles.micButton,
              listening &&
                styles.micButtonListening,
            ]}
            activeOpacity={0.85}
            disabled={isSaving}
            onPress={
              handleMic
            }
          >
            {isSaving ? (
              <ActivityIndicator
                color="#FFFFFF"
              />
            ) : (
              <Ionicons
                name={
                  listening
                    ? 'stop'
                    : 'mic'
                }
                size={38}
                color="#FFFFFF"
              />
            )}
          </TouchableOpacity>

          <Text
            style={
              styles.micGuide
            }
          >
            {!started
              ? '눌러서 이야기 시작하기'
              : listening
                ? '말씀이 끝나면 눌러주세요'
                : '다음 답변을 시작하려면 눌러주세요'}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        '#F7F8FA',
    },

    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },

    screen: {
      flex: 1,
      justifyContent:
        'space-between',
      paddingHorizontal:
        spacing.page,
      paddingTop: 12,
      paddingBottom: 40,
    },

    topBar: {
      height: 52,
      flexDirection: 'row',
      justifyContent:
        'space-between',
      alignItems: 'center',
    },

    backButton: {
      width: 48,
      height: 48,
      justifyContent: 'center',
    },

    turnText: {
      fontSize: 18,
      fontFamily:
        fonts.semiBold,
      color: '#8B95A1',
    },

    pageLabel: {
      marginTop: 32,
      fontSize: 18,
      fontFamily:
        fonts.semiBold,
      color: colors.primary,
    },

    title: {
      marginTop: 10,
      fontSize:
        seniorTypography.pageTitle,
      lineHeight: 42,
      fontFamily: fonts.bold,
      color: '#191F28',
    },

    description: {
      marginTop: 12,
      fontSize: 18,
      lineHeight: 28,
      fontFamily:
        fonts.regular,
      color: '#6B7684',
    },

    conversationArea: {
      flex: 1,
      justifyContent: 'center',
    },

    questionBubble: {
      borderRadius: 26,
      backgroundColor:
        '#FFFFFF',
      padding: 26,
    },

    questionLabel: {
      alignSelf: 'flex-start',
      borderRadius: 12,
      backgroundColor: '#E7F6EF',
      paddingHorizontal: 10,
      paddingVertical: 3,
      fontSize: 15,
      lineHeight: 20,
      fontFamily: fonts.bold,
      color: colors.primary,
    },

    questionText: {
      marginTop: 10,
      fontSize: 27,
      lineHeight: 39,
      fontFamily: fonts.bold,
      color: '#191F28',
    },

    answerBubble: {
      marginTop: 16,
      marginLeft: 36,
      borderRadius: 20,
      backgroundColor: '#EAF5F0',
      paddingHorizontal: 22,
      paddingVertical: 18,
    },

    answerLabel: {
      alignSelf: 'flex-start',
      borderRadius: 12,
      backgroundColor: '#FFFFFF',
      paddingHorizontal: 10,
      paddingVertical: 3,
      fontSize: 15,
      lineHeight: 20,
      fontFamily: fonts.bold,
      color: colors.primary,
    },

    answerText: {
      marginTop: 8,
      fontSize: 21,
      lineHeight: 31,
      fontFamily: fonts.medium,
      color: '#191F28',
    },

    statusArea: {
      marginTop: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },

    statusDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor:
        '#B0B8C1',
    },

    statusDotListening: {
      backgroundColor:
        colors.primary,
    },

    statusText: {
      fontSize: 17,
      fontFamily:
        fonts.medium,
      color: '#6B7684',
    },

    errorText: {
      marginTop: 16,
      fontSize: 16,
      lineHeight: 24,
      fontFamily:
        fonts.medium,
      color: '#F04452',
      textAlign: 'center',
    },

    micArea: {
      alignItems: 'center',
    },

    micButton: {
      width: 84,
      height: 84,
      borderRadius: 42,
      backgroundColor:
        colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },

    micButtonListening: {
      backgroundColor:
        '#F04452',
    },

    micGuide: {
      marginTop: 14,
      fontSize: 17,
      lineHeight: 25,
      fontFamily:
        fonts.medium,
      color: '#6B7684',
      textAlign: 'center',
    },

    completeContainer: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal:
        spacing.page,
      paddingBottom: 24,
    },

    completeIcon: {
      width: 76,
      height: 76,
      borderRadius: 26,
      backgroundColor:
        '#EAF5F0',
      justifyContent: 'center',
      alignItems: 'center',
    },

    completeTitle: {
      marginTop: 24,
      fontSize: 32,
      lineHeight: 44,
      fontFamily: fonts.bold,
      color: '#191F28',
    },

    completeDescription: {
      marginTop: 12,
      marginBottom: 48,
      fontSize: 19,
      lineHeight: 29,
      fontFamily:
        fonts.regular,
      color: '#6B7684',
    },

    completeButton: {
      minHeight: 64,
      borderRadius: 18,
      backgroundColor:
        colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },

    completeButtonText: {
      fontSize: 21,
      fontFamily: fonts.bold,
      color: '#FFFFFF',
    },
  });
