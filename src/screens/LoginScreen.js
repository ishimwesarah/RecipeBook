import React from 'react';
import { View, Text, StyleSheet, Button, SafeAreaView, TouchableWithoutFeedback, Keyboard, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import CustomInput from '../components/CustomInput';
import { useAppContext } from '../context/AppContext';

const LoginValidationSchema = Yup.object().shape({
  email: Yup.string().email('Please enter a valid email.').required('Email is required.'),
  password: Yup.string().min(6, 'Password must be at least 6 characters.').required('Password is required.'),
});

const LoginScreen = () => {
  const navigation = useNavigation();
  const { loginUser } = useAppContext();

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.content}>
          <Formik
            validationSchema={LoginValidationSchema}
            initialValues={{ email: '', password: '' }}
            onSubmit={(values) => loginUser(values.email)}
          >
            {({ handleChange, handleSubmit, values, errors, touched }) => (
              <>
                <Text style={styles.title}>Welcome Back!</Text>
                <Text style={styles.subtitle}>Sign in to your Recipe Book</Text>
                
                <CustomInput label="Email" onChangeText={handleChange('email')} value={values.email} error={errors.email} touched={touched.email} keyboardType="email-address" autoCapitalize="none" />
                <CustomInput label="Password" onChangeText={handleChange('password')} value={values.password} error={errors.password} touched={touched.password} secureTextEntry />
                
                <View style={styles.buttonContainer}><Button title="Login" onPress={handleSubmit} color="#4CAF50" /></View>
                <Button title="Don't have an account? Sign Up" onPress={() => navigation.navigate('Signup')} />
              </>
            )}
          </Formik>
        </ScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  content: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 40 },
  buttonContainer: { marginTop: 10, marginBottom: 20 },
});

export default LoginScreen;