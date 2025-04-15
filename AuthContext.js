import React, { createContext, useContext, useState, useEffect } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, firestore } from './firebaseConfig'; // Import Firestore
import { doc, setDoc, getDoc } from 'firebase/firestore'; // Import Firestore functions

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile data from Firestore
  const fetchUserProfile = async (userId) => {
    try {
      const userDocRef = doc(firestore, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        setUserProfile(userDoc.data());
      } else {
        console.log("No user profile found");
        setUserProfile(null);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setUserProfile(null);
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        await fetchUserProfile(currentUser.uid);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  const signUp = async (email, password, username, phoneNumber) => {
    try {
      // Create the user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user; // Firebase Authentication user

      // Store user data in Firestore
      const userRef = doc(firestore, 'users', user.uid); // Firestore document reference
      const userData = {
        email: user.email,
        username: username, // User's username
        phone_number: phoneNumber, // User's phone number
        friends: [], // Empty array for friends initially
        wishlist: [], // Empty array for wishlist initially
        profile_picture: "", // Default empty profile picture
        createdAt: new Date(),
        events: [], // Empty array for events initially
        tasks: [], // Empty array for tasks initially
      };
      
      await setDoc(userRef, userData);
      
      // Set the user state with authenticated user and profile
      setUser(user);
      setUserProfile(userData);
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const signIn = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const currentUser = userCredential.user;
      setUser(currentUser); // Set the authenticated user in the state
      
      // Fetch user profile after sign in
      await fetchUserProfile(currentUser.uid);
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);
      setUser(null); // Clear the authenticated user from the state
      setUserProfile(null); // Clear the user profile
    } catch (error) {
      throw new Error(error.message);
    }
  };

  // Update user profile data
  const updateUserProfile = async (profileData) => {
    try {
      if (!user) {
        throw new Error("No authenticated user");
      }

      const userRef = doc(firestore, 'users', user.uid);
      
      // Update the document with the new profile data
      await setDoc(userRef, profileData, { merge: true });
      
      // Refresh the user profile in state
      await fetchUserProfile(user.uid);
      
      return true;
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw new Error(error.message);
    }
  };

  // Initialize or update user structure
  const initializeUserStructure = async () => {
    try {
      if (!user) {
        throw new Error("No authenticated user");
      }

      const userRef = doc(firestore, 'users', user.uid);
      
      // Add new fields while preserving existing data
      await setDoc(userRef, {
        events: [],
        tasks: []
      }, { merge: true });
      
      // Refresh the user profile
      await fetchUserProfile(user.uid);
      
      return true;
    } catch (error) {
      console.error("Error initializing user structure:", error);
      throw new Error(error.message);
    }
  };

  // Call initializeUserStructure when user logs in
  useEffect(() => {
    if (user && userProfile) {
      // Check if the user needs structure update
      if (!userProfile.events || !userProfile.tasks) {
        initializeUserStructure();
      }
    }
  }, [user, userProfile]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      userProfile, 
      loading, 
      signUp, 
      signIn, 
      logOut,
      refreshUserProfile: () => user ? fetchUserProfile(user.uid) : null,
      updateUserProfile,
      initializeUserStructure
    }}>
      {children}
    </AuthContext.Provider>
  );
};
