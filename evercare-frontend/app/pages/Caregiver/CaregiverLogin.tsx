import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { TouchableOpacity } from "react-native-gesture-handler";
import axios from "axios";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { storage } from '../../utils/storage';

const CaregiverLogin = () => {
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
      console.log("Email:", email.trim());
      console.log("Making request to: http://192.168.176.11:5001/caregiver/login");

      const response = await axios.post(
        "http://192.168.176.11:5001/caregiver/login",
        {
          email: email.trim(),
          password: password.trim(),
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

     
      console.log("Response:", response.data);
      console.log("User data:", response.data.user);
      console.log("caregiverId:", response.data.user?.caregiverId);

      if (response.status === 200) {
        const { accessToken, refreshToken, user: userData } = response.data;

        // Save JWT tokens securely
        await storage.setItem("accessToken", accessToken);
        await storage.setItem("refreshToken", refreshToken);

        // Save user data to AsyncStorage for future use
        const userDataToStore = {
          id: userData.caregiverId,
          caregiverId: userData.caregiverId,
          name: userData.caregiverName,
          email: userData.email,
          district: userData.district,
          userType: "caregiver",
        };

        await AsyncStorage.setItem(
          "currentUser",
          JSON.stringify(userDataToStore)
        );
        console.log("Saved caregiver data to AsyncStorage:", userDataToStore);

        Toast.show({
          type: "success",
          text1: "Login Successful",
          text2: `Welcome back, ${userData.caregiverName || "Caregiver"}!`,
        });

        // Navigate to caregiver main feed with user data
        router.push({
          pathname: "/pages/Caregiver/CaregiverMainFeed",
          params: {
            caregiverId: userData.caregiverId?.toString(),
            caregiverName: userData.caregiverName,
            email: userData.email,
            district: userData.district,
          },
        });
      }
    } catch (error: any) {
      console.error("Caregiver login error:", error);

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
        {isLoading ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#87CEFA",
    paddingTop: 10,
  },
  input: {
    width: "80%",
    height: 60,
    backgroundColor: "#f5f5f5",
    marginBottom: 25,
    padding: 15,
    borderRadius: 10,
    fontSize: 18,
  },
  title: {
    fontSize: 40,
    fontWeight: "bold",
    color: "white",
    marginBottom: 60,
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
    marginTop: 40,
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

export default CaregiverLogin;
