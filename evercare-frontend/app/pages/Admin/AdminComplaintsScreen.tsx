import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { complaintService, Complaint } from "../../../services/complaintService";
import { getCareseekerById, getCaregiverById } from "../../../services/userService";

// --- Types ---
type ComplaintStatus = "pending" | "in_progress" | "resolved" | "closed";

interface DisplayComplaint {
  id: number;
  reporterName: string;
  reportedUserName: string;
  subject: string;
  description: string;
  date: string;
  status: ComplaintStatus;
  priority: 'low' | 'medium' | 'high';
}

const AdminComplaintsScreen: React.FC = () => {
  const router = useRouter();
  const [complaints, setComplaints] = useState<DisplayComplaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch complaints data
  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Test API connectivity first
      console.log("Testing UserService connectivity...");
      try {
        const testCareseeker = await getCareseekerById(1);
        console.log("Test careseeker fetch result:", testCareseeker);
      } catch (testError) {
        console.error("UserService connectivity test failed:", testError);
      }
      
      const response = await complaintService.getAllComplaints(1, 50);
      console.log("Complaints response:", response);
      console.log("Complaint IDs found:", response.complaints.map(c => ({ 
        complaintId: c.complaintId, 
        careseekerId: c.careseekerId, 
        caregiverId: c.caregiverId 
      })));
      
      // Resolve user names for each complaint
      const complaintsWithNames = await Promise.all(
        response.complaints.map(async (complaint: Complaint) => {
          let careseeker = null;
          let caregiver = null;

          // Try to fetch careseeker data with error handling
          try {
            console.log(`Fetching careseeker ${complaint.careseekerId}...`);
            careseeker = await getCareseekerById(complaint.careseekerId);
            console.log(`Careseeker ${complaint.careseekerId} result:`, careseeker);
          } catch (error) {
            console.warn(`Failed to fetch careseeker ${complaint.careseekerId}:`, error);
          }

          // Try to fetch caregiver data with error handling
          try {
            console.log(`Fetching caregiver ${complaint.caregiverId}...`);
            caregiver = await getCaregiverById(complaint.caregiverId);
            console.log(`Caregiver ${complaint.caregiverId} result:`, caregiver);
          } catch (error) {
            console.warn(`Failed to fetch caregiver ${complaint.caregiverId}:`, error);
          }

          return {
            id: complaint.complaintId,
            reporterName: careseeker && careseeker.careseekerName 
              ? `${careseeker.careseekerName} (Careseeker)` 
              : `Careseeker #${complaint.careseekerId}`,
            reportedUserName: caregiver && caregiver.caregiverName 
              ? `${caregiver.caregiverName} (Caregiver)` 
              : `Caregiver #${complaint.caregiverId}`,
            subject: complaint.subject,
            description: complaint.description,
            date: new Date(complaint.createdAt).toLocaleDateString(),
            status: complaint.status,
            priority: complaint.priority,
          };
        })
      );

      setComplaints(complaintsWithNames);
    } catch (err) {
      console.error("Error fetching complaints:", err);
      setError("Failed to load complaints. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Load complaints on component mount
  useEffect(() => {
    fetchComplaints();
  }, []);

  // Function to update complaint status
  const updateComplaintStatus = async (id: number, newStatus: ComplaintStatus) => {
    Alert.alert(
      "Confirm Status Update",
      `Change status for Complaint #${id} to ${newStatus}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              await complaintService.updateComplaintStatus(id, { status: newStatus });
              
              // Update local state
              setComplaints((prev) =>
                prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
              );
              
              Alert.alert("Success", `Complaint #${id} status updated to ${newStatus}.`);
            } catch (err) {
              console.error("Error updating complaint status:", err);
              Alert.alert("Error", "Failed to update complaint status. Please try again.");
            }
          },
        },
      ]
    );
  };

  const getStatusStyle = (status: ComplaintStatus) => {
    switch (status) {
      case "pending":
        return { backgroundColor: "#F39C12" };
      case "in_progress":
        return { backgroundColor: "#4A90E2" };
      case "resolved":
        return { backgroundColor: "#27AE60" };
      case "closed":
        return { backgroundColor: "#E74C3C" };
      default:
        return { backgroundColor: "#95A5A6" };
    }
  };

  const getStatusDisplayName = (status: ComplaintStatus) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "in_progress":
        return "Under Review";
      case "resolved":
        return "Resolved";
      case "closed":
        return "Closed";
      default:
        return status;
    }
  };

  const renderComplaintCard = (complaint: DisplayComplaint) => (
    <View key={complaint.id} style={complaintStyles.card}>
      <View style={complaintStyles.cardHeader}>
        <Text style={complaintStyles.complaintId}>#{complaint.id}</Text>
        <View style={[complaintStyles.statusBadge, getStatusStyle(complaint.status)]}>
          <Text style={complaintStyles.statusText}>{getStatusDisplayName(complaint.status)}</Text>
        </View>
      </View>

      <Text style={complaintStyles.infoLine}>
        <Text style={complaintStyles.infoLabel}>Reported User:</Text>{" "}
        {complaint.reportedUserName}
      </Text>
      <Text style={complaintStyles.infoLine}>
        <Text style={complaintStyles.infoLabel}>Reporter:</Text>{" "}
        {complaint.reporterName}
      </Text>
      <Text style={complaintStyles.infoLine}>
        <Text style={complaintStyles.infoLabel}>Date Filed:</Text> {complaint.date}
      </Text>
      <Text style={complaintStyles.infoLine}>
        <Text style={complaintStyles.infoLabel}>Priority:</Text> {complaint.priority.toUpperCase()}
      </Text>
      <Text style={complaintStyles.reasonText}>
        <Text style={complaintStyles.infoLabel}>Subject:</Text> {complaint.subject}
      </Text>
      <Text style={complaintStyles.reasonText}>
        <Text style={complaintStyles.infoLabel}>Description:</Text> {complaint.description}
      </Text>

      {/* Admin Actions */}
      <View style={complaintStyles.actionsContainer}>
        <TouchableOpacity
          style={[complaintStyles.actionButton, { backgroundColor: "#4A90E2" }]}
          onPress={() => updateComplaintStatus(complaint.id, "in_progress")}
          disabled={complaint.status === "in_progress"}
        >
          <Text style={complaintStyles.actionText}>Review</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[complaintStyles.actionButton, { backgroundColor: "#27AE60" }]}
          onPress={() => updateComplaintStatus(complaint.id, "resolved")}
          disabled={complaint.status === "resolved"}
        >
          <Text style={complaintStyles.actionText}>Resolve</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[complaintStyles.actionButton, { backgroundColor: "#E74C3C" }]}
          onPress={() => updateComplaintStatus(complaint.id, "closed")}
          disabled={complaint.status === "closed"}
        >
          <Text style={complaintStyles.actionText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={complaintStyles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#E74C3C" />
      
      {/* Header */}
      <View style={complaintStyles.header}>
        <TouchableOpacity onPress={() => router.back()} style={complaintStyles.backButton}>
          <Icon name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={complaintStyles.headerTitle}>User Complaints</Text>
        <View style={{ width: 24 }} /> {/* Spacer */}
      </View>

      <ScrollView style={complaintStyles.feedContainer}>
        <View style={complaintStyles.listContainer}>
          {loading ? (
            <View style={complaintStyles.loadingContainer}>
              <ActivityIndicator size="large" color="#E74C3C" />
              <Text style={complaintStyles.loadingText}>Loading complaints...</Text>
            </View>
          ) : error ? (
            <View style={complaintStyles.errorContainer}>
              <Text style={complaintStyles.errorText}>{error}</Text>
              <TouchableOpacity
                style={complaintStyles.retryButton}
                onPress={fetchComplaints}
              >
                <Text style={complaintStyles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {complaints.map(renderComplaintCard)}
              {complaints.length === 0 && (
                <Text style={complaintStyles.noComplaintsText}>No active complaints.</Text>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const complaintStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    backgroundColor: "#E74C3C", // Red for warnings/complaints
    paddingHorizontal: 16,
    paddingVertical: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  feedContainer: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F2F6",
    paddingBottom: 10,
  },
  complaintId: {
    fontSize: 14,
    color: "#7F8C8D",
    fontWeight: "500",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 15,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  infoLine: {
    fontSize: 14,
    color: "#2C3E50",
    marginBottom: 5,
  },
  infoLabel: {
    fontWeight: "600",
    color: "#7F8C8D",
  },
  reasonText: {
    fontSize: 14,
    color: "#2C3E50",
    marginTop: 10,
    lineHeight: 20,
  },
  actionsContainer: {
    flexDirection: "row",
    marginTop: 15,
    justifyContent: "space-between",
    gap: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  actionText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  noComplaintsText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#7F8C8D",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#7F8C8D",
  },
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  errorText: {
    fontSize: 16,
    color: "#E74C3C",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#E74C3C",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  }
});

export default AdminComplaintsScreen;