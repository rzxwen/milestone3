import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { firebase_auth } from "../firebaseConfig";

const WelcomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>You've arrived @{"\n"}Pompom's Train Station</Text>
      
      <TouchableOpacity
        style={styles.startButton}
        onPress={() => navigation.navigate('SignIn')}
      >
        <Text style={styles.startButtonText}>Enter</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: "#121212",
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 50,
    textAlign: 'center',
    color: "#ffffff",
  },
  startButton: {
    backgroundColor: "#01DBC6",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
    width: 200,
  },
  startButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default WelcomeScreen;