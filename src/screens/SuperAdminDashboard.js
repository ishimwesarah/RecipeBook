import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useAppContext } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import * as api from '../services/api';

const StatCard = ({ icon, label, value, color }) => (
  <View style={styles.statCard}>
    <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const NavButton = ({ icon, title, description, onPress }) => (
  <TouchableOpacity style={styles.navButton} onPress={onPress}>
    <Ionicons name={icon} size={24} color="#4CAF50" />
    <View style={styles.navButtonTextContainer}>
      <Text style={styles.navButtonTitle}>{title}</Text>
      <Text style={styles.navButtonDescription}>{description}</Text>
    </View>
    <Ionicons name="chevron-forward-outline" size={20} color="#ccc" />
  </TouchableOpacity>
);

const SuperAdminDashboard = () => {
  const navigation = useNavigation();
  const { user, logout } = useAppContext();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Logout", 
          onPress: async () => {
            await logout();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Auth' }],
            });
          } 
        }
      ]
    );
  };

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchStats = async () => {
        try {
          setLoading(true);
          const response = await api.getDashboardStats();
          if (isActive && response.success) {
            setStats(response.data);
          }
        } catch (error) {
          console.error("Failed to fetch dashboard stats:", error);
        } finally {
          if (isActive) {
            setLoading(false);
          }
        }
      };

      fetchStats();

      return () => {
        isActive = false;
      };
    }, [])
  );

  if (loading || !stats) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Welcome Back</Text>
            <Text style={styles.headerSubtitle}>{user?.username}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>App Review</Text>
        <View style={styles.statsGrid}>
          <StatCard icon="people" label="Users" value={stats.users.total} color="#2196F3" />
          <StatCard icon="restaurant" label="Recipes" value={stats.recipes.total} color="#4CAF50" />
          <StatCard icon="newspaper" label="Posts" value={stats.posts.total} color="#FF9800" />
          <StatCard icon="heart" label="Likes" value={stats.interactions.likes} color="#E91E63" />
        </View>

        <Text style={styles.sectionTitle}>Management</Text>
        <View style={styles.navContainer}>
          <NavButton 
            title="Users"
            description="Manage all users"
            icon="people-circle"
            onPress={() => navigation.navigate('SuperAdminFlow', { 
              screen: 'MainAppTabs', 
              params: { screen: 'Manage Users' } 
            })}
          />
          <NavButton 
            title="Content"
            description="Manage recipes and posts"
            icon="document-text"
            onPress={() => navigation.navigate('SuperAdminFlow', {
              screen: 'MainAppTabs',
              params: { screen: 'Recipes' }
            })}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f4f4f8' 
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#333', 
    paddingHorizontal: 20, 
    marginTop: 20, 
    marginBottom: 10 
  },
  centered: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  scrollContent: { 
    paddingBottom: 20 
  },
  header: { 
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#4CAF50' 
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoutButton: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#fff' 
  },
  headerSubtitle: { 
    fontSize: 14, 
    color: 'rgba(255,255,255,0.8)', 
    marginTop: 2 
  },
  sectionTitle: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#333', 
    paddingHorizontal: 16, 
    marginTop: 16, 
    marginBottom: 8 
  },
  statsGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between', 
    paddingHorizontal: 12,
    marginBottom: 8
  },
  statCard: { 
    width: '48%', 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    padding: 12, 
    marginBottom: 12, 
    alignItems: 'center', 
    elevation: 1, 
    shadowColor: '#000', 
    shadowOpacity: 0.05, 
    shadowRadius: 4 
  },
  iconContainer: { 
    width: 48, 
    height: 48, 
    borderRadius: 24, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 8 
  },
  statValue: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#333' 
  },
  statLabel: { 
    fontSize: 12, 
    color: '#777', 
    marginTop: 2 
  },
  navContainer: { 
    marginHorizontal: 12 
  },
  navButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    padding: 16, 
    borderRadius: 12, 
    marginBottom: 8, 
    elevation: 1 
  },
  navButtonTextContainer: { 
    flex: 1, 
    marginLeft: 12 
  },
  navButtonTitle: { 
    fontSize: 15, 
    fontWeight: '600', 
    color: '#333' 
  },
  navButtonDescription: { 
    fontSize: 12, 
    color: '#777', 
    marginTop: 2 
  },
});

export default SuperAdminDashboard;