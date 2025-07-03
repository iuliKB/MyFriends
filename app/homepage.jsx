import { StyleSheet, Text, View, Image, TouchableOpacity, ImageBackground, ActivityIndicator, Alert, ScrollView, Animated } from "react-native";
import React, { useEffect, useState, useRef } from "react";
import ScreenWrapper from "../components/ScreenWrapper";
import { hp, wp } from "../helpers/common";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "../constants/theme";
import { router } from "expo-router";
import { useAuth } from "../AuthContext";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { firestore } from "../firebaseConfig";
import moment from "moment";
import { Ionicons } from '@expo/vector-icons';

const HomePage = () => {
  const { user, userProfile, loading } = useAuth();
  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [favoriteMemories, setFavoriteMemories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollX = useRef(new Animated.Value(0)).current;
  const memoryScrollRef = useRef(null);

  const [recommendedPlaces, setRecommendedPlaces] = useState([
    { id: 'rec1', name: 'The Cozy Corner Cafe', type: 'Cafe', iconName: 'cafe-outline' },
    { id: 'rec2', name: 'Downtown Brews & More', type: 'Bar', iconName: 'beer-outline' },
    { id: 'rec3', name: 'Artisan Beans Deluxe', type: 'Cafe', iconName: 'cafe-outline' },
    { id: 'rec4', name: 'The Night Owl Spot', type: 'Bar', iconName: 'beer-outline' },
  ]);
  
  useEffect(() => {
    let scrollInterval;
    if (favoriteMemories.length > 1) {
      let currentIndex = 0;
      scrollInterval = setInterval(() => {
        if (memoryScrollRef.current) {
            currentIndex = (currentIndex + 1) % favoriteMemories.length;
            memoryScrollRef.current.scrollTo({
              x: currentIndex * wp(43.5),
              animated: true
            });
        }
      }, 3000);
    }
    return () => {
      if (scrollInterval) {
        clearInterval(scrollInterval);
      }
    };
  }, [favoriteMemories]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const fetchedEvents = (userData.events || []).sort((a, b) => {
            if (a.date && b.date) {
              return moment(a.date).valueOf() - moment(b.date).valueOf();
            } else if (a.createdAt && b.createdAt) {
                return moment(a.createdAt.toDate ? a.createdAt.toDate() : a.createdAt).valueOf() - moment(b.createdAt.toDate ? b.createdAt.toDate() : b.createdAt).valueOf();
            }
            return 0;
          });
          setEvents(fetchedEvents);
          
          const fetchedTasks = (userData.tasks || []).sort((a,b) => {
            const priorityOrder = { 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 };
            if(a.priority && b.priority && priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            }
            return moment(b.createdAt?.toDate ? b.createdAt.toDate() : b.createdAt).valueOf() - moment(a.createdAt?.toDate ? a.createdAt.toDate() : a.createdAt).valueOf();
          });
          setTasks(fetchedTasks);
          
          const memoriesData = userData.memories || [];
          const favorites = memoriesData.filter(memory => 
            memory && memory.isFavorite && (memory.images?.[0] || memory.image)
          );
          setFavoriteMemories(favorites);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
        fetchUserData();
    } else {
        setIsLoading(false);
    }
  }, [user]);

  const addEvent = async (eventTitle) => {
    if (!user || !eventTitle || !eventTitle.trim()) return;
    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      const newEvent = {
        id: Date.now().toString(), title: eventTitle.trim(), date: moment().format('YYYY-MM-DD'), time: '', description: '', createdAt: new Date().toISOString(),
      };
      await updateDoc(userDocRef, { events: arrayUnion(newEvent) });
      const updatedEvents = [...events, newEvent].sort((a, b) => {
        if (a.date && b.date) return moment(a.date).valueOf() - moment(b.date).valueOf();
        return 0;
      });
      setEvents(updatedEvents);
      Alert.alert("Success", "Event added successfully!");
    } catch (error) {
      console.error("Error adding event:", error); Alert.alert("Error", "Failed to add event.");
    }
  };

  const addTask = async (taskTitle) => {
    if (!user || !taskTitle || !taskTitle.trim()) return;
    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      const newTask = {
        id: Date.now().toString(), title: taskTitle.trim(), createdAt: new Date().toISOString(), completed: false, priority: 'MEDIUM',
      };
      await updateDoc(userDocRef, { tasks: arrayUnion(newTask) });
      setTasks([...tasks, newTask].sort((a,b) => moment(b.createdAt).valueOf() - moment(a.createdAt).valueOf()));
      Alert.alert("Success", "Task added successfully!");
    } catch (error) {
      console.error("Error adding task:", error); Alert.alert("Error", "Failed to add task.");
    }
  };

  const renderRecommendationListItem = (item) => (
    <TouchableOpacity 
      key={item.id} 
      style={styles.recommendationListItem} 
      onPress={() => Alert.alert("Recommendation Tapped", item.name)}
    >
      <Ionicons 
        name={item.iconName} 
        size={hp(2.6)} 
        color={theme.colors.text_dark || "#333"}
        style={styles.recommendationListItemIcon} 
      />
      <View style={styles.recommendationListItemTextContainer}>
        <Text style={styles.recommendationListItemName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.recommendationListItemType}>{item.type}</Text>
      </View>
      <Ionicons 
        name="chevron-forward-outline" 
        size={hp(2.5)} 
        color={theme.colors.text_secondary_dark || "#555"}
      />
    </TouchableOpacity>
  );

  if (loading || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary || "#dd528d"} />
      </View>
    );
  }

  const displayName = userProfile?.username || user?.email?.split('@')[0] || 'User';
  const profilePicture = userProfile?.profile_picture 
    ? { uri: userProfile.profile_picture } 
    : require("../assets/images/profile_photo.jpg");

  const upcomingEventsToDisplay = events
    .filter(event => moment(event.date).isSameOrAfter(moment(), 'day'))
    .slice(0, 3);

  const tasksToDisplay = tasks.slice(0, 3);
  const recommendationsToDisplay = recommendedPlaces.slice(0,4);

  return (
    <LinearGradient
      colors={theme.gradients?.background || ["#fbae52", "#dd528d", "#ff8c79"]}
      style={styles.gradientBackground}
    >
      <ScreenWrapper>
        <ScrollView 
            showsVerticalScrollIndicator={false} 
            contentContainerStyle={styles.scrollContentContainer}
        >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.greetingContainer}>
                <Text style={styles.greetingText}>
                  Hi, {displayName} <Text style={styles.emoji}>👋</Text>
                </Text>
                <Text style={styles.welcomeText}>Welcome back</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('myaccount')}>
                <Image source={profilePicture} style={styles.profileImage} />
              </TouchableOpacity>
            </View>

            {/* Upcoming Events Section */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionBox}>
                <View style={styles.sectionHeaderContainer}>
                    <Image source={require("../assets/icons/calendar_icon.png")} style={styles.sectionHeaderIcon} />
                    <Text style={styles.sectionTitle}>Upcoming Events</Text>
                </View>
                {upcomingEventsToDisplay.length > 0 ? (
                  upcomingEventsToDisplay.map((event) => (
                    <View key={event.id} style={styles.listItem}>
                      <Image source={require("../assets/icons/cake_icon.png")} style={styles.listItemIcon} />
                      <Text style={styles.listItemText} numberOfLines={1}>{event.title}</Text>
                    </View>
                  ))
                ) : (
                  <View style={styles.emptyStateContainer}>
                    <Text style={styles.emptyStateText}>No upcoming events.</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Widgets Section */}
            <View style={styles.widgetsForm}>
              <View style={styles.squareRow}>
                  <View style={styles.square}>
                    <Text style={styles.widgetTitle}>Quick Actions</Text>
                    <View style={styles.actionsListContainer}>
                        <TouchableOpacity style={styles.actionItem} onPress={() => Alert.prompt( "Create Event", "Enter event title:", [{ text: "Cancel", style: "cancel" }, { text: "Create", onPress: (title) => addEvent(title)}], "plain-text" )}>
                            <Image source={require("../assets/icons/Calendar_Plus.png")} style={styles.actionIcon} />
                            <Text style={styles.actionText} numberOfLines={1}>Create an event</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionItem} onPress={() => Alert.alert("Create a Group", "This feature is coming soon!")}>
                            <Image source={require("../assets/icons/Message_AlertPlus.png")} style={styles.actionIcon} />
                            <Text style={styles.actionText} numberOfLines={1}>Create a group</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionItem} onPress={() => Alert.prompt("Add Task", "Enter task title:", [{ text: "Cancel", style: "cancel" }, { text: "Add", onPress: (title) => addTask(title) }], "plain-text" )}>
                            <Image source={require("../assets/icons/List.png")} style={styles.actionIcon} />
                            <Text style={styles.actionText} numberOfLines={1}>Add a task</Text>
                        </TouchableOpacity>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.square} onPress={() => router.push("tasks")}>
                    <Text style={styles.widgetTitle}>Tasks</Text>
                    <View style={styles.tasksListContainer}>
                        {tasksToDisplay.length > 0 ? (
                            tasksToDisplay.map((task) => (
                                <View key={task.id} style={styles.actionItem}>
                                <Image source={task.completed ? require("../assets/icons/squareT.png") : require("../assets/icons/squareT.png")} style={styles.actionIcon} />
                                <Text style={[styles.actionText, task.completed && styles.taskCompletedText]} numberOfLines={1}>{task.title}</Text>
                                </View>
                            ))
                        ) : (
                            <View style={styles.emptyStateContainerWidget}>
                                <Text style={styles.emptyStateTextWidget}>No tasks yet.</Text>
                            </View>
                        )}
                    </View>
                  </TouchableOpacity>
                </View>
                <View style={styles.squareRow}>
                  <TouchableOpacity onPress={()=>router.push("map")} style={styles.squareImage}>
                    <ImageBackground 
                        source={require("../assets/images/Timisoara.png")} 
                        style={styles.imageBackgroundContent} 
                        imageStyle={styles.imageBackgroundImageStyle}
                    > 
                      <View style={styles.mapTextContainer}> 
                        <Ionicons name="location-sharp" size={hp(2.2)} color={theme.colors.text_dark || "#000"} style={styles.mapIconStyle} />
                        <Text style={styles.mapTitleStyle} numberOfLines={1}>Nearest Location</Text>
                      </View>
                    </ImageBackground>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => router.push("memories")} style={styles.squareImage}>
                    {favoriteMemories.length > 0 ? (
                      <View style={styles.memoriesContainerSquare}>
                        <Animated.ScrollView ref={memoryScrollRef} horizontal pagingEnabled showsHorizontalScrollIndicator={false} scrollEventThrottle={16} onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: true })} style={styles.memoriesScroll}>
                          {favoriteMemories.map((memory, index) => { // Index still used for animation interpolation
                            const imageUrl = memory.images?.[0] || memory.image;
                            if (!imageUrl) return <View key={memory.id} style={styles.memoryPreviewContainer}><Text style={styles.emptyStateTextWidget}>Image not available</Text></View>;
                            const inputRange = [(index - 1) * wp(43.5), index * wp(43.5), (index + 1) * wp(43.5)];
                            const scale = scrollX.interpolate({ inputRange, outputRange: [0.95, 1, 0.95], extrapolate: 'clamp'});
                            const opacity = scrollX.interpolate({ inputRange, outputRange: [0.7, 1, 0.7], extrapolate: 'clamp'});
                            return (
                              <Animated.View key={memory.id} style={[styles.memoryPreviewContainer, { transform: [{ scale }], opacity }]}>
                                <Image source={{ uri: imageUrl }} style={styles.memoryPreviewImage} />
                                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.memoryPreviewGradient}>
                                  <Text style={styles.memoryPreviewTitle} numberOfLines={1}>{memory.title || 'Memory'}</Text>
                                </LinearGradient> 
                              </Animated.View> // ***** THIS IS WHERE THE FIX IS APPLIED *****
                            );
                          })}
                        </Animated.ScrollView>
                        { favoriteMemories.length > 1 && (
                            <View style={styles.paginationDotsContainer}>
                            {favoriteMemories.map((_, pagIndex) => { // Use a different name for index here to avoid confusion
                                const inputRange = [(pagIndex - 1) * wp(43.5), pagIndex * wp(43.5), (pagIndex + 1) * wp(43.5)];
                                const dotScale = scrollX.interpolate({ inputRange, outputRange: [0.8, 1.2, 0.8], extrapolate: 'clamp'});
                                const dotOpacity = scrollX.interpolate({ inputRange, outputRange: [0.5, 1, 0.5], extrapolate: 'clamp'});
                                return ( <Animated.View key={`dot-${pagIndex}`} style={[styles.paginationDot, { transform: [{ scale: dotScale }], opacity: dotOpacity }]} /> );
                            })}
                            </View>
                        )}
                      </View>
                    ) : (
                      <View style={styles.emptyStateImageWidget}>
                        <Text style={styles.widgetTitle}>Memories</Text>
                        <Text style={styles.emptyStateTextWidget}>No favorite memories.</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
            </View>

            {/* Recommended Spots Section */}
            <View style={styles.recommendationsSectionContainer}>
              <View style={styles.recommendationsSectionBox}>
                <View style={styles.sectionHeaderContainerRec}>
                  <Ionicons name="star-outline" size={hp(2.4)} color={theme.colors.text_dark || "#333"} style={styles.recommendationsTitleIcon} />
                  <Text style={styles.recommendationsTitle}>Recommended Spots</Text>
                </View>
                {recommendationsToDisplay.length > 0 ? (
                    recommendationsToDisplay.map(item => renderRecommendationListItem(item))
                ) : (
                  <View style={styles.emptyStateContainer}>
                    <Text style={styles.emptyStateTextRec}>No recommendations yet.</Text>
                  </View>
                )}
              </View>
            </View>

        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.bottomNavigation}>
          <TouchableOpacity onPress={() => router.push("homepage")}><Image source={require("../assets/icons/home_icon.png")} style={styles.navIcon} /></TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("friends")}><View><Image source={require("../assets/icons/friends_icon.png")} style={styles.navIcon} /><View style={styles.notificationBadge} /></View></TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("map")}><Image source={require("../assets/icons/globe_icon.png")} style={styles.navIcon} /></TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("calendar")}><Image source={require("../assets/icons/calendar_icon.png")} style={styles.navIcon} /></TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("myaccount")}><Image source={require("../assets/icons/profile_icon.png")} style={styles.navIcon} /></TouchableOpacity>
        </View>
      </ScreenWrapper>
    </LinearGradient>
  );
};

export default HomePage;

// Styles remain the same as your last provided version
const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  scrollContentContainer: { 
    paddingBottom: hp(14), 
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: wp(5),
    paddingTop: hp(3), 
    marginBottom: hp(2.5), 
  },
  greetingContainer: {
    flex: 1,
  },
  greetingText: {
    fontSize: hp(3), 
    fontWeight: "bold",
    color: theme.colors.text_dark || "#000000", 
  },
  emoji: { 
    fontSize: hp(3),
  },
  welcomeText: {
    fontSize: hp(1.9), 
    color: theme.colors.text_secondary_dark || "#333333", 
    marginTop: hp(0.5),
  },
  profileImage: {
    width: hp(6.5), 
    height: hp(6.5),
    borderRadius: hp(3.25),
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)', 
  },
  sectionContainer: { 
    paddingHorizontal: wp(5),
    marginBottom: hp(2.5), 
  },
  sectionBox: { 
    width: "100%", 
    backgroundColor: "rgba(255, 255, 255, 0.25)", 
    borderRadius: 25,
    paddingVertical: hp(2),
    paddingHorizontal: wp(4), 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeaderContainer: { 
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(1.5),
  },
  sectionHeaderIcon: { 
    width: wp(5), 
    height: wp(5),
    resizeMode: "contain",
    marginRight: wp(2.5),
    tintColor: theme.colors.text_dark || "#000000", 
  },
  sectionTitle: {  
    fontSize: hp(2.1), 
    fontWeight: "700",
    color: theme.colors.text_dark || "#000000", 
  },
  listItem: { 
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.08)", 
    borderRadius: 15,
    paddingVertical: hp(1.2),
    paddingHorizontal: wp(3.5), 
    marginBottom: hp(1),
  },
  listItemIcon: { 
    width: wp(4.5), 
    height: wp(4.5),
    resizeMode: "contain",
    marginRight: wp(2.5),
    tintColor: theme.colors.text_dark || "#000000", 
  },
  listItemText: { 
    fontSize: hp(1.75), 
    color: theme.colors.text_dark || '#000000', 
    flex: 1, 
  },
  emptyStateContainer: { 
    alignItems: 'center',
    justifyContent: 'center', 
    paddingVertical: hp(2.5), 
    minHeight: hp(8), 
  },
  emptyStateText: { 
    fontSize: hp(1.75), 
    color: theme.colors.text_secondary_dark || "rgba(0,0,0,0.6)", 
  },
  emptyStateTextRec: { 
    fontSize: hp(1.75), 
    color: theme.colors.text_secondary_dark || "rgba(0,0,0,0.6)", 
  },
  emptyStateContainerWidget: { 
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp(2), 
  },
  emptyStateTextWidget: {
    fontSize: hp(1.7), 
    color: theme.colors.text_secondary_dark || "rgba(0,0,0,0.55)", 
    textAlign: 'center',
  },
  widgetsForm: {
    paddingHorizontal: wp(5),
    marginBottom: hp(1), 
  },
  squareRow: {
    flexDirection: "row", 
    justifyContent: "space-between", 
    marginBottom: hp(2),
  },
  square: { 
    width: wp(43.5), 
    minHeight: wp(43.5), 
    backgroundColor: "rgba(255, 255, 255, 0.2)", 
    borderRadius: 25, 
    padding: hp(2), 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    justifyContent: 'flex-start', 
  },
  actionsListContainer: { 
    marginTop: hp(0.5),
  },
  tasksListContainer: { 
    flex: 1, 
    marginTop: hp(0.5),
  },
  squareImage: { 
    width: wp(43.5),
    height: wp(43.5),
    backgroundColor: "rgba(255, 255, 255, 0.2)", 
    borderRadius: 25,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1,
    shadowRadius: 4,  
    elevation: 3,     
    justifyContent: 'center', 
    alignItems: 'center',
  },
  imageBackgroundContent: { 
    flex:1, width: '100%', height: '100%', justifyContent: 'flex-end', alignItems: 'center',
  },
  imageBackgroundImageStyle: { 
    borderRadius: 25,
  },
  mapTextContainer: { 
    position: 'absolute',
    bottom: hp(1.5),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(3), 
  },
  mapIconStyle: { 
    marginRight: wp(1.5),
  },
  mapTitleStyle: { 
    fontSize: hp(1.9),    
    fontWeight: 'bold',    
    color: theme.colors.text_dark || "#000000", 
    textAlign: 'center',
    textShadowColor: 'rgba(255, 255, 255, 0.6)', 
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  widgetTitle: { 
    fontSize: hp(1.9), 
    fontWeight: "700",
    color: theme.colors.text_dark || "#333",
    marginBottom: hp(1.5), 
    textAlign: "center",
    width: '100%',
  },
  actionItem: {
    flexDirection: "row", 
    alignItems: "center",
    marginBottom: hp(1.2), 
    paddingHorizontal: wp(1), 
  },
  actionIcon: {
    width: wp(4.8), 
    height: wp(4.8),
    resizeMode: "contain",
    marginRight: wp(2.5), 
  },
  actionText: {
    fontSize: hp(1.65), 
    fontWeight: "500", 
    color: theme.colors.text_dark || "#333", 
    flex: 1, 
  },
  taskCompletedText: {
    textDecorationLine: 'line-through',
    color: theme.colors.text_secondary_dark || '#888',
  },
  memoriesContainerSquare: {
    width: '100%', height: '100%', borderRadius: 25, overflow: 'hidden',
  },
  memoriesScroll: {
    width: '100%', height: '100%',
  },
  memoryPreviewContainer: {
    width: wp(43.5), height: '100%', justifyContent: 'center', alignItems: 'center',
  },
  memoryPreviewImage: {
    width: '100%', height: '100%', resizeMode: 'cover',
  },
  memoryPreviewGradient: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: hp(6.5), justifyContent: 'flex-end', padding: wp(1.5),
  },
  memoryPreviewTitle: {
    color: '#fff', fontSize: hp(1.65), fontWeight: '600', textAlign: 'center', textShadowColor: 'rgba(0,0,0,0.7)', textShadowOffset: {width:1, height:1}, textShadowRadius: 2,
  },
  paginationDotsContainer: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', position: 'absolute', bottom: hp(1), width: '100%',
  },
  paginationDot: {
    height: wp(1.5), width: wp(1.5), borderRadius: wp(0.75), backgroundColor: 'rgba(255,255,255,0.8)', marginHorizontal: wp(0.75),
  },
  emptyStateImageWidget: {
    flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: wp(4), width: '100%', height: '100%',
  },
  loadingContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent',
  },
  bottomNavigation: {
    flexDirection: "row", justifyContent: "space-around", alignItems: "center", height: hp(7.5), backgroundColor: "rgba(255, 255, 255, 0.38)", borderRadius: hp(3.75), position: "absolute", bottom: hp(2.5), left: wp(4), right: wp(4), shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 6,
  },
  navIcon: {
    width: hp(3.3), height: hp(3.3), resizeMode: "contain", opacity: 1,
  },
  notificationBadge: {
    position: "absolute", top: -hp(0.3), right: -wp(0.7), width: wp(1.8), height: wp(1.8), backgroundColor: theme.colors.accent || "red", borderRadius: wp(0.9), borderWidth: 1, borderColor: '#fff',
  },
  // Styles for Recommendations Section (List format)
  recommendationsSectionContainer: { 
    paddingHorizontal: wp(5),
    marginBottom: hp(2.5), 
  },
  recommendationsSectionBox: { 
    width: "100%", 
    backgroundColor: "rgba(255, 255, 255, 0.25)", // Adjusted for dark text contrast
    borderRadius: 25,
    paddingVertical: hp(2),
    paddingHorizontal: wp(4), 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeaderContainerRec: { 
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(1.5),
  },
  recommendationsTitleIcon: { // Icon for Recommended Spots title
    marginRight: wp(2),
    // Color is set directly in JSX based on theme
  },
  recommendationsTitle: { // Title for "Recommended Spots"
    fontSize: hp(2.1),
    fontWeight: '700',
    color: theme.colors.text_dark || '#333333', 
  },
  recommendationListItem: { 
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(1.3), 
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.08)', 
  },
  recommendationListItemIcon: {
    marginRight: wp(3),
  },
  recommendationListItemTextContainer: {
    flex: 1,
    justifyContent: 'center', 
  },
  recommendationListItemName: {
    fontSize: hp(1.8),
    fontWeight: '600',
    color: theme.colors.text_dark || '#000000', 
    marginBottom: hp(0.2),
  },
  recommendationListItemType: {
    fontSize: hp(1.55),
    color: theme.colors.text_secondary_dark || '#555555', 
  },
});