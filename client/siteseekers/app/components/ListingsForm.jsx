"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const ListingsForm = () => {
  const router = useRouter();
  const [clientId, setClientId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    min_salary: "",
    max_salary: "",
    actual_salary: "",
    rate_type: "hourly",
    status: "open",
  });

  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      const parsedData = JSON.parse(storedUserData);
      if (parsedData.userType !== 'client') {
        router.push('/');
        return;
      }
      setClientId(parsedData.id);
    } else {
      router.push('/login');
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!clientId) {
      alert("You must be logged in as a client to post jobs");
      return;
    }

    try {
      const payload = {
        ...formData,
        client_id: clientId,
        min_salary: parseFloat(formData.min_salary),
        max_salary: parseFloat(formData.max_salary),
        actual_salary: parseFloat(formData.actual_salary)
      };

      const response = await fetch("http://localhost:3001/api/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Job listing created successfully! Job ID: ${data.job_id}`);
        router.push("/profile");
      } else {
        throw new Error(data.error || "Error creating job listing");
      }
    } catch (error) {
      console.error("Error creating job:", error);
      alert(error.message);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-lg w-full bg-white shadow-md rounded px-8 py-6">
        <h2 className="text-2xl font-bold mb-4">Create a Job Listing</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Job Title:</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Description:</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Location:</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Minimum Salary:</label>
            <input
              type="number"
              name="min_salary"
              value={formData.min_salary}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Maximum Salary:</label>
            <input
              type="number"
              name="max_salary"
              value={formData.max_salary}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Actual Salary:</label>
            <input
              type="number"
              name="actual_salary"
              value={formData.actual_salary}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Rate Type:</label>
            <select
              name="rate_type"
              value={formData.rate_type}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="hourly">Hourly</option>
              <option value="yearly">Yearly</option>
              <option value="fixed">Fixed</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Post Job
          </button>
        </form>
      </div>
    </div>
  );
};

export default ListingsForm;
