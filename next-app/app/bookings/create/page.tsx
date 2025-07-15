"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBooking, getBookingsForDate } from "@/lib/firestore";
import { format } from "date-fns";



const hourOptions = [
  "07:00", "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"
];

export function generateTimeSlots(start: string, end: string): string[] {
  const startHour = parseInt(start.split(":")[0]);
  const endHour = parseInt(end.split(":")[0]);

  const slots: string[] = [];
  for (let hour = startHour; hour < endHour; hour++) {
    const from = `${hour.toString().padStart(2, "0")}:00`;
    const to = `${(hour + 1).toString().padStart(2, "0")}:00`;
    slots.push(`${from} - ${to}`);
  }

  return slots;
}


export default function CreateBookingForm() {
  const router = useRouter();
  const [vanSize, setVanSize] = useState<"large" | "small">("small");
  const [date, setDate] = useState("");
  const [userInitials, setUserInitials] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!date || !vanSize) return;

      const bookings = await getBookingsForDate(date);
      const relevant = bookings.filter((b) => b.vanSize === vanSize);

      const taken = relevant.flatMap((b) => b.timeSlots); // Now always an array

      setBookedSlots(taken);
    };
    fetchBookings();
  }, [date, vanSize]);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!vanSize || !date || !userInitials || !startTime || !endTime) {
    alert("Please fill out all fields");
    return;
  }

  const timeSlots = generateTimeSlots(startTime, endTime); // e.g., ["07:00 - 08:00", "08:00 - 09:00"]

  // Convert new booking to individual hours
  const newHours = timeSlots.map(slot => slot.split(" - ")[0]); // ["07:00", "08:00"]

  const bookings = await getBookingsForDate(date);
  const relevant = bookings.filter((b) => b.vanSize === vanSize);

  // Convert all existing bookings to individual hours
  const takenHours = new Set(
    relevant.flatMap(b =>
      b.timeSlots.map(slot => slot.split(" - ")[0]) // ["08:00", "09:00"]
    )
  );

  // Check for any overlap
  const hasClash = newHours.some(hour => takenHours.has(hour));
  if (hasClash) {
    alert("This time slot overlaps with an existing booking. Please choose a different time.");
    return;
  }

  const newBooking = {
    vanSize,
    date,
    userInitials,
    timeSlots,
  };

  try {
    await createBooking(newBooking);
    alert("Booking created!");
    router.push("/bookings");
  } catch (error) {
    console.error("Error creating booking:", error);
    alert("Failed to create booking.");
  }
};

const getAvailableEndTimes = () => {
  if (!startTime) return [];

  const startIndex = hourOptions.indexOf(startTime);
  if (startIndex === -1) return [];

  // Flatten booked time slots into a Set of hours
  const blockedHours = new Set(
    bookedSlots.flatMap(slot => {
      const [start, end] = slot.split(" - ");
      const startIdx = hourOptions.indexOf(start);
      const endIdx = hourOptions.indexOf(end);
      return hourOptions.slice(startIdx, endIdx); // e.g., "08:00", "09:00"
    })
  );

  // Now return only end times that would not overlap
  const availableEndTimes: string[] = [];

  for (let i = startIndex + 1; i < hourOptions.length; i++) {
    const range = hourOptions.slice(startIndex, i); // proposed time range
    const hasConflict = range.some(hour => blockedHours.has(hour));
    if (hasConflict) break; // stop at the first conflict
    availableEndTimes.push(hourOptions[i]);
  }

  return availableEndTimes;
};


  return (
    <main className="max-w-md mx-auto p-2">
      <h1 className="text-2xl font-bold mb-1">Create Booking</h1>
    
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <label className="block mb-1">Van Size:</label>
        <select value={vanSize} onChange={(e) => setVanSize(e.target.value as "small" | "large")} className="border p-2 w-full">
          <option value="small">Small</option>
          <option value="large">Large</option>
        </select>
      </div>

      <div>
        <label className="block mb-1">Date:</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border p-2 w-full"
        />
      </div>

      <div>
        <label className="block mb-1">User Initials:</label>
        <input
          type="text"
          value={userInitials}
          onChange={(e) => setUserInitials(e.target.value)}
          className="border p-2 w-full"
        />
      </div>

      <div>
        <label className="block mb-1">Start Time:</label>
        <select
          value={startTime}
          onChange={(e) => {
            setStartTime(e.target.value);
            setEndTime(""); // reset end time when start changes
          }}
          className="border p-2 w-full"
        >
          <option value="">Select...</option>
          {hourOptions.map((hour) => {
            const isBooked = bookedSlots.some(slot => slot.startsWith(hour));
            return (
              <option
                key={hour}
                value={hour}
                disabled={isBooked}
                className={isBooked ? "text-red-500" : ""}
              >
                {hour} {isBooked ? "(Booked)" : ""}
              </option>
            );
          })}
        </select>

      </div>

      <div>
        <label className="block mb-1">End Time:</label>
        <select
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          className="border p-2 w-full"
        >
          <option value="">Select...</option>
          {getAvailableEndTimes().map((hour) => (
            <option key={hour} value={hour}>{hour}</option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Submit Booking
      </button>
    </form>
    </main>
  );
}
