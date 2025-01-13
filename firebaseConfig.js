// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA_WnBd0-e-GUKMvDFlesK1QtdIdee7sdQ",
  authDomain: "myfriends-cb17a.firebaseapp.com",
  projectId: "myfriends-cb17a",
  storageBucket: "myfriends-cb17a.firebasestorage.app",
  messagingSenderId: "555618062667",
  appId: "1:555618062667:web:6d58a7a1fa4ecce26358ce",
  measurementId: "G-PRWK0X48BX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

const firestore = getFirestore(app);

export { auth, firestore };