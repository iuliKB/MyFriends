import { useState } from "react";
import { StyleSheet, View, Image, Text, TouchableOpacity, TextInput, Alert } from "react-native";
import ScreenWrapper from "../components/ScreenWrapper";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { hp, wp } from "../helpers/common";
import { theme } from "../constants/theme";
import { getAuth, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "firebase/auth";

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match.");
      return;
    }

    const auth = getAuth();
    const user = auth.currentUser;

    if (user && user.email) {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);

      try {
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);
        Alert.alert("Success", "Password changed successfully.");
        router.push("myaccount");
      } catch (error) {
        console.error(error);
        Alert.alert("Error", error.message || "Password change failed.");
      }
    } else {
      Alert.alert("Error", "No user is logged in.");
    }
  };

  return (
    <LinearGradient colors={["#fbae52", "#dd528d", "#ff8c79"]} style={styles.gradientBackground}>
      <ScreenWrapper>
        <LinearGradient colors={["#73d1d3", "#badcc3", "#dba380"]} style={styles.fullScreenOval}>
          <Text style={styles.ovalText}>Change Password</Text>
        </LinearGradient>

        <View style={styles.widgetsForm}>
          <TextInput
            placeholder="Current Password"
            secureTextEntry
            placeholderTextColor="#999"
            style={styles.inputField}
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />
          <TextInput
            placeholder="New Password"
            secureTextEntry
            placeholderTextColor="#999"
            style={styles.inputField}
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <TextInput
            placeholder="Confirm New Password"
            secureTextEntry
            placeholderTextColor="#999"
            style={styles.inputField}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity style={styles.tabButton} onPress={handleChangePassword}>
            <Text style={styles.tabText}>Submit</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Navigation */}
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
      </ScreenWrapper>
    </LinearGradient>
  );
};

export default ChangePassword;

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
  widgetsForm: {
    marginTop: hp(28),
    paddingHorizontal: wp(5),
  },
  inputField: {
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
    borderRadius: 12,
    fontSize: hp(2),
    color: "#333",
    marginBottom: hp(2),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabButton: {
    backgroundColor: "rgba(186, 220, 195, 0.8)",
    paddingVertical: hp(2),
    paddingHorizontal: wp(5),
    borderRadius: 25,
    marginTop: hp(1),
    elevation: 3,
    shadowColor: "#000",
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
    width: 28,
    height: 28,
    resizeMode: "contain",
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
