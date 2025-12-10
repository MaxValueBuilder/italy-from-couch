import { initializeApp, getApps, FirebaseApp } from "firebase/app"
import { getAuth, Auth } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyDDLOLxadc1oI6MvC6oI0EU8yCFbX1uxfs",
  authDomain: "italy-from-couch.firebaseapp.com",
  projectId: "italy-from-couch",
  storageBucket: "italy-from-couch.firebasestorage.app",
  messagingSenderId: "585752750742",
  appId: "1:585752750742:web:1270ad629d681ebd1c30b7"
}

// Initialize Firebase
let app: FirebaseApp
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig)
} else {
  app = getApps()[0]
}

export const auth: Auth = getAuth(app)
export default app

