"use client";

import { useEffect, useState } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  startOfDay,
} from "date-fns";
import { getBookingsForMonthRange, deleteBooking } from "@/lib/firestore";
import type { Booking } from "@/app/types/Booking";

const COLORS: Record<string, string> = {
  large: "bg-blue-200",
  small: "bg-green-200",
};

function formatTimeTo12Hour(time: string) {
  if (!time) return "";
  const [hourStr] = time.split(":");
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? "pm" : "am";
  hour = hour % 12 || 12;
  return `${hour}${ampm}`;
}

export default function Calendar() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));

  useEffect(() => {
    const fetchBookings = async () => {
      const start = startOfMonth(currentMonth);
      const end = endOfMonth(addMonths(currentMonth, 2));
      const data = await getBookingsForMonthRange(start, end);
      setBookings(data);
    };

    fetchBookings();
  }, [currentMonth]);

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

  const groupedBookings = bookings.reduce<Record<string, Booking[]>>((acc, booking) => {
    if (!acc[booking.date]) acc[booking.date] = [];
    acc[booking.date].push(booking);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {/* Month navigation */}
      <div className="flex justify-end gap-2 mb-4">
        <button
          onClick={() => setCurrentMonth((prev) => subMonths(prev, 3))}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          -3 Months
        </button>
        <button
          onClick={() => setCurrentMonth((prev) => addMonths(prev, 3))}
          className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          +3 Months
        </button>
      </div>

      {[0, 1, 2].map((offset) => {
        const monthStart = startOfMonth(addMonths(currentMonth, offset));
        const monthEnd = endOfMonth(monthStart);
        const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

        return (
          <div key={offset}>
            <h2 className="text-xl font-bold mb-4">
              {format(monthStart, "MMMM yyyy")}
            </h2>

            {/* Day names header */}
            <div className="grid grid-cols-7 gap-4 text-center font-medium text-gray-700 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day}>{day}</div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-4">
              {/* Padding for first day of the month */}
              {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                <div key={`pad-${i}`} />
              ))}

              {monthDays.map((day) => {
                const dateStr = format(day, "yyyy-MM-dd");
                const dayBookings = groupedBookings[dateStr] || [];
                const isToday = format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
                const isPast = day < startOfDay(new Date());

                return (
                  <div
                    key={dateStr}
                    className={`border p-2 rounded min-h-[100px] ${
                      isToday ? "bg-yellow-100 border-yellow-400" : ""
                    } ${isPast ? "opacity-25" : ""}`}
                  >
                    <div className="font-semibold text-sm mb-1">{format(day, "dd MMM")}</div>
                    <div className="space-y-1">
                      {[...dayBookings]
                        .sort((a, b) => {
                          const aStart = a.timeSlots[0]?.split(" - ")[0] || "00:00";
                          const bStart = b.timeSlots[0]?.split(" - ")[0] || "00:00";
                          return aStart.localeCompare(bStart);
                        })
                        .map((booking) => (
                          <div
                            key={booking.id}
                            className={`flex justify-between items-start text-sm px-2 py-1 rounded ${COLORS[booking.vanSize]}`}
                          >
                            <div>
                              {booking.vanSize.charAt(0).toUpperCase() + booking.vanSize.slice(1)} –{" "}
                              {booking.userInitials}
                              <div className="text-xs text-gray-700">
                                {Array.isArray(booking.timeSlots) && booking.timeSlots.length > 0 ? (
                                  (() => {
                                    const firstSlot = booking.timeSlots[0];
                                    const lastSlot = booking.timeSlots[booking.timeSlots.length - 1];
                                    const startTime = firstSlot.split(" - ")[0];
                                    const endTime = lastSlot.split(" - ")[1];
                                    return `${formatTimeTo12Hour(startTime)} - ${formatTimeTo12Hour(endTime)}`;
                                  })()
                                ) : (
                                  ""
                                )}
                              </div>
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
