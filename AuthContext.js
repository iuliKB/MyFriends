import React, { createContext, useContext, useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, firestore } from './firebaseConfig'; // Import Firestore
import { doc, setDoc } from 'firebase/firestore'; // Import Firestore functions

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const signUp = async (email, password, username, phoneNumber) => {
    try {
      // Create the user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user; // Firebase Authentication user

      // Store user data in Firestore
      const userRef = doc(firestore, 'users', user.uid); // Firestore document reference
      await setDoc(userRef, {
        email: user.email,
        username: username, // User's username
        phone_number: phoneNumber, // User's phone number
        friends: [], // Empty array for friends initially
        wishlist: [], // Empty array for wishlist initially
        profile_picture: "", // Default empty profile picture
        createdAt: new Date(),
      });

      // Set the user state with authenticated user
      setUser(user);
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const signIn = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user); // Set the authenticated user in the state
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);
      setUser(null); // Clear the authenticated user from the state
    } catch (error) {
      throw new Error(error.message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, signUp, signIn, logOut }}>
      {children}
    </AuthContext.Provider>
  );
};
