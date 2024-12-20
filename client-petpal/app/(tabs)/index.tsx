import { Colors } from "@/constants/Colors";
import { MaterialIcons } from "@expo/vector-icons";
import { Text, View, StyleSheet, Button, Touchable, TouchableOpacity, Alert } from "react-native";
import { generateRandomData, addNewData } from "../../scripts/writer";
import { useEffect, useState } from "react";
import useBLE from "../../hooks/useBLE";
import SubmitButton from "@/components/SubmitButton";

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

  const [data, setData] = useState<Data | null>(null);
  const [isConnected, setIsConnected] = useState<'Yes' | 'No' | 'Loading'>('No');
  const [alertText, setAlertText] = useState<string>('');

  const showAlert = ({title, desc} : any) => {
    Alert.alert(title, desc, [{text: "Ok"}], {cancelable: true});
  }

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
            showAlert({title: 'No devices found', desc: 'Please make sure the device is turned on and nearby.'});
            setIsConnected('No');
          }
        }, 10000);
      }
      else {
        console.log('Permission denied');
        showAlert({title: 'Permission denied', desc: 'Please enable location permissions to connect to the device.'});
        setIsConnected('No');
      }
    } catch (error) {
      console.log(error);
      showAlert({title: 'Error', desc: 'An error occurred while connecting to the device.'});
      setIsConnected('No');
    }
  }

  const disconnect = () => {
    disconnectFromDevice();
    setIsConnected('No');
  }

  const checkHelathCondition = (heartRate: number, temperature: number) => {
    if (heartRate === null || temperature === null) {
      return null;
    }
    if ((heartRate < 60 || heartRate > 100) && (temperature < 36 || temperature > 37)) {
      return 'Heart rate and temperature are abnormal!';
    }
    if (heartRate < 60 || heartRate > 100) {
      return 'Heart rate is abnormal!';
    }
    if (temperature < 36 || temperature > 37) {
      return 'Temperature is abnormal!';
    }
    return null;
  }

  useEffect(() => {
    const fetchData = async () => {
      if (isConnected === "Yes") {
          const info = checkHelathCondition(heartRate, temperature);
          setAlertText(info ?? '');
          const newData = generateRandomData();
          newData.heartRate = heartRate;
          newData.temperature = temperature;
          setData(newData);
          addNewData(newData);
      }
    };
    fetchData();
  }, [isConnected, heartRate, temperature]);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.green.background }}>
      <View style={styles.centerContainer}>
        <Text style={styles.titleText}>Show data in real time</Text>
        <View style={styles.rowContainer}>
          <View style={styles.dataContainer}>
            <MaterialIcons name="heart-broken" size={36} color="red" />
            <Text style={[styles.dataLabelText]}>Heart Rate</Text>
            <Text style={[styles.dataValueText, { color: 'red' }]}>{heartRate ?? 'N/A'} RpM</Text>
          </View>
          <View style={styles.dataContainer}>
            <MaterialIcons name="thermostat" size={36} color="blue" />
            <Text style={[styles.dataLabelText]}>Temperature</Text>
            <Text style={[styles.dataValueText, { color: 'blue' }]}>{temperature ?? 'N/A'} C</Text>
          </View>
        </View>
        <Text style={[styles.titleText, {color: "red", marginVertical: 25}]}>{alertText}</Text>
      </View>
      <SubmitButton 
        title={isConnected === 'Loading' ? 'Connecting...' : isConnected === 'Yes' ? 'Disconnect' : 'Connect'} 
        onClickHandler={() => isConnected === 'Yes' ? disconnect() : connect()} 
        isDisabled={isConnected === 'Loading'} />
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
  dataLabelText: {
    fontFamily: 'System',
    fontSize: 16,
  },
})
