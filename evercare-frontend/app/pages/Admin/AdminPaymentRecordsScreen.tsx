import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { getAllPayments } from "../../../services/paymentService";
import { getCareseekerById, getCaregiverById, Careseeker, Caregiver } from "../../../services/userService";

// --- Types ---
type TransactionStatus = "succeeded" | "pending" | "failed" | "canceled";

interface PaymentRecord {
  id: number;
  paymentIntentId: string;
  amount: string; // API sends amount as a string
  currency: string;
  status: TransactionStatus;
  careseekerId?: number;
  caregiverId?: number;
  bookingId?: number;
  description?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

interface Transaction {
  id: string;
  payerName: string;
  payeeName: string;
  amount: number; // We will convert the string to a number
  date: string;
  status: TransactionStatus;
  paymentIntentId: string;
}

const AdminPaymentRecordsScreen: React.FC = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<TransactionStatus | "All">("All");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [userCache, setUserCache] = useState<{
    careseekers: { [key: number]: Careseeker };
    caregivers: { [key: number]: Caregiver };
  }>({
    careseekers: {},
    caregivers: {},
  });

  const filterOptions: (TransactionStatus | "All")[] = ["All", "succeeded", "pending", "failed", "canceled"];

  const fetchUserInfo = async (userId: number, userType: 'careseeker' | 'caregiver') => {
    const cacheKey = userType === 'careseeker' ? 'careseekers' : 'caregivers';
    if (userCache[cacheKey][userId]) return userCache[cacheKey][userId];
    try {
      const user = userType === 'careseeker' ? await getCareseekerById(userId) : await getCaregiverById(userId);
      if (user) {
        setUserCache(prev => ({ ...prev, [cacheKey]: { ...prev[cacheKey], [userId]: user } }));
      }
      return user;
    } catch (error) {
      console.error(`Error fetching ${userType} by ID ${userId}:`, error);
      return null;
    }
  };

  const loadPaymentData = async () => {
    try {
      setLoading(true);
      const response = await getAllPayments();
      
      if (response.success && response.data) {
        const paymentRecords: PaymentRecord[] = response.data;
        
        const processedTransactions: Transaction[] = await Promise.all(
          paymentRecords.map(async (payment) => {
            const careseeker = payment.careseekerId ? await fetchUserInfo(payment.careseekerId, 'careseeker') : null;
            const caregiver = payment.caregiverId ? await fetchUserInfo(payment.caregiverId, 'caregiver') : null;

            return {
              id: `T${payment.id}`,
              paymentIntentId: payment.paymentIntentId,
              payerName: (careseeker as Careseeker)?.careseekerName || `Careseeker ${payment.careseekerId}`,
              payeeName: (caregiver as Caregiver)?.caregiverName || `Caregiver ${payment.caregiverId}`,
              amount: parseFloat(payment.amount) || 0,
              date: new Date(payment.createdAt).toISOString().split('T')[0],
              status: payment.status,
            };
          })
        );
        setTransactions(processedTransactions);
      } else {
        Alert.alert('Error', response.message || 'No payment data available');
      }
    } catch (error) {
      console.error('Error loading payment data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Alert.alert('Error', `Failed to load payment records: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPaymentData();
  }, []);

  const filteredTransactions = transactions.filter(
    (tx) =>
      (filterStatus === "All" || tx.status === filterStatus) &&
      (tx.payerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.payeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.id.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const getStatusStyle = (status: TransactionStatus) => {
    switch (status) {
      case "succeeded": return { backgroundColor: "#27AE60" };
      case "pending": return { backgroundColor: "#F39C12" };
      case "failed": return { backgroundColor: "#E74C3C" };
      case "canceled": return { backgroundColor: "#95A5A6" };
      default: return { backgroundColor: "#95A5A6" };
    }
  };

  const getStatusDisplayName = (status: TransactionStatus) => {
    switch (status) {
      case "succeeded": return "Completed";
      case "pending": return "Pending";
      case "failed": return "Failed";
      case "canceled": return "Canceled";
      default: return status;
    }
  };

  const renderTransactionCard = (tx: Transaction) => (
    <View key={tx.id} style={paymentStyles.card}>
      <View style={paymentStyles.cardHeader}>
        <Text style={paymentStyles.transactionId}>{tx.id}</Text>
        <View style={[paymentStyles.statusBadge, getStatusStyle(tx.status)]}>
          <Text style={paymentStyles.statusText}>{getStatusDisplayName(tx.status)}</Text>
        </View>
      </View>

      <Text style={paymentStyles.infoLine}>
        <Text style={paymentStyles.infoLabel}>Payer:</Text> {tx.payerName}
      </Text>
      <Text style={paymentStyles.infoLine}>
        <Text style={paymentStyles.infoLabel}>Payee:</Text> {tx.payeeName}
      </Text>
      <View style={paymentStyles.amountRow}>
        <Text style={paymentStyles.infoLine}>
            <Text style={paymentStyles.infoLabel}>Date:</Text> {tx.date}
        </Text>
        <Text style={paymentStyles.amountText}>
          LKR {(tx.amount || 0).toFixed(2)}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={paymentStyles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#27AE60" />
      
      <View style={paymentStyles.header}>
        <TouchableOpacity onPress={() => router.back()} style={paymentStyles.backButton}>
          <Icon name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={paymentStyles.headerTitle}>Payment Records</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={paymentStyles.controlsContainer}>
        <View style={paymentStyles.searchContainer}>
          <Icon name="search" size={20} color="#7F8C8D" />
          <TextInput
            style={paymentStyles.searchInput}
            placeholder="Search by user or transaction ID..."
            placeholderTextColor="#95A5A6"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>

        <View style={paymentStyles.filterContainer}>
          {filterOptions.map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                paymentStyles.filterButton,
                filterStatus === status && paymentStyles.filterButtonActive,
              ]}
              onPress={() => setFilterStatus(status)}
            >
              <Text
                style={[
                  paymentStyles.filterText,
                  filterStatus === status && paymentStyles.filterTextActive,
                ]}
              >
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView style={paymentStyles.feedContainer}>
        <View style={paymentStyles.listContainer}>
          {loading ? (
            <View style={paymentStyles.loadingContainer}>
              <ActivityIndicator size="large" color="#27AE60" />
              <Text style={paymentStyles.loadingText}>Loading payment records...</Text>
            </View>
          ) : (
            <>
              {filteredTransactions.map(renderTransactionCard)}
              {filteredTransactions.length === 0 && !loading && (
                <Text style={paymentStyles.noRecordsText}>No matching payment records found.</Text>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const paymentStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    backgroundColor: "#27AE60",
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
  controlsContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E1E8ED",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E1E8ED",
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: "#2C3E50",
    paddingVertical: 0,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#E1E8ED",
  },
  filterButtonActive: {
    backgroundColor: "#27AE60",
  },
  filterText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#7F8C8D",
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  feedContainer: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
    paddingBottom: 8,
  },
  transactionId: {
    fontSize: 14,
    color: "#7F8C8D",
    fontWeight: "500",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 15,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "bold",
  },
  infoLine: {
    fontSize: 15,
    color: "#2C3E50",
    marginBottom: 5,
  },
  infoLabel: {
    fontWeight: "600",
    color: "#7F8C8D",
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  amountText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#27AE60",
  },
  noRecordsText: {
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
  }
});

export default AdminPaymentRecordsScreen;

