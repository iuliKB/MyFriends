import { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Image, Text, TouchableOpacity, TextInput, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import ScreenWrapper from "../components/ScreenWrapper";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { hp, wp } from "../helpers/common";
import { firestore, auth } from '../firebaseConfig';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, where, getDocs, getDoc, doc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const flatListRef = useRef(null);
  const currentUser = auth.currentUser;
  const { friendId } = useLocalSearchParams();

  useEffect(() => {
    if (!currentUser || !friendId) return;

    // Fetch friend's data
    const fetchFriendData = async () => {
      try {
        const friendDoc = await getDoc(doc(firestore, 'users', friendId));
        if (friendDoc.exists()) {
          setSelectedFriend({ ...friendDoc.data(), uid: friendId });
        }
      } catch (error) {
        console.error('Error fetching friend data:', error);
      }
    };

    fetchFriendData();
  }, [currentUser, friendId]);

  useEffect(() => {
    if (!currentUser || !selectedFriend) return;

    // Create a unique chat ID for the two users
    const chatId = [currentUser.uid, selectedFriend.uid].sort().join('_');

    // Subscribe to messages
    const q = query(
      collection(firestore, `chats/${chatId}/messages`),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = [];
      snapshot.forEach((doc) => {
        newMessages.push({ id: doc.id, ...doc.data() });
      });
      setMessages(newMessages);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser, selectedFriend]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser || !selectedFriend) return;

    try {
      const chatId = [currentUser.uid, selectedFriend.uid].sort().join('_');
      
      await addDoc(collection(firestore, `chats/${chatId}/messages`), {
        text: newMessage.trim(),
        senderId: currentUser.uid,
        timestamp: serverTimestamp(),
      });

      setNewMessage('');
      flatListRef.current?.scrollToEnd();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const renderMessage = ({ item }) => {
    const isMyMessage = item.senderId === currentUser?.uid;

    return (
      <View style={[
        styles.messageContainer,
        isMyMessage ? styles.myMessage : styles.theirMessage
      ]}>
        <Text style={[
          styles.messageText,
          isMyMessage ? styles.myMessageText : styles.theirMessageText
        ]}>
          {item.text}
        </Text>
        <Text style={[
          styles.messageTime,
          isMyMessage ? styles.myMessageTime : styles.theirMessageTime
        ]}>
          {item.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#dd528d" />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={["#fbae52", "#dd528d", "#ff8c79"]}
      style={styles.gradientBackground}
    >
      <ScreenWrapper>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Image 
              source={selectedFriend?.profile_picture ? 
                { uri: selectedFriend.profile_picture } : 
                require("../assets/images/profile_photo.jpg")
              }
              style={styles.profileImage}
            />
            <View style={styles.headerText}>
              <Text style={styles.headerName}>{selectedFriend?.username || 'Chat'}</Text>
              <Text style={styles.headerStatus}>Online</Text>
            </View>
          </View>
        </View>

        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          inverted={false}
        />

        {/* Message Input */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.inputContainer}
        >
          <TextInput
            style={styles.input}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message..."
            placeholderTextColor="#999"
            multiline
          />
          <TouchableOpacity 
            style={[
              styles.sendButton,
              !newMessage.trim() && styles.sendButtonDisabled
            ]}
            onPress={sendMessage}
            disabled={!newMessage.trim()}
          >
            <Ionicons 
              name="send" 
              size={24} 
              color={newMessage.trim() ? '#dd528d' : '#999'} 
            />
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </ScreenWrapper>
    </LinearGradient>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp(4),
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    marginBottom: hp(2),
  },
  backButton: {
    marginRight: wp(3),
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: wp(3),
  },
  headerText: {
    flex: 1,
  },
  headerName: {
    fontSize: hp(2.2),
    fontWeight: 'bold',
  },
  headerStatus: {
    fontSize: hp(1.6),
    color: '#4CAF50',
  },
  messagesList: {
    padding: wp(4),
  },
  messageContainer: {
    maxWidth: '80%',
    marginVertical: hp(1),
    padding: wp(3),
    borderRadius: 20,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#dd528d',
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  messageText: {
    fontSize: hp(1.8),
    color: '#fff',
  },
  messageTime: {
    fontSize: hp(1.4),
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: hp(0.5),
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp(3),
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 25,
    margin: wp(3),
  },
  input: {
    flex: 1,
    fontSize: hp(1.8),
    maxHeight: hp(10),
    padding: wp(2),
  },
  sendButton: {
    padding: wp(2),
  },
  myMessageText: {
    color: '#fff',
  },
  theirMessageText: {
    color: '#333',
  },
  myMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  theirMessageTime: {
    color: 'rgba(0, 0, 0, 0.5)',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
