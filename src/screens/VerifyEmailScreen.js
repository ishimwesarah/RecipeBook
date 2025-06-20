import React from 'react';
import { View, Text, StyleSheet, Button, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const VerifyEmailScreen = ({ route }) => {
  const navigation = useNavigation();
  // We can optionally get the email from the route params to display it
  const { email } = route.params || {};

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="mail-unread-outline" size={80} color="#4CAF50" />
        <Text style={styles.title}>Check Your Email</Text>
        {email ? (
          <Text style={styles.subtitle}>
            We've sent a verification link to <Text style={styles.emailText}>{email}</Text>. Please click the link to activate your account.
          </Text>
        ) : (
          <Text style={styles.subtitle}>
            We've sent a verification link to your email address. Please click the link to activate your account.
          </Text>
        )}
        <View style={styles.buttonContainer}>
          <Button title="Back to Login" onPress={() => navigation.navigate('Login')} color="#4CAF50" />
        </View>
        <Text style={styles.footerText}>Didn't receive the email? Check your spam folder or try resending.</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#333', marginTop: 20, marginBottom: 15, textAlign: 'center' },
  subtitle: { fontSize: 17, color: '#666', textAlign: 'center', lineHeight: 25, marginBottom: 40 },
  emailText: { fontWeight: 'bold', color: '#333' },
  buttonContainer: { width: '80%' },
  footerText: { fontSize: 14, color: '#999', marginTop: 30, textAlign: 'center' },
});

export default VerifyEmailScreen;