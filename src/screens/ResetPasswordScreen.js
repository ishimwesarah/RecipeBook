import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import CustomInput from '../components/CustomInput';
import { useAppContext } from '../context/AppContext';
import { Formik } from 'formik';
import * as Yup from 'yup';

const ResetPasswordSchema = Yup.object().shape({
  password: Yup.string().min(6, 'Password must be at least 6 characters.').required('Password is required.'),
  confirmPassword: Yup.string().oneOf([Yup.ref('password'), null], 'Passwords must match').required('Passwords must match.'),
});

const ResetPasswordScreen = () => {
  const route = useRoute(); // useRoute() hook gives us access to params
  const navigation = useNavigation();
  const { performPasswordReset } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);

  // --- ✅ THE FIX IS HERE ---
  // We get the token directly from the route's parameters.
  // The `|| {}` is a safety net in case params is undefined.
  const { token } = route.params || {};

  const handleReset = async (values) => {
    // This check will now pass if the deep link worked correctly.
    if (!token) {
      return Alert.alert("Invalid Link", "No reset token was found. Please use the link from your email again.");
    }
    
    setIsLoading(true);
    try {
      // We pass the token from the route, and the new password from the form.
      const response = await performPasswordReset(token, values.password);
      Alert.alert("Success!", response.message, [
        { text: "Go to Login", onPress: () => navigation.navigate('Login') }
      ]);
    } catch (error) {
      const message = error.response?.data?.message || "An error occurred.";
      Alert.alert("Error", message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Create a New Password</Text>
        <Text style={styles.subtitle}>Your new password must be different from previous passwords.</Text>
        
        {/* The Formik part is correct and doesn't need to change */}
        <Formik
          initialValues={{ password: '', confirmPassword: '' }}
          validationSchema={ResetPasswordSchema}
          onSubmit={handleReset}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <>
              <CustomInput
                label="New Password"
                onChangeText={handleChange('password')}
                value={values.password}
                error={errors.password}
                touched={touched.password}
                secureTextEntry
              />
              <CustomInput
                label="Confirm New Password"
                onChangeText={handleChange('confirmPassword')}
                value={values.confirmPassword}
                error={errors.confirmPassword}
                touched={touched.confirmPassword}
                secureTextEntry
              />
              <View style={styles.buttonContainer}>
                {isLoading ? <ActivityIndicator size="large" color="#4CAF50" /> : <Button title="Reset Password" onPress={handleSubmit} color="#4CAF50" />}
              </View>
            </>
          )}
        </Formik>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  content: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 40 },
  buttonContainer: { marginTop: 10, marginBottom: 20 },
});

export default ResetPasswordScreen;