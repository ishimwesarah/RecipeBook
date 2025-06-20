import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import CustomInput from '../components/CustomInput';
import { useAppContext } from '../context/AppContext';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Ionicons } from '@expo/vector-icons';

// Validation schema for creating a new password
const SetupAccountSchema = Yup.object().shape({
  token: Yup.string().required('Setup token is required. Please paste it from your backend console.'),
  password: Yup.string().min(6, 'Password must be at least 6 characters.').required('Password is required.'),
  confirmPassword: Yup.string().oneOf([Yup.ref('password'), null], 'Passwords must match').required('Passwords must match.'),
});

const SetupAccountScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { setupAccount } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);

  // Get the token if it was passed via deep link (for future use)
  const deepLinkToken = route.params?.token;

  const handleSetup = async (values) => {
    setIsLoading(true);
    try {
      // Use the token from the form input for testing
      const response = await setupAccount(values.token, values.password);
      Alert.alert("Account Activated!", response.message, [
        { text: "Proceed to Login", onPress: () => navigation.navigate('Login') }
      ]);
    } catch (error) {
      const message = error.response?.data?.message || "Could not set up your account.";
      Alert.alert("Error", message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="person-add-outline" size={80} color="#4CAF50" style={{ marginBottom: 20 }}/>
        <Text style={styles.title}>Welcome! Set Up Your Account</Text>
        <Text style={styles.subtitle}>An administrator created an account for you. Please paste the setup token and create a password to continue.</Text>
        
        <Formik
          initialValues={{ token: deepLinkToken || '', password: '', confirmPassword: '' }}
          validationSchema={SetupAccountSchema}
          onSubmit={handleSetup}
          enableReinitialize
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <>
              <CustomInput
                label="Setup Token"
                placeholder="Paste token from console here"
                onChangeText={handleChange('token')}
                onBlur={handleBlur('token')}
                value={values.token}
                error={errors.token}
                touched={touched.token}
                autoCapitalize="none"
              />
              <CustomInput
                label="Create a Password"
                placeholder="Enter your new password"
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
                value={values.password}
                error={errors.password}
                touched={touched.password}
                secureTextEntry
              />
              <CustomInput
                label="Confirm Your Password"
                placeholder="Confirm your new password"
                onChangeText={handleChange('confirmPassword')}
                onBlur={handleBlur('confirmPassword')}
                value={values.confirmPassword}
                error={errors.confirmPassword}
                touched={touched.confirmPassword}
                secureTextEntry
              />
              <View style={styles.buttonContainer}>
                {isLoading ? (
                  <ActivityIndicator size="large" color="#4CAF50" />
                ) : (
                  <Button title="Complete Account Setup" onPress={handleSubmit} color="#4CAF50" />
                )}
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

export default SetupAccountScreen;