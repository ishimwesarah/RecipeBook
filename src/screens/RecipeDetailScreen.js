import React, { useState, useMemo, useEffect } from 'react';
import { 
  View, Text, StyleSheet, Image, Button, 
  TextInput, FlatList, TouchableOpacity, Alert, SafeAreaView, ActivityIndicator 
} from 'react-native';
import { useAppContext } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';

// --- A separate component for a single comment, to keep the main component clean. ---
const CommentItem = ({ comment, recipeId }) => {
  const { user, deleteComment, updateComment } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);

  // Determine user permissions for this specific comment.
  const canDelete = user?.id === comment.author?.id || user?.role === 'admin' || user?.role === 'super_admin';
  const canEdit = user?.id === comment.author?.id;

  const handleDelete = () => {
    Alert.alert("Delete Comment", "Are you sure you want to delete this comment?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
          try {
            await deleteComment(recipeId, comment.id);
          } catch (error) {
            Alert.alert("Error", "Failed to delete comment");
          }
        }
      },
    ]);
  };

  const handleUpdate = async () => {
    if (editText.trim()) {
      try {
        await updateComment(recipeId, comment.id, editText);
        setIsEditing(false); // Close the editing input on save
      } catch (error) {
        Alert.alert("Error", "Failed to update comment");
      }
    } else {
      Alert.alert("Cannot be empty", "Comment text cannot be empty.");
    }
  };

  return (
    <View style={styles.commentItem}>
      <View style={styles.commentHeader}>
        <Text style={styles.commentAuthor}>{comment.author?.username || 'Unknown User'}</Text>
        <View style={styles.commentActions}>
          {canEdit && (
            <TouchableOpacity onPress={() => setIsEditing(!isEditing)} style={{ padding: 5 }}>
              <Ionicons name={isEditing ? "close-circle" : "pencil"} size={18} color="#666" />
            </TouchableOpacity>
          )}
          {canDelete && (
            <TouchableOpacity onPress={handleDelete} style={{ marginLeft: 10, padding: 5 }}>
              <Ionicons name="trash" size={18} color="#E53935" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      {isEditing ? (
        <>
          <TextInput
            value={editText}
            onChangeText={setEditText}
            style={styles.editInput}
            multiline
            autoFocus={true}
          />
          <Button title="Save Changes" onPress={handleUpdate} color="#4CAF50" />
        </>
      ) : (
        <Text style={styles.commentText}>{comment.text}</Text>
      )}
    </View>
  );
};

// --- A component for a single, selectable ingredient row. ---
const IngredientItem = ({ item, isSelected, onSelect }) => {
  return (
    <TouchableOpacity style={styles.ingredientRow} onPress={onSelect}>
      <Ionicons
        name={isSelected ? "checkbox" : "square-outline"}
        size={24}
        color={isSelected ? "#4CAF50" : "#888"}
      />
      <Text style={[styles.listItem, isSelected && styles.ingredientSelected]}>
        {item}
      </Text>
    </TouchableOpacity>
  );
};

// --- The Main Recipe Detail Screen Component ---
const RecipeDetailScreen = ({ route, navigation }) => {
  const { recipeId } = route.params;
  const { user, recipes, addToShoppingList, addComment, toggleLike, deleteRecipe } = useAppContext();
  
  const recipe = recipes.find(r => r.id === recipeId);

  // --- LOCAL STATE for this screen ---
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [isAddingToList, setIsAddingToList] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isTogglingLike, setIsTogglingLike] = useState(false);

  // --- HANDLERS ---
  const handleToggleIngredient = (ingredient) => {
    if (selectedIngredients.includes(ingredient)) {
      setSelectedIngredients(current => current.filter(item => item !== ingredient));
    } else {
      setSelectedIngredients(current => [...current, ingredient]);
    }
  };

  const handleAddSelectedToList = async () => {
    if (selectedIngredients.length === 0) {
      Alert.alert("No Items Selected", "Please select ingredients to add.");
      return;
    }
    setIsAddingToList(true);
    try {
      await addToShoppingList(selectedIngredients);
      setSelectedIngredients([]); // Clear selection on success
    } catch (error) {
      console.error("Error from UI while adding to list:", error);
      Alert.alert("Error", "Failed to add items to shopping list");
    } finally {
      setIsAddingToList(false);
    }
  };

  // --- useMemo with corrected dependency array ---
  const { isLikedByUser, likeCount } = useMemo(() => {
    if (!recipe?.likes) return { isLikedByUser: false, likeCount: 0 };
    return {
      isLikedByUser: recipe.likes.some(like => like.user?.id === user?.id),
      likeCount: recipe.likes.length,
    };
  }, [recipe?.likes, user?.id]); // More specific dependency

const handleToggleLike = async () => {
  try {
    if (!user) {
      Alert.alert("Login Required", "Please login to like recipes");
      navigation.navigate('Login');
      return;
    }
    
    await toggleLike(recipe.id);
  } catch (error) {
    console.error("Like error:", error);
    Alert.alert("Error", error.message || "Failed to like recipe");
  }
};

const handleAddComment = async () => {
  try {
    if (!user) {
      Alert.alert("Login Required", "Please login to comment");
      navigation.navigate('Login');
      return;
    }
    
    if (!commentText.trim()) {
      Alert.alert("Error", "Comment cannot be empty");
      return;
    }
    
    await addComment(recipe.id, commentText);
    setCommentText('');
  } catch (error) {
    console.error("Comment error:", error);
    Alert.alert("Error", error.message || "Failed to post comment");
  }
};

  const handleDeleteRecipe = () => {
    Alert.alert("Delete Recipe", "Are you sure? This action cannot be undone.", [
      { text: "Cancel" },
      { text: "Yes, Delete", style: "destructive", onPress: async () => {
          try {
            await deleteRecipe(recipe.id);
            navigation.goBack();
          } catch (error) {
            Alert.alert("Error", "Failed to delete recipe");
          }
        } 
      },
    ]);
  };

  // Loading state for the entire page
  if (!recipe) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={{ marginTop: 10 }}>Loading recipe details...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={recipe.comments || []}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={
          <>
            <Image source={{ uri: recipe.imageUrl }} style={styles.image} />
            <View style={styles.content}>
              <Text style={styles.title}>{recipe.title}</Text>
              
              <TouchableOpacity 
                onPress={handleToggleLike} 
                style={[styles.likeContainer, isTogglingLike && styles.disabled]} 
                disabled={!user || isTogglingLike}
              >
                {isTogglingLike ? (
                  <ActivityIndicator size="small" color="#E91E63" />
                ) : (
                  <Ionicons 
                    name={isLikedByUser ? 'heart' : 'heart-outline'} 
                    size={28} 
                    color={isLikedByUser ? '#E91E63' : '#333'} 
                  />
                )}
                <Text style={styles.likeText}>{likeCount} likes</Text>
              </TouchableOpacity>
              
              {(user?.role === 'admin' || user?.role === 'super_admin') && (
                <View style={styles.adminControlsContainer}>
                  <Button title="Edit Recipe" onPress={() => navigation.navigate('EditRecipe', { recipeId: recipe.id })} />
                  <Button title="Delete Recipe" onPress={handleDeleteRecipe} color="#E53935" />
                </View>
              )}

              <Text style={styles.sectionTitle}>Ingredients</Text>
              {recipe.ingredients && recipe.ingredients.map((item, index) => (
                <IngredientItem
                  key={`${item}-${index}`}
                  item={item}
                  isSelected={selectedIngredients.includes(item)}
                  onSelect={() => handleToggleIngredient(item)}
                />
              ))}
              
              {user?.role !== "super_admin" && (
                <View style={styles.buttonContainer}>
                  {isAddingToList ? (
                    <View style={styles.loadingWrapper}>
                      <ActivityIndicator size="small" color="#4CAF50" />
                      <Text style={styles.loadingText}>Adding to list...</Text>
                    </View>
                  ) : (
                    <Button 
                      title={`Add ${selectedIngredients.length} Item(s) to List`}
                      onPress={handleAddSelectedToList} 
                      color="#4CAF50"
                      disabled={selectedIngredients.length === 0}
                    />
                  )}
                </View>
              )}

              <Text style={styles.sectionTitle}>Instructions</Text>
              {recipe.instructions && recipe.instructions.map((instruction, index) => (
                <Text key={index} style={styles.instructionItem}>{index + 1}. {instruction}</Text>
              ))}

              <Text style={styles.sectionTitle}>Comments ({recipe.comments?.length || 0})</Text>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.commentListContainer}>
            <CommentItem comment={item} recipeId={recipe.id} />
          </View>
        )}
        ListFooterComponent={
          <View style={styles.content}>
            <View style={styles.commentInputContainer}>
              <TextInput 
                style={[styles.input, !user && styles.disabledInput]} 
                placeholder={user ? "Write a comment..." : "Login to comment"} 
                value={commentText} 
                onChangeText={setCommentText} 
                editable={!!user && !isSubmittingComment}
                multiline
              />
              {isSubmittingComment ? (
                <View style={styles.submitButtonContainer}>
                  <ActivityIndicator size="small" color="#4CAF50" />
                </View>
              ) : (
                <Button 
                  title="Post" 
                  onPress={handleAddComment} 
                  color="#4CAF50" 
                  disabled={!user || !commentText.trim()} 
                />
              )}
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.content}>
            <Text style={styles.emptyCommentText}>No comments yet. Be the first!</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  image: { width: '100%', height: 250, backgroundColor: '#e0e0e0' },
  content: { paddingHorizontal: 20, paddingTop: 10 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  likeContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginVertical: 15,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  likeText: { marginLeft: 8, fontSize: 16, color: '#555' },
  disabled: { opacity: 0.6 },
  adminControlsContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-evenly', 
    paddingVertical: 10, 
    marginVertical: 10, 
    backgroundColor: '#f0f0f0', 
    borderRadius: 8 
  },
  sectionTitle: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    marginTop: 20, 
    marginBottom: 10, 
    borderBottomWidth: 1, 
    borderBottomColor: '#eee', 
    paddingBottom: 5, 
    color: '#333' 
  },
  instructionItem: { fontSize: 16, lineHeight: 26, marginBottom: 12, color: '#444' },
  buttonContainer: { marginVertical: 20 },
  ingredientRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  listItem: { fontSize: 16, lineHeight: 26, color: '#444', marginLeft: 12 },
  ingredientSelected: { fontWeight: 'bold', color: '#4CAF50' },
  loadingWrapper: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#e8f5e9', 
    paddingVertical: 12, 
    borderRadius: 8 
  },
  loadingText: { marginLeft: 10, fontSize: 16, color: '#388E3C', fontWeight: '500' },
  commentListContainer: { paddingHorizontal: 20 },
  commentItem: { 
    backgroundColor: '#f9f9f9', 
    padding: 12, 
    borderRadius: 8, 
    marginBottom: 10, 
    borderWidth: 1, 
    borderColor: '#eee' 
  },
  commentHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 8 
  },
  commentAuthor: { fontWeight: 'bold', color: '#333' },
  commentActions: { flexDirection: 'row' },
  commentText: { fontSize: 16, color: '#333', lineHeight: 22 },
  editInput: { 
    backgroundColor: '#fff', 
    borderWidth: 1, 
    borderColor: '#ddd', 
    borderRadius: 5, 
    padding: 10, 
    marginBottom: 10, 
    fontSize: 16 
  },
  emptyCommentText: { 
    color: '#888', 
    fontStyle: 'italic', 
    textAlign: 'center', 
    paddingVertical: 20 
  },
  commentInputContainer: { 
    flexDirection: 'row', 
    marginTop: 10, 
    marginBottom: 40, 
    alignItems: 'flex-end' 
  },
  input: { 
    flex: 1, 
    borderWidth: 1, 
    borderColor: '#ddd', 
    borderRadius: 8, 
    padding: 12, 
    marginRight: 10, 
    fontSize: 16,
    maxHeight: 100,
    minHeight: 44,
  },
  disabledInput: {
    backgroundColor: '#f5f5f5',
    color: '#999',
  },
  submitButtonContainer: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default RecipeDetailScreen;