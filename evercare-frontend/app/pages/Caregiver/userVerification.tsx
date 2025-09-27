import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";

const router = useRouter();

const CreateAccount = () => {
  const navigation = useNavigation();
  const [uploadedImage, setUploadedImage] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);

  

  const handleUploadPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

    //   if (!result.canceled) {
    //     setUploadedImage(result.assets[0].uri);
    //   }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera permission is required to take photos');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

    //   if (!result.canceled) {
    //     setCapturedImage(result.assets[0].uri);
    //   }
    } catch (error) {
      Alert.alert("Error", "Failed to take photo");
    }
  };

  const handleSubmit = () => {
    if (!uploadedImage || !capturedImage) {
      Alert.alert("Missing Photos", "Please upload a photo and take a real-time photo");
      return;
    }
    
    // Handle submit logic here
    console.log("Account creation submitted");
    Alert.alert("Success", "Account created successfully!");
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <View style={styles.logoCircle}>
          <View style={styles.logoInner}>
            <Text style={styles.logoText}>★</Text>
          </View>
        </View>
        <Text style={styles.brandName}>EVERCARE</Text>
        <Text style={styles.brandSubtitle}>APPLICATION</Text>
      </View>

      {/* Title */}
      <Text style={styles.title}>Create an account</Text>

      {/* Upload Photo Section */}
      <TouchableOpacity style={styles.photoContainer} onPress={handleUploadPhoto}>
        {uploadedImage ? (
          <Image source={{ uri: uploadedImage }} style={styles.uploadedImage} />
        ) : (
          <>
            <Ionicons name="cloud-upload-outline" size={40} color="#666" />
            <Text style={styles.photoText}>Upload your ID Photo of both side</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Take Photo Section */}
      <TouchableOpacity style={styles.photoContainer} onPress={handleTakePhoto}>
        {capturedImage ? (
          <Image source={{ uri: capturedImage }} style={styles.uploadedImage} />
        ) : (
          <>
            <Ionicons name="camera-outline" size={40} color="#666" />
            <Text style={styles.photoText}>Take your real time photo</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        {/* <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}> */}
        <TouchableOpacity style={styles.submitButton} onPress={()=> router.push("/pages/Caregiver/CaregiverMainFeed")}>
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4A90E2',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#E3F2FD',
  },
  logoInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  brandName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginTop: 12,
    letterSpacing: 1,
  },
  brandSubtitle: {
    fontSize: 12,
    color: '#4A90E2',
    letterSpacing: 2,
    marginTop: 2,
  },
  title: {
    fontSize: 32,
    fontWeight: '300',
    color: '#87CEEB',
    marginBottom: 50,
    textAlign: 'center',
  },
  photoContainer: {
    width: '100%',
    height: 120,
    backgroundColor: '#F5F5F5',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 13,
  },
  photoText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 40,
    gap: 20,
  },
  cancelButton: {
    flex: 1,
    height: 50,
    backgroundColor: '#FF6B6B',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B6B',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  submitButton: {
    flex: 1,
    height: 50,
    backgroundColor: '#87CEEB',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#87CEEB',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CreateAccount;