import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore"; 
import firebaseConfig from "./credentials.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const generateRandomData = () => {

  let heartRate = 85;
  let temperature = 37.5;
  let latitude = 41.3851;
  let longitude = 2.1734;
  let activity = "running";

  const random = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  heartRate = random(60, 100);  // Random heart rate
  temperature = 36.5 + random(0, 10) / 10.0;  // Random temperature
  latitude += random(0, 5) / 10000.0;  // Random location
  longitude += random(0, 5) / 10000.0;
  activity = (random(0, 2) == 0) ? "running" : "walking";  // Random activity
  const timestamp = new Date();  // Current timestamp

  return {
    timestamp,
    heartRate,
    temperature,
    latitude,
    longitude,
    activity
  };
}

export const addNewData = async (data) => {
  try {
    const docRef = await addDoc(collection(db, "petData"), data);
    console.log("Data written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding data: ", e);
  }
}