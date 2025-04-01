import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './HomeScreen';
import TeamScreen from './TeamScreen';
import CameraScreen from "./CameraScreen";
import RedditScreen from "./RedditScreen"; 
import { Ionicons } from '@expo/vector-icons'; // tab icons

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
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Camera') {
            iconName = focused ? 'camera' : 'camera-outline';
          } else if (route.name === 'Reddit') {
            iconName = focused ? 'logo-reddit' : 'logo-reddit';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#01DBC6', // teal color
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#1A1A1B', // dark color
          borderTopColor: '#343536', // dark border color
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
        headerShown: false, // hide the header for all tabs
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Team" component={TeamScreen} />
      <Tab.Screen name="Camera" component={CameraScreen} />
      <Tab.Screen name="Reddit" component={RedditScreen} />
    </Tab.Navigator>
  );
};

export default TabNavigator;