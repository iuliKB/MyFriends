import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import React from "react";
import ScreenWrapper from "../components/ScreenWrapper";
import { hp, wp } from "../helpers/common";
import { LinearGradient } from "expo-linear-gradient";

const Welcome = () => {
  return (
    <LinearGradient
      colors={["#FFBE98", "#FF8FAB"]}
      style={styles.gradientBackground}
    >
      <ScreenWrapper>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.greetingContainer}>
          <Image
            source={require("../assets/icons/menu_icon.png")}
            style={styles.navIcon}
          />
            
            <Text style={styles.greetingText}>
              Hi, Iulian <Text style={styles.emoji}>👋</Text>
            </Text>
            <Text style={styles.welcomeText}>Welcome back</Text>
          </View>
          <Image
            source={require("../assets/images/profile_photo.jpg")}
            style={styles.profileImage}
          />
        </View>

        {/* Upcoming Events Section */}
        <View style={styles.eventsContainer}>
          <View style={styles.form}>
          <Text style={styles.sectionTitle}>
            <Image
              source={require("../assets/icons/calendar_icon.png")}
              style={styles.icon}
            />{" "}
            Upcoming Events
          </Text>
          <View style={styles.eventItem}>
            <Image
              source={require("../assets/icons/cake_icon.png")}
              style={styles.icon}
            />
            <Text style={styles.eventText}>Vlad's Birthday</Text>
          </View>
          <View style={styles.eventItem}>
            <Image
              source={require("../assets/icons/meet_icon.png")}
              style={styles.icon}
            />
            <Text style={styles.eventText}>Coffee with Gabriela</Text>
          </View>
          <View style={styles.eventItem}>
            <Image
              source={require("../assets/icons/cake_icon.png")}
              //style={styles.icon}
            />
            <Text style={styles.eventText}>Tudor's Birthday</Text>
          </View>
          </View>
        </View>

        {/* Bottom Navigation */}
        <View style={styles.bottomNavigation}>
          <TouchableOpacity>
            <Image
              source={require("../assets/icons/home_icon.png")}
              style={styles.navIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity>
            <View>
              <Image
                source={require("../assets/icons/friends_icon.png")}
                style={styles.navIcon}
              />
              <View style={styles.notificationBadge} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity>
            <Image
              source={require("../assets/icons/globe_icon.png")}
              style={styles.globeIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity>
            <Image
              source={require("../assets/icons/calendar_icon.png")}
              style={styles.navIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity>
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

export default Welcome;

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: wp(4),
    marginTop: hp(4),
  },
  greetingContainer: {
    flex: 1,
  },
  greetingText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  emoji: {
    fontSize: 24,
  },
  welcomeText: {
    fontSize: 16,
    color: "gray",
    marginTop: 4,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  eventsContainer: {
    marginTop: hp(2),
    paddingHorizontal: wp(4),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: hp(1),
  },
  eventItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FBE3DC",
    borderRadius: 12,
    padding: 10,
    marginBottom: hp(1),
  },
  eventText: {
    marginLeft: wp(2),
    fontSize: 16,
  },
  icon: {
    width: 20,
    height: 20,
    resizeMode: "contain",
  },
  bottomNavigation: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: hp(8), // Bar height
    backgroundColor: "rgba(255, 255, 255, 0.4)", // Background color
    borderRadius: 50, // Rounded corners
    position: "absolute",
    bottom: hp(2.5), // Space from the bottom of the screen
    width: "90%", // Make the width smaller to leave space on the sides
    alignSelf: "center", // Ensures the bar is centered horizontally
    paddingHorizontal: wp(4), // Padding for internal content
    shadowColor: "#000", // Shadow color
    shadowOffset: { width: 0, height: 2 }, // Shadow offset
    shadowOpacity: 0.1, // Shadow opacity
    shadowRadius: 6, // Shadow spread
    elevation: 5, // Android shadow
},
  navIcon: {
    width: 28,
    height: 28,
    resizeMode: "contain",
  },
  globeIcon: {
    fontSize: 30, // Larger size for the globe icon
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
  form: {
    width: "90%",
    backgroundColor: "rgba(255, 255, 255, 0.4)", // More transparency for the form
    borderRadius:30,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});
