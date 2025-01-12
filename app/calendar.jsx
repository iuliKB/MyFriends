import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { CalendarList } from "react-native-calendars";
import { hp, wp } from "../helpers/common";
import { theme } from "../constants/theme";
import moment from "moment";
import { router } from "expo-router";
import ScreenWrapper from "../components/ScreenWrapper";

const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState("");
  const [currentMonth, setCurrentMonth] = useState(moment().format("MMMM YYYY"));

  // Function to handle month change
  const handleMonthChange = (direction) => {
    const newMonth = moment(currentMonth, "MMMM YYYY").add(direction, "month");
    setCurrentMonth(newMonth.format("MMMM YYYY"));
  };

  // Sample events
  const events = [
    { id: "1", title: "Meeting in the centre", time: "Today, 9:00 AM", relativeTime: "In 2 hours" },
    { id: "2", title: "Dinner with Jenny", time: "Today, 1:00 PM", relativeTime: "In 6 hours" },
    { id: "3", title: "Avengers, cinema", time: "Tomorrow, 8:30 PM", relativeTime: "Tomorrow" },
  ];

  return (
    <LinearGradient
    colors={["#fbae52","#dd528d", "#ff8c79"]}
    style={styles.container}
  >
    <ScreenWrapper>
      {/* Background Gradient */}
      <LinearGradient
    // 
    colors={["#73d1d3", "#badcc3", "#dba380"]}
    style={styles.backgroundGradient}
  >
      </LinearGradient>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.arrowIcon}>
          <Text style={styles.arrowText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Calendar</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity>
            <Image
              source={require("../assets/icons/search_icon.png")}
              style={styles.icon}
            />
          </TouchableOpacity>
          <TouchableOpacity>
            <Image
              source={require("../assets/icons/plus_icon.png")}
              style={styles.icon}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {["Day", "Week", "Month", "Year"].map((tab) => (
          <TouchableOpacity key={tab} style={styles.tabButton}>
            <Text style={styles.tabText}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Month Navigation */}
      <View style={styles.monthNavigation}>
        <TouchableOpacity onPress={() => handleMonthChange(-1)} style={styles.arrowButton}>
          <Text style={styles.arrowText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.currentMonth}>{currentMonth}</Text>
        <TouchableOpacity onPress={() => handleMonthChange(1)} style={styles.arrowButton}>
          <Text style={styles.arrowText}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Calendar */}
      <View style={styles.calendarContainer}>
        <CalendarList
          onDayPress={(day) => setSelectedDate(day.dateString)}
          current={moment(currentMonth, "MMMM YYYY").toDate()}
          markedDates={{
            [selectedDate]: {
              selected: true,
              marked: true,
              selectedColor: "#dd528d",
            },
          }}
          theme={{
            calendarBackground: "rgba(255, 255, 255, 0.7)",
            todayTextColor: "#dd528d",
            selectedDayBackgroundColor: "#dd528d",
            selectedDayTextColor: "#FFF",
            arrowColor: theme.colors.primary,
            monthTextColor: "#dd528d",
            textDayFontWeight: "bold",
          }}
          style={styles.calendarStyle}
        />
      </View>

      {/* Upcoming Events */}
      <View style={styles.eventsContainer}>
        <Text style={styles.eventsTitle}>Upcoming Events</Text>
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.eventCard}>
              <Text style={styles.eventTitle}>{item.title}</Text>
              <Text style={styles.eventTime}>{item.time}</Text>
              <Text style={styles.eventRelativeTime}>{item.relativeTime}</Text>
            </View>
          )}
        />
      </View>

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
export default Calendar;

const styles = StyleSheet.create({
  container: {
    flex: 1,
   
  },
  backgroundGradient: {
    // position: "absolute",
    // top: 0,
    // left: 0,
    // right: 0,
    // height: hp(35), // Oval background height
    // borderBottomLeftRadius: hp(10),
    // borderBottomRightRadius: hp(10),
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "45%",
    borderBottomLeftRadius: wp(100),
    borderBottomRightRadius: wp(100),
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center", // Center items vertically within the header
    paddingHorizontal: wp(3),
    //marginTop: hp(1), // Push the header down
    //paddingTop: hp(1), // Extra space at the top of the header
  },
  arrowIcon: {
    padding: 8,
    marginTop: hp(0), // Move the arrow icon slightly down
  },
  arrowText: {
    fontSize: 20,
    color: "#FFF",
    fontWeight: "bold",
  },
  headerTitle: {
    fontSize: hp(2.5),
    color: "#FFF",
    fontWeight: "bold",
    marginTop: hp(1), // Move the title slightly down
  },
  headerIcons: {
    flexDirection: "row",
    marginTop: hp(1), // Move the icons down
  },
  icon: {
    width: 24,
    height: 24,
    marginLeft: wp(3),
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginTop: hp(3),
    paddingBottom: hp(2),
  },
  tabButton: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    paddingVertical: hp(1),
    paddingHorizontal: wp(4),
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  tabText: {
    fontSize: hp(2),
    fontWeight: "bold",
    color: "#theme.colors.text",
  },
  monthNavigation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: wp(5),
    marginTop: hp(2),
  },
  arrowButton: {
    padding: 10,
  },
  currentMonth: {
    fontSize: hp(3),
    fontWeight: "bold",
    color: theme.colors.text,
  },
  calendarContainer: {
    flex: 1,
    marginVertical: hp(2),
    marginHorizontal: wp(3),
    borderRadius: 30,
    backgroundColor: "rgba(200, 200, 200, 0.5)",
    overflow: "visible",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    width: "auto"
  },
  calendarStyle: {
    borderRadius: 20,
  },
  eventsContainer: {
    paddingHorizontal: wp(4),
    paddingBottom: hp(4),
    marginBottom: hp(8),
  },
  eventsTitle: {
    fontSize: hp(2.5),
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: hp(1),
  },
  eventCard: {
    backgroundColor: "rgba(255, 255, 255, 0.7)", // Slight opacity for the background color
    borderRadius: 25,
    padding: hp(1),
    marginBottom: hp(0.5),
    
    // iOS specific shadow properties
    shadowColor: "#000", // Color of the shadow
    shadowOffset: { width: 0, height: 2 }, // Adjust the offset of the shadow
    shadowOpacity: 0.2, // Shadow opacity for iOS (use lower opacity)
    shadowRadius: 6, // Shadow blur radius
    
    // Android specific shadow properties
    elevation: 8, // Elevation for Android (this controls the shadow on Android)
  },
  
  eventTitle: {
    fontSize: hp(2),
    fontWeight: "bold",
    color: <theme className="colors text"></theme>,
  },
  eventTime: {
    fontSize: hp(1.8),
    color: "#777",
  },
  eventRelativeTime: {
    fontSize: hp(1.6),
    color: "#6C63FF",
    marginTop: hp(0.3),
  },
  bottomNavigation: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: hp(7), // Bar height
    backgroundColor: "rgba(255, 255, 255, 0.4)", // Background color
    borderRadius: 50, // Rounded corners
    position: "absolute",
    bottom: hp(3), // Space from the bottom of the screen
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
});
