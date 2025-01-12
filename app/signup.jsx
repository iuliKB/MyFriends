// import { router } from "expo-router"
// import {StyleSheet, View, Image, Text, TextInput, Button } from "react-native"
// import ScreenWrapper from "../components/ScreenWrapper"
// import { LinearGradient } from "expo-linear-gradient";
// import { hp, wp } from "../helpers/common";
// import { theme } from "../constants/theme";

// const Signup = () => {
//     const handleRegister = () => {
//         // if errors -> display error message

//         router.push('homepage');
//     }

//     return (
//         <>
//         <LinearGradient
//         colors={["#FFD6A5", "#FF8FAB"]}
//         style={styles.gradientBackground}
//       >      
//             <ScreenWrapper bg="#FFBE98">
//                 <View> 
//                  <Image
//                     style={styles.startImage}
//                     resizeMode="contain"
//                     source={require("../assets/images/Saly-12.png")}
//             />
//                     <View>
//                         <Text>Sign up</Text>
//                         <TextInput placeholder="email" keyboardType="email-address"/>
//                         <TextInput placeholder="username"/>
//                         <TextInput placeholder="name"/>
//                         <TextInput placeholder="password" textContentType="password"/>
//                         <Button title="Create account" onPress={handleRegister}/>
//                         <Text>Already have an account? <Button title="Sign in" onPress={() => router.push('signin')}/></Text>
//                     </View>
//                 </View>
//             </ScreenWrapper>
//         </LinearGradient>
//         </>
//     )
// }

// export default Signup;

// const styles = StyleSheet.create({
//     gradientBackground: {
//       flex: 1,
//     },
//     container: {
//       flex: 1,
//       alignItems: "center",
//       justifyContent: "center",
//       paddingHorizontal: wp(4),
//     },
//     startImage: {
//       height: hp(40), // Adjusted to move higher
//       width: wp(110),
//       marginBottom: hp(2),
//       alignSelf: "center",
//     },
//     title: {
//       color: "#000",
//       fontSize: hp(3.5),
//       textAlign: "center",
//       fontWeight: "bold",
//       marginBottom: hp(2), // Moved closer to buttons
//     },
//     appButtonContainer: {
//       elevation: 8,
//       backgroundColor: "#7A5AE4",
//       borderRadius: 20,
//       paddingVertical: 10,
//       paddingHorizontal: 20,
//       width: wp(70),
//       marginBottom: hp(2), // Adjust spacing between buttons
//     },
//     appButtonText: {
//       fontSize: 18,
//       color: theme.colors.dark,
//       fontWeight: "600",
//       textAlign: "center",
//     },
//     continueline: {
//       textAlign: "center",
//       fontSize: hp(2),
//       color: theme.colors.dark,
//       marginBottom: hp(2),
//     },
//     socialIcons: {
//       flexDirection: "row",
//       justifyContent: "center",
//       alignItems: "center",
//       marginBottom: hp(4),
//     },
//     icon: {
//       width: wp(7),
//       height: wp(7),
//       marginHorizontal: wp(2),
//     },
//     puchline: {
//       textAlign: "center",
//       paddingHorizontal: wp(10),
//       fontSize: hp(2),
//       color: theme.colors.text,
//       marginBottom: hp(4), // Consistent spacing for text and button
//       fontWeight: theme.fonts.semibold,
//     },
// });

import { StyleSheet, View, Image, Text, TextInput, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { app } from "../firebaseConfig.js";
import { hp, wp } from "../helpers/common";
import { useState } from "react";



const Signup = () => {
    const [data, setData] = useState({
        email: "",
        username: "",
        phone: "",
        password: "",
    })

  const handleRegister = () => {
    // Navigate to homepage after successful registration
    const auth = getAuth(app);
    createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
    )
    .then((res) => {
        router.push("homepage");
    })
    .catch((err) => console.log("SignUp Error: " + err));
  };

  return (
    <LinearGradient
      colors={["#FFD6A5", "#FF8FAB"]}
      style={styles.gradientBackground}
    >
      <View style={styles.container}>
        <Image
          style={styles.image}
          resizeMode="contain"
          source={require("../assets/images/Saly-12.png")}
        />
        <View style={styles.form}>
          <Text style={styles.title}>Sign up</Text>
          <TextInput
            placeholder="Email address"
            placeholderTextColor="#aaa"
            keyboardType="email-address"
            style={styles.input}
            value={data.email}
            onChangeText={value => setData({
                ...data,
                "email": value
            })}
          />
          <TextInput
            placeholder="Username"
            placeholderTextColor="#aaa"
            style={styles.input}
            value={data.username}
            onChangeText={value => setData({
                ...data,
                "username": value
            })}
          />
          <TextInput
            placeholder="Phone number"
            placeholderTextColor="#aaa"
            keyboardType="phone-pad"
            style={styles.input}
            value={data.phone}
            onChangeText={value => setData({
                ...data,
                "phone": value
            })}
          />
          <TextInput
            placeholder="Password"
            placeholderTextColor="#aaa"
            secureTextEntry
            style={styles.input}
            value={data.password}
            onChangeText={value => setData({
                ...data,
                "password": value
            })}
          />
          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>Create account</Text>
          </TouchableOpacity>
          <Text style={styles.footerText}>
            Already have an account?{" "}
            <Text
              style={styles.link}
              onPress={() => router.push("signin")}
            >
              Sign in
            </Text>
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
};

export default Signup;

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: wp(5),
  },
  image: {
    width: wp(80),
    height: hp(40),
    alignSelf: "center",
    marginBottom: hp(1),
    resizeMode: "contain",
  },
  form: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderRadius: 30,
    padding: 20,
    shadowColor: "#555",
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
    backgroundColor: "rgba(225, 225, 225, 0.4)",
    borderRadius: 20,
    padding: 12,
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
