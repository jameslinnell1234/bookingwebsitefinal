"use client";

import { useEffect, useState } from "react";
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from "date-fns";
import { getBookingsForMonthRange, deleteBooking } from "@/lib/firestore";
import type { Booking } from "@/app/types/Booking";

const COLORS: Record<string, string> = {
  large: "bg-blue-200",
  small: "bg-green-200",
};

export default function Calendar() {
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    const fetchBookings = async () => {
      const start = startOfMonth(new Date());
      const end = endOfMonth(addMonths(new Date(), 2)); // 3 months range
      const data = await getBookingsForMonthRange(start, end);
      setBookings(data);
    };

    fetchBookings();
  }, []);

  const handleDelete = async (id: string) => {
    const confirmDelete = confirm("Are you sure you want to delete this booking?");
    if (!confirmDelete) return;

    try {
      await deleteBooking(id);
      setBookings((prev) => prev.filter((b) => b.id !== id));
    } catch (error) {
      console.error("Failed to delete booking:", error);
    }
  };

  const days = eachDayOfInterval({
    start: startOfMonth(new Date()),
    end: endOfMonth(addMonths(new Date(), 2)),
  });

  const groupedBookings = bookings.reduce<Record<string, Booking[]>>((acc, booking) => {
    if (!acc[booking.date]) acc[booking.date] = [];
    acc[booking.date].push(booking);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {[0, 1, 2].map((offset) => {
        const monthStart = startOfMonth(addMonths(new Date(), offset));
        const monthEnd = endOfMonth(monthStart);
        const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

        return (
          <div key={offset}>
            <h2 className="text-xl font-bold mb-4">
              {format(monthStart, "MMMM yyyy")}
            </h2>
            <div className="grid grid-cols-7 gap-4">
              {monthDays.map((day) => {
                const dateStr = format(day, "yyyy-MM-dd");
                const dayBookings = groupedBookings[dateStr] || [];

                return (
                  <div key={dateStr} className="border p-2 rounded min-h-[100px]">
                    <div className="font-semibold text-sm mb-1">{format(day, "dd MMM")}</div>
                    <div className="space-y-1">
                      {dayBookings.map((booking) => (
                        <div
                          key={booking.id}
                          className={`flex justify-between items-start text-sm px-2 py-1 rounded ${COLORS[booking.vanSize]}`}
                        >
                          <div>
                            {booking.vanSize.charAt(0).toUpperCase() + booking.vanSize.slice(1)} – {booking.userInitials}
                            <div className="text-xs text-gray-700">{booking.timeSlot || ""}</div>
                          </div>
                          <button
                            onClick={() => handleDelete(booking.id)}
                            className="ml-2 text-red-600 hover:text-red-800 font-bold text-lg leading-none"
                            aria-label="Delete booking"
                            type="button"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
