import { NextResponse } from "next/server";
import admin from "firebase-admin";
import * as serviceAccount from "../../../firebaseServiceAccount.json";

// Initialize Firebase Admin only once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
  });
}

export async function GET() {
  try {
    const result = await admin.auth().listUsers();
    const users = result.users.map((user) => ({
      uid: user.uid,
      email: user.email || "No email"
    }));

    return NextResponse.json({ users });
  } catch (err) {
    console.error("🛑 Error loading auth users:", err);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}