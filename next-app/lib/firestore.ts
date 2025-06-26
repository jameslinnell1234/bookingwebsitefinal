import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebase";

export async function addBooking(data: {
  vanSize: string;    // updated from vanPlate
  date: string;
  startTime: string;
  endTime: string;
  userInitials: string;
}) {
  try {
    const docRef = await addDoc(collection(db, "bookings"), data);
    return docRef.id;
  } catch (e) {
    throw new Error("Error adding booking: " + e);
  }
}