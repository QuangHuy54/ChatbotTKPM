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

//Backup firebase
// const FirebaseConfig = {
//   apiKey: "AIzaSyDv-o8TSczjA8RiXCpNbuOKS9xgiSKeR9w",
//   authDomain: "nmcnpm-backup.firebaseapp.com",
//   projectId: "nmcnpm-backup",
//   storageBucket: "nmcnpm-backup.appspot.com",
//   messagingSenderId: "904397447943",
//   appId: "1:904397447943:web:774d81784b3d4b4c0bdba2",
//   measurementId: "G-05YQ0V4WBP",
// };

const app = initializeApp(FirebaseConfig);
// Initialize Performance Monitoring and get a reference to the service
const perf = getPerformance(app);

export const db = getFirestore(app);

export default FirebaseConfig;
