import React, { createContext, useState, useContext } from 'react';
import { getRecipes, getUserProfile, getShoppingList } from '../services/data';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [recipes, setRecipes] = useState(getRecipes());
  const [userProfile, setUserProfile] = useState(getUserProfile());
  const [shoppingList, setShoppingList] = useState(getShoppingList());
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const loginUser = (email) => {
    setUserProfile(prev => ({...prev, email: email}));
    setIsLoggedIn(true);
  };
  
  const signupUser = (name, email) => {
    setUserProfile({
      name, email,
      bio: 'Just joined! Ready to start cooking.',
      profilePictureUrl: 'https://i.pinimg.com/736x/a0/dd/1b/a0dd1b06ffb50116537e15d377fa3b11.jpg', // Generic placeholder
    });
    setIsLoggedIn(true);
  };

  const updateUserProfile = (newProfileData) => setUserProfile(newProfileData);

  const addToShoppingList = (ingredients) => {
    const newItems = ingredients.map(ing => ({ id: Math.random(), item: ing.split(',')[0], checked: false }));
    setShoppingList(prevList => [...prevList, ...newItems]);
    alert(`${ingredients.length} items added to your shopping list!`);
  };

  const toggleShoppingListItem = (itemId) => {
    setShoppingList(p => p.map(i => i.id === itemId ? { ...i, checked: !i.checked } : i));
  };
  
  const addComment = (recipeId, commentText) => {
    setRecipes(p => p.map(r => r.id === recipeId ? { ...r, comments: [...(r.comments || []), {id: Math.random(), text: commentText}] } : r));
  };

  const toggleLike = (recipeId) => {
    setRecipes(p => p.map(r => {
      if (r.id === recipeId) {
        const liked = !r.isLiked;
        return { ...r, isLiked: liked, likeCount: liked ? r.likeCount + 1 : r.likeCount - 1 };
      }
      return r;
    }));
  };

  const addRecipe = (newRecipe) => {
    setRecipes(p => [...p, { ...newRecipe, id: Math.random(), isLiked: false, likeCount: 0, comments: [] }]);
  };

  const value = {
    recipes, userProfile, shoppingList, isLoggedIn,
    loginUser, signupUser, updateUserProfile, addToShoppingList, toggleShoppingListItem, addComment, toggleLike, addRecipe,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);