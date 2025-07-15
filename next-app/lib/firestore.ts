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
  vanSize: "small" | "large";
  date: string;
  userInitials: string;
  timeSlots: string[]; // ← no more timeSlot
};

export async function getBookingsForDate(date: string): Promise<Booking[]> {
  const bookingsRef = collection(db, "bookings");
  const q = query(bookingsRef, where("date", "==", date));
  const snapshot = await getDocs(q);

  const bookings: Booking[] = [];

  snapshot.forEach((doc) => {
    const data = doc.data();
    bookings.push({
      id: doc.id,
      vanSize: data.vanSize,
      date: data.date,
      userInitials: data.userInitials,
      timeSlots: data.timeSlots,
    });
  });

  return bookings;
}

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
      id: doc.id,
      date: data.date,
      vanSize: data.vanSize,
      userInitials: data.userInitials,
      
      timeSlots: data.timeSlots || [],
    });
  });

  return bookings;
}

export async function createBooking(booking: {
  vanSize: "large" | "small";
  date: string;
  userInitials: string;
  timeSlots?: string[];
  
}): Promise<void> {
  const bookingsRef = collection(db, "bookings");
  await addDoc(bookingsRef, booking);
}

export async function deleteBooking(id: string): Promise<void> {
  const bookingDocRef = doc(db, "bookings", id);
  await deleteDoc(bookingDocRef);
}
