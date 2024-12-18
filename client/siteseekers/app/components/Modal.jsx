import React, { useState, useEffect } from "react";

const Modal = ({ show, onClose, onSubmit, jobId, contractor_id }) => {
  const [jobDetails, setJobDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }

    const fetchJobDetails = async () => {
      if (!jobId || !show) return;
      
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:3001/api/listings/job/${jobId}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Job details received:", data);
        
        if (!data || Object.keys(data).length === 0) {
          throw new Error('No data received from server');
        }
        
        setJobDetails(data);
        setError(null);
      } catch (error) {
        console.error("Error fetching job details:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId, show]);

  if (!show) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-lg w-1/2">
          <p className="text-center">Loading job details...</p>
          <div className="flex justify-end mt-4">
            <button onClick={onClose} className="px-4 py-2 bg-gray-500 text-white rounded">
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-lg w-1/2">
          <p className="text-center text-red-600">Error: {error}</p>
          <div className="flex justify-end mt-4">
            <button onClick={onClose} className="px-4 py-2 bg-gray-500 text-white rounded">
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!jobDetails) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-lg w-1/2">
          <p className="text-center">No job details available</p>
          <div className="flex justify-end mt-4">
            <button onClick={onClose} className="px-4 py-2 bg-gray-500 text-white rounded">
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!userData) {
      alert("Please log in to apply for jobs");
      return;
    }
    
    if (userData.userType !== "contractor") {
      console.log("User validation failed:", userData);
      alert("You must be logged in as a contractor to apply for jobs");
      return;
    }

    const formData = new FormData(e.target);
    const applicationData = {
      job_id: jobId,
      contractor_id: contractor_id,
      tell_answer: formData.get('tell_answer'),
      fit_answer: formData.get('fit_answer'),
      ambitious_answer: formData.get('ambitious_answer'),
      location: jobDetails.location
    };

    try {
      // Submit application
      const response = await fetch("http://localhost:3001/api/listings/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(applicationData),
      });

      const data = await response.json();
      console.log("Response from server:", data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit application');
      }

      console.log("Application submitted successfully:", data);
      alert("Application submitted successfully!");
      onClose();
    } catch (error) {
      console.error("Error in submission process:", error);
      // Show the specific error message
      alert(error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-1/2">
        <h2 className="text-2xl font-semibold mb-4">Apply for {jobDetails.title}</h2>
        <p className="mb-4"><strong>Description: </strong>{jobDetails.description}</p>
        <p className="mb-4"><strong>Salary: </strong>${jobDetails.min_salary.toLocaleString()} to ${jobDetails.max_salary.toLocaleString()}</p>
        <p className="mb-4"><strong>Rate: </strong>{jobDetails.rate_type}</p>
        <p className="mb-4"><strong>Location: </strong>{jobDetails.location}</p>
        <p className="mb-4"><strong>Posted: </strong>{jobDetails.date_posted}</p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Tell me about yourself</label>
            <textarea name="tell_answer" className="w-full p-2 border rounded" required></textarea>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Why are you fit for this job?</label>
            <textarea name="fit_answer" className="w-full p-2 border rounded" required></textarea>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">What was your most ambitious job that you completed?</label>
            <textarea name="ambitious_answer" className="w-full p-2 border rounded" required></textarea>
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={onClose} className="mr-4 px-4 py-2 bg-gray-500 text-white rounded">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Modal;