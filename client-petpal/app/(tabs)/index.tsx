import ParallaxScrollView from "@/components/ParallaxScrollView";
import { Colors } from "@/constants/Colors";
import { MaterialIcons } from "@expo/vector-icons";
import { Text, View, StyleSheet, Button, Touchable, TouchableOpacity } from "react-native";
import { generateRandomData, addNewData } from "../../scripts/writer";
import { useEffect, useState } from "react";
import useBLE from "../../hooks/useBLE";

interface Data {
  timestamp: Date;
  heartRate: number;
  temperature: number;
  latitude: number;
  longitude: number;
  activity: string;
}

export default function Index() {

  const { requestPermissions, scanForPeripherals, connectToDevice,
    allDevices,
    disconnectFromDevice,
    heartRate, temperature} = useBLE();

  // const [data, setData] = useState<Data | null>(null);
  const [isConnected, setIsConnected] = useState<'Yes' | 'No' | 'Loading'>('No');;

  const connect = async () => {
    setIsConnected('Loading');
    try{
      const isPermissionGranted = await requestPermissions();
      if (isPermissionGranted) {
        scanForPeripherals();
        console.log('Permission granted');

        // Wait for 10 seconds
        setTimeout(async () => {
          if (allDevices.length > 0) {
            const device = allDevices[0];
            await connectToDevice(device);
            setIsConnected('Yes');
          } else {
            console.log('No devices found');
            setIsConnected('No');
          }
        }, 10000); // 10 seconds
      }
      else {
        console.log('Permission denied');
        setIsConnected('No');
      }
    } catch (error) {
      console.log(error);
      setIsConnected('No');
    }
  }

  const disconnect = () => {
    disconnectFromDevice();
    setIsConnected('No');
  }

  // useEffect(() => {
  //   let interval: NodeJS.Timeout;
  //   if (isConnected) {
  //     interval = setInterval(() => {
  //       const newData = generateRandomData();
  //       setData(newData);
  //       addNewData(newData);
  //     }, 2000);
  //   }
  //   return () => clearInterval(interval);
  // }, [isConnected]);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.green.background }}>
      <View style={styles.centerContainer}>
        <Text style={styles.titleText}>Show data in real time</Text>
        <View style={styles.rowContainer}>
          <View style={styles.dataContainer}>
            <MaterialIcons name="heart-broken" size={36} color="red" />
            <Text>Heart Rate</Text>
            <Text style={[styles.dataValueText, { color: 'red' }]}>{heartRate ?? 'N/A'} RpM</Text>
          </View>
          <View style={styles.dataContainer}>
            <MaterialIcons name="thermostat" size={36} color="blue" />
            <Text>Temperature</Text>
            <Text style={[styles.dataValueText, { color: 'blue' }]}>{temperature ?? 'N/A'} C</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity
        style={[
          styles.connectButton,
          isConnected === 'Loading' && { opacity: 0.5 },
        ]}
        disabled={isConnected === 'Loading'}
        onPress={() => isConnected === 'Yes' ? disconnect() : connect()}
      >
        <Text style={{ textAlign: 'center' }}>
          {isConnected === 'Loading' ? 'Connecting...' : isConnected === 'Yes' ? 'Disconnect' : 'Connect'}
        </Text>
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
