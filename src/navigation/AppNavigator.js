import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';

// Screens
import RecipeListScreen from '../screens/RecipeListScreen';
import RecipeDetailScreen from '../screens/RecipeDetailScreen';
import ShoppingListScreen from '../screens/ShoppingListScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AddRecipeScreen from '../screens/AddRecipeScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const RecipeStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#4CAF50' }, headerTintColor: '#fff' }}>
    <Stack.Screen name="RecipesList" component={RecipeListScreen} options={{ title: 'All Recipes' }} />
    <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} options={{ title: 'Recipe Details' }}/>
  </Stack.Navigator>
);

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        if (route.name === 'Recipes') iconName = focused ? 'restaurant' : 'restaurant-outline';
        else if (route.name === 'Add Recipe') iconName = focused ? 'add-circle' : 'add-circle-outline';
        else if (route.name === 'Shopping List') iconName = focused ? 'cart' : 'cart-outline';
        else if (route.name === 'Profile') iconName = focused ? 'person-circle' : 'person-circle-outline';
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#4CAF50',
      tabBarInactiveTintColor: 'gray',
    })}
  >
    <Tab.Screen name="Recipes" component={RecipeStackNavigator} options={{ headerShown: false }} />
    <Tab.Screen name="Add Recipe" component={AddRecipeScreen} options={{ headerStyle: { backgroundColor: '#4CAF50' }, headerTintColor: '#fff' }} />
    <Tab.Screen name="Shopping List" component={ShoppingListScreen} options={{ headerStyle: { backgroundColor: '#4CAF50' }, headerTintColor: '#fff' }}/>
    <Tab.Screen name="Profile" component={ProfileScreen} options={{ headerStyle: { backgroundColor: '#4CAF50' }, headerTintColor: '#fff' }}/>
  </Tab.Navigator>
);

const AppNavigator = () => {
  const { isLoggedIn } = useAppContext();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isLoggedIn ? (
        <Stack.Screen name="MainApp" component={MainTabs} />
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;