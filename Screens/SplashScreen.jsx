import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React from "react";
import { StatusBar } from "expo-status-bar";

const SplashScreen = ({navigation}) => {
  return (
    <View className="flex-1 bg-white justify-center items-center">
      <StatusBar style="auto" />
      <Text className="text-red-500 text-3xl tracking-wide">Haram'ad</Text>
      <View className="absolute space-y-4 bottom-10 justify-center items-center w-full">
        <TouchableOpacity
        onPress={()=>navigation.navigate("Login")}
        className="bg-red-500 h-12 w-80 rounded-md justify-center items-center">
          <Text className="text-white text-2xl">Login</Text>
        </TouchableOpacity>
        <TouchableOpacity
        onPress={()=>navigation.navigate("Register")}
        className="bg-white border border-1 border-red-500 h-12 w-80 rounded-md justify-center items-center">
          <Text className="text-red-500 text-2xl">Sign up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({});
