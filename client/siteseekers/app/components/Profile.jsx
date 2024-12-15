import React, { useState, useEffect } from "react";

const Profile = ({ userId }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bio, setBio] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState(null);
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("");
  const [education, setEducation] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`http://localhost:3001/profile/${userId}`);
        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        setUserProfile(data);
        setBio(data.bio); // Set the initial bio
        setPhoneNumber(data.phone_number); // Set the initial phone number
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchSkills = async () => {
      try {
        const response = await fetch(`http://localhost:3001/profile/skills/${userId}`);
        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        setSkills(data.skills || "");
        setExperience(data.experience || "");
        setEducation(data.education || "");
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchProfile();
      fetchSkills();
    }
  }, [userId]);

  const handleBioChange = (e) => {
    setBio(e.target.value);
  };

  const handlePhoneNumberChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) { // Only allow numeric input
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

      // Update skills
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

  return (
    <div>
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
  );
};

export default Profile;