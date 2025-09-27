import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Image,
  FlatList,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useRouter, useLocalSearchParams } from "expo-router";
import BottomNavBar from "@/app/components/careseekerbottomNavBar";
import {
  caregiverService,
  CaregiverProfile,
} from "../../../services/caregiverService";
interface CareProvider {
  id: string;
  name: string;
  rate: number;
  currency: string;
  rating: number;
  image: string;
  specialization?: string;
  experience?: string;
  bio?: string;
}

interface CaringPartnersProps {
  navigation?: any;
}

const CaringPartners: React.FC<CaringPartnersProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredProviders, setFilteredProviders] = useState<CareProvider[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(false);

  // Get user data from navigation params
  const params = useLocalSearchParams();
  const careseekerId = params.careseekerId as string;
  const careseekerName = params.careseekerName as string;
  const email = params.email as string;

  const careProviders: CareProvider[] = [
    {
      id: "1",
      name: "Anne Smith",
      rate: 1000,
      currency: "LKR",
      rating: 4.8,
      image:
        "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face",
      specialization: "Elder Care",
      experience: "5 years",
      bio: "Experienced elder care specialist with a passion for helping seniors maintain their independence at home.",
    },
    {
      id: "2",
      name: "Jhon Doe",
      rate: 1200,
      currency: "LKR",
      rating: 4.9,
      image:
        "https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=300&h=300&fit=crop&crop=face",
      specialization: "Nursing Care",
      experience: "8 years",
      bio: "Dedicated nursing professional specializing in post-operative care and medication management.",
    },
    {
      id: "3",
      name: "Lisa Ray",
      rate: 800,
      currency: "LKR",
      rating: 4.6,
      image:
        "https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=300&h=300&fit=crop&crop=face",
      specialization: "Home Care",
      experience: "3 years",
      bio: "Compassionate home care provider focused on creating comfortable and safe environments for clients.",
    },
    {
      id: "4",
      name: "Mark Lee",
      rate: 1100,
      currency: "LKR",
      rating: 4.7,
      image:
        "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop&crop=face",
      specialization: "Physical Therapy",
      experience: "6 years",
      bio: "Licensed physical therapist helping patients regain mobility and strength through personalized treatment plans.",
    },
    {
      id: "5",
      name: "Mark Lee",
      rate: 1100,
      currency: "LKR",
      rating: 4.5,
      image:
        "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=300&h=300&fit=crop&crop=face",
      specialization: "Rehabilitation",
      experience: "4 years",
      bio: "Rehabilitation specialist committed to helping clients achieve their recovery goals with patience and expertise.",
    },
    {
      id: "6",
      name: "Mark Lee",
      rate: 1100,
      currency: "LKR",
      rating: 4.5,
      image:
        "https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=300&h=300&fit=crop&crop=face",
      specialization: "General Care",
      experience: "7 years",
      bio: "Versatile caregiver with extensive experience in various aspects of personal care and daily living assistance.",
    },
  ];

  const router = useRouter();

  // Function to convert CaregiverProfile to CareProvider format
  const convertToProvider = (profile: CaregiverProfile): CareProvider => {
    return {
      id: profile.caregiverId.toString(),
      name: profile.displayName || `Caregiver ${profile.caregiverId}`,
      rate: 1000, // Default rate, you might want to add this field to your backend
      currency: "LKR",
      rating: profile.averageRating || 4.5,
      image:
        profile.profilePhoto ||
        "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face",
      specialization: profile.specialization || "General Care",
      experience: profile.experienceYears
        ? `${profile.experienceYears} years`
        : "Experienced",
      bio: profile.description || undefined,
    };
  };

  useEffect(() => {
    const fetchCaregiverProfiles = async () => {
      try {
        setLoading(true);
        // Start with dummy data
        setFilteredProviders(careProviders);

        // Try to fetch real profiles and merge with dummy data
        const response = await caregiverService.getAllProfiles(1, 10);
        if (response.profiles && response.profiles.length > 0) {
          const realProviders = response.profiles.map(convertToProvider);
          // Merge real profiles with dummy data
          setFilteredProviders([...realProviders, ...careProviders]);
        }
      } catch (error) {
        console.error("API Error:", error);
        // Keep showing dummy data if API fails
        setFilteredProviders(careProviders);
      } finally {
        setLoading(false);
      }
    };

    fetchCaregiverProfiles();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      // Reset to all current providers (including any fetched real profiles)
      return;
    } else {
      const filtered = filteredProviders.filter(
        (provider) =>
          provider.name.toLowerCase().includes(query.toLowerCase()) ||
          provider.specialization?.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredProviders(filtered);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Icon key={i} name="star" size={16} color="#FFD700" />);
    }

    if (hasHalfStar) {
      stars.push(
        <Icon key="half" name="star-half" size={16} color="#FFD700" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Icon key={`empty-${i}`} name="star-border" size={16} color="#E0E0E0" />
      );
    }

    return stars;
  };

  const renderProviderCard = ({ item }: { item: CareProvider }) => (
    <TouchableOpacity
      style={styles.providerCard}
      activeOpacity={0.8}
      onPress={() =>
        router.push({
          pathname: "/pages/Careseeker/CaregiverProfileView",
          params: {
            caregiverId: item.id,
            caregiverData: JSON.stringify(item),
          },
        })
      }
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.providerImage} />
      </View>
      <Text style={styles.providerName}>{item.name}</Text>
      <Text style={styles.providerRate}>
        {item.currency} {item.rate}/hr
      </Text>
      <View style={styles.ratingContainer}>
        {renderStars(item.rating)}
        <Text style={styles.ratingText}>{item.rating}</Text>
      </View>
      {item.specialization && (
        <Text style={styles.specialization}>{item.specialization}</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4A90E2" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Welcome back!</Text>
        <Text style={styles.headerSubtitle}>
          {careseekerName
            ? `Hello, ${careseekerName}`
            : "Find your caring partner"}
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon
            name="search"
            size={24}
            color="#A0A0A0"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={handleSearch}
            placeholder="Search for care providers..."
            placeholderTextColor="#A0A0A0"
          />
        </View>
      </View>

      <FlatList
        data={filteredProviders}
        renderItem={renderProviderCard}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.providersContainer}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.bottomNavigation}>
        <BottomNavBar activeTab="home" />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    backgroundColor: "#4A90E2",
    paddingHorizontal: 20,
    paddingVertical: 25,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "left",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#E8F4FD",
    textAlign: "left",
    marginTop: 4,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: "#2C3E50",
  },
  providersContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  row: {
    justifyContent: "space-between",
  },
  providerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    width: "48%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  imageContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    overflow: "hidden",
    marginBottom: 12,
  },
  providerImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  providerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
    textAlign: "center",
    marginBottom: 4,
  },
  providerRate: {
    fontSize: 14,
    color: "#E74C3C",
    fontWeight: "600",
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 12,
    color: "#7F8C8D",
    marginLeft: 4,
  },
  specialization: {
    fontSize: 12,
    color: "#7F8C8D",
    textAlign: "center",
    fontStyle: "italic",
  },
  bottomNavigation: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "#E1E8ED",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  navText: {
    fontSize: 12,
    color: "#A0A0A0",
    marginTop: 4,
    fontWeight: "500",
  },
});

export default CaringPartners;
