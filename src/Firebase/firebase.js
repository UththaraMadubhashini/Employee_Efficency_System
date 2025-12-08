import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB4k6eSfqfMUinUMIuj90Jfk9XsppQOeDU",
  authDomain: "employee-efficiency-system.firebaseapp.com",
  databaseURL:" https://employee-efficiency-system-default-rtdb.firebaseio.com/",
  projectId: "employee-efficiency-system",
  storageBucket: "employee-efficiency-system.firebasestorage.app",
  messagingSenderId: "464390388469",
  appId: "1:464390388469:web:804d5b93df71b69a25a3bc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const rtdb = getDatabase(app);    // Realtime DB
export const storage = getStorage(app); 



