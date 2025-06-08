import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Button, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { useAppContext } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';


const RecipeDetailScreen = ({ route }) => {
  const { recipeId } = route.params;
  const { recipes, addToShoppingList, addComment, toggleLike } = useAppContext();
  const [commentText, setCommentText] = useState('');
  const recipe = recipes.find(r => r.id === recipeId);

  if (!recipe) return <Text>Recipe not found!</Text>;

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: recipe.imageUrl }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.title}>{recipe.title}</Text>
        
        <TouchableOpacity onPress={() => toggleLike(recipe.id)} style={styles.likeContainer}>
          <Ionicons name={recipe.isLiked ? 'heart' : 'heart-outline'} size={28} color={recipe.isLiked ? '#E91E63' : '#333'} />
          <Text style={styles.likeText}>{recipe.likeCount} likes</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Ingredients</Text>
        {recipe.ingredients.map((ing, index) => <Text key={index} style={styles.listItem}>• {ing}</Text>)}
        <View style={styles.buttonContainer}><Button title="Add All to Shopping List" onPress={() => addToShoppingList(recipe.ingredients)} color="#4CAF50" /></View>

        <Text style={styles.sectionTitle}>Instructions</Text>
        {recipe.instructions.map((inst, index) => <Text key={index} style={styles.instructionItem}>{index + 1}. {inst}</Text>)}

        <Text style={styles.sectionTitle}>Comments</Text>
        <FlatList
          data={recipe.comments || []}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <View style={styles.commentItem}><Text style={styles.commentText}>{item.text}</Text></View>}
          ListEmptyComponent={<Text style={styles.emptyCommentText}>No comments yet.</Text>}
          scrollEnabled={false}
        />
        <View style={styles.commentInputContainer}>
          <TextInput style={styles.input} placeholder="Write a comment..." value={commentText} onChangeText={setCommentText} />
          <Button title="Post" onPress={() => { addComment(recipe.id, commentText); setCommentText(''); }} color="#4CAF50" />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  image: { width: '100%', height: 250 },
  content: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  likeContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },
  likeText: { marginLeft: 8, fontSize: 16, color: '#333' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 20, marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 5 },
  listItem: { fontSize: 16, lineHeight: 24 },
  instructionItem: { fontSize: 16, lineHeight: 24, marginBottom: 10 },
  buttonContainer: { marginVertical: 15 },
  commentInputContainer: { flexDirection: 'row', marginTop: 20, alignItems: 'center' },
  input: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginRight: 10, fontSize: 16 },
  commentItem: { backgroundColor: '#f9f9f9', padding: 10, borderRadius: 5, marginBottom: 8 },
  commentText: { fontSize: 16 },
  emptyCommentText: { color: '#888', fontStyle: 'italic', paddingVertical: 10 },
});

export default RecipeDetailScreen;