import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import RecipeCard from '../components/RecipeCard';
import { useAppContext } from '../context/AppContext';

const RecipeListScreen = ({ navigation }) => {
  const { recipes } = useAppContext();

  return (
    <View style={styles.container}>
      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <RecipeCard recipe={item} onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.id })} />
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  list: { padding: 16 },
});

export default RecipeListScreen;