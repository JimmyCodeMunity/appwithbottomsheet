import { StyleSheet, Text, View } from "react-native";
import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../Screens/HomeScreen";
import SplashScreen from "../Screens/SplashScreen";
import { Home } from "react-native-feather";
import RegisterScreen from "../Screens/RegisterScreen";
import LoginScreen from "../Screens/LoginScreen";
import SearchScreen from "../Screens/SearchScreen";
import BottomNavigation from "./BottomNavigation";
import { AuthContext } from "../context/AuthContext";

const Stack = createNativeStackNavigator();

const StackNavigation = () => {
  const { isLoggedIn } = useContext(AuthContext);
  let initialRoute = "Landing"; // Default route
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={isLoggedIn ? initialRoute : "Splash"}>
        {!isLoggedIn ? (
          <>
            <Stack.Screen
              name="Splash"
              component={SplashScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ headerShown: false,presentation:'modal' }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Landing"
              component={BottomNavigation}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Search"
              component={SearchScreen}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default StackNavigation;

const styles = StyleSheet.create({});
