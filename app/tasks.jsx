import { StyleSheet, Text, View, TouchableOpacity, TextInput, Alert, ActivityIndicator, Modal, ScrollView, Animated, StatusBar } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../AuthContext';
import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { firestore } from '../firebaseConfig';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { hp, wp } from '../helpers/common';
import { Ionicons } from '@expo/vector-icons';

const PRIORITIES = {
  HIGH: { label: 'High Priority', color: '#FF4444' },
  MEDIUM: { label: 'Medium Priority', color: '#FFA500' },
  LOW: { label: 'Low Priority', color: '#4CAF50' },
};

const TasksPage = () => {
  const { user, userProfile } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('MEDIUM');
  const [loading, setLoading] = useState(true);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const modalAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (isAddModalVisible) {
      Animated.timing(modalAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(modalAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isAddModalVisible]);

  // Fetch tasks when component mounts
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const userRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setTasks(userData.tasks || []);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      Alert.alert('Error', 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const addTask = async () => {
    if (!newTaskTitle.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    try {
      const userRef = doc(firestore, 'users', user.uid);
      
      const newTask = {
        id: Date.now().toString(),
        title: newTaskTitle.trim(),
        completed: false,
        priority: selectedPriority,
        createdAt: new Date()
      };

      await updateDoc(userRef, {
        tasks: arrayUnion(newTask)
      });

      setTasks([...tasks, newTask]);
      setNewTaskTitle('');
      setIsAddModalVisible(false);
      Alert.alert('Success', 'Task added successfully!');
    } catch (error) {
      console.error('Error adding task:', error);
      Alert.alert('Error', 'Failed to add task');
    }
  };

  const toggleTaskCompletion = async (taskId) => {
    try {
      const updatedTasks = tasks.map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      );

      const userRef = doc(firestore, 'users', user.uid);
      await updateDoc(userRef, { tasks: updatedTasks });
      setTasks(updatedTasks);
    } catch (error) {
      console.error('Error updating task:', error);
      Alert.alert('Error', 'Failed to update task');
    }
  };

  const deleteTask = async (taskId) => {
    try {
      const updatedTasks = tasks.filter(task => task.id !== taskId);
      const userRef = doc(firestore, 'users', user.uid);
      await updateDoc(userRef, { tasks: updatedTasks });
      setTasks(updatedTasks);
      Alert.alert('Success', 'Task deleted successfully!');
    } catch (error) {
      console.error('Error deleting task:', error);
      Alert.alert('Error', 'Failed to delete task');
    }
  };


const renderTask = (task) => (
  <Animated.View 
    key={task.id} 
    style={[
      styles.taskItem,
      { 
        borderLeftWidth: 4,
        borderLeftColor: PRIORITIES[task.priority || 'MEDIUM'].color,
        opacity: fadeAnim,
        transform: [{
          translateX: fadeAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [50, 0]
          })
        }]
      }
    ]}
  >
    <TouchableOpacity 
      style={[styles.checkbox, task.completed && styles.checkboxChecked]}
      onPress={() => toggleTaskCompletion(task.id)}
    >
      {task.completed && (
        <Ionicons name="checkmark" size={16} color="#fff" />
      )}
    </TouchableOpacity>
    <View style={styles.taskContent}>
      <Text style={[
        styles.taskTitle, 
        task.completed && styles.taskTitleCompleted
      ]}>
        {task.title}
      </Text>
      <View style={styles.taskMeta}>
        <View style={[styles.priorityBadge, { backgroundColor: PRIORITIES[task.priority || 'MEDIUM'].color + '20' }]}>
          <Text style={[styles.priorityBadgeText, { color: PRIORITIES[task.priority || 'MEDIUM'].color }]}>
            {PRIORITIES[task.priority || 'MEDIUM'].label}
          </Text>
        </View>
        <Text style={styles.taskDate}>
          {/* Ensure createdAt is a Date object or a structure that toDate() can be called on if it's a Firestore Timestamp */}
          {new Date(task.createdAt?.toDate ? task.createdAt.toDate() : task.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </View>
    <TouchableOpacity 
      style={styles.deleteButton}
      onPress={() => {
        Alert.alert(
          'Delete Task',
          'Are you sure you want to delete this task?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', onPress: () => deleteTask(task.id), style: 'destructive' }
          ]
        );
      }}
    >
      <Ionicons name="trash-outline" size={20} color="#ff4444" />
    </TouchableOpacity>
  </Animated.View>
);
  const renderPrioritySection = (priority) => {
    const priorityTasks = tasks.filter(task => (task.priority || 'MEDIUM') === priority);
    if (priorityTasks.length === 0) return null;

    return (
      <View style={styles.prioritySection}>
        <View style={styles.priorityHeader}>
          <View style={styles.priorityTitleContainer}>
            <View style={[styles.priorityDot, { backgroundColor: PRIORITIES[priority].color }]} />
            <Text style={[styles.priorityTitle, { color: PRIORITIES[priority].color }]}>
              {PRIORITIES[priority].label}
            </Text>
          </View>
          <View style={styles.taskCount}>
            <Text style={styles.taskCountText}>{priorityTasks.length}</Text>
          </View>
        </View>
        {priorityTasks.map(task => renderTask(task))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#dd528d" />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={["#fbae52", "#dd528d", "#ff8c79"]}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButtonContainer}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>My Tasks</Text>
          <Text style={styles.subtitle}>{tasks.length} tasks</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.taskList} 
        contentContainerStyle={styles.taskListContent}
        showsVerticalScrollIndicator={false}
      >
        {renderPrioritySection('HIGH')}
        {renderPrioritySection('MEDIUM')}
        {renderPrioritySection('LOW')}
        
        {tasks.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="list-outline" size={60} color="rgba(255, 255, 255, 0.7)" />
            <Text style={styles.emptyStateText}>No tasks yet. Add your first task!</Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity 
        style={styles.floatingAddButton}
        onPress={() => setIsAddModalVisible(true)}
      >
        <LinearGradient
          colors={['#dd528d', '#ff8c79']}
          style={styles.addButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Ionicons name="add" size={24} color="#fff" />
          <Text style={styles.floatingAddButtonText}>New Task</Text>
        </LinearGradient>
      </TouchableOpacity>

      <Modal
        visible={isAddModalVisible}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalContainer}>
          <Animated.View 
            style={[
              styles.modalContent,
              {
                opacity: modalAnim,
                transform: [{
                  translateY: modalAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0]
                  })
                }]
              }
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Task</Text>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => {
                  setIsAddModalVisible(false);
                  setNewTaskTitle('');
                  setSelectedPriority('MEDIUM');
                }}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.input}
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
              placeholder="What needs to be done?"
              placeholderTextColor="#666"
              autoFocus={true}
            />

            <Text style={styles.priorityLabel}>Task Priority</Text>
            <View style={styles.priorityButtons}>
              {Object.entries(PRIORITIES).map(([key, value]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.priorityButton,
                    { backgroundColor: value.color },
                    selectedPriority === key && styles.priorityButtonSelected
                  ]}
                  onPress={() => setSelectedPriority(key)}
                >
                  <View style={styles.priorityButtonContent}>
                    <View style={[styles.priorityDot, { backgroundColor: '#fff' }]} />
                    <Text style={styles.priorityButtonText}>{value.label}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity 
              style={[
                styles.createTaskButton,
                !newTaskTitle.trim() && styles.createTaskButtonDisabled
              ]}
              onPress={addTask}
              disabled={!newTaskTitle.trim()}
            >
              <Text style={styles.createTaskButtonText}>Create Task</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: wp(4),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fbae52',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(2),
    marginTop: hp(4),
    position: 'relative',
  },
  backButtonContainer: {
    position: 'absolute',
    left: 0,
    zIndex: 1,
    padding: wp(2),
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: hp(0.5),
  },
  taskList: {
    flex: 1,
  },
  taskListContent: {
    paddingBottom: hp(10),
  },
  prioritySection: {
    marginBottom: hp(2),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: hp(2),
    marginHorizontal: wp(1),
  },
  priorityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp(2),
  },
  priorityTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: wp(2),
  },
  priorityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  taskCount: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.5),
  },
  taskCountText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 16,
    padding: hp(2),
    marginBottom: hp(1),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskContent: {
    flex: 1,
    marginLeft: wp(3),
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#dd528d',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#dd528d',
  },
  taskTitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#666',
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priorityBadge: {
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.5),
    borderRadius: 8,
  },
  priorityBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  taskDate: {
    fontSize: 12,
    color: '#666',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingAddButton: {
    position: 'absolute',
    bottom: hp(3),
    left: wp(4),
    right: wp(4),
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  addButtonGradient: {
    padding: hp(2),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingAddButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: wp(2),
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 25,
    padding: wp(5),
    width: wp(90),
    maxHeight: hp(80),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(3),
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: hp(2),
    fontSize: 16,
    marginBottom: hp(3),
  },
  priorityLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: hp(1.5),
  },
  priorityButtons: {
    flexDirection: 'column',
    marginBottom: hp(3),
  },
  priorityButton: {
    padding: hp(1.5),
    borderRadius: 12,
    marginBottom: hp(1),
  },
  priorityButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityButtonSelected: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  priorityButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: wp(2),
  },
  createTaskButton: {
    backgroundColor: '#dd528d',
    borderRadius: 12,
    padding: hp(2),
    alignItems: 'center',
  },
  createTaskButtonDisabled: {
    backgroundColor: '#ccc',
  },
  createTaskButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: hp(4),
  },
  emptyStateText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: hp(2),
  },
});

export default TasksPage; 