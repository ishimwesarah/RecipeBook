import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useAppContext } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';

const ShoppingListScreen = () => {
  const { shoppingList, toggleShoppingListItem } = useAppContext();

  return (
    <View style={styles.container}>
      <FlatList
        data={shoppingList}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => toggleShoppingListItem(item.id)}>
            <View style={styles.listItem}>
              <Ionicons name={item.checked ? "checkbox" : "square-outline"} size={24} color={item.checked ? "green" : "black"} style={styles.icon} />
              <Text style={[styles.itemText, item.checked && styles.itemTextChecked]}>{item.item}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Your shopping list is empty!</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 20, paddingTop: 20 },
  listItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  icon: { marginRight: 15 },
  itemText: { fontSize: 18 },
  itemTextChecked: { textDecorationLine: 'line-through', color: '#aaa' },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#666' }
});

export default ShoppingListScreen;