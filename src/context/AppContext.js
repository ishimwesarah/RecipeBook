import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as api from '../services/api';


export const AppContext = createContext();


export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); 

  
  const [recipes, setRecipes] = useState([]);
  const [newsletters, setNewsletters] = useState([]);
  const [shoppingList, setShoppingList] = useState([]);


  useEffect(() => {
    const bootstrapApp = async () => {
      try {
       
        const [recipeResponse, newsletterResponse] = await Promise.all([
          api.getAllRecipes(),
          api.getNewsletters(),
        ]);
       
        setRecipes(recipeResponse?.data?.recipes || recipeResponse?.data || []);
        setNewsletters(newsletterResponse?.data?.posts || newsletterResponse?.data || []);

        
        const userToken = await AsyncStorage.getItem('userToken');
        if (userToken) {
          const storedUser = await AsyncStorage.getItem('userData');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
          
          const listResponse = await api.getMyShoppingList();
          setShoppingList(listResponse.data || []);
        }
      } catch (e) {
        console.error("Error bootstrapping app:", e.message);
       
        await AsyncStorage.clear();
      } finally {
        
        setIsLoading(false);
      }
    };

    bootstrapApp();
  }, []); 
  const login = async (email, password) => {
    const response = await api.loginUser(email, password);
    const { user: userData, token } = response.data;
    setUser(userData);
    await AsyncStorage.setItem('userToken', token);
    await AsyncStorage.setItem('userData', JSON.stringify(userData));
  
    const [recipeResponse, newsletterResponse, listResponse] = await Promise.all([
      api.getAllRecipes(),
      api.getNewsletters(),
      api.getMyShoppingList(),
    ]);
    setRecipes(recipeResponse?.data || []);
    setNewsletters(newsletterResponse?.data?.posts || []);
    setShoppingList(listResponse.data || []);
  };
  
  const signup = (username, email, password) => api.signupUser(username, email, password);
  
  const logout = async () => {
    setUser(null);
    setShoppingList([]); 
    await AsyncStorage.multiRemove(['userToken', 'userData']);
  };


  const addRecipe = async (recipeData) => {
    if (user?.role !== 'admin') throw new Error("Not authorized");
    const newRecipe = await api.createRecipe(recipeData);
    setRecipes(prev => [...prev, newRecipe.data]);
  };

  const updateRecipe = async (recipeId, updatedData) => {
    if (user?.role !== 'admin') throw new Error("Not authorized");
    const updatedRecipe = await api.updateRecipeById(recipeId, updatedData);
    setRecipes(prev => prev.map(r => r.id === recipeId ? updatedRecipe.data : r));
  };
  
  const deleteRecipe = async (recipeId) => {
    if (user?.role !== 'admin') throw new Error("Not authorized");
    await api.deleteRecipeById(recipeId);
    setRecipes(prev => prev.filter(r => r.id !== recipeId));
  };

  const addNewsletter = async (formData) => {
    if (user?.role !== 'admin') throw new Error("Not authorized");
    await api.createNewsletter(formData);
    
    const updatedNewslettersResponse = await api.getNewsletters();
    setNewsletters(updatedNewslettersResponse?.data?.posts || []);
  };

  
  const toggleLike = async (recipeId) => {
    if (!user) {
      Alert.alert("Login Required", "You must be logged in to like a recipe.");
      return;
    }
    await api.toggleRecipeLike(recipeId);
    
    const recipeData = await api.getAllRecipes();
    setRecipes(recipeData.data || []);
  };

  const addComment = async (recipeId, text) => {
    const newComment = await api.addCommentToRecipe(recipeId, text);
    setRecipes(prev => prev.map(r => r.id === recipeId ? { ...r, comments: [...r.comments, newComment.data] } : r));
  };

  const updateComment = async (recipeId, commentId, text) => {
    const updatedComment = await api.updateCommentById(commentId, text);
    setRecipes(prev => prev.map(r => {
      if (r.id === recipeId) {
        return { ...r, comments: r.comments.map(c => c.id === commentId ? updatedComment.data : c) };
      }
      return r;
    }));
  };

  const deleteComment = async (recipeId, commentId) => {
    await api.deleteCommentById(commentId);
    setRecipes(prev => prev.map(r => {
      if (r.id === recipeId) {
        return { ...r, comments: r.comments.filter(c => c.id !== commentId) };
      }
      return r;
    }));
  };
  
  
  const addToShoppingList = async (ingredients) => {
    if (!user) {
      Alert.alert("Login Required", "You must be logged in to use the shopping list.");
      return;
    }
    const itemNames = ingredients.map(ing => ing.split(',')[0].trim()).filter(Boolean);
    if (itemNames.length === 0) return;

    try {
      await api.addItemsToShoppingList(itemNames);
      const listResponse = await api.getMyShoppingList();
      setShoppingList(listResponse.data || []);
      Alert.alert("Success", `${itemNames.length} item(s) added to your shopping list!`);
    } catch (error) {
      console.error("Failed to add items to shopping list:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || "An error occurred. Please try again.";
      Alert.alert("Error", errorMessage);
    }
  };

  const toggleShoppingListItem = async (itemId) => {
    await api.toggleShoppingListItemById(itemId);
    setShoppingList(prev => prev.map(i => i.id === itemId ? { ...i, isChecked: !i.isChecked } : i));
  };

  const deleteShoppingListItem = async (itemId) => {
    await api.deleteShoppingListItemById(itemId);
    setShoppingList(prev => prev.filter(i => i.id !== itemId));
  };

  
  const value = {
  
    user,
    isLoading,
    recipes,
    shoppingList,
    newsletters,
    
   
    login,
    signup,
    logout,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    addNewsletter,
    toggleLike,
    addComment,
    updateComment,
    deleteComment,
    addToShoppingList,
    toggleShoppingListItem,
    deleteShoppingListItem,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};


export const useAppContext = () => {
  return useContext(AppContext);
};