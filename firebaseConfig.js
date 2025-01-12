// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
// const analytics = getAnalytics(app);