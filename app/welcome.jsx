import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import React from "react";
import ScreenWrapper from "../components/ScreenWrapper";
import { hp, wp } from "../helpers/common";
import { StatusBar } from "expo-status-bar";
import { theme } from "../constants/theme";
import Carousel from "pinar";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

const Welcome = () => {
  return (
    <LinearGradient
      colors={["#FFBE98", "#FF8FAB"]}
      style={styles.gradientBackground}
    >
      <ScreenWrapper>
        {/* Status Bar */}
        <StatusBar style="dark" />
        <Carousel showsControls={false}>
          <View style={styles.container}>
            <View style={{ gap: 20 }}>
              <Text style={styles.title}>Welcome!</Text>
              <Image
                style={styles.welcomeImage}
                resizeMode="contain"
                source={require("../assets/images/Saly-welc2.png")}
              />
              <Text style={styles.puchline}>
                Your all-in-one app for planning, organizing, and celebrating
                with friends!
              </Text>
            </View>
          </View>
          <View style={styles.container}>
            <View style={{ gap: 20 }}>
              <Text style={styles.title}>Focus on the Fun!</Text>
              <Image
                style={styles.welcomeImage2}
                resizeMode="contain"
                source={require("../assets/images/Saly-38.png")}
              />
              <Text style={styles.puchline}>
                Plan, track, and celebrate without the stress – we’ll handle the
                details for you.
              </Text>
            </View>
          </View>
          <View style={styles.container}>
            <View style={{ gap: 20 }}>
              <Text style={styles.title}>Memories That Last!</Text>
              <Image
                style={styles.welcomeImage3}
                resizeMode="contain"
                source={require("../assets/images/Saly-18.png")}
              />
              <Text style={styles.puchline}>
                Create, share, and relive unforgettable moments with your
                friends.
              </Text>
              <TouchableOpacity
                onPress={() => router.push("start")}
                style={styles.appButtonContainer}
              >
                <Text style={styles.appButtonText}>Start!</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Carousel>
      </ScreenWrapper>
    </LinearGradient>
  );
};

export default Welcome;

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1, // Ensure the gradient covers the entire screen
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: wp(4),
    paddingTop: hp(4), // Keep padding consistent
  },
  welcomeImage: {
    height: hp(60), // No change for the first screen
    width: wp(90),
    alignSelf: "center",
    marginBottom: hp(1),
  },
  welcomeImage2: {
    height: hp(60),
    width: wp(100),
    alignSelf: "center",
  },
  welcomeImage3: {
    height: hp(40), // Reduced size for the 3rd screen image
    width: wp(80),
    alignSelf: "center",
    marginBottom: hp(1), // Added spacing between image and text
    marginTop: hp(3), // Push the image slightly higher
  },
  title: {
    color: theme.colors.text,
    fontSize: hp(4.5),
    textAlign: "center",
    fontWeight: theme.fonts.extraBold,
    marginBottom: hp(2), // Consistent spacing for title
  },
  puchline: {
    textAlign: "center",
    paddingHorizontal: wp(10),
    fontSize: hp(2),
    color: theme.colors.text,
    marginBottom: hp(4), // Consistent spacing for text and button
  },
  appButtonContainer: {
    elevation: 8,
    backgroundColor: "#7A5AE4",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  appButtonText: {
    fontSize: 20,
    color: "#FFFFFF", // Fixed text color for better visibility
    fontWeight: "600",
    alignSelf: "center",
    textTransform: "none",
  },
});
