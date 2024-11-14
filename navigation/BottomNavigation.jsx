import React from 'react';
import { View, StyleSheet } from 'react-native';

import { CommonActions } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import SettingsScreen from '../Screens/SettingsScreen';
import TripsScreen from '../Screens/TripsScreen';
import HomeScreen from '../Screens/HomeScreen';


const Tab = createBottomTabNavigator();

export default function BottomNavigation() {
  return (
   <Tab.Navigator
   screenOptions={{
    tabBarActiveTintColor:"red",
   }}
   >
    <Tab.Screen
    options={{
      headerShown:false,
      tabBarLabel:"Home",
      tabBarIcon:({ focused,color,size }) => (
        <Icon name="home" size={26} color={focused? "red":"gray"} />
      ),
    }}
    name="Home" component={HomeScreen}/>
    <Tab.Screen
    options={{
      headerShown:false,
      tabBarLabel:"Trips",
      tabBarIcon:({ focused,color,size }) => (
        <Icon name="book-alphabet" size={26} color={focused? "red":"gray"} />
      ),
    }}
    name="Trips" component={TripsScreen}/>
    <Tab.Screen
    options={{
      headerShown:false,
      tabBarLabel:"Settings",
      tabBarIcon:({ focused,color,size }) => (
        <Icon name="cog" size={26} color={focused? "red":"gray"} />
      ),
    }}
    name="Settings" component={SettingsScreen}/>
   </Tab.Navigator>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});