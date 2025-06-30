"use client";

import { useState, useEffect } from "react"; // ✅ added useEffect here
import { useRouter } from "next/navigation";
import { addDoc, collection, query, where, getDocs } from "firebase/firestore"; // ✅ added query, where, getDocs
import { db } from "@/lib/firebase";

export default function CreateBookingPage() {
  const router = useRouter();
  const [unavailableSlots, setUnavailableSlots] = useState<string[]>([]);

  const [form, setForm] = useState({
    vanSize: "",
    date: "",
    timeSlot: "",
    userInitials: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  useEffect(() => {
    const fetchUnavailableSlots = async () => {
      if (!form.date || !form.vanSize) {
        setUnavailableSlots([]);
        return;
      }

      const q = query(
        collection(db, "bookings"),
        where("date", "==", form.date),
        where("vanSize", "==", form.vanSize)
      );

      const snapshot = await getDocs(q);
      const slots = snapshot.docs.map((doc) => doc.data().timeSlot);
      setUnavailableSlots(slots);
    };

    fetchUnavailableSlots();
  }, [form.date, form.vanSize]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!form.vanSize || !form.date || !form.userInitials) {
      setError("Please fill in van size, date, and your initials.");
      setLoading(false);
      return;
    }

    try {
      await addDoc(collection(db, "bookings"), {
        vanSize: form.vanSize,
        date: form.date,
        timeSlot: form.timeSlot,
        userInitials: form.userInitials.toUpperCase(),
      });


      router.push("/bookings");
    } catch (error) {
      setError("Failed to create booking. Please try again.");
      console.error("Error adding booking: ", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create Booking</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Van size select (unchanged) */}
        <div>
          <label htmlFor="vanSize" className="block font-medium mb-1">
            Select Van Size
          </label>
          <select
            name="vanSize"
            id="vanSize"
            value={form.vanSize}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">-- Select Van Size --</option>
            <option value="large">Large</option>
            <option value="small">Small</option>
          </select>
        </div>

        {/* Date picker input */}
        <div>
          <label htmlFor="date" className="block font-medium mb-1">
            Date
          </label>
          <input
            type="date"
            name="date"
            id="date"
            value={form.date}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/* Time slot dropdown */}
        <div>
          <label htmlFor="timeSlot" className="block font-medium mb-1">
            Time Slot
          </label>
          <select
            name="timeSlot"
            id="timeSlot"
            value={form.timeSlot}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">-- Select Time Slot --</option>
            {[
              "07:00-08:00",
              "08:00-09:00",
              "09:00-10:00",
              "10:00-11:00",
              "11:00-12:00",
              "12:00-13:00",
              "13:00-14:00",
              "14:00-15:00",
              "15:00-16:00",
              "16:00-17:00",
              "17:00-18:00",
              "18:00-19:00",
            ].map((slot) => (
              <option key={slot} value={slot} disabled={unavailableSlots.includes(slot)} style={unavailableSlots.includes(slot) ? { color: "red" } : {}}>
                {slot.replace("-", " - ")}
              </option>
            ))}
          </select>
        </div>

        {/* User initials input (unchanged) */}
        <div>
          <label htmlFor="userInitials" className="block font-medium mb-1">
            Your Initials
          </label>
          <input
            type="text"
            name="userInitials"
            id="userInitials"
            value={form.userInitials}
            onChange={handleChange}
            maxLength={3}
            className="w-full border px-3 py-2 rounded uppercase"
            placeholder="e.g. JSM"
          />
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Booking"}
        </button>
      </form>

    </main>
  );
}
