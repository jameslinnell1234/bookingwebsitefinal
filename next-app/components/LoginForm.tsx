// components/LoginForm.tsx
"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase"; // adjust the path if needed
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/bookings"); // or wherever your protected page is
    } catch (err: unknown) {
  if (err instanceof Error) {
    setError(err.message || "Failed to log in");
  } else {
    setError("Failed to log in");
  }
}

  };

  const handlePasswordReset = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
    } catch (err: unknown) {
  if (err instanceof Error) {
    setError(err.message || "Error sending reset email");
  } else {
    setError("Error sending reset email");
  }
}

  };

  return (
    <form onSubmit={handleLogin} className="space-y-4 max-w-sm mx-auto p-4">
      <h2 className="text-xl font-semibold">Login</h2>

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="w-full border p-2"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="w-full border p-2"
        required
      />

      {error && <p className="text-red-600 text-sm">{error}</p>}
      {resetSent && <p className="text-green-600 text-sm">Reset email sent!</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Logging in..." : "Login"}
      </button>

      <button
        type="button"
        onClick={handlePasswordReset}
        className="text-sm text-blue-500 mt-2 hover:underline"
      >
        Forgot password?
      </button>
    </form>
  );
}
