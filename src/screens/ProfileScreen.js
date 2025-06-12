import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Button,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAppContext } from "../context/AppContext";

const ProfileScreen = () => {
  const { user, logout } = useAppContext();
  const navigation = useNavigation();
  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading Profile...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Image
            source={
              user.profilePictureUrl
                ? { uri: user.profilePictureUrl }
                : require("../../assets/salad.jpg")
            }
            style={styles.profileImage}
          />

          <Text style={styles.nameText}>{user.username}</Text>
          <Text style={styles.emailText}>{user.email}</Text>
          <View style={styles.editButtonContainer}>
            <Button
              title="Edit Profile"
              onPress={() => navigation.navigate("EditProfile")}
            />
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>About Me</Text>

          <Text style={styles.bioText}>{user.bio || "No bio available."}</Text>
        </View>

        <View style={styles.logoutContainer}>
          <Button title="Logout" onPress={logout} color="red" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f8f8" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    backgroundColor: "#fff",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: "#4CAF50",
  },
  nameText: { fontSize: 24, fontWeight: "bold", color: "#333" },
  emailText: { fontSize: 16, color: "#666", marginTop: 4 },
  editButtonContainer: { marginTop: 15 },
  sectionContainer: { backgroundColor: "#fff", marginTop: 10, padding: 20 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  bioText: { fontSize: 16, color: "#555", lineHeight: 24 },
  logoutContainer: { margin: 20, marginTop: 30 },
});

export default ProfileScreen;
