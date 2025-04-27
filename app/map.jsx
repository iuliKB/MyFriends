import { StyleSheet, View, Image, Text, TouchableOpacity, TextInput, ActivityIndicator, Animated, ScrollView, Linking } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { hp, wp } from "../helpers/common";
import { theme } from "../constants/theme";
import MapView, { Marker, Callout } from 'react-native-maps';
import React, { useEffect, useState, useRef } from "react";
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from "../AuthContext";
import { doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import { firestore } from "../firebaseConfig";

const GOOGLE_MAPS_API_KEY = 'YOUR_API_KEY_HERE'; // Replace with your actual API key

const INITIAL_REGION = {
  latitude: 45.755539,
  longitude: 21.225703,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const PLACE_CATEGORIES = [
  { id: 'cafe', label: 'Cafes', icon: 'cafe' },
  { id: 'restaurant', label: 'Restaurants', icon: 'restaurant' },
  { id: 'shopping', label: 'Shops', icon: 'cart' },
  { id: 'bar', label: 'Bars', icon: 'wine' },
  { id: 'grocery', label: 'Grocery', icon: 'basket' },
  { id: 'park', label: 'Parks', icon: 'leaf' },
  { id: 'museum', label: 'Museums', icon: 'business' },
  { id: 'hotel', label: 'Hotels', icon: 'bed' },
];

const MapScreen = () => {
  const { user } = useAuth();
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [region, setRegion] = useState(INITIAL_REGION);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [savedPlaces, setSavedPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const mapRef = useRef(null);
  const searchBarAnimation = useRef(new Animated.Value(0)).current;
  const [placeResults, setPlaceResults] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);
  
  // Fetch saved places
  useEffect(() => {
    const fetchSavedPlaces = async () => {
      if (!user) return;
      
      try {
        const userRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setSavedPlaces(userData.savedPlaces || []);
        }
      } catch (error) {
        console.error('Error fetching saved places:', error);
      }
    };
    
    fetchSavedPlaces();
  }, [user]);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setErrorMsg("Permission to access location was denied");
          return;
        }

        let currentLocation = await Location.getCurrentPositionAsync({});
        const newLocation = {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        };
        setLocation(newLocation);
        setRegion({
          ...newLocation,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      } catch (error) {
        setErrorMsg("An error occurred while fetching location.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleSearch = async (text) => {
    setSearchQuery(text);
    if (text.length > 2) {
      try {
        const result = await Location.geocodeAsync(text);
        setSearchResults(result);
      } catch (error) {
        console.error('Geocoding error:', error);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectPlace = async (place) => {
    const { latitude, longitude } = place;
    setRegion({
      latitude,
      longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    });
    setSelectedPlace(place);
    setSearchResults([]);
    setSearchQuery("");
    
    mapRef.current?.animateToRegion({
      latitude,
      longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    }, 1000);
  };

  const handleSavePlace = async () => {
    if (!selectedPlace || !user) return;
    
    try {
      const userRef = doc(firestore, 'users', user.uid);
      const newPlace = {
        id: Date.now().toString(),
        latitude: selectedPlace.latitude,
        longitude: selectedPlace.longitude,
        title: searchQuery || 'Saved Location',
        createdAt: new Date().toISOString()
      };
      
      await updateDoc(userRef, {
        savedPlaces: arrayUnion(newPlace)
      });
      
      setSavedPlaces([...savedPlaces, newPlace]);
      setSelectedPlace(null);
    } catch (error) {
      console.error('Error saving place:', error);
    }
  };

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

  const searchNearbyPlaces = async (category) => {
    if (!location) return;
    
    setIsSearchingPlaces(true);
    setSelectedCategory(category);
    
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?` +
        `location=${location.latitude},${location.longitude}` +
        `&radius=5000` +
        `&type=${category}` +
        `&key=${GOOGLE_MAPS_API_KEY}`
      );
      
      const data = await response.json();
      
      if (data.results) {
        const places = data.results.map(place => ({
          id: place.place_id,
          title: place.name,
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng,
          rating: place.rating,
          vicinity: place.vicinity,
          isOpen: place.opening_hours?.open_now,
          photos: place.photos ? place.photos.map(photo => 
            `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${GOOGLE_MAPS_API_KEY}`
          ) : [],
        }));
        
        setPlaceResults(places);
        
        if (places.length > 0) {
          const bounds = places.reduce(
            (acc, place) => ({
              minLat: Math.min(acc.minLat, place.latitude),
              maxLat: Math.max(acc.maxLat, place.latitude),
              minLng: Math.min(acc.minLng, place.longitude),
              maxLng: Math.max(acc.maxLng, place.longitude),
            }),
            {
              minLat: places[0].latitude,
              maxLat: places[0].latitude,
              minLng: places[0].longitude,
              maxLng: places[0].longitude,
            }
          );

          const newRegion = {
            latitude: (bounds.minLat + bounds.maxLat) / 2,
            longitude: (bounds.minLng + bounds.maxLng) / 2,
            latitudeDelta: Math.max((bounds.maxLat - bounds.minLat) * 1.5, 0.02),
            longitudeDelta: Math.max((bounds.maxLng - bounds.minLng) * 1.5, 0.02),
          };

          mapRef.current?.animateToRegion(newRegion, 1000);
        }
      }
    } catch (error) {
      console.error('Error searching places:', error);
    } finally {
      setIsSearchingPlaces(false);
    }
  };

  const clearPlaceResults = () => {
    setPlaceResults([]);
    setSelectedCategory(null);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#dd528d" />
      </View>
    );
  }

  return (
    <LinearGradient colors={["#FFD6A5", "#FF8FAB"]} style={styles.gradientBackground}>
      <View style={styles.container}>
        <MapView
          ref={mapRef}
          region={region}
          style={styles.map}
          showsUserLocation={true}
          showsMyLocationButton={false}
          onRegionChangeComplete={setRegion}
        >
          {savedPlaces.map((place) => (
            <Marker
              key={place.id}
              coordinate={{
                latitude: place.latitude,
                longitude: place.longitude
              }}
              pinColor="#dd528d"
            >
              <Callout>
                <Text>{place.title}</Text>
                <Text style={styles.calloutText}>
                  {new Date(place.createdAt).toLocaleDateString()}
                </Text>
              </Callout>
            </Marker>
          ))}

          {placeResults.map((place) => (
            <Marker
              key={place.id}
              coordinate={{
                latitude: place.latitude,
                longitude: place.longitude
              }}
              pinColor="#4CAF50"
            >
              <Callout>
                <View style={styles.placeCallout}>
                  <Text style={styles.placeTitle}>{place.title}</Text>
                  <Text style={styles.placeAddress}>{place.vicinity}</Text>
                  {place.rating && (
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={14} color="#FFD700" />
                      <Text style={styles.ratingText}>{place.rating}</Text>
                    </View>
                  )}
                  <Text style={[
                    styles.openStatus,
                    { color: place.isOpen ? '#4CAF50' : '#F44336' }
                  ]}>
                    {place.isOpen ? 'Open' : 'Closed'}
                  </Text>
                  {place.photos && place.photos.length > 0 && (
                    <Image 
                      source={{ uri: place.photos[0] }} 
                      style={styles.placePhoto}
                    />
                  )}
                  <TouchableOpacity 
                    style={styles.directionsButton}
                    onPress={() => {
                      const url = `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`;
                      Linking.openURL(url);
                    }}
                  >
                    <Ionicons name="navigate" size={16} color="#fff" />
                    <Text style={styles.directionsButtonText}>Get Directions</Text>
                  </TouchableOpacity>
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>
        
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {PLACE_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.categoryButtonActive
              ]}
              onPress={() => {
                if (selectedCategory === category.id) {
                  clearPlaceResults();
                } else {
                  searchNearbyPlaces(category.id);
                }
              }}
            >
              <Ionicons 
                name={category.icon} 
                size={20} 
                color={selectedCategory === category.id ? '#fff' : '#666'} 
              />
              <Text style={[
                styles.categoryText,
                selectedCategory === category.id && styles.categoryTextActive
              ]}>
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search location"
              placeholderTextColor="#888"
              value={searchQuery}
              onChangeText={handleSearch}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity 
                onPress={() => {
                  setSearchQuery("");
                  setSearchResults([]);
                }}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>
          
          {searchResults.length > 0 && (
            <View style={styles.searchResults}>
              {searchResults.map((result, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.searchResultItem}
                  onPress={() => handleSelectPlace(result)}
                >
                  <Ionicons name="location" size={20} color="#dd528d" />
                  <Text style={styles.searchResultText}>{searchQuery}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            onPress={handleCenterLocation}
            style={styles.actionButton}
          >
            <Ionicons name="locate" size={24} color="#fff" />
          </TouchableOpacity>
          
          {selectedPlace && (
            <TouchableOpacity
              onPress={handleSavePlace}
              style={[styles.actionButton, styles.saveButton]}
            >
              <Ionicons name="bookmark" size={24} color="#fff" />
            </TouchableOpacity>
          )}
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

        {isSearchingPlaces && (
          <View style={styles.searchingOverlay}>
            <ActivityIndicator size="large" color="#dd528d" />
          </View>
        )}
      </View>
    </LinearGradient>
  );
};

export default MapScreen;

const styles = StyleSheet.create({
  gradientBackground: { 
    flex: 1 
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },
  map: { 
    width: "100%", 
    height: "100%" 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFD6A5',
  },
  searchContainer: {
    position: 'absolute',
    top: hp(8),
    width: '90%',
    zIndex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 30,
    paddingHorizontal: wp(4),
    height: hp(6),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchIcon: {
    marginRight: wp(2),
  },
  searchInput: {
    flex: 1,
    fontSize: hp(2),
    color: '#333',
  },
  clearButton: {
    padding: 5,
  },
  searchResults: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 15,
    marginTop: hp(1),
    maxHeight: hp(30),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: hp(2),
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchResultText: {
    marginLeft: wp(2),
    fontSize: hp(2),
    color: '#333',
  },
  actionButtons: {
    position: 'absolute',
    right: wp(5),
    bottom: hp(15),
    alignItems: 'center',
  },
  actionButton: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 30,
    width: hp(6),
    height: hp(6),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: hp(2),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  saveButton: {
    backgroundColor: "#dd528d",
  },
  calloutText: {
    fontSize: 12,
    color: '#666',
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
  navIcon: { 
    width: 28, 
    height: 28, 
    resizeMode: "contain" 
  },
  globeIcon: { 
    width: 28, 
    height: 28, 
    resizeMode: "contain"
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
  categoriesContainer: {
    position: 'absolute',
    top: hp(16),
    width: '100%',
    zIndex: 1,
  },
  categoriesContent: {
    paddingHorizontal: wp(4),
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
    marginRight: wp(2),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  categoryButtonActive: {
    backgroundColor: '#dd528d',
  },
  categoryText: {
    marginLeft: wp(1),
    fontSize: hp(1.8),
    color: '#666',
  },
  categoryTextActive: {
    color: '#fff',
  },
  placeCallout: {
    minWidth: wp(40),
    padding: wp(2),
  },
  placeTitle: {
    fontSize: hp(1.8),
    fontWeight: 'bold',
    marginBottom: hp(0.5),
  },
  placeAddress: {
    fontSize: hp(1.6),
    color: '#666',
    marginBottom: hp(0.5),
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(0.5),
  },
  ratingText: {
    marginLeft: wp(1),
    fontSize: hp(1.6),
    color: '#666',
  },
  openStatus: {
    fontSize: hp(1.6),
    fontWeight: '500',
  },
  searchingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placePhoto: {
    width: '100%',
    height: hp(15),
    borderRadius: 8,
    marginVertical: hp(1),
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    padding: hp(1),
    borderRadius: 8,
    marginTop: hp(1),
  },
  directionsButtonText: {
    color: '#fff',
    marginLeft: wp(2),
    fontSize: hp(1.6),
  },
});
