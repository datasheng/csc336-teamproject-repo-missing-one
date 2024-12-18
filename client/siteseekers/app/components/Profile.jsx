import React, { useState, useEffect } from "react";
import Premium from './Premium';
import Link from "next/link";
import SkillsSection from './SkillsSection';
import ExperienceSection from './ExperienceSection';
import EducationSection from './EducationSection';
import ApplicantsModal from './ApplicantsModal';
const Profile = ({ userId, userData, initialClientData }) => {

  //console.log("User data:", initialClientData);

  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bio, setBio] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState(null);
  const [skills, setSkills] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [education, setEducation] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingClient, setIsEditingClient] = useState(false);
  const [clientData, setClientData] = useState(null);
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [isHiring, setIsHiring] = useState("");
  const [listings, setListings] = useState([]);
  const [roleStatus, setRoleStatus] = useState("");
  const [showApplicantsModal, setShowApplicantsModal] = useState(false);
  const [applicants, setApplicants] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState([]);   

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (userData.userType === "contractor") {
          await Promise.all([
            fetchProfile(),
            fetchSkills(),
            fetchExperiences(),
            fetchAppliedJobs()
          ]);
        } else if (userData.userType === "client") {
          await Promise.all([
            fetchListings(),
            fetchClient()
          ]);
        }
      } catch (error) {
        console.error("Fetch error:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchData();
    }
  }, [userId, userData.userType]);

  const fetchAppliedJobs = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/listings/applied-jobs/${userId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch applied jobs');
      }
      const data = await response.json();
      console.log("Applied jobs:", data);
      setAppliedJobs(data);
    } catch (err) {
      console.error('Error fetching applied jobs:', err);
      setError('Failed to load applied jobs');
    }
  };

  const fetchProfile = async () => {
    const response = await fetch(`http://localhost:3001/profile/${userId}`);
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    setUserProfile(data);
    setBio(data.bio);
    setPhoneNumber(data.phone_number);
    setRoleStatus(data.role_status);
    setEducation(data.education || '');
  };

  const fetchSkills = async () => {
    try {
      const response = await fetch(`http://localhost:3001/profile/skills/${userId}`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      setSkills(data.skills || []);
      setEducation(data.education || "");
    } catch (error) {
      console.error("Error fetching skills:", error);
      setError(error.message);
    }
  };

  const fetchListings = async () => {
    const response = await fetch(`http://localhost:3001/profile/listings/${userId}`);
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    setListings(data);
  };

  const fetchClient = async () => {
    try {
      const response = await fetch(`http://localhost:3001/profile/client/${userId}`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      setClientData(data);
      setCompany(data.company || "");
      setLocation(data.location || "");
      setIsHiring(data.isHiring || "");
    } catch (error) {
      setError(error.message);
    }
  };

  const fetchExperiences = async () => {
    try {
      const response = await fetch(`http://localhost:3001/profile/experiences/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch experiences');
      const data = await response.json();
      setExperiences(data.experiences || []);
    } catch (error) {
      console.error("Error fetching experiences:", error);
      setError(error.message);
    }
  };

  const handleBioChange = (e) => {
    setBio(e.target.value);
  };

  const handlePhoneNumberChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setPhoneNumber(value);
    }
  };

  const handleAddSkill = () => {
    setSkills([...skills, '']);
  };

  const handleSkillChange = (index, value) => {
    const newSkills = [...skills];
    newSkills[index] = value;
    setSkills(newSkills);
  };

  const handleRemoveSkill = (index) => {
    const newSkills = skills.filter((_, i) => i !== index);
    setSkills(newSkills);
  };

  const handleAddExperience = () => {
    setExperiences([...experiences, {
      company_name: "",
      role_title: "",
      start_date: "",
      end_date: "",
      description: ""
    }]);
  };

  const fetchApplicants = async (jobId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/listings/applicants/${jobId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch applicants');
      }
      const data = await response.json();
      console.log("Fetched applicants:", data);
      setApplicants(data);
      setShowApplicantsModal(true);
    } catch (error) {
      console.error('Error fetching applicants:', error);
      alert('Failed to load applicants');
    }
  };

  const handleSeeApplicants = (jobId) => {
    setSelectedJobId(jobId);
    fetchApplicants(jobId);
  };

  const handleCloseModal = () => {
    setShowApplicantsModal(false);
    setApplicants([]);
  };

  const handleExperienceChange = (index, field, value) => {
    const newExperiences = [...experiences];
    newExperiences[index][field] = value;
    setExperiences(newExperiences);
  };

  const handleRemoveExperience = (index) => {
    const newExperiences = experiences.filter((_, i) => i !== index);
    setExperiences(newExperiences);
  };

  const handleCompanyChange = (e) => {
    setCompany(e.target.value);
  };
  const handleLocationChange = (e) => {
    setLocation(e.target.value);
  };
  const handleHiringChange = (e) => {
    setIsHiring(e.target.value);
  };
  const handleRoleStatusChange = (e) => {
    setRoleStatus(e.target.value);
  };
  

  const handleSaveProfile = async () => {
    try {
      const profileData = {
        bio: bio || '',
        phone_number: phoneNumber || null,
        role_status: roleStatus || 'Looking for Work'
      };
      
      const response = await fetch(`http://localhost:3001/profile/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedProfile = await response.json();
      //console.log("Updated profile:", updatedProfile);
      setUserProfile(updatedProfile);

      const skillsResponse = await fetch(`http://localhost:3001/profile/skills/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ skills, experience, education }),
      });
      if (!skillsResponse.ok) {
        throw new Error(`Error: ${skillsResponse.status} ${skillsResponse.statusText}`);
      }
      const updatedSkills = await skillsResponse.json();
      //("Updated skills:", updatedSkills);
      setSkills(updatedSkills.skills);
      setExperiences(updatedSkills.experience);
      setEducation(updatedSkills.education);
      
      setIsEditing(false);


      await fetchProfile();
      setIsEditingProfile(false);
      alert('Profile updated successfully!');

    } catch (error) {
      console.error("Error saving profile:", error);
      alert('Failed to save profile: ' + error.message);
    }
  };

  const handleSaveClient = async () => {
    try {
      const response = await fetch(`http://localhost:3001/profile/client/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ company, location, isHiring }),
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      const updatedClientData = await response.json();
      //console.log("Updated client data:", updatedClientData);
      setClientData(updatedClientData);
      setCompany(updatedClientData.company);
      setLocation(updatedClientData.location);
      setIsHiring(updatedClientData.isHiring);
      setIsEditingClient(false);
    } catch (error) {
      console.error("Error updating client data:", error);
    }
  };

  const handleEducationChange = (e) => {
    setEducation(e.target.value);
  };

  if (loading) return <p>Loading profile data...</p>;
  if (error) return <p>Error loading profile: {error}</p>;


  if (userData.userType === "contractor") {


  return (
    <>
    <div className="flex min-h-screen flex-col items-center p-24">
      <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Profile</h1>
        <p className="mb-2"><strong>Email:</strong> {userData.email}</p>
        <p className="mb-2"><strong>Name:</strong> {userData.name}</p>
        <Premium contractorId={userId} />
        
        <div className="my-4">
          <label htmlFor="bio"><strong>Bio:</strong></label>
          {isEditingProfile ? (
            <textarea
              id="bio"
              value={bio}
              onChange={handleBioChange}
              className="w-full p-2 mt-2 border rounded"
            />
          ) : (
            <p>{bio}</p>
          )}
        </div>

        <div className="my-4">
          <label htmlFor="phone_number"><strong>Phone Number:</strong></label>
          {isEditingProfile ? (
            <input
              id="phone_number"
              type="tel"
              placeholder="1234567890"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              className="w-full p-2 mt-2 border rounded"
            />
          ) : (
            <p>{phoneNumber}</p>
          )}
        </div>

        <div className="my-4">
          <label htmlFor="role_status"><strong>Role Status:</strong></label>
          {isEditingProfile ? (
            <select
              id="role_status"
              value={roleStatus}
              onChange={handleRoleStatusChange}
              className="w-full p-2 mt-2 border rounded"
            >
              <option value="Looking for Work">Looking for Work</option>
              <option value="Employed">Employed</option>
            </select>
          ) : (
            <p>{roleStatus}</p>
          )}
        </div>

        {isEditingProfile ? (
          <button
            onClick={handleSaveProfile}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Save Profile
          </button>
        ) : (
          <button
            onClick={() => setIsEditingProfile(true)}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Edit Profile
          </button>
        )}

        <EducationSection 
          userId={userId}
          education={education}
          setEducation={setEducation}
        />

        <SkillsSection 
          userId={userId}
          skills={skills}
          education={education}
          setSkills={setSkills}
          setEducation={setEducation}
          fetchSkills={fetchSkills}
        />

        <ExperienceSection 
          userId={userId}
          experiences={experiences}
          setExperiences={setExperiences}
          fetchExperiences={fetchExperiences}
        />
      </div>
    </div>

    <div className="flex flex-col items-center p-24">
          <div className="max-w-8xl w-full bg-white p-6 rounded-sm shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mt-4">Jobs You Applied</h2>
            
            {appliedJobs.length > 0 ? (
              <div className="flex flex-wrap justify-left">
                {appliedJobs.map((job) => (
                  <div key={job.job_id} className="max-w-md w-full bg-white p-6 m-4 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-gray-800">{job.title}</h3>
                    <p className="text-gray-600">{job.description}</p>
                    <p className="text-gray-500">Location: {job.location}</p>
                    <p className="text-gray-500">Posted: {job.date_posted}</p>
                    <p className="text-gray-500">Status: {job.status}</p>
                    <p className="text-gray-500">Salary: ${job.min_salary} - ${job.max_salary}</p>
                    </div>
                ))}
                
              </div>
            ) : (
            <p>No listings found.</p>
          )}
      </div>
    </div>
    </>
  );
}



else {
  return (
    <>
    <div className="flex flex-col items-center p-8">
      <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Profile</h1>
        <p className="mb-2"><strong>Email:</strong> {userData.email}</p>
        <p className="mb-2"><strong>Name:</strong> {userData.name}</p>
          {isEditingClient ? (
            <>
              <p className="mb-2"><strong>Company:</strong></p>
              <textarea
                id="company"
                type="text"
                placeholder="Enter your company"
                value={company}
                onChange={handleCompanyChange}
                className="w-full p-2 mt-2 border rounded"
              />
            </>
          ) : (
            <p className="mb-2"><strong>Company:</strong> {company}</p>
          )}

          {isEditingClient ? (
            <>
              <p className="mb-2"><strong>Location:</strong></p>
              <textarea
                id="location"
                type="text"
                placeholder="Enter your location"
                value={location}
                onChange={handleLocationChange}
                className="w-full p-2 mt-2 border rounded"
              />
            </>
          ) : (
            <p className="mb-2"><strong>Location:</strong> {location}</p>
          )}
        
        {isEditingClient ? (
            <>
              <p className="mb-2"><strong>Status:</strong></p>
              <textarea
                id="isHiring"
                type="text"
                placeholder="Enter your hiring status"
                value={isHiring}
                onChange={handleHiringChange}
                className="w-full p-2 mt-2 border rounded"
              />
            </>
          ) : (
            <p className="mb-2"><strong>Status: </strong>{isHiring}</p>
          )}
        {isEditingClient ? (
          <button
            onClick={handleSaveClient}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Save Profile
          </button>
        ) : (
        <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                onClick={() => setIsEditingClient(true)}>
          Edit Profile
        </button>
        )}
          </div>
        </div>
        <div className="flex flex-col items-center p-24">
          <div className="max-w-8xl w-full bg-white p-6 rounded-sm shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mt-4">Listings</h2>
            {/* Button to navigate to the job creation page */}
            <Link href="/listingform">
          <button
            className="mt-4 mb-6 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Create New Job Listing
          </button></Link>
            {listings.length > 0 ? (
              <div className="flex flex-wrap justify-left">
                {listings.map((listing) => (
                  <div key={listing.job_id} className="max-w-md w-full bg-white p-6 m-4 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-2">{listing.title}</h2>
                    <p><strong>Description:</strong> {listing.description}</p>
                    <p><strong>Location:</strong> {listing.location}</p>
                    <p><strong>Minimum Salary:</strong> {listing.min_salary}</p>
                    <p><strong>Maximum Salary:</strong> {listing.max_salary}</p>
                    <p><strong>Actual Salary:</strong> {listing.actual_salary}</p>
                    <p><strong>Date Posted:</strong> {listing.date_posted}</p>
                    <p><strong>Rate Type:</strong> {listing.rate_type}</p>
                    <button onClick={() => handleSeeApplicants(listing.job_id)}
                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
                      See Applicants </button>
                  </div>
                ))}
                
              </div>
            ) : (
            <p>No listings found.</p>
          )}
      </div>
      <ApplicantsModal 
        show={showApplicantsModal} 
        onClose={handleCloseModal} 
        applicants={applicants} 
        jobId={selectedJobId} />
    </div>
    </>

    
  )
}};

export default Profile;
