"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

const ListingsForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    min_salary: "",
    max_salary: "",
    actual_salary: "",
    rate_type: "hourly", // Defaults to hourly
    status: "open", // Default status
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
        date_posted: Date.now(), // Default current timestamp
      };
/* Was trying to figure this part out last
      const response = await fetch("http://localhost:3001", {
        method: "POST",
        headers: {
          "Content-Type": "",
        },
        body: JSON.stringify(payload),
      });*/

      const data = await response.json();

      if (response.ok) {
        alert("Job listing created successfully!");
        router.push("/profile"); // Redirects to profile page after submission
      } else {
        throw new Error(data.message || "Error creating job listing");
      }
    } catch (error) {
      console.error("Job creation error:", error);
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
