import React, { useState, useEffect } from "react";
import Premium from './Premium';

const Profile = ({ userId, userData }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bio, setBio] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState(null);
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("");
  const [education, setEducation] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [listings, setListings] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (userData.userType === "contractor") {
          await Promise.all([
            fetchProfile(),
            fetchSkills()
          ]);
        } else if (userData.userType === "client") {
          await fetchListings();
        }
      } catch (error) {
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
  };

  const fetchSkills = async () => {
    const response = await fetch(`http://localhost:3001/profile/skills/${userId}`);
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    setSkills(data.skills || "");
    setExperience(data.experience || "");
    setEducation(data.education || "");
  };

  const fetchListings = async () => {
    const response = await fetch(`http://localhost:3001/profile/listings/${userId}`);
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    setListings(data);
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

  const handleSkillsChange = (e) => {
    setSkills(e.target.value);
  };

  const handleExperienceChange = (e) => {
    setExperience(e.target.value);
  };

  const handleEducationChange = (e) => {
    setEducation(e.target.value);
  };

  const handleSaveProfile = async () => {
    try {
      const response = await fetch(`http://localhost:3001/profile/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bio, phone_number: phoneNumber }),
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      const updatedProfile = await response.json();
      console.log("Updated profile:", updatedProfile);
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
      console.log("Updated skills:", updatedSkills);
      setSkills(updatedSkills.skills);
      setExperience(updatedSkills.experience);
      setEducation(updatedSkills.education);
      
      setIsEditing(false);
    } catch (error) {
      setError(error.message);
    }
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
          {isEditing ? (
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
          {isEditing ? (
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
          <label htmlFor="skills"><strong>Skills</strong></label>
          {isEditing ? (
            <textarea
              id="skills"
              type="text"
              placeholder="Enter your skills"
              value={skills}
              onChange={handleSkillsChange}
              className="w-full p-2 mt-2 border rounded"
            />
          ) : (
            <p>{skills}</p>
          )}
        </div>
        <div className="my-4">
          <label htmlFor="experience"><strong>Experience</strong></label>
          {isEditing ? (
            <textarea
              id="experience"
              type="text"
              placeholder="Enter your experience"
              value={experience}
              onChange={handleExperienceChange}
              className="w-full p-2 mt-2 border rounded"
            />
          ) : (
            <p>{experience}</p>
          )}
        </div>
        <div className="my-4">
          <label htmlFor="education"><strong>Education</strong></label>
          {isEditing ? (
            <textarea
              id="education"
              type="text"
              placeholder="Enter your education"
              value={education}
              onChange={handleEducationChange}
              className="w-full p-2 mt-2 border rounded"
            />
          ) : (
            <p>{education}</p>
          )}
        </div>
        {isEditing ? (
          <button
            onClick={handleSaveProfile}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Save Profile
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Edit Profile
          </button>
        )}
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
          </div>
        </div>
        <div className="flex flex-col items-center p-24">
          <div className="max-w-8xl w-full bg-white p-6 rounded-sm shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mt-4">Listings</h2>
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