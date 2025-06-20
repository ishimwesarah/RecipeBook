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
  Animated,
} from "react-native";
import { RectButton, Swipeable } from "react-native-gesture-handler";
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

  const renderRightActions = (progress, dragX, item) => {
    const trans = dragX.interpolate({
      inputRange: [0, 50, 100, 101],
      outputRange: [0, 0, 0, 1],
    });

    return (
      <RectButton
        style={styles.rightAction}
        onPress={() => handleDelete(item)}
      >
        <Animated.View
          style={[
            styles.actionIcon,
            {
              transform: [{ translateX: trans }],
            },
          ]}
        >
          <Ionicons name="trash-bin" size={24} color="white" />
        </Animated.View>
      </RectButton>
    );
  };

  const renderItem = ({ item }) => (
    <Swipeable
      renderRightActions={(progress, dragX) =>
        renderRightActions(progress, dragX, item)
      }
      rightThreshold={40}
    >
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
      </View>
    </Swipeable>
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
    backgroundColor: "white",
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
  rightAction: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E53935",
    width: 80,
    height: "100%",
  },
  actionIcon: {
    width: 30,
    marginHorizontal: 10,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
  },
});

export default ShoppingListScreen;