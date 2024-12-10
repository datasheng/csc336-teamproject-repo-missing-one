import React, {useState, useEffect} from "react";

// Hardcoded job listings (replace with dynamic data later) Relying on u guys for this...
const jobListings = [
  {
    id: 1,
    title: "Carpenter Needed",
    description: "Looking for an experienced carpenter to build custom furniture.",
    location: "Los Angeles, CA",
    postedDate: "2024-12-01",
    status: "Open",
  },
  {
    id: 2,
    title: "Kitchen Demolition",
    description: "Need a demolition contractor for kitchen demolition.",
    location: "Austin, TX",
    postedDate: "2024-12-02",
    status: "Closed",
  },
  {
    id: 3,
    title: "Painter Required",
    description: "Require a professional painter for exterior house painting.",
    location: "Miami, FL",
    postedDate: "2024-12-03",
    status: "Open",
  },
  //Duplicate for testing purposes
  {
    id: 4,
    title: "Painter Required x2",
    description: "Require a professional painter for exterior house painting.",
    location: "Miami, FL",
    postedDate: "2024-12-03",
    status: "Open",
  },
];

export default function Listing() {
    const [userType, setUserType] = useState(null);

    useEffect(() => {
    const storedUserData = localStorage.getItem("userData");
    
    if (storedUserData) {
      const parsedData = JSON.parse(storedUserData);
      setUserType(parsedData.userType);
    }
  }, []);


    const handleApply = (jobId) => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("You must be logged in to apply for a job.");
            return;
        }

        console.log("Current user type:", userType);
        if (userType !== "contractor") {
            alert("Only contractors can apply for jobs.");
            return;
        }

    };
  
  
  
    return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Available Jobs</h1>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {jobListings.map((job) => (
          <div key={job.id} className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800">{job.title}</h2>
            <p className="text-gray-600 mt-2">{job.description}</p>
            <p className="text-gray-500 text-sm mt-4">Location: {job.location}</p>
            <p className="text-gray-500 text-sm">Posted: {job.postedDate}</p>
            <p className="text-gray-500 text-sm">Applicability: {job.status}</p>
            <button
            onClick={()=> handleApply(job.id)}
            disabled={
                job.status === "Closed"
            } 
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
