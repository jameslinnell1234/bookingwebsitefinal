export default function BookingsPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded shadow max-w-2xl w-full">
        <h2 className="text-3xl font-bold mb-4 text-center">Your Bookings</h2>
        <p className="text-gray-600 text-center mb-6">
          View and manage your minibus bookings below.
        </p>

        {/* Placeholder list */}
        <div className="space-y-4">
          <div className="border p-4 rounded shadow-sm bg-gray-100">
            <p><strong>Date:</strong> 2025-07-02</p>
            <p><strong>Time:</strong> 09:00 - 12:00</p>
            <p><strong>Bus:</strong> Minibus A</p>
            <button className="mt-2 text-blue-600 hover:underline text-sm">Edit</button>
          </div>

          <div className="border p-4 rounded shadow-sm bg-gray-100">
            <p><strong>Date:</strong> 2025-07-10</p>
            <p><strong>Time:</strong> 13:00 - 15:30</p>
            <p><strong>Bus:</strong> Minibus B</p>
            <button className="mt-2 text-blue-600 hover:underline text-sm">Edit</button>
          </div>
        </div>
      </div>
    </main>
  );
}