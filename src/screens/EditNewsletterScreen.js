import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, Button, ScrollView, Alert,
  SafeAreaView, Platform, KeyboardAvoidingView, Image, TouchableOpacity, ActivityIndicator
} from 'react-native';
import QuillEditor, { QuillToolbar } from 'react-native-cn-quill';
import * as ImagePicker from 'expo-image-picker';
import CustomInput from '../components/CustomInput';
import { useAppContext } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';

// Helper function to upload images to Cloudinary. It's reusable.
const uploadImageToCloudinary = async (fileUri) => {
  const formData = new FormData();
  formData.append('file', { uri: fileUri, name: 'photo.jpg', type: 'image/jpeg' });
  formData.append('upload_preset', 'Recipe-Book'); // 🚨 Replace with your preset name
  const cloudName = 'dwkdewsiy'; // 🚨 Replace with your cloud name

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    if (data.secure_url) {
      return data.secure_url;
    }
    throw new Error('Image upload to Cloudinary failed');
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};


const EditNewsletterScreen = ({ route, navigation }) => {
  const { newsletterId } = route.params;
  const { newsletters, updateNewsletter } = useAppContext();
  
  // Find the specific post to edit from our global context state.
  const postToEdit = newsletters.find(p => p.id === newsletterId);
  
  const _editor = useRef(null);
  
  // Initialize state with the existing post's data.
  const [title, setTitle] = useState(postToEdit?.title || '');
  const [heroImage, setHeroImage] = useState(postToEdit?.imageUrl ? { uri: postToEdit.imageUrl } : null);
  const [newHeroImage, setNewHeroImage] = useState(null); // To track if a new image has been picked.
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handler for picking a new hero image.
  const pickHeroImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      return Alert.alert("Permission Required", "You must grant permission to access photos.");
    }
    let result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [16, 9], quality: 0.7 });
    if (!result.canceled) {
      setNewHeroImage(result.assets[0]);
    }
  };
  
  // Handler for the image button inside the rich text editor's toolbar.
  const handleImageUploadInEditor = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) return;
    
    let result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });
    if (result.canceled || !result.assets[0].uri) return;

    _editor.current?.insertText(_editor.current.getSelection().index, '\n[Uploading...]\n');
    try {
      const cloudinaryUrl = await uploadImageToCloudinary(result.assets[0].uri);
      _editor.current?.deleteText(_editor.current.getSelection().index - 15, 15);
      _editor.current?.insertEmbed(cloudinaryUrl, 'image');
    } catch (error) {
      _editor.current?.deleteText(_editor.current.getSelection().index - 15, 15);
      Alert.alert("Upload Failed", "Could not upload the image.");
    }
  };

  // Main handler for submitting the updated post.
  const handleUpdate = async () => {
    const contentDelta = await _editor.current?.getDelta();
    if (!title.trim()) {
      return Alert.alert("Validation Failed", "Title is required.");
    }
    
    setIsSubmitting(true);
    try {
      let finalImageUrl = postToEdit.imageUrl;
      // If the user picked a new hero image, upload it and get the new URL.
      if (newHeroImage) {
        finalImageUrl = await uploadImageToCloudinary(newHeroImage.uri);
      }
      
      const payload = {
        title,
        imageUrl: finalImageUrl,
        content: contentDelta.ops,
      };
      
      await updateNewsletter(newsletterId, payload);
      Alert.alert('Success!', 'Newsletter has been updated.');
      navigation.goBack();
    } catch (error) {
      const message = error.response?.data?.message || 'Could not update the newsletter.';
      Alert.alert('Error', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show a loading screen if the post data isn't ready for some reason.
  if (!postToEdit) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text>Loading post data...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Edit Article</Text>
          <Button title={isSubmitting ? "Saving..." : "Save Changes"} onPress={handleUpdate} disabled={isSubmitting} />
        </View>
        <ScrollView style={styles.formContainer} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.heroImagePicker} onPress={pickHeroImage}>
            {/* Show the newly picked image if it exists, otherwise show the original */}
            <Image 
              source={newHeroImage ? { uri: newHeroImage.uri } : heroImage} 
              style={styles.heroImagePreview} 
            />
          </TouchableOpacity>
          <CustomInput label="Article Title" value={title} onChangeText={setTitle} />
          <Text style={styles.editorLabel}>Article Content</Text>
          <View style={styles.editorWrapper}>
            <QuillToolbar editor={_editor} options={[['bold', 'italic'],[{ 'header': 1 }], ['link', { 'image': handleImageUploadInEditor }]]} />
            <QuillEditor
              ref={_editor}
              style={styles.editor}
              // Set the initial content of the editor from the post data
              delta={postToEdit?.content ? { ops: postToEdit.content } : undefined}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerText: { fontSize: 18, fontWeight: 'bold' },
  formContainer: { padding: 15 },
  heroImagePicker: {
    height: 200,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  heroImagePreview: { width: '100%', height: '100%', borderRadius: 8 },
  editorLabel: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 10, marginTop: 10 },
  editorWrapper: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, minHeight: 400, marginBottom: 50 },
  editor: { flex: 1, padding: 10, fontSize: 16, lineHeight: 24 },
});

export default EditNewsletterScreen;