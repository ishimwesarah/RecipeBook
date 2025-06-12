import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { useAppContext } from "../context/AppContext";
import { Ionicons } from "@expo/vector-icons";

const ShoppingListScreen = () => {
  const {
    shoppingList = [],
    toggleShoppingListItem,
    deleteShoppingListItem,
    isLoading,
  } = useAppContext();

  const handleDelete = (item) => {
    Alert.alert(
      "Delete Item",
      `Are you sure you want to remove "${item.item}" from your list?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Delete",
          style: "destructive",
          onPress: () => deleteShoppingListItem(item.id),
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.listItem}>
      <TouchableOpacity
        onPress={() => toggleShoppingListItem(item.id)}
        style={styles.itemContent}
      >
        <Ionicons
          name={item.isChecked ? "checkbox" : "square-outline"}
          size={26}
          color={item.isChecked ? "#4CAF50" : "#333"}
        />
        <Text
          style={[styles.itemText, item.isChecked && styles.itemTextChecked]}
        >
          {item.item}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => handleDelete(item)}
        style={styles.deleteButton}
      >
        <Ionicons name="trash-bin-outline" size={24} color="#E53935" />
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={shoppingList}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={
          <Text style={styles.header}>My Shopping List</Text>
        }
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>
              Your list is empty. Add ingredients from a recipe!
            </Text>
          </View>
        }
        contentContainerStyle={{ flexGrow: 1 }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    padding: 20,
    paddingBottom: 10,
    color: "#333",
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  itemContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  itemText: {
    fontSize: 18,
    marginLeft: 15,
    color: "#333",
  },
  itemTextChecked: {
    textDecorationLine: "line-through",
    color: "#aaa",
  },
  deleteButton: {
    padding: 8,
    marginLeft: 10,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
  },
});

export default ShoppingListScreen;
