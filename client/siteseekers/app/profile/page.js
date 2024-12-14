"use client";
import { useEffect, useState } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import Navbar from "../components/Navbar";

export default function Profile() {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      //const parsedUserData = JSON.parse(storedUserData);
      //console.log(parsedUserData); // Log the parsed data to check its structure
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
                
                {/* Conditionally render based on user type */}
                {userData.userType === "client" ? (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mt-4">Client Dashboard</h2>
                    <p className="text-gray-600">As a client, you can manage your projects and browse contractors.</p>
                    {/* Add more client-specific content here */}
                  </div>
                ) : userData.userType === "contractor" ? (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mt-4">Server Dashboard</h2>
                    <p className="text-gray-600">As a contractor, you can browse available jobs and submit applications.</p>
                    {/* Add more server-specific content here */}

                  </div>
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