import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  AppState,
  Platform,
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
const TARGET_STEPS = 3000;

const STEP_READ_PERMISSION = {
  accessType: 'read',
  recordType: 'Steps',
} as const;

export default function WalkingScreen() {
  const [
    stepCount,
    setStepCount,
  ] = useState(0);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    isRefreshing,
    setIsRefreshing,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('');

  const [
    targetSteps,
    setTargetSteps,
  ] = useState(TARGET_STEPS);

  const appStateRef = useRef(
    AppState.currentState,
  );

  const walkingActivityRef =
    useRef<TodayActivityResponse | null>(null);

  const lastSyncedStepCountRef =
    useRef<number | null>(null);

  const syncStepCount = useCallback(
    async (latestStepCount: number) => {
      if (
        lastSyncedStepCountRef.current ===
        latestStepCount
      ) {
        return;
      }

      lastSyncedStepCountRef.current =
        latestStepCount;

      try {
        let walkingActivity =
          walkingActivityRef.current;

        if (!walkingActivity) {
          walkingActivity =
            await getTodayActivityByType(
              'WALKING',
            );

          if (!walkingActivity) {
            lastSyncedStepCountRef.current =
              null;
            console.log(
              'WALKING ACTIVITY NOT FOUND',
            );
            return;
          }

          walkingActivityRef.current =
            walkingActivity;

          if (
            walkingActivity.targetValue !==
            null
          ) {
            setTargetSteps(
              walkingActivity.targetValue,
            );
          }
        }

        await saveActivityResult(
          walkingActivity.activityId,
          {
            stepCount: latestStepCount,
          },
        );
      } catch (error) {
        if (
          lastSyncedStepCountRef.current ===
          latestStepCount
        ) {
          lastSyncedStepCountRef.current =
            null;
        }

        console.log(
          'WALKING STEP SYNC ERROR:',
          error,
        );
      }
    },
    [],
  );

  const loadStepCount =
    useCallback(async (
      isInitialLoad = false,
    ) => {
      if (isInitialLoad) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }

      setErrorMessage('');

      if (
        Platform.OS !==
        'android'
      ) {
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      try {
        const {
          aggregateRecord,
          getGrantedPermissions,
          getSdkStatus,
          initialize,
          requestPermission,
          SdkAvailabilityStatus,
        } = await import(
          'react-native-health-connect'
        );

        const sdkStatus =
          await getSdkStatus();

        if (
          sdkStatus !==
          SdkAvailabilityStatus.SDK_AVAILABLE
        ) {
          setStepCount(0);
          setErrorMessage(
            '이 기기에서는 Health Connect를 사용할 수 없어요.',
          );
          return;
        }

        const isInitialized =
          await initialize();

        if (!isInitialized) {
          setStepCount(0);
          setErrorMessage(
            'Health Connect를 시작하지 못했어요.',
          );
          return;
        }

        const grantedPermissions =
          await getGrantedPermissions();

        let isStepReadGranted =
          grantedPermissions.some(
            (permission) =>
              permission.accessType ===
                'read' &&
              permission.recordType ===
                'Steps',
          );

        if (!isStepReadGranted) {
          const requestedPermissions =
            await requestPermission([
              STEP_READ_PERMISSION,
            ]);

          isStepReadGranted =
            requestedPermissions.some(
              (permission) =>
                permission.accessType ===
                  'read' &&
                permission.recordType ===
                  'Steps',
            );
        }

        if (!isStepReadGranted) {
          setStepCount(0);
          setErrorMessage(
            '걸음 수 읽기 권한이 필요해요.',
          );
          return;
        }

        const now = new Date();
        const startOfToday =
          new Date(now);
        startOfToday.setHours(
          0,
          0,
          0,
          0,
        );

        const result =
          await aggregateRecord({
            recordType: 'Steps',
            timeRangeFilter: {
              operator: 'between',
              startTime:
                startOfToday.toISOString(),
              endTime:
                now.toISOString(),
            },
          });

        const latestStepCount =
          result.COUNT_TOTAL ?? 0;

        setStepCount(latestStepCount);
        void syncStepCount(
          latestStepCount,
        );
      } catch (error) {
        console.log(
          'HEALTH CONNECT STEPS ERROR:',
          error,
        );

        setStepCount(0);
        setErrorMessage(
          '걸음 수를 불러오지 못했어요.',
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }, [syncStepCount]);

  useEffect(() => {
    void loadStepCount(true);
  }, [loadStepCount]);

  useEffect(() => {
    const subscription =
      AppState.addEventListener(
        'change',
        (nextAppState) => {
          const wasInBackground =
            appStateRef.current ===
              'background' ||
            appStateRef.current ===
              'inactive';

          appStateRef.current =
            nextAppState;

          if (
            wasInBackground &&
            nextAppState === 'active'
          ) {
            void loadStepCount();
          }
        },
      );

    return () => subscription.remove();
  }, [loadStepCount]);

  const progress =
    targetSteps > 0
      ? Math.min(
          stepCount /
            targetSteps,
          1,
        )
      : 0;

  const remaining =
    Math.max(
      targetSteps -
        stepCount,
      0,
    );

  const completed =
    stepCount >= targetSteps;

  const handleRefresh =
    async () => {
      if (isRefreshing) {
        return;
      }

      await loadStepCount();
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
          style={styles.stepSection}
        >
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
              {stepCount.toLocaleString()}
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

          <TouchableOpacity
            style={[
              styles.refreshButton,
              isRefreshing &&
                styles.disabledButton,
            ]}
            activeOpacity={0.75}
            disabled={isRefreshing}
            onPress={
              handleRefresh
            }
          >
            {isRefreshing ? (
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

    stepSection: {
      marginTop: 28,
      gap: 12,
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
