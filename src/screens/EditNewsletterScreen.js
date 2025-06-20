import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, Button, ScrollView, Alert,
  SafeAreaView, Platform, KeyboardAvoidingView, Image, TouchableOpacity,
  ActivityIndicator, TextInput
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import CustomInput from '../components/CustomInput';
import { useAppContext } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';

// This helper function is reusable and correct.
const uploadImageToCloudinary = async (fileUri) => {
  const formData = new FormData();
  formData.append('file', { uri: fileUri, name: 'photo.jpg', type: 'image/jpeg' });
  formData.append('upload_preset', 'Recipe-Book'); // 🚨 Replace with your preset name
  const cloudName = 'dwkdewsiy'; // 🚨 Replace with your cloud name
  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST', body: formData,
    });
    const data = await response.json();
    if (data.secure_url) return data.secure_url;
    throw new Error('Image upload to Cloudinary failed');
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};

const generateId = () => `block_${Math.random().toString(36).substr(2, 9)}`;

const EditNewsletterScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { newsletterId } = route.params;
  const { newsletters, updateNewsletter } = useAppContext();

  const postToEdit = newsletters.find(p => p.id === newsletterId);

  // --- ✅ All state and refs are now correctly defined ---
  const _editor = useRef(null); // This was missing
  const [title, setTitle] = useState(postToEdit?.title || '');
  const [heroImage, setHeroImage] = useState(postToEdit?.imageUrl ? { uri: postToEdit.imageUrl } : null);
  const [newHeroImage, setNewHeroImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [document, setDocument] = useState(postToEdit?.content || [{ id: generateId(), type: 'paragraph', text: '' }]);

  // --- ✅ All handler functions are now included ---
  const pickHeroImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) return Alert.alert("Permission Required");
    let result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [16, 9], quality: 0.7 });
    if (!result.canceled) {
      setNewHeroImage(result.assets[0]);
    }
  };

  const addBlock = (type) => {
    if (type === 'image') {
      addImageBlock();
    } else {
      setDocument(current => [...current, { id: generateId(), type, text: '' }]);
    }
  };

  const addImageBlock = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) return;
    let result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });
    if (result.canceled) return;

    const tempId = generateId();
    setDocument(current => [...current, { id: tempId, type: 'loading' }]);
    try {
      const imageUrl = await uploadImageToCloudinary(result.assets[0].uri);
      setDocument(current => current.map(b => b.id === tempId ? { id: tempId, type: 'image', url: imageUrl } : b));
    } catch (error) {
      Alert.alert("Upload Failed");
      setDocument(current => current.filter(b => b.id !== tempId));
    }
  };

  const updateBlockText = (id, newText) => {
    setDocument(current => current.map(block => (block.id === id ? { ...block, text: newText } : block)));
  };

  const handleUpdate = async () => {
    if (!title.trim()) return Alert.alert("Title is required.");
    
    setIsSubmitting(true);
    try {
      let finalImageUrl = postToEdit.imageUrl;
      if (newHeroImage) {
        finalImageUrl = await uploadImageToCloudinary(newHeroImage.uri);
      }
      const payload = { title, imageUrl: finalImageUrl, content: document };
      await updateNewsletter(newsletterId, payload);
      Alert.alert('Success!', 'Newsletter has been updated.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Could not update newsletter.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // --- ✅ The renderBlock function is now included ---
  const renderBlock = (block) => {
    switch (block.type) {
      case 'heading':
        return <TextInput key={block.id} style={styles.headingInput} placeholder="Type a heading..." value={block.text} onChangeText={(text) => updateBlockText(block.id, text)} multiline />;
      case 'paragraph':
        return <TextInput key={block.id} style={styles.paragraphInput} placeholder="Write something..." value={block.text} onChangeText={(text) => updateBlockText(block.id, text)} multiline />;
      case 'image':
        return <Image key={block.id} source={{ uri: block.url }} style={styles.contentImage} />;
      case 'loading':
        return <View key={block.id} style={styles.loadingBlock}><ActivityIndicator size="small" /><Text style={styles.loadingText}>Uploading image...</Text></View>;
      default:
        return null;
    }
  };

  if (!postToEdit) {
    return <View style={styles.centered}><ActivityIndicator size="large" /><Text>Loading post data...</Text></View>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flexContainer}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Edit Article</Text>
          <Button title={isSubmitting ? "Saving..." : "Save Changes"} onPress={handleUpdate} disabled={isSubmitting} />
        </View>
        <ScrollView style={styles.formContainer} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.heroImagePicker} onPress={pickHeroImage}>
            <Image source={newHeroImage ? { uri: newHeroImage.uri } : heroImage} style={styles.heroImagePreview} />
          </TouchableOpacity>
          <CustomInput label="Article Title" value={title} onChangeText={setTitle} />
          <Text style={styles.editorLabel}>Article Content</Text>
          <Text style={styles.toolbarLabel}>Add a new block:</Text>
          <View style={styles.toolbar}>
            <TouchableOpacity style={styles.toolButton} onPress={() => addBlock('paragraph')}><Ionicons name="text" size={24} color="#333" /><Text style={styles.toolButtonText}>Text</Text></TouchableOpacity>
            <TouchableOpacity style={styles.toolButton} onPress={() => addBlock('heading')}><Ionicons name="options" size={24} color="#333" /><Text style={styles.toolButtonText}>Heading</Text></TouchableOpacity>
            <TouchableOpacity style={styles.toolButton} onPress={addImageBlock}><Ionicons name="image" size={24} color="#333" /><Text style={styles.toolButtonText}>Image</Text></TouchableOpacity>
          </View>
          <View style={styles.documentContainer}>
            {document.map(block => renderBlock(block))}
          </View>
          
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  flexContainer: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 15, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#eee" },
  headerText: { fontSize: 18, fontWeight: "bold" },
  formContainer: { padding: 15 },
  heroImagePicker: { height: 200, backgroundColor: "#f5f5f5", borderRadius: 8, justifyContent: "center", alignItems: "center", marginBottom: 20, borderWidth: 2, borderColor: "#ddd", borderStyle: "dashed" },
  heroImagePreview: { width: "100%", height: "100%", borderRadius: 8 },
  editorLabel: { fontSize: 16, fontWeight: "bold", color: "#333", marginBottom: 10, marginTop: 10 },
  documentContainer: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 15, minHeight: 200 },
  headingInput: { fontSize: 22, fontWeight: "bold", color: "#1a1a1a", marginBottom: 15, borderBottomWidth: 1, borderBottomColor: "#eee", paddingBottom: 5 },
  paragraphInput: { fontSize: 16, lineHeight: 24, minHeight: 50, marginBottom: 15 },
  contentImage: { width: "100%", height: 200, borderRadius: 8, resizeMode: "cover", marginVertical: 10 },
  loadingBlock: { flexDirection: "row", alignItems: "center", justifyContent: "center", height: 100, backgroundColor: "#f5f5f5", borderRadius: 8, marginVertical: 10 },
  loadingText: { marginLeft: 10, color: "#888" },
  toolbarLabel: { fontSize: 14, color: "#666", fontWeight: "500", marginTop: 20, marginBottom: 10 },
  toolbar: { flexDirection: "row", justifyContent: "flex-start", alignItems: "center", borderTopWidth: 1, borderTopColor: "#eee", paddingTop: 10, marginBottom: 50 },
  toolButton: { flexDirection: "row", alignItems: "center", paddingVertical: 8, paddingHorizontal: 12, backgroundColor: "#f0f0f0", borderRadius: 20, marginRight: 10 },
  toolButtonText: { marginLeft: 8, fontWeight: "500" },
});

export default EditNewsletterScreen;