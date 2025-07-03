import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
  Animated,
  StatusBar,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { CalendarList, Calendar } from "react-native-calendars";
import { hp, wp } from "../helpers/common";
import { theme } from "../constants/theme";
import moment from "moment";
import { router } from "expo-router";
import ScreenWrapper from "../components/ScreenWrapper";
import { useAuth } from "../AuthContext";
import { doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import { firestore } from "../firebaseConfig";
import { Ionicons } from "@expo/vector-icons";

const SCREEN_HEIGHT = Dimensions.get("window").height;

const CalendarScreen = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(moment().format("YYYY-MM-DD"));
  const [currentMonth, setCurrentMonth] = useState(moment().format("MMMM YYYY")); // Initialize currentMonth
  const [events, setEvents] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [loading, setLoading] = useState(true);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDate, setNewEventDate] = useState("");
  const [newEventTime, setNewEventTime] = useState("");
  const [newEventDescription, setNewEventDescription] = useState("");
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const modalAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (isAddModalVisible) {
      Animated.timing(modalAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(modalAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isAddModalVisible]);

  // Update marked dates whenever events change
  useEffect(() => {
    const marks = {};
    events.forEach((event) => {
      marks[event.date] = {
        marked: true,
        dotColor: "#dd528d",
      };
    });
    // Add selected date marker
    marks[selectedDate] = {
      ...marks[selectedDate],
      selected: true,
      selectedColor: "#dd528d",
    };
    setMarkedDates(marks);
  }, [events, selectedDate]);

  // Fetch events when component mounts
  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    return () => {
      // Cleanup animations
      fadeAnim.setValue(0);
      modalAnim.setValue(0);
    };
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const userRef = doc(firestore, "users", user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        // Sort events by date
        const sortedEvents = (userData.events || []).sort(
          (a, b) => moment(a.date).valueOf() - moment(b.date).valueOf()
        );
        setEvents(sortedEvents);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      Alert.alert("Error", "Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const addEvent = async () => {
    if (!newEventTitle.trim()) {
      Alert.alert("Error", "Please enter an event title");
      return;
    }

    if (!newEventDate) {
      Alert.alert("Error", "Please select a date");
      return;
    }

    // Validate date is not in the past
    if (moment(newEventDate).startOf("day").isBefore(moment().startOf("day"))) {
      Alert.alert("Error", "Cannot create events in the past");
      return;
    }

    try {
      const userRef = doc(firestore, "users", user.uid);

      const newEvent = {
        id: Date.now().toString(),
        title: newEventTitle.trim(),
        date: newEventDate,
        time: newEventTime.trim(),
        description: newEventDescription.trim(),
        createdAt: new Date().toISOString(),
      };

      await updateDoc(userRef, {
        events: arrayUnion(newEvent),
      });

      // Update local state with sorted events
      const updatedEvents = [...events, newEvent].sort(
        (a, b) => moment(a.date).valueOf() - moment(b.date).valueOf()
      );
      setEvents(updatedEvents);

      setNewEventTitle("");
      setNewEventDate("");
      setNewEventTime("");
      setNewEventDescription("");
      setIsAddModalVisible(false);
      Alert.alert("Success", "Event added successfully!");
    } catch (error) {
      console.error("Error adding event:", error);
      Alert.alert("Error", "Failed to add event");
    }
  };

  const deleteEvent = async (eventId) => {
    try {
      const updatedEvents = events.filter((event) => event.id !== eventId);
      const userRef = doc(firestore, "users", user.uid);
      await updateDoc(userRef, { events: updatedEvents });
      setEvents(updatedEvents);
      Alert.alert("Success", "Event deleted successfully!");
    } catch (error) {
      console.error("Error deleting event:", error);
      Alert.alert("Error", "Failed to delete event");
    }
  };

  const formatEventDate = (dateString) => {
    const eventDate = moment(dateString);
    const today = moment().startOf("day");
    const tomorrow = moment().add(1, "days").startOf("day");

    if (eventDate.isSame(today, "day")) {
      return "Today";
    } else if (eventDate.isSame(tomorrow, "day")) {
      return "Tomorrow";
    } else {
      return eventDate.format("MMM D, YYYY");
    }
  };

  const getRelativeTime = (dateString) => {
    const eventDate = moment(dateString);
    const now = moment();
    const diffDays = eventDate.diff(now, "days");

    if (diffDays < 0) {
      return "Past";
    } else if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Tomorrow";
    } else if (diffDays < 7) {
      return `In ${diffDays} days`;
    } else {
      return `In ${Math.floor(diffDays / 7)} weeks`;
    }
  };

  // Function to render calendar view
  const renderCalendarView = () => {
    return (
      <Calendar
        current={moment().format("YYYY-MM-DD")} // Use current date for initial view
        markedDates={markedDates}
        theme={{
          calendarBackground: "rgba(255, 255, 255, 0.9)",
          todayTextColor: "#dd528d",
          selectedDayBackgroundColor: "#dd528d",
          selectedDayTextColor: "#FFF",
          monthTextColor: "#333",
          textDayFontWeight: "500",
          textMonthFontWeight: "bold",
          textDayHeaderFontWeight: "500",
          dotColor: "#dd528d",
          selectedDotColor: "#ffffff",
          "stylesheet.calendar.header": {
            dayTextAtIndex0: { color: "#666" },
            dayTextAtIndex6: { color: "#666" },
          },
        }}
        onDayPress={(day) => {
          setSelectedDate(day.dateString);
          setNewEventDate(day.dateString);
        }}
        onMonthChange={(date) => {
          setCurrentMonth(date.month);
        }} // Update currentMonth
        enableSwipeMonths={true}
        style={styles.calendarStyle}
      />
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#dd528d" />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={["#fbae52", "#dd528d", "#ff8c79"]}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      <ScreenWrapper>
        {/* Background Gradient */}
        <LinearGradient
          colors={["#73d1d3", "#badcc3", "#dba380"]}
          style={styles.backgroundGradient}
        />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButtonContainer}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Calendar</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        {/* Calendar View */}
        <View style={styles.calendarContainer}>{renderCalendarView()}</View>

        {/* Events List */}
        <View style={styles.eventsContainer}>
          <View style={styles.eventsHeader}>
            <Text style={styles.eventsTitle}>Upcoming Events</Text>
            <TouchableOpacity
              style={styles.addEventButton}
              onPress={() => setIsAddModalVisible(true)}
            >
              <Ionicons name="add-circle" size={24} color="#dd528d" />
              <Text style={styles.addEventText}>Add Event</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.eventsList}>
            {events.length > 0 ? (
              events.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.eventItem}
                  onPress={() => {
                    // Handle event press
                  }}
                >
                  <View style={styles.eventContent}>
                    <Text style={styles.eventTitle}>{item.title}</Text>
                    <Text style={styles.eventDate}>
                      {moment(item.date).format("MMMM D, YYYY")}
                      {item.time ? ` at ${item.time}` : ""}
                    </Text>
                    {item.description ? (
                      <Text style={styles.eventDescription}>{item.description}</Text>
                    ) : null}
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deleteEvent(item.id)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#ff4444" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons
                  name="calendar-outline"
                  size={60}
                  color="rgba(0, 0, 0, 0.2)"
                />
                <Text style={styles.emptyStateText}>
                  No events yet. Add your first event!
                </Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Add Event Modal */}
        <Modal
          visible={isAddModalVisible}
          transparent={true}
          animationType="fade"
        >
          <View style={styles.modalContainer}>
            <Animated.View
              style={[
                styles.modalContent,
                {
                  opacity: modalAnim,
                  transform: [
                    {
                      translateY: modalAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [50, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add New Event</Text>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => {
                    setIsAddModalVisible(false);
                    setNewEventTitle("");
                    setNewEventDate("");
                    setNewEventTime("");
                    setNewEventDescription("");
                  }}
                >
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScroll}>
                <TextInput
                  style={styles.input}
                  value={newEventTitle}
                  onChangeText={setNewEventTitle}
                  placeholder="Event Title"
                  placeholderTextColor="#666"
                />

                <Text style={styles.inputLabel}>Date</Text>
                <View style={styles.dateTimeContainer}>
                  <Text style={styles.selectedDate}>
                    {newEventDate
                      ? formatEventDate(newEventDate)
                      : "Select a date from calendar"}
                  </Text>
                </View>

                <Text style={styles.inputLabel}>Time (optional)</Text>
                <TextInput
                  style={styles.input}
                  value={newEventTime}
                  onChangeText={setNewEventTime}
                  placeholder="e.g. 2:00 PM"
                  placeholderTextColor="#666"
                />

                <Text style={styles.inputLabel}>Description (optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={newEventDescription}
                  onChangeText={setNewEventDescription}
                  placeholder="Add details about your event"
                  placeholderTextColor="#666"
                  multiline={true}
                  numberOfLines={4}
                />

                <TouchableOpacity
                  style={[
                    styles.createEventButton,
                    (!newEventTitle.trim() || !newEventDate) &&
                      styles.createEventButtonDisabled,
                  ]}
                  onPress={addEvent}
                  disabled={!newEventTitle.trim() || !newEventDate}
                >
                  <Text style={styles.createEventButtonText}>Create Event</Text>
                </TouchableOpacity>
              </ScrollView>
            </Animated.View>
          </View>
        </Modal>

        {/* Bottom Navigation */}
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

export default CalendarScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fbae52",
  },
  backgroundGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "40%",
    borderBottomLeftRadius: wp(100),
    borderBottomRightRadius: wp(100),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: wp(4),
    marginTop: hp(3),
    marginBottom: hp(2),
  },
  backButtonContainer: {
    padding: wp(2),
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: hp(2.8),
    color: "#fff",
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  headerPlaceholder: {
    width: wp(10), // Match the width of the back button for proper centering
  },
  monthNavigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: wp(4),
    marginBottom: hp(3),
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    marginHorizontal: wp(4),
    paddingVertical: hp(1.5),
    borderRadius: 15,
  },
  currentMonth: {
    fontSize: hp(2.4),
    fontWeight: "bold",
    color: "#333",
  },
  arrowButton: {
    padding: wp(2),
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 12,
  },
  calendarContainer: {
    marginHorizontal: wp(4),
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxHeight: SCREEN_HEIGHT * 0.42, // Slightly reduced to ensure visibility
  },
  calendarStyle: {
    borderRadius: 20,
  },
  eventsContainer: {
    flex: 1,
    marginTop: hp(2),
    marginBottom: hp(10),
    paddingHorizontal: wp(4),
  },
  eventsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp(2),
  },
  eventsTitle: {
    fontSize: hp(2.2),
    fontWeight: "bold",
    color: "#333",
  },
  addEventButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    paddingVertical: hp(0.8),
    paddingHorizontal: wp(3),
    borderRadius: 20,
  },
  addEventText: {
    color: "#dd528d",
    fontWeight: "bold",
    marginLeft: wp(1),
  },
  eventsList: {
    flex: 1,
  },
  eventItem: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    padding: hp(2),
    marginBottom: hp(1.5),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  eventDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: hp(1),
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 68, 68, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 25,
    padding: wp(5),
    width: wp(90),
    maxHeight: hp(80),
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp(3),
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalScroll: {
    maxHeight: hp(60),
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: hp(2),
    fontSize: 16,
    marginBottom: hp(3),
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: hp(1),
  },
  dateTimeContainer: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: hp(2),
    marginBottom: hp(3),
  },
  selectedDate: {
    fontSize: 16,
    color: "#333",
  },
  textArea: {
    height: hp(10),
    textAlignVertical: "top",
  },
  createEventButton: {
    backgroundColor: "#dd528d",
    borderRadius: 12,
    padding: hp(2),
    alignItems: "center",
    marginTop: hp(2),
    marginBottom: hp(3),
  },
  createEventButtonDisabled: {
    backgroundColor: "#ccc",
  },
  createEventButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: hp(4),
  },
  emptyStateText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginTop: hp(2),
  },
});
