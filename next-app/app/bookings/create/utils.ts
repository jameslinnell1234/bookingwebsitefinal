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