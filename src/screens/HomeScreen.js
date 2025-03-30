import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Animated, PanResponder, Dimensions } from "react-native";

const { height, width } = Dimensions.get('window');

// Data
const dailyTasks = [
  { id: 1, name: "Daily Training", completed: false, rewards: "Credits, EXP" },
  { id: 2, name: "Complete 1 Calyx (Golden)", completed: false, rewards: "Relic EXP" },
  { id: 3, name: "Complete 1 Calyx (Crimson)", completed: false, rewards: "Trace Materials" },
  { id: 4, name: "Complete 1 Stagnant Shadow", completed: false, rewards: "Ascension Materials" },
];

const news = [
  { id: 1, title: "Version 3.1 Update Coming Next Week", date: "March 25, 2025" },
  { id: 2, title: "New Trailblazer Story Chapter Released", date: "March 22, 2025" },
];

const banners = [
  { id: 1, character: "Silver Wolf", type: "Character", endDate: "April 10, 2025" },
  { id: 2, character: "Kafka", type: "Character", endDate: "April 10, 2025" }
];

const resources = [
  { id: 1, name: "March 7th Ascension", required: "10x Enhancement Ore", collected: "5x", remaining: "5x" },
];

const HonkaiStarRailApp = () => {
  const [activeTab, setActiveTab] = useState("news");
  const [tasks, setTasks] = useState(dailyTasks);
  const drawerHeight = height * 0.4;
  const peekHeight = 30; // Increased peek height for better visibility
  const drawerPosition = useRef(new Animated.Value(drawerHeight - peekHeight)).current;

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (evt, gestureState) => {
      const newPosition = Math.max(0, Math.min(drawerHeight - peekHeight, drawerPosition._value + gestureState.dy));
      drawerPosition.setValue(newPosition);
    },
    onPanResponderRelease: (evt, gestureState) => {
      if (gestureState.vy < -0.5 || drawerPosition._value < (drawerHeight - peekHeight) / 2) {
        // Open fully
        Animated.spring(drawerPosition, {
          toValue: 0,
          useNativeDriver: false,
          bounciness: 0,
        }).start();
      } else {
        // Return to peek state
        Animated.spring(drawerPosition, {
          toValue: drawerHeight - peekHeight,
          useNativeDriver: false,
          bounciness: 0,
        }).start();
      }
    },
  });

  const toggleTask = (taskId) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const toggleDrawer = () => {
    Animated.spring(drawerPosition, {
      toValue: drawerPosition._value > (drawerHeight - peekHeight) / 2 ? 0 : drawerHeight - peekHeight,
      useNativeDriver: false,
      bounciness: 0,
    }).start();
  };

  return (
    <View style={styles.container}>
      {/* Main Content */}
      <View style={styles.contentWrapper}>
        <Text style={styles.title}>Honkai Star Rail Tracker</Text>

        {/* Tab buttons */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, activeTab === "news" && styles.toggleButtonActive]}
            onPress={() => setActiveTab("news")}
          >
            <Text style={styles.toggleButtonText}>News</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, activeTab === "banners" && styles.toggleButtonActive]}
            onPress={() => setActiveTab("banners")}
          >
            <Text style={styles.toggleButtonText}>Banners</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, activeTab === "resources" && styles.toggleButtonActive]}
            onPress={() => setActiveTab("resources")}
          >
            <Text style={styles.toggleButtonText}>Resources</Text>
          </TouchableOpacity>
        </View>

        {/* Tab content */}
        <View style={styles.contentContainer}>
          {activeTab === "news" && (
            <FlatList
              data={news}
              renderItem={({ item }) => (
                <View style={styles.newsItem}>
                  <Text style={styles.newsTitle}>{item.title}</Text>
                  <Text style={styles.newsDate}>{item.date}</Text>
                </View>
              )}
              keyExtractor={item => item.id.toString()}
            />
          )}

          {activeTab === "banners" && (
            <FlatList
              data={banners}
              renderItem={({ item }) => (
                <View style={styles.bannerItem}>
                  <Text style={styles.bannerTitle}>{item.character}</Text>
                  <Text style={styles.bannerType}>{item.type} Banner</Text>
                  <Text style={styles.bannerDate}>Ends: {item.endDate}</Text>
                </View>
              )}
              keyExtractor={item => item.id.toString()}
            />
          )}

          {activeTab === "resources" && (
            <FlatList
              data={resources}
              renderItem={({ item }) => (
                <View style={styles.resourceItem}>
                  <Text style={styles.resourceName}>{item.name}</Text>
                  <Text style={styles.resourceDetails}>Required: {item.required}</Text>
                  <Text style={styles.resourceDetails}>Collected: {item.collected}</Text>
                  <Text style={styles.resourceDetails}>Remaining: {item.remaining}</Text>
                </View>
              )}
              keyExtractor={item => item.id.toString()}
            />
          )}
        </View>
      </View>

      {/* Swipeable Drawer - Now definitely visible! */}
      <Animated.View
        style={[
          styles.drawer,
          {
            height: drawerHeight + peekHeight, // Extra space for the handle
            transform: [{ translateY: drawerPosition }],
          }
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={styles.drawerHandleContainer}
          onPress={toggleDrawer}
          activeOpacity={0.8}
        >
          <View style={styles.drawerHandle} />
        </TouchableOpacity>
        <Text style={styles.drawerTitle}>Daily Tasks</Text>
        <FlatList
          data={tasks}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.taskItem, item.completed && styles.taskCompleted]}
              onPress={() => toggleTask(item.id)}
            >
              <Text style={[styles.taskText, item.completed && styles.taskTextCompleted]}>
                {item.name}
              </Text>
              <Text style={styles.taskReward}>{item.rewards}</Text>
              {item.completed && <Text style={styles.taskCheck}>✓</Text>}
            </TouchableOpacity>
          )}
          keyExtractor={item => item.id.toString()}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  contentWrapper: {
    flex: 1,
    padding: 16,
    marginBottom: 30, // Space for the drawer handle to peek
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#01DBC6",
    textAlign: "center",
    marginTop: 50,
    marginBottom: 20,
  },
  toggleContainer: {
    flexDirection: "row",
    marginBottom: 20,
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: "#1e1e1e",
  },
  toggleButton: {
    borderRadius: 6,
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
  },
  toggleButtonActive: {
    backgroundColor: "rgba(1, 219, 198, 0.2)",
    borderWidth: 1,
    borderColor: '#01DBC6',
  },
  toggleButtonText: {
    color: "#ffffff",
    fontWeight: "500",
  },
  contentContainer: {
    flex: 1,
  },
  newsItem: {
    padding: 15,
    backgroundColor: "#1E1E1E",
    marginBottom: 10,
    borderRadius: 10,
  },
  newsTitle: {
    color: "#01DBC6",
    fontSize: 18,
  },
  newsDate: {
    color: "#AAAAAA",
    fontSize: 14,
    marginTop: 5,
  },
  bannerItem: {
    padding: 15,
    backgroundColor: "#1E1E1E",
    marginBottom: 10,
    borderRadius: 10,
  },
  bannerTitle: {
    color: "#01DBC6",
    fontSize: 18,
  },
  bannerType: {
    color: "#AAAAAA",
    fontSize: 14,
  },
  bannerDate: {
    color: "#AAAAAA",
    fontSize: 14,
  },
  resourceItem: {
    padding: 15,
    backgroundColor: "#1E1E1E",
    marginBottom: 10,
    borderRadius: 10,
  },
  resourceName: {
    color: "#01DBC6",
    fontSize: 18,
  },
  resourceDetails: {
    color: "#AAAAAA",
    fontSize: 14,
  },
  // Drawer styles - guaranteed visible now
  drawer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -30, // This ensures the handle peeks out
    backgroundColor: '#1e1e1e',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    paddingTop: 10,
    zIndex: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  drawerHandleContainer: {
    alignItems: 'center',
    paddingBottom: 10,
  },
  drawerHandle: {
    width: 60,
    height: 6,
    backgroundColor: '#01DBC6',
    borderRadius: 3,
  },
  drawerTitle: {
    color: '#01DBC6',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  taskItem: {
    backgroundColor: '#252525',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskCompleted: {
    backgroundColor: '#1a2a1a',
    opacity: 0.7,
  },
  taskText: {
    color: '#ffffff',
    fontSize: 16,
    flex: 1,
  },
  taskTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#AAAAAA',
  },
  taskReward: {
    color: '#FFD700',
    fontSize: 14,
    marginRight: 10,
  },
  taskCheck: {
    color: '#01DBC6',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HonkaiStarRailApp;