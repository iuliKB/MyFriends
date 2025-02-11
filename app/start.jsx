import { StyleSheet, View, Image, Text, TouchableOpacity } from "react-native";
import ScreenWrapper from "../components/ScreenWrapper";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { hp, wp } from "../helpers/common";
import { theme } from "../constants/theme";

const Start = () => {
  return (
    <>
      <LinearGradient
        colors={["#fbae52", "#dd528d", "#ff8c79"]}
        style={styles.gradientBackground}
      >
        <ScreenWrapper>
          <View style={styles.container}>
            <Image
              style={styles.startImage}
              resizeMode="contain"
              source={require("../assets/images/Saly-44.png")}
            />
            <Text style={styles.title}>Let's Go!</Text>
            <TouchableOpacity
              onPress={() => router.push("signup")}
              style={styles.appButtonContainer}
            >
              <Text style={styles.appButtonText}>Create An Account</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("signin")}
              style={styles.appButtonContainer}
            >
              <Text style={styles.appButtonText}>Login</Text>
            </TouchableOpacity>
            <Text style={styles.continueline}>Or continue with</Text>
            <View style={styles.socialIcons}>
              <Image
                source={require("../assets/images/instagram-icon2.png")}
                style={styles.icon}
              />
              <Image
                source={require("../assets/images/facebook-icon2.png")}
                style={styles.icon}
              />
              <Image
                source={require("../assets/images/google-icon2.png")}
                style={styles.icon}
              />
            </View>
            <Text style={styles.puchline}>Where Every Memory Begins!</Text>
          </View>
        </ScreenWrapper>
      </LinearGradient>
    </>
  );
};

export default Start;

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
    color: theme.colors.darkLight,
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
});
