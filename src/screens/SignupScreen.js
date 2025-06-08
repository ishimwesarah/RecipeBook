import React from 'react';
import { View, Text, StyleSheet, Button, SafeAreaView, TouchableWithoutFeedback, Keyboard, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import CustomInput from '../components/CustomInput';
import { useAppContext } from '../context/AppContext';

const SignupValidationSchema = Yup.object().shape({
  name: Yup.string().min(2, 'Name is too short.').required('Name is required.'),
  email: Yup.string().email('Please enter a valid email.').required('Email is required.'),
  password: Yup.string().min(6, 'Password must be at least 6 characters.').required('Password is required.'),
  confirmPassword: Yup.string().oneOf([Yup.ref('password'), null], 'Passwords must match.').required('Confirm Password is required.'),
});

const SignupScreen = () => {
  const navigation = useNavigation();
  const { signupUser } = useAppContext();

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.content}>
          <Formik
            validationSchema={SignupValidationSchema}
            initialValues={{ name: '', email: '', password: '', confirmPassword: '' }}
            onSubmit={(values) => signupUser(values.name, values.email)}
          >
            {({ handleChange, handleSubmit, values, errors, touched }) => (
              <>
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Start your culinary journey</Text>
                
                <CustomInput label="Full Name" onChangeText={handleChange('name')} value={values.name} error={errors.name} touched={touched.name} />
                <CustomInput label="Email" onChangeText={handleChange('email')} value={values.email} error={errors.email} touched={touched.email} keyboardType="email-address" autoCapitalize="none" />
                <CustomInput label="Password" onChangeText={handleChange('password')} value={values.password} error={errors.password} touched={touched.password} secureTextEntry />
                <CustomInput label="Confirm Password" onChangeText={handleChange('confirmPassword')} value={values.confirmPassword} error={errors.confirmPassword} touched={touched.confirmPassword} secureTextEntry />
                
                <View style={styles.buttonContainer}><Button title="Sign Up" onPress={handleSubmit} color="#4CAF50" /></View>
                <Button title="Already have an account? Login" onPress={() => navigation.navigate('Login')} />
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

export default SignupScreen;