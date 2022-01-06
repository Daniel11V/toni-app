import * as firebase from "firebase";

const config = {
  apiKey: "AIzaSyA1qM-TRpq7Fi-s5VcRfzuz-JtYomrQT0g",
  authDomain: "toni-aca20.firebaseapp.com",
  databaseURL: "https://toni-aca20.firebaseio.com",
  projectId: "toni-aca20",
  storageBucket: "toni-aca20.appspot.com",
  messagingSenderId: "596057550361"
};

firebase.initializeApp(config);

// export const firebaseAuth = firebase.auth()
export const firebaseDatabase = firebase.database()

export default firebase
