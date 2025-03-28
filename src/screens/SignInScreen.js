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
      {/* <Image source={require('./assets/origamibird.png')} /> */}
      {/* //add a container for these */}
      <Text style={styles.header}>LOG IN!</Text>
      <Text style={styles.description}>Honkai Star Rail Companion</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry={true}
        value={password}
        onChangeText={setPassword}
      />
      <View style={styles.container}>
        <TouchableOpacity style={styles.loginButton} onPress={handleSignIn}>
          <Text style={styles.loginText}>Log In</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.signupButton} onPress={handleSignUp}>
          <Text style={styles.signupText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 40,
    backgroundColor: "#141212",
  },
  header: {
    fontSize: 64,
    fontWeight: "400",
    color: "#fff",
    fontFamily: "Poppins",
  },
  description:{
    fontSize: 16,
    fontWeight: "400",
    color: "#FFF",
    fontFamily: "Poppins",
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
  },
  loginButton: {
    width: "100%",
    padding: 16,
    borderRadius: 30,
    backgroundColor: "#01DBC6",
    alignItems: "center",
  },
  loginText: {
    color: "#fff",
    fontWeight: "bold",
  },
  signupButton:{
    width: "100%",
    padding: 16,
    borderRadius: 30,
    backgroundColor: "#ffffff",
    alignItems: "center",
  },
  signupText: {
    color: "#000",
    fontWeight: "bold",
  },
  footer: {
    marginTop: 20,
    textAlign: "center",
    color: "#888",
  },
});