import { useState } from 'react';
import { StyleSheet, View, Image, Text, TouchableOpacity } from "react-native";
import ScreenWrapper from "../components/ScreenWrapper";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { hp, wp } from "../helpers/common";
import { theme } from "../constants/theme";

const Friends = () => {
  // State to track which tab is active
  const [activeTab, setActiveTab] = useState('chat');

  return (
    <>
      <LinearGradient
        colors={["#FFD6A5", "#FF8FAB"]}
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

        <Text style={styles.title}>Chat!</Text>

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
    paddingHorizontal: wp(4),
    marginTop: hp(4),
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
});
