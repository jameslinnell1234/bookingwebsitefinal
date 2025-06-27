export type Booking = {
  vanSize: "large" | "small";
  date: string;      // format: "YYYY-MM-DD"
  startTime: string; // e.g. "15:00"
  endTime: string;   // e.g. "18:00"
  userInitials: string;
};