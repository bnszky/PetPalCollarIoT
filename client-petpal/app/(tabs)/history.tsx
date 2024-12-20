import { ActivityIndicator, FlatList, StyleSheet, Text, View, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import StatItem from '@/components/StatItem'
import { readData, removeInvalidData } from '../../scripts/reader'
import { MaterialIcons } from '@expo/vector-icons'
import { Colors } from '@/constants/Colors'
import FloatingButton from '@/components/FloatingButton'

interface PetData {
  id: string,
  heartRate: number,
  temperature: number,
  timestamp: Date
}

export default function HistoryPage() {

  const [petData, setPetData] = useState<PetData[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPetData = async () => {
    setLoading(true);
    const data = await readData();
    console.log(data);
    setPetData(data);
    setLoading(false);
  };

  useEffect(() => {
    removeInvalidData();
    fetchPetData();
  }, [])

  return (
    loading ? <View style={[styles.centerContainer, {backgroundColor: Colors.green.background}]}>
      <ActivityIndicator size="large" />
    </View> :
    <View style={[styles.container, {backgroundColor: Colors.green.background}]}>
      <Text style={styles.title}>History</Text>
      {petData.length === 0 ? 
      <View style={styles.centerContainer}>
        <Image source={require('../../assets/empty.jpg')} style={{width: 300, height: 300}} />
        <Text style={{fontWeight: 'bold', marginBottom: 10}}>Try Again</Text>
        <MaterialIcons name="refresh" size={36} color="black" onPress={fetchPetData} />
      </View>
      :
      <FlatList data={petData} renderItem={({item}) => <StatItem heartRate={item.heartRate} temperature={item.temperature} timestamp={item.timestamp} /> } />}
      {!loading && <FloatingButton color={Colors.green.secondary} onPress={fetchPetData} />}
    </View>
  )
}

const styles = StyleSheet.create({
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    container: {
      flex: 1,
      padding: 10,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 20,
    }
})