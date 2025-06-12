import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

const NewsletterCard = ({ item, onPress }) => {
  // --- ✅ THE FIX IS HERE ---
  // We check if `item.imageUrl` exists and is a valid string.
  // If it is, we create an object `{ uri: item.imageUrl }` for the network image.
  // If it's not, we use the local `require` statement for the placeholder.
  const imageSource = item.imageUrl 
    ? { uri: item.imageUrl } 
    : require('../../assets/pancakes.jpg');

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image source={imageSource} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={2} ellipsizeMode="tail">
          {item.title}
        </Text>
        <View style={styles.cardFooter}>
          <Text style={styles.authorText}>By {item.author?.username || 'Admin'}</Text>
          <Text style={styles.dateText}>
  {new Date(item.created_at).toLocaleDateString()}
</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#e0e0e0', // Shows a placeholder color while the image loads
  },
  cardContent: {
    padding: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  authorText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  dateText: {
    fontSize: 12,
    color: '#666',
  },
});

export default NewsletterCard;