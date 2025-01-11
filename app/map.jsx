import { StyleSheet, View, Image, Text, TouchableOpacity,TextInput} from "react-native";
import ScreenWrapper from "../components/ScreenWrapper";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { hp, wp } from "../helpers/common";
import { theme } from "../constants/theme";
import MapView from 'react-native-maps';
import { PROVIDER_GOOGLE } from "react-native-maps";
// import {BottomNavigation} from "../components/BottomNavigation";

const INITIAL_REGION = {

    latitude: 45.755539, // Adjust to a specific latitude within Timișoara
    longitude: 21.225703, // Adjust to a specific longitude within Timișoara
    latitudeDelta: 0.05, // Zoom level for latitude
    longitudeDelta: 0.05, // Zoom level for longitude
   
};

const map = () => {
  return (
    <>
      <LinearGradient
        colors={["#FFD6A5", "#FF8FAB"]}
        style={styles.gradientBackground}
      >
        {/* <ScreenWrapper> */}
            <View style={styles.container}>

          {/* Search Bar */}

          <MapView
            initialRegion={INITIAL_REGION}
            //provider={PROVIDER_GOOGLE}

            style={styles.map}
          />

            <TextInput
                style={styles.searchBar}
                placeholder="Search location"
                placeholderTextColor="#888"
            // onChangeText={handleSearch}  // Handle the search functionality
            />          

          
            </View>
            {/* Bottom Navigation */}
            <View style={styles.bottomNavigation}>
            <TouchableOpacity
                onPress={() => router.push("homepage")}>
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
        {/* </ScreenWrapper> */}
      </LinearGradient>
    </>
  );
};

export default map;

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width:"100%",
    height:"100%"
    //paddingHorizontal: wp(4),
  },
  startImage: {
    height: hp(40), // Adjusted to move higher
    width: wp(80),
    marginBottom: hp(2),
  },
  title: {
    color: "#000",
    fontSize: hp(3.5),
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: hp(2), // Moved closer to buttons
  },
  appButtonContainer: {
    elevation: 8,
    backgroundColor: "#7A5AE4",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: wp(70),
    marginBottom: hp(2), // Adjust spacing between buttons
  },
  appButtonText: {
    fontSize: 18,
    color: theme.colors.dark,
    fontWeight: "600",
    textAlign: "center",
  },
  continueline: {
    textAlign: "center",
    fontSize: hp(2),
    color: theme.colors.dark,
    marginBottom: hp(2),
  },
  socialIcons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: hp(4),
  },
  icon: {
    width: wp(7),
    height: wp(7),
    marginHorizontal: wp(2),
  },
  puchline: {
    textAlign: "center",
    paddingHorizontal: wp(10),
    fontSize: hp(2),
    color: theme.colors.text,
    marginBottom: hp(4), // Consistent spacing for text and button
    fontWeight: theme.fonts.semibold,
  },
  bottomNavigation: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: hp(7), // Bar height
    backgroundColor: "rgba(255, 255, 255, 0.7)", // Background color
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
map: {
    width: '100%',
    height: '100%',
  },
  form: {
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderRadius: 30,
    padding: 10,
    width: '45%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    position: "absolute", // Make it overlay the map
    top: hp(8), // Position from the top of the screen
    left: wp(5), // Position from the left
    width: "90%", // Full width with padding
    height: hp(6),
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 30,
    paddingLeft: wp(4),
    fontSize: hp(2),
    elevation: 5, // Add shadow for Android
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});

// import React from 'react';
// import { MapView } from 'react-native-maps';
// import { StyleSheet, View } from 'react-native';

// const INITIAL_REGION = {

//     latitude: 45.755539, // Adjust to a specific latitude within Timișoara
//     longitude: 21.225703, // Adjust to a specific longitude within Timișoara
//     latitudeDelta: 0.05, // Zoom level for latitude
//     longitudeDelta: 0.05, // Zoom level for longitude
   
// };

// const map = () => {
//   return (
//     <>
//     <View style={styles.container}>
      
//       <MapView 
//         style={StyleSheet.absoluteFill}
//         initialRegion={INITIAL_REGION}
//         showsUserLocation
//         showsMyLocationButton
//       />
//     </View>
//     </>
//   );
// }

// export default map;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   map: {
//     width: '100%',
//     height: '100%',
//   },
// });