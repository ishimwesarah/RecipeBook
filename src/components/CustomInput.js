import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

const CustomInput = ({ label, value, onChangeText, onBlur, error, touched, ...props }) => (
  <View style={styles.container}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, error && touched && styles.inputError]}
      value={value}
      onChangeText={onChangeText}
      onBlur={onBlur}
      {...props}
    />
    {error && touched && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 16, color: '#333', marginBottom: 8 },
  input: { backgroundColor: '#f0f0f0', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, fontSize: 16, borderWidth: 1, borderColor: '#ddd' },
  inputError: { borderColor: 'red' },
  errorText: { color: 'red', marginTop: 4, fontSize: 12 },
});

export default CustomInput;