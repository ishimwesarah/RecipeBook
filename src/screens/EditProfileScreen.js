import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Button,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import CustomInput from "../components/CustomInput";
import { useAppContext } from "../context/AppContext";

const ProfileValidationSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Too Short!")
    .max(50, "Too Long!")
    .required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  bio: Yup.string().max(200, "Bio cannot be longer than 200 characters"),
});

const EditProfileScreen = ({ navigation }) => {
  const { user: currentUser, updateUserProfile } = useAppContext();

  if (!currentUser) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  const handleUpdate = async (values) => {
    Alert.alert("Profile Updated", "Your changes have been saved.");
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView>
          <Formik
            initialValues={{
              name: currentUser.username,
              email: currentUser.email,
              bio: currentUser.bio || "",
            }}
            validationSchema={ProfileValidationSchema}
            onSubmit={handleUpdate}
            enableReinitialize
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
            }) => (
              <View style={styles.formContainer}>
                <View style={styles.header}>
                  <Image
                    source={
                      currentUser.profilePictureUrl
                        ? { uri: currentUser.profilePictureUrl }
                        : require("../../assets/pancakes.jpg")
                    }
                    style={styles.profileImage}
                  />
                  <Text style={styles.headerText}>Edit Your Profile</Text>
                </View>

                <CustomInput
                  label="Username"
                  onChangeText={handleChange("name")}
                  onBlur={handleBlur("name")}
                  value={values.name}
                  error={errors.name}
                  touched={touched.name}
                />
                <CustomInput
                  label="Email"
                  onChangeText={handleChange("email")}
                  onBlur={handleBlur("email")}
                  value={values.email}
                  error={errors.email}
                  touched={touched.email}
                  keyboardType="email-address"
                />
                <CustomInput
                  label="Bio"
                  onChangeText={handleChange("bio")}
                  onBlur={handleBlur("bio")}
                  value={values.bio}
                  error={errors.bio}
                  touched={touched.bio}
                  multiline
                  numberOfLines={4}
                />
                <Button
                  onPress={handleSubmit}
                  title="Save Changes"
                  color="#4CAF50"
                />
              </View>
            )}
          </Formik>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  formContainer: { padding: 20 },
  header: { alignItems: "center", marginBottom: 30 },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "#4CAF50",
  },
  headerText: { fontSize: 22, fontWeight: "bold" },
});

export default EditProfileScreen;
