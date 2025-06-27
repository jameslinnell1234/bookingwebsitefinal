"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function CreateBookingPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    vanSize: "",
    date: "",
    startTime: "",
    endTime: "",
    userInitials: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
        startTime: form.startTime,
        endTime: form.endTime,
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

        <div>
          <label htmlFor="startTime" className="block font-medium mb-1">
            Start Time
          </label>
          <input
            type="time"
            name="startTime"
            id="startTime"
            value={form.startTime}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label htmlFor="endTime" className="block font-medium mb-1">
            End Time
          </label>
          <input
            type="time"
            name="endTime"
            id="endTime"
            value={form.endTime}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

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

        {error && <p className="text-red-600">{error}</p>}

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
