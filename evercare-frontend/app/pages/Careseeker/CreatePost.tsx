import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import Toast from "react-native-toast-message";
import { useRouter, useLocalSearchParams } from "expo-router";
import BottomNavBar from "../../components/careseekerbottomNavBar";

const CreatePost = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const { getUserId, user } = useCurrentUser();

  // Get user data from navigation params
  const params = useLocalSearchParams();
  const careseekerId = getUserId()?.toString() || (params.careseekerId as string) || "1"; // Use real user ID
  const careseekerName = user?.name || (params.careseekerName as string) || "User";
  const email = user?.email || (params.email as string) || "";

  // Debug logs
  console.log("=== CreatePost Debug ===");
  console.log("params:", params);
  console.log("careseekerId:", careseekerId);
  console.log("careseekerId type:", typeof careseekerId);
  console.log("=======================");

  const [caregiverName, setName] = useState("");
  const [age, setPatientAge] = useState("");
  const [careType, setCareType] = useState("");
  const [duration, setDuration] = useState("");
  const [district, setDistrict] = useState("");
  const [urgency, setUrgency] = useState("");
  const [description, setDescription] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const districts = [
    "Select District",
    "Colombo",
    "Gampaha",
    "Kalutara",
    "Kandy",
    "Matale",
    "Nuwara Eliya",
    "Galle",
    "Matara",
    "Hambantota",
    "Jaffna",
    "Kilinochchi",
    "Mannar",
    "Vavuniya",
    "Mullaitivu",
    "Batticaloa",
    "Ampara",
    "Trincomalee",
    "Kurunegala",
    "Puttalam",
    "Anuradhapura",
    "Polonnaruwa",
    "Badulla",
    "Monaragala",
    "Ratnapura",
    "Kegalle",
  ];

  const handleCreatePost = async () => {
    const newErrors: any = {};

    if (!caregiverName.trim()) {
      newErrors.caregiverName("Please enter the name.");
      return;
    }
    if (!age.trim()) {
      newErrors.age("Please enter the patient age.");
      return;
    }
    if (!careType.trim()) {
      newErrors.careType("Please enter the care type.");
      return;
    }
    if (!duration.trim()) {
      newErrors.duration("Please enter the duration.");
      return;
    }
    if (!district || district === "Select District") {
      newErrors.district("Please select a district.");
      return;
    }
    if (!urgency || urgency === "Select Urgency") {
      newErrors.urgency("Please select an urgency level.");
      return;
    }
    if (!description.trim()) {
      newErrors.description("Please enter a description.");
      return;
    }

    setErrorMessage("");

    // Validate careseekerId
    if (
      !careseekerId ||
      careseekerId === "undefined" ||
      careseekerId === "null"
    ) {
      console.error("❌ careseekerId is missing or invalid:", careseekerId);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "User session invalid. Please login again.",
      });
      return;
    }

    const careseekerId_number = Number(careseekerId);
    if (isNaN(careseekerId_number)) {
      console.error(
        "❌ careseekerId cannot be converted to number:",
        careseekerId
      );
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Invalid user ID. Please try again.",
      });
      return;
    }

    try {
      const postData = {
        careseekerId: careseekerId_number,
        caregiverName,
        age: Number(age),
        careType,
        duration,
        district,
        urgency,
        description,
      };

      console.log("Sending post data:", postData);
      console.log("careseekerId before Number conversion:", careseekerId);
      console.log("careseekerId after Number conversion:", careseekerId_number);

      const response = await axios.post(
        "http://192.168.176.11:5003/jobposting",
        postData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      if (response.status === 201) {
        console.log("Post created");
        setSuccessMessage("Post created!");
        Toast.show({
          type: "success",
          text1: "Post Created!",
          text2: "Your post has been created successfully.",
        });

        // Navigate back to MainFeed with user data
        setTimeout(() => {
          router.push({
            pathname: "/pages/Careseeker/MainFeed",
            params: {
              careseekerId,
              careseekerName,
              email,
            },
          });
        }, 2000);
      }
    } catch (error) {
      console.log(error);
      Toast.show({
        type: "error",
        text1: "Failed to create a post. Please try again",
      });
    }
  };

  const handleCancel = () => {
    Alert.alert(
      "Cancel Post",
      "Are you sure you want to cancel? All entered information will be lost.",
      [
        {
          text: "No, Stay",
          style: "cancel",
        },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: () => {
            console.log("Cancel pressed");
            router.push({
              pathname: "/pages/Careseeker/CreatePost",
              params: {
                careseekerId,
                careseekerName,
                email,
              },
            });
          },
        },
      ]
    );
  };

  // const handleCreate = () => {
  //   if (!name.trim() || !patientAge.trim() || !district || district === 'Select District' || !description.trim()) {
  //     Alert.alert('Error', 'Please fill in all fields');
  //     return;
  //   }

  //   const ageNum = parseInt(patientAge);
  //   if (isNaN(ageNum) || ageNum < 0 || ageNum > 150) {
  //     Alert.alert('Error', 'Please enter a valid age');
  //     return;
  //   }

  //   // Handle post creation logic here
  //   const postData = {
  //     name: name.trim(),
  //     patientAge: ageNum,
  //     district,
  //     description: description.trim(),
  //   };

  //   console.log('Creating post:', postData);

  //   Alert.alert(
  //     'Success',
  //     'Post created successfully!',
  //     [
  //       {
  //         text: 'OK',
  //         onPress: () => {
  //           // Reset form and navigate back
  //           setName('');
  //           setPatientAge('');
  //           setDistrict('');
  //           setDescription('');
  //           navigation?.goBack();
  //         }
  //       }
  //     ]
  //   );
  // };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4A90E2" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Create Post</Text>
          <Text style={styles.headerSubtitle}>
            Share your medical case or requirement
          </Text>
          {careseekerName && (
            <Text style={styles.headerSubtitle}>
              Posted by: {careseekerName}
            </Text>
          )}
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={styles.input}
              value={caregiverName}
              onChangeText={setName}
              placeholder="Enter patient or contact name"
              placeholderTextColor="#A0A0A0"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Patient Age *</Text>
            <TextInput
              style={styles.input}
              value={age}
              onChangeText={setPatientAge}
              placeholder="Enter patient age"
              placeholderTextColor="#A0A0A0"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Care Type *</Text>
            <TextInput
              style={styles.input}
              value={careType}
              onChangeText={setCareType}
              placeholder="Enter Care Type (e.g., Elder Care)"
              placeholderTextColor="#A0A0A0"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Duration *</Text>
            <TextInput
              style={styles.input}
              value={duration}
              onChangeText={setDuration}
              placeholder="Enter Duration (e.g., 2 weeks)"
              placeholderTextColor="#A0A0A0"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Urgency *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={urgency}
                onValueChange={setUrgency}
                style={styles.picker}
              >
                <Picker.Item label="Select Urgency" value="" />
                <Picker.Item label="High" value="high" />
                <Picker.Item label="Medium" value="medium" />
                <Picker.Item label="Low" value="low" />
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>District *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={district}
                onValueChange={setDistrict}
                style={styles.picker}
              >
                {districts.map((dist, index) => (
                  <Picker.Item
                    key={index}
                    label={dist}
                    value={dist}
                    enabled={dist !== "Select District"}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe the medical case, requirements, or any specific details..."
              placeholderTextColor="#A0A0A0"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreatePost}
          >
            <Text style={styles.createButtonText}>Create Post</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <BottomNavBar activeTab="Post" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: "#4A90E2",
    paddingHorizontal: 20,
    paddingVertical: 30,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#E8F4FD",
    textAlign: "center",
    opacity: 0.9,
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#2C3E50",
    borderWidth: 1,
    borderColor: "#E1E8ED",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  textArea: {
    height: 120,
    paddingTop: 14,
  },
  pickerContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E1E8ED",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  picker: {
    height: 50,
    color: "#2C3E50",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 15,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#E74C3C",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cancelButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  createButton: {
    flex: 1,
    backgroundColor: "#4A90E2",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default CreatePost;

// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   StyleSheet,
//   Platform,
//   ScrollView,
//   Dimensions,
// } from "react-native";
// import { useNavigation } from "@react-navigation/native";
// import { Picker } from "@react-native-picker/picker";
// import Button from "../../../components/button";
// import axios from "axios";
// import BottomNavBar from "../../(tabs)/bottomNavBar";
// import { TouchableOpacity } from "react-native-gesture-handler";

// const { width } = Dimensions.get("window");

// const CreatePost = () => {
//   const navigation = useNavigation();
//   const [caregiverName, setName] = useState("");
//   const [age, setPatientAge] = useState("");
//   const [district, setDistrict] = useState("");
//   const [description, setDescription] = useState("");
//   const [successMessage, setSuccessMessage] = useState("");

//   const handleCreatePost = async () => {
//     try {
//       const response = await axios.post(
//         "http://10.0.2.2:5003/jobposting",
//         {
//           caregiverName,
//           age,
//           district,
//           description,
//         },
//         {
//           headers: { "Content-Type": "application/json" },
//         }
//       );
//       if (response.status === 201) console.log("Post created");
//       setSuccessMessage("Post created!");
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   const districts = [
//     "Colombo",
//     "Gampaha",
//     "Kalutara",
//     "Kandy",
//     "Matale",
//     "Nuwara Eliya",
//     "Galle",
//     "Matara",
//     "Hambantota",
//     "Jaffna",
//     "Kilinochchi",
//     "Mannar",
//     "Vavuniya",
//     "Mullaitivu",
//     "Batticaloa",
//     "Ampara",
//     "Trincomalee",
//     "Kurunegala",
//     "Puttalam",
//     "Anuradhapura",
//     "Polonnaruwa",
//     "Badulla",
//     "Monaragala",
//     "Ratnapura",
//     "Kegalle",
//   ];

//   const handleCancel = () => {
//     navigation.goBack();
//   };

//   return (
//     <View style={styles.gradientBg}>
//       <ScrollView
//         contentContainerStyle={styles.scrollContainer}
//         keyboardShouldPersistTaps="handled"
//       >
//         <BottomNavBar activeTab="post" />

//         <View style={styles.card}>
//           <Text style={styles.title}>Create Post</Text>

//           <TextInput
//             style={styles.input}
//             placeholder="Name"
//             value={caregiverName}
//             onChangeText={setName}
//             placeholderTextColor="#888"
//           />

//           <TextInput
//             style={styles.input}
//             placeholder="Patient Age"
//             value={age}
//             onChangeText={setPatientAge}
//             keyboardType="numeric"
//             placeholderTextColor="#888"
//           />

//           <View style={styles.pickerWrapper}>
//             <Picker
//               selectedValue={district}
//               style={styles.picker}
//               onValueChange={(itemValue) => setDistrict(itemValue)}
//               dropdownIconColor="#67B3FF"
//             >
//               <Picker.Item label="Select District" value="" />
//               {districts.map((dist, index) => (
//                 <Picker.Item key={index} label={dist} value={dist} />
//               ))}
//             </Picker>
//           </View>

//           <TextInput
//             style={[styles.input, styles.textArea]}
//             placeholder="Description"
//             value={description}
//             onChangeText={setDescription}
//             multiline
//             numberOfLines={4}
//             placeholderTextColor="#888"
//           />

//           {successMessage ? (
//             <Text style={styles.success}>{successMessage}</Text>
//           ) : null}

//           {/* <View style={styles.buttonGroup}>
//             <View style={styles.buttonWrapper}>
//               <Button
//                 title="Cancel"
//                 onPress={() => navigation.goBack()}
//                 style={styles.cancelButton}
//                 textStyle={styles.cancelButtonText}
//               />
//             </View> */}
//           <View style={styles.buttonContainer}>
//             <TouchableOpacity
//               style={styles.cancelButton}
//               onPress={handleCancel}
//             >
//               <Text style={styles.cancelButtonText}>Cancel</Text>
//             </TouchableOpacity>
//             <View style={styles.buttonWrapper}>
//               <Button
//                 title="Submit"
//                 onPress={handleCreatePost}
//                 style={styles.submitButton}
//                 textStyle={styles.submitButtonText}
//               />
//             </View>
//           </View>
//         </View>
//       </ScrollView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   gradientBg: {
//     flex: 1,
//     backgroundColor: "#F8FBFF",
//     minHeight: "100%",
//   },
//   scrollContainer: {
//     flexGrow: 1,
//     justifyContent: "flex-start", // <-- move content to the top
//     paddingHorizontal: 20,
//     paddingTop: 110, // <-- add more space at the top
//     paddingBottom: 40,
//   },
//   card: {
//     backgroundColor: "#FFFFFF",
//     borderRadius: 20,
//     padding: 32,
//     marginHorizontal: 4,
//     shadowColor: "#4A90E2",
//     shadowOffset: {
//       width: 0,
//       height: 8,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 24,
//     elevation: 10,
//     borderWidth: 1,
//     borderColor: "#E3F2FD",
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: "700",
//     color: "#1E3A8A",
//     textAlign: "center",
//     marginBottom: 32,
//     letterSpacing: -0.5,
//   },
//   input: {
//     backgroundColor: "#F8FBFF",
//     borderWidth: 2,
//     borderColor: "#E3F2FD",
//     borderRadius: 16,
//     paddingHorizontal: 20,
//     paddingVertical: 16,
//     fontSize: 16,
//     color: "#1E3A8A",
//     marginBottom: 20,
//     fontWeight: "500",
//     ...Platform.select({
//       ios: {
//         shadowColor: "#4A90E2",
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.08,
//         shadowRadius: 8,
//       },
//       android: {
//         elevation: 2,
//       },
//     }),
//   },
//   textArea: {
//     height: 120,
//     textAlignVertical: "top",
//     paddingTop: 16,
//   },
//   pickerWrapper: {
//     backgroundColor: "#F8FBFF",
//     borderWidth: 2,
//     borderColor: "#E3F2FD",
//     borderRadius: 16,
//     marginBottom: 20,
//     overflow: "hidden",
//     ...Platform.select({
//       ios: {
//         shadowColor: "#4A90E2",
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.08,
//         shadowRadius: 8,
//       },
//       android: {
//         elevation: 2,
//       },
//     }),
//   },
//   picker: {
//     height: 56,
//     color: "#1E3A8A",
//     fontSize: 16,
//     fontWeight: "500",
//   },
//   success: {
//     color: "#10B981",
//     fontSize: 16,
//     fontWeight: "600",
//     textAlign: "center",
//     marginBottom: 24,
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     backgroundColor: "#ECFDF5",
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: "#86EFAC",
//   },
//   buttonGroup: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     gap: 16,
//     marginTop: 8,
//   },
//   buttonWrapper: {
//     flex: 1,
//   },
//   cancelButton: {
//     flex: 1,
//     height: 20,
//     backgroundColor: "#FF6B6B",
//     borderRadius: 25,
//     justifyContent: "center",
//     alignItems: "center",
//     shadowColor: "#FF6B6B",
//     shadowOffset: {
//       width: 0,
//       height: 4,
//     },
//   },
//   buttonContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     width: "100%",
//     marginTop: 40,
//     gap: 20,
//   },
//   cancelButtonText: {
//     color: "#FFFFFF",
//     fontSize: 18,
//     fontWeight: "bold",
//   },
//   submitButton: {
//     backgroundColor: "#4A90E2",
//     borderRadius: 16,
//     paddingVertical: 16,
//     paddingHorizontal: 24,
//     shadowColor: "#4A90E2",
//     shadowOffset: {
//       width: 0,
//       height: 4,
//     },
//     shadowOpacity: 0.3,
//     shadowRadius: 12,
//     elevation: 8,
//   },
//   submitButtonText: {
//     color: "#FFFFFF",
//     fontSize: 16,
//     fontWeight: "700",
//     textAlign: "center",
//   },
// });

// export default CreatePost;
