"use client";

import { useRouter } from "next/navigation";
import Calendar from "@/components/Calendar";

export default function BookingsPage() {
  const router = useRouter();

  const handleCreateBooking = () => {
    router.push("/bookings/create");
  };

  return (
    <main className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Bookings</h1>
        <button
          onClick={handleCreateBooking}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Create Booking
        </button>
      </div>

      <Calendar />
    </main>
  );
}