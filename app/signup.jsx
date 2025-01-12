import React, { useState } from "react";
import { StyleSheet, View, Image, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../AuthContext"; // Import useAuth to access the context
import { hp, wp } from "../helpers/common";

const Signup = () => {
  const { signUp } = useAuth(); // Access signUp method from AuthContext
  const [data, setData] = useState({
    email: "",
    username: "",
    phone: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    if (!data.email || !data.password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await signUp(data.email, data.password);
      router.push("homepage"); // Navigate to homepage on success
    } catch (err) {
      setError("Failed to create an account. Please try again.");
      console.log("SignUp Error: ", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#FFD6A5", "#FF8FAB"]} style={styles.gradientBackground}>
      <View style={styles.container}>
        <Image style={styles.image} resizeMode="contain" source={require("../assets/images/Saly-12.png")} />
        <View style={styles.form}>
          <Text style={styles.title}>Sign up</Text>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <TextInput
            placeholder="Email address"
            placeholderTextColor="#aaa"
            keyboardType="email-address"
            style={styles.input}
            value={data.email}
            onChangeText={(value) => setData({ ...data, email: value })}
          />
          <TextInput
            placeholder="Username"
            placeholderTextColor="#aaa"
            style={styles.input}
            value={data.username}
            onChangeText={(value) => setData({ ...data, username: value })}
          />
          <TextInput
            placeholder="Phone number"
            placeholderTextColor="#aaa"
            keyboardType="phone-pad"
            style={styles.input}
            value={data.phone}
            onChangeText={(value) => setData({ ...data, phone: value })}
          />
          <TextInput
            placeholder="Password"
            placeholderTextColor="#aaa"
            secureTextEntry
            style={styles.input}
            value={data.password}
            onChangeText={(value) => setData({ ...data, password: value })}
          />
          {loading ? (
            <ActivityIndicator size="large" color="#7F56D9" />
          ) : (
            <TouchableOpacity style={styles.button} onPress={handleRegister}>
              <Text style={styles.buttonText}>Create account</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.footerText}>
            Already have an account?{" "}
            <Text style={styles.link} onPress={() => router.push("signin")}>
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
  gradientBackground: { flex: 1 },
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
  title: { fontSize: 28, fontWeight: "bold", color: "#333", textAlign: "center", marginBottom: 20 },
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
  buttonText: { color: "#FFF", fontSize: 18, fontWeight: "600" },
  footerText: { textAlign: "center", fontSize: 14, color: "#555" },
  link: { color: "#7F56D9", fontWeight: "bold" },
  errorText: { color: "red", fontSize: 14, textAlign: "center", marginBottom: 10 },
});
