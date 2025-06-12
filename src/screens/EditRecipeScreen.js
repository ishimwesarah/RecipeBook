import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Formik, FieldArray } from "formik";
import * as Yup from "yup";
import * as ImagePicker from "expo-image-picker";
import { useAppContext } from "../context/AppContext";
import CustomInput from "../components/CustomInput";
import { Ionicons } from "@expo/vector-icons";

const EditRecipeSchema = Yup.object().shape({
  title: Yup.string().required("Title is required."),
  cookTime: Yup.string().required("Cook time is required."),
  ingredients: Yup.array()
    .of(Yup.string().required("Cannot be empty."))
    .min(1, "Add at least one ingredient."),
  instructions: Yup.array()
    .of(Yup.string().required("Cannot be empty."))
    .min(1, "Add at least one instruction."),
});

const EditRecipeScreen = ({ route, navigation }) => {
  const { recipeId } = route.params;
  const { recipes, updateRecipe } = useAppContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const recipeToEdit = recipes.find((r) => r.id === recipeId);

  const [newImage, setNewImage] = useState(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "We need camera roll permissions to change the image."
      );
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      setNewImage(result.assets[0]);
    }
  };

  const handleUpdateRecipe = async (values) => {
    setIsSubmitting(true);

    const formData = new FormData();

    if (newImage) {
      formData.append("image", {
        uri: newImage.uri,
        name: `photo_${Date.now()}.jpg`,
        type: "image/jpeg",
      });
    } else {
      formData.append("imageUrl", recipeToEdit.imageUrl);
    }

    formData.append("title", values.title);
    formData.append("cookTime", values.cookTime);

    values.ingredients.forEach((ingredient) =>
      formData.append("ingredients[]", ingredient)
    );
    values.instructions.forEach((instruction) =>
      formData.append("instructions[]", instruction)
    );

    try {
      await updateRecipe(recipeId, formData);
      Alert.alert("Success!", "Recipe has been updated.");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Could not update the recipe.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!recipeToEdit) {
    return (
      <View style={styles.container}>
        <Text>Recipe not found.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={100}
      >
        <Formik
          initialValues={{
            title: recipeToEdit.title,
            cookTime: recipeToEdit.cookTime,
            ingredients: recipeToEdit.ingredients,
            instructions: recipeToEdit.instructions,
          }}
          validationSchema={EditRecipeSchema}
          onSubmit={handleUpdateRecipe}
          enableReinitialize
        >
          {({ handleChange, handleBlur, handleSubmit, values }) => (
            <ScrollView
              style={styles.container}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.header}>Edit Recipe</Text>

              <View style={styles.imagePickerContainer}>
                <Text style={styles.imageLabel}>Recipe Image</Text>
                <Image
                  source={{
                    uri: newImage ? newImage.uri : recipeToEdit.imageUrl,
                  }}
                  style={styles.imagePreview}
                />
                <Button title="Change Image" onPress={pickImage} />
              </View>

              <CustomInput
                label="Recipe Title"
                onChangeText={handleChange("title")}
                value={values.title}
              />
              <CustomInput
                label="Cook Time"
                onChangeText={handleChange("cookTime")}
                value={values.cookTime}
              />

              <FieldArray name="ingredients"></FieldArray>

              <FieldArray name="instructions"></FieldArray>

              <View style={styles.submitButton}>
                <Button
                  title={isSubmitting ? "Saving..." : "Save Changes"}
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                  color="#4CAF50"
                />
              </View>
            </ScrollView>
          )}
        </Formik>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  imagePickerContainer: {
    alignItems: "center",
    marginBottom: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
  },
  imageLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  imagePreview: {
    width: 200,
    height: 150,
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  arrayContainer: { marginTop: 20 },
  arrayLabel: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  arrayItem: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  arrayInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
    fontSize: 16,
  },
  submitButton: { marginTop: 30, marginBottom: 50 },
});

export default EditRecipeScreen;
