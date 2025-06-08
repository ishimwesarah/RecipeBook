import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

const RecipeCard = ({ recipe, onPress }) => (
  <TouchableOpacity style={styles.container} onPress={onPress}>
    <Image source={{ uri: recipe.imageUrl }} style={styles.image} />
    <View style={styles.textContainer}>
      <Text style={styles.title}>{recipe.title}</Text>
      <Text style={styles.cookTime}>{recipe.cookTime}</Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff', borderRadius: 8, overflow: 'hidden', marginBottom: 16, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  image: { width: '100%', height: 150 },
  textContainer: { padding: 12 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  cookTime: { fontSize: 14, color: '#666' },
});

export default RecipeCard;