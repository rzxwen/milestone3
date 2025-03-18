import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { firebase_auth } from "../firebaseConfig";


const WelcomeScreen = ({ navigation }) => { //welcome user before sign in 
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Honkai Star Rail Companion</Text>
      <Button
        title="Start"
        onPress={() => navigation.navigate('SignIn')} // Navigate to the login screen
      />
    
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
  },
});

export default WelcomeScreen;