import React, { useState } from "react";
import { StyleSheet, Text, Image, TextInput, View, TouchableOpacity } from "react-native";
import { firebase_auth } from "../firebaseConfig";
import { firestore_db } from "../firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function SignInScreen() {
  // State variables to track email and password inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // our authentication, initialized in the beginning
  const auth = firebase_auth;
  
  const handleSignUp = async () => {
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
      
      alert("Sign up success. User: " + email + " signed up.");
    } catch (error) {
      console.log(error.message);
      alert(error.message);
    }
  };
  
  const handleSignIn = async () => {
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
      console.log(response);
      
      // Update user's last login timestamp
      const userRef = doc(firestore_db, "users", response.user.uid);
      await setDoc(userRef, {
        lastLogin: serverTimestamp()
      }, { merge: true }); // merge: true ensures we don not overwrite existing data
      
      alert("User: " + email + " signed in");
    } catch (error) {
      console.log(error.message);
      alert(error.message);
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Honkai Star Rail Companion</Text>
      <Text style={styles.header}>Sign In</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888888"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
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
        <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
          <Text style={styles.signUpButtonText}>Create Account</Text>
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#01DBC6",
    textAlign: "center",
    marginBottom: 16,
  },
  header: {
    fontSize: 28,
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