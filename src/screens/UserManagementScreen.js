import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator,
  Alert, SafeAreaView, TextInput, TouchableOpacity, Button
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useAppContext } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';

// A single, reusable card component for displaying a user
const UserCard = ({ user, onChangeRole, onDeleteUser, onToggleActive }) => (
  <View style={styles.userCard}>
    <View style={styles.userInfo}>
      <Ionicons 
        name="person-circle-outline" 
        size={50} 
        color={user.isActive ? "#4CAF50" : "#9E9E9E"} 
        style={styles.avatar} 
      />
      <View style={styles.userDetails}>
        <Text style={styles.username}>{user.username}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Role:</Text>
            <Text style={[styles.statValue, styles[`role_${user.role}`]]}>{user.role}</Text>
          </View>
          {/* The `postCount` property comes from our updated backend service */}
          {(user.role === 'admin' || user.role === 'super_admin') && (
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Posts:</Text>
              <Text style={styles.statValue}>{user.postCount ?? 0}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
    <View style={styles.actions}>
      {/* Role Change Buttons */}
      {user.role === 'user' && (
        <TouchableOpacity style={styles.actionButton} onPress={() => onChangeRole(user, 'admin')}>
          <Ionicons name="shield-checkmark-outline" size={16} color="#fff" />
          <Text style={styles.actionButtonText}>Make Admin</Text>
        </TouchableOpacity>
      )}
      {user.role === 'admin' && (
        <TouchableOpacity style={[styles.actionButton, styles.demoteButton]} onPress={() => onChangeRole(user, 'user')}>
          <Ionicons name="shield-outline" size={16} color="#fff" />
          <Text style={styles.actionButtonText}>Make User</Text>
        </TouchableOpacity>
      )}
      
      {/* Activate/Deactivate Button */}
      <TouchableOpacity 
        style={[styles.actionButton, user.isActive ? styles.deactivateButton : styles.activateButton]} 
        onPress={() => onToggleActive(user)}
      >
        <Ionicons name={user.isActive ? "eye-off-outline" : "eye-outline"} size={16} color="#fff" />
        <Text style={styles.actionButtonText}>{user.isActive ? 'Deactivate' : 'Activate'}</Text>
      </TouchableOpacity>
      
      {/* Delete Button */}
      <TouchableOpacity style={styles.deleteButton} onPress={() => onDeleteUser(user)}>
        <Ionicons name="trash-bin" size={20} color="#f44336" />
      </TouchableOpacity>
    </View>
  </View>
);


const UserManagementScreen = () => {
  const navigation = useNavigation();
  const { fetchAllUsers, changeUserRole, deleteUser, toggleUserActiveState } = useAppContext();
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'admin', 'user'

  const loadUsers = useCallback(async () => {
    setLoading(true);
    const fetchedUsers = await fetchAllUsers();
    setAllUsers(fetchedUsers);
    setLoading(false);
  }, [fetchAllUsers]);
  
  // useFocusEffect re-fetches data every time the screen comes into view,
  // ensuring the list is fresh after creating a new user.
  useFocusEffect(useCallback(() => {
    loadUsers();
  }, [loadUsers]));

  const handleChangeRole = (user, newRole) => {
    Alert.alert("Confirm Role Change", `Are you sure you want to change ${user.username}'s role to ${newRole}?`, [
      { text: "Cancel" },
      { text: "Confirm", onPress: async () => {
          try {
            await changeUserRole(user.id, newRole);
            Alert.alert("Success", "User role has been updated.");
            loadUsers(); // Refresh the list
          } catch (error) {
            Alert.alert("Error", "Failed to update role.");
          }
      }}
    ]);
  };

  const handleDeleteUser = (user) => {
    Alert.alert("Delete User", `Are you sure you want to permanently delete ${user.username}? This cannot be undone.`, [
      { text: "Cancel" },
      { text: "Delete", style: 'destructive', onPress: async () => {
        try {
          await deleteUser(user.id);
          Alert.alert("Success", "User has been deleted.");
          loadUsers();
        } catch (error) { Alert.alert("Error", "Could not delete user."); }
      }}
    ]);
  };
  
  const handleToggleActive = (user) => {
    const action = user.isActive ? 'deactivate' : 'activate';
    Alert.alert(`Confirm ${action.charAt(0).toUpperCase() + action.slice(1)}`, `Are you sure you want to ${action} ${user.username}?`, [
      { text: "Cancel" },
      { text: "Confirm", onPress: async () => {
        try {
          await toggleUserActiveState(user.id, user.isActive);
          Alert.alert("Success", `User has been ${action}d.`);
          loadUsers();
        } catch (error) { Alert.alert("Error", `Could not ${action} user.`); }
      }}
    ]);
  };
  
  const filteredUsers = useMemo(() => {
    return allUsers
      .filter(u => u.role !== 'super_admin')
      .filter(u => filter === 'all' || u.role === filter)
      .filter(u => !searchTerm.trim() || u.username.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [allUsers, filter, searchTerm]);

  if (loading && allUsers.length === 0) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#4CAF50" /></View>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredUsers}
        renderItem={({ item }) => (
          <UserCard 
            user={item} 
            onChangeRole={handleChangeRole}
            onDeleteUser={handleDeleteUser}
            onToggleActive={handleToggleActive}
          />
        )}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <>
            <View style={styles.controlsContainer}>
              <TextInput style={styles.searchInput} placeholder="Search by name or email..." value={searchTerm} onChangeText={setSearchTerm} />
              <View style={styles.filterButtons}>
                <TouchableOpacity style={[styles.filterButton, filter === 'all' && styles.activeFilter]} onPress={() => setFilter('all')}><Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>All</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.filterButton, filter === 'admin' && styles.activeFilter]} onPress={() => setFilter('admin')}><Text style={[styles.filterText, filter === 'admin' && styles.activeFilterText]}>Admins</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.filterButton, filter === 'user' && styles.activeFilter]} onPress={() => setFilter('user')}><Text style={[styles.filterText, filter === 'user' && styles.activeFilterText]}>Users</Text></TouchableOpacity>
              </View>
            </View>
            <View style={styles.headerActions}>
              <Button title="+ Create New User" onPress={() => navigation.navigate('CreateUser')} color="#4CAF50" />
            </View>
          </>
        }
        ListEmptyComponent={<Text style={styles.emptyText}>No users match your criteria.</Text>}
        onRefresh={loadUsers}
        refreshing={loading}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f4f8' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    controlsContainer: { padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
    headerActions: { paddingHorizontal: 15, paddingTop: 15, paddingBottom: 5, backgroundColor: '#fff' },
    searchInput: { backgroundColor: '#f0f0f0', paddingHorizontal: 15, paddingVertical: 12, borderRadius: 25, fontSize: 16, marginBottom: 15 },
    filterButtons: { flexDirection: 'row', justifyContent: 'space-around' },
    filterButton: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20, backgroundColor: '#e0e0e0' },
    activeFilter: { backgroundColor: '#4CAF50' },
    filterText: { fontWeight: 'bold', color: '#555' },
    activeFilterText: { color: '#fff' },
    list: { paddingHorizontal: 15, paddingTop: 15 },
    userCard: { backgroundColor: '#fff', borderRadius: 10, marginBottom: 15, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, shadowOffset: { width: 0, height: 1 } },
    userInfo: { flexDirection: 'row', alignItems: 'center', padding: 15 },
    avatar: { marginRight: 15 },
    userDetails: { flex: 1 },
    username: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    email: { fontSize: 14, color: '#777', flexShrink: 1 },
    statsContainer: { flexDirection: 'row', marginTop: 8 },
    stat: { marginRight: 20, flexDirection: 'row', alignItems: 'baseline' },
    statLabel: { fontSize: 12, color: '#555' },
    statValue: { fontWeight: 'bold', marginLeft: 4, fontSize: 13 },
    role_admin: { color: '#FFA000' },
    role_user: { color: '#1976D2' },
    actions: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#f0f0f0', padding: 10, alignItems: 'center' },
    actionButton: { backgroundColor: '#2196F3', padding: 8, borderRadius: 5, flexDirection: 'row', alignItems: 'center' },
    demoteButton: { backgroundColor: '#FF9800' },
    activateButton: { backgroundColor: '#4CAF50' },
    deactivateButton: { backgroundColor: '#757575' },
    actionButtonText: { color: '#fff', fontWeight: 'bold', marginLeft: 5 },
    deleteButton: { padding: 8 },
    emptyText: { textAlign: 'center', marginTop: 50, color: '#666', fontSize: 16 },
});

export default UserManagementScreen;