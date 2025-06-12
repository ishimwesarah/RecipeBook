import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

const RecipeCard = ({ recipe, onPress }) => {
  // --- ✅ THE FIX IS HERE ---
  // This logic intelligently determines the image source for the recipe.
  // 1. It checks if `recipe.imageUrl` exists and is a non-empty string.
  // 2. If yes, it creates a source object for a network image: { uri: recipe.imageUrl }.
  // 3. If no, it falls back to using the local placeholder image.
  const imageSource = (recipe.imageUrl && typeof recipe.imageUrl === 'string')
    ? { uri: recipe.imageUrl }
    : require('../../assets/pancakes.jpg'); // Using a specific placeholder for recipes

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      {/* The `source` prop of the Image component now uses our smart `imageSource` variable */}
      <Image source={imageSource} style={styles.image} />
      
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {recipe.title}
        </Text>
        <Text style={styles.cookTime}>
          <Ionicons name="time-outline" size={14} color="#666" /> {recipe.cookTime}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// --- We need to import Ionicons for the clock icon ---
import { Ionicons } from '@expo/vector-icons';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 160,
    backgroundColor: '#e0e0e0', // A placeholder color while the image loads
  },
  textContainer: {
    padding: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  cookTime: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    flexDirection: 'row', // To align icon and text
    alignItems: 'center',
  },
});

export default RecipeCard;