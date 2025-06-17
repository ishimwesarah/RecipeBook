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
    if (user?.role !== 'admin'|| user?.role === 'super_admin') throw new Error("Not authorized");
    const newRecipe = await api.createRecipe(recipeData);
    setRecipes(prev => [...prev, newRecipe.data]);
  };

  const updateRecipe = async (recipeId, updatedData) => {
    if (user?.role !== 'admin'|| user?.role === 'super_admin') throw new Error("Not authorized");
    const updatedRecipe = await api.updateRecipeById(recipeId, updatedData);
    setRecipes(prev => prev.map(r => r.id === recipeId ? updatedRecipe.data : r));
  };
  
  const deleteRecipe = async (recipeId) => {
    if (user?.role !== 'admin'|| user?.role === 'super_admin') throw new Error("Not authorized");
    await api.deleteRecipeById(recipeId);
    setRecipes(prev => prev.filter(r => r.id !== recipeId));
  };

  const addNewsletter = async (formData) => {
    // This check now correctly allows both admin and super_admin
    const isAdminOrSuperAdmin = user?.role === 'admin' || user?.role === 'super_admin';
    if (!isAdminOrSuperAdmin) {
      throw new Error("You are not authorized to perform this action.");
    }
    await api.createNewsletter(formData);
    // Re-fetch the list to ensure perfect sync
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

  const forgotPassword = async (email) => {
    // This function just calls the API and lets the UI handle the response.
    return api.requestPasswordReset(email);
  };

  const performPasswordReset = async (token, newPassword) => {
    return api.resetPassword(token, newPassword);
  };
  const updateNewsletter = async (postId, payload) => {
    if (user?.role !== 'admin') throw new Error("Not authorized");
    try {
      await api.updateNewsletterById(postId, payload);
      // Re-fetch the list for perfect sync
      const newsletterResponse = await api.getNewsletters();
      setNewsletters(newsletterResponse?.data?.posts || []);
    } catch (error) {
      console.error("Failed to update newsletter:", error);
      throw error;
    }
  };

  const deleteNewsletter = async (postId) => {
    if (user?.role !== 'admin') throw new Error("Not authorized");
    try {
      await api.deleteNewsletterById(postId);
      // Remove from local state for instant UI feedback
      setNewsletters(prev => prev.filter(p => p.id !== postId));
    } catch (error) {
      console.error("Failed to delete newsletter:", error);
      throw error;
    }
  };

  const updateUserProfile = async (userId, profileData) => {
  try {
    const response = await api.updateUserProfile(userId, profileData);
    // Update the currently logged-in user's data in the state
    setUser(response.data.user);
    await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
    return response.data;
  } catch (error) {
    console.error("Failed to update profile:", error);
    throw error;
  }
};

// --- ✅ NEW FUNCTIONS FOR SUPER ADMIN ---
const fetchAllUsers = async () => {
  try {
    const response = await api.getAllUsers();
    return response.data?.users || [];
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return [];
  }
};

const changeUserRole = async (userId, role) => {
  try {
    await api.changeUserRoleById(userId, role);
  } catch (error) {
    console.error("Failed to change role:", error);
    throw error;
  }
};
  const deleteUser = async (userId) => {
    await api.deleteUserById(userId);
  };
  
  const toggleUserActiveState = async (userId, currentState) => {
    await api.updateUserById(userId, { isActive: !currentState });
  };


  
  const value = {
  
    user,
    isLoading,
    recipes,
    shoppingList,
    newsletters,
    
   
    login,
    signup,
    forgotPassword,
    performPasswordReset,
    logout,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    addNewsletter,
    updateNewsletter,
    deleteNewsletter,
    toggleLike,
    addComment,
    updateComment,
    deleteComment,
    addToShoppingList,
    toggleShoppingListItem,
    deleteShoppingListItem,
    updateUserProfile, 
    fetchAllUsers, 
    changeUserRole,
    deleteUser,
    toggleUserActiveState,

    
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};


export const useAppContext = () => {
  return useContext(AppContext);
};