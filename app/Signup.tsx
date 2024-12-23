import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Text } from '@/components/Themed';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { auth, db } from './firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useAuth } from './context/AuthContext';

function Signup() {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleSignUp = async () => {
    if (!email || !password || !userName) {
      setToastMessage('Please fill in all fields');
      setToastVisible(true);
      return;
    }

    setLoading(true);
    try {
      const userRole = await AsyncStorage.getItem('userRole');
      const response = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user document
      const userRef = doc(db, 'users', response.user.uid);
      await setDoc(userRef, {
        userName,
        email,
        role: userRole,
        createdAt: new Date().toISOString()
      });

      // Create role-specific document
      const roleCollectionRef = doc(db, userRole === 'buyer' ? 'buyers' : 'sellers', response.user.uid);
      await setDoc(roleCollectionRef, {
        userId: response.user.uid,
        userName,
        email,
        createdAt: new Date().toISOString(),
        ...(userRole === 'buyer' ? {
          wishlist: [],
          orders: []
        } : {
          products: [],
          activeOrders: []
        })
      });

      setToastMessage('Account created successfully!');
      setToastVisible(true);
      router.replace('/Signin');
    } catch (error: any) {
      console.error('Error signing up:', error);
      setToastMessage(error.message || 'Sign up failed');
      setToastVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      
      <TextInput
        style={[styles.input, styles.inputText]}
        placeholder="Enter your username"
        placeholderTextColor="#666"
        value={userName}
        onChangeText={setUserName}
        autoCapitalize="none"
      />

      <TextInput
        style={[styles.input, styles.inputText]}
        placeholder="Enter your email"
        placeholderTextColor="#666"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        style={[styles.input, styles.inputText]}
        placeholder="Create password"
        placeholderTextColor="#666"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleSignUp}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Sign Up</Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.linkButton}
        onPress={() => router.back()}
      >
        <Text style={styles.linkText}>Already have an account? Sign In</Text>
      </TouchableOpacity>

      {toastVisible && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}
    </View>
  );
}

// Keep your existing styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  input: {
    width: '80%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    width: '80%',
    marginBottom: 15,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  linkButton: {
    marginTop: 10,
  },
  linkText: {
    color: '#007AFF',
    fontSize: 16,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    opacity: 0.7,
    color: '#fff',
  },
  inputText: {
    color: 'white',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  toast: {
    position: 'absolute',
    bottom: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 20,
  },
  toastText: {
    color: 'white',
    textAlign: 'center',
  }
});

export default Signup; 