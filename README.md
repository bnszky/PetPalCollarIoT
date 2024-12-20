# Project Overview
Our project, PetCollar, aims to monitor a pet’s vital signs and activities in real time using a BLE (Bluetooth Low Energy) connection for device communication and Firebase as a cloud solution for data storage and analysis. We divided the project into two main components:
1. Microcontroller Part: BLE communication using the nrf52840_dk board with the BLEPeripheral library.
2. Cloud Service: Firebase setup for data storage and mobile app integration.
   
The microcontroller reads the pet's heart rate, temperature, location, and activity status, then transmits this data over BLE. The data is eventually stored in Firebase and can be accessed or analyzed by the mobile app.

![image](https://github.com/user-attachments/assets/1ae37158-571c-458d-be3c-44059067f7ef)

# Instalation
Go to client folder
```
cd client-petpal
```
Remember to install all required dependencies
```
npm I
```
Run project with web view
```
npm run web
```
or on your emulator
```
npm run android
npm run ios
```
If you want to have access to all features including Bluetooth connectivity you need to install .apk on your device. Android Studio and other tools don't provide this functionality
[Download latest .apk file](https://expo.dev/artifacts/eas/crDPngNDBZcbWiZ2ahzirt.apk)

# Data Structure

We decided to send data in JSON format which includes pet information:
```
{
	timestamp,
	heartRate: 60-100
	temperature: 30-45
	location: {
		latitude,
		longitude
	},
	activity: “running” | “walking” | “idle”
}
```
# How it works?

The microcontroller starts broadcasting its presence over a Bluetooth Low Energy (BLE) connection, making it discoverable by nearby devices. This allows a mobile app to locate and pair with it seamlessly. Once connected, the microcontroller begins transmitting pet health and activity data at regular intervals (every second, as specified in main.cpp). This data is continuously updated and sent from the microcontroller to the app, which then forwards it to the cloud for real-time storage and analysis.

In case the pet moves beyond the effective BLE range, the connection may drop, and the app will promptly notify the user, helping ensure the pet's location and status are monitored closely.

# Edge - Connecting
## Ensuring Connectivity and Providing Request Permissions

_Connectivity is obtained with ```react-native-ble-plx``` package_

After Clicking the Button “Connect” the app asks the user for location and Bluetooth permissions. This essential code for our connectivity is found in useBLE, which is a hook implemented in charge of handling data flow from the microcontroller to the app:

```
const requestAndroid31Permissions = async () => {
    const bluetoothScanPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      {
        title: "Location Permission",
        message: "Bluetooth Low Energy requires Location",
        buttonPositive: "OK",
      }
    );
    const bluetoothConnectPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      {
        title: "Location Permission",
        message: "Bluetooth Low Energy requires Location",
        buttonPositive: "OK",
      }
    );
    const fineLocationPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: "Location Permission",
        message: "Bluetooth Low Energy requires Location",
        buttonPositive: "OK",
      }
    );


    return (
      bluetoothScanPermission === "granted" &&
      bluetoothConnectPermission === "granted" &&
      fineLocationPermission === "granted"
    );
  };
```
## Scanning Peripherals
If our requests turn out to be successful we begin to scan peripherals. We are looking for a device that contains DEVICE_NAME.

```
const DEVICE_NAME = "Grup13_PetPal_IoT";
const scanForPeripherals = () =>
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log(error);
      }
      if (device && device.name?.includes(DEVICE_NAME)) {
        setAllDevices((prevState: Device[]) => {
          if (!isDuplicteDevice(prevState, device)) {
            return [...prevState, device];
          }
          return prevState;
        });
      }
    });
```
After that, we add the found device to the set of devices (allDevices)

## Connecting to device
If we have at least one device that meets our requirements, we will take the first device and try to connect. Below you can find the whole OnClickHandler with all steps described above

```
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
```
connectToDevice is a method that takes found Device and links to device using its Id:

```
const connectToDevice = async (device: Device) => {
    try {
      const deviceConnection = await bleManager.connectToDevice(device.id);
      setConnectedDevice(deviceConnection);
      await deviceConnection.discoverAllServicesAndCharacteristics();
      bleManager.stopDeviceScan();
      startStreamingData(deviceConnection);
    } catch (e) {
      console.log("FAILED TO CONNECT", e);
    }
  };
```
# Edge - Receiving Data from connected device
_Connectivity is obtained with ```firebase/compat/app&firestore``` packages_

After a successful connection, we set up a callback method for device.monitorCharacteristicForService for heartRate and temperature with UUID and Characteristic IDs, which were given:

```
const HEART_RATE_UUID = "180d";
const HEART_RATE_CHARACTERISTIC = "2a37";
const TEMPERATURE_UUID = "1809";
const TEMPERATURE_CHARACTERISTIC = "2a1c";
```
Then, our two variables are converted from binary representation to int and float respectively for heart rate and temperature. Then we display them in UI

# Edge/Cloud - Sending data to the cloud
As you can see, Our JSON format allows us to store more data. This is a flexible technique for extending this code to handle more future data and also provide consistency of Firebase tables.

We generate random data and swap fetched temperature and heart rate for this object.

Connecting with Firebase is pretty straightforward and requires just basic credentials: authDomain, projectID, storageBucket and appId. With that being said, sending JSON object to document database is obtained with this method:

```
export const addNewData = async (data) => {
  try {
    const docRef = await addDoc(collection(db, "petData"), data);
    console.log("Data written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding data: ", e);
  }
}
```

# Cloud/App - Fetching data from Cloud:
Fetching data is very friendly as well. After specifying the period we fetch all data extracting useful information (in our case only timestamps, temperatures and heartRates). Data is stored in an array and securely displayed in the FlatList component in the history layout.

```
export const readData = async () => {
  try {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - numberDays);
    console.log(twoWeeksAgo);


    const querySnapshot = await db.collection("petData")
      .orderBy("timestamp", "desc")
      .where("timestamp", ">", twoWeeksAgo)
      .get();
   
    console.log("Data retrieved:");
    console.log(querySnapshot.size);


    querySnapshot.forEach((doc) => {
      const { temperature, timestamp, heartRate } = doc.data();
      console.log(`${doc.id} => ${JSON.stringify({ temperature, timestamp, heartRate})}`);
    });


    const data = querySnapshot.docs.map((doc) => {
      return { id: doc.id, heartRate: doc.data().heartRate, temperature: doc.data().temperature, timestamp: doc.data().timestamp.toDate() };
    });


    return data;
  } catch (e) {
    console.error("Error reading data: ", e);
    return [];
  }
}
```

# Firebase configuration

![image](https://github.com/user-attachments/assets/bab64712-bbcb-404b-aae3-3b8da89a9f82)

__writer.js__
```
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore"; 
import firebaseConfig from "./credentials.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let heartRate = 85;
let temperature = 37.5;
let latitude = 41.3851;
let longitude = 2.1734;
let activity = "running";

const generateRandomData = () => {

  const random = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  heartRate = random(60, 100);  // Random heart rate
  temperature = 36.5 + random(0, 10) / 10.0;  // Random temperature
  latitude += random(0, 5) / 10000.0;  // Random location
  longitude += random(0, 5) / 10000.0;
  activity = (random(0, 2) == 0) ? "running" : "walking";  // Random activity
  const timestamp = new Date().toISOString();  // Current timestamp

  return {
    timestamp,
    heartRate,
    temperature,
    latitude,
    longitude,
    activity
  };
}

const addNewData = async (data) => {
  try {
    const docRef = await addDoc(collection(db, "petData"), data);
    console.log("Data written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding data: ", e);
  }
}

await addNewData(generateRandomData());
process.exit(0);
```

1. Connecting with Firebase Database

```
import firebaseConfig from "./credentials.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
```

2. Generating random data in the same way like in main.cpp

```
const generateRandomData = () => {

  const random = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  heartRate = random(60, 100);  // Random heart rate
  temperature = 36.5 + random(0, 10) / 10.0;  // Random temperature
  latitude += random(0, 5) / 10000.0;  // Random location
  longitude += random(0, 5) / 10000.0;
  activity = (random(0, 2) == 0) ? "running" : "walking";  // Random activity
  const timestamp = new Date().toISOString();  // Current timestamp

  return {
    timestamp,
    heartRate,
    temperature,
    latitude,
    longitude,
    activity
  };
}
```

3. Adding new data to the collection petData

```
const addNewData = async (data) => {
  try {
    const docRef = await addDoc(collection(db, "petData"), data);
    console.log("Data written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding data: ", e);
  }
}
```

4. Running method and kill node after executing

```
await addNewData(generateRandomData());
process.exit(0);
```

![image](https://github.com/user-attachments/assets/5611d675-dd3a-4a46-90ee-908a2de9d255)

