import React, { createContext, useContext, useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from './firebaseConfig'; // Import the auth from firebaseConfig

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const signUp = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user); // Set the registered user in the state
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


