import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/Themed';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

export default function RoleSelect() {
  const handleRoleSelect = async (role: 'buyer' | 'seller') => {
    try {
      await AsyncStorage.clear();
      await AsyncStorage.setItem('userRole', role);
      router.replace('/Signin');
    } catch (error) {
      console.error('Error saving role:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome!</Text>
      <Text style={styles.subtitle}>Please select your role</Text>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => handleRoleSelect('buyer')}
      >
        <Text style={styles.buttonText}>I'm a Buyer</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, styles.sellerButton]} 
        onPress={() => handleRoleSelect('seller')}
      >
        <Text style={styles.buttonText}>I'm a Seller</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 40,
    opacity: 0.8,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    width: '80%',
    marginBottom: 20,
  },
  sellerButton: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
}); 