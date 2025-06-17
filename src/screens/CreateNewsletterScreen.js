import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  ScrollView,
  Alert,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import CustomInput from "../components/CustomInput";
import { useAppContext } from "../context/AppContext";
import { Ionicons } from "@expo/vector-icons";

const uploadImageToCloudinary = async (fileUri) => {
  const formData = new FormData();
  formData.append("file", {
    uri: fileUri,
    name: "photo.jpg",
    type: "image/jpeg",
  });
  formData.append("upload_preset", "Recipe-Book");
  const cloudName = "dwkdewsiy";
  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );
    const data = await response.json();
    if (data.secure_url) return data.secure_url;
    throw new Error("Image upload to Cloudinary failed");
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};

// A helper to generate unique IDs for content blocks.
const generateId = () => `block_${Math.random().toString(36).substr(2, 9)}`;

const CreateNewsletterScreen = () => {
  const navigation = useNavigation();
  const { addNewsletter } = useAppContext();

  const [title, setTitle] = useState("");
  const [heroImage, setHeroImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // The document state starts with a default paragraph block.
  const [document, setDocument] = useState([
    { id: generateId(), type: "paragraph", text: "" },
  ]);

  // --- HANDLER FUNCTIONS ---

  const pickHeroImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert(
        "Permission Required",
        "You must grant permission to access your photo library."
      );
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.7,
    });
    if (!result.canceled) {
      setHeroImage(result.assets[0]);
    }
  };

  // Updates the text for a specific block in the document state.
  const updateBlockText = (id, newText) => {
    setDocument((current) =>
      current.map((block) =>
        block.id === id ? { ...block, text: newText } : block
      )
    );
  };

  // Adds a new block of a specified type to the document.
  const addBlock = (type) => {
    if (type === "image") {
      addImageBlock();
    } else {
      const newBlock = { id: generateId(), type, text: "" };
      setDocument((current) => [...current, newBlock]);
    }
  };

  const addImageBlock = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) return;
    let result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });
    if (result.canceled || !result.assets[0].uri) return;

    const tempId = generateId();
    setDocument((current) => [...current, { id: tempId, type: "loading" }]);

    try {
      const imageUrl = await uploadImageToCloudinary(result.assets[0].uri);
      const newImageBlock = { id: tempId, type: "image", url: imageUrl };
      setDocument((current) =>
        current.map((b) => (b.id === tempId ? newImageBlock : b))
      );
    } catch (error) {
      Alert.alert("Upload Failed", "Could not upload image.");
      setDocument((current) => current.filter((b) => b.id !== tempId));
    }
  };

  const handlePublish = async () => {
    if (!title.trim() || !heroImage) {
      return Alert.alert(
        "Missing Fields",
        "Please provide a title and a hero image."
      );
    }

    if (
      document.length === 0 ||
      (document.length === 1 && !document[0].text.trim())
    ) {
      return Alert.alert("Missing Content", "Article content cannot be empty.");
    }

    setIsSubmitting(true);

    const formData = new FormData();

    formData.append("image", {
      uri: heroImage.uri,
      name: `hero_${Date.now()}.jpg`,
      type: "image/jpeg",
    });

    formData.append("title", title);

    formData.append("content", JSON.stringify(document));

    try {
      await addNewsletter(formData);

      Alert.alert("Success!", "Newsletter has been published.");
      navigation.goBack();
    } catch (error) {
      const message =
        error.response?.data?.message || "Could not publish the newsletter.";
      Alert.alert("Error", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderBlock = (block) => {
    switch (block.type) {
      case "heading":
        return (
          <TextInput
            key={block.id}
            style={styles.headingInput}
            placeholder="Type a heading..."
            value={block.text}
            onChangeText={(text) => updateBlockText(block.id, text)}
            multiline
          />
        );
      case "paragraph":
        return (
          <TextInput
            key={block.id}
            style={styles.paragraphInput}
            placeholder="Write something..."
            value={block.text}
            onChangeText={(text) => updateBlockText(block.id, text)}
            multiline
          />
        );
      case "image":
        return (
          <Image
            key={block.id}
            source={{ uri: block.url }}
            style={styles.contentImage}
          />
        );
      case "loading":
        return (
          <View key={block.id} style={styles.loadingBlock}>
            <ActivityIndicator size="small" />
            <Text style={styles.loadingText}>Uploading image...</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flexContainer}
      >
        <View style={styles.header}>
          <Text style={styles.headerText}>Create Article</Text>
          <Button
            title={isSubmitting ? "Publishing..." : "Publish"}
            onPress={handlePublish}
            disabled={isSubmitting}
          />
        </View>

        <ScrollView
          style={styles.formContainer}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            style={styles.heroImagePicker}
            onPress={pickHeroImage}
          >
            {heroImage ? (
              <Image
                source={{ uri: heroImage.uri }}
                style={styles.heroImagePreview}
              />
            ) : (
              <View style={styles.heroImagePlaceholder}>
                <Ionicons name="camera" size={40} color="#ccc" />
                <Text style={styles.heroImagePlaceholderText}>
                  Tap to select a hero image
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <CustomInput
            label="Article Title"
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.editorLabel}>Article Content</Text>
          <Text style={styles.toolbarLabel}>Add a new block:</Text>
          <View style={styles.toolbar}>
            <TouchableOpacity
              style={styles.toolButton}
              onPress={() => addBlock("paragraph")}
            >
              <Ionicons name="text" size={24} color="#333" />
              <Text style={styles.toolButtonText}>Text</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.toolButton}
              onPress={() => addBlock("heading")}
            >
              <Ionicons name="options" size={24} color="#333" />
              <Text style={styles.toolButtonText}>Heading</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.toolButton}
              onPress={() => addBlock("image")}
            >
              <Ionicons name="image" size={24} color="#333" />
              <Text style={styles.toolButtonText}>Image</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.documentContainer}>
            <ScrollView nestedScrollEnabled={true}>
              {document.map((block) => renderBlock(block))}
            </ScrollView>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  flexContainer: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerText: { fontSize: 18, fontWeight: "bold" },
  formContainer: { padding: 15 },
  heroImagePicker: {
    height: 200,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#ddd",
    borderStyle: "dashed",
  },
  heroImagePreview: { width: "100%", height: "100%", borderRadius: 8 },
  heroImagePlaceholderText: { color: "#aaa", marginTop: 10 },
  editorLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    marginTop: 10,
  },
  documentContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
    height: 400,
  },
  headingInput: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 5,
  },
  paragraphInput: {
    fontSize: 16,
    lineHeight: 24,
    minHeight: 50,
    marginBottom: 15,
  },
  contentImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    resizeMode: "cover",
    marginVertical: 10,
  },
  loadingBlock: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 100,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    marginVertical: 10,
  },
  loadingText: { marginLeft: 10, color: "#888" },
  toolbarLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
    marginTop: 20,
    marginBottom: 10,
  },
  toolbar: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 10,
    marginBottom: 50,
  },
  toolButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    marginRight: 10,
  },
  toolButtonText: { marginLeft: 8, fontWeight: "500" },
});

export default CreateNewsletterScreen;
