import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import Button from "../components/button"; // Assuming your custom button component exists

const UserPath = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* The top image area */}
      <ImageBackground
        // IMPORTANT: Replace this with your own image path
        source={require("../../assets/images/background.jpg")}
        style={styles.imageBackground}
        resizeMode="cover"
      />

      {/* The bottom card with content and buttons */}
      <View style={styles.bottomContainer}>
        {/* This is the decorative semi-circle element */}
        <View style={styles.decorativeCircle} />

        <Text style={styles.title}>Your Partner in Care,{"\n"}Made Simple</Text>
        {/* <Text style={styles.subtitle}>
          We bridge the gap between families and trusted caregivers. Choose your
          role to get started.
        </Text> */}

        {/* Your three role selection buttons */}
        <View style={styles.buttonContainer}>
          <Button
            title="Caregiver"
            onPress={() => router.push("/pages/Caregiver/CaregiverGetStarted")}
          />
          <Button
            title="Care-seeker"
            onPress={() =>
              router.push("/pages/Careseeker/CareseekerGetStarted")
            }
          />
          <Button
            title="Admin"
            onPress={() => router.push("/pages/Admin/AdminLogin")}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#87CEFA", // A dark blue to match the theme
  },
  imageBackground: {
    flex: 0.55, // Takes up the top 55% of the screen
    justifyContent: "center",
  },
  bottomContainer: {
    flex: 0.45, // Takes up the bottom 45% of the screen
    backgroundColor: "#87CEFA", // A slightly lighter blue than the container
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 25,
    paddingTop: 30,
    alignItems: "center",
    overflow: 'hidden', // Hides the part of the circle that goes off-screen
  },
  decorativeCircle: {
    position: 'absolute',
    bottom: -120,
    left: '50%',
    marginLeft: -125, // Half of the width to center it
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(37, 99, 235, 0.5)', // A semi-transparent blue
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 16,
    color: "#D1D5DB", // A light gray for contrast
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 24,
  },
  buttonContainer: {
    width: "100%",
    gap: 15, // Creates space between your buttons
    zIndex: 1, // Ensures buttons are on top of the decorative circle
  },
});

export default UserPath;