import React, { useState } from "react";
import { router } from "expo-router";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../AuthContext";
import { hp, wp } from "../helpers/common";

const Signin = () => {
	const { signIn } = useAuth(); // Get the signIn function from AuthContext
	const [data, setData] = useState({ email: "", password: "" });
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const handleLogin = async () => {
		if (!data.email || !data.password) {
			setError("Please enter both email and password.");
			return;
		}

		setLoading(true);
		setError("");

		try {
			await signIn(data.email, data.password);
			router.push("homepage");
		} catch (err) {
			setError("Invalid email or password. Please try again.");
			console.log("SignIn Error: ", err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<LinearGradient colors={["#fbae52", "#dd528d", "#ff8c79"]} style={styles.gradientBackground}>
			<View style={styles.container}>
				<Image source={require("../assets/images/Saly-25.png")} style={styles.image} />
				<View style={styles.form}>
					<Text style={styles.title}>Sign in</Text>
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
						placeholder="Password"
						placeholderTextColor="#aaa"
						secureTextEntry={true}
						style={styles.input}
						value={data.password}
						onChangeText={(value) => setData({ ...data, password: value })}
					/>
					{loading ? (
						<ActivityIndicator size="large" color="#7F56D9" />
					) : (
						<TouchableOpacity style={styles.button} onPress={handleLogin}>
							<Text style={styles.buttonText}>Log In</Text>
						</TouchableOpacity>
					)}
					<Text style={styles.footerText}>
						Don't have an account?{" "}
						<Text style={styles.link} onPress={() => router.push("signup")}>
							Sign up
						</Text>
					</Text>
				</View>
			</View>
		</LinearGradient>
	);
};

const styles = StyleSheet.create({
	gradientBackground: { flex: 1 },
	container: {
		flex: 1,
		justifyContent: "flex-start",
		alignItems: "center",
		paddingHorizontal: wp(5),
		paddingTop: hp(6),
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
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.2,
		shadowRadius: 4,
	},
	title: { fontSize: 28, fontWeight: "bold", color: "#333", textAlign: "center", marginBottom: 20 },
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
	buttonText: { color: "#FFF", fontSize: 18, fontWeight: "600" },
	footerText: { textAlign: "center", fontSize: 14, color: "#555" },
	link: { color: "#7F56D9", fontWeight: "bold" },
	errorText: { color: "red", fontSize: 14, textAlign: "center", marginBottom: 10 },
});

export default Signin;
