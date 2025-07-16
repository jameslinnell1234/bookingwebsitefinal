"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Calendar from "@/components/Calendar";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function BookingsPage() {
  const router = useRouter();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  // 🔐 Authenticate & fetch user role
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const uid = user.uid;
        setCurrentUserId(uid);

        const userDocRef = doc(db, "users", uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          await setDoc(userDocRef, {
            email: user.email,
            role: "basic",
          });
          setCurrentUserRole("basic");
        } else {
          const role = userDoc.data().role || "basic";
          setCurrentUserRole(role);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleCreateBooking = () => {
    router.push("/bookings/create");
  };

  const handleRecurringBooking = () => {
    router.push("/bookings/block");
  };

  const handleManageUsers = () => {
    router.push("/settings");
  };

  return (
    <main className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Bookings</h1>
        {currentUserRole && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleCreateBooking}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Create Booking
            </button>

            {["superior", "uber"].includes(currentUserRole) && (
              <button
                onClick={handleRecurringBooking}
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
              >
                Create Recurring Booking
              </button>
            )}

            {currentUserRole === "uber" && (
              <button
                onClick={handleManageUsers}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              >
                Manage Users
              </button>
            )}
          </div>
        )}
      </div>

      <Calendar currentUserId={currentUserId} currentUserRole={currentUserRole} />
    </main>
  );
}
