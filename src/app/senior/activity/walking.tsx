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

const DEMO_DEVICE_STEPS = 1840;

export default function WalkingScreen() {
  const [
    activity,
    setActivity,
  ] =
    useState<TodayActivityResponse | null>(
      null,
    );

  const [
    currentSteps,
    setCurrentSteps,
  ] = useState(0);

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
        setErrorMessage('');

        const result =
          await getTodayActivityByType(
            'WALKING',
          );

        setActivity(result);

        setCurrentSteps(
          result?.stepCount ?? 0,
        );
      } catch (error) {
        console.log(
          'WALKING LOAD ERROR:',
          error,
        );

        setErrorMessage(
          '걷기 정보를 불러오지 못했어요.',
        );
      } finally {
        setIsLoading(false);
      }
    };

  const targetSteps =
    activity?.targetValue ??
    3000;

  const progress =
    targetSteps > 0
      ? Math.min(
          currentSteps /
            targetSteps,
          1,
        )
      : 0;

  const remaining =
    Math.max(
      targetSteps -
        currentSteps,
      0,
    );

  const completed =
    activity?.completed ??
    currentSteps >=
      targetSteps;

  const handleRefresh =
    async () => {
      if (
        !activity ||
        isSaving
      ) {
        return;
      }

      /*
       * TODO:
       * HealthKit / Health Connect 붙으면
       * DEMO_DEVICE_STEPS 대신
       * 실제 걸음 수를 넣으면 됨.
       */
      const syncedSteps =
        DEMO_DEVICE_STEPS;

      try {
        setIsSaving(true);
        setErrorMessage('');

        const result =
          await saveActivityResult(
            activity.activityId,
            {
              stepCount:
                syncedSteps,
            },
          );

        setCurrentSteps(
          result.stepCount ??
            syncedSteps,
        );

        setActivity(
          (prev) =>
            prev
              ? {
                  ...prev,
                  stepCount:
                    result.stepCount,
                  status:
                    result.status,
                  completed:
                    result.status ===
                    'COMPLETED',
                }
              : prev,
        );
      } catch (error) {
        console.log(
          'WALKING SAVE ERROR:',
          error,
        );

        setErrorMessage(
          '걸음 수를 저장하지 못했어요.',
        );
      } finally {
        setIsSaving(false);
      }
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

  return (
    <SafeAreaView
      style={styles.container}
    >
      <View
        style={styles.screen}
      >
        <View>
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
              styles.pageLabel
            }
          >
            오늘 걷기
          </Text>

          <Text
            style={styles.title}
          >
            오늘도 천천히{'\n'}
            걸어볼까요?
          </Text>

          <Text
            style={
              styles.description
            }
          >
            평소처럼 걸으면 걸음 수가
            자동으로 기록돼요.
          </Text>
        </View>

        <View
          style={styles.stepCard}
        >
          <View
            style={styles.walkIcon}
          >
            <Ionicons
              name="walk-outline"
              size={38}
              color={
                colors.primary
              }
            />
          </View>

          <Text
            style={
              styles.stepLabel
            }
          >
            오늘 걸은 걸음
          </Text>

          <View
            style={
              styles.stepCountRow
            }
          >
            <Text
              style={
                styles.stepCount
              }
            >
              {currentSteps.toLocaleString()}
            </Text>

            <Text
              style={
                styles.stepUnit
              }
            >
              보
            </Text>
          </View>

          <View
            style={
              styles.progressHeader
            }
          >
            <Text
              style={
                styles.progressLabel
              }
            >
              오늘의 목표
            </Text>

            <Text
              style={
                styles.targetText
              }
            >
              {targetSteps.toLocaleString()}
              보
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
                    progress * 100
                  }%`,
                },
              ]}
            />
          </View>

          {completed ? (
            <Text
              style={
                styles.completedText
              }
            >
              오늘의 걷기 목표를
              완료했어요
            </Text>
          ) : (
            <Text
              style={
                styles.remaining
              }
            >
              목표까지{' '}
              <Text
                style={
                  styles.remainingStrong
                }
              >
                {remaining.toLocaleString()}
                보
              </Text>{' '}
              남았어요
            </Text>
          )}
        </View>

        <View
          style={
            styles.bottomArea
          }
        >
          {!!errorMessage && (
            <Text
              style={
                styles.errorText
              }
            >
              {errorMessage}
            </Text>
          )}

          <View
            style={styles.infoBox}
          >
            <Ionicons
              name="sync-outline"
              size={23}
              color="#6B7684"
            />

            <Text
              style={
                styles.infoText
              }
            >
              현재는 시연용 걸음 수를
              사용하고 있어요.
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.refreshButton,
              isSaving &&
                styles.disabledButton,
            ]}
            activeOpacity={0.75}
            disabled={isSaving}
            onPress={
              handleRefresh
            }
          >
            {isSaving ? (
              <ActivityIndicator
                color={
                  colors.primary
                }
              />
            ) : (
              <>
                <Ionicons
                  name="refresh"
                  size={24}
                  color={
                    colors.primary
                  }
                />

                <Text
                  style={
                    styles.refreshText
                  }
                >
                  걸음 수 새로고침
                </Text>
              </>
            )}
          </TouchableOpacity>
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
      paddingBottom: 32,
    },

    backButton: {
      width: 48,
      height: 48,
      justifyContent: 'center',
    },

    pageLabel: {
      marginTop: 24,
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

    stepCard: {
      borderRadius: 28,
      backgroundColor:
        '#FFFFFF',
      padding: 26,
    },

    walkIcon: {
      width: 64,
      height: 64,
      borderRadius: 22,
      backgroundColor:
        '#EAF5F0',
      alignItems: 'center',
      justifyContent: 'center',
    },

    stepLabel: {
      marginTop: 26,
      fontSize: 18,
      fontFamily:
        fonts.regular,
      color: '#8B95A1',
    },

    stepCountRow: {
      marginTop: 4,
      flexDirection: 'row',
      alignItems:
        'baseline',
    },

    stepCount: {
      fontSize: 48,
      lineHeight: 58,
      fontFamily: fonts.bold,
      color: '#191F28',
    },

    stepUnit: {
      marginLeft: 6,
      fontSize: 22,
      fontFamily: fonts.bold,
      color: '#191F28',
    },

    progressHeader: {
      marginTop: 32,
      flexDirection: 'row',
      justifyContent:
        'space-between',
    },

    progressLabel: {
      fontSize: 17,
      fontFamily:
        fonts.medium,
      color: '#6B7684',
    },

    targetText: {
      fontSize: 17,
      fontFamily:
        fonts.semiBold,
      color: '#191F28',
    },

    progressTrack: {
      marginTop: 12,
      height: 14,
      borderRadius: 7,
      backgroundColor:
        '#E5E8EB',
      overflow: 'hidden',
    },

    progressFill: {
      height: '100%',
      borderRadius: 7,
      backgroundColor:
        colors.primary,
    },

    remaining: {
      marginTop: 14,
      fontSize: 18,
      lineHeight: 27,
      fontFamily:
        fonts.regular,
      color: '#6B7684',
    },

    remainingStrong: {
      fontFamily: fonts.bold,
      color: colors.primary,
    },

    completedText: {
      marginTop: 14,
      fontSize: 18,
      lineHeight: 27,
      fontFamily:
        fonts.semiBold,
      color: colors.primary,
    },

    bottomArea: {
      gap: 12,
    },

    infoBox: {
      padding: 18,
      borderRadius: 18,
      backgroundColor:
        '#EEF0F2',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },

    infoText: {
      flex: 1,
      fontSize: 16,
      lineHeight: 24,
      fontFamily:
        fonts.regular,
      color: '#6B7684',
    },

    refreshButton: {
      minHeight: 60,
      borderRadius: 18,
      backgroundColor:
        '#FFFFFF',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
    },

    disabledButton: {
      opacity: 0.6,
    },

    refreshText: {
      fontSize: 19,
      fontFamily:
        fonts.bold,
      color: colors.primary,
    },

    errorText: {
      fontSize: 16,
      lineHeight: 24,
      fontFamily:
        fonts.medium,
      color: '#F04452',
    },
  });