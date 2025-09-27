// signup.tsx
import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import Button from "../../components/button";
import Toast from 'react-native-toast-message';
import API from "../../Authentication/axiosInstance";
import { storage } from '../../utils/storage';

// 1. New: Import the required components from React Hook Form and Yup
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

// 2. New: Define the validation schema outside the component
const validationSchema = yup.object().shape({
  careseekerName: yup.string().required("Name is required"),
  phone: yup.string().matches(/^[0-9]{10}$/, 'Phone Number must be exactly 10 digits').required('Phone Number is required'),
  email: yup.string().email("Invalid email format").required("Email is required"),
  address: yup.string().required("Address is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .matches(/[a-z]/, "Password must contain a lowercase letter")
    .matches(/[A-Z]/, "Password must contain an uppercase letter")
    .matches(/\d/, "Password must contain a number")
    .matches(/[\W_]/, "Password must contain a special character")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm Password is required"),
});

const SignUp = () => {
  const router = useRouter();

  // 3. New: Use the useForm hook with the yup resolver
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
  });

  // 4. New: handleSignUp now receives valid form data as an argument
  const handleSignUp = async (data: any) => {
    try {
      const response = await API.post(
        "/careseeker",
        data
      );

      if (response.status === 201) {
        const { accessToken, refreshToken } = response.data;
        await storage.setItem("accessToken", accessToken);
        await storage.setItem("refreshToken", refreshToken);

        Toast.show({ type: "success", text1: "Registration successful" });
        router.push("/pages/Careseeker/MainFeed");
      }
    } catch (error: any) {
      console.error("Registration failed:", error);
      Toast.show({
        type: "error",
        text1: "Registration failed",
        text2: error.response?.data?.message || "Something went wrong",
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create an Account</Text>

      {/* 6. New: Use the Controller component to manage form inputs */}
      <Controller
        control={control}
        name="careseekerName"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Name"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
      />
      {errors.careseekerName && <Text style={styles.errorText}>{errors.careseekerName.message}</Text>}

      <Controller
        control={control}
        name="phone"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Phone"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            keyboardType="phone-pad"
          />
        )}
      />
      {errors.phone && <Text style={styles.errorText}>{errors.phone.message}</Text>}

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Email"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            keyboardType="email-address"
          />
        )}
      />
      {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}

      <Controller
        control={control}
        name="address"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Address"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
      />
      {errors.address && <Text style={styles.errorText}>{errors.address.message}</Text>}

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Password"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            secureTextEntry
          />
        )}
      />
      {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}

      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            secureTextEntry
          />
        )}
      />
      {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>}

      <Button title="Sign Up" onPress={handleSubmit(handleSignUp)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#87CEFA",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#fff",
  },
  input: {
    width: "100%",
    height: 40,
    borderColor: "#f5f5f5",
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  errorText: {
    color: "red",
    alignSelf: "flex-start",
    marginBottom: 5,
    marginLeft: "10%",
  },
});

export default SignUp;