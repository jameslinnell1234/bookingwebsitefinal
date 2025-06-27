"use client";

import { useEffect, useState } from "react";
import { getBookingsForMonthRange, deleteBooking } from "@/lib/firestore";
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";

type Booking = {
  id: string; // Firestore doc id
  vanSize: "large" | "small";
  date: string; // Format: "YYYY-MM-DD"
  userInitials: string;
  startTime?: string;
  endTime?: string;
};

const COLORS: Record<string, string> = {
  large: "bg-blue-200",
  small: "bg-green-200",
};

export default function Calendar() {
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    const fetchBookings = async () => {
      const start = startOfMonth(new Date());
      const end = endOfMonth(addMonths(new Date(), 2)); // next 3 months total

      const data = await getBookingsForMonthRange(start, end);
      setBookings(data);
    };

    fetchBookings();
  }, []);

  // Group bookings by date for quick lookup
  const groupedBookings = bookings.reduce<Record<string, Booking[]>>((acc, booking) => {
    if (!acc[booking.date]) acc[booking.date] = [];
    acc[booking.date].push(booking);
    return acc;
  }, {});

  // Generate all days in the 3-month range
  const start = startOfMonth(new Date());
  const end = endOfMonth(addMonths(new Date(), 2));
  const days = eachDayOfInterval({ start, end });

  // Group days by month for rendering with headers
  const daysByMonth: Record<string, Date[]> = {};
  days.forEach((day) => {
    const monthKey = format(day, "MMMM yyyy");
    if (!daysByMonth[monthKey]) daysByMonth[monthKey] = [];
    daysByMonth[monthKey].push(day);
  });

  // Handle booking deletion with confirm prompt
  const handleDelete = async (bookingId: string) => {
    if (!confirm("Are you sure you want to delete this booking?")) return;

    try {
      await deleteBooking(bookingId);
      // Update local state to remove deleted booking
      setBookings((prev) => prev.filter((b) => b.id !== bookingId));
    } catch (error) {
      console.error("Failed to delete booking:", error);
    }
  };

  return (
    <div>
      {Object.entries(daysByMonth).map(([month, monthDays]) => (
        <div key={month} className="mb-8">
          <h2 className="text-xl font-bold mb-4">{month}</h2>
          <div className="grid grid-cols-7 gap-4">
            {monthDays.map((day) => {
              const dateStr = format(day, "yyyy-MM-dd");
              const dayBookings = groupedBookings[dateStr] || [];

              return (
                <div key={dateStr} className="border p-2 rounded min-h-[6rem]">
                  <div className="font-semibold">{format(day, "dd MMM")}</div>
                  <div className="space-y-1 mt-2">
                    {dayBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className={`relative text-sm px-2 py-1 rounded ${COLORS[booking.vanSize]}`}
                      >
                        <button
                          onClick={() => handleDelete(booking.id)}
                          className="absolute top-0 right-0 text-red-600 font-bold text-lg leading-none px-1 cursor-pointer hover:text-red-800"
                          aria-label="Delete booking"
                          type="button"
                        >
                          ×
                        </button>
                        <div>
                          <strong>{booking.vanSize.charAt(0).toUpperCase() + booking.vanSize.slice(1)}</strong> – {booking.userInitials}
                        </div>
                        {booking.startTime && booking.endTime && (
                          <div className="text-xs">{booking.startTime} - {booking.endTime}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
