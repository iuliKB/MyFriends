import { StyleSheet, Text, View, Image, TouchableOpacity, ImageBackground, ActivityIndicator, Alert, ScrollView, Animated, Dimensions } from "react-native";
import React, { useEffect, useState, useRef } from "react";
import ScreenWrapper from "../components/ScreenWrapper";
import { hp, wp } from "../helpers/common";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "../constants/theme";
import { router } from "expo-router";
import { useAuth } from "../AuthContext";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { firestore } from "../firebaseConfig";

const HomePage = () => {
  const { user, userProfile, loading, updateUserProfile } = useAuth();
  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [favoriteMemories, setFavoriteMemories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollX = useRef(new Animated.Value(0)).current;
  const memoryScrollRef = useRef(null);
  
  // Auto-scroll animation
  useEffect(() => {
    let scrollInterval;
    
    if (favoriteMemories.length > 1) {
      let currentIndex = 0;
      scrollInterval = setInterval(() => {
        currentIndex = (currentIndex + 1) % favoriteMemories.length;
        memoryScrollRef.current?.scrollTo({
          x: currentIndex * wp(45),
          animated: true
        });
      }, 3000); // Change image every 3 seconds
    }
    
    return () => {
      if (scrollInterval) {
        clearInterval(scrollInterval);
      }
    };
  }, [favoriteMemories]);

  // Fetch user's events, tasks, and favorite memories
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Fetch user's data including memories
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setEvents(userData.events || []);
          setTasks(userData.tasks || []);
          
          // Filter memories to get only favorites
          const memories = userData.memories || [];
          const favorites = memories.filter(memory => 
            memory && memory.isFavorite && (memory.images?.[0] || memory.image)
          );
          setFavoriteMemories(favorites);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        Alert.alert("Error", "Failed to load memories");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [user]);

  // Add a new event
  const addEvent = async (eventTitle) => {
    if (!user) return;
    
    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      
      // Create a new event object
      const newEvent = {
        id: Date.now().toString(),
        title: eventTitle,
        createdAt: new Date(),
        completed: false
      };
      
      // Add the event to the user's events array
      await updateDoc(userDocRef, {
        events: arrayUnion(newEvent)
      });
      
      // Update local state
      setEvents([...events, newEvent]);
      
      Alert.alert("Success", "Event added successfully!");
    } catch (error) {
      console.error("Error adding event:", error);
      Alert.alert("Error", "Failed to add event. Please try again.");
    }
  };

  // Add a new task
  const addTask = async (taskTitle) => {
    if (!user) return;
    
    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      
      // Create a new task object
      const newTask = {
        id: Date.now().toString(),
        title: taskTitle,
        createdAt: new Date(),
        completed: false
      };
      
      // Add the task to the user's tasks array
      await updateDoc(userDocRef, {
        tasks: arrayUnion(newTask)
      });
      
      // Update local state
      setTasks([...tasks, newTask]);
      
      Alert.alert("Success", "Task added successfully!");
    } catch (error) {
      console.error("Error adding task:", error);
      Alert.alert("Error", "Failed to add task. Please try again.");
    }
  };

  // Show loading indicator while data is being fetched
  if (loading || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#dd528d" />
      </View>
    );
  }

  // Get user's display name (username or email)
  const displayName = userProfile?.username || user?.email?.split('@')[0] || 'User';
  
  // Get user's profile picture or use default
  const profilePicture = userProfile?.profile_picture 
    ? { uri: userProfile.profile_picture } 
    : require("../assets/images/profile_photo.jpg");

  return (
    <LinearGradient
      colors={["#fbae52", "#dd528d", "#ff8c79"]}
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
              Hi, {displayName} <Text style={styles.emoji}>👋</Text>
            </Text>
            <Text style={styles.welcomeText}>Welcome back</Text>
          </View>
          <Image
            source={profilePicture}
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
          
          {events.length > 0 ? (
            events.map((event, index) => (
              <View key={index} style={styles.eventItem}>
                <Image
                  source={require("../assets/icons/cake_icon.png")}
                  style={styles.icon}
                />
                <Text style={styles.eventText}>{event.title}</Text>
              </View>
            ))
          ) : (
            <>
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
                  style={styles.icon}
                />
                <Text style={styles.eventText}>Tudor's Birthday</Text>
              </View>
            </>
          )}
          </View>
        </View>

        {/* Widgets section */}
        <View style={styles.widgetsForm}>
          <View style={styles.squareRow}>
              <TouchableOpacity style={styles.square}>
              <Text style={styles.widgetTitle}>Quick Actions</Text>
                {/* Component 1: Create an Event */}
                    <TouchableOpacity 
                      style={styles.actionItem}
                      onPress={() => {
                        Alert.prompt(
                          "Create Event",
                          "Enter event title:",
                          [
                            { text: "Cancel", style: "cancel" },
                            { 
                              text: "Create", 
                              onPress: (title) => {
                                if (title && title.trim()) {
                                  addEvent(title.trim());
                                }
                              }
                            }
                          ],
                          "plain-text"
                        );
                      }}
                    >
                      <Image
                        source={require("../assets/icons/Calendar_Plus.png")}
                        style={styles.actionIcon}
                      />
                      <Text style={styles.actionText}>Create an event</Text>
                    </TouchableOpacity>

                    {/* Component 2: Create a Group */}
                    <View style={styles.actionItem}>
                      <Image
                        source={require("../assets/icons/Message_AlertPlus.png")}
                        style={styles.actionIcon}
                      />
                      <Text style={styles.actionText}>Create a group</Text>
                    </View>

                    {/* Component 3: Add a Task */}
                    <TouchableOpacity 
                      style={styles.actionItem}
                      onPress={() => {
                        Alert.prompt(
                          "Add Task",
                          "Enter task title:",
                          [
                            { text: "Cancel", style: "cancel" },
                            { 
                              text: "Add", 
                              onPress: (title) => {
                                if (title && title.trim()) {
                                  addTask(title.trim());
                                }
                              }
                            }
                          ],
                          "plain-text"
                        );
                      }}
                    >
                      <Image
                        source={require("../assets/icons/List.png")}
                        style={styles.actionIcon}
                      />
                      <Text style={styles.actionText}>Add a task</Text>
                    </TouchableOpacity>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.square}
                onPress={() => router.push("tasks")}
              >
                <Text style={styles.widgetTitle}>Tasks</Text>
                
                {tasks.length > 0 ? (
                  tasks.map((task, index) => (
                    <View key={index} style={styles.actionItem}>
                      <Image
                        source={require("../assets/icons/squareT.png")}
                        style={styles.actionIcon}
                      />
                      <Text style={styles.actionText}>{task.title}</Text>
                    </View>
                  ))
                ) : (
                  <>
                    <View style={styles.actionItem}>
                      <Image
                        source={require("../assets/icons/squareT.png")}
                        style={styles.actionIcon}
                      />
                      <Text style={styles.actionText}>Buy cake for Tudor</Text>
                    </View>
                    <View style={styles.actionItem}>
                      <Image
                        source={require("../assets/icons/squareT.png")}
                        style={styles.actionIcon}
                      />
                      <Text style={styles.actionText}>Reserve a table</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.actionItem}
                      onPress={() => {
                        Alert.prompt(
                          "Add Task",
                          "Enter task title:",
                          [
                            { text: "Cancel", style: "cancel" },
                            { 
                              text: "Add", 
                              onPress: (title) => {
                                if (title && title.trim()) {
                                  addTask(title.trim());
                                }
                              }
                            }
                          ],
                          "plain-text"
                        );
                      }}
                    >
                      <Image
                        source={require("../assets/icons/squareT.png")}
                        style={styles.actionIcon}
                      />
                      <Text style={styles.actionText}>Add Task</Text>
                    </TouchableOpacity>
                  </>
                )}
              </TouchableOpacity>
            </View>
            <View style={styles.squareRow}>
              <TouchableOpacity
              onPress={()=>router.push("map")} 
              style={styles.square}>
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
              <TouchableOpacity 
                onPress={() => router.push("memories")}
                style={styles.square}
              >
                {favoriteMemories.length > 0 ? (
                  <View style={styles.memoriesContainer}>
                    <Animated.ScrollView 
                      ref={memoryScrollRef}
                      horizontal 
                      pagingEnabled
                      showsHorizontalScrollIndicator={false}
                      scrollEventThrottle={16}
                      onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                        { useNativeDriver: true }
                      )}
                      style={styles.memoriesScroll}
                    >
                      {favoriteMemories.map((memory, index) => {
                        const imageUrl = memory.images?.[0] || memory.image;
                        if (!imageUrl) return null;

                        const inputRange = [
                          (index - 1) * wp(45),
                          index * wp(45),
                          (index + 1) * wp(45),
                        ];
                        
                        const scale = scrollX.interpolate({
                          inputRange,
                          outputRange: [0.9, 1, 0.9],
                          extrapolate: 'clamp',
                        });

                        const opacity = scrollX.interpolate({
                          inputRange,
                          outputRange: [0.6, 1, 0.6],
                          extrapolate: 'clamp',
                        });

                        return (
                          <Animated.View
                            key={index}
                            style={[
                              styles.memoryPreviewContainer,
                              {
                                transform: [{ scale }],
                                opacity,
                              },
                            ]}
                          >
                            <Image
                              source={{ uri: imageUrl }}
                              style={styles.memoryPreview}
                            />
                            <LinearGradient
                              colors={['transparent', 'rgba(0,0,0,0.7)']}
                              style={styles.memoryGradient}
                            >
                              <Text style={styles.memoryTitle} numberOfLines={1}>
                                {memory.title || 'Memory'}
                              </Text>
                            </LinearGradient>
                          </Animated.View>
                        );
                      })}
                    </Animated.ScrollView>
                    <View style={styles.paginationDots}>
                      {favoriteMemories.map((_, index) => {
                        const inputRange = [
                          (index - 1) * wp(45),
                          index * wp(45),
                          (index + 1) * wp(45),
                        ];
                        
                        const scale = scrollX.interpolate({
                          inputRange,
                          outputRange: [0.8, 1.2, 0.8],
                          extrapolate: 'clamp',
                        });
                        
                        const opacity = scrollX.interpolate({
                          inputRange,
                          outputRange: [0.4, 1, 0.4],
                          extrapolate: 'clamp',
                        });
                        
                        return (
                          <Animated.View
                            key={index}
                            style={[
                              styles.paginationDot,
                              { 
                                opacity,
                                transform: [{ scale }]
                              }
                            ]}
                          />
                        );
                      })}
                    </View>
                  </View>
                ) : (
                  <View style={styles.emptyMemoriesContainer}>
                    <Text style={styles.nearestLoc}>Memories</Text>
                    <Text style={styles.emptyMemoriesText}>Add some memories to favorites!</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
        </View>

        {/* Bottom Navigation */}
        <View style={styles.bottomNavigation}>
          <TouchableOpacity onPress={() => router.push("homepage")}>
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

export default HomePage;

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fbae52',
  },
  memoriesContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 35,
    overflow: 'hidden',
  },
  memoriesScroll: {
    flex: 1,
  },
  memoryPreviewContainer: {
    width: wp(45),
    height: wp(45),
    overflow: 'hidden',
  },
  memoryPreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  memoryGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
    justifyContent: 'flex-end',
    paddingBottom: 10,
    paddingHorizontal: 10,
  },
  memoryTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
  },
  paginationDot: {
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginHorizontal: 4,
  },
  emptyMemoriesContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 35,
  },
  emptyMemoriesText: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
});
