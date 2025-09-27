import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";

const CareseekerGetStarted = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Decorative Circles in the background */}
      <View style={[styles.circle, styles.circleOne]} />
      <View style={[styles.circle, styles.circleTwo]} />
      <View style={[styles.circle, styles.circleThree]} />

      {/* Main content container */}
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Get Started</Text>
        <Text style={styles.subtitle}>
          Sign up or log in to find the best care for your loved ones.
        </Text>

        {/* Action Buttons */}
        <View style={styles.buttonWrapper}>
          {/* Primary Button: Sign Up */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push("/pages/Caregiver/CaregiverSignup")} 
          >
            <Text style={styles.primaryButtonText}>Sign Up</Text>
          </TouchableOpacity>

          {/* Secondary Button: Login with Border */}
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push("/pages/Caregiver/CaregiverLogin")}
          >
            <Text style={styles.secondaryButtonText}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#87CEFA", 
    overflow: "hidden",
  },
  // --- Decorative Circles ---
  circle: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.3)", 
    borderRadius: 999,
  },
  circleOne: {
    width: 400,
    height: 400,
    top: -150,
    left: -100,
  },
  circleTwo: {
    width: 300,
    height: 300,
    bottom: -120,
    right: -120,
    backgroundColor: "rgba(255, 255, 255, 0.4)", // Slightly more opaque
  },
  circleThree: {
    width: 150,
    height: 150,
    bottom: 80,
    left: -40,
  },
  // --- Main Content ---
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
    zIndex: 1,
  },
  title: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#1E3A8A", 
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#1E40AF", 
    textAlign: "center",
    marginBottom: 60,
  },
  // --- Buttons ---
  buttonWrapper: {
    width: "100%",
  },
  primaryButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    paddingVertical: 13,
    borderRadius: 30,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#3B82F6",
  },
  secondaryButtonText: {
    color: "#1E3A8A", 
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default CareseekerGetStarted;