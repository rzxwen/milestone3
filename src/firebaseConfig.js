//initialize a firebase app in the react native project
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { getFirestore } from "firebase/firestore";

//your web app's firebase configurationr
const firebaseConfig = {
  apiKey: "AIzaSyBuSnpUij8H5Z3vukCWvuOe4dRnap87fl8",
  authDomain: "iat-359---final-proj.firebaseapp.com",
  projectId: "iat-359---final-proj",
  storageBucket: "iat-359---final-proj.firebasestorage.app",
  messagingSenderId: "584307728520",
  appId: "1:584307728520:web:0bcfcaeaac7bca45c23f3d"
};

//exports the app so that it can be used in other parts of the project
export const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence
export const firebase_auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

//exports the firestore database instance to be used in other parts of your project
export const firestore_db = getFirestore(app);