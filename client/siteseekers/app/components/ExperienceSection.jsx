import React, { useState } from 'react';

const ExperienceSection = ({ userId, experiences = [], setExperiences, fetchExperiences }) => {
  const [isEditingExperience, setIsEditingExperience] = useState(false);

  const handleAddExperience = () => {
    setExperiences([
      ...experiences, 
      { 
        company_name: '', 
        role_title: '', 
        start_date: '', 
        end_date: '', 
        description: '' 
      }
    ]);
  };

  const handleExperienceChange = (index, field, value) => {
    const newExperiences = [...experiences];
    newExperiences[index] = {
      ...newExperiences[index],
      [field]: value
    };
    setExperiences(newExperiences);
  };

  const handleRemoveExperience = (index) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  const handleSaveExperiences = async () => {
    try {
      console.log('Saving experiences:', experiences);

      const formattedExperiences = experiences.map(exp => ({
        ...exp,
        company_name: exp.company_name || '',
        role_title: exp.role_title || '',
        start_date: exp.start_date || null,
        end_date: exp.end_date || null,
        description: exp.description || ''
      }));

      const response = await fetch(`http://localhost:3001/profile/experiences/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ experiences: formattedExperiences }),
      });

      const data = await response.json();
      console.log('Server response:', data);

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to update experiences');
      }

      await fetchExperiences();
      setIsEditingExperience(false);
      alert('Experiences updated successfully!');
    } catch (error) {
      console.error("Error saving experiences:", error);
      alert('Failed to save experiences: ' + error.message);
    }
  };

  return (
    <div className="mt-8 border-t pt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Experience</h2>
        {isEditingExperience ? (
          <button
            onClick={handleSaveExperiences}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Save Experience
          </button>
        ) : (
          <button
            onClick={() => setIsEditingExperience(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Edit Experience
          </button>
        )}
      </div>

      {isEditingExperience ? (
        <div className="my-4">
          {experiences.map((exp, index) => (
            <div key={index} className="mb-4 p-4 border rounded">
              <input
                type="text"
                value={exp.company_name}
                onChange={(e) => handleExperienceChange(index, 'company_name', e.target.value)}
                className="w-full p-2 mb-2 border rounded"
                placeholder="Company Name"
              />
              <input
                type="text"
                value={exp.role_title}
                onChange={(e) => handleExperienceChange(index, 'role_title', e.target.value)}
                className="w-full p-2 mb-2 border rounded"
                placeholder="Role Title"
              />
              <div className="flex gap-2 mb-2">
                <input
                  type="date"
                  value={exp.start_date}
                  onChange={(e) => handleExperienceChange(index, 'start_date', e.target.value)}
                  className="flex-1 p-2 border rounded"
                />
                <input
                  type="date"
                  value={exp.end_date}
                  onChange={(e) => handleExperienceChange(index, 'end_date', e.target.value)}
                  className="flex-1 p-2 border rounded"
                />
              </div>
              <textarea
                value={exp.description}
                onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                className="w-full p-2 mb-2 border rounded"
                placeholder="Description"
              />
              <button
                onClick={() => handleRemoveExperience(index)}
                className="px-3 py-1 bg-red-500 text-white rounded"
              >
                Remove Experience
              </button>
            </div>
          ))}
          <button
            onClick={handleAddExperience}
            className="mt-2 px-3 py-1 bg-green-500 text-white rounded"
          >
            Add Experience
          </button>
        </div>
      ) : (
        <div className="my-4">
          {experiences.map((exp, index) => (
            <div key={index} className="mb-4 p-4 border rounded">
              <h3 className="font-bold">{exp.role_title} at {exp.company_name}</h3>
              <p className="text-gray-600">
                {new Date(exp.start_date).toLocaleDateString()} - 
                {exp.end_date ? new Date(exp.end_date).toLocaleDateString() : 'Present'}
              </p>
              <p className="mt-2">{exp.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExperienceSection; 