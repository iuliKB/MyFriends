import { StyleSheet, View, Image, Text, TouchableOpacity } from "react-native";
import ScreenWrapper from "../components/ScreenWrapper";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { hp, wp } from "../helpers/common";
import { theme } from "../constants/theme";

const MyAccount = () => {
  return (
    <>
      <LinearGradient
        colors={["#FFD6A5", "#FF8FAB"]}
        style={styles.gradientBackground}
      >
        <ScreenWrapper>
        <Text style={styles.title}>MyAccount!</Text>

            
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
        </ScreenWrapper>
      </LinearGradient>
    </>
  );
};

export default MyAccount;

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: wp(4),
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
