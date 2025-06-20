import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  SafeAreaView,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import CustomInput from "../components/CustomInput";
import { useAppContext } from "../context/AppContext";

const InviteUserSchema = Yup.object().shape({
  username: Yup.string().required("Username is required."),
  email: Yup.string().email("Invalid email").required("Email is required."),
  role: Yup.string()
    .oneOf(["user", "admin"], "Role must be either 'user' or 'admin'")
    .required("Role is required."),
});

const CreateUserScreen = ({ navigation }) => {
  const { inviteUser } = useAppContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInviteUser = async (values, { resetForm }) => {
    setIsSubmitting(true);
    try {
      const response = await inviteUser(values);

      Alert.alert("Invitation Sent!", response.message, [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
      resetForm();
    } catch (error) {
      const message =
        error.response?.data?.message || "Could not send invitation.";
      Alert.alert("Error", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Invite New User</Text>
        <Text style={styles.subtitle}>
          An email will be sent to the user with a link to set up their
          password.
        </Text>

        <Formik
          initialValues={{ username: "", email: "", role: "user" }}
          validationSchema={InviteUserSchema}
          onSubmit={handleInviteUser}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
          }) => (
            <>
              <CustomInput
                label="Username"
                onChangeText={handleChange("username")}
                onBlur={handleBlur("username")}
                value={values.username}
                error={errors.username}
                touched={touched.username}
              />
              <CustomInput
                label="Email"
                onChangeText={handleChange("email")}
                onBlur={handleBlur("email")}
                value={values.email}
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email}
                touched={touched.email}
              />

              <CustomInput
                label="Assign Role ('user' or 'admin')"
                onChangeText={handleChange("role")}
                onBlur={handleBlur("role")}
                value={values.role}
                autoCapitalize="none"
                error={errors.role}
                touched={touched.role}
              />
              <View style={styles.buttonContainer}>
                {isSubmitting ? (
                  <ActivityIndicator size="large" color="#4CAF50" />
                ) : (
                  <Button
                    title="Send Invitation"
                    onPress={handleSubmit}
                    color="#4CAF50"
                  />
                )}
              </View>
            </>
          )}
        </Formik>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { justifyContent: "center", padding: 20, flexGrow: 1 },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 40,
  },
  buttonContainer: { marginTop: 20 },
});

export default CreateUserScreen;
