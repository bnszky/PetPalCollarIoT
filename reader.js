import firebaseConfig from "./credentials.js";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

export const readData = async () => {
  try {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
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
    process.exit(0); // quit
  } catch (e) {
    console.error("Error reading data: ", e);
    process.exit(1); // err
  }
}

await readData();