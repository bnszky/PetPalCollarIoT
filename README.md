# Project Overview
Our project, PetCollar, aims to monitor a pet’s vital signs and activities in real time using a BLE (Bluetooth Low Energy) connection for device communication and Firebase as a cloud solution for data storage and analysis. We divided the project into two main components:
1. Microcontroller Part: BLE communication using the nrf52840_dk board with the BLEPeripheral library.
2. Cloud Service: Firebase setup for data storage and mobile app integration.
   
The microcontroller reads the pet's heart rate, temperature, location, and activity status, then transmits this data over BLE. The data is eventually stored in Firebase and can be accessed or analyzed by the mobile app.

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

The microcontroller begins pinging and allows other devices to see them via BLE connection. Then it’s possible to pair it with a mobile app. If our microcontroller is already connected we can start sending data in a specific range of time (1 second in _main.cpp_). Data is updated and transmitted via app to the cloud where it is analyzed and modified if its necessary. If the dog/pet runs too far away we might lose connection but the user will be informed in the app.

# Code for BLE integration
__main.cpp__
```
#include <BLEPeripheral.h>

// Define the BLE service and characteristics
BLEPeripheral blePeripheral;
BLEService petPalService("180F");  // Custom service UUID
BLECharacteristic heartRateCharacteristic("2A37", BLERead | BLENotify, 2);  // Heart rate characteristic
BLECharacteristic temperatureCharacteristic("2A6E", BLERead | BLENotify, 2);  // Temperature characteristic
BLECharacteristic locationCharacteristic("2A69", BLERead | BLENotify, 20);  // Location characteristic
BLECharacteristic activityCharacteristic("2A68", BLERead | BLENotify, 20);  // Activity characteristic

// Simulated data
int heartRate = 85;
float temperature = 37.5;
float latitude = 41.3851;
float longitude = 2.1734;
String activity = "running";

void setup() {
  Serial.begin(9600);
  
  // Set up BLE
  blePeripheral.setLocalName("PetPal Collar");
  blePeripheral.setAdvertisedServiceUuid(petPalService.uuid());
  blePeripheral.addService(petPalService);

  petPalService.addCharacteristic(heartRateCharacteristic);
  petPalService.addCharacteristic(temperatureCharacteristic);
  petPalService.addCharacteristic(locationCharacteristic);
  petPalService.addCharacteristic(activityCharacteristic);
  
  blePeripheral.begin();
  
  Serial.println("PetPal Collar is advertising...");
}

void loop() {
  // Simulate data change
  heartRate = random(60, 100);  // Random heart rate
  temperature = 36.5 + random(0, 10) / 10.0;  // Random temperature
  latitude += random(0, 5) / 10000.0;  // Random location
  longitude += random(0, 5) / 10000.0;
  activity = (random(0, 2) == 0) ? "running" : "walking";  // Random activity

  // Create JSON string
  String jsonData = createJsonData();

  // Update characteristics with new data
  heartRateCharacteristic.setValue(heartRate);
  temperatureCharacteristic.setValue(temperature);
  locationCharacteristic.setValue(jsonData);  // Send location as JSON string
  activityCharacteristic.setValue(activity);

  // Notify connected devices
  heartRateCharacteristic.notify();
  temperatureCharacteristic.notify();
  locationCharacteristic.notify();
  activityCharacteristic.notify();

  delay(1000);  // Delay before the next update
}

String createJsonData() {
  // Create JSON string for location data
  String jsonData = "{";
  jsonData += "\"heartRate\": " + String(heartRate) + ",";
  jsonData += "\"temperature\": " + String(temperature) + ",";
  jsonData += "\"location\": {";
  jsonData += "\"latitude\": " + String(latitude, 4) + ",";
  jsonData += "\"longitude\": " + String(longitude, 4);
  jsonData += "},";
  jsonData += "\"activity\": \"" + activity + "\"";
  jsonData += "}";
  
  return jsonData;
}
```

1. Firstly we set up local name to make it visible for our mobile app and
run peripheral 

```
  blePeripheral.setLocalName("PetPal Collar");
  blePeripheral.setAdvertisedServiceUuid(petPalService.uuid());
  blePeripheral.addService(petPalService);
```

2. we run our methods in a loop with 1000 microseconds delay to provide data constantly
   after generating data we convert them to JSON format and notify() other devices

```
void loop() {
  // Simulate data change
  heartRate = random(60, 100);  // Random heart rate
  temperature = 36.5 + random(0, 10) / 10.0;  // Random temperature
  latitude += random(0, 5) / 10000.0;  // Random location
  longitude += random(0, 5) / 10000.0;
  activity = (random(0, 2) == 0) ? "running" : "walking";  // Random activity

  // Create JSON string
  String jsonData = createJsonData();

  // Update characteristics with new data
  heartRateCharacteristic.setValue(heartRate);
  temperatureCharacteristic.setValue(temperature);
  locationCharacteristic.setValue(jsonData);  // Send location as JSON string
  activityCharacteristic.setValue(activity);

  // Notify connected devices
  heartRateCharacteristic.notify();
  temperatureCharacteristic.notify();
  locationCharacteristic.notify();
  activityCharacteristic.notify();

  delay(1000);  // Delay before the next update
}
```

3. Basic function for generating new data

```
String createJsonData() {
  // Create JSON string for location data
  String jsonData = "{";
  jsonData += "\"heartRate\": " + String(heartRate) + ",";
  jsonData += "\"temperature\": " + String(temperature) + ",";
  jsonData += "\"location\": {";
  jsonData += "\"latitude\": " + String(latitude, 4) + ",";
  jsonData += "\"longitude\": " + String(longitude, 4);
  jsonData += "},";
  jsonData += "\"activity\": \"" + activity + "\"";
  jsonData += "}";
  
  return jsonData;
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



