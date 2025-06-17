import React from "react";
import { View, ActivityIndicator } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { useAppContext } from "../context/AppContext";

import WelcomeScreen from '../screens/WelcomeScreen';

import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';

import RecipeListScreen from "../screens/RecipeListScreen";
import RecipeDetailScreen from "../screens/RecipeDetailScreen";
import AddRecipeScreen from "../screens/AddRecipeScreen";
import EditRecipeScreen from "../screens/EditRecipeScreen";

import NewsletterListScreen from "../screens/NewsletterListScreen";
import NewsletterDetailScreen from "../screens/NewsletterDetailScreen";
import CreateNewsletterScreen from "../screens/CreateNewsletterScreen";

import ShoppingListScreen from "../screens/ShoppingListScreen";
import ProfileScreen from "../screens/ProfileScreen";
import EditProfileScreen from "../screens/EditProfileScreen";
import EditNewsletterScreen from "../screens/EditNewsletterScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const RecipeStackNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: "#4CAF50" },
      headerTintColor: "#fff",
    }}
  >
    <Stack.Screen
      name="RecipesList"
      component={RecipeListScreen}
      options={{ title: "All Recipes" }}
    />
    <Stack.Screen
      name="RecipeDetail"
      component={RecipeDetailScreen}
      options={{ title: "Recipe Details" }}
    />
    <Stack.Screen
      name="EditRecipe"
      component={EditRecipeScreen}
      options={{ title: "Edit Recipe" }}
    />
  </Stack.Navigator>
);

const NewsletterStackNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: "#4CAF50" },
      headerTintColor: "#fff",
    }}
  >
    <Stack.Screen
      name="NewsletterList"
      component={NewsletterListScreen}
      options={{ title: "Latest Newsletters" }}
    />
    <Stack.Screen
      name="NewsletterDetail"
      component={NewsletterDetailScreen}
      options={{ title: "Newsletter" }}
    />
    <Stack.Screen
      name="CreateNewsletter"
      component={CreateNewsletterScreen}
      options={{ title: "Create Newsletter" }}
    />
     <Stack.Screen name="EditNewsletter" component={EditNewsletterScreen} options={{ title: 'Edit Newsletter' }} />
  </Stack.Navigator>
);

const ProfileStackNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: "#4CAF50" },
      headerTintColor: "#fff",
    }}
  >
    <Stack.Screen
      name="ProfileView"
      component={ProfileScreen}
      options={{ title: "My Profile" }}
    />
    <Stack.Screen
      name="EditProfile"
      component={EditProfileScreen}
      options={{ title: "Edit Profile" }}
    />
  </Stack.Navigator>
);

const MainTabs = () => {
  const { user } = useAppContext();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "Recipes")
            iconName = focused ? "restaurant" : "restaurant-outline";
          else if (route.name === "Add Recipe")
            iconName = focused ? "add-circle" : "add-circle-outline";
          else if (route.name === "Newsletter")
            iconName = focused ? "newspaper" : "newspaper-outline";
          else if (route.name === "Shopping List")
            iconName = focused ? "cart" : "cart-outline";
          else if (route.name === "Profile")
            iconName = focused ? "person-circle" : "person-circle-outline";
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#4CAF50",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen
        name="Recipes"
        component={RecipeStackNavigator}
        options={{ headerShown: false }}
      />

      {user?.role === "admin" && (
        <Tab.Screen
          name="Add Recipe"
          component={AddRecipeScreen}
          options={{
            headerStyle: { backgroundColor: "#4CAF50" },
            headerTintColor: "#fff",
          }}
        />
      )}

      <Tab.Screen
        name="Newsletter"
        component={NewsletterStackNavigator}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Shopping List"
        component={ShoppingListScreen}
        options={{
          title: "Shopping List",
          headerStyle: { backgroundColor: "#4CAF50" },
          headerTintColor: "#fff",
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackNavigator}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
};

const AuthStack = () => (
  <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Welcome" component={WelcomeScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Signup" component={SignupScreen} />
     <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
  </Stack.Navigator>
);

const AppNavigator = () => {
  const { user, isLoading } = useAppContext();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="MainApp" component={MainTabs} />
      ) : (
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
