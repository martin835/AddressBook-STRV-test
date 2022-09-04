//***********CONFIG WITH ADMIN SDK ********************* */

import { getFirestore } from "firebase-admin/firestore";
//import admin from "firebase-admin";
import { initializeApp, applicationDefault, cert } from "firebase-admin/app";

//For default creadentials this env varialbe was needed GOOGLE_APPLICATION_CREDENTIALS="C:PATH-TO\key.json" together with key.JSON file,
//but it probably wouldn't work on Heroku

//USE WHEN TESTING:

// const app = initializeApp({
//   credential: applicationDefault(),
// });

//WHEN TESTING - COMMENT OUT:

const { privateKey } = JSON.parse(process.env.FIREBASE_PRIVATE_KEY);
const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: privateKey,
  }),
});

export const database = getFirestore(app);

//*********** OLD -> CONFIG W/O ADMIN SDK ********************* */

// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getFirestore } from "firebase/firestore";

// import { collection } from "firebase/firestore";

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: process.env.FIREBASE_APIKEY,
//   authDomain: process.env.FIREBASE_AUTHDOMAIN,
//   projectId: process.env.FIREBASE_PROJECTID,
//   storageBucket: process.env.FIREBASE_SOTRAGEBUCKET,
//   messagingSenderId: process.env.FIREBASE_MESSAGINGSENDERID,
//   appId: process.env.FIREBASE_APPID,
//   measurementId: process.env.FIREBASE_MEASUREMENTID,
// };

// // Initialize Firebase

// const app = initializeApp(firebaseConfig);

// export const database = getFirestore(app);
// //export const contacts = collection(database, "Contacts");
