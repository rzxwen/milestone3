import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './HomeScreen';
import TeamScreen from './TeamScreen';
import CameraScreen from "./CameraScreen"; // Import the TabNavigator


import { Ionicons } from '@expo/vector-icons'; // For tab icons

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Team') {
            iconName = focused ? 'team' : 'people-circle-outline';
          } else if (route.name === 'Camera') {
            iconName = focused ? 'camera' : 'camera-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'blue', // Color for the active tab
        tabBarInactiveTintColor: 'gray', // Color for inactive tabs
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Team" component={TeamScreen} /> 
      <Tab.Screen name="Camera" component={CameraScreen} /> 


    </Tab.Navigator>
  );
};

export default TabNavigator;