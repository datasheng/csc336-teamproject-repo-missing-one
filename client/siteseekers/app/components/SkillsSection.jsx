import React, { useState } from 'react';

const SkillsSection = ({ userId, skills, setSkills, fetchSkills }) => {
  const [isEditingSkills, setIsEditingSkills] = useState(false);

  const handleAddSkill = () => {
    setSkills([...skills, { skill_name: '' }]);
  };

  const handleSkillChange = (index, value) => {
    const newSkills = [...skills];
    newSkills[index] = { skill_name: value };
    setSkills(newSkills);
  };

  const handleRemoveSkill = (index) => {
    const newSkills = skills.filter((_, i) => i !== index);
    setSkills(newSkills);
  };

  const handleSaveSkills = async () => {
    try {
      const skillsToSave = skills
        .filter(skill => skill.skill_name && skill.skill_name.trim() !== "")
        .map(skill => skill.skill_name);

      const skillsResponse = await fetch(`http://localhost:3001/profile/skills/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skills: skillsToSave,
          preserveEducation: true
        }),
      });

      if (!skillsResponse.ok) {
        throw new Error('Failed to update skills');
      }

      await fetchSkills();
      setIsEditingSkills(false);
      alert('Skills updated successfully!');
    } catch (error) {
      console.error("Error saving skills:", error);
      alert('Failed to save skills: ' + error.message);
    }
  };

  return (
    <div className="mt-8 border-t pt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Skills</h2>
        {isEditingSkills ? (
          <button
            onClick={handleSaveSkills}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Save Skills
          </button>
        ) : (
          <button
            onClick={() => setIsEditingSkills(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Edit Skills
          </button>
        )}
      </div>

      {isEditingSkills ? (
        <div className="my-4">
          <label className="block font-bold mb-2">Skills</label>
          {skills.map((skill, index) => (
            <div key={index} className="flex mb-2">
              <input
                type="text"
                value={skill.skill_name || ''}
                onChange={(e) => handleSkillChange(index, e.target.value)}
                className="flex-1 p-2 border rounded"
              />
              <button
                onClick={() => handleRemoveSkill(index)}
                className="ml-2 px-3 py-1 bg-red-500 text-white rounded"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            onClick={handleAddSkill}
            className="mt-2 px-3 py-1 bg-green-500 text-white rounded"
          >
            Add Skill
          </button>
        </div>
      ) : (
        <div className="my-4">
          <ul className="list-disc pl-5">
            {skills.map((skill, index) => (
              <li key={index}>{skill.skill_name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SkillsSection; 