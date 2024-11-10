import firebaseConfig from "./credentials.js";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const readData = async () => {
  try {
    const querySnapshot = await db.collection("petData").get();
    querySnapshot.forEach((doc) => {
      console.log(`${doc.id} => ${JSON.stringify(doc.data())}`);
    });
    process.exit(0); // quit
  } catch (e) {
    console.error("Error reading data: ", e);
    process.exit(1); // err
  }
}

await readData();