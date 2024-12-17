import React, { useState, useEffect } from "react";
import Premium from './Premium';
import Link from "next/link";
import SkillsSection from './SkillsSection';
import ExperienceSection from './ExperienceSection';
import EducationSection from './EducationSection';

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
  const [clientData, setClientData] = useState(initialClientData || null);
  const [company, setCompany] = useState(initialClientData ? initialClientData.company : "");
  const [location, setLocation] = useState(initialClientData ? initialClientData.location : "");
  const [isHiring, setIsHiring] = useState(initialClientData ? initialClientData.isHiring : "");
  const [listings, setListings] = useState([]);
  const [roleStatus, setRoleStatus] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (userData.userType === "contractor") {
          const [profileData, skillsData, experiencesResponse] = await Promise.all([
            fetch(`http://localhost:3001/profile/${userId}`),
            fetch(`http://localhost:3001/profile/skills/${userId}`),
            fetch(`http://localhost:3001/profile/experiences/${userId}`)
          ]);

          const profileJson = await profileData.json();
          setUserProfile(profileJson);
          setBio(profileJson.bio);
          setPhoneNumber(profileJson.phone_number);
          setRoleStatus(profileJson.role_status);
          
          const skillsJson = await skillsData.json();
          setSkills(skillsJson.skills || []);
          setEducation(skillsJson.education || "");

          const experiencesJson = await experiencesResponse.json();
          setExperiences(experiencesJson.experiences || []);
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
        //console.log("Listings response:", response);
        const data = await response.json();
        setClientData(data);
        setCompany(data.company);
        setLocation(data.location);
        setIsHiring(data.isHiring);
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
      console.log("Updated client data:", updatedClientData);
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
                  </div>
                ))}
                
              </div>
            ) : (
            <p>No listings found.</p>
          )}
      </div>
    </div>
    </>

    
  )
}
};

export default Profile;