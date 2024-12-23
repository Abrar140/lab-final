import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  ScrollView,
  Image,
  Alert
} from 'react-native';
import { Text } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { useProducts, FilterState } from '../hooks/useProducts';
import { router } from 'expo-router';
import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';

export default function BuyerDashboard() {
  const { 
    products,
    filteredProducts,
    categories,
    loading,
    error,
    searchProducts
  } = useProducts();

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    minPrice: '',
    maxPrice: '',
    minRating: 0,
    category: '',
  });

  // Search and filter logic
  useEffect(() => {
    searchProducts(searchQuery, filters);
    
    // Update search suggestions
    if (searchQuery) {
      const newSuggestions = products
        .filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()))
        .map(p => p.title)
        .slice(0, 5);
      setSuggestions(newSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery, filters, products]);

  const addToWishlist = async (productId: number) => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        Alert.alert('User not found');
        return;
      }

      const buyerRef = doc(db, 'buyers', userId);
      const buyerDoc = await getDoc(buyerRef);
      
      if (buyerDoc.exists() && buyerDoc.data().wishlist?.includes(productId.toString())) {
        Alert.alert('Product already in wishlist');
        return;
      }

      await updateDoc(buyerRef, {
        wishlist: arrayUnion(productId.toString())
      });

      Alert.alert('Product added to wishlist');
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      Alert.alert('Failed to add to wishlist');
    }
  };

  const renderProductItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.productCard}
      onPress={() => router.push(`/components/${item.id}`)}
    >
      <Image 
        source={{ uri: item.thumbnail }} 
        style={styles.thumbnail}
        resizeMode="cover"
      />
      <View style={styles.productInfo}>
        <Text style={styles.productTitle}>{item.title}</Text>
        <Text style={styles.productPrice}>${item.price}</Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.rating}>{item.rating}</Text>
        </View>
        <Text style={styles.stock}>Stock: {item.stock}</Text>
        <TouchableOpacity 
          style={styles.wishlistButton}
          onPress={(e) => {
            e.stopPropagation();
            addToWishlist(item.id);
          }}
        >
          <Ionicons name="heart-outline" size={20} color="#FF3B30" />
          <Text style={styles.wishlistButtonText}>Add to Wishlist</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons name="filter" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {suggestions.length > 0 && searchQuery && (
        <View style={styles.suggestionsContainer}>
          {suggestions.map((suggestion, index) => (
            <TouchableOpacity 
              key={index}
              style={styles.suggestionItem}
              onPress={() => {
                setSearchQuery(suggestion);
                setSuggestions([]);
              }}
            >
              <Text>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {showFilters && (
        <ScrollView style={styles.filtersContainer}>
          <View style={styles.priceFilters}>
            <TextInput
              style={styles.priceInput}
              placeholder="Min Price"
              value={filters.minPrice}
              onChangeText={(value) => setFilters({...filters, minPrice: value})}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.priceInput}
              placeholder="Max Price"
              value={filters.maxPrice}
              onChangeText={(value) => setFilters({...filters, maxPrice: value})}
              keyboardType="numeric"
            />
          </View>

          <Text style={styles.filterLabel}>Minimum Rating: {filters.minRating}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[0, 1, 2, 3, 4, 5].map((rating) => (
              <TouchableOpacity
                key={rating}
                style={[
                  styles.ratingButton,
                  filters.minRating === rating && styles.selectedRating
                ]}
                onPress={() => setFilters({...filters, minRating: rating})}
              >
                <Text>{rating}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.filterLabel}>Categories:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[
                styles.categoryButton,
                filters.category === '' && styles.selectedCategory
              ]}
              onPress={() => setFilters({...filters, category: ''})}
            >
              <Text>All</Text>
            </TouchableOpacity>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  filters.category === category && styles.selectedCategory
                ]}
                onPress={() => setFilters({...filters, category})}
              >
                <Text>{category}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </ScrollView>
      )}

      <FlatList
        data={filteredProducts}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.productList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  filterButton: {
    padding: 8,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 50,
    left: 10,
    right: 50,
    backgroundColor: 'white',
    borderRadius: 5,
    elevation: 3,
    zIndex: 1000,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filtersContainer: {
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginBottom: 10,
  },
  priceFilters: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  priceInput: {
    width: '48%',
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  ratingButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginRight: 10,
  },
  selectedRating: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginRight: 10,
  },
  selectedCategory: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  productList: {
    padding: 5,
  },
  productCard: {
    flex: 1,
    margin: 5,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    elevation: 2,
  },
  thumbnail: {
    width: '100%',
    height: 150,
    borderRadius: 10,
  },
  productInfo: {
    padding: 10,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: 'black',
  },
  productPrice: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  rating: {
    marginLeft: 5,
  },
  stock: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  wishlistButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE5E5',
    padding: 8,
    borderRadius: 5,
    marginTop: 8,
  },
  wishlistButtonText: {
    color: '#FF3B30',
    marginLeft: 5,
    fontSize: 12,
    fontWeight: 'bold',
  },
}); 