import { StyleSheet, Text, View, Platform, Dimensions } from "react-native";
import React, { useEffect, useState } from "react";
import MapView, { PROVIDER_DEFAULT, PROVIDER_GOOGLE } from "react-native-maps";
import { GOOGLE_MAPS_API_KEY } from "../config/keys";
import * as Location from "expo-location";
import axios from "axios";

const wh = Dimensions.get("window").height;

const OldMap = ({loadingLocation,setLoadingLocation}) => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationName, setLocationName] = useState("");
  

  // Request user location permission
  const checkPermission = async () => {
    const hasPermission = await Location.requestForegroundPermissionsAsync();
    if (hasPermission.status === "granted") {
      return true;
    }
    return false;
  };

  const getLocation = async () => {
    try {
      const { granted } = await Location.requestForegroundPermissionsAsync();
      if (!granted) return;

      const {
        coords: { latitude, longitude },
      } = await Location.getCurrentPositionAsync();

      setCurrentLocation({ latitude, longitude });
      getLocationName(latitude, longitude);
    } catch (error) {
      console.error(error);
    }
  };

  // Get location name using Google Maps Reverse Geocoding API
  const getLocationName = async (latitude, longitude) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`
      );

      if (response.data.results.length > 0) {
        const address = response.data.results[0].formatted_address;
        setLocationName(address);
      } else {
        setLocationName("Unknown Location");
      }
    } catch (error) {
      console.error("Error fetching location name:", error);
      setLocationName("Error fetching location");
    } finally {
      setLoadingLocation(false);
    }
  };

  useEffect(() => {
    checkPermission();
    getLocation();
  }, []);

  return (
    <View>
      <MapView
        // provider={Platform.OS === "ios" && PROVIDER_GOOGLE}
        mapType={Platform.OS === "android" ? "mutedStandard" : "mutedStandard"}
        provider={
          Platform.OS === "android" ? PROVIDER_GOOGLE : PROVIDER_DEFAULT
        }
        className="w-full h-full"
        style={{ height: wh - 300 }}
        showsUserLocation={true}
        followsUserLocation={true}
        initialRegion={{
          latitude:  28.450627,
          longitude: -16.263045,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        zoomEnabled={true}
      ></MapView>
    </View>
  );
};

export default OldMap;

const styles = StyleSheet.create({});
