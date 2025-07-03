import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Image,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
} from "react-native";
import ScreenWrapper from "../components/ScreenWrapper";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { hp, wp } from "../helpers/common";
import { theme } from "../constants/theme";

// Firebase
import { firestore, auth } from '../firebaseConfig';
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [newItem, setNewItem] = useState({ title: "", description: "" });

  const getImage = (name) => {
    switch (name) {
      case "cake.jpg":
        return require("../assets/images/cake.jpg");
      default:
        return require("../assets/images/cake.jpg");
    }
  };

  // Real-time listener for Firestore wishlist
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const q = query(
      collection(firestore, "wishlist"),
      where("userId", "==", currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setWishlistItems(items);
    });

    return () => unsubscribe();
  }, []);

  // Add new item to Firestore
  const handleAddItem = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser || !newItem.title || !newItem.description) return;

    try {
      await addDoc(collection(firestore, "wishlist"), {
        title: newItem.title,
        description: newItem.description,
        image: "cake.jpg",
        userId: currentUser.uid,
      });
      setNewItem({ title: "", description: "" });
    } catch (error) {
      console.error("Error adding item: ", error);
    }
  };

  // Delete item from Firestore
  const handleRemoveItem = async (id) => {
    try {
      await deleteDoc(doc(firestore, "wishlist", id));
    } catch (error) {
      console.error("Error removing item: ", error);
    }
  };

  const renderWishlistItem = ({ item }) => (
    <View style={styles.wishlistItem}>
      <Image source={getImage(item.image)} style={styles.itemImage} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemDescription}>{item.description}</Text>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveItem(item.id)}
      >
        <Text style={styles.removeButtonText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient
      colors={["#fbae52", "#dd528d", "#ff8c79"]}
      style={styles.gradientBackground}
    >
      <ScreenWrapper>
        <LinearGradient
          colors={["#73d1d3", "#badcc3", "#dba380"]}
          style={styles.fullScreenOval}
        >
          <Text style={styles.ovalText}>My WishList</Text>
        </LinearGradient>

        <View style={styles.addItemContainer}>
          <TextInput
            style={styles.input}
            placeholder="Item Title"
            placeholderTextColor="black"
            value={newItem.title}
            onChangeText={(text) => setNewItem({ ...newItem, title: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Item Description"
            placeholderTextColor="black"
            value={newItem.description}
            onChangeText={(text) =>
              setNewItem({ ...newItem, description: text })
            }
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
            <Text style={styles.addButtonText}>Add Item</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={wishlistItems}
          renderItem={renderWishlistItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />

        <View style={styles.bottomNavigation}>
          <TouchableOpacity onPress={() => router.push("homepage")}>
            <Image
              source={require("../assets/icons/home_icon.png")}
              style={styles.navIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("friends")}>
            <View>
              <Image
                source={require("../assets/icons/friends_icon.png")}
                style={styles.navIcon}
              />
              <View style={styles.notificationBadge} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("map")}>
            <Image
              source={require("../assets/icons/globe_icon.png")}
              style={styles.globeIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("calendar")}>
            <Image
              source={require("../assets/icons/calendar_icon.png")}
              style={styles.navIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("myaccount")}>
            <Image
              source={require("../assets/icons/profile_icon.png")}
              style={styles.navIcon}
            />
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  fullScreenOval: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "35%",
    borderBottomLeftRadius: wp(100),
    borderBottomRightRadius: wp(100),
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  ovalText: {
    color: "#fff",
    fontSize: hp(3.5),
    fontWeight: "bold",
    textAlign: "center",
  },
  addItemContainer: {
    marginTop: hp(15),
    paddingHorizontal: wp(5),
    marginBottom: hp(2),
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 10,
    padding: hp(1.5),
    marginBottom: hp(1),
    fontSize: hp(2),
  },
  addButton: {
    backgroundColor: "#dd528d",
    paddingVertical: hp(1.5),
    borderRadius: 10,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: hp(2),
  },
  listContainer: {
    paddingHorizontal: wp(5),
  },
  wishlistItem: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 15,
    padding: wp(4),
    marginBottom: hp(2),
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  itemImage: {
    width: wp(20),
    height: wp(20),
    resizeMode: "contain",
    marginRight: wp(4),
  },
  itemDetails: {
    flex: 1,
  },
  itemTitle: {
    fontSize: hp(2.2),
    fontWeight: "600",
    color: "black",
    marginBottom: hp(0.5),
  },
  itemDescription: {
    fontSize: hp(1.8),
    color: "#666",
  },
  removeButton: {
    backgroundColor: "#dd528d",
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    borderRadius: 25,
  },
  removeButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: hp(1.8),
  },
  bottomNavigation: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: hp(7),
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderRadius: 50,
    position: "absolute",
    bottom: hp(2.5),
    width: "90%",
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  navIcon: {
    width: 28,
    height: 28,
    resizeMode: "contain",
  },
  notificationBadge: {
    position: "absolute",
    top: -2,
    right: -6,
    width: 8,
    height: 8,
    backgroundColor: "red",
    borderRadius: 4,
  },
  globeIcon: {
    fontSize: 30,
    color: "black",
  },
});

export default Wishlist;
