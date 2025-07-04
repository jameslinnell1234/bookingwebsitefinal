"use client";

import { useRouter } from "next/navigation";
import Calendar from "@/components/Calendar";

export default function BookingsPage() {
  const router = useRouter();

  const handleCreateBooking = () => {
    router.push("/bookings/create");
  };

  const handleRecurringBooking = () => {
    router.push("/bookings/block");
  };

  return (
    <main className="p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
        <h1 className="text-2xl font-bold">Bookings</h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={handleCreateBooking}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Create Booking
          </button>
          <button
            onClick={handleRecurringBooking}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Create Recurring Booking
          </button>
        </div>
      </div>

      <Calendar />
    </main>
  );
}
