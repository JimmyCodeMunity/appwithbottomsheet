import React, {
    forwardRef,
    useCallback,
    useImperativeHandle,
    useEffect,
    useState,
  } from "react";
  import { StyleSheet, Text, View, Dimensions, TextInput, Pressable } from "react-native";
  import { GestureDetector, Gesture } from "react-native-gesture-handler";
  import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
  } from "react-native-reanimated";
  
  import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { ActivityIndicator } from "react-native-paper";
  
  const windowHeight = Dimensions.get("window").height;
  
  const SearchingDriver = forwardRef(({ children,searching,setSearching}, ref) => {
    const navigation = useNavigation();
  
    const translateY = useSharedValue(windowHeight); // Start fully hidden
    const context = useSharedValue({ y: 0 });
    const active = useSharedValue(false);
  
    const MAX_TRANSLATE_Y = -windowHeight + 70;
  
    // Scroll effect to set position
    const scrollTo = useCallback((destination) => {
      "worklet";
      active.value = destination !== windowHeight; // Set active based on position
      translateY.value = withSpring(destination, { damping: 50 });
    }, []);
  
    const isActive = useCallback(() => {
      return active.value; // Return the current active state
    }, [active.value]);
  
    // Use ref to expose methods
    useImperativeHandle(ref, () => ({
      scrollTo,
      isActive,
    }));
  
    const gesture = Gesture.Pan()
      .onStart(() => {
        context.value = { y: translateY.value };
      })
      .onUpdate((event) => {
        translateY.value = event.translationY + context.value.y;
        translateY.value = Math.max(translateY.value, MAX_TRANSLATE_Y);
      })
      .onEnd(() => {
        if (translateY.value > -windowHeight / 0.5) {
          scrollTo(windowHeight); // Reset to fully hidden
        } else if (translateY.value < -windowHeight / 1.5) {
          scrollTo(MAX_TRANSLATE_Y); // Show the component
        }
      });
  
    useEffect(() => {
      scrollTo(windowHeight); // Ensure it's hidden on mount
    }, []);
  
    const bottomSheetStyle = useAnimatedStyle(() => {
      return {
        transform: [
          {
            translateY: translateY.value,
          },
        ],
      };
    });
  
    const activeStyle = useAnimatedStyle(() => {
      return {
        opacity: active.value ? 1 : 0.5, // Change opacity based on active state
        backgroundColor: active.value ? "#f0f0f0" : "#fff", // Change background color
      };
    });
  
    
    
    
  
    
  
  
    return (
      <GestureDetector gesture={gesture}>
        <Animated.View
          className="bg-white rounded-t-5 px-2 w-full"
          style={[styles.bottomsheet, bottomSheetStyle, activeStyle]}
        >
          <View className="w-full justify-center items-center">
            <View
              className={`${
                translateY.value !== windowHeight && "bg-blue-500"
              } bg-gray-400 h-1 w-20 rounded-xl`}
            ></View>
          </View>
  
          <View className="w-full px-4 py-5 space-y-4">
            <Text className="text-2xl text-slate-500 font-semibold">
              Looking for a Cab?
            </Text>
  
            <View className="w-full my-8 h-full justify-center items-center">
                <ActivityIndicator size="large" color="red"/>
              
  
             <Text>Searching drivers...</Text>
             <Pressable className="h-12 w-60 rounded-md justify-center items-center bg-red-400" onPress={()=>setSearching(false)}>
                <Text className="text-white">Cancel</Text>
             </Pressable>
            </View>
          </View>
        </Animated.View>
      </GestureDetector>
    );
  });
  
  export default SearchingDriver;
  
  const styles = StyleSheet.create({
    bottomsheet: {
      height: windowHeight,
      width: "100%",
      backgroundColor: "white",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      overflow: "hidden",
      position: "absolute",
      top: windowHeight, // Start fully hidden
    },
    
  });
  