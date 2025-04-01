import { initializeApp } from 'firebase/app';
import { 
  initializeAuth, 
  getReactNativePersistence 
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

//your web app's firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBuSnpUij8H5Z3vukCWvuOe4dRnap87fl8",
  authDomain: "iat-359---final-proj.firebaseapp.com",
  projectId: "iat-359---final-proj",
  storageBucket: "iat-359---final-proj.firebasestorage.app",
  messagingSenderId: "584307728520",
  appId: "1:584307728520:web:0bcfcaeaac7bca45c23f3d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence as
const firebase_auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore
const firestore_db = getFirestore(app);

export { firebase_auth, firestore_db };