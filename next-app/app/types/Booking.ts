export type Booking = {
  id: string; // Firestore doc ID
  vanSize: "large" | "small";
  date: string; // Format: "YYYY-MM-DD"
  userInitials: string;
  timeSlot: string; // NEW: e.g., "10:00 - 11:00"
};