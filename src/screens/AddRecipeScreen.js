import React from 'react';
import { View, Text, StyleSheet, Button, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { Formik, FieldArray } from 'formik';
import * as Yup from 'yup';
import CustomInput from '../components/CustomInput';
import { useAppContext } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';

const AddRecipeSchema = Yup.object().shape({
  title: Yup.string().required('Title is required.'),
  cookTime: Yup.string().required('Cook time is required.'),
  imageUrl: Yup.string().url('Must be a valid URL.').required('Image URL is required.'),
  ingredients: Yup.array().of(Yup.string().required('Cannot be empty.')).min(1, 'Add at least one ingredient.'),
  instructions: Yup.array().of(Yup.string().required('Cannot be empty.')).min(1, 'Add at least one instruction.'),
});

const AddRecipeScreen = ({ navigation }) => {
  const { addRecipe } = useAppContext();

  return (
    <SafeAreaView style={{flex: 1}}>
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }} keyboardVerticalOffset={100}>
      <Formik
        initialValues={{ title: '', cookTime: '', imageUrl: '', ingredients: [''], instructions: [''] }}
        validationSchema={AddRecipeSchema}
        onSubmit={(values, { resetForm }) => {
          addRecipe(values);
          alert('Recipe Added!');
          resetForm();
          navigation.navigate('Recipes', { screen: 'RecipesList' });
        }}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <ScrollView style={styles.container}>
            <Text style={styles.header}>Add Your Recipe</Text>
            
            <CustomInput label="Recipe Title" onChangeText={handleChange('title')} value={values.title} error={errors.title} touched={touched.title} />
            <CustomInput label="Cook Time (e.g., 30 minutes)" onChangeText={handleChange('cookTime')} value={values.cookTime} error={errors.cookTime} touched={touched.cookTime} />
            <CustomInput label="Image URL" onChangeText={handleChange('imageUrl')} value={values.imageUrl} error={errors.imageUrl} touched={touched.imageUrl} />

            <FieldArray name="ingredients">
              {({ push, remove }) => (
                <View>
                  <Text style={styles.arrayLabel}>Ingredients</Text>
                  {values.ingredients.map((_, index) => (
                    <View key={index} style={styles.arrayItem}>
                      <TextInput style={styles.arrayInput} placeholder={`Ingredient ${index + 1}`} onChangeText={handleChange(`ingredients[${index}]`)} value={values.ingredients[index]} />
                      {values.ingredients.length > 1 && <TouchableOpacity onPress={() => remove(index)}><Ionicons name="remove-circle" size={24} color="red" /></TouchableOpacity>}
                    </View>
                  ))}
                  <Button title="Add Ingredient" onPress={() => push('')} />
                </View>
              )}
            </FieldArray>

            <FieldArray name="instructions">
              {({ push, remove }) => (
                <View style={{marginTop: 20}}>
                  <Text style={styles.arrayLabel}>Instructions</Text>
                  {values.instructions.map((_, index) => (
                    <View key={index} style={styles.arrayItem}>
                      <TextInput style={styles.arrayInput} placeholder={`Step ${index + 1}`} onChangeText={handleChange(`instructions[${index}]`)} value={values.instructions[index]} multiline />
                      {values.instructions.length > 1 && <TouchableOpacity onPress={() => remove(index)}><Ionicons name="remove-circle" size={24} color="red" /></TouchableOpacity>}
                    </View>
                  ))}
                  <Button title="Add Step" onPress={() => push('')} />
                </View>
              )}
            </FieldArray>

            <View style={styles.submitButton}><Button title="Submit Recipe" onPress={handleSubmit} color="#4CAF50" /></View>
          </ScrollView>
        )}
      </Formik>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  arrayLabel: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  arrayItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  arrayInput: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginRight: 10 },
  submitButton: { marginTop: 30, marginBottom: 50 },
});

export default AddRecipeScreen;