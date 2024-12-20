import firebaseConfig from "./credentials.js";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";

// Change this value to see data from the past {numberDays} days
const numberDays = 90;

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

export const removeInvalidData = async () => {
  try {
    const querySnapshot = await db.collection("petData")
      .where("heartRate", "==", 0)
      .get();

    querySnapshot.forEach(async (doc) => {
      console.log(`Deleting document with ID: ${doc.id}`);
      await doc.ref.delete();
    });

    const querySnapshotTemp = await db.collection("petData")
      .where("temperature", "==", 0)
      .get();

    querySnapshotTemp.forEach(async (doc) => {
      console.log(`Deleting document with ID: ${doc.id}`);
      await doc.ref.delete();
    });

    console.log("Invalid data removal completed.");
  } catch (e) {
    console.error("Error removing invalid data: ", e);
  }
};


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