import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Switch } from 'react-native';
import { useAppContext } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';

const SettingsScreen = () => {
  const { theme, toggleTheme } = useAppContext();
  const isDarkMode = theme === 'dark';

  return (
    <SafeAreaView style={[styles.container, styles[theme].container]}>
      <Text style={[styles.header, styles[theme].text]}>Settings</Text>

      <View style={[styles.card, styles[theme].card]}>
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Ionicons 
              name={isDarkMode ? "moon" : "sunny"} 
              size={24} 
              color={isDarkMode ? "#81c784" : "#ffb300"} 
            />
            <Text style={[styles.rowText, styles[theme].text]}>Dark Mode</Text>
          </View>
          <Switch
            trackColor={{ false: "#767577", true: "#81c784" }}
            thumbColor={isDarkMode ? "#4CAF50" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleTheme}
            value={isDarkMode}
          />
        </View>
      </View>
      
      {/* You can add more settings rows here in the future */}
      <TouchableOpacity style={[styles.card, styles[theme].card]}>
        <View style={styles.row}>
          <View style={styles.rowLeft}>
             <Ionicons name="notifications-outline" size={24} color={styles[theme].text.color} />
             <Text style={[styles.rowText, styles[theme].text]}>Notifications</Text>
          </View>
          <Ionicons name="chevron-forward-outline" size={22} color="#ccc" />
        </View>
      </TouchableOpacity>

    </SafeAreaView>
  );
};

const lightTheme = {
    container: { backgroundColor: '#f4f4f8' },
    card: { backgroundColor: '#fff' },
    text: { color: '#1a1a1a' },
};

const darkTheme = {
    container: { backgroundColor: '#121212' },
    card: { backgroundColor: '#1e1e1e' },
    text: { color: '#e0e0e0' },
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    padding: 20,
  },
  card: {
    borderRadius: 15,
    marginHorizontal: 15,
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowText: {
    fontSize: 17,
    marginLeft: 15,
    fontWeight: '500',
  },
  // Theme-specific styles are accessed via styles[theme]
  light: lightTheme,
  dark: darkTheme,
});

export default SettingsScreen;