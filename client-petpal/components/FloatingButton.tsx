import { StyleSheet, Text, TouchableOpacity, View, GestureResponderEvent } from 'react-native'
import React from 'react'
import { MaterialIcons } from "@expo/vector-icons";

interface FloatingButtonProps {
    onPress: (event: GestureResponderEvent) => void;
    color: string;
    icon?: keyof typeof MaterialIcons.glyphMap;
    iconColor?: string; // Make iconColor optional
}

const FloatingButton: React.FC<FloatingButtonProps> = ({ onPress, color, icon = "refresh", iconColor = 'white' }) => {
  return (
    <TouchableOpacity style={{
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: 60,
        position: 'absolute',
        bottom: 10,
        right: 10,
        height: 60,
        borderRadius: 100,
        backgroundColor: color,
        borderColor: color,
    }} onPress={onPress}>
      <MaterialIcons name={icon} size={30} color={iconColor} />
    </TouchableOpacity>
  )
}

export default FloatingButton