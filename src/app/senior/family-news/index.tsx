import {
  router,
  useFocusEffect,
} from 'expo-router';
import {
  useCallback,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  getFamilyPostImageUrl,
  getTodayFamilyPosts,
} from '@/services/familyPost';
import type {
  TodayFamilyPostsResponse,
} from '@/types/familyPost';

export default function FamilyNewsScreen() {
  const [
    data,
    setData,
  ] =
    useState<TodayFamilyPostsResponse | null>(
      null,
    );

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('');

  const loadFamilyPosts =
    useCallback(async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');

        const result =
          await getTodayFamilyPosts();

        setData(result);
      } catch (error: any) {
        console.log(
          'FAMILY POSTS STATUS:',
          error?.response?.status,
        );

        console.log(
          'FAMILY POSTS DATA:',
          error?.response?.data,
        );

        console.log(
          'FAMILY POSTS ERROR:',
          error,
        );

        setErrorMessage(
          error?.response?.data
            ?.message ??
            '가족 소식을 불러오지 못했어요.',
        );
      } finally {
        setIsLoading(false);
      }
    }, []);

  useFocusEffect(
    useCallback(() => {
      loadFamilyPosts();
    }, [loadFamilyPosts]),
  );

  if (isLoading) {
    return (
      <SafeAreaView
        style={styles.container}
      >
        <View
          style={
            styles.centerContainer
          }
        >
          <ActivityIndicator
            size="large"
            color="#318866"
          />

          <Text
            style={
              styles.loadingText
            }
          >
            가족 소식을
            불러오고 있어요
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (errorMessage) {
    return (
      <SafeAreaView
        style={styles.container}
      >
        <View
          style={
            styles.centerContainer
          }
        >
          <Text
            style={
              styles.errorTitle
            }
          >
            가족 소식을
            불러올 수 없어요
          </Text>

          <Text
            style={
              styles.errorDescription
            }
          >
            {errorMessage}
          </Text>

          <TouchableOpacity
            style={
              styles.retryButton
            }
            onPress={
              loadFamilyPosts
            }
          >
            <Text
              style={
                styles.retryButtonText
              }
            >
              다시 불러오기
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={
              styles.backTextButton
            }
            onPress={() =>
              router.back()
            }
          >
            <Text
              style={
                styles.backText
              }
            >
              돌아가기
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const posts =
    data?.posts ?? [];

  const unlocked =
    data?.unlocked ?? false;

  return (
    <SafeAreaView
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        <TouchableOpacity
          style={
            styles.backButton
          }
          activeOpacity={0.7}
          onPress={() =>
            router.back()
          }
        >
          <Text
            style={
              styles.backArrow
            }
          >
            ‹
          </Text>

          <Text
            style={
              styles.backLabel
            }
          >
            뒤로가기
          </Text>
        </TouchableOpacity>

        <Text
          style={styles.title}
        >
          오늘의 가족 소식
        </Text>

        <Text
          style={
            styles.subtitle
          }
        >
          가족이 오늘의 소식을
          보내왔어요.
        </Text>

        {posts.length === 0 ? (
          <View
            style={
              styles.emptyCard
            }
          >
            <Text
              style={
                styles.emptyIcon
              }
            >
              ♡
            </Text>

            <Text
              style={
                styles.emptyTitle
              }
            >
              아직 도착한 소식이
              없어요
            </Text>

            <Text
              style={
                styles.emptyDescription
              }
            >
              가족이 사진을 보내면
              이곳에서 확인할 수 있어요.
            </Text>
          </View>
        ) : !unlocked ? (
          <View
            style={
              styles.lockedCard
            }
          >
            <View
              style={
                styles.lockIcon
              }
            >
              <Text
                style={
                  styles.lockEmoji
                }
              >
                🔒
              </Text>
            </View>

            <Text
              style={
                styles.lockedTitle
              }
            >
              가족 소식이 도착했어요
            </Text>

            <Text
              style={
                styles.lockedDescription
              }
            >
              오늘의 활동을 모두
              완료하면{'\n'}
              가족이 보낸 사진과
              메시지를 볼 수 있어요.
            </Text>

            <View
              style={
                styles.hiddenPreview
              }
            >
              <Text
                style={
                  styles.hiddenPreviewText
                }
              >
                가족 사진
              </Text>
            </View>

            <Text
              style={
                styles.lockedHint
              }
            >
              활동 탭에서 남은 활동을
              완료해 주세요.
            </Text>
          </View>
        ) : (
          <View
            style={
              styles.postList
            }
          >
            {posts.map(
              (post) => {
                const imageUrl =
                  getFamilyPostImageUrl(
                    post.imageUrl,
                  );

                return (
                  <View
                    key={
                      post.familyPostId
                    }
                    style={
                      styles.postCard
                    }
                  >
                    {imageUrl && (
                      <Image
                        source={{
                          uri: imageUrl,
                        }}
                        style={
                          styles.postImage
                        }
                        resizeMode="cover"
                      />
                    )}

                    {!!post.message && (
                      <Text
                        style={
                          styles.message
                        }
                      >
                        {post.message}
                      </Text>
                    )}

                    <Text
                      style={
                        styles.date
                      }
                    >
                      {post.targetDate}
                    </Text>
                  </View>
                );
              },
            )}
          </View>
        )}
      </ScrollView>
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

    content: {
      paddingHorizontal: 24,
      paddingTop: 12,
      paddingBottom: 40,
    },

    centerContainer: {
      flex: 1,
      paddingHorizontal: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },

    loadingText: {
      marginTop: 14,
      fontSize: 18,
      lineHeight: 27,
      color: '#8B95A1',
    },

    backButton: {
      minHeight: 48,
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
    },

    backArrow: {
      fontSize: 38,
      lineHeight: 42,
      color: '#191F28',
    },

    backLabel: {
      marginLeft: 4,
      fontSize: 18,
      fontWeight: '700',
      color: '#191F28',
    },

    title: {
      marginTop: 24,
      fontSize: 32,
      lineHeight: 42,
      fontWeight: '800',
      color: '#191F28',
    },

    subtitle: {
      marginTop: 8,
      fontSize: 19,
      lineHeight: 29,
      color: '#8B95A1',
    },

    emptyCard: {
      marginTop: 32,
      padding: 32,
      borderRadius: 24,
      backgroundColor:
        '#FFFFFF',
      alignItems: 'center',
    },

    emptyIcon: {
      fontSize: 44,
      color: '#318866',
    },

    emptyTitle: {
      marginTop: 18,
      fontSize: 23,
      lineHeight: 32,
      fontWeight: '800',
      color: '#191F28',
      textAlign: 'center',
    },

    emptyDescription: {
      marginTop: 10,
      fontSize: 18,
      lineHeight: 28,
      color: '#8B95A1',
      textAlign: 'center',
    },

    lockedCard: {
      marginTop: 32,
      padding: 24,
      borderRadius: 24,
      backgroundColor:
        '#FFFFFF',
      alignItems: 'center',
    },

    lockIcon: {
      width: 68,
      height: 68,
      borderRadius: 22,
      backgroundColor:
        '#EAF5F0',
      alignItems: 'center',
      justifyContent: 'center',
    },

    lockEmoji: {
      fontSize: 30,
    },

    lockedTitle: {
      marginTop: 22,
      fontSize: 24,
      lineHeight: 33,
      fontWeight: '800',
      color: '#191F28',
      textAlign: 'center',
    },

    lockedDescription: {
      marginTop: 12,
      fontSize: 19,
      lineHeight: 30,
      color: '#6B7684',
      textAlign: 'center',
    },

    hiddenPreview: {
      width: '100%',
      height: 190,
      marginTop: 26,
      borderRadius: 20,
      backgroundColor:
        '#F2F4F6',
      alignItems: 'center',
      justifyContent: 'center',
    },

    hiddenPreviewText: {
      fontSize: 18,
      fontWeight: '700',
      color: '#B0B8C1',
    },

    lockedHint: {
      marginTop: 20,
      fontSize: 17,
      lineHeight: 26,
      color: '#318866',
      fontWeight: '700',
      textAlign: 'center',
    },

    postList: {
      marginTop: 30,
      gap: 18,
    },

    postCard: {
      padding: 18,
      borderRadius: 24,
      backgroundColor:
        '#FFFFFF',
    },

    postImage: {
      width: '100%',
      height: 300,
      borderRadius: 18,
      backgroundColor:
        '#F2F4F6',
    },

    message: {
      marginTop: 18,
      fontSize: 20,
      lineHeight: 31,
      color: '#191F28',
    },

    date: {
      marginTop: 12,
      fontSize: 15,
      color: '#8B95A1',
    },

    errorTitle: {
      fontSize: 25,
      lineHeight: 34,
      fontWeight: '800',
      color: '#191F28',
      textAlign: 'center',
    },

    errorDescription: {
      marginTop: 10,
      fontSize: 17,
      lineHeight: 26,
      color: '#8B95A1',
      textAlign: 'center',
    },

    retryButton: {
      marginTop: 24,
      height: 56,
      paddingHorizontal: 24,
      borderRadius: 16,
      backgroundColor:
        '#318866',
      alignItems: 'center',
      justifyContent: 'center',
    },

    retryButtonText: {
      fontSize: 18,
      fontWeight: '800',
      color: '#FFFFFF',
    },

    backTextButton: {
      marginTop: 12,
      height: 48,
      justifyContent: 'center',
    },

    backText: {
      fontSize: 17,
      fontWeight: '700',
      color: '#8B95A1',
    },
  });