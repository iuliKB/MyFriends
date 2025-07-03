import { useEffect, useState } from 'react';
import { StyleSheet, View, Image, Text, TouchableOpacity, TextInput, Alert, ActivityIndicator, ScrollView } from "react-native";
import ScreenWrapper from "../components/ScreenWrapper"; // Asigură-te că acest import este corect
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { hp, wp } from "../helpers/common"; // Asigură-te că acest import este corect
import { theme } from '../constants/theme'; // Asigură-te că acest import este corect
import { firestore } from '../firebaseConfig'; // auth nu este folosit direct aici, dar e ok să fie importat din config
import { doc, getDoc, updateDoc, arrayUnion, query, where, getDocs, collection, documentId } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from "../AuthContext"; // Asigură-te că acest import este corect

const FriendDataItem = ({ friend, onChatPress, onRemovePress }) => {
  return(
    <View style={styles.friendItem}>
      <Image
        source={friend.profile_picture ? { uri: friend.profile_picture } : require('../assets/images/profile_photo.jpg')} // Asigură-te că path-ul la imaginea default este corect
        style={styles.friendProfileImage}
      />
      <View style={styles.friendTextContainer}>
        <Text style={styles.friendName} numberOfLines={1}>{friend.username || friend.email?.split('@')[0]}</Text>
      </View>
      <TouchableOpacity onPress={onChatPress} style={styles.actionButton}>
        <Ionicons name="chatbubble-ellipses-outline" size={hp(2.8)} color={theme.colors.primary || "#FF6F61"} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onRemovePress(friend.id)} style={[styles.actionButton, styles.removeButtonMargin]}>
        <Ionicons name="person-remove-outline" size={hp(2.7)} color={theme.colors.danger || "red"} />
      </TouchableOpacity>
    </View>
  );
};

const Friends = () => {
  const { user, userProfile } = useAuth();
  const [usernameToAdd, setUsernameToAdd] = useState('');
  const [userFriends, setUserFriends] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [isAddingFriend, setIsAddingFriend] = useState(false);
  const [isRemovingFriend, setIsRemovingFriend] = useState(null);

  const currentUser = user; 

  useEffect(() => {
    const fetchFriends = async () => {
      if (!currentUser) {
        setLoadingFriends(false);
        setUserFriends([]);
        return;
      }
      
      const currentUserUID = currentUser.uid;
      setLoadingFriends(true);

      try {
        const currentUserRef = doc(firestore, "users", currentUserUID);
        const currentUserDoc = await getDoc(currentUserRef);

        if (!currentUserDoc.exists()) {
            console.warn("Documentul utilizatorului curent nu a fost găsit în Firestore.");
            setLoadingFriends(false);
            return;
        }

        const currentUserData = currentUserDoc.data();
        const currentFriendsUIDs = currentUserData.friends || []; 
        
        if (currentFriendsUIDs.length === 0) {
          setUserFriends([]);
          setLoadingFriends(false);
          return;
        }
        
        // Interogare pentru a obține datele prietenilor
        // Firestore permite maxim 30 de elemente într-o clauză 'in' la interogări,
        // dacă ai mai mulți prieteni, va trebui să împarți în mai multe interogări.
        // Pentru majoritatea cazurilor, sub 30 de prieteni afișați simultan, este ok.
        const usersQuery = query(
          collection(firestore, "users"),
          where(documentId(), 'in', currentFriendsUIDs)
        );
        const usersSnapshot = await getDocs(usersQuery);
        const friendsData = usersSnapshot.docs.map(userDoc => ({
            id: userDoc.id,
            ...userDoc.data() 
        }));
        
        setUserFriends(friendsData);
      } catch (error) {
        console.error("Error fetching friends: ", error);
        Alert.alert("Eroare", "Nu s-au putut încărca prietenii.");
      } finally {
        setLoadingFriends(false);
      }
    };

    if (currentUser) { // Rulează fetchFriends doar dacă currentUser este disponibil
        fetchFriends();
    } else {
        setLoadingFriends(false);
        setUserFriends([]);
    }
  }, [currentUser]); // Rulează efectul când currentUser se schimbă

  const addFriend = async () => {
    if (!usernameToAdd.trim()) {
        Alert.alert("Câmp Necesar", "Te rugăm să introduci un nume de utilizator pentru a adăuga.");
        return;
    }
    if (!currentUser) {
        Alert.alert("Eroare de Autentificare", "Trebuie să fii autentificat pentru a adăuga prieteni.");
        return;
    }

    setIsAddingFriend(true);
    const currentUserUID = currentUser.uid;
    // IMPORTANT: Căutarea se face case-insensitive datorită convertirii la minuscule aici
    // și a presupunerii că în Firestore există un câmp 'username_lowercase'.
    const searchUsername = usernameToAdd.trim().toLowerCase();

    try {
      // Interogare pentru a găsi utilizatorul după username_lowercase.
      // Asigură-te că în Firestore, fiecare document de utilizator are un câmp
      // numit 'username_lowercase' care stochează numele de utilizator în minuscule.
      // Fără acest câmp în baza de date, căutarea nu va funcționa corect.
      const usersRef = collection(firestore, "users");
      const q = query(usersRef, where("username_lowercase", "==", searchUsername));
      const usersSnapshot = await getDocs(q);
      
      if (usersSnapshot.empty) {
        Alert.alert("Utilizator Negăsit", "Niciun utilizator găsit cu acest nume. Verifică dacă ai scris corect.");
        setIsAddingFriend(false);
        return;
      }

      const friendDoc = usersSnapshot.docs[0]; // Ia primul utilizator găsit (ar trebui să fie unic)
      const friendUID = friendDoc.id;
      const friendData = friendDoc.data();

      if (friendUID === currentUserUID) {
        Alert.alert("Acțiune Imposibilă", "Nu te poți adăuga pe tine însuți ca prieten.");
        setIsAddingFriend(false);
        return;
      }

      // Verifică dacă sunteți deja prieteni citind documentul curent al utilizatorului
      const currentUserRef = doc(firestore, "users", currentUserUID);
      const currentUserDocSnap = await getDoc(currentUserRef);
      const currentUserDataFromDb = currentUserDocSnap.data();
      const currentFriends = currentUserDataFromDb?.friends || [];

      if (currentFriends.includes(friendUID)) {
        Alert.alert("Deja Prieteni", `Ești deja prieten cu ${friendData.username || 'acest utilizator'}.`);
        setIsAddingFriend(false);
        return;
      }

      // Adaugă UID-ul prietenului în array-ul 'friends' al utilizatorului curent
      await updateDoc(currentUserRef, {
        friends: arrayUnion(friendUID)
      });
      
      // Actualizează starea locală pentru a reflecta adăugarea
      const newFriendForState = { id: friendUID, ...friendData };
      setUserFriends(prevFriends => [...prevFriends, newFriendForState].sort((a,b) => (a.username || "").localeCompare(b.username || "")));
      setUsernameToAdd(''); // Golește câmpul de input
      Alert.alert(
        "Prieten Adăugat", 
        `${friendData.username || 'Acest utilizator'} a fost adăugat în lista ta de prieteni.`
      );

    } catch (error) {
      // Logare mai detaliată a erorii pentru depanare
      console.error("Eroare detaliată la adăugarea prietenului: ", JSON.stringify(error, Object.getOwnPropertyNames(error)));
      Alert.alert("Eroare la Adăugare", error.message || "Ceva nu a funcționat corect. Te rugăm să încerci din nou.");
    } finally {
        setIsAddingFriend(false);
    }
  };

  const handleRemoveFriend = async (friendIdToRemove) => {
    Alert.alert(
      "Șterge Prieten",
      `Sigur dorești să elimini acest prieten din listă? Această acțiune nu poate fi anulată.`,
      [
        { text: "Anulează", style: "cancel" },
        { 
          text: "Șterge", 
          onPress: async () => {
            if (!currentUser) return;
            setIsRemovingFriend(friendIdToRemove);
            try {
              const currentUserRef = doc(firestore, "users", currentUser.uid);
              const currentUserDoc = await getDoc(currentUserRef); // Re-citește documentul pentru a avea cea mai recentă listă
              if (currentUserDoc.exists()) {
                const currentUserData = currentUserDoc.data();
                const updatedFriendsArray = (currentUserData.friends || []).filter(uid => uid !== friendIdToRemove);
                
                await updateDoc(currentUserRef, {
                  friends: updatedFriendsArray
                });

                setUserFriends(prevFriends => prevFriends.filter(friend => friend.id !== friendIdToRemove));
                Alert.alert("Succes", "Prietenul a fost eliminat din listă.");
              }
            } catch (error) {
              console.error("Eroare la ștergerea prietenului: ", error);
              Alert.alert("Eroare", "Nu s-a putut elimina prietenul. Te rugăm să încerci din nou.");
            } finally {
              setIsRemovingFriend(null);
            }
          },
          style: "destructive" 
        }
      ]
    );
  };

  const navigateToChat = (friend) => {
    router.push({ 
        pathname: 'chat', 
        params: { 
            friendId: friend.id, 
            friendUsername: friend.username, 
            friendProfilePicture: friend.profile_picture 
        } 
    });
  };

  const myDisplayName = userProfile?.username || currentUser?.email?.split('@')[0] || "Profilul Meu";
  const myProfilePicture = userProfile?.profile_picture 
    ? { uri: userProfile.profile_picture } 
    : require('../assets/images/profile_photo.jpg'); // Asigură-te că path-ul la imaginea default este corect

  return (
    <LinearGradient
      colors={theme.gradients?.background || ["#fbae52", "#dd528d", "#ff8c79"]} 
      style={styles.gradientBackground}
    >
      <ScreenWrapper>
        <View style={styles.userHeader}>
            <Image 
                source={myProfilePicture}
                style={styles.myProfileImage}
            />
            <View style={styles.headerTextContainer}>
                <Text style={styles.myNameProfileText}>{myDisplayName}</Text>
            </View>
        </View>
        
        <Text style={styles.pageTitle}>Conexiunile Mele</Text>

        <View style={styles.addFriendSection}>
            <TextInput
                style={styles.input}
                placeholder="Introdu numele de utilizator al prietenului"
                value={usernameToAdd}
                onChangeText={setUsernameToAdd}
                placeholderTextColor={theme.colors.text_secondary_dark || "#A9A9A9"}
                autoCapitalize="none"
                onSubmitEditing={addFriend} // Permite adăugarea la apăsarea 'send' pe tastatură
                returnKeyType="send"
            />
            <TouchableOpacity onPress={addFriend} style={styles.addFriendButton} disabled={isAddingFriend || !usernameToAdd.trim()}>
                {isAddingFriend ? (
                    <ActivityIndicator size="small" color="#fff" />
                ) : (
                    <Ionicons name="person-add" size={hp(2.4)} color="#fff" />
                )}
            </TouchableOpacity>
        </View>

        {loadingFriends ? (
            <ActivityIndicator size="large" color={theme.colors.text_light || "#fff"} style={styles.loader} />
        ) : (
            <ScrollView style={styles.friendsListScrollView} showsVerticalScrollIndicator={false}>
                {userFriends.length > 0 ? (
                    userFriends.map((friend) => (
                        <FriendDataItem 
                            key={friend.id} 
                            friend={friend} 
                            onChatPress={() => navigateToChat(friend)}
                            onRemovePress={handleRemoveFriend}
                        />
                    ))
                ) : (
                    <View style={styles.noFriendsContainer}>
                        <Ionicons name="people-circle-outline" size={hp(10)} color={"rgba(255,255,255,0.5)"} />
                        <Text style={styles.noFriendsText}>Încă nu ai conexiuni.</Text>
                        <Text style={styles.noFriendsSubText}>Găsește prieteni după numele lor de utilizator!</Text>
                    </View>
                )}
                <View style={{ height: hp(2) }} />{/* Spațiu la finalul listei */}
            </ScrollView>
        )}

        {/* Bottom Navigation - Asigură-te că path-urile la iconițe sunt corecte */}
        <View style={styles.bottomNavigation}>
          <TouchableOpacity onPress={() => router.push("homepage")}><Image source={require("../assets/icons/home_icon.png")} style={styles.navIcon} /></TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("friends")}><View><Image source={require("../assets/icons/friends_icon.png")} style={styles.navIconActive} /><View style={styles.notificationBadge} /></View></TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("map")}><Image source={require("../assets/icons/globe_icon.png")} style={styles.navIcon} /></TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("calendar")}><Image source={require("../assets/icons/calendar_icon.png")} style={styles.navIcon} /></TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("myaccount")}><Image source={require("../assets/icons/profile_icon.png")} style={styles.navIcon} /></TouchableOpacity>
        </View>
      </ScreenWrapper>
    </LinearGradient>
  );
};

export default Friends;

// Stilurile rămân aceleași ca în fișierul original. 
// Asigură-te că sunt definite corect și corespund nevoilor tale.
const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  loader: {
    marginTop: hp(10),
  },
  userHeader: { 
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(5),
    paddingVertical: hp(2.5),
    marginBottom: hp(2),
    backgroundColor: 'rgba(255,255,255,0.1)', 
    borderRadius: 20,
    marginHorizontal: wp(4),
    marginTop: hp(2), 
  },
  myProfileImage: { 
    width: wp(14), 
    height: wp(14),
    borderRadius: wp(7),
    borderWidth: 2,
    borderColor: theme.colors.text_light || 'rgba(255,255,255,0.8)',
  },
  headerTextContainer: { 
    marginLeft: wp(4), 
    flex:1,
  },
  myNameProfileText: { 
    fontSize: hp(2.5), 
    fontWeight: "bold",
    color: theme.colors.text_light || '#fff',
  },
  pageTitle: { 
    color: theme.colors.text_light || "#fff",
    fontSize: hp(3.5), 
    textAlign: "center",
    fontWeight: "700", 
    marginBottom: hp(2.5),
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
  addFriendSection: { 
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(2), 
    marginBottom: hp(3),
    marginHorizontal: wp(4),
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: wp(7), 
    paddingLeft: wp(5), 
  },
  input: {
    flex: 1,
    paddingVertical: hp(1.8), 
    fontSize: hp(1.9), 
    color: theme.colors.text_light || '#fff',
    marginRight: wp(2),
  },
  addFriendButton: {
    backgroundColor: theme.colors.primary || "#FF6F61",
    borderRadius: wp(6), 
    padding: hp(1.5), 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  friendsListScrollView: { 
    flex: 1, 
    paddingHorizontal: wp(4),
  },
  friendItem: { 
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "rgba(255,255,255,0.95)", 
    paddingVertical: hp(1.5), 
    paddingHorizontal: wp(4),
    marginVertical: hp(0.8), 
    borderRadius: 18, 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, 
    shadowRadius: 4,
    elevation: 4, 
  },
  friendProfileImage: { 
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    marginRight: wp(3.5),
    borderWidth: 1.5,
    borderColor: theme.colors.secondary || '#ddd' 
  },
  friendTextContainer: {
    flex: 1, 
    justifyContent: 'center',
  },
  friendName: {
    fontSize: hp(2), 
    fontWeight: "600", 
    color: theme.colors.text_dark || "#2C3E50", 
  },
  actionButton: {
    padding: wp(1.5),
  },
  removeButtonMargin: {
    marginLeft: wp(1),
  },
  noFriendsContainer: { 
    flex:1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: hp(5), 
    paddingBottom: hp(5),
  },
  noFriendsText: {
    fontSize: hp(2.2), 
    fontWeight: '600',
    color: theme.colors.text_secondary_light || "rgba(255,255,255,0.8)",
    textAlign: "center",
    marginTop: hp(2),
  },
  noFriendsSubText: {
    fontSize: hp(1.8),
    color: theme.colors.text_secondary_light || "rgba(255,255,255,0.6)",
    textAlign: "center",
    marginTop: hp(1),
    paddingHorizontal: wp(10),
  },
  bottomNavigation: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: hp(7.5),
    backgroundColor: "rgba(255, 255, 255, 0.38)",
    borderRadius: hp(3.75),
    position: "absolute",
    bottom: hp(2.5),
    left: wp(4),
    right: wp(4),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  navIcon: {
    width: hp(3.3),
    height: hp(3.3),
    resizeMode: "contain",
    opacity: 0.8, 
  },
  navIconActive: { 
    width: hp(3.5),
    height: hp(3.5),
    resizeMode: "contain",
    opacity: 1,
    tintColor: theme.colors.primary || '#FF6F61', 
  },
  notificationBadge: {
    position: "absolute",
    top: -hp(0.3),
    right: -wp(0.7),
    width: wp(1.8),
    height: wp(1.8),
    backgroundColor: theme.colors.accent || "red", // Asigură-te că theme.colors.accent este definit
    borderRadius: wp(0.9),
    borderWidth: 1,
    borderColor: '#fff',
  },
});