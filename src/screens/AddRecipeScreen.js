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

const AddRecipeSchema = Yup.object().shape({
  title: Yup.string().required("Title is required."),
  cookTime: Yup.string().required("Cook time is required."),
  ingredients: Yup.array()
    .of(Yup.string().required("Cannot be empty."))
    .min(1, "Add at least one ingredient."),
  instructions: Yup.array()
    .of(Yup.string().required("Cannot be empty."))
    .min(1, "Add at least one instruction."),
});

const AddRecipeScreen = ({ navigation }) => {
  const { addRecipe } = useAppContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [image, setImage] = useState(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Sorry, we need camera roll permissions to make this work!"
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
      setImage(result.assets[0]);
    }
  };

  const handleAddRecipe = async (values, { resetForm }) => {
    if (!image) {
      Alert.alert("Image Required", "Please select an image for the recipe.");
      return;
    }
    setIsSubmitting(true);

    const formData = new FormData();

    formData.append("image", {
      uri: image.uri,
      name: `photo_${Date.now()}.jpg`,
      type: "image/jpeg",
    });

    formData.append("title", values.title);
    formData.append("cookTime", values.cookTime);

    values.ingredients.forEach((ingredient) => {
      formData.append("ingredients[]", ingredient);
    });
    values.instructions.forEach((instruction) => {
      formData.append("instructions[]", instruction);
    });

    try {
      await addRecipe(formData);
      Alert.alert("Success!", "Your recipe has been added.");
      resetForm();
      setImage(null);
      navigation.navigate("Recipes", { screen: "RecipesList" });
    } catch (error) {
      Alert.alert("Error", "Could not add the recipe. Please try again.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={100}
      >
        <Formik
          initialValues={{
            title: "",
            cookTime: "",
            ingredients: [""],
            instructions: [""],
          }}
          validationSchema={AddRecipeSchema}
          onSubmit={handleAddRecipe}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
          }) => (
            <ScrollView
              style={styles.container}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.header}>Add New Recipe</Text>

              <View style={styles.imagePickerContainer}>
                <Button
                  title="Pick an image for the recipe"
                  onPress={pickImage}
                />
                {image && (
                  <Image
                    source={{ uri: image.uri }}
                    style={styles.imagePreview}
                  />
                )}
              </View>

              <CustomInput
                label="Recipe Title"
                onChangeText={handleChange("title")}
                onBlur={handleBlur("title")}
                value={values.title}
                error={errors.title}
                touched={touched.title}
              />
              <CustomInput
                label="Cook Time (e.g., 30 minutes)"
                onChangeText={handleChange("cookTime")}
                onBlur={handleBlur("cookTime")}
                value={values.cookTime}
                error={errors.cookTime}
                touched={touched.cookTime}
              />

              <FieldArray name="ingredients">
                {({ push, remove }) => (
                  <View style={styles.arrayContainer}>
                    <Text style={styles.arrayLabel}>Ingredients</Text>
                    {values.ingredients.map((_, index) => (
                      <View key={index} style={styles.arrayItem}>
                        <TextInput
                          style={styles.arrayInput}
                          placeholder={`Ingredient #${index + 1}`}
                          onChangeText={handleChange(`ingredients[${index}]`)}
                          onBlur={handleBlur(`ingredients[${index}]`)}
                          value={values.ingredients[index]}
                        />
                        {values.ingredients.length > 1 && (
                          <TouchableOpacity onPress={() => remove(index)}>
                            <Ionicons
                              name="remove-circle"
                              size={24}
                              color="red"
                            />
                          </TouchableOpacity>
                        )}
                      </View>
                    ))}
                    <Button title="Add Ingredient" onPress={() => push("")} />
                  </View>
                )}
              </FieldArray>

              <FieldArray name="instructions">
                {({ push, remove }) => (
                  <View style={styles.arrayContainer}>
                    <Text style={styles.arrayLabel}>Instructions</Text>
                    {values.instructions.map((_, index) => (
                      <View key={index} style={styles.arrayItem}>
                        <TextInput
                          style={styles.arrayInput}
                          placeholder={`Step #${index + 1}`}
                          onChangeText={handleChange(`instructions[${index}]`)}
                          onBlur={handleBlur(`instructions[${index}]`)}
                          value={values.instructions[index]}
                          multiline
                        />
                        {values.instructions.length > 1 && (
                          <TouchableOpacity onPress={() => remove(index)}>
                            <Ionicons
                              name="remove-circle"
                              size={24}
                              color="red"
                            />
                          </TouchableOpacity>
                        )}
                      </View>
                    ))}
                    <Button title="Add Step" onPress={() => push("")} />
                  </View>
                )}
              </FieldArray>

              <View style={styles.submitButton}>
                <Button
                  title={isSubmitting ? "Adding Recipe..." : "Submit Recipe"}
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
  imagePreview: { width: 200, height: 150, marginTop: 15, borderRadius: 8 },
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

export default AddRecipeScreen;
