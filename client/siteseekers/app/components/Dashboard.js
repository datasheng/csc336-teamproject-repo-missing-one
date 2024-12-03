import React from "react";
import axios from "axios";

const Dashboard = ({ sessionToken }) => {
  const handleProtectedRequest = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/protected`, {
        headers: {
          Authorization: sessionToken,
          "User-Type": "client",
        },
      });
      alert(response.data.message);
    } catch (error) {
      console.error(error);
      alert("Error making protected request.");
    }
  };

  return (
    <div>
      <h2>Dashboard</h2>
      <button onClick={handleProtectedRequest}>
        Make Protected Request
      </button>
    </div>
  );
};

export default Dashboard;
