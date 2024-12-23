import { useState, useEffect } from 'react';

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  rating: number;
  stock: number;
  thumbnail: string;
}

interface UseProductsReturn {
  products: Product[];
  filteredProducts: Product[];
  categories: string[];
  loading: boolean;
  error: string | null;
  searchProducts: (query: string, filters: FilterState) => void;
}

export interface FilterState {
  minPrice: string;
  maxPrice: string;
  minRating: number;
  category: string;
}

export function useProducts(): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('https://dummyjson.com/products');
      const data = await response.json();
      
      setProducts(data.products);
      setFilteredProducts(data.products);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(data.products.map((p: Product) => p.category))];
      setCategories(uniqueCategories);
      
      setError(null);
    } catch (err) {
      setError('Failed to fetch products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const searchProducts = (query: string, filters: FilterState) => {
    const filtered = products.filter(product => {
      const matchesSearch = product.title.toLowerCase().includes(query.toLowerCase()) ||
                          product.description.toLowerCase().includes(query.toLowerCase());
      
      const matchesPrice = (!filters.minPrice || product.price >= parseFloat(filters.minPrice)) &&
                          (!filters.maxPrice || product.price <= parseFloat(filters.maxPrice));
      
      const matchesRating = product.rating >= filters.minRating;
      
      const matchesCategory = !filters.category || product.category === filters.category;

      return matchesSearch && matchesPrice && matchesRating && matchesCategory;
    });

    setFilteredProducts(filtered);
  };

  return {
    products,
    filteredProducts,
    categories,
    loading,
    error,
    searchProducts,
  };
} 