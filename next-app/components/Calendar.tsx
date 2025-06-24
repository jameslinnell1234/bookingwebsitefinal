"use client";

import React from "react";

// Booking type
type Booking = {
  date: string;
  numberPlate: string;
  userName: string; // 3-letter initials
};

// Dummy bookings
const bookings: Booking[] = [
  { date: "2025-07-04", numberPlate: "AB12 CDE", userName: "JSM" },
  { date: "2025-07-04", numberPlate: "CD34 EFG", userName: "MPA" },
  { date: "2025-07-05", numberPlate: "XY99 ZZZ", userName: "AKH" },
  { date: "2025-08-10", numberPlate: "LM22 XYZ", userName: "RGM" },
  { date: "2025-08-10", numberPlate: "AB12 CDE", userName: "JSM" },
];

// Available background color classes (Tailwind)
const colorClasses = [
  "bg-blue-200 text-blue-900",
  "bg-green-200 text-green-900",
  "bg-yellow-200 text-yellow-900",
  "bg-pink-200 text-pink-900",
  "bg-purple-200 text-purple-900",
  "bg-orange-200 text-orange-900",
];

// Map number plate to color
const getColorClass = (plate: string) => {
  // Simple hash to pick a consistent index
  const index = plate
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0) % colorClasses.length;
  return colorClasses[index];
};

// Generate calendar data
function generateNextThreeMonths(): {
  month: string;
  days: { date: string; day: number | null }[];
}[] {
  const months = [];
  const now = new Date();

  for (let i = 0; i < 3; i++) {
    const current = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const monthName = current.toLocaleString("default", { month: "long", year: "numeric" });

    const daysInMonth = new Date(current.getFullYear(), current.getMonth() + 1, 0).getDate();
    const startDay = new Date(current.getFullYear(), current.getMonth(), 1).getDay();

    const daysArray = [];

    for (let s = 0; s < startDay; s++) {
      daysArray.push({ date: "", day: null });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const fullDate = new Date(current.getFullYear(), current.getMonth(), d)
        .toISOString()
        .split("T")[0];
      daysArray.push({ date: fullDate, day: d });
    }

    months.push({ month: monthName, days: daysArray });
  }

  return months;
}

// Main Calendar component
const Calendar = () => {
  const calendarData = generateNextThreeMonths();

  return (
    <div className="space-y-12">
      {calendarData.map((month, index) => (
        <div key={index}>
          <h2 className="text-xl font-bold mb-4">{month.month}</h2>
          <div className="grid grid-cols-7 gap-2 text-center text-sm">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="font-semibold text-gray-600">
                {day}
              </div>
            ))}

            {month.days.map((dayObj, i) => {
              const dayBookings = bookings.filter((b) => b.date === dayObj.date);

              return (
                <div
                  key={i}
                  className={`h-24 flex flex-col items-start justify-start rounded px-1 py-1 border text-xs ${
                    dayObj.day ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="font-semibold">{dayObj.day || ""}</div>
                  <div className="mt-1 flex flex-col gap-1 w-full">
                    {dayBookings.map((b, idx) => (
                      <div
                        key={idx}
                        className={`text-[10px] px-1 py-0.5 rounded font-medium truncate ${getColorClass(
                          b.numberPlate
                        )}`}
                      >
                        {b.numberPlate} • {b.userName}
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
};

export default Calendar;
