import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import { firebase_auth } from "./src/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

//import the screens from folder
// import ProtectedAreaScreen from "./src/screens/ProtectedAreaScreen";
import SignInScreen from "./src/screens/SignInScreen";
import WelcomeScreen from "./src/screens/WelcomeScreen";
import TabNavigator from "./src/screens/TabNavigator"; // Import the TabNavigator

export default function App() {
  const [user, setUser] = useState(null);  //manages the user’s authentication state
  const Stack = createNativeStackNavigator(); //creates the main stack navigator

  //This block listens for authentication state changes using Firebase.
  useEffect(() => {
    onAuthStateChanged(firebase_auth, (user) => {
      if (user) { console.log("user", user.email); }
      setUser(user);
    });
  }, []);

  //The main part of the app renders based on whether a user is authenticated or not.
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Welcome">
        {user ? (
          // If the user is authenticated, show the protected area
          <Stack.Screen
            name="App"
            component={TabNavigator}
            options={{ headerShown: false }}
          />
        ) : (
          // If the user is not authenticated, show the welcome and auth screens
          <>
            <Stack.Screen
              name="Welcome"
              component={WelcomeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="SignIn"
              component={SignInScreen}
              options={{ title: 'Login' }}
            />
            <Stack.Screen
              name="SignUp"
              component={SignInScreen}
              options={{ title: 'Sign Up' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}