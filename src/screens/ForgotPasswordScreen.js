import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CustomInput from '../components/CustomInput';
import { useAppContext } from '../context/AppContext';

const ForgotPasswordScreen = () => {
  const navigation = useNavigation();
  const { forgotPassword } = useAppContext();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendLink = async () => {
    if (!email.includes('@')) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await forgotPassword(email);
      Alert.alert("Check Your Email", response.message);
      // For testing, we can navigate directly. In a real app, the user would get an email.
      // We will assume the user now needs to enter a token they received.
      // Let's navigate to a new ResetPasswordScreen.
      navigation.navigate('ResetPassword');

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
        <Text style={styles.title}>Forgot Password</Text>
        <Text style={styles.subtitle}>Enter your email address and we'll send you a link to reset your password.</Text>
        
        <CustomInput
          label="Email Address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="your.email@example.com"
        />
        
        <View style={styles.buttonContainer}>
          {isLoading ? (
            <ActivityIndicator size="large" color="#4CAF50" />
          ) : (
            <Button title="Send Reset Link" onPress={handleSendLink} color="#4CAF50" />
          )}
        </View>
        <Button title="Back to Login" onPress={() => navigation.goBack()} />
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

export default ForgotPasswordScreen;