export type Booking = {
  id: string;
  vanSize: "small" | "large";
  date: string;
  userInitials: string;
  timeSlots: string[]; // ← no more timeSlot
  userId: string; // ← ✅ Add this field

};
