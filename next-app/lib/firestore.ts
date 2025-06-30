import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  doc, 
  deleteDoc 
} from "firebase/firestore";
import { db } from "./firebase";
import { format } from "date-fns";

export type Booking = {
  id: string; // Firestore doc ID
  vanSize: "large" | "small";
  date: string; // Format: "YYYY-MM-DD"
  userInitials: string;
  timeSlot: string; // NEW: e.g., "10:00 - 11:00"
};

export async function getBookingsForMonthRange(start: Date, end: Date): Promise<Booking[]> {
  const bookingsRef = collection(db, "bookings");

  const startStr = format(start, "yyyy-MM-dd");
  const endStr = format(end, "yyyy-MM-dd");

  const q = query(
    bookingsRef,
    where("date", ">=", startStr),
    where("date", "<=", endStr)
  );

  const snapshot = await getDocs(q);

  const bookings: Booking[] = [];

  snapshot.forEach((doc) => {
    const data = doc.data();

    bookings.push({
      id: doc.id, // <-- this should work fine
      date: data.date,
      vanSize: data.vanSize,
      userInitials: data.userInitials,
      timeSlot: data.timeSlot || "", // fallback if field is missing
    });
  });

  return bookings;
}

export async function addBooking(booking: Omit<Booking, "id">): Promise<void> {
  const bookingsRef = collection(db, "bookings");
  await addDoc(bookingsRef, booking);
}

export async function deleteBooking(id: string): Promise<void> {
  const bookingDocRef = doc(db, "bookings", id);
  await deleteDoc(bookingDocRef);
}
