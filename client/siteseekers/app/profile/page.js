"use client";
import { useEffect, useState } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import Navbar from "../components/Navbar";
import Profile from "../components/Profile";

export default function ProfilePage() {
  const [userData, setUserData] = useState(null);
  const [clientData, setClientData] = useState(null);
  //console.log("User data:", userData);
  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      const parsedUserData = JSON.parse(storedUserData);
      setUserData(JSON.parse(storedUserData));

      if (parsedUserData.userType === "client") {
        getClientData(parsedUserData.id);
      }
    }

    
  }, []);

  const getClientData = async (userId) => {
    try {
      const response = await fetch(`http://localhost:3001/profile/client/${userId}`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      //console.log("Client data:", data);
      setClientData(data);
    } catch (error) {
      console.error("Error fetching user client data:", error);
    }
  
  };

  return (
    <div>
      <Navbar />
      <ProtectedRoute>
        {/*<div className="flex min-h-screen flex-col items-center p-24">
          <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-4">Profile</h1> */}
            
            {userData ? (
              <>
                {userData.userType === "client" ? (
                  <Profile userId={userData.id} userData={userData} initialClientData={clientData} />
                ) : userData.userType === "contractor" ? (
                  <Profile userId={userData.id} userData={userData} />
                ) : (
                  <p className="text-gray-600">Unknown user type.</p>
                )}
              </>
            ) : (
              <p>Loading profile data...</p>
            )}
          
       
      </ProtectedRoute>
    </div>
  );
}