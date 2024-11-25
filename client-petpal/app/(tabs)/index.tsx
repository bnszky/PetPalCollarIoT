import ParallaxScrollView from "@/components/ParallaxScrollView";
import { Colors } from "@/constants/Colors";
import { MaterialIcons } from "@expo/vector-icons";
import { Text, View, StyleSheet, Button, Touchable, TouchableOpacity } from "react-native";
import { generateRandomData, addNewData } from "../../scripts/writer";
import { useEffect, useState } from "react";

interface Data {
  timestamp: Date;
  heartRate: number;
  temperature: number;
  latitude: number;
  longitude: number;
  activity: string;
}

export default function Index() {
  const [data, setData] = useState<Data | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isConnected) {
      interval = setInterval(() => {
        const newData = generateRandomData();
        setData(newData);
        addNewData(newData);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isConnected]);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.green.background }}>
      <View style={styles.centerContainer}>
        <Text style={styles.titleText}>Show data in real time</Text>
        <View style={styles.rowContainer}>
          <View style={styles.dataContainer}>
            <MaterialIcons name="heart-broken" size={36} color="red" />
            <Text>Heart Rate</Text>
            <Text style={[styles.dataValueText, { color: 'red' }]}>{data?.heartRate ?? 'N/A'} RpM</Text>
          </View>
          <View style={styles.dataContainer}>
            <MaterialIcons name="thermostat" size={36} color="blue" />
            <Text>Temperature</Text>
            <Text style={[styles.dataValueText, { color: 'blue' }]}>{data?.temperature ?? 'N/A'} C</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity
        style={styles.connectButton}
        onPress={() => setIsConnected(!isConnected)}
      >
        <Text style={{ textAlign: 'center' }}>{isConnected ? 'Disconnect' : 'Connect'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dataContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'black',
    padding: 10,
    margin: 10,
    width: 150,
    height: 150,
    backgroundColor: Colors.green.light,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  dataValueText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  connectButton: {
    backgroundColor: Colors.green.primary,
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 80,
    marginBottom: 50,
  },
})
