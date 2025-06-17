import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CustomInput from '../components/CustomInput';
import { useAppContext } from '../context/AppContext';
import { Formik } from 'formik';
import * as Yup from 'yup';

const ResetPasswordSchema = Yup.object().shape({
  token: Yup.string().required('Reset token is required.'),
  newPassword: Yup.string().min(6, 'Password must be at least 6 characters.').required('Password is required.'),
});

const ResetPasswordScreen = () => {
  const navigation = useNavigation();
  const { performPasswordReset } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = async (values) => {
    setIsLoading(true);
    try {
      const response = await performPasswordReset(values.token, values.newPassword);
      Alert.alert("Success!", response.message, [
        { text: "OK", onPress: () => navigation.navigate('Login') }
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
        <Text style={styles.title}>Reset Your Password</Text>
        <Text style={styles.subtitle}>Enter the token from your email and your new password.</Text>
        
        <Formik
          initialValues={{ token: '', newPassword: '' }}
          validationSchema={ResetPasswordSchema}
          onSubmit={handleReset}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <>
              <CustomInput
                label="Reset Token"
                onChangeText={handleChange('token')}
                onBlur={handleBlur('token')}
                value={values.token}
                error={errors.token}
                touched={touched.token}
                placeholder="Paste the token from your email"
              />
              <CustomInput
                label="New Password"
                onChangeText={handleChange('newPassword')}
                onBlur={handleBlur('newPassword')}
                value={values.newPassword}
                error={errors.newPassword}
                touched={touched.newPassword}
                secureTextEntry
                placeholder="Enter your new password"
              />
              <View style={styles.buttonContainer}>
                {isLoading ? (
                  <ActivityIndicator size="large" color="#4CAF50" />
                ) : (
                  <Button title="Reset Password" onPress={handleSubmit} color="#4CAF50" />
                )}
              </View>
            </>
          )}
        </Formik>
        <Button title="Back to Login" onPress={() => navigation.navigate('Login')} />
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