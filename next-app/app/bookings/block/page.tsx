
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  format,
  eachDayOfInterval,
  parseISO,
} from "date-fns";

function generateTimeSlots(start: string, end: string): string[] {
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

export default function RecurringBookingPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    vanSize: "",
    startDate: "",
    endDate: "",
    timeSlot: "",
    userInitials: "",
    daysOfWeek: [] as string[],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);

  const weekdays = [
    { label: "Mon", value: "1" },
    { label: "Tue", value: "2" },
    { label: "Wed", value: "3" },
    { label: "Thu", value: "4" },
    { label: "Fri", value: "5" },
    { label: "Sat", value: "6" },
    { label: "Sun", value: "0" },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleDay = (value: string) => {
    setForm((prev) => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(value)
        ? prev.daysOfWeek.filter((d) => d !== value)
        : [...prev.daysOfWeek, value],
    }));
  };

  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!form.startDate || !form.endDate || !form.vanSize || form.daysOfWeek.length === 0) {
        setAvailableTimeSlots([]);
        return;
      }

      const start = parseISO(form.startDate);
      const end = parseISO(form.endDate);
      const allDates = eachDayOfInterval({ start, end });
      

      const matchingDates = allDates.filter(date =>
        form.daysOfWeek.includes(date.getDay().toString())
      );

      const slotCounts: Record<string, number> = {};

      for (const dateObj of matchingDates) {
        const dateStr = format(dateObj, "yyyy-MM-dd");

        const q = query(
          collection(db, "bookings"),
          where("date", "==", dateStr),
          where("vanSize", "==", form.vanSize)
        );

        const snapshot = await getDocs(q);
        const taken = new Set<string>();

        snapshot.forEach(doc => {
          const data = doc.data();
          if (Array.isArray(data.timeSlots)) {
            data.timeSlots.forEach((slot: string) => taken.add(slot));
          }
        });

        taken.forEach(slot => {
          slotCounts[slot] = (slotCounts[slot] || 0) + 1;
        });
      }

      const totalDays = matchingDates.length;

      const allSlots = [
        "07:00 - 08:00", "08:00 - 09:00", "09:00 - 10:00", "10:00 - 11:00",
        "11:00 - 12:00", "12:00 - 13:00", "13:00 - 14:00", "14:00 - 15:00",
        "15:00 - 16:00", "16:00 - 17:00", "17:00 - 18:00", "18:00 - 19:00"
      ];

      const doesOverlap = (slot1: string, slot2: string) => {
      const [start1, end1] = slot1.split(" - ").map(h => parseInt(h.split(":")[0]));
      const [start2, end2] = slot2.split(" - ").map(h => parseInt(h.split(":")[0]));
      return start1 < end2 && start2 < end1;
    };

    const available = allSlots.filter(slot => {
      const conflictCount = Object.entries(slotCounts).filter(
        ([bookedSlot]) => doesOverlap(slot, bookedSlot)
      ).reduce((sum, [, count]) => sum + count, 0);
      return conflictCount < totalDays;
    });
      setAvailableTimeSlots(available);
    };

    fetchAvailableSlots();
  }, [form.startDate, form.endDate, form.vanSize, form.daysOfWeek]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { vanSize, startDate, endDate, timeSlot, userInitials, daysOfWeek } = form;

    if (!vanSize || !startDate || !endDate || !timeSlot || !userInitials || daysOfWeek.length === 0) {
      setError("Please fill in all fields and select at least one weekday.");
      setLoading(false);
      return;
    }

    const [start, end] = timeSlot.split(" - ");
    const newTimeSlots = generateTimeSlots(start, end);

    const dates = eachDayOfInterval({
      start: parseISO(startDate),
      end: parseISO(endDate),
    });

    const skippedDates: string[] = [];

    for (const dateObj of dates) {
      const day = dateObj.getDay().toString();
      if (!daysOfWeek.includes(day)) continue;

      const dateStr = format(dateObj, "yyyy-MM-dd");

      const q = query(
        collection(db, "bookings"),
        where("date", "==", dateStr),
        where("vanSize", "==", vanSize)
      );
      const snapshot = await getDocs(q);

      const takenHours = new Set<string>();
      snapshot.forEach(doc => {
        const data = doc.data();
        if (Array.isArray(data.timeSlots)) {
          data.timeSlots.forEach((slot: string) => {
            const hour = slot.split(" - ")[0];
            takenHours.add(hour);
          });
        }
      });

      const doesOverlap = (slot1: string, slot2: string) => {
        const [start1, end1] = slot1.split(" - ").map(h => parseInt(h.split(":")[0]));
        const [start2, end2] = slot2.split(" - ").map(h => parseInt(h.split(":")[0]));
        return start1 < end2 && start2 < end1;
      };

      const hasClash = newTimeSlots.some(newSlot =>
        Array.from(takenHours).some(existingSlot => doesOverlap(newSlot, `${existingSlot} - ${parseInt(existingSlot.split(":")[0]) + 1}:00`))
      );
      if (hasClash) {
        skippedDates.push(dateStr);
        continue;
      }

      await addDoc(collection(db, "bookings"), {
        vanSize,
        date: dateStr,
        timeSlots: newTimeSlots,
        userInitials: userInitials.toUpperCase(),
      });
    }

    setLoading(false);

    if (skippedDates.length > 0) {
      alert(`Recurring booking created. Skipped ${skippedDates.length} date(s) due to conflicts:\n${skippedDates.join(", ")}`);
    } else {
      alert("Recurring booking created successfully!");
    }

    router.push("/bookings");
  };

return (
  <main className="max-w-md mx-auto p-2">
    <h1 className="text-2xl font-bold mb-1">Create Recurring Booking</h1>

    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <label className="block mb-1">Van Size:</label>
        <select
          name="vanSize"
          value={form.vanSize}
          onChange={handleChange}
          className="border p-2 w-full"
        >
          <option value="">-- Select Van Size --</option>
          <option value="small">Small</option>
          <option value="large">Large</option>
        </select>
      </div>

      <div>
        <label className="block mb-1">Start Date:</label>
        <input
          type="date"
          name="startDate"
          value={form.startDate}
          onChange={handleChange}
          className="border p-2 w-full"
        />
      </div>

      <div>
        <label className="block mb-1">End Date:</label>
        <input
          type="date"
          name="endDate"
          value={form.endDate}
          onChange={handleChange}
          className="border p-2 w-full"
        />
      </div>

      <div>
        <label className="block mb-1">Repeat On:</label>
        <div className="flex flex-wrap gap-2">
          {weekdays.map((day) => (
            <label key={day.value} className="flex items-center gap-1 text-sm">
              <input
                type="checkbox"
                checked={form.daysOfWeek.includes(day.value)}
                onChange={() => toggleDay(day.value)}
              />
              {day.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block mb-1">Time Slot:</label>
        <select
          name="timeSlot"
          value={form.timeSlot}
          onChange={handleChange}
          className="border p-2 w-full"
        >
          <option value="">-- Select Time Slot --</option>
          {[
            "07:00 - 08:00", "08:00 - 09:00", "09:00 - 10:00", "10:00 - 11:00",
            "11:00 - 12:00", "12:00 - 13:00", "13:00 - 14:00", "14:00 - 15:00",
            "15:00 - 16:00", "16:00 - 17:00", "17:00 - 18:00", "18:00 - 19:00"
          ].map((slot) => {
            const isAvailable = availableTimeSlots.includes(slot);
            return (
              <option
                key={slot}
                value={slot}
                disabled={!isAvailable}
                className={!isAvailable ? "text-red-500" : ""}
              >
                {slot} {!isAvailable ? "(Booked)" : ""}
              </option>
            );
          })}
        </select>
      </div>

      <div>
        <label className="block mb-1">User Initials:</label>
        <input
          type="text"
          name="userInitials"
          value={form.userInitials}
          onChange={handleChange}
          maxLength={3}
          placeholder="e.g. JSM"
          className="border p-2 w-full uppercase"
        />
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? "Booking..." : "Submit Booking"}
      </button>
    </form>
  </main>
);
}