import { StyleSheet, View, Image, Text, TouchableOpacity } from "react-native";
import ScreenWrapper from "../components/ScreenWrapper";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { hp, wp } from "../helpers/common";
import { theme } from "../constants/theme";

const Memories = () => {
  return (
    <LinearGradient
      colors={["#fbae52", "#dd528d", "#ff8c79"]}
      style={styles.gradientBackground}
    >
      <ScreenWrapper>
        {/* Upper Oval Section */}
        <LinearGradient
          colors={["#73d1d3", "#badcc3", "#dba380"]}
          style={styles.fullScreenOval}
        >
          <Text style={styles.ovalText}>Memories</Text>
        </LinearGradient>


  
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

export default Memories;

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  fullScreenOval: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "35%",
    borderBottomLeftRadius: wp(100),
    borderBottomRightRadius: wp(100),
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  ovalText: {
    color: "#fff",
    fontSize: hp(3.5),
    fontWeight: "bold",
    textAlign: "center",
  },
  profileImageWrapper: {
    width: wp(30),
    height: wp(30),
    borderRadius: wp(15),
    overflow: "hidden",
    borderWidth: 4,
    borderColor: "#dd528d",
    position: "absolute",
    top: "25%", // Position at the end of the oval
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#eee", // Fallback background
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  profileImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  tabsContainer: {
    position: "absolute", // Using absolute positioning
    top: hp(30), // Place it closer to the circle by adjusting the top value
    left: wp(5),
    right: wp(5),
  },
  tabButton: {
    //backgroundColor: "rgba(255, 255, 255, 0.4)",
    //backgroundColor: "rgba(219, 163, 128, 0.8)",
    backgroundColor: "rgba(186, 220, 195, 0.8)",
    paddingVertical: hp(2),
    paddingHorizontal: wp(5),
    borderRadius: 25,
    marginBottom: hp(1.5),
    elevation: 3, // Shadow for Android
    shadowColor: "#000", // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  tabText: {
    fontSize: hp(2),
    fontWeight: "600",
    color: theme.colors.text,
    textAlign: "center",
  },
  widgetsForm: {
    marginTop: hp(5),
    paddingHorizontal: wp(4),
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
});



