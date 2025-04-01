import React from 'react';
import { View, Text, StyleSheet, Button, TextInput,TouchableOpacity } from 'react-native';
import { firebase_auth } from "../firebaseConfig";

//home screen 
const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home</Text>
      <Text>Welcome to the Home Screen!</Text>
      <Button onPress={() => firebase_auth.signOut()} title="Sign Out" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});

export default HomeScreen;