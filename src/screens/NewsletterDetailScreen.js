import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Image,
  ActivityIndicator,
} from "react-native";
import { useAppContext } from "../context/AppContext";

const NewsletterDetailScreen = ({ route }) => {
  const { newsletterId } = route.params;
  const { newsletters } = useAppContext();

  const newsletter = newsletters.find((n) => n.id === newsletterId);

  if (!newsletter) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Loading newsletter...</Text>
      </View>
    );
  }

  const imageSource = newsletter.imageUrl
    ? { uri: newsletter.imageUrl }
    : require("../../assets/pancakes.jpg");

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Image source={imageSource} style={styles.heroImage} />
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{newsletter.title}</Text>

          <View style={styles.metaContainer}>
            <Text style={styles.metaText}>
              By {newsletter.author?.username || "Admin"}
            </Text>
            <Text style={styles.metaSeparator}>•</Text>
            <Text style={styles.metaText}>
              {new Date(newsletter.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </View>

          <View style={styles.separator} />

          <Text style={styles.bodyContent}>{newsletter.content}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  heroImage: {
    width: "100%",
    height: 250,
    backgroundColor: "#e0e0e0",
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 12,
    lineHeight: 36,
  },
  metaContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  metaText: {
    fontSize: 14,
    color: "#888",
  },
  metaSeparator: {
    marginHorizontal: 8,
    color: "#ccc",
  },
  separator: {
    height: 1,
    backgroundColor: "#e5e5e5",
    marginVertical: 15,
  },
  bodyContent: {
    fontSize: 17,
    lineHeight: 28,
    color: "#333",
  },
});

export default NewsletterDetailScreen;
