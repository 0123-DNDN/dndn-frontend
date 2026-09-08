import {
  router,
} from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import {
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import { createFamilyPost } from '@/services/familyPost';
import { getFamilyRelation } from '@/services/family';
import type {
  FamilyPostImage,
} from '@/types/familyPost';

export default function FamilyPostCreateScreen() {
  const [
    message,
    setMessage,
  ] = useState('');

  const [
    selectedImage,
    setSelectedImage,
  ] =
    useState<FamilyPostImage | null>(
      null,
    );

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('');

  const handleSelectImage =
    async () => {
      try {
        Keyboard.dismiss();
        setErrorMessage('');

        const permission =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (
          permission.status !==
          'granted'
        ) {
          Alert.alert(
            '사진 접근 권한이 필요해요',
            '가족 사진을 보내려면 사진 보관함 접근을 허용해 주세요.',
          );

          return;
        }

        const result =
          await ImagePicker.launchImageLibraryAsync(
            {
              mediaTypes: [
                'images',
              ],
              allowsEditing: true,
              quality: 0.8,
            },
          );

        if (result.canceled) {
          return;
        }

        const asset =
          result.assets[0];

        const fileName =
          asset.fileName ??
          `family-${Date.now()}.jpg`;

        const mimeType =
          asset.mimeType ??
          'image/jpeg';

        setSelectedImage({
          uri: asset.uri,
          name: fileName,
          type: mimeType,
        });
      } catch (error) {
        console.log(
          'IMAGE PICK ERROR:',
          error,
        );

        setErrorMessage(
          '사진을 불러오지 못했어요.',
        );
      }
    };

  const handleSubmit =
    async () => {
      Keyboard.dismiss();

      if (!selectedImage) {
        setErrorMessage(
          '보낼 사진을 선택해 주세요.',
        );

        return;
      }

      if (isSubmitting) {
        return;
      }

      try {
        setIsSubmitting(true);
        setErrorMessage('');

        const relation =
          await getFamilyRelation();

        await createFamilyPost(
          relation.relationshipId,
          selectedImage,
          message,
        );

        router.push(
          '/guardian/family-post/complete',
        );
      } catch (error: any) {
        console.log(
          'CREATE FAMILY POST STATUS:',
          error?.response?.status,
        );

        console.log(
          'CREATE FAMILY POST DATA:',
          error?.response?.data,
        );

        console.log(
          'CREATE FAMILY POST ERROR:',
          error,
        );

        setErrorMessage(
          error?.response?.data
            ?.message ??
            '가족 소식을 보내지 못했어요. 다시 시도해 주세요.',
        );
      } finally {
        setIsSubmitting(false);
      }
    };

  return (
    <SafeAreaView
      style={styles.container}
    >
      <TouchableWithoutFeedback
        onPress={Keyboard.dismiss}
        accessible={false}
      >
        <View
          style={styles.content}
        >
          <View>
            <Text
              style={styles.title}
            >
              가족 소식 남기기
            </Text>

            <Text
              style={
                styles.subtitle
              }
            >
              김영희님에게 따뜻한
              메시지를 보내요.
            </Text>

            <TouchableOpacity
              style={
                styles.imageButton
              }
              activeOpacity={0.8}
              disabled={isSubmitting}
              onPress={
                handleSelectImage
              }
            >
              {selectedImage ? (
                <Image
                  source={{
                    uri:
                      selectedImage.uri,
                  }}
                  style={
                    styles.previewImage
                  }
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={
                    styles.imagePlaceholder
                  }
                >
                  <Text
                    style={
                      styles.imageIcon
                    }
                  >
                    +
                  </Text>

                  <Text
                    style={
                      styles.imageButtonText
                    }
                  >
                    가족 사진 선택하기
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {selectedImage && (
              <TouchableOpacity
                style={
                  styles.changeImageButton
                }
                disabled={isSubmitting}
                onPress={
                  handleSelectImage
                }
              >
                <Text
                  style={
                    styles.changeImageText
                  }
                >
                  다른 사진 선택하기
                </Text>
              </TouchableOpacity>
            )}

            <TextInput
              style={styles.input}
              placeholder="메시지를 입력해 주세요"
              placeholderTextColor="#8B95A1"
              value={message}
              onChangeText={
                setMessage
              }
              editable={
                !isSubmitting
              }
              maxLength={500}
              multiline
              returnKeyType="done"
              blurOnSubmit
            />

            <Text
              style={
                styles.countText
              }
            >
              {message.length} / 500
            </Text>

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
              styles.button,
              (!selectedImage ||
                isSubmitting) &&
                styles.buttonDisabled,
            ]}
            disabled={
              !selectedImage ||
              isSubmitting
            }
            activeOpacity={0.8}
            onPress={
              handleSubmit
            }
          >
            {isSubmitting ? (
              <ActivityIndicator
                color="#FFFFFF"
              />
            ) : (
              <Text
                style={
                  styles.buttonText
                }
              >
                소식 보내기
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
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
      flex: 1,
      padding: 24,
      justifyContent:
        'space-between',
    },

    title: {
      fontSize: 28,
      fontWeight: '800',
      color: '#191F28',
    },

    subtitle: {
      marginTop: 8,
      fontSize: 18,
      lineHeight: 27,
      color: '#8B95A1',
    },

    imageButton: {
      marginTop: 32,
      height: 220,
      borderRadius: 20,
      backgroundColor:
        '#FFFFFF',
      overflow: 'hidden',
    },

    imagePlaceholder: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },

    imageIcon: {
      fontSize: 42,
      lineHeight: 48,
      color: '#318866',
    },

    imageButtonText: {
      marginTop: 6,
      fontSize: 18,
      fontWeight: '700',
      color: '#318866',
    },

    previewImage: {
      width: '100%',
      height: '100%',
    },

    changeImageButton: {
      alignSelf: 'center',
      marginTop: 12,
      paddingVertical: 8,
      paddingHorizontal: 12,
    },

    changeImageText: {
      fontSize: 16,
      fontWeight: '700',
      color: '#318866',
    },

    input: {
      marginTop: 24,
      minHeight: 180,
      padding: 20,
      borderRadius: 20,
      backgroundColor:
        '#FFFFFF',
      fontSize: 18,
      lineHeight: 28,
      color: '#191F28',
      textAlignVertical: 'top',
    },

    countText: {
      marginTop: 8,
      alignSelf: 'flex-end',
      fontSize: 14,
      color: '#8B95A1',
    },

    errorText: {
      marginTop: 14,
      fontSize: 16,
      lineHeight: 24,
      color: '#F04452',
      textAlign: 'center',
    },

    button: {
      marginTop: 24,
      height: 60,
      borderRadius: 16,
      backgroundColor:
        '#318866',
      alignItems: 'center',
      justifyContent: 'center',
    },

    buttonDisabled: {
      backgroundColor:
        '#D1D6DB',
    },

    buttonText: {
      fontSize: 20,
      fontWeight: '800',
      color: '#FFFFFF',
    },
  });