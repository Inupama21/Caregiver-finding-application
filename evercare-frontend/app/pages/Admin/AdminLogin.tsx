import React, { useState } from "react";
import { View, TextInput, StyleSheet, Text, Button, Alert } from "react-native";
import { useRouter } from "expo-router";
import { TouchableOpacity } from "react-native-gesture-handler";
import axios from "axios";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "../../Authentication/axiosInstance";
import { storage } from '../../utils/storage';
const AdminLogin = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);




const handleLogin = async () => {
  try {
    setIsLoading(true);
    const response = await API.post("/admin/login", { email, password });

    if (response.status === 200) {
      const { accessToken, refreshToken } = response.data;
      await storage.setItem("accessToken", accessToken);
      await storage.setItem("refreshToken", refreshToken);
      await storage.setItem("userType", "admin");
      Toast.show({ type: "success", text1: "Admin login successful" });
      router.push("/pages/Admin/AdminMainScreen");
    }
  } catch (error) {
    console.error("Admin login failed:", error);
    Toast.show({
      type: "error",
      text1: "Admin login failed",
      text2: "Invalid email or password",
    });
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

export default AdminLogin;
