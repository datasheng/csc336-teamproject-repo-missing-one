import React, { useState } from 'react';

const EducationSection = ({ userId, education, setEducation }) => {
  const [isEditingEducation, setIsEditingEducation] = useState(false);

  const handleSaveEducation = async () => {
    try {
      const response = await fetch(`http://localhost:3001/profile/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          education: education || ''
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update education');
      }

      const data = await response.json();
      setEducation(data.education || '');
      setIsEditingEducation(false);
      alert('Education updated successfully!');
    } catch (error) {
      console.error("Error saving education:", error);
      alert('Failed to save education: ' + error.message);
    }
  };

  return (
    <div className="mt-8 border-t pt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Education</h2>
        {isEditingEducation ? (
          <button
            onClick={handleSaveEducation}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Save Education
          </button>
        ) : (
          <button
            onClick={() => setIsEditingEducation(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Edit Education
          </button>
        )}
      </div>

      <div className="my-4">
        {isEditingEducation ? (
          <textarea
            value={education}
            onChange={(e) => setEducation(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter your education details"
          />
        ) : (
          <p>{education}</p>
        )}
      </div>
    </div>
  );
};

export default EducationSection; 