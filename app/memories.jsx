import { StyleSheet, View, Image, Text, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator, ScrollView, Animated, StatusBar, Dimensions, FlatList } from "react-native";
import ScreenWrapper from "../components/ScreenWrapper";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { hp, wp } from "../helpers/common";
import { theme } from "../constants/theme";
import { useState, useEffect, useRef } from "react";
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from "../AuthContext";
import { doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import { firestore } from "../firebaseConfig";
import * as ImagePicker from 'expo-image-picker';
import moment from "moment";

const SCREEN_WIDTH = Dimensions.get('window').width;

const Memories = () => {
  const { user } = useAuth();
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [newMemoryTitle, setNewMemoryTitle] = useState("");
  const [newMemoryDescription, setNewMemoryDescription] = useState("");
  const [newMemoryImages, setNewMemoryImages] = useState([]);
  const [selectedTab, setSelectedTab] = useState("all");
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    fetchMemories();
  }, [user]); // Added user to dependency array for fetchMemories

  const fetchMemories = async () => {
    if (!user) { // Ensure user is available
        setLoading(false);
        return;
    }
    try {
      setLoading(true);
      const userRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const sortedMemories = (userData.memories || []).sort((a, b) => 
          moment(b.createdAt || b.date).valueOf() - moment(a.createdAt || a.date).valueOf() // Sort by creation time or date
        );
        setMemories(sortedMemories);
      }
    } catch (error) {
      console.error('Error fetching memories:', error);
      Alert.alert('Error', 'Failed to load memories');
    } finally {
      setLoading(false);
    }
  };

  const pickImages = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to add photos to your memories.');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: 10, // Max 10 images
      });
      
      if (!result.canceled && result.assets) { // Check for result.assets
        setNewMemoryImages([...newMemoryImages, ...result.assets.map(asset => asset.uri)]);
      }
    } catch (error) {
      console.error('Error picking images:', error);
      Alert.alert('Error', 'Failed to pick images');
    }
  };

  const removeImage = (indexToRemove) => {
    setNewMemoryImages(newMemoryImages.filter((_, index) => index !== indexToRemove));
  };

  const toggleFavorite = async (memoryId) => {
    try {
      const updatedMemories = memories.map(memory => {
        if (memory.id === memoryId) {
          return { ...memory, isFavorite: !memory.isFavorite };
        }
        return memory;
      });
      
      const userRef = doc(firestore, 'users', user.uid);
      await updateDoc(userRef, { memories: updatedMemories });
      setMemories(updatedMemories); // Keep local state sorted as is, or re-sort if needed
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Failed to update favorite');
    }
  };

  const addMemory = async () => {
    if (!newMemoryTitle.trim()) {
      Alert.alert('Error', 'Please enter a memory title');
      return;
    }

    if (newMemoryImages.length === 0) {
      Alert.alert('Error', 'Please select at least one image');
      return;
    }

    try {
      const userRef = doc(firestore, 'users', user.uid);
      
      const newMemory = {
        id: Date.now().toString(),
        title: newMemoryTitle.trim(),
        description: newMemoryDescription.trim(),
        date: new Date().getFullYear().toString(), 
        images: newMemoryImages,
        isFavorite: false,
        createdAt: new Date().toISOString() 
      };

      await updateDoc(userRef, {
        memories: arrayUnion(newMemory)
      });

      const anUpdatedListOfMemories = [...memories, newMemory].sort((a, b) => 
         moment(b.createdAt || b.date).valueOf() - moment(a.createdAt || a.date).valueOf()
      );
      setMemories(anUpdatedListOfMemories);
      
      setNewMemoryTitle('');
      setNewMemoryDescription('');
      setNewMemoryImages([]);
      setIsAddModalVisible(false);
      Alert.alert('Success', 'Memory added successfully!');
    } catch (error) {
      console.error('Error adding memory:', error);
      Alert.alert('Error', 'Failed to add memory');
    }
  };

  // Function to delete a memory
  const deleteMemory = async (memoryIdToDelete) => {
    try {
      const updatedMemoriesArray = memories.filter(memory => memory.id !== memoryIdToDelete);

      const userRef = doc(firestore, 'users', user.uid);
      await updateDoc(userRef, { memories: updatedMemoriesArray });

      // Update local state (already sorted by filter)
      setMemories(updatedMemoriesArray); 
      Alert.alert('Success', 'Memory deleted successfully!');
    } catch (error) {
      console.error('Error deleting memory:', error);
      Alert.alert('Error', 'Failed to delete memory. Please try again.');
    }
  };

  const renderMemoryCard = ({ item }) => {
    // This filtering is now done before passing to FlatList
    // if (selectedTab === "favorites" && !item.isFavorite) {
    //   return null;
    // }

    return (
      <Animated.View 
        key={item.id}
        style={[
          styles.memoryCard,
          { 
            opacity: fadeAnim,
            transform: [{
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0]
              })
            }]
          }
        ]}
      >
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
        >
          {(item.images && Array.isArray(item.images) ? item.images : (item.image ? [item.image] : [])).map((img, index) => (
            <Image 
              key={index} 
              source={{ uri: img }}
              style={styles.memoryImage}
            />
          ))}
        </ScrollView>
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.memoryGradient}
        >
          <Text style={styles.memoryTitle}>{item.title}</Text>
          <Text style={styles.memoryYear}>{item.date}</Text>
        </LinearGradient>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(item.id)}
        >
          <Ionicons 
            name={item.isFavorite ? "heart" : "heart-outline"} 
            size={24} 
            color={item.isFavorite ? theme.colors.primary : "#ffffff"} // Use theme color for favorite
          />
        </TouchableOpacity>
        {/* Delete Button */}
        <TouchableOpacity
          style={styles.deleteMemoryButton}
          onPress={() => {
            Alert.alert(
              "Delete Memory",
              "Are you sure you want to permanently delete this memory?",
              [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", onPress: () => deleteMemory(item.id), style: "destructive" }
              ]
            );
          }}
        >
          <Ionicons 
            name="trash-outline"
            size={22} // Slightly smaller to differentiate
            color="#ffffff" 
          />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <LinearGradient
        colors={["#fbae52", "#dd528d", "#ff8c79"]}
        style={styles.gradientBackground}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      </LinearGradient>
    );
  }

  const filteredMemories = memories.filter(item => {
    if (selectedTab === "favorites") {
      return item.isFavorite;
    }
    return true; 
  });

  return (
    <LinearGradient
      colors={["#fbae52", "#dd528d", "#ff8c79"]}
      style={styles.gradientBackground}
    >
      <ScreenWrapper>
        <LinearGradient
          colors={["#73d1d3", "#badcc3", "#dba380"]}
          style={styles.fullScreenOval}
        >
          <Text style={styles.ovalText}>Memories</Text>
          <View style={[styles.segmentedControl]}>
            <TouchableOpacity 
              style={[
                styles.segmentButton,
                selectedTab === "all" && styles.segmentButtonActive
              ]}
              onPress={() => setSelectedTab("all")}
            >
              <Text style={[
                styles.segmentText,
                selectedTab === "all" && styles.segmentTextActive
              ]}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.segmentButton,
                selectedTab === "favorites" && styles.segmentButtonActive
              ]}
              onPress={() => setSelectedTab("favorites")}
            >
              <Text style={[
                styles.segmentText,
                selectedTab === "favorites" && styles.segmentTextActive
              ]}>Favorites</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.mainContainer}>
          {filteredMemories.length > 0 ? (
             <FlatList
             data={filteredMemories}
             renderItem={renderMemoryCard}
             keyExtractor={(item) => item.id}
             style={styles.memoriesList}
             showsVerticalScrollIndicator={false}
             contentContainerStyle={{ paddingBottom: hp(2) }} 
           />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons 
                name="images-outline" 
                size={60} 
                color="rgba(255, 255, 255, 0.5)" 
              />
              <Text style={[styles.emptyStateText, { color: '#fff' }]}>
                {selectedTab === "favorites" ? "No favorite memories yet." : "No memories yet. Add your first memory!"}
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setIsAddModalVisible(true)}
        >
          <Ionicons name="add" size={30} color="#fff" />
        </TouchableOpacity>

        <View style={styles.bottomNavigation}>
          <TouchableOpacity onPress={() => router.push("homepage")}>
            <Image
              source={require("../assets/icons/home_icon.png")}
              style={styles.navIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("friends")}>
            <View>
              <Image
                source={require("../assets/icons/friends_icon.png")}
                style={styles.navIcon}
              />
              <View style={styles.notificationBadge} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("map")}>
            <Image
              source={require("../assets/icons/globe_icon.png")}
              style={styles.globeIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("calendar")}>
            <Image
              source={require("../assets/icons/calendar_icon.png")}
              style={styles.navIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("myaccount")}>
            <Image
              source={require("../assets/icons/profile_icon.png")}
              style={styles.navIcon}
            />
          </TouchableOpacity>
        </View>

        <Modal
          visible={isAddModalVisible}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>New Memory</Text>
                <TouchableOpacity 
                  onPress={() => {
                    setIsAddModalVisible(false);
                    setNewMemoryTitle('');
                    setNewMemoryDescription('');
                    setNewMemoryImages([]);
                  }}
                  style={styles.modalCloseButton}
                >
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              <ScrollView 
                horizontal 
                style={styles.imagePickerContainer}
                showsHorizontalScrollIndicator={false}
              >
                <TouchableOpacity 
                  style={styles.addImageButton}
                  onPress={pickImages}
                >
                  <Ionicons name="camera-outline" size={40} color="#555" />
                  <Text style={styles.addImageText}>Add Photos</Text>
                </TouchableOpacity>

                {newMemoryImages.map((uri, index) => (
                  <View key={index} style={styles.selectedImageContainer}>
                    <Image 
                      source={{ uri }}
                      style={styles.selectedImage}
                    />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => removeImage(index)}
                    >
                      <Ionicons name="close-circle" size={24} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
              
              <TextInput
                style={styles.input}
                value={newMemoryTitle}
                onChangeText={setNewMemoryTitle}
                placeholder="Title"
                placeholderTextColor="#666"
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                value={newMemoryDescription}
                onChangeText={setNewMemoryDescription}
                placeholder="Description (optional)"
                placeholderTextColor="#666"
                multiline={true}
                numberOfLines={4}
              />

              <TouchableOpacity 
                style={[
                  styles.createButton,
                  (!newMemoryTitle.trim() || newMemoryImages.length === 0) && styles.createButtonDisabled
                ]}
                onPress={addMemory}
                disabled={!newMemoryTitle.trim() || newMemoryImages.length === 0}
              >
                <Text style={styles.createButtonText}>Create Memory</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScreenWrapper>
    </LinearGradient>
  );
};

export default Memories;

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  fullScreenOval: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "25%", 
    borderBottomLeftRadius: wp(100),
    borderBottomRightRadius: wp(100),
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    paddingTop: hp(2), 
  },
  ovalText: {
    color: "#fff",
    fontSize: hp(3.5),
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: hp(1), 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  segmentedControl: {
    flexDirection: 'row',
    width: wp(60),
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 4,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 20,
  },
  segmentButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.35)', 
  },
  segmentText: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.7,
  },
  segmentTextActive: {
    color: '#fff',
    fontWeight: '600', 
    opacity: 1,
  },
  mainContainer: {
    flex: 1,
    marginTop: hp(20), 
    marginBottom: hp(10), 
  },
  memoriesList: {
    flex: 1,
    paddingHorizontal: wp(4), 
  },
  memoryCard: {
    height: hp(50),
    marginBottom: hp(2.5), 
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.15)', 
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4, 
    },
    shadowOpacity: 0.3, 
    shadowRadius: 5, 
    elevation: 6, 
  },
  memoryImage: {
    width: SCREEN_WIDTH - (wp(4) * 2), 
    height: '100%',
    resizeMode: 'cover',
  },
  memoryGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    paddingHorizontal: 16,
    paddingBottom: 16,
    justifyContent: 'flex-end',
  },
  memoryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.5)', 
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  memoryYear: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9, 
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  favoriteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)', 
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1, // Ensure it's clickable
  },
  deleteMemoryButton: { // New Style
    position: 'absolute',
    top: 16,
    left: 16, 
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1, // Ensure it's clickable
  },
  bottomNavigation: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: hp(7),
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderRadius: 50,
    position: "absolute",
    bottom: hp(2.5),
    width: "90%",
    alignSelf: "center",
    paddingHorizontal: wp(4),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  navIcon: {
    width: 28,
    height: 28,
    resizeMode: "contain",
  },
  globeIcon: {
    width: 28, 
    height: 28,
    resizeMode: "contain",
  },
  notificationBadge: {
    position: "absolute",
    top: -2,
    right: -6,
    width: 8,
    height: 8,
    backgroundColor: "red",
    borderRadius: 4,
  },
  addButton: {
    position: 'absolute',
    right: wp(5), 
    bottom: hp(11), 
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary || '#dd528d', 
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3, 
    shadowRadius: 4,
    elevation: 6,
    zIndex: 10, 
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end', 
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)', 
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: wp(5), 
    paddingBottom: hp(4), 
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(2.5), 
  },
  modalTitle: {
    fontSize: hp(2.5), 
    fontWeight: '600',
    color: '#333', 
  },
  modalCloseButton: {
    padding: wp(2), 
  },
  imagePickerContainer: {
    flexDirection: 'row',
    marginBottom: hp(2.5),
  },
  addImageButton: {
    width: hp(12), 
    height: hp(12),
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)', 
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3),
    borderWidth: 1, 
    borderColor: 'rgba(0,0,0,0.1)',
  },
  addImageText: {
    marginTop: hp(1),
    fontSize: hp(1.8),
    color: '#555', 
  },
  selectedImageContainer: {
    width: hp(12),
    height: hp(12),
    marginRight: wp(3),
    borderRadius: 12,
    overflow: 'hidden',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: wp(1),
    right: wp(1),
    backgroundColor: 'rgba(0, 0, 0, 0.6)', 
    borderRadius: 12,
    padding: wp(0.5),
  },
  input: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 10, 
    padding: hp(1.8), 
    fontSize: hp(2),
    marginBottom: hp(2),
    color: '#333',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  textArea: {
    height: hp(12), 
    textAlignVertical: 'top',
  },
  createButton: {
    backgroundColor: theme.colors.primary || '#dd528d', 
    borderRadius: 10,
    padding: hp(2),
    alignItems: 'center',
    marginTop: hp(2),
  },
  createButtonDisabled: {
    backgroundColor: '#ccc',
  },
  createButtonText: {
    color: '#fff',
    fontSize: hp(2.2),
    fontWeight: '600',
  },
  emptyState: {
    flex: 1, 
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: hp(15), 
    paddingBottom: hp(5),
  },
  emptyStateText: {
    fontSize: hp(2), 
    color: 'rgba(255, 255, 255, 0.8)', 
    textAlign: 'center',
    marginTop: hp(2),
  },
});