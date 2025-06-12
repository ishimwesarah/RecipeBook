import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  SafeAreaView,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Formik } from "formik";
import * as Yup from "yup";
import CustomInput from "../components/CustomInput";
import { useAppContext } from "../context/AppContext";

const SignupValidationSchema = Yup.object().shape({
  username: Yup.string()
    .min(2, "Username is too short.")
    .required("Username is required."),
  email: Yup.string()
    .email("Please enter a valid email.")
    .required("Email is required."),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters.")
    .required("Password is required."),
});

const SignupScreen = () => {
  const navigation = useNavigation();
  const { signup } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (values) => {
    setIsLoading(true);
    try {
      await signup(values.username, values.email, values.password);

      Alert.alert(
        "Account Created!",
        "Please check your email to verify your account before logging in.",
        [{ text: "OK", onPress: () => navigation.navigate("Login") }]
      );
    } catch (error) {
      const message =
        error.response?.data?.message || "An unknown error occurred.";
      Alert.alert("Signup Failed", message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.content}>
          <Formik
            validationSchema={SignupValidationSchema}
            initialValues={{ username: "", email: "", password: "" }}
            onSubmit={handleSignup}
          >
            {({ handleChange, handleSubmit, values, errors, touched }) => (
              <>
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Start your culinary journey</Text>

                <CustomInput
                  label="Username"
                  onChangeText={handleChange("username")}
                  value={values.username}
                  error={errors.username}
                  touched={touched.username}
                />
                <CustomInput
                  label="Email"
                  onChangeText={handleChange("email")}
                  value={values.email}
                  error={errors.email}
                  touched={touched.email}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <CustomInput
                  label="Password"
                  onChangeText={handleChange("password")}
                  value={values.password}
                  error={errors.password}
                  touched={touched.password}
                  secureTextEntry
                />

                <View style={styles.buttonContainer}>
                  <Button
                    title={isLoading ? "Creating Account..." : "Sign Up"}
                    onPress={handleSubmit}
                    disabled={isLoading}
                    color="#4CAF50"
                  />
                </View>
                <Button
                  title="Already have an account? Login"
                  onPress={() => navigation.navigate("Login")}
                  disabled={isLoading}
                />
              </>
            )}
          </Formik>
        </ScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f8f8" },
  content: { flexGrow: 1, justifyContent: "center", padding: 20 },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 40,
  },
  buttonContainer: { marginTop: 10, marginBottom: 20 },
});

export default SignupScreen;
