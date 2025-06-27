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
  id: string;
  vanSize: "large" | "small";
  date: string;
  userInitials: string;
  startTime?: string;
  endTime?: string;
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

  const querySnapshot = await getDocs(q);

  const bookings: Booking[] = [];

  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    bookings.push({
      id: docSnap.id,
      vanSize: data.vanSize,
      date: data.date,
      userInitials: data.userInitials,
      startTime: data.startTime,
      endTime: data.endTime,
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
