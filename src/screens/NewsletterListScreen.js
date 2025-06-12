import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { useAppContext } from "../context/AppContext";
import { Ionicons } from "@expo/vector-icons";
import NewsletterCard from "../components/NewsletterCard";

const NewsletterListScreen = ({ navigation }) => {
  const { user, newsletters = [], isLoading } = useAppContext();

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Fetching Latest News...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={newsletters}
        renderItem={({ item }) => (
          <NewsletterCard
            item={item}
            onPress={() =>
              navigation.navigate("NewsletterDetail", { newsletterId: item.id })
            }
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>
              No newsletters have been published yet.
            </Text>
          </View>
        }
        contentContainerStyle={styles.list}
      />

      {user?.role === "admin" && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate("CreateNewsletter")}
        >
          <Ionicons name="add" size={32} color="white" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f4f8" },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: { marginTop: 10, fontSize: 16, color: "#666" },
  list: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  emptyText: { textAlign: "center", fontSize: 16, color: "#666" },
  fab: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    right: 20,
    bottom: 20,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

export default NewsletterListScreen;
