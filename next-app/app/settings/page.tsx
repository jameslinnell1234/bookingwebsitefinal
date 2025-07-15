"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  setDoc
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "@/lib/firebase";

type UserProfile = {
  id: string;
  email: string;
  role: "basic" | "superior" | "uber";
};

export default function UserSettingsPage() {
  const [firestoreUsers, setFirestoreUsers] = useState<UserProfile[]>([]);
  const [authUsers, setAuthUsers] = useState<{ uid: string; email: string }[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      const snapshot = await getDocs(collection(db, "users"));
      const current = snapshot.docs.find((doc) => doc.id === user.uid);

      if (current) {
        const role = current.data().role || "basic";
        setCurrentUserRole(role);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchFirestoreUsers = async () => {
      const snapshot = await getDocs(collection(db, "users"));
      const data: UserProfile[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        email: doc.data().email,
        role: doc.data().role || "basic"
      }));
      setFirestoreUsers(data);
    };

    fetchFirestoreUsers();
  }, []);

  useEffect(() => {
    const fetchAuthUsers = async () => {
      try {
        const res = await fetch("/api/all-auth-users");
        const data = await res.json();
        setAuthUsers(data.users);
      } catch (err) {
        console.error("❌ Failed to fetch auth users:", err);
      }
    };

    fetchAuthUsers();
  }, []);

  const unsyncedUsers = authUsers.filter(
    (authUser) => !firestoreUsers.some((fsUser) => fsUser.id === authUser.uid)
  );

  const handleRoleChange = async (userId: string, newRole: UserProfile["role"]) => {
    try {
      await updateDoc(doc(db, "users", userId), { role: newRole });
      setFirestoreUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
    } catch (err) {
      console.error("❌ Failed to update role:", err);
    }
  };

  const syncUserToFirestore = async (uid: string, email: string) => {
    try {
      await setDoc(doc(db, "users", uid), {
        email,
        role: "basic"
      });
      setFirestoreUsers((prev) => [...prev, { id: uid, email, role: "basic" }]);
    } catch (err) {
      console.error("❌ Sync failed for:", uid, err);
    }
  };

  if (currentUserRole !== "uber") {
    return (
      <main className="max-w-2xl mx-auto p-4 text-center">
        <h1 className="text-xl font-bold">Access Denied</h1>
        <p className="mt-2 text-gray-600">Only Uber users can manage access settings.</p>
        <Link href="/calendar">
          <button className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
            Back to Calendar
          </button>
        </Link>
      </main>
    );
  }

  return (
    <main className="space-y-10 max-w-4xl mx-auto p-4">
      {/* 🔙 Back Button */}
      <div className="mb-6">
        <Link href="/bookings">
          <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
            ← Back to Calendar
          </button>
        </Link>
      </div>

      <h1 className="text-2xl font-bold">User Access Settings</h1>

      {/* ✅ Firestore Users */}
      <section>
        <h2 className="text-lg font-semibold mb-2">Synced Users</h2>
        <div className="grid gap-4">
          {firestoreUsers.map((user) => (
            <div key={user.id} className="border rounded p-4 space-y-2 bg-gray-50">
              <div className="font-semibold text-lg">{user.email}</div>
              <div className="flex gap-4 items-center">
                {["basic", "superior", "uber"].map((role) => (
                  <label key={role} className="flex items-center gap-1">
                    <input
                      type="radio"
                      name={`role-${user.id}`}
                      checked={user.role === role}
                      onChange={() => handleRoleChange(user.id, role as UserProfile["role"])}
                    />
                    <span className="capitalize">{role}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 🆕 Unsynced Users */}
      {unsyncedUsers.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-2 text-red-700">Unsynced Users</h2>
          <p className="text-sm text-gray-600 mb-4">
            These users exist in Firebase Auth but don’t yet have a Firestore profile.
          </p>
          <div className="grid gap-4">
            {unsyncedUsers.map((user) => (
              <div key={user.uid} className="border p-4 rounded bg-red-50 space-y-2">
                <div className="font-medium">{user.email}</div>
                <button
                  className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
                  onClick={() => syncUserToFirestore(user.uid, user.email)}
                >
                  Sync to Firestore
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}