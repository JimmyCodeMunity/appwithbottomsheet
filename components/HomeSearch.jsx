import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useEffect,
  useState,
} from "react";
import { StyleSheet, Text, View, Dimensions, TextInput } from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import PlaceRow from "./PlaceRow";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";

const windowHeight = Dimensions.get("window").height;

const HomeSearch = forwardRef(({ children,setCurrentLocation,currentLocation,setFrom, setDestination ,setOriginPlace,setDestinationPlace}, ref) => {
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

  
  
  

  const homeplace = {
    description: "Home",
    geometry: { location: { lat: 37.7749, lng: -122.4194 } },
  };
  const workplace = {
    description: "Workplace",
    geometry: { location: { lat: 37.7771, lng: -122.4196 } },
  };

  // const checkNavigation = () => {
  //   console.warn("navigation called");
  //   if (originPlace && destinationPlace) {
  //     // console.log("origin",originPlace,"destination", destinationPlace);
  //     console.warn("redirect to resluts page");
  //     // navigation.navigate("Search", {
  //     //   origin: originPlace,
  //     //   destination: destinationPlace,
  //     //   currentLocation: currentLocation,
  //     // });
  //   }
  // };

  // useEffect(() => {
  //   checkNavigation();
  // }, [originPlace, destinationPlace]);

  const checkPermision = async () => {
    const hasPermission = await Location.requestForegroundPermissionsAsync();
    if (hasPermission.status === "granted") {
      const permission = await askPermision();
      return permission;
    }
    return true;
  };

  const askPermision = async () => {
    const permission = await Location.requestForegroundPermissionsAsync();
    return permission.status === "granted";
  };

  const getLocation = async () => {
    try {
      const { granted } = await Location.requestForegroundPermissionsAsync();
      if (!granted) return;
      const {
        coords: { latitude, longitude },
      } = await Location.getCurrentPositionAsync();

      setCurrentLocation({ latitude: latitude, longitude: longitude });
      setLatlng({ latitude: latitude, longitude: longitude });
      // console.log("cordis",{ latitude: latitude, longitude: longitude })
    } catch (error) {}
  };

  //current location
  

  if (currentLocation) {
    const current = {
      description: "Current",
      geometry: {
        location: {
          lat: currentLocation.latitude,
          lng: currentLocation.longitude,
        },
      },
    };
  }
  useEffect(() => {
    checkPermision();
    getLocation();
    // console.log(latlng)
  }, []);


  // save the locations in async
  // const saveLocation = async (location) => {
  //   try {
  //     const storedLocations = await AsyncStorage.getItem('savedLocations');
  //     const locations = storedLocations ? JSON.parse(storedLocations) : [];
  
  //     // Check if the location already exists in the array
  //     const exists = locations.find((loc) => loc.data.place_id === location.data.place_id);
  //     if (!exists) {
  //       // Add the new location and store it back to AsyncStorage
  //       locations.push(location);
  //       await AsyncStorage.setItem('savedLocations', JSON.stringify(locations));
  //     }
  //   } catch (error) {
  //     console.error("Error saving location", error);
  //   }
  // };

  const saveLocation = async (location) => {
    try {
      const storedLocations = await AsyncStorage.getItem('savedLocations');
      const locations = storedLocations ? JSON.parse(storedLocations) : [];
  
      // Check if the location already exists in the array
      const exists = locations.find((loc) => loc.data.place_id === location.data.place_id);
      if (!exists) {
        // Add the new location and store it back to AsyncStorage
        locations.push({
          description: location.data.description, // Save the name of the place
          geometry: location.details.geometry,   // Save the lat/lng details
        });
        await AsyncStorage.setItem('savedLocations', JSON.stringify(locations));
        console.log("Location saved:", location);
      } else {
        console.log("Location already exists:", location);
      }
    } catch (error) {
      console.error("Error saving location", error);
    }
  };
  
  

  const getSavedLocations = async () => {
    try {
      const storedLocations = await AsyncStorage.getItem('savedLocations');
      return storedLocations ? JSON.parse(storedLocations) : [];
    } catch (error) {
      console.error("Error fetching locations", error);
      return [];
    }
  };
  
  // Function to get the most frequently accessed location
  const getMostFrequentLocation = async () => {
    const locations = await getSavedLocations();
  
    // Calculate frequency of each location
    const frequencyMap = locations.reduce((acc, loc) => {
      const key = loc.data.description;  // You can adjust this based on how you identify locations
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  
    // Find the most frequent location
    let mostFrequentLocation = null;
    let maxCount = 0;
  
    for (const location in frequencyMap) {
      if (frequencyMap[location] > maxCount) {
        maxCount = frequencyMap[location];
        mostFrequentLocation = location;
      }
    }
  
    return mostFrequentLocation;
  };

  useEffect(() => {
    const fetchMostFrequent = async () => {
      const mostFrequent = await getMostFrequentLocation();
      if (mostFrequent) {
        setPredefinedPlaces((prevPlaces) => [
          ...prevPlaces,
          { description: mostFrequent, geometry: { location: { lat: 0, lng: 0 } } }, // Replace lat, lng with real data if needed
        ]);
      }
    };
  
    fetchMostFrequent();
  }, []);

  const [predefinedPlaces, setPredefinedPlaces] = useState([homeplace, workplace]);


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

          <View className="w-full my-8 h-full">
            {/* <TextInput
            className="w-full bg-slate-200 p-3 rounded-md"
            placeholder="From"
            placeholderTextColor="gray"
            value={from}
            onChangeText={(text) => setFrom(text)}
          />
          <TextInput
            className="w-full bg-slate-200 p-3 rounded-md"
            placeholder="Where to?"
            placeholderTextColor="gray"
            value={destination}
            onChangeText={(text) => setDestination(text)}
          /> */}

            <GooglePlacesAutocomplete
              placeholder="Coming from"
              onPress={async(data, details = null) => {
                await saveLocation({ data, details });
                // 'details' is provided when fetchDetails = true
                // console.log(data, details);
                const mainLocation = data.description.split(",")[0];
                setOriginPlace({ data, details });
                setFrom(mainLocation)
                console.log("geometry",data?.details?.geometry?.location)
                // checkNavigation();
              }}
              currentLocation={true}
              currentLocationLabel="Current"
              userLocation={true}
              fetchDetails={true}
              query={{
                key: "AIzaSyDdUQ1EIQJB46n2RSusQro1qP3Pd4mGZcA",
                language: "en",
                //   location: currentLocation ? `${currentLocation.latitude},${currentLocation.longitude}` : null,
                // radius: 50000,
              }}
              styles={{
                textInput: styles.textInput,
                container: styles.autocompleteContainer,
                listView: styles.listView,
                separator: styles.separator,
              }}
              renderRow={(data) => <PlaceRow data={data} />}
              predefinedPlacesAlwaysVisible={true}
              // predefinedPlaces={[homeplace, workplace]}
              predefinedPlaces={predefinedPlaces}
            />
            <GooglePlacesAutocomplete
              placeholder="Going to?"
              onPress={(data, details = null) => {
                const mainLocation = data.description.split(",")[0];
                setDestinationPlace({ data, details });
                setDestination(mainLocation)
                scrollTo(windowHeight)
                // checkNavigation();
              }}
              enablePoweredByContainer={false}
              // suppressDefaultStyles
              styles={{
                textInput: styles.textInput,
                container: {
                  ...styles.autocompleteContainer,
                  top: 55,
                },
                separator: styles.separator,
              }}
              fetchDetails={true}
              query={{
                key: "AIzaSyDdUQ1EIQJB46n2RSusQro1qP3Pd4mGZcA",
                language: "en",
              }}
              // predefinedPlacesAlwaysVisible={true}
              //   predefinedPlaces={[homeplace,workplace]}
              renderRow={(data) => <PlaceRow data={data} />}
              predefinedPlaces={predefinedPlaces}
            />

            {/* Circle near Origin input */}
            <View style={styles.circle} />

            {/* Line between dots */}
            <View style={styles.line} />

            {/* Square near Destination input */}
            <View style={styles.square} />
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
});

export default HomeSearch;

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
  container: {
    padding: 10,
    height: "100%",
  },
  textInput: {
    padding: 10,
    backgroundColor: "#eee",
    marginVertical: 5,
    marginLeft: 20,
  },

  separator: {
    backgroundColor: "#efefef",
    height: 1,
  },
  listView: {
    position: "absolute",
    top: 105,
  },

  autocompleteContainer: {
    position: "absolute",
    top: 0,
    left: 10,
    right: 10,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  iconContainer: {
    backgroundColor: "#a2a2a2",
    padding: 5,
    borderRadius: 50,
    marginRight: 15,
  },
  locationText: {},

  circle: {
    width: 5,
    height: 5,
    backgroundColor: "black",
    position: "absolute",
    top: 20,
    left: 15,
    borderRadius: 5,
  },
  line: {
    width: 1,
    height: 50,
    backgroundColor: "#c4c4c4",
    position: "absolute",
    top: 28,
    left: 17,
  },
  square: {
    width: 5,
    height: 5,
    backgroundColor: "black",
    position: "absolute",
    top: 80,
    left: 15,
  },
});
