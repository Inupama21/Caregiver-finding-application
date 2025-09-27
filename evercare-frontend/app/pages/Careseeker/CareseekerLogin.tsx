import React, { useState } from "react";
import { View, TextInput, StyleSheet, Text, Button, Alert } from "react-native";
import { useRouter } from "expo-router";
import { TouchableOpacity } from "react-native-gesture-handler";
import axios from "axios";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "../../Authentication/axiosInstance";
import { storage } from '../../utils/storage';
const CareseekerLogin = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);




const handleLogin = async () => {
  if (!email.trim() || !password.trim()) {
    Toast.show({
      type: "error",
      text1: "Error",
      text2: "Please enter both email and password",
    });
    return;
  }

  setIsLoading(true);

  try {
    const response = await API.post("/careseeker/login", { 
      email: email.trim(), 
      password: password.trim() 
    });

    if (response.status === 200) {
      const { accessToken, refreshToken, user: userData } = response.data;

      // Save JWT tokens securely
      await storage.setItem("accessToken", accessToken);
      await storage.setItem("refreshToken", refreshToken);

      // Save user data to AsyncStorage for future use
      const userDataToStore = {
        id: userData.careseekerId,
        careseekerId: userData.careseekerId,
        name: userData.careseekerName,
        email: userData.email,
        district: userData.district,
        userType: "careseeker",
      };

      await AsyncStorage.setItem(
        "currentUser",
        JSON.stringify(userDataToStore)
      );
      console.log("Saved careseeker data to AsyncStorage:", userDataToStore);

      Toast.show({
        type: "success",
        text1: "Login Successful",
        text2: `Welcome back, ${userData.careseekerName || "Careseeker"}!`,
      });

      // Navigate to careseeker main feed
      router.push("/pages/Careseeker/MainFeed");
    }
  } catch (error: any) {
    console.error("Careseeker login error:", error);

    if (error.response?.status === 401) {
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: "Invalid email or password",
      });
    } else if (error.response?.status === 400) {
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: error.response.data.message || "Please check your input",
      });
    } else {
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: "Something went wrong. Please try again.",
      });
    }
  } finally {
    setIsLoading(false);
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back!</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? "Logging in..." : "Login"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center", // Changed from "center" to move everything up
    alignItems: "center",
    backgroundColor: "#87CEFA",
    paddingTop: 10, // Add padding to push title to top
  },
  input: {
    width: "80%",
    height: 60, // Increased from 50 to make inputs larger
    backgroundColor: "#f5f5f5",
    marginBottom: 25, // Increased from 15 for more space between inputs
    padding: 15, // Increased padding
    borderRadius: 10,
    fontSize: 18, // Add font size to make text larger
  },
  title: {
    fontSize: 40,
    fontWeight: "bold",
    color: "white",
    marginBottom: 60, // Increased from 20 to create more space after title
  },
  buttonText: {
    color: "white",
    fontSize: 23,
  },
  button: {
    width: 335,
    height: 50,
    backgroundColor: "#4A90E2",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
    marginTop: 40, // Increased from 20 to push button lower
    shadowColor: "#20B2AA",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    backgroundColor: "#A0A0A0",
    shadowOpacity: 0.1,
  },
});

export default CareseekerLogin;
