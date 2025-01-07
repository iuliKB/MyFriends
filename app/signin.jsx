import { router } from "expo-router";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { hp, wp } from "../helpers/common";

const Signin = () => {
  const handleLogin = () => {
    // Handle login logic
    router.push("homepage");
  };

  return (
    <LinearGradient
      colors={["#FFBE98", "#FF8FAB"]}
      style={styles.gradientBackground}
    >
      <View style={styles.container}>
        <Image
          source={require("../assets/images/Saly-25.png")}
          style={styles.image}
        />
        <View style={styles.form}>
          <Text style={styles.title}>Sign in</Text>
          <TextInput
            placeholder="Email address"
            placeholderTextColor="#aaa"
            keyboardType="email-address"
            style={styles.input}
          />
          <TextInput
            placeholder="Password"
            placeholderTextColor="#aaa"
            secureTextEntry={true}
            style={styles.input}
          />
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Log In</Text>
          </TouchableOpacity>
          <Text style={styles.footerText}>
            Don't have an account?{" "}
            <Text
              style={styles.link}
              onPress={() => router.push("signup")}
            >
              Sign up
            </Text>
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
};
const styles = StyleSheet.create({
    gradientBackground: {
      flex: 1,
    },
    container: {
      flex: 1,
      justifyContent: "flex-start", // Push content towards the top
      alignItems: "center",
      paddingHorizontal: wp(5),
      paddingTop: hp(6), // Slightly reduce top padding
    },
    image: {
      width: wp(80), // Increase image width to 80% of screen width
      height: hp(40), // Proportional height for larger image
      alignSelf: "center",
      marginBottom: hp(1), // Reduce spacing below the image
      resizeMode: "contain", // Maintain aspect ratio
    },
    form: {
      width: "100%",
      backgroundColor: "rgba(255, 255, 255, 0.4)", // More transparency for the form
      borderRadius:30,
      padding: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      color: "#333",
      textAlign: "center",
      marginBottom: 20,
    },
    input: {
      backgroundColor: "rgba(225, 225, 225, 0.3)",
      borderRadius: 20,
      padding: 10,
      marginBottom: 15,
      fontSize: 16,
      borderColor: "#ddd",
      borderWidth: 1,
    },
    button: {
      backgroundColor: "#7F56D9",
      paddingVertical: 15,
      borderRadius: 20,
      alignItems: "center",
      marginBottom: 10,
    },
    buttonText: {
      color: "#FFF",
      fontSize: 18,
      fontWeight: "600",
    },
    footerText: {
      textAlign: "center",
      fontSize: 14,
      color: "#555",
    },
    link: {
      color: "#7F56D9",
      fontWeight: "bold",
    },
  });
  
  export default Signin;
  


