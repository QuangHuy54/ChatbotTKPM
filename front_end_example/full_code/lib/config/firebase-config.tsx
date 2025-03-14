// Import the functions you need from the SDKs you need
// toDo: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getPerformance } from "firebase/performance";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

//Main firebase
const FirebaseConfig = {
  apiKey: "AIzaSyASap1ay125TJIPgYsAEqdE4JvXqUhFhT8",
  authDomain: "nmcnpm-d177c.firebaseapp.com",
  databaseURL: "https://nmcnpm-d177c-default-rtdb.firebaseio.com",
  projectId: "nmcnpm-d177c",
  storageBucket: "nmcnpm-d177c.appspot.com",
  messagingSenderId: "658397747139",
  appId: "1:658397747139:web:38ba98009508d364b0cf76",
  measurementId: "G-FGC4SP6FC4",
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
