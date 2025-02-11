import { StyleSheet, View, Image, Text, TouchableOpacity, TextInput } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { hp, wp } from "../helpers/common";
import { theme } from "../constants/theme";
import MapView from 'react-native-maps';
import React, { useEffect, useState, useRef } from "react";
import * as Location from 'expo-location';

const INITIAL_REGION = {
  latitude: 45.755539,
  longitude: 21.225703,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const MapScreen = () => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [region, setRegion] = useState(INITIAL_REGION);
  
  const mapRef = useRef(null); // Create a reference for the MapView

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setErrorMsg("Permission to access location was denied");
          return;
        }

        let currentLocation = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });
        setRegion({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      } catch (error) {
        setErrorMsg("An error occurred while fetching location.");
      }
    })();
  }, []);

  const handleCenterLocation = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }, 1000); 
    }
  };

  if (!location && !errorMsg) {
    return (
      <View style={styles.container}>
        <Text>Loading location...</Text>
      </View>
    );
  }

  return (
    <>
      <LinearGradient colors={["#FFD6A5", "#FF8FAB"]} style={styles.gradientBackground}>
        <View style={styles.container}>
          <MapView
            ref={mapRef} // Assign the reference to the MapView
            region={region}
            style={styles.map}
            showsUserLocation={true}
            showsMyLocationButton={true}
          />
          <TextInput
            style={styles.searchBar}
            placeholder="Search location"
            placeholderTextColor="#888"
          />
          {/* Center Button */}
          <TouchableOpacity
            onPress={handleCenterLocation}
            style={styles.centerButton}
          >
            <Image 
              source={require("../assets/icons/centerbutton.png")} 
              style={styles.centerButtonImage} // Apply custom styling for the image
            />
          </TouchableOpacity>
        </View>
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
      </LinearGradient>
    </>
  );
};

export default MapScreen;

const styles = StyleSheet.create({
  gradientBackground: { flex: 1 },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },
  map: { width: "100%", height: "100%" },
  searchBar: {
    position: "absolute",
    top: hp(8),
    left: wp(5),
    width: "90%",
    height: hp(6),
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 30,
    paddingLeft: wp(4),
    fontSize: hp(2),
  },
  centerButton: {
    position: "absolute",
    bottom: hp(10),
    right: wp(5),
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 30,
    padding: hp(2),
    justifyContent: "center",
    alignItems: "center",
  },
  centerButtonImage: {
    width: 40, // Adjust size as needed
    height: 40, // Adjust size as needed
    resizeMode: "contain", // Ensures the image doesn't stretch
  },
  bottomNavigation: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: hp(7),
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 50,
    position: "absolute",
    bottom: hp(2.5),
    width: "90%",
    alignSelf: "center",
    paddingHorizontal: wp(4),
  },
  navIcon: { width: 28, height: 28, resizeMode: "contain" },
  globeIcon: { fontSize: 30, color: "black" },
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
