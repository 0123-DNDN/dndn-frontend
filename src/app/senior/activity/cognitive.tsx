import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
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
  {
    id: 1,
    question:
      '다음 숫자에 들어갈 것은\n무엇일까요?',
    detail: '2  ·  4  ·  6  ·  ?',
    answers: ['7', '8', '9'],
    correctAnswer: '8',
  },
  {
    id: 2,
    question:
      '다음 중 과일이 아닌 것은\n무엇일까요?',
    detail: '',
    answers: [
      '사과',
      '당근',
      '포도',
    ],
    correctAnswer: '당근',
  },
  {
    id: 3,
    question:
      '10에서 3을 빼면\n얼마일까요?',
    detail: '',
    answers: ['6', '7', '8'],
    correctAnswer: '7',
  },
];

export default function CognitiveGameScreen() {
  const [
    activity,
    setActivity,
  ] =
    useState<TodayActivityResponse | null>(
      null,
    );

  const [
    questionIndex,
    setQuestionIndex,
  ] = useState(0);

  const [
    selectedAnswer,
    setSelectedAnswer,
  ] =
    useState<string | null>(
      null,
    );

  const [
    correctCount,
    setCorrectCount,
  ] = useState(0);

  const [
    finalScore,
    setFinalScore,
  ] = useState(0);

  const [
    finished,
    setFinished,
  ] = useState(false);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    isSubmitting,
    setIsSubmitting,
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
            'COGNITIVE_GAME',
          );

        setActivity(result);

        if (result?.completed) {
          setFinalScore(
            result.score ?? 0,
          );

          setFinished(true);
        }
      } catch (error) {
        console.log(
          'COGNITIVE LOAD ERROR:',
          error,
        );

        setErrorMessage(
          '인지 게임 정보를 불러오지 못했어요.',
        );
      } finally {
        setIsLoading(false);
      }
    };

  const currentQuestion =
    questions[questionIndex];

  const handleNext =
    async () => {
      if (
        !selectedAnswer ||
        isSubmitting
      ) {
        return;
      }

      const isCorrect =
        selectedAnswer ===
        currentQuestion.correctAnswer;

      const nextCorrectCount =
        correctCount +
        (isCorrect ? 1 : 0);

      if (
        questionIndex ===
        questions.length - 1
      ) {
        if (!activity) {
          setErrorMessage(
            '활동 정보를 찾을 수 없어요.',
          );

          return;
        }

        const score =
          Math.round(
            (nextCorrectCount /
              questions.length) *
              100,
          );

        try {
          setIsSubmitting(true);
          setErrorMessage('');

          await saveActivityResult(
            activity.activityId,
            {
              score,
            },
          );

          setCorrectCount(
            nextCorrectCount,
          );

          setFinalScore(score);
          setFinished(true);
        } catch (error) {
          console.log(
            'COGNITIVE SAVE ERROR:',
            error,
          );

          setErrorMessage(
            '결과를 저장하지 못했어요. 다시 시도해 주세요.',
          );
        } finally {
          setIsSubmitting(false);
        }

        return;
      }

      setCorrectCount(
        nextCorrectCount,
      );

      setQuestionIndex(
        (prev) => prev + 1,
      );

      setSelectedAnswer(null);
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
            styles.resultContainer
          }
        >
          <View
            style={
              styles.resultIcon
            }
          >
            <Ionicons
              name="checkmark"
              size={44}
              color={
                colors.primary
              }
            />
          </View>

          <Text
            style={
              styles.resultTitle
            }
          >
            오늘의 인지 게임을
            {'\n'}
            완료했어요
          </Text>

          <Text
            style={
              styles.resultDescription
            }
          >
            세 문제 모두 끝까지 잘
            해냈어요.
          </Text>

          <View
            style={
              styles.scoreCard
            }
          >
            <Text
              style={
                styles.scoreLabel
              }
            >
              오늘 점수
            </Text>

            <Text
              style={
                styles.score
              }
            >
              {finalScore}점
            </Text>
          </View>

          <TouchableOpacity
            style={
              styles.primaryButton
            }
            onPress={() =>
              router.back()
            }
          >
            <Text
              style={
                styles.primaryButtonText
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
                styles.progressText
              }
            >
              {questionIndex + 1} /{' '}
              {questions.length}
            </Text>
          </View>

          <View
            style={
              styles.progressTrack
            }
          >
            <View
              style={[
                styles.progressFill,
                {
                  width: `${
                    ((questionIndex +
                      1) /
                      questions.length) *
                    100
                  }%`,
                },
              ]}
            />
          </View>

          <Text
            style={
              styles.pageLabel
            }
          >
            오늘의 인지 게임
          </Text>

          <Text
            style={
              styles.question
            }
          >
            {
              currentQuestion.question
            }
          </Text>

          {!!currentQuestion.detail && (
            <View
              style={
                styles.questionDetail
              }
            >
              <Text
                style={
                  styles.questionDetailText
                }
              >
                {
                  currentQuestion.detail
                }
              </Text>
            </View>
          )}

          <View
            style={
              styles.answerList
            }
          >
            {currentQuestion.answers.map(
              (answer) => {
                const selected =
                  selectedAnswer ===
                  answer;

                return (
                  <TouchableOpacity
                    key={answer}
                    style={[
                      styles.answerButton,
                      selected &&
                        styles.answerButtonSelected,
                    ]}
                    activeOpacity={0.8}
                    disabled={
                      isSubmitting
                    }
                    onPress={() =>
                      setSelectedAnswer(
                        answer,
                      )
                    }
                  >
                    <Text
                      style={[
                        styles.answerText,
                        selected &&
                          styles.answerTextSelected,
                      ]}
                    >
                      {answer}
                    </Text>
                  </TouchableOpacity>
                );
              },
            )}
          </View>

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

        <TouchableOpacity
          style={[
            styles.primaryButton,
            (!selectedAnswer ||
              isSubmitting) &&
              styles.disabledButton,
          ]}
          disabled={
            !selectedAnswer ||
            isSubmitting
          }
          onPress={
            handleNext
          }
        >
          {isSubmitting ? (
            <ActivityIndicator
              color="#FFFFFF"
            />
          ) : (
            <Text
              style={
                styles.primaryButtonText
              }
            >
              {questionIndex ===
              questions.length - 1
                ? '완료하기'
                : '다음'}
            </Text>
          )}
        </TouchableOpacity>
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
      paddingBottom: 24,
    },

    topBar: {
      height: 52,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
    },

    backButton: {
      width: 48,
      height: 48,
      justifyContent: 'center',
    },

    progressText: {
      fontSize: 18,
      fontFamily:
        fonts.semiBold,
      color: '#6B7684',
    },

    progressTrack: {
      height: 8,
      borderRadius: 4,
      backgroundColor:
        '#E5E8EB',
      overflow: 'hidden',
      marginTop: 8,
    },

    progressFill: {
      height: '100%',
      backgroundColor:
        colors.primary,
    },

    pageLabel: {
      marginTop: 40,
      fontSize: 18,
      lineHeight: 26,
      fontFamily:
        fonts.semiBold,
      color: colors.primary,
    },

    question: {
      marginTop: 12,
      fontSize:
        seniorTypography.pageTitle,
      lineHeight: 44,
      fontFamily: fonts.bold,
      color: '#191F28',
    },

    questionDetail: {
      marginTop: 28,
      minHeight: 90,
      borderRadius: 22,
      backgroundColor:
        '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'center',
    },

    questionDetailText: {
      fontSize: 28,
      fontFamily: fonts.bold,
      color: '#191F28',
    },

    answerList: {
      marginTop: 28,
      gap: 12,
    },

    answerButton: {
      minHeight: 70,
      paddingHorizontal: 22,
      borderRadius: 20,
      backgroundColor:
        '#FFFFFF',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor:
        'transparent',
    },

    answerButtonSelected: {
      borderColor:
        colors.primary,
      backgroundColor:
        '#EAF5F0',
    },

    answerText: {
      fontSize: 22,
      fontFamily: fonts.bold,
      color: '#191F28',
    },

    answerTextSelected: {
      color: colors.primary,
    },

    primaryButton: {
      minHeight: 64,
      borderRadius: 18,
      backgroundColor:
        colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },

    disabledButton: {
      backgroundColor:
        '#D1D6DB',
    },

    primaryButtonText: {
      fontSize: 21,
      fontFamily: fonts.bold,
      color: '#FFFFFF',
    },

    errorText: {
      marginTop: 16,
      fontSize: 16,
      lineHeight: 24,
      fontFamily:
        fonts.medium,
      color: '#F04452',
    },

    resultContainer: {
      flex: 1,
      paddingHorizontal:
        spacing.page,
      paddingBottom: 24,
      justifyContent: 'center',
    },

    resultIcon: {
      width: 76,
      height: 76,
      borderRadius: 26,
      backgroundColor:
        '#EAF5F0',
      alignItems: 'center',
      justifyContent: 'center',
    },

    resultTitle: {
      marginTop: 24,
      fontSize: 32,
      lineHeight: 44,
      fontFamily: fonts.bold,
      color: '#191F28',
    },

    resultDescription: {
      marginTop: 12,
      fontSize: 19,
      lineHeight: 29,
      fontFamily:
        fonts.regular,
      color: '#6B7684',
    },

    scoreCard: {
      marginTop: 32,
      marginBottom: 48,
      borderRadius: 24,
      backgroundColor:
        '#FFFFFF',
      padding: 24,
    },

    scoreLabel: {
      fontSize: 18,
      fontFamily:
        fonts.regular,
      color: '#8B95A1',
    },

    score: {
      marginTop: 6,
      fontSize: 40,
      lineHeight: 50,
      fontFamily: fonts.bold,
      color: colors.primary,
    },
  });