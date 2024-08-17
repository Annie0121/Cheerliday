
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey:process.env.NEXT_PUBLIC_api_Key,
  authDomain: process.env.NEXT_PUBLIC_auth_Domain,
  projectId: process.env.NEXT_PUBLIC_project_Id,
  storageBucket: process.env.NEXT_PUBLIC_storage_Bucket,
  messagingSenderId: process.env.NEXT_PUBLIC_messaging_SenderId,
  appId: process.env.NEXT_PUBLIC_app_Id,
  measurementId:process.env.NEXT_PUBLIC_measurement_Id
};



// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
export {auth,db};
