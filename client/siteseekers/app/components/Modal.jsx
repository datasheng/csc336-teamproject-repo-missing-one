import React, { useState, useEffect } from "react";

const Modal = ({ show, onClose, onSubmit, jobId, contractor_id }) => {
  const [jobDetails, setJobDetails] = useState(null);
  const [userData, setUserData] = useState(null);
  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
    if (jobId) {
      const fetchJobDetails = async () => {
        //console.log('sdadasd')
        try {
          const response = await fetch(`http://localhost:3001/api/listings/job/${jobId}`);
          //console.log('response', response);
          if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
          }
          const data = await response.json();
          //console.log("data", data);
          setJobDetails(data);
        } catch (error) {
          console.error("Error fetching job details:", error);
        }
      };

      fetchJobDetails();
    }
  }, [jobId]);

  if (!show) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userData || userData.user_type !== "contractor") {
      alert("You must be logged in as a contractor to apply for this job.");
      return;
    }

    const formData = new FormData(e.target);
    const answers = Object.fromEntries(formData.entries());
    answers.job_id = jobId; // Add job_id to the form data
    answers.contractor_id = contractor_id; // Replace with the actual contractor_id
    answers.location = jobDetails.location;

    try {
      // Check if the contractor has already applied for the job
      const checkResponse = await fetch("http://localhost:3001/api/listings/check-application", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ contractor_id: answers.contractor_id, job_id: answers.job_id }),
      });

      const checkResult = await checkResponse.json();
      if (checkResult.applied) {
        alert("You have already applied for this job.");
        return;
      }

      // Submit the job application
      const response = await fetch("http://localhost:3001/api/listings/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(answers),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      //console.log("Application submitted successfully:", result);
      onSubmit(answers);
    } catch (error) {
      console.error("Error submitting application:", error);
    }
  };



  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-1/2">
        {jobDetails ? (
          <>
            <h2 className="text-2xl font-semibold mb-4">Apply for {jobDetails.title}</h2>
            <p className="mb-4"><strong>Description: </strong>{jobDetails.description}</p>
            <p className="mb-4"><strong>Salary: </strong>${jobDetails.min_salary} to ${jobDetails.max_salary}</p>
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
          </>
        ) : (
          <p>Loading job details...</p>
        )}
      </div>
    </div>
  );
};

export default Modal;