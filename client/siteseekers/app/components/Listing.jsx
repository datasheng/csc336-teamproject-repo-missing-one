import React, { useState, useEffect } from "react";

export default function Listing() {
  const [jobListings, setJobListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/listings');
        if (!response.ok) {
          throw new Error('Failed to fetch listings');
        }
        const data = await response.json();
        setJobListings(data);
      } catch (err) {
        console.error('Error fetching listings:', err);
        setError('Failed to load job listings');
      } finally {
        setLoading(false);
      }
    };

    fetchListings();

    // Get user type from localStorage
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      const parsedData = JSON.parse(storedUserData);
      setUserType(parsedData.userType);
    }
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Available Jobs</h1>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {jobListings.map((job) => (
          <div key={job.job_id} className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800">{job.title}</h2>
            <p className="text-gray-600 mt-2">{job.description}</p>
            <p className="text-gray-500 text-sm mt-4">Location: {job.location}</p>
            <p className="text-gray-500 text-sm">Posted: {job.date_posted}</p>
            <p className="text-gray-500 text-sm">Posted by: {job.client_name}</p>
            <p className="text-gray-500 text-sm">Status: {job.status}</p>
            <p className="text-gray-500 text-sm">Minimum Salary: ${job.min_salary.toLocaleString()}</p>
            <p className="text-gray-500 text-sm">Maximum Salary: ${job.max_salary.toLocaleString()}</p>
            <p className="text-gray-500 text-sm">Actual Salary: ${job.actual_salary.toLocaleString()}</p>
            <p className="text-gray-500 text-sm">Rate Type: {job.rate_type}</p>
            <button
              onClick={() => handleApply(job.job_id)}
              disabled={job.status === "Closed"}
              className={`mt-4 px-4 py-2 rounded-lg transition duration-300 ${
                job.status === "Closed"
                  ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              Apply Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
