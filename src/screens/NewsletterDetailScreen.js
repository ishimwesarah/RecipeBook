import React from 'react';
import { 
  View, Text, StyleSheet, ScrollView, SafeAreaView, 
  Image, ActivityIndicator, Button, Alert 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppContext } from '../context/AppContext';

const NewsletterDetailScreen = ({ route }) => {
  const navigation = useNavigation();
  const { newsletterId } = route.params;
  const { user, newsletters, deleteNewsletter } = useAppContext();

  
  const newsletter = newsletters.find(n => n.id === newsletterId);

 
  const handleDelete = () => {
    Alert.alert("Delete Newsletter", "Are you sure? This action cannot be undone.", [
      { text: "Cancel" },
      { 
        text: "Delete", 
        style: 'destructive', 
        onPress: async () => {
          await deleteNewsletter(newsletterId);
          navigation.goBack(); 
        }
      }
    ]);
  };

 
  const renderBlock = (block, index) => {
   
    const key = `${block.type}-${block.id || index}`;

    switch (block.type) {
      case 'heading':
        return <Text key={key} style={styles.heading}>{block.text}</Text>;
      
      case 'image':
        return (
          <View key={key} style={styles.imageContainer}>
            <Image source={{ uri: block.url }} style={styles.contentImage} />
            {block.caption && <Text style={styles.caption}>{block.caption}</Text>}
          </View>
        );
      
      case 'paragraph':
        return <Text key={key} style={styles.paragraph}>{block.text}</Text>;
      
     
      case 'loading':
        return <View key={key} style={styles.loadingBlock}><ActivityIndicator /></View>;

      default:
       
        return null;
    }
  };


  if (!newsletter) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={{ marginTop: 10 }}>Loading newsletter...</Text>
      </View>
    );
  }

 
  const heroImageSource = newsletter.imageUrl 
    ? { uri: newsletter.imageUrl } 
    : require('../../assets/pancakes.jpg');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Image source={heroImageSource} style={styles.heroImage} />
        
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{newsletter.title}</Text>
          
          <View style={styles.metaContainer}>
            <Text style={styles.metaText}>By {newsletter.author?.username || 'Admin'}</Text>
            <Text style={styles.metaSeparator}>•</Text>
            <Text style={styles.metaText}>
              {new Date(newsletter.created_at).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric' 
              })}
            </Text>
          </View>
          
          {(user?.role === 'admin'|| user?.role === 'super_admin') &&(
            <View style={styles.adminControls}>
              <Button title="Edit" onPress={() => navigation.navigate('EditNewsletter', { newsletterId: newsletter.id })} />
              <Button title="Delete" color="#E53935" onPress={handleDelete} />
            </View>
          )}
          
          <View style={styles.separator} />

         
          {Array.isArray(newsletter.content) && newsletter.content.map((block, index) => 
            renderBlock(block, index)
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  heroImage: { width: '100%', height: 250, backgroundColor: '#e0e0e0' },
  contentContainer: { padding: 20 },
  title: { fontSize: 30, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 12, lineHeight: 40 },
  metaContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  metaText: { fontSize: 14, color: '#888' },
  metaSeparator: { marginHorizontal: 8, color: '#ccc' },
  adminControls: { flexDirection: 'row', justifyContent: 'space-evenly', paddingVertical: 10, marginVertical: 10, backgroundColor: '#f0f0f0', borderRadius: 8 },
  separator: { height: 1, backgroundColor: '#e5e5e5', marginVertical: 15 },
  
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    lineHeight: 32,
    color: '#222',
  },
  paragraph: {
    fontSize: 17,
    lineHeight: 28,
    marginBottom: 20,
    color: '#333',
  },
  imageContainer: {
    marginVertical: 20,
  },
  contentImage: {
    width: '100%',
    height: 220,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  caption: {
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
    color: '#666',
  },
  loadingBlock: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default NewsletterDetailScreen;