import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, SafeAreaView, Alert, ScrollView } from 'react-native';
// --- 🗑️ We can remove useNavigation, as we will get it from props ---
// import { useNavigation } from '@react-navigation/native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import CustomInput from '../components/CustomInput';
import { useAppContext } from '../context/AppContext';

const CreateUserSchema = Yup.object().shape({
  username: Yup.string().required('Username is required.'),
  email: Yup.string().email('Invalid email').required('Email is required.'),
  password: Yup.string().min(6, 'Password must be at least 6 characters.').required('Password is required.'),
  role: Yup.string().oneOf(['user', 'admin'], "Role must be 'user' or 'admin'").required('Role is required.'),
});

// --- ✅ THE FIX IS HERE: Accept `{ navigation }` as a prop ---
const CreateUserScreen = ({ navigation }) => {
  // const navigation = useNavigation(); // No longer needed
  const { signup } = useAppContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateUser = async (values, { resetForm }) => {
    setIsSubmitting(true);
    try {
      // The role is now passed to the signup function
      await signup(values.username, values.email, values.password, values.role);
      Alert.alert("Success", "New user has been created. They will need to verify their email.", [
        // This navigation call will now work correctly
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
      resetForm();
    } catch (error) {
      const message = error.response?.data?.message || "Could not create user.";
      Alert.alert("Error", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* It's good practice to use a ScrollView for forms */}
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Create New User</Text>
        <Formik
          initialValues={{ username: '', email: '', password: '', role: 'user' }}
          validationSchema={CreateUserSchema}
          onSubmit={handleCreateUser}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <>
              <CustomInput label="Username" onChangeText={handleChange('username')} onBlur={handleBlur('username')} value={values.username} error={errors.username} touched={touched.username} />
              <CustomInput label="Email" onChangeText={handleChange('email')} onBlur={handleBlur('email')} value={values.email} keyboardType="email-address" error={errors.email} touched={touched.email} />
              <CustomInput label="Password" onChangeText={handleChange('password')} onBlur={handleBlur('password')} value={values.password} secureTextEntry error={errors.password} touched={touched.password} />
              <CustomInput label="Role (user or admin)" onChangeText={handleChange('role')} onBlur={handleBlur('role')} value={values.role} autoCapitalize="none" error={errors.role} touched={touched.touched} />
              <View style={styles.buttonContainer}>
                <Button title={isSubmitting ? "Creating..." : "Create User"} onPress={handleSubmit} disabled={isSubmitting} color="#4CAF50" />
              </View>
            </>
          )}
        </Formik>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { justifyContent: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 30 },
  buttonContainer: { marginTop: 20 },
});

export default CreateUserScreen;