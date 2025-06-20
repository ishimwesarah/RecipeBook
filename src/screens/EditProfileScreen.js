import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Button, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import * as ImagePicker from 'expo-image-picker';
import CustomInput from '../components/CustomInput';
import { useAppContext } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';

const ProfileValidationSchema = Yup.object().shape({
  username: Yup.string().min(2, "Username is too short").required("Username is required"),
  bio: Yup.string().max(200, "Bio cannot be longer than 200 characters").nullable(),
});

const EditProfileScreen = ({ navigation }) => {
  const { user: currentUser, updateMyProfile } = useAppContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newProfilePic, setNewProfilePic] = useState(null);

  if (!currentUser) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#4CAF50" /></View>;
  }

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      return Alert.alert("Permission Required", "You must grant photo library access.");
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true, 
      aspect: [1, 1], 
      quality: 0.5,
    });
    if (!result.canceled) {
      setNewProfilePic(result.assets[0]);
    }
  };

  const handleUpdate = async (values) => {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('username', values.username);
    formData.append('bio', values.bio || '');
    
    if (newProfilePic) {
      formData.append('profilePicture', {
        uri: newProfilePic.uri,
        name: `profile_${currentUser.id}.jpg`,
        type: 'image/jpeg',
      });
    }

    try {
      await updateMyProfile(formData);
      Alert.alert("Profile Updated", "Your changes have been saved.");
      navigation.goBack();
    } catch (error) {
      const message = error.response?.data?.message || "Could not update your profile.";
      Alert.alert("Error", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine image source priority: new selection > existing profile pic > default
  let imageSource = require('../../assets/pancakes.jpg'); 
  if (newProfilePic) {
    imageSource = { uri: newProfilePic.uri };
  } else if (currentUser.profilePictureUrl) {
    imageSource = { uri: currentUser.profilePictureUrl };
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Formik
          initialValues={{
            username: currentUser.username || '',
            email: currentUser.email || '', // Include email in initial values
            bio: currentUser.bio || '',
          }}
          validationSchema={ProfileValidationSchema}
          onSubmit={handleUpdate}
          enableReinitialize={true} // This ensures form updates when user data changes
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <View style={styles.formContainer}>
              <View style={styles.header}>
                <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
                  <Image source={imageSource} style={styles.profileImage} />
                  <View style={styles.cameraIconOverlay}>
                    <Ionicons name="camera-reverse" size={24} color="#fff" />
                  </View>
                </TouchableOpacity>
                <Text style={styles.headerText}>Edit Your Profile</Text>
              </View>

              {/* Username Field - Editable */}
              <CustomInput 
                label="Username" 
                onChangeText={handleChange("username")} 
                onBlur={handleBlur("username")}
                value={values.username}
                error={touched.username && errors.username}
                placeholder="Enter your username"
              />

              {/* Email Field - Read Only */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <View style={styles.readOnlyInput}>
                  <Text style={styles.readOnlyText}>{values.email}</Text>
                </View>
                <Text style={styles.helperText}>Email cannot be changed</Text>
              </View>

              {/* Bio Field - Editable */}
              <CustomInput 
                label="Bio" 
                onChangeText={handleChange("bio")} 
                onBlur={handleBlur("bio")}
                value={values.bio}
                error={touched.bio && errors.bio}
                multiline 
                numberOfLines={4} 
                placeholder="Tell us about yourself..."
                style={styles.bioInput}
              />

              <View style={styles.buttonContainer}>
                <Button 
                  onPress={handleSubmit} 
                  title={isSubmitting ? "Saving..." : "Save Changes"} 
                  color="#4CAF50" 
                  disabled={isSubmitting} 
                />
              </View>
            </View>
          )}
        </Formik>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fff" 
  },
  centered: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  formContainer: { 
    padding: 20 
  },
  header: { 
    alignItems: "center", 
    marginBottom: 30 
  },
  imageContainer: {
    position: 'relative',
  },
  profileImage: { 
    width: 140, 
    height: 140, 
    borderRadius: 70, 
    marginBottom: 10, 
    borderWidth: 3, 
    borderColor: "#4CAF50", 
    backgroundColor: '#e0e0e0' 
  },
  cameraIconOverlay: { 
    position: 'absolute', 
    bottom: 10, 
    right: 10, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  headerText: { 
    fontSize: 22, 
    fontWeight: "bold", 
    marginTop: 10,
    color: '#333'
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  readOnlyInput: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 15,
    minHeight: 50,
    justifyContent: 'center',
  },
  readOnlyText: {
    fontSize: 16,
    color: '#666',
  },
  helperText: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
    fontStyle: 'italic',
  },
  bioInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    marginTop: 20,
  },
});

export default EditProfileScreen;