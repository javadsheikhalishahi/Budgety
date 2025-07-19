import { styles } from "@/assets/styles/authenticate.styles.js";
import { COLORS } from "@/constants/colors";
import { useSignUp } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import * as React from "react";
import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  useWindowDimensions
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [error, serError] = React.useState("");
  const CODE_LENGTH = 6;
  const inputRef = useRef(null);
  const [loading, setLoading] = React.useState(false);

  const spinAnim = useRef(new Animated.Value(0)).current;
  const successAnim = useRef(new Animated.Value(0)).current;
  const [verified, setVerified] = React.useState(false);
  const { width } = useWindowDimensions();
  const { height } = useWindowDimensions();

  useEffect(() => {
    if (loading && !verified) {
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinAnim.stopAnimation();
      spinAnim.setValue(0);
    }
  }, [loading, spinAnim, verified]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const triggerSuccessAnimation = () => {
    Animated.timing(successAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const onSignUpPress = async () => {
    if (!isLoaded) return;

    try {
      await signUp.create({
        emailAddress,
        password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      setPendingVerification(true);
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded || code.length < CODE_LENGTH) return;

    try {
      setLoading(true);
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        setVerified(true);
        triggerSuccessAnimation();
        setTimeout(() => router.replace("/"), 1500);
      } else {
        console.error(JSON.stringify(signUpAttempt, null, 2));
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
      serError("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (pendingVerification) {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.verificationContainer}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={[styles.verificationTitle]}>
              Verify Email
            </Text>

            <LottieView
              source={require("@/assets/images/lock-check.json")}
              autoPlay
              loop
              style={{ width: 200, height: 200 }}
            />

            <Text style={styles.verificationSubTitle}>Check your email</Text>
            <Text style={styles.verificationInfo}>
              We sent a 6-digit verification code to{" "}
              <Text style={{ fontWeight: "600" }}>{emailAddress}</Text>
            </Text>

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons
                  name="alert-circle"
                  size={20}
                  color={COLORS.expense}
                />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity onPress={() => serError("")}>
                  <Ionicons name="close" size={20} color={COLORS.textLight} />
                </TouchableOpacity>
              </View>
            ) : null}

            <View style={[styles.codeInputContainer, { marginTop: 20 }]}>
              {Array.from({ length: CODE_LENGTH }).map((_, i) => {
                const isFilled = code[i] !== undefined;
                return (
                  <View
                    key={i}
                    style={[
                      styles.codeBox,
                      {
                        borderColor: isFilled ? COLORS.income : COLORS.border,
                        borderWidth: 2,
                        borderRadius: 10,
                        justifyContent: "center",
                        alignItems: "center",
                        marginHorizontal: 5,
                        backgroundColor: "#fff",
                        shadowColor: "#000",
                        shadowOpacity: 0.1,
                        shadowOffset: { width: 0, height: 2 },
                        shadowRadius: 4,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        fontSize: 26,
                        fontWeight: "bold",
                        color: isFilled ? COLORS.income : COLORS.textDark,
                      }}
                    >
                      {code[i] ?? ""}
                    </Text>
                  </View>
                );
              })}

              <TextInput
                ref={inputRef}
                value={code}
                onChangeText={(text) => {
                  const numericCode = text.replace(/[^0-9]/g, "");
                  setCode(numericCode);
                  if (numericCode.length === CODE_LENGTH) {
                    onVerifyPress();
                  }
                }}
                maxLength={CODE_LENGTH}
                keyboardType="number-pad"
                style={{
                  position: "absolute",
                  opacity: 0,
                  height: 55,
                  width: 270,
                }}
                autoFocus
              />
            </View>

            <TouchableOpacity
              onPress={onVerifyPress}
              style={[
                styles.button1,
                (loading || code.length < CODE_LENGTH) && styles.buttonDisabled,
              ]}
              disabled={loading || code.length < CODE_LENGTH}
              activeOpacity={0.8}
            >
              {loading && !verified ? (
                <Animated.View style={{ transform: [{ rotate: spin }] }}>
                  <Ionicons
                    name="sunny-outline"
                    size={24}
                    color={COLORS.income}
                  />
                </Animated.View>
              ) : verified ? (
                <Animated.View
                  style={{
                    opacity: successAnim,
                    transform: [
                      {
                        scale: successAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.5, 1],
                        }),
                      },
                    ],
                  }}
                >
                  <Ionicons
                    name="checkmark-done-outline"
                    size={24}
                    color={COLORS.textLight}
                  />
                </Animated.View>
              ) : (
                <Text style={styles.buttonText}>Verify your Email</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
    <KeyboardAwareScrollView
    style={{ flex: 1}}
    contentContainerStyle={{ flexGrow: 1 }}
    enableOnAndroid={true}
    enableAutomaticScroll={true}
    keyboardShouldPersistTaps="handled"
  >
      <View style={styles.container}>
        <Image source={require("../../assets/images/sign-up.png")} style={[styles.illustration, { width: width * 0.8, height: height * 0.4  }]}/>
      <Text style={styles.title}>Create Account</Text>

      {error ? (
              <View style={styles.errorBox}>
                <Ionicons
                  name="alert-circle"
                  size={20}
                  color={COLORS.expense}
                />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity onPress={() => serError("")}>
                  <Ionicons name="close" size={20} color={COLORS.textLight} />
                </TouchableOpacity>
              </View>
            ) : null}

      <TextInput
        style={[styles.input, error && styles.errorInput]}
        autoCapitalize="none"
        value={emailAddress}
        placeholderTextColor="#7b99b0"
        placeholder="Enter email"
        onChangeText={(email) => setEmailAddress(email)}
      />
      <TextInput
        style={[styles.input, error && styles.errorInput]}
        value={password}
        placeholderTextColor="#7b99b0"
        placeholder="Enter password"
        secureTextEntry={true}
        onChangeText={(password) => setPassword(password)}
      />
      <TouchableOpacity style={styles.button} onPress={onSignUpPress}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>Already have an account?</Text>
       <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.linkText}>Sign in </Text>
       </TouchableOpacity>
      </View>
      </View>
    </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
