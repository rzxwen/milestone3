import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { firebase_auth } from "../firebaseConfig";

const CameraScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Camera</Text>
      <Text>Welcome to the Camera Screen!</Text>

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

export default CameraScreen;