import { StyleSheet, Text, View, Platform } from "react-native";
import React from "react";
import MapView, { PROVIDER_DEFAULT, PROVIDER_GOOGLE } from "react-native-maps";

const Mapview = () => {
    
  return (
    <View>
      <MapView
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE:PROVIDER_DEFAULT}
        showsUserLocation={true}
        initialRegion={{
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        className="h-full w-full"
      />
    </View>
  );
};

export default Mapview;

const styles = StyleSheet.create({});
