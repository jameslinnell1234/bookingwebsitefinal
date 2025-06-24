"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Dummy test credentials
    const testEmail = "test@edugo.com";
    const testPassword = "password123";

    if (email === testEmail && password === testPassword) {
      // Clear error and redirect to bookings
      setError("");
      router.push("/bookings");
    } else {
      // Show error message
      setError("Invalid email or password. Try test@edugo.com / password123");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-800 p-6 flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded shadow">
        <h1 className="text-3xl font-bold text-center mb-6">Welcome to EduGo</h1>
        <p className="text-center text-gray-600 mb-8">
          Please sign in to book a minibus
        </p>

        <form onSubmit={handleLogin}>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full mb-4 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <label className="block mb-2 text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full mb-2 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

          <div className="text-right mb-6">
            <a href="/forgot-password" className="text-sm text-blue-600 hover:underline">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>
      </div>
    </main>
  );
}