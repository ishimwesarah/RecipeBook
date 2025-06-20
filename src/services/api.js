import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "http://192.168.1.122:8080/";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

const getAuthToken = async () => {
  return await AsyncStorage.getItem('userToken');
};
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("userToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const loginUser = async (email, password) => {
  const response = await apiClient.post("/auth/login", { email, password });
  return response.data;
};

export const signupUser = async (username, email, password) => {
  const response = await apiClient.post("/auth/signup", {
    username,
    email,
    password,
  });
  return response.data;
};

export const getNewsletters = async () => {
  const response = await apiClient.get("/posts/get?page=1&limit=10");

  return response.data;
};
export const createRecipe = async (formData) => {
  const response = await apiClient.post("/recipes/create", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const getAllRecipes = async () => {
  const response = await apiClient.get("/recipes/get");
  return response.data;
};

export const updateRecipeById = async (id, formData) => {
  const response = await apiClient.put(`/recipes/update/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const deleteRecipeById = async (id) => {
  await apiClient.delete(`/recipes/delete/${id}`);
};
export const toggleRecipeLike = async (recipeId) => {
  const response = await apiClient.post(`/recipes/${recipeId}/like`);
  return response.data;
};

// Comments
export const addCommentToRecipe = async (recipeId, text) => {
  const response = await apiClient.post(`/recipes/${recipeId}/comments`, { text });
  return response.data;
};

export const updateCommentById = async (commentId, text) => {
  const response = await apiClient.put(`/comments/${commentId}`, { text });
  return response.data;
};

export const deleteCommentById = async (commentId) => {
  await apiClient.delete(`/comments/${commentId}`);
};

export const createNewsletter = async (formData) => {
  const response = await apiClient.post('/posts/add', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getMyShoppingList = async () => {
  const response = await apiClient.get("/shopping");
  return response.data;
};

export const addItemsToShoppingList = async (items) => {
  const response = await apiClient.post("shopping/add", { items });
  return response.data;
};

export const toggleShoppingListItemById = async (itemId) => {
  const response = await apiClient.patch(`/shopping/${itemId}/toggle`);
  return response.data;
};

export const deleteShoppingListItemById = async (itemId) => {
  await apiClient.delete(`/shopping/${itemId}`);
};
export const requestPasswordReset = async (email) => {
  const response = await apiClient.post('/auth/forgot-password', { email });
  return response.data;
};


export const resetPassword = async (token, newPassword) => {
  const response = await apiClient.post(`/auth/reset-password/${token}`, { newPassword });
  return response.data;
};
export const updateNewsletterById = async (id, payload) => {
 
  const response = await apiClient.put(`/posts/${id}`, payload);
  return response.data;
};


export const deleteNewsletterById = async (id) => {
  await apiClient.delete(`/posts/${id}`);
};

export const getAllUsers = async () => {
  const response = await apiClient.get('/users');
  return response.data;
};


export const changeUserRoleById = async (userId, role) => {
  const response = await apiClient.patch(`/users/${userId}/role`, { role });
  return response.data;
};
export const deleteUserById = async (userId) => {
  await apiClient.delete(`/users/${userId}`);
};
export const inviteNewUser = async (userData) => {
  // userData will be an object like { username, email, role }
  const response = await apiClient.post('/users/invite', userData);
  return response.data;
};
// ...
export const getMyProfile = async () => {
  const response = await apiClient.get('/users/profile/me');
  return response.data;
};

// This sends the updated profile data, including an optional image.
export const updateMyProfile = async (formData) => {
  const response = await apiClient.put('/users/profile/me', formData, {
    headers: {
      'Content-Type': 'multipart/form-data', // Crucial for file uploads
    },
  });
  return response.data;
};

export const getDashboardStats = async () => {
  // Calls GET /stats
  const response = await apiClient.get('/stats');
  return response.data;
};
export default apiClient;
