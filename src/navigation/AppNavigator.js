import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';

// --- Import All Screens ---
// Auth Screens
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';


// Recipe Screens
import RecipeListScreen from '../screens/RecipeListScreen';
import RecipeDetailScreen from '../screens/RecipeDetailScreen';
import AddRecipeScreen from '../screens/AddRecipeScreen';
import EditRecipeScreen from '../screens/EditRecipeScreen';

// Newsletter Screens
import NewsletterListScreen from '../screens/NewsletterListScreen';
import NewsletterDetailScreen from '../screens/NewsletterDetailScreen';
import CreateNewsletterScreen from '../screens/CreateNewsletterScreen';

// Other Main Screens
import ShoppingListScreen from '../screens/ShoppingListScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';

// Create the navigator functions
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// --- Define stacks for tabs that have multiple screens ---
// This keeps our code clean and organized.

const RecipeStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#4CAF50' }, headerTintColor: '#fff' }}>
    <Stack.Screen name="RecipesList" component={RecipeListScreen} options={{ title: 'All Recipes' }} />
    <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} options={{ title: 'Recipe Details' }}/>
    <Stack.Screen name="EditRecipe" component={EditRecipeScreen} options={{ title: 'Edit Recipe' }} />
  </Stack.Navigator>
);

const NewsletterStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#4CAF50' }, headerTintColor: '#fff' }}>
    <Stack.Screen name="NewsletterList" component={NewsletterListScreen} options={{ title: 'Latest Newsletters' }} />
    <Stack.Screen name="NewsletterDetail" component={NewsletterDetailScreen} options={{ title: 'Newsletter' }} />
    <Stack.Screen name="CreateNewsletter" component={CreateNewsletterScreen} options={{ title: 'Create Newsletter' }} />
  </Stack.Navigator>
);

const ProfileStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#4CAF50' }, headerTintColor: '#fff' }}>
    <Stack.Screen name="ProfileView" component={ProfileScreen} options={{ title: 'My Profile' }} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit Profile' }} />
  </Stack.Navigator>
);


// --- This is the main part of the app for a logged-in user ---
const MainTabs = () => {
  const { user } = useAppContext(); // Get user info to check their role

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Recipes') iconName = focused ? 'restaurant' : 'restaurant-outline';
          else if (route.name === 'Add Recipe') iconName = focused ? 'add-circle' : 'add-circle-outline';
          else if (route.name === 'Newsletter') iconName = focused ? 'newspaper' : 'newspaper-outline';
          else if (route.name === 'Shopping List') iconName = focused ? 'cart' : 'cart-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person-circle' : 'person-circle-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Recipes" component={RecipeStackNavigator} options={{ headerShown: false }} />
      
      {/* --- 🚨 ROLE-BASED TAB: This tab only appears for Admins --- */}
      {user?.role === 'admin' && (
        <Tab.Screen name="Add Recipe" component={AddRecipeScreen} options={{ headerStyle: { backgroundColor: '#4CAF50' }, headerTintColor: '#fff' }} />
      )}
      
      <Tab.Screen name="Newsletter" component={NewsletterStackNavigator} options={{ headerShown: false }} />
      <Tab.Screen name="Shopping List" component={ShoppingListScreen} options={{ title: 'Shopping List', headerStyle: { backgroundColor: '#4CAF50' }, headerTintColor: '#fff' }}/>
      <Tab.Screen name="Profile" component={ProfileStackNavigator} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
};

// --- This is the part of the app for a logged-out user ---
const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Signup" component={SignupScreen} />
  </Stack.Navigator>
);


// --- THE MAIN GATEKEEPER COMPONENT ---
// This is the top-level navigator that decides what to show based on the user's auth state.
const AppNavigator = () => {
  const { user, isLoading } = useAppContext();

  // 1. While the app checks for a stored token, show a loading screen.
  // This prevents a "flicker" from the login screen to the main app.
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  // 2. Once loading is done, check if a user object exists.
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        // If there is a user, show the main part of the app (with tabs).
        <Stack.Screen name="MainApp" component={MainTabs} />
      ) : (
        // If there is no user, show the authentication screens.
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;