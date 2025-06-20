import React from 'react';
import { View, Text, StyleSheet, Button, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const EmailVerifiedScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="checkmark-circle" size={100} color="#4CAF50" />
        <Text style={styles.title}>Email Verified!</Text>
        <Text style={styles.subtitle}>
          Your account has been successfully activated. You can now log in to access all features.
        </Text>
        <View style={styles.buttonContainer}>
          <Button 
            title="Proceed to Login" 
            onPress={() => navigation.navigate('Login')} 
            color="#4CAF50" 
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333', marginTop: 20, marginBottom: 15, textAlign: 'center' },
  subtitle: { fontSize: 17, color: '#666', textAlign: 'center', lineHeight: 25, marginBottom: 40 },
  buttonContainer: { width: '80%' },
});

export default EmailVerifiedScreen;