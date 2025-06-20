import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert, Appearance, View, ActivityIndicator  } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as api from '../services/api';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); 
  const [recipes, setRecipes] = useState([]);
  const [newsletters, setNewsletters] = useState([]);
  const [shoppingList, setShoppingList] = useState([]);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const bootstrapApp = async () => {
      try {
        // Load theme and public data first
        const savedTheme = await AsyncStorage.getItem('appTheme');
        if (savedTheme) {
          setTheme(savedTheme);
        }
        
        const userToken = await AsyncStorage.getItem('userToken');
        if (userToken) {
          // ✅ ALWAYS fetch the fresh profile on startup
          const profileResponse = await api.getMyProfile();
          if (profileResponse.success && profileResponse.data.user) {
            const freshUser = profileResponse.data.user;
            setUser(freshUser);
            
            // Fetch user-specific data
            const [recipeResponse, newsletterResponse, listResponse] = await Promise.all([
              api.getAllRecipes(),
              api.getNewsletters(),
              api.getMyShoppingList(),
            ]);
            setRecipes(recipeResponse?.data || []);
            setNewsletters(newsletterResponse?.data?.posts || []);
            setShoppingList(listResponse.data || []);
          } else {
            throw new Error("Invalid token.");
          }
        }
      } catch (e) {
        console.error("Bootstrap failed, clearing session:", e.message);
        setUser(null);
        await AsyncStorage.multiRemove(['userToken', 'userData']);
      } finally {
        setIsLoading(false);
      }
    };
    bootstrapApp();
  }, []);

  const login = async (email, password) => {
    const response = await api.loginUser(email, password);
    const { user: userData, token } = response.data;
    
    // Store the token first
    await AsyncStorage.setItem('userToken', token);
    
    // ✅ FETCH FRESH PROFILE DATA AFTER LOGIN
    // Instead of using the user data from login response, fetch fresh profile
    const profileResponse = await api.getMyProfile();
    if (profileResponse.success && profileResponse.data.user) {
      const freshUser = profileResponse.data.user;
      setUser(freshUser);
      await AsyncStorage.setItem('userData', JSON.stringify(freshUser));
    } else {
      // Fallback to login response data if profile fetch fails
      setUser(userData);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
    }
  
    // Fetch other user-specific data
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
    if (user?.role !== 'admin' && user?.role !== 'super_admin') throw new Error("Not authorized");
    const newRecipe = await api.createRecipe(recipeData);
    setRecipes(prev => [...prev, newRecipe.data]);
  };

  const updateRecipe = async (recipeId, updatedData) => {
    if (user?.role !== 'admin' && user?.role !== 'super_admin') throw new Error("Not authorized");
    const updatedRecipe = await api.updateRecipeById(recipeId, updatedData);
    setRecipes(prev => prev.map(r => r.id === recipeId ? updatedRecipe.data : r));
  };
  
  const deleteRecipe = async (recipeId) => {
    if (user?.role !== 'admin' && user?.role !== 'super_admin') throw new Error("Not authorized");
    await api.deleteRecipeById(recipeId);
    setRecipes(prev => prev.filter(r => r.id !== recipeId));
  };

  const addNewsletter = async (formData) => {
    const isAdminOrSuperAdmin = user?.role === 'admin' || user?.role === 'super_admin';
    if (!isAdminOrSuperAdmin) {
      throw new Error("You are not authorized to perform this action.");
    }
    await api.createNewsletter(formData);
    const updatedNewslettersResponse = await api.getNewsletters();
    setNewsletters(updatedNewslettersResponse?.data?.posts || []);
  };
  
  const toggleLike = async (recipeId) => {
  try {
    
    if (!user) {
      throw new Error("User not logged in");
    }
    
    // Get fresh token
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      throw new Error("No authentication token found");
    }
    
    const response = await api.toggleRecipeLike(recipeId);
    const recipeData = await api.getAllRecipes();
    setRecipes(recipeData.data || []);
  } catch (error) {
    console.error("Error toggling like:", error);
    throw error;
  }
};
const addComment = async (recipeId, text) => {
  try {
    // Check if user is logged in
    if (!user) {
      throw new Error("User not logged in");
    }
    
    // Get fresh token
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      throw new Error("No authentication token found");
    }
    
    const response = await api.addCommentToRecipe(recipeId, text);
    const recipeData = await api.getAllRecipes();
    setRecipes(recipeData.data || []);
  } catch (error) {
    console.error("Error adding comment:", error);
    throw error;
  }
};

const updateComment = async (recipeId, commentId, newText) => {
  try {
    const response = await api.updateCommentById(commentId, newText);
    setRecipes(prevRecipes => 
      prevRecipes.map(recipe => {
        if (recipe.id === recipeId) {
          return {
            ...recipe,
            comments: (recipe.comments || []).map(comment => 
              comment.id === commentId ? response.data : comment
            )
          };
        }
        return recipe;
      })
    );
    return response;
  } catch (error) {
    console.error('Error updating comment:', error);
    throw error;
  }
};

const deleteComment = async (recipeId, commentId) => {
  try {
    await api.deleteCommentById(commentId);
    setRecipes(prevRecipes => 
      prevRecipes.map(recipe => {
        if (recipe.id === recipeId) {
          return {
            ...recipe,
            comments: (recipe.comments || []).filter(comment => comment.id !== commentId)
          };
        }
        return recipe;
      })
    );
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
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
    return api.requestPasswordReset(email);
  };

  const performPasswordReset = async (token, newPassword) => {
    return api.resetPassword(token, newPassword);
  };

  const updateNewsletter = async (postId, payload) => {
    if (user?.role !== 'admin' && user?.role !== 'super_admin') throw new Error("Not authorized");
    try {
      await api.updateNewsletterById(postId, payload);
      const newsletterResponse = await api.getNewsletters();
      setNewsletters(newsletterResponse?.data?.posts || []);
    } catch (error) {
      console.error("Failed to update newsletter:", error);
      throw error;
    }
  };

  const deleteNewsletter = async (postId) => {
    if (user?.role !== 'admin' && user?.role !== 'super_admin') throw new Error("Not authorized");
    try {
      await api.deleteNewsletterById(postId);
      setNewsletters(prev => prev.filter(p => p.id !== postId));
    } catch (error) {
      console.error("Failed to delete newsletter:", error);
      throw error;
    }
  };

  const updateMyProfile = async (formData) => {
    try {
      // 1. Call the API to update profile
      const response = await api.updateMyProfile(formData);
      
      // 2. The API returns the full, updated user object
      const updatedUser = response.data.user;
      
      if (!updatedUser) {
        throw new Error("Server did not return updated user data.");
      }
      
      // 3. Update the state to trigger UI refresh
      console.log("Setting new user state:", updatedUser);
      setUser(updatedUser);
      
      // 4. Update stored user data for next session
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
      
      return updatedUser;
    } catch (error) {
      console.error("Failed to update profile:", error.response?.data || error);
      throw error;
    }
  };

  // Super admin functions
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

  const inviteUser = async (userData) => {
    return api.inviteNewUser(userData);
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    await AsyncStorage.setItem('appTheme', newTheme);
  };

  const value = {
    user,
    isLoading,
    theme,
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
    fetchAllUsers, 
    changeUserRole,
    deleteUser,
    toggleUserActiveState,
    inviteUser,
    updateMyProfile,
    toggleTheme
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  return useContext(AppContext);
};