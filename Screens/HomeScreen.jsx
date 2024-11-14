import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Platform,
} from "react-native";
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import MapView, {
  PROVIDER_GOOGLE,
  PROVIDER_DEFAULT,
  Marker,
} from "react-native-maps";
import { StatusBar } from "expo-status-bar";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import MapViewDirections from "react-native-maps-directions";
import HomeSearch from "../components/HomeSearch";
import { Image } from "react-native";
import { Alert } from "react-native";
import axios from "axios";
import { io } from "socket.io-client";
import { BASE_URL, GOOGLE_MAPS_API_KEY, SOCKET_URL } from "../config";
import { useSocketContext } from "../context/SocketContext";
import { AuthContext } from "../context/AuthContext";
import SearchingDriver from "../components/SearchingDriver";
import { CurrentStateContext } from "../context/CurrentStateContext";

const windowHeight = Dimensions.get("window").height; // Add your Google Maps API Key here

const HomeScreen = () => {
  const [from, setFrom] = useState("");
  const [destination, setDestination] = useState("");
  const [originPlace, setOriginPlace] = useState(null); // Stores the origin place details
  const [destinationPlace, setDestinationPlace] = useState(null); // Stores the destination place details
  const ref = useRef(null);
  const searchref = useRef(null);
  const mapRef = useRef(null);
  const [loadinglocation, setLoadingLocation] = useState(false);
  const { userdata } = useContext(AuthContext);
  const { currentLocation, locationName,setCurrentLocation,setSearching, drivers, searching, findDriver } =
    useContext(CurrentStateContext);

  if (originPlace && destinationPlace !== null) {
    console.log("origin and destination is", originPlace, destinationPlace);
  }

  const ShowSearch = useCallback(() => {
    const isActive = ref?.current?.isActive();
    if (!isActive) {
      ref?.current?.scrollTo(-windowHeight + 50);
    }
  }, []);
  const ShowSearching = useCallback(() => {
    const isActive = searchref?.current?.isActive();
    if (!isActive) {
      searchref?.current?.scrollTo(-windowHeight + 500);
    }
  }, []);

  // Extract coordinates from origin and destination details
  // const originLoc = originPlace?.details?.geometry?.location;
  // const destinationLoc = destinationPlace?.details?.geometry?.location;
  const originloc = {
    latitude: originPlace?.details?.geometry?.location?.lat,
    longitude: originPlace?.details?.geometry?.location?.lng,
  };

  const destinationloc = {
    latitude: destinationPlace?.details?.geometry?.location?.lat,
    longitude: destinationPlace?.details?.geometry?.location?.lng,
  };
  // console.log("Origin Location:", originloc);
  // console.log("Destination Location:", destinationloc);
  useEffect(() => {
    if (mapRef.current) {
      mapRef?.current?.fitToCoordinates([originloc, destinationloc], {
        edgePadding: {
          top: 50,
          right: 50,
          bottom: 50,
          left: 50,
        },
        animated: true,
      });
    }
  }, [originloc, destinationloc]);
  if (currentLocation) {
    console.log("current location isat", currentLocation);
    // getLocationName(currentLocation?.latitude, currentLocation?.latitude);
  }

  // find driver

  console.log("current region", currentLocation?.latitude?.toFixed(4));

  const roundedlat = parseFloat(currentLocation?.latitude?.toFixed(4));
  const roundedlong = parseFloat(currentLocation?.longitude?.toFixed(4));

  // initite socket effect

  const userId = userdata?.userdata?._id;
  const { socket } = useSocketContext();

  // if(searching){
  //   ShowSearching();
  // }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <MapView
          ref={mapRef}
          mapType={
            Platform.OS === "android" ? "mutedStandard" : "mutedStandard"
          }
          provider={
            Platform.OS === "android" ? PROVIDER_GOOGLE : PROVIDER_DEFAULT
          }
          showsUserLocation={true}
          followsUserLocation={destinationPlace ? false : true}
          zoomEnabled={true}
          // onTouchStart={ShowSearch}
          initialRegion={{
            latitude: originloc?.latitude || -1.2822, // Fallback to a default value if null
            longitude: originloc?.longitude || 36.8155,
            // latitudeDelta: 0.1,
            // longitudeDelta: 0.1,
            latitudeDelta: 0.5,
            longitudeDelta: 0.5,
          }}
          style={styles.map}
        >
          {/* Show directions only when both origin and destination are set */}
          {originPlace && destinationPlace && (
            <MapViewDirections
              origin={originloc}
              destination={destinationloc}
              apikey={GOOGLE_MAPS_API_KEY}
              strokeWidth={5}
              strokeColor="black"
            />
          )}

          {/* pointing coordinates */}
          {originloc?.latitude != null && (
            <Marker coordinate={originloc} anchor={{ x: 0.5, y: 0.5 }}>
              <Image
                source={require("../assets/loc1.png")}
                className="object-contain h-12 w-12"
                style={styles.markerDestination}
                resizeMode="cover"
              />
            </Marker>
          )}
          {destinationloc?.latitude != null && (
            <Marker coordinate={destinationloc} anchor={{ x: 0.5, y: 0.5 }}>
              <Image
                source={require("../assets/loc2.png")}
                className="object-contain h-12 w-12"
                style={styles.markerOrigin2}
                resizeMode="cover"
              />
            </Marker>
          )}

          {drivers.map((driver) => {
            console.log("latdriver", driver.location.coordinates[0]);
            return (
              <Marker
                key={driver._id}
                coordinate={{
                  latitude: driver.location.coordinates[0],
                  longitude: driver.location.coordinates[1],
                }}
                title={driver.name}
              >
                <Image
                  source={require("../assets/car.png")}
                  style={{
                    width: 30,
                    height: 30,
                  }}
                />
              </Marker>
            );
          })}
        </MapView>

        <View
          className="w-full px-5 py-10 items-center space-y-2 rounded-t-3xl shadow shadow-xl shadow-slate-400 bg-white"
          style={{ height: windowHeight * 0.6 }}
        >
          <View className="w-full py-4 space-y-6">
            <TouchableOpacity onPress={ShowSearch}>
              <View className="flex-row items-center w-full px-4 h-12 rounded-md">
                <View style={styles.circleMarker}>
                  <View style={styles.innerCircle} />
                </View>
                <Text style={styles.locationText}>
                  {locationName !== null ? (
                    <Text style={styles.locationText}>
                      {from ? from : locationName?.split(",")[0]}
                    </Text>
                  ) : (
                    <Text style={styles.locationText}>
                      Locating you on the map...
                    </Text>
                  )}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={ShowSearch}>
              <View className="bg-slate-200 space-x-1 px-4 rounded-lg flex-row w-full h-12 justify-start items-center">
                <Icon name="magnify" size={30} color="gray" />
                <Text className="text-slate-500 text-xl">
                  {destination ? destination : "To"}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {destinationPlace && (
            <View className="w-full justify-center items-center">
              <TouchableOpacity
                onPress={findDriver(originloc,destinationloc)}
                className="bg-red-500 justify-center h-12 rounded-lg w-60 items-center"
              >
                <Text style={styles.findDriverText}>Find Driver</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <HomeSearch
          ref={ref}
          setFrom={setFrom}
          setDestination={setDestination}
          setDestinationPlace={setDestinationPlace}
          setOriginPlace={setOriginPlace}
          setCurrentLocation={setCurrentLocation}
          currentLocation={currentLocation}
        />
        <SearchingDriver
          ref={searchref}
          searching={searching}
          setSearching={setSearching}
        />
      </View>
    </GestureHandlerRootView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  map: {
    height: "100%",
    width: "100%",
  },

  searchContainer: {
    width: "100%",
    marginBottom: 20,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  circleMarker: {
    backgroundColor: "black",
    height: 24,
    width: 24,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  innerCircle: {
    backgroundColor: "white",
    height: 12,
    width: 12,
    borderRadius: 6,
  },
  locationText: {
    fontSize: 18,
    color: "#4A4A4A",
    marginLeft: 10,
  },
  destinationInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e0e0e0",
    borderRadius: 10,
    padding: 10,
  },
  findDriverContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  findDriverButton: {
    height: 50,
    width: "90%",
    backgroundColor: "black",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  findDriverText: {
    fontSize: 18,
    color: "white",
  },
});
