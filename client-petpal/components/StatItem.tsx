import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { MaterialIcons } from '@expo/vector-icons'
import { formatDate } from "../scripts/helpful-methods"
import { Colors } from '@/constants/Colors'

interface StatItemProps {
    heartRate: number,
    temperature: number,
    timestamp: Date
}

const StatItem = ({ heartRate, temperature, timestamp }: StatItemProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <MaterialIcons name="heart-broken" size={24} color="red" />
        <Text> {heartRate} RpM </Text>
        <MaterialIcons name="thermostat" size={24} color="blue" />
        <Text> {temperature} °C </Text>
      </View>
      <View style={styles.timestampContainer}>
        <MaterialIcons name="schedule" size={24} color="black" />
        <Text style={styles.dataLabelText}> {formatDate(timestamp) }</Text>
      </View>
    </View>
  )
}

export default StatItem

const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderColor: 'black',
      borderWidth: 1,
      margin: 5,
      borderRadius: 5,
      padding: 10,
      backgroundColor: Colors.green.light,
    },
    iconContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    timestampContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    dataLabelText: {
      fontFamily: 'System',
      fontSize: 16,
    },
})