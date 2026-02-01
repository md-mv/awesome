import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";

import { useNavigation, useRouter } from "expo-router";
import { useEffect, useState } from "react";

import { useAuth } from "@/lib/auth-context";
import { Button, Text, TextInput, useTheme } from "react-native-paper";

export default function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>("");

  const theme = useTheme();
  const router = useRouter();
  const { signIn, signUp } = useAuth();

  const navigation = useNavigation();
  useEffect(() => {
    // console.log("auth useeffect");
    const unsubscribe = navigation.addListener("focus", () => {
      handleAuth();
    });

    // Return the function to unsubscribe from the event so it gets removed on unmount
    return unsubscribe;
  }, [navigation]);

  const handleAuth = async () => {
    // console.log("handleAuth");
    if (!email || !password) {
      await setError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      await setError("Password must be at least 6 characters long.");
      return;
    }

    await setError(null);
    if (isSignUp) {
      const error = await signUp(email, password);
      if (error) {
        await setError(error);
        return;
      }
    } else {
      const error = await signIn(email, password);
      if (error) {
        await setError(error);
        return;
      }

      router.replace("/");
    }
  };
  const handleSwitchMode = () => {
    // console.log("handleSwitchMode");
    setIsSignUp((prev) => !prev);
  };

  //not in the tabs folder because it is something independent from tabs(sign in, up)

  //keyboardavoidingview differs from view in that it actually does not show the keyboard on top of you input, while you type
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title} variant="headlineMedium">
          {isSignUp ? "Create Account" : "Welcome Back"}
        </Text>
        <TextInput
          label="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="example@gmail.com"
          mode="outlined"
          style={styles.input}
          onChangeText={setEmail}
        />

        <TextInput
          label="Password"
          autoCapitalize="none"
          mode="outlined"
          secureTextEntry
          style={styles.input}
          onChangeText={setPassword}
        />

        {error && <Text style={{ color: theme.colors.error }}> {error}</Text>}

        <Button style={styles.button} onPress={handleAuth} mode="contained">
          {isSignUp ? "Sign Up" : "Sign In"}
        </Button>
        <Button
          style={styles.switchModeButton}
          mode="text"
          onPress={handleSwitchMode}
        >
          {isSignUp
            ? "Already have an account? Sign In"
            : "Don't have an account? Sign Up"}
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

//container encompasses the whole screen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "f5f5f5",
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
  },
  title: {
    textAlign: "center",
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
  switchModeButton: {
    marginTop: 16,
  },
});
