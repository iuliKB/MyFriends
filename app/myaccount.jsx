import { StyleSheet, View, Image, Text, TouchableOpacity, Alert } from "react-native";
import ScreenWrapper from "../components/ScreenWrapper";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { hp, wp } from "../helpers/common";
import { theme } from "../constants/theme";

const MyAccount = () => {
  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Logout", 
          onPress: () => {
            // Here you would typically also clear any user authentication state/tokens
            router.replace("/signin"); // Replace so user can't navigate back
          }
        }
      ]
    );
  };

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
          <Text style={styles.ovalText}>Profile</Text>
        </LinearGradient>

        {/* Profile Image */}
        <View style={styles.profileImageWrapper}>
          <Image
            source={require("../assets/images/avatar.png")}
            style={styles.profileImage}
          />
        </View>

        {/* Tabs List */}
        <View style={styles.widgetsForm}>
          <View style={styles.tabsContainer}>
            {[
              // { title: "Edit Profile", route: "editProfile" }, // Șters
              { title: "My Wishlist", route: "wishlist" },
              { title: "Change Password", route: "changePassword" },
              // { title: "Settings", route: "settings" }, // Șters
              { title: "My Memories", route: "memories"},
              { title: "Logout", route: null, isLogout: true },
            ].map((tab, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.tabButton, tab.isLogout && styles.logoutButton]}
                onPress={() => tab.isLogout ? handleLogout() : router.push(tab.route)}
              >
                <Text style={[styles.tabText, tab.isLogout && styles.logoutText]}>{tab.title}</Text>
              </TouchableOpacity>
            ))}
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
              style={styles.globeIcon} // Ar trebui să fie styles.navIcon dacă arată similar cu celelalte
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

export default MyAccount;

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  fullScreenOval: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "35%", //
    borderBottomLeftRadius: wp(100), //
    borderBottomRightRadius: wp(100), //
    justifyContent: "center", //
    alignItems: "center", //
    overflow: "hidden", //
  },
  ovalText: {
    color: "#fff", //
    fontSize: hp(3.5), //
    fontWeight: "bold", //
    textAlign: "center", //
  },
  profileImageWrapper: {
    width: wp(30), //
    height: wp(30), //
    borderRadius: wp(15), //
    overflow: "hidden", //
    borderWidth: 4, //
    borderColor: "#dd528d", //
    position: "absolute", //
    top: "25%", //
    alignSelf: "center", //
    justifyContent: "center", //
    alignItems: "center", //
    backgroundColor: "#eee", //
    shadowColor: "#000", //
    shadowOffset: { width: 0, height: 2 }, //
    shadowOpacity: 0.2, //
    shadowRadius: 5, //
    elevation: 5, //
  },
  profileImage: {
    width: "100%", //
    height: "100%", //
    resizeMode: "cover", //
  },
  tabsContainer: {
    position: "absolute", //
    top: hp(30), //
    left: wp(5), //
    right: wp(5), //
  },
  tabButton: {
    backgroundColor: "rgba(186, 220, 195, 0.8)", //
    paddingVertical: hp(2), //
    paddingHorizontal: wp(5), //
    borderRadius: 25, //
    marginBottom: hp(1.5), //
    elevation: 3, //
    shadowColor: "#000", //
    shadowOffset: { width: 0, height: 2 }, //
    shadowOpacity: 0.1, //
    shadowRadius: 5, //
  },
  logoutButton: {
    backgroundColor: "rgba(255, 100, 100, 0.8)", //
  },
  tabText: {
    fontSize: hp(2), //
    fontWeight: "600", //
    color: theme.colors.text, //
    textAlign: "center", //
  },
  logoutText: {
    color: "#fff", //
  },
  widgetsForm: {
    marginTop: hp(5), //
    paddingHorizontal: wp(4), //
  },  
  bottomNavigation: {
    flexDirection: "row", //
    justifyContent: "space-around", //
    alignItems: "center", //
    height: hp(7), //
    backgroundColor: "rgba(255, 255, 255, 0.4)", //
    borderRadius: 50, //
    position: "absolute", //
    bottom: hp(2.5), //
    width: "90%", //
    alignSelf: "center", //
    paddingHorizontal: wp(4), //
    shadowColor: "#000", //
    shadowOffset: { width: 0, height: 2 }, //
    shadowOpacity: 0.1, //
    shadowRadius: 6, //
    elevation: 5, //
  },
  navIcon: {
    width: 28, //
    height: 28, //
    resizeMode: "contain", //
  },
  globeIcon: { // Reține că acest stil este diferit de navIcon
    fontSize: 30, //
    color: "black", //
  },
  notificationBadge: {
    position: "absolute", //
    top: -2, //
    right: -6, //
    width: 8, //
    height: 8, //
    backgroundColor: "red", //
    borderRadius: 4, //
  },
});