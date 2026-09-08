import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  useEffect,
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
  saveActivityResult,
} from '@/services/activity';
import type {
  TodayActivityResponse,
} from '@/types/activity';

const questions = [
  '오늘 기분은 어떠셨어요?',
  '오늘 가장 기억에 남는 일이 있었나요?',
  '오늘 맛있게 드신 음식이 있었나요?',
  '내일은 무엇을 하고 싶으세요?',
];

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

  const [turn, setTurn] =
    useState(0);

  const [
    listening,
    setListening,
  ] = useState(false);

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
  }, []);

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

  const completeActivity =
    async () => {
      if (!activity) {
        setErrorMessage(
          '활동 정보를 찾을 수 없어요.',
        );

        return;
      }

      try {
        setIsSaving(true);
        setErrorMessage('');

        /*
         * 현재는 InteractionSession 연결 전.
         * sessionId 없이 COMPLETED만 저장.
         *
         * 추후 실제 대화 세션이 생기면:
         *
         * {
         *   sessionId,
         *   status: 'COMPLETED'
         * }
         */
        await saveActivityResult(
          activity.activityId,
          {
            status:
              'COMPLETED',
          },
        );

        setFinished(true);
      } catch (error) {
        console.log(
          'VOICE ACTIVITY SAVE ERROR:',
          error,
        );

        setErrorMessage(
          '활동 결과를 저장하지 못했어요.',
        );
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
        setStarted(true);
        setListening(true);

        return;
      }

      if (listening) {
        setListening(false);

        if (
          turn ===
          questions.length - 1
        ) {
          await completeActivity();

          return;
        }

        setTimeout(() => {
          setTurn(
            (prev) => prev + 1,
          );
        }, 400);

        return;
      }

      setListening(true);
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
            편하게 이야기를
            들려주셔서 고마워요.
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
              {turn + 1} /{' '}
              {questions.length}
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
              {questions[turn]}
            </Text>
          </View>

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

          {!!errorMessage && (
            <Text
              style={
                styles.errorText
              }
            >
              {errorMessage}
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
      fontSize: 17,
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