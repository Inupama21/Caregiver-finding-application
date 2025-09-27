import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  KeyboardTypeOptions,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { bookingService } from "../../../services/bookingService";

const BooknowForm = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const { getUserId } = useCurrentUser();

  type BookNowRouteParams = {
    caregiverName?: string;
    caregiverRate?: string;
    caregiverId?: string;
  };

  const route =
    useRoute<RouteProp<Record<string, BookNowRouteParams>, string>>();
  const caregiverName = route.params?.caregiverName || "Anne Smith";
  const caregiverRate = route.params?.caregiverRate || "$25/hr";
  const caregiverId = route.params?.caregiverId
    ? Number(route.params.caregiverId)
    : 1;

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default to 1 week from now
    expectedDays: "",
    patientDescription: "",
    paymentMethod: "Credit Card",
  });

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  type FormErrors = Partial<Record<keyof typeof formData, string>>;
  const [errors, setErrors] = useState<FormErrors>({});

  const paymentMethods = ["Credit Card", "Debit Card"];

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!/^\d{10,}$/.test(formData.phone.replace(/\D/g, "")))
      newErrors.phone = "Please enter a valid phone number";

    if (formData.startDate >= formData.endDate) {
      newErrors.startDate = "Start date must be before end date";
    }

    if (!formData.expectedDays.trim())
      newErrors.expectedDays = "Expected days is required";
    if (!formData.patientDescription.trim())
      newErrors.patientDescription = "Patient description is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  type FormField = keyof typeof formData;

  const handleInputChange = (field: FormField, value: string | Date) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      handleInputChange("startDate", selectedDate);
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      handleInputChange("endDate", selectedDate);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      "Cancel Booking",
      "Are you sure you want to cancel? All entered information will be lost.",
      [
        { text: "Continue Booking", style: "cancel" },
        {
          text: "Cancel",
          style: "destructive",
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const handleBookNow = async () => {
    if (validateForm()) {
      try {
        // Get careseeker ID from current user
        const careseekerId = getUserId();
        if (!careseekerId) {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "Please login to make a booking",
          });
          return;
        }

        const bookingData = {
          caregiverId,
          careseekerId,
          name: formData.name,
          address: formData.address,
          phone: formData.phone,
          startDate: formData.startDate.toISOString(),
          endDate: formData.endDate.toISOString(),
          expectedDays: formData.expectedDays,
          patientDescription: formData.patientDescription,
          paymentMethod: formData.paymentMethod,
          caregiverName,
          caregiverRate,
        };

        // Create booking with pending status
        const booking = await bookingService.createBooking(bookingData);
        
        // Show success message
        Toast.show({
          type: "success",
          text1: "Booking Request Sent!",
          text2: `Your booking request has been sent to ${caregiverName}. You will be notified when they respond.`,
        });

        // Navigate back to previous screen or to a booking confirmation screen
        setTimeout(() => {
          navigation.goBack();
        }, 2000);
        
      } catch (error) {
        Toast.show({
          type: "error",
          text1: "Booking Failed",
          text2: "Something went wrong. Please try again.",
        });
      }
    }
  };

  const inputFields: {
    label: string;
    field: FormField;
    placeholder: string;
    keyboardType?: KeyboardTypeOptions;
    multiline?: boolean;
    lines?: number;
  }[] = [
    { label: "Name", field: "name", placeholder: "Enter your full name" },
    {
      label: "Address",
      field: "address",
      placeholder: "Enter your address",
      multiline: true,
      lines: 3,
    },
    {
      label: "Phone",
      field: "phone",
      placeholder: "Enter your phone number",
      keyboardType: "phone-pad",
    },
    {
      label: "Expected Days to receive service",
      field: "expectedDays",
      placeholder: "e.g., Monday to Friday, 2 weeks",
    },
    {
      label: "Description of patient",
      field: "patientDescription",
      placeholder: "Describe patient's condition",
      multiline: true,
      lines: 4,
    },
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1E3A8A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Now</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Caregiver Info Card */}
      <View style={styles.caregiverCard}>
        <View style={styles.caregiverInfo}>
          <View style={styles.caregiverAvatar}>
            <Ionicons name="person" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.caregiverDetails}>
            <Text style={styles.caregiverName}>{caregiverName}</Text>
            <Text style={styles.caregiverRate}>{caregiverRate}</Text>
          </View>
        </View>
        <View style={styles.verifiedBadge}>
          <Ionicons name="checkmark-circle" size={16} color="#10B981" />
          <Text style={styles.verifiedText}>Verified</Text>
        </View>
      </View>

      <ScrollView
        style={styles.formContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Input Fields */}
        {inputFields.map(
          ({ label, field, placeholder, keyboardType, multiline, lines }) => (
            <View style={styles.inputGroup} key={field}>
              <Text style={styles.label}>{label}</Text>
              <TextInput
                style={[
                  styles.input,
                  multiline && styles.textArea,
                  errors[field] && styles.inputError,
                ]}
                placeholder={placeholder}
                value={
                  field === "startDate" || field === "endDate"
                    ? ""
                    : formData[field]
                }
                onChangeText={(value) => handleInputChange(field, value)}
                multiline={multiline}
                numberOfLines={lines}
                textAlignVertical={multiline ? "top" : "center"}
                keyboardType={keyboardType}
                placeholderTextColor="#94A3B8"
              />
              {errors[field] && (
                <Text style={styles.errorText}>{errors[field]}</Text>
              )}
            </View>
          )
        )}

        {/* Start Date Picker */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Start Date</Text>
          <TouchableOpacity
            style={[styles.dateInput, errors.startDate && styles.inputError]}
            onPress={() => setShowStartDatePicker(true)}
          >
            <Text style={styles.dateText}>
              {formData.startDate.toLocaleDateString()}
            </Text>
            <Ionicons name="calendar-outline" size={20} color="#64748B" />
          </TouchableOpacity>
          {errors.startDate && (
            <Text style={styles.errorText}>{errors.startDate}</Text>
          )}
        </View>

        {/* End Date Picker */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>End Date</Text>
          <TouchableOpacity
            style={[styles.dateInput, errors.endDate && styles.inputError]}
            onPress={() => setShowEndDatePicker(true)}
          >
            <Text style={styles.dateText}>
              {formData.endDate.toLocaleDateString()}
            </Text>
            <Ionicons name="calendar-outline" size={20} color="#64748B" />
          </TouchableOpacity>
          {errors.endDate && (
            <Text style={styles.errorText}>{errors.endDate}</Text>
          )}
        </View>

        {/* Date Pickers */}
        {showStartDatePicker && (
          <DateTimePicker
            value={formData.startDate}
            mode="date"
            display="default"
            onChange={handleStartDateChange}
            minimumDate={new Date()}
          />
        )}

        {showEndDatePicker && (
          <DateTimePicker
            value={formData.endDate}
            mode="date"
            display="default"
            onChange={handleEndDateChange}
            minimumDate={formData.startDate}
          />
        )}

        {/* Payment Method */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Payment method</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.paymentMethod}
              onValueChange={(value) =>
                handleInputChange("paymentMethod", value)
              }
              style={styles.picker}
            >
              {paymentMethods.map((method) => (
                <Picker.Item key={method} label={method} value={method} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Terms */}
        <View style={styles.termsContainer}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color="#64748B"
          />
          <Text style={styles.termsText}>
            By proceeding, you agree to our Terms of Service and Privacy Policy.
            Payment will be processed after service confirmation.
          </Text>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bookButton} onPress={handleBookNow}>
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FBFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E3F2FD",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1E3A8A",
  },
  caregiverCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#4A90E2",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  caregiverInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  caregiverAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#4A90E2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  caregiverDetails: {
    flex: 1,
  },
  caregiverName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E3A8A",
    marginBottom: 4,
  },
  caregiverRate: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  verifiedText: {
    fontSize: 12,
    color: "#10B981",
    fontWeight: "500",
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E3A8A",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E3F2FD",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1E3A8A",
    shadowColor: "#4A90E2",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  textArea: {
    height: 80,
    paddingTop: 12,
  },
  inputError: {
    borderColor: "#EF4444",
    borderWidth: 2,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 14,
    marginTop: 4,
    marginLeft: 4,
  },
  pickerContainer: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E3F2FD",
    borderRadius: 12,
    shadowColor: "#4A90E2",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  picker: {
    height: 50,
    color: "#1E3A8A",
  },
  termsContainer: {
    flexDirection: "row",
    backgroundColor: "#F0F9FF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 12,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: "#64748B",
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E3F2FD",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#EF4444",
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    color: "#EF4444",
    fontSize: 16,
    fontWeight: "600",
  },
  bookButton: {
    flex: 1,
    backgroundColor: "#4A90E2",
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  bookButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  dateInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#1E293B",
  },
  dateText: {
    fontSize: 16,
    color: "#1E293B",
  },
});

export default BooknowForm;
