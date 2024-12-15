"use client";
import { useEffect, useState } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import Navbar from "../components/Navbar";
import Profile from "../components/Profile";

export default function ProfilePage() {
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
          <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-4">Profile</h1>
            {userData ? (
              <div>
                <p className="mb-2"><strong>Email:</strong> {userData.email}</p>
                <p className="mb-2"><strong>Name:</strong> {userData.name}</p>
                {userData.userType === "client" ? (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mt-4">Client Dashboard</h2>
                    <p className="text-gray-600">As a client, you can manage your projects and browse contractors.</p>
                  </div>
                ) : userData.userType === "contractor" ? (
                  <Profile userId={userData.id} />
                  
                ) : (
                  <p className="text-gray-600">Unknown user type.</p>
                )}
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