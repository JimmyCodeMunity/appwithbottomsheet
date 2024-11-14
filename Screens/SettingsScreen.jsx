import { Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

const SettingsScreen = () => {
  const {userdata,logout} = useContext(AuthContext)

  const handleLogout = ()=>{
    logout();
  }
  return (
    <View className="flex-1 justify-center items-center">
      <Text>{userdata?.userdata?.name}</Text>
      <Pressable onPress={handleLogout}>
        <Text>Logout</Text>
      </Pressable>
    </View>
  )
}

export default SettingsScreen

const styles = StyleSheet.create({})