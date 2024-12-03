"use client";
import { useEffect, useState } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import Navbar from "../components/Navbar";

export default function Profile() {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
  }, []);

  return (
    <div>
        <Navbar />
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col items-center p-24">
        <div className="max-w-md w-full">
          <h1 className="text-2xl font-bold mb-4">Profile</h1>
          {userData ? (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="mb-2"><strong>Email:</strong> {userData.email}</p>
              <p className="mb-2"><strong>Name:</strong> {userData.name}</p>

            </div>
          ) : (
            <p>Loading profile data...</p>
          )}
        </div>
      </div>
    </ProtectedRoute>
    </div>
  );
} 