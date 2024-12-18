"use client";
import React, { useState } from "react";
import Link from "next/link";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    user_type: "client",
    location: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password) {
      alert("Please fill in all required fields");
      return;
    }

    if (formData.user_type === 'client' && !formData.location) {
      alert("Location is required for clients");
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/auth/register", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error registering user');
      }

      if (formData.user_type === 'contractor' && data.userId) {
        const profileResponse = await fetch("http://localhost:3001/profile/create", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contractor_id: data.userId,
            bio: "",
            phone_number: null,
            role_status: "Looking for Work"
          })
        });

        if (!profileResponse.ok) {
          throw new Error("Failed to create profile");
        }
      }
      
      alert("Registration successful!");
      window.location.href = '/login';
    } catch (error) {
      console.error("Registration error:", error);
      alert(error.message);
    }
  };

  return (
    <div>
      <Link 
        href="/" 
        style={{
          display: 'inline-block',
          padding: '8px 16px',
          backgroundColor: '#f0f0f0',
          borderRadius: '4px',
          textDecoration: 'none',
          color: '#333',
          marginBottom: '20px'
        }}
      >
        ← Home
      </Link>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <select
          name="user_type"
          value={formData.user_type}
          onChange={handleChange}
        >
          <option value="client">Client</option>
          <option value="contractor">Contractor</option>
        </select>
        <input
          type="text"
          name="location"
          placeholder="Location"
          value={formData.location}
          onChange={handleChange}
          required={formData.user_type === 'client'}
        />
        <button type="submit">Register</button>
      </form>
    </div>
  );
};
export default Register;
