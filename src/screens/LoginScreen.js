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
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Formik } from "formik";
import * as Yup from "yup";
import CustomInput from "../components/CustomInput";
import { useAppContext } from "../context/AppContext";

const LoginValidationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Please enter a valid email.")
    .required("Email is required."),
  password: Yup.string().required("Password is required."),
});

const LoginScreen = () => {
  const navigation = useNavigation();
  const { login } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (values) => {
    setIsLoading(true);
    try {
      await login(values.email, values.password);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "An unknown error occurred. Please try again.";
      Alert.alert("Login Failed", message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.content}>
          <Formik
            validationSchema={LoginValidationSchema}
            initialValues={{ email: "", password: "" }}
            onSubmit={handleLogin}
          >
            {({ handleChange, handleSubmit, values, errors, touched }) => (
              <>
                <Text style={styles.title}>Welcome Back!</Text>
                <Text style={styles.subtitle}>Sign in to your Recipe Book</Text>

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
                    title={isLoading ? "Logging in..." : "Login"}
                    onPress={handleSubmit}
                    disabled={isLoading}
                    color="#4CAF50"
                  />
                </View>
                <Button
                  title="Don't have an account? Sign Up"
                  onPress={() => navigation.navigate("Signup")}
                  disabled={isLoading}
                />
              </>
            )}
          </Formik>
          <TouchableOpacity style={styles.forgotPasswordButton} onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
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
   forgotPasswordButton: {
    alignItems: 'center',
    padding: 15,
  },
  forgotPasswordText: {
    color: '#4CAF50',
    fontSize: 14,
  },
  buttonContainer: { marginTop: 10, marginBottom: 20 },
});

export default LoginScreen;
