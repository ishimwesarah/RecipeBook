import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAppContext } from "../context/AppContext";
import { Ionicons } from "@expo/vector-icons";

const ProfileActionButton = ({ icon, title, onPress }) => (
  <TouchableOpacity style={styles.actionButton} onPress={onPress}>
    <View style={styles.actionIconWrapper}>
      <Ionicons name={icon} size={22} color="#4CAF50" />
    </View>
    <Text style={styles.actionText}>{title}</Text>
    <Ionicons name="chevron-forward-outline" size={22} color="#ccc" />
  </TouchableOpacity>
);

const ProfileScreen = () => {
  const { user, logout } = useAppContext();
  const navigation = useNavigation();

  if (!user) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  const isSuperAdmin = user.role === "super_admin";
  const imageSource = user.profilePictureUrl
    ? { uri: user.profilePictureUrl }
    : require("../../assets/pancakes.jpg");

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Image source={imageSource} style={styles.profileImage} />
          </View>
          <Text style={styles.nameText}>{user.username}</Text>
          <Text style={styles.emailText}>{user.email}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>About Me</Text>
          <Text style={styles.bioText}>
            {user.bio ||
              "No bio provided. You can add one by editing your profile."}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account Settings</Text>
          <ProfileActionButton
            icon="pencil-outline"
            title="Edit Profile"
            onPress={() => navigation.navigate("EditProfile")}
          />

          <ProfileActionButton
            icon="settings-outline"
            title="App Settings"
            onPress={() => navigation.navigate("Settings")}
          />
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Ionicons name="log-out-outline" size={22} color="#E53935" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f4f8" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollContent: { paddingBottom: 40 },
  header: {
    alignItems: "center",
    paddingVertical: 30,
    backgroundColor: "#fff",
  },
  avatarContainer: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 10,
    backgroundColor: "#fff",
    borderRadius: 75,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 4,
    borderColor: "#4CAF50",
  },
  nameText: { fontSize: 26, fontWeight: "bold", marginTop: 15, color: "#333" },
  emailText: { fontSize: 16, marginTop: 4, color: "#777" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 15,
    marginTop: 25,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  bioText: { fontSize: 16, lineHeight: 24, fontStyle: "italic", color: "#555" },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
  },
  actionIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    backgroundColor: "#e8f5e9",
  },
  actionText: { flex: 1, fontSize: 16, fontWeight: "500", color: "#333" },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    marginTop: 30,
    padding: 15,
    backgroundColor: "#ffebee",
    borderRadius: 15,
  },
  logoutButtonText: {
    color: "#E53935",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
});

export default ProfileScreen;
