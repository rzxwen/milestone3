import React, { useState, useEffect } from "react";
import { StyleSheet, Text, Image, TextInput, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { firebase_auth } from "../firebaseConfig";
import { firestore_db } from "../firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SignInScreen() {
  // State variables to track email and password inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  // our authentication, initialized in the beginning
  const auth = firebase_auth;
  const navigation = useNavigation();
  
  // Check if user is already authenticated when component mounts
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is already signed in
        console.log("User already signed in:", user.email);
        
        try {
          // Store user info in AsyncStorage
          await AsyncStorage.setItem('userEmail', user.email);
          await AsyncStorage.setItem('userId', user.uid);
          
          // Update the last login timestamp silently
          const userRef = doc(firestore_db, "users", user.uid);
          await setDoc(userRef, {
            lastLogin: serverTimestamp()
          }, { merge: true });
          
          // Navigate to app screen (matches your App.js navigation structure)
          navigation.replace('App');
        } catch (error) {
          console.error("Error saving user data:", error);
          setIsLoading(false);
        }
      } else {
        // No user is signed in
        setIsLoading(false);
      }
    });
    
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);
  
  const handleSignUp = async () => {
    if (!email || !password) {
      alert("Please enter both email and password");
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await createUserWithEmailAndPassword(auth, email, password);
      console.log(response);
      
      // Create a user profile document in Firestore
      const userRef = doc(firestore_db, "users", response.user.uid);
      await setDoc(userRef, {
        email: response.user.email,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        displayName: email.split('@')[0], // Simple default display name
      });
      
      // Store user info in AsyncStorage
      await AsyncStorage.setItem('userEmail', response.user.email);
      await AsyncStorage.setItem('userId', response.user.uid);
      
      // The App.js already listens for auth state changes and will redirect automatically
      alert("Sign up success!");
    } catch (error) {
      console.log(error.message);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSignIn = async () => {
    if (!email || !password) {
      alert("Please enter both email and password");
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
      console.log(response);
      
      // Update user's last login timestamp
      const userRef = doc(firestore_db, "users", response.user.uid);
      await setDoc(userRef, {
        lastLogin: serverTimestamp()
      }, { merge: true }); // merge: true ensures we don't overwrite existing data
      
      // Store user info in AsyncStorage
      await AsyncStorage.setItem('userEmail', response.user.email);
      await AsyncStorage.setItem('userId', response.user.uid);
      
      // The App.js already listens for auth state changes and will redirect automatically
      // But we can also manually navigate if needed
      navigation.replace('App');
    } catch (error) {
      console.log(error.message);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#01DBC6" />
        <Text style={styles.loadingText}>Checking login status...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Sign In</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888888"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888888"
        secureTextEntry={true}
        value={password}
        onChangeText={setPassword}
      />
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.signInButton} 
          onPress={handleSignIn}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.signUpButton} 
          onPress={handleSignUp}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#01DBC6" />
          ) : (
            <Text style={styles.signUpButtonText}>Create Account</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#121212",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  loadingText: {
    color: "#FFFFFF",
    marginTop: 16,
    fontSize: 16,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#01DBC6",
    textAlign: "center",
    marginBottom: 16,
  },
  header: {
    fontSize: 35,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 32,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#333333",
    backgroundColor: "#1e1e1e",
    borderRadius: 6,
    marginBottom: 16,
    paddingHorizontal: 16,
    color: "#ffffff",
  },
  buttonContainer: {
    marginTop: 16,
  },
  signInButton: {
    backgroundColor: "#01DBC6",
    padding: 14,
    borderRadius: 6,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  signUpButton: {
    backgroundColor: "#1e1e1e",
    padding: 14,
    borderRadius: 6,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#01DBC6",
  },
  signUpButtonText: {
    color: "#01DBC6",
    fontSize: 16,
    fontWeight: "bold",
  }
});