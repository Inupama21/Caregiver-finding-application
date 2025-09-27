import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useRouter } from "expo-router";

const AdminMainScreen: React.FC = () => {
  const router = useRouter();

  const adminFeatures = [
    {
      title: "View Complaints",
      subtitle: "Manage and resolve user reports.",
      icon: "gavel",
      color: "#E74C3C",
      route: "/pages/Admin/AdminComplaintsScreen",
    },
    {
      title: "Payment Records",
      subtitle: "Oversee all transaction history.",
      icon: "account-balance-wallet",
      color: "#27AE60",
      route: "/pages/Admin/AdminPaymentRecordsScreen",
    },
    {
      title: "User Management",
      subtitle: "View and modify user accounts.",
      icon: "group",
      color: "#F39C12",
      route: "/pages/Admin/AdminUserManagement", 
    },
  ];

  return (
    <SafeAreaView style={adminStyles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4A90E2" />

      {/* Header */}
      <View style={adminStyles.header}>
        <Text style={adminStyles.headerTitle}>Admin Dashboard</Text>
        <Text style={adminStyles.headerSubtitle}>
          Central hub for application oversight
        </Text>
      </View>

      {/* Feature Cards */}
      <View style={adminStyles.featuresContainer}>
        {adminFeatures.map((feature) => (
          <TouchableOpacity
            key={feature.title}
            style={adminStyles.card}
            onPress={() => router.push(feature.route as never)}
            activeOpacity={0.8}
          >
            <View style={[adminStyles.iconCircle, { backgroundColor: feature.color }]}>
              <Icon name={feature.icon} size={30} color="#FFFFFF" />
            </View>
            <View style={adminStyles.cardTextContent}>
              <Text style={adminStyles.cardTitle}>{feature.title}</Text>
              <Text style={adminStyles.cardSubtitle}>{feature.subtitle}</Text>
            </View>
            <Icon name="chevron-right" size={30} color="#BDC3C7" />
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

const adminStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    backgroundColor: "#4A90E2",
    paddingHorizontal: 20,
    paddingVertical: 35,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#E8F4FD",
    textAlign: "center",
    marginTop: 4,
  },
  featuresContainer: {
    paddingHorizontal: 16,
    flex: 1,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  cardTextContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2C3E50",
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#7F8C8D",
    marginTop: 4,
  },
});

export default AdminMainScreen;