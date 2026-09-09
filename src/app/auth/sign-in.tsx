import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import SlideFadeIn from "@/components/SlideFadeIn";
import { colors } from "@/constants/colors";
import { fonts, seniorTypography } from "@/constants/typography";
import { getApiErrorMessage, loginAndSaveToken } from "@/services/auth";
import { registerPushToken } from "@/services/pushNotification";

export default function SignInScreen() {
  const [phone, setPhone] = useState("");

  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const phoneValid = useMemo(() => {
    return /^01[0-9]{8,9}$/.test(phone);
  }, [phone]);

  const passwordValid = password.length >= 2;

  const disabled = !phoneValid || !passwordValid || isSubmitting;

  const handleLogin = async () => {
    if (disabled) return;

    Keyboard.dismiss();

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await loginAndSaveToken({
        phone,
        password,
      });

      try {
        await registerPushToken();
      } catch (pushError) {
        console.warn("PUSH TOKEN REGISTRATION ERROR:", pushError);
      }

      if (response.role === "SENIOR") {
        router.replace("/senior/home");
      } else {
        router.replace("/guardian/home");
      }
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          "로그인에 실패했어요. 잠시 후 다시 시도해 주세요.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.wrapper}>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <SlideFadeIn delay={80} distance={18}>
                <Text style={styles.title}>
                  다시 만나서{`\n`}
                  반가워요
                </Text>
              </SlideFadeIn>

              <SlideFadeIn delay={150} distance={14}>
                <Text style={styles.subtitle}>
                  가입한 휴대폰 번호와 비밀번호로
                  {`\n`}
                  로그인할게요.
                </Text>
              </SlideFadeIn>

              <SlideFadeIn delay={230} distance={14}>
                <View>
                  <Text style={styles.label}>휴대폰 번호</Text>

                  <TextInput
                    value={phone}
                    onChangeText={(value) => {
                      const numbersOnly = value.replace(/\D/g, "").slice(0, 11);

                      setPhone(numbersOnly);

                      setErrorMessage("");
                    }}
                    style={styles.input}
                    placeholder="01012345678"
                    placeholderTextColor="#B0B8C1"
                    keyboardType="phone-pad"
                    maxLength={11}
                    autoFocus
                    returnKeyType="next"
                  />
                </View>
              </SlideFadeIn>

              <SlideFadeIn delay={300} distance={14}>
                <View>
                  <View style={styles.passwordLabelRow}>
                    <Text style={styles.labelNoMargin}>비밀번호</Text>

                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => setShowPassword((prev) => !prev)}
                    >
                      <Text style={styles.passwordToggle}>
                        {showPassword ? "숨기기" : "보기"}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <TextInput
                    value={password}
                    onChangeText={(value) => {
                      setPassword(value);

                      setErrorMessage("");
                    }}
                    style={styles.input}
                    placeholder="비밀번호를 입력해 주세요"
                    placeholderTextColor="#B0B8C1"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                  />
                </View>
              </SlideFadeIn>

              {!!errorMessage && (
                <Text style={styles.errorText}>{errorMessage}</Text>
              )}

              <View style={styles.bottomSpacer} />
            </ScrollView>

            <View style={styles.buttonArea}>
              <TouchableOpacity
                style={[styles.button, disabled && styles.disabledButton]}
                disabled={disabled}
                activeOpacity={0.85}
                onPress={handleLogin}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.buttonText}>로그인</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  flex: {
    flex: 1,
  },

  wrapper: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 24,
  },

  title: {
    fontSize: seniorTypography.pageTitle,
    lineHeight: 42,
    fontFamily: fonts.bold,
    color: colors.text,
  },

  subtitle: {
    marginTop: 12,
    fontSize: seniorTypography.body,
    lineHeight: 30,
    fontFamily: fonts.regular,
    color: colors.muted,
  },

  label: {
    marginTop: 40,
    marginBottom: 10,
    fontSize: 18,
    fontFamily: fonts.semiBold,
    color: "#4E5968",
  },

  labelNoMargin: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
    color: "#4E5968",
  },

  passwordLabelRow: {
    marginTop: 32,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  passwordToggle: {
    fontSize: 17,
    fontFamily: fonts.semiBold,
    color: colors.primary,
  },

  input: {
    height: 68,
    borderRadius: 16,
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    fontSize: 20,
    fontFamily: fonts.regular,
    color: colors.text,
  },

  errorText: {
    marginTop: 14,
    fontSize: 16,
    lineHeight: 24,
    fontFamily: fonts.medium,
    color: "#F04452",
  },

  bottomSpacer: {
    height: 180,
  },

  buttonArea: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
    backgroundColor: colors.background,
  },

  button: {
    height: 64,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  disabledButton: {
    backgroundColor: "#D1D6DB",
  },

  buttonText: {
    fontSize: seniorTypography.button,
    fontFamily: fonts.bold,
    color: colors.white,
  },
});
