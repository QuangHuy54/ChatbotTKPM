// Import the functions you need from the SDKs you need
// toDo: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getPerformance } from "firebase/performance";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

//Main firebase
//Change based on config
const FirebaseConfig = {
  apiKey: "",
  authDomain: "",
  databaseURL: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: "",
};

const app = initializeApp(FirebaseConfig);
// Initialize Performance Monitoring and get a reference to the service
const perf = getPerformance(app);

export const db = getFirestore(app);

export default FirebaseConfig;
