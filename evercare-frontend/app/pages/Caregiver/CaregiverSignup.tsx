import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
} from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from "expo-router";
import axios from "axios";
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { storage } from '../../utils/storage';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { caregiverSignupSchema, CaregiverSignupFormData } from '../../components/caregiverValidationSchema';

const SignUp = () => {
  // --- NO CHANGES TO ANY LOGIC OR STATE ---
  const [step, setStep] = useState<"form" | "verification">("form");
  const router = useRouter();

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    trigger,
  } = useForm<CaregiverSignupFormData>({
    resolver: yupResolver(caregiverSignupSchema),
    mode: 'onChange',
    defaultValues: {
      caregiverName: '',
      dateOfBirth: '',
      phone: '',
      email: '',
      district: '',
      nic: '',
      password: '',
      confirmPassword: '',
      idPhoto: '',
      caregiverPhoto: '',
    },
  });

  const handleUploadPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setUploadedImage(result.assets[0].uri);
        setValue('idPhoto', result.assets[0].uri);
        trigger('idPhoto');
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera permission is required to take a photo.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
      if (!result.canceled) {
        setCapturedImage(result.assets[0].uri);
        setValue('caregiverPhoto', result.assets[0].uri);
        trigger('caregiverPhoto');
      }
    } catch (error) {
      Alert.alert("Error", "Failed to take a photo.");
    }
  };

  const handleNextStep = async () => {
    const formIsValid = await trigger([
      "caregiverName", "dateOfBirth", "phone", "email",
      "district", "nic", "password", "confirmPassword",
    ]);
    if (formIsValid) {
      setStep("verification");
    } else {
      Toast.show({
        type: "error",
        text1: "Validation failed",
        text2: "Please correct the errors in the form.",
      });
    }
  };

  const onSubmit = async (data: CaregiverSignupFormData) => {
    try {
      const response = await axios.post(
        "http://192.168.176.11:5001/caregiver", data,
        { headers: { "Content-Type": "application/json" } }
      );
      if (response.status === 201) {
        const { accessToken, refreshToken } = response.data;
        await storage.setItem("accessToken", accessToken);
        await storage.setItem("refreshToken", refreshToken);
        Toast.show({ type: "success", text1: "Registration successful" });
        router.push("/pages/Caregiver/CaregiverMainFeed");
      }
    } catch (error: any) {
      console.error("Registration failed:", error);
      Toast.show({
        type: "error", text1: "Registration failed",
        text2: error.response?.data?.message || "Something went wrong"
      });
    }
  };
  // --- END OF UNCHANGED LOGIC ---


  // --- START OF NEW UI CODE ---
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.background}>
            {/* Decorative Circles */}
            <View style={[styles.circle, styles.circleOne]} />
            <View style={[styles.circle, styles.circleTwo]} />
            <View style={[styles.circle, styles.circleThree]} />

            {/* Form Container */}
            <View style={styles.formContainer}>
                {step === "form" ? (
                <>
                    <Text style={styles.title}>Create an Account</Text>
                    <Text style={styles.stepIndicator}>Step 1 of 2: Personal Details</Text>

                    <Controller control={control} name="caregiverName" render={({ field: { onChange, onBlur, value } }) => (
                    <View style={styles.inputWrapper}>
                        <TextInput style={[styles.input, errors.caregiverName && styles.inputError]} placeholder="Full Name" placeholderTextColor="#4A5568" onBlur={onBlur} onChangeText={onChange} value={value} />
                        {errors.caregiverName && <Text style={styles.errorText}>{errors.caregiverName.message}</Text>}
                    </View>
                    )}/>
                    <Controller control={control} name="dateOfBirth" render={({ field: { onChange, onBlur, value } }) => (
                    <View style={styles.inputWrapper}>
                        <TextInput style={[styles.input, errors.dateOfBirth && styles.inputError]} placeholder="Date of Birth (YYYY-MM-DD)" placeholderTextColor="#4A5568" onBlur={onBlur} onChangeText={onChange} value={value} />
                        {errors.dateOfBirth && <Text style={styles.errorText}>{errors.dateOfBirth.message}</Text>}
                    </View>
                    )}/>
                    <Controller control={control} name="phone" render={({ field: { onChange, onBlur, value } }) => (
                    <View style={styles.inputWrapper}>
                        <TextInput style={[styles.input, errors.phone && styles.inputError]} placeholder="Phone" placeholderTextColor="#4A5568" onBlur={onBlur} onChangeText={onChange} value={value} keyboardType="phone-pad" />
                        {errors.phone && <Text style={styles.errorText}>{errors.phone.message}</Text>}
                    </View>
                    )}/>
                    <Controller control={control} name="email" render={({ field: { onChange, onBlur, value } }) => (
                    <View style={styles.inputWrapper}>
                        <TextInput style={[styles.input, errors.email && styles.inputError]} placeholder="Email" placeholderTextColor="#4A5568" onBlur={onBlur} onChangeText={onChange} value={value} keyboardType="email-address" autoCapitalize="none" />
                        {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
                    </View>
                    )}/>
                    <Controller control={control} name="district" render={({ field: { onChange, onBlur, value } }) => (
                    <View style={styles.inputWrapper}>
                        <TextInput style={[styles.input, errors.district && styles.inputError]} placeholder="District" placeholderTextColor="#4A5568" onBlur={onBlur} onChangeText={onChange} value={value} />
                        {errors.district && <Text style={styles.errorText}>{errors.district.message}</Text>}
                    </View>
                    )}/>
                    <Controller control={control} name="nic" render={({ field: { onChange, onBlur, value } }) => (
                    <View style={styles.inputWrapper}>
                        <TextInput style={[styles.input, errors.nic && styles.inputError]} placeholder="NIC Number" placeholderTextColor="#4A5568" onBlur={onBlur} onChangeText={onChange} value={value} />
                        {errors.nic && <Text style={styles.errorText}>{errors.nic.message}</Text>}
                    </View>
                    )}/>
                    <Controller control={control} name="password" render={({ field: { onChange, onBlur, value } }) => (
                    <View style={styles.inputWrapper}>
                        <TextInput style={[styles.input, errors.password && styles.inputError]} placeholder="Password" placeholderTextColor="#4A5568" onBlur={onBlur} onChangeText={onChange} value={value} secureTextEntry />
                        {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
                    </View>
                    )}/>
                    <Controller control={control} name="confirmPassword" render={({ field: { onChange, onBlur, value } }) => (
                    <View style={styles.inputWrapper}>
                        <TextInput style={[styles.input, errors.confirmPassword && styles.inputError]} placeholder="Confirm Password" placeholderTextColor="#4A5568" onBlur={onBlur} onChangeText={onChange} value={value} secureTextEntry />
                        {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>}
                    </View>
                    )}/>

                    <TouchableOpacity style={styles.primaryButton} onPress={handleNextStep}>
                    <Text style={styles.primaryButtonText}>Next</Text>
                    </TouchableOpacity>
                </>
                ) : (
                <>
                    <Text style={styles.title}>Photo Verification</Text>
                    <Text style={styles.stepIndicator}>Step 2 of 2: Upload Photos</Text>

                    <TouchableOpacity style={styles.photoBox} onPress={handleUploadPhoto}>
                    {uploadedImage ? (
                        <Image source={{ uri: uploadedImage }} style={styles.image} />
                    ) : (
                        <>
                        <Ionicons name="cloud-upload-outline" size={32} color="#1E3A8A" />
                        <Text style={styles.photoText}>Upload your ID Photo</Text>
                        </>
                    )}
                    </TouchableOpacity>
                    {errors.idPhoto && <Text style={styles.errorText}>{errors.idPhoto.message}</Text>}

                    <TouchableOpacity style={styles.photoBox} onPress={handleTakePhoto}>
                    {capturedImage ? (
                        <Image source={{ uri: capturedImage }} style={styles.image} />
                    ) : (
                        <>
                        <Ionicons name="camera-outline" size={32} color="#1E3A8A" />
                        <Text style={styles.photoText}>Take your real-time photo</Text>
                        </>
                    )}
                    </TouchableOpacity>
                    {errors.caregiverPhoto && <Text style={styles.errorText}>{errors.caregiverPhoto.message}</Text>}

                    <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.secondaryButton} onPress={() => setStep("form")}>
                        <Text style={styles.secondaryButtonText}>Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit(onSubmit)}>
                        <Text style={styles.primaryButtonText}>Submit</Text>
                    </TouchableOpacity>
                    </View>
                </>
                )}
            </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// --- START OF NEW STYLESHEET ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#87CEFA",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  background: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#87CEFA',
    overflow: 'hidden',
    position: 'relative',
  },
  formContainer: {
    width: '90%',
    alignItems: 'center',
    zIndex: 1,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  stepIndicator: {
    fontSize: 16,
    color: '#EBF8FF',
    textAlign: 'center',
    marginBottom: 25,
  },
  inputWrapper: {
    width: '100%',
    marginBottom: 12,
  },
  input: {
    height: 50,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    borderColor: '#A0AEC0',
    borderWidth: 1,
    color: '#2D3748',
  },
  inputError: {
    borderColor: '#E53E3E',
    borderWidth: 1.5,
  },
  errorText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 5,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
    width: '100%',
    marginTop: 10,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingVertical: 13,
    borderRadius: 30,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
    marginTop: 10,
    width: '100%',
  },
  photoBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    height: 150,
    width: '100%',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  photoText: {
    marginTop: 8,
    fontSize: 14,
    color: '#1E3A8A',
    fontWeight: '500',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  // --- Decorative Circles ---
  circle: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 999,
    zIndex: 0,
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
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  circleThree: {
    width: 150,
    height: 150,
    bottom: '25%',
    left: -50,
  },
});

export default SignUp;