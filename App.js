import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import StackNavigation from "./navigation/StackNavigation";
import { AuthProvider } from "./context/AuthContext";
import { SocketContextProvider } from "./context/SocketContext";
import { CurrentStateProvider } from "./context/CurrentStateContext";

export default function App() {
  return (
    <AuthProvider>
      <SocketContextProvider>
        <CurrentStateProvider>
          <StackNavigation />
        </CurrentStateProvider>
      </SocketContextProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({});
