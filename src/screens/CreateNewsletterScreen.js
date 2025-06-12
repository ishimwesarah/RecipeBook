import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  ScrollView,
  Image,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import * as ImagePicker from "expo-image-picker";
import { useAppContext } from "../context/AppContext";
import CustomInput from "../components/CustomInput";

const NewsletterSchema = Yup.object().shape({
  title: Yup.string()
    .min(5, "Title is too short.")
    .required("Title is required."),
  content: Yup.string()
    .min(20, "Content is too short.")
    .required("Content is required."),
});

const CreateNewsletterScreen = ({ navigation }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [image, setImage] = useState(null);

  const { addNewsletter } = useAppContext();

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Sorry, we need camera roll permissions to add an image."
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
      setImage(result.assets[0]);
    }
  };

  const handleAddNewsletter = async (values, { resetForm }) => {
    if (!image) {
      Alert.alert(
        "Image Required",
        "Please select a hero image for the newsletter."
      );
      return;
    }
    setIsSubmitting(true);
    const formData = new FormData();

    formData.append("image", {
      uri: image.uri,
      name: `newsletter_${Date.now()}.jpg`,
      type: "image/jpeg",
    });
    formData.append("title", values.title);
    formData.append("content", values.content);

    try {
      await addNewsletter(formData);

      Alert.alert("Success!", "Your newsletter has been published.");
      resetForm();
      setImage(null);
      navigation.goBack();
    } catch (error) {
      const message =
        error.response?.data?.message || "Could not publish the newsletter.";
      Alert.alert("Error", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <Formik
          initialValues={{ title: "", content: "" }}
          validationSchema={NewsletterSchema}
          onSubmit={handleAddNewsletter}
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
              style={styles.formContainer}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.header}>Create New Newsletter</Text>

              <View style={styles.imagePickerContainer}>
                <Button title="Pick a Hero Image" onPress={pickImage} />
                {image && (
                  <Image
                    source={{ uri: image.uri }}
                    style={styles.imagePreview}
                  />
                )}
              </View>

              <CustomInput
                label="Newsletter Title"
                onChangeText={handleChange("title")}
                value={values.title}
                error={errors.title}
                touched={touched.title}
              />
              <CustomInput
                label="Content"
                onChangeText={handleChange("content")}
                value={values.content}
                error={errors.content}
                touched={touched.content}
                multiline
                numberOfLines={12}
                style={{ height: 250, textAlignVertical: "top" }}
              />

              <View style={styles.submitButton}>
                <Button
                  title={isSubmitting ? "Publishing..." : "Publish Newsletter"}
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
  container: { flex: 1, backgroundColor: "#f8f8f8" },
  formContainer: { padding: 20 },
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
  imagePreview: {
    width: "100%",
    height: 180,
    marginTop: 15,
    borderRadius: 8,
    backgroundColor: "#e0e0e0",
  },
  submitButton: { marginTop: 20, marginBottom: 50 },
});

export default CreateNewsletterScreen;
