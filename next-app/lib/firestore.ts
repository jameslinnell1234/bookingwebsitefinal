import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  deleteDoc,
  getDoc,
  serverTimestamp
} from "firebase/firestore";
import { db } from "./firebase";
import { format } from "date-fns";
import { getAuth } from "firebase/auth";

// 🧾 Booking type with userId
export type Booking = {
  id: string;
  vanSize: "small" | "large";
  date: string;
  userInitials: string;
  timeSlots: string[];
  userId: string;
};

// 📅 Fetch bookings for a specific date
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
      userId: data.userId
    });
  });

  return bookings;
}

// 📆 Fetch bookings across a month range
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
      userId: data.userId
    });
  });

  return bookings;
}

// 🆕 Create a booking with user ID
export async function createBooking(booking: {
  vanSize: "large" | "small";
  date: string;
  userInitials: string;
  timeSlots?: string[];
}): Promise<void> {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    throw new Error("User not authenticated.");
  }
  console.log("Creating booking for UID:", user.uid);

  const bookingsRef = collection(db, "bookings");
  await addDoc(bookingsRef, {
    ...booking,
    userId: user.uid,
    createdAt: serverTimestamp()
  });
}

// ❌ Delete a booking (only if user owns it)
export async function deleteBooking(id: string): Promise<void> {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    throw new Error("User not authenticated.");
  }

  const bookingDocRef = doc(db, "bookings", id);
  const bookingSnap = await getDoc(bookingDocRef);

  if (!bookingSnap.exists()) {
    throw new Error("Booking not found.");
  }

  const bookingData = bookingSnap.data();
  if (bookingData.userId !== user.uid) {
    throw new Error("You can only delete your own bookings.");
  }

  await deleteDoc(bookingDocRef);
}