import { StyleSheet, Text, View, Image, TouchableOpacity,ImageBackground } from "react-native";
import React from "react";
import ScreenWrapper from "../components/ScreenWrapper";
import { hp, wp } from "../helpers/common";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "../constants/theme";
import { router } from "expo-router";


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
          {/* <Image
            source={require("../assets/icons/menu_icon.png")}
            style={styles.navIcon}
          /> */}
            
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

        {/* Wdgets setion */}
        <View style={styles.widgetsForm}>
          <View style={styles.squareRow}>
              <TouchableOpacity style={styles.square}>
              <Text style={styles.widgetTitle}>Quick Actions</Text>
                {/* Component 1: Create an Event */}
                    <View style={styles.actionItem}>
                      <Image
                        source={require("../assets/icons/Calendar_Plus.png")} // Replace with the actual path for the calendar icon
                        style={styles.actionIcon}
                      />
                      <Text style={styles.actionText}>Create an event</Text>
                    </View>

                    {/* Component 2: Create a Group */}
                    <View style={styles.actionItem}>
                      <Image
                        source={require("../assets/icons/Message_AlertPlus.png")} // Replace with the actual path for the message icon
                        style={styles.actionIcon}
                      />
                      <Text style={styles.actionText}>Create a group</Text>
                    </View>

                    {/* Component 3: Add a Task */}
                    <View style={styles.actionItem}>
                      <Image
                        source={require("../assets/icons/List.png")} // Replace with the actual path for the list icon
                        style={styles.actionIcon}
                      />
                      <Text style={styles.actionText}>Add a task</Text>
                    </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.square}>
                <Text style={styles.widgetTitle}>Tasks</Text>
                  <View style={styles.actionItem}>
                    <Image
                        source={require("../assets/icons/squareT.png")}
                        style={styles.actionIcon}
                    />
                    <Text style={styles.actionText}>Buy cake for  Tudor</Text>
                  </View>
                  <View style={styles.actionItem}>
                    <Image
                        source={require("../assets/icons/squareT.png")}
                        style={styles.actionIcon}
                    />
                    <Text style={styles.actionText}>Reserve a table</Text>
                  </View>
                  <View style={styles.actionItem}>
                    <Image
                        source={require("../assets/icons/squareT.png")}
                        style={styles.actionIcon}
                    />
                    <Text style={styles.actionText}>Add Task</Text>
                  </View>


              </TouchableOpacity>
            </View>
            <View style={styles.squareRow}>
              <TouchableOpacity style={styles.square}>
                <ImageBackground
                  source={require("../assets/images/Timisoara.png")} // Replace with the actual map image path
                  style={styles.mapBackground}
                  imageStyle={{ borderRadius: 35 }} // Ensures the image has rounded corners
                  resizeMode="cover"
                > 
                <Image
                  source={require("../assets/icons/location_dot.png")} // Path to the blue dot image
                  style={styles.locationDot}
                />
                <Text style={styles.nearestLoc}>Nearest Location</Text>
                </ImageBackground>
              </TouchableOpacity>
              <TouchableOpacity style={styles.square}>
              <ImageBackground
                  source={require("../assets/images/memories.png")} // Replace with the actual map image path
                  style={styles.mapBackground}
                  imageStyle={{ borderRadius: 35 }} // Ensures the image has rounded corners
                  resizeMode="cover"
                > 
                <Text style={{ position: "absolute",top: 10,alignSelf: "center",fontSize: 16,fontWeight: theme.fonts.semibold,color: "black",}}>Memories</Text>
              </ImageBackground>
              </TouchableOpacity>
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
          <TouchableOpacity
            onPress={() => router.push("friends")}
          >
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
  menuIcon: {
    position: "absolute",
    top: 10,
    left: 10,
    width: 28,
    height: 28,
    resizeMode: "contain",
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
    height: hp(7), // Bar height
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
  widgetsForm: {
    marginTop: hp(2),
    paddingHorizontal: wp(4),
  },
  squareRow: {
    flexDirection: "row", // Arrange squares in a row
    justifyContent: "space-between", // Space them evenly
    marginBottom: hp(1), // Space between rows
  },
  square: {
    width: wp(45), // 45% of the screen width
    height: wp(45), // Square size, matching width
    backgroundColor: "#E3D9D9", // Background color
    borderRadius: 35, // Rounded corners
    justifyContent: "center", // Centers content inside
    alignItems: "center", // Centers content inside
    overflow: "hidden", // Ensures the content doesn't spill outside
    elevation: 3, // Add shadow for Android
    shadowOpacity: 0.1, // Add shadow for iOS
  },
  
  mapBackground: {
    width: "100%", // Full width of the square
    height: "100%", // Full height of the square
    justifyContent: "center", // Centers text inside the image
    alignItems: "center", // Centers text inside the image
    borderRadius: 35, // Match the square's rounded corners
  },
  
    widgetTitle: {
      alignItems: "center",
      fontSize: 16,
      fontWeight: "bold",
      color: "black",
      marginBottom: 20, // Space below the title
      //margintTop: 10,
    },
    actionItem: {
      flexDirection: "row", // Align icon and text horizontally
      alignItems: "center",
      marginBottom: 10, // Space between items
      paddingLeft: 20,
    },
    actionIcon: {
      width: 24,
      height: 24,
      resizeMode: "contain",
      marginRight: 8, // Space between icon and text
    },
    actionText: {
      fontSize: 14,
      fontWeight: "600",
      color: "black", // White text color
      flex: 1, // Ensures the text takes up remaining space
      textAlign: "left", // Aligns text to the left
    },
    locationDot: {
      position: "absolute", // Allows the dot to float on top of the map
      top: "40%", // Adjust to center vertically on the map
      left: "30%", // Adjust to center horizontally on the map
      transform: [{ translateX: -10 }, { translateY: -10 }], // Centers the dot
      width: 100, // Width of the dot
      height: 100, // Height of the dot
      resizeMode: "contain", // Ensures the image scales properly
    },
    nearestLoc:{
      position: "absolute",
      top: 10, // Distance from the top of the map
      alignSelf: "center", // Center text horizontally
      fontSize: 16,
      fontWeight: "bold",
      color: "black",
    },

  

});
