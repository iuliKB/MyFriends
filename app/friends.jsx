import { useEffect, useState } from 'react';
import { StyleSheet, View, Image, Text, TouchableOpacity, TextInput, Alert } from "react-native";
import ScreenWrapper from "../components/ScreenWrapper";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { hp, wp } from "../helpers/common";
import { firestore, auth } from '../firebaseConfig'; // Import Firestore and Auth
import { doc, getDoc, updateDoc, arrayUnion, query, where, getDocs, collection, documentId } from 'firebase/firestore'; // Firestore functions

const FriendData = ({ username }) => {
  return(
    <View style={styles.friendItem}>
      <Text style={styles.friendName}>{username}</Text>
    </View>
  )
}

const Friends = () => {
  // State to track which tab is active
  const [activeTab, setActiveTab] = useState('friends');
  const [usernameToAdd, setUsernameToAdd] = useState('');
  const [userFriends, setUserFriends] = useState([]); // State to hold current user's friends

  useEffect(() => {
    const fetchFriends = async () => {
      if (!auth.currentUser) {
        console.error("User is not authenticated.");
        return;
      }
      
      const currentUserUID = auth.currentUser.uid;
      console.log("Current User UID: ", currentUserUID);

      try {
        // Get current user's friends list
        const currentUserRef = doc(firestore, "users", currentUserUID);
        const currentUserDoc = await getDoc(currentUserRef);
        const currentUserData = currentUserDoc.data();
        const currentFriends = currentUserData.friends || []; // Get current friends list
        
        // Get Friends docs
        const usersQuery = query(
          collection(firestore, "users"),
          where(documentId(), 'in', [...currentFriends])
        );
        const usersSnapshot = await getDocs(usersQuery);
        const usersDocs = usersSnapshot.docs;
        const usersData = usersDocs.map(userDoc => userDoc.data());
        
        setUserFriends(usersData); // Update state with friends data
        console.log("Current Friends: ", usersData);
      } catch (error) {
        console.error("Error fetching friends: ", error);
      }
    };

    fetchFriends(); // Call the async function
  }, []);

  // Function to add friend by username
  const addFriend = async () => {
    try {
      // Get current user's UID
      const currentUserUID = auth.currentUser.uid;

      // Find user by username
      const usersQuery = query(
        collection(firestore, "users"), 
        where("username", "==", usernameToAdd)
      );
      const usersSnapshot = await getDocs(usersQuery);
      
      if (usersSnapshot.empty) {
        // If no user found by that username
        Alert.alert("User not found", "No user found with that username.");
        return;
      }

      // Get the friend details
      const friendDoc = usersSnapshot.docs[0]; // Assuming unique username
      const friendUID = friendDoc.id;

      // Get current user's friends list
      const currentUserRef = doc(firestore, "users", currentUserUID);
      const currentUserDoc = await getDoc(currentUserRef);
      const currentUserData = currentUserDoc.data();
      const currentFriends = currentUserData.friends || []; // Get current friends list

      // Check if they are already friends
      if (currentFriends.includes(friendUID)) {
        Alert.alert("Already Friends", "You are already friends with this user.");
        return;
      }

      // Add the friend to the current user's friends list
      await updateDoc(currentUserRef, {
        friends: arrayUnion(friendUID) // Add friend UID to current user's friends array
      });

      // Add the current user to the friend's friends list (mutual friendship)
      const friendUserRef = doc(firestore, "users", friendUID);
      await updateDoc(friendUserRef, {
        friends: arrayUnion(currentUserUID) // Add current user's UID to the friend's friends array
      });

      // Optionally, update the UI by adding the friend to the state
      setUserFriends(prevFriends => [...prevFriends, friendDoc]);

      Alert.alert("Success", "You have added a new friend!");
    } catch (error) {
      console.error("Error adding friend: ", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };


  return (
    <>
      <LinearGradient
        colors={["#fbae52", "#dd528d", "#ff8c79"]}
        style={styles.gradientBackground}
      >
        <ScreenWrapper>
        {/* Header */}
        <View style={styles.header}>
            <Image 
                source={require("../assets/images/profile_photo.jpg")}
                style={styles.profileImage}
            />
            <View style={styles.textContainer}>
            <Text style={styles.nameProfile}> Iulian</Text>
            <Text style={styles.friendLocation}> 🏠At Home</Text>
            </View>
        </View>

        {/* Chat/Friends Tabs */}
        <View style={styles.ChorFrtab}>

          <TouchableOpacity 
            style={[
              styles.form, 
              styles.shadow, 
              activeTab === 'chat' && styles.activeTab  // Active Tab Style
            ]}
            onPress={() => {
              setActiveTab('chat'); // Set active tab to 'chat'
              router.push("chat");
            }}
          >
            <View style={styles.tab}>
              <Text style={styles.tabText}>Chat</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.form, 
              styles.shadow, 
              activeTab === 'friends' && styles.activeTab  // Active Tab Style
            ]}
            onPress={() => {
              setActiveTab('friends'); // Set active tab to 'friends'
              router.push("friends");
            }}
          >
            <View style={styles.tab}>
              <Text style={styles.tabText}>Friends</Text>
            </View>
          </TouchableOpacity>
        </View>

        

        <Text style={styles.title}>Friends!</Text>
        {/* Friend Adding Section */}
        <TextInput
            style={styles.input}
            placeholder="Enter friend's username"
            value={usernameToAdd}
            onChangeText={setUsernameToAdd}
            placeholderTextColor="#999"
        />
          <TouchableOpacity onPress={addFriend} style={styles.addFriendButton}>
            <Text style={styles.addFriendButtonText}>Add Friend</Text>
          </TouchableOpacity>

        {/* Friends List */}
        <View style={styles.friendsList}>
            <Text style={styles.title}>Friends List:</Text>
            {userFriends?.length > 0 ? (
                userFriends.map((friend, index) => (
                    <FriendData key={index} username={friend.username} />
                ))
            ) : (
                <Text style={styles.noFriendsText}>No friends added yet.</Text>
            )}
        </View>

        {/* Bottom Navigation */}
        <View style={styles.bottomNavigation}>
          <TouchableOpacity onPress={() => router.push("homepage")}>
            <Image source={require("../assets/icons/home_icon.png")} style={styles.navIcon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("friends")}>
            <View>
              <Image source={require("../assets/icons/friends_icon.png")} style={styles.navIcon} />
              <View style={styles.notificationBadge} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("map")}>
            <Image source={require("../assets/icons/globe_icon.png")} style={styles.globeIcon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("calendar")}>
            <Image source={require("../assets/icons/calendar_icon.png")} style={styles.navIcon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("myaccount")}>
            <Image source={require("../assets/icons/profile_icon.png")} style={styles.navIcon} />
          </TouchableOpacity>
        </View>

        </ScreenWrapper>
      </LinearGradient>
    </>
  );
};

export default Friends;

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: wp(4),
  },
  textContainer: {
    marginLeft: wp(2),
    alignItems: "flex-start",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    },
  profileImage: {
    width: 56,
    height: 56,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#FFD700",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 10,
  },
  nameProfile: {
    fontSize: 20,
    fontWeight: "bold",
  },
  friendLocation: {
    fontSize: 15,
    fontWeight: "bold",
  },
  ChorFrtab: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginTop: 20,
    alignSelf: 'center',
  },
  form: {
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderRadius: 30,
    padding: 10,
    width: '45%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tab: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  activeTab: {
    backgroundColor: '#FF6F61', // Change this to your desired color
  },
  title: {
    color: "#000",
    fontSize: hp(3.5),
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: hp(2),
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
    paddingHorizontal: wp(4),
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
  globeIcon: {
    fontSize: 30,
    color: "black",
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
  input: {
    backgroundColor: "#FFF",
    padding: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FF6F61",
    marginBottom: 15,
    fontSize: 16,
    width: "90%",
    alignSelf: "center",
  },
  addFriendButton: {
    backgroundColor: "#FF6F61",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignSelf: "center",
    width: "50%",
    alignItems: "center",
    marginBottom: 20,
  },
  addFriendButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  friendsList: {
    marginVertical: 20,
    paddingHorizontal: wp(4),
  },
  friendItem: {
    backgroundColor: "#FFF",
    padding: 15,
    marginVertical: 5,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  friendName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  noFriendsText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginTop: 20,
  },
});