import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from 'next/navigation';

const Login = () => {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    user_type: "client", // default to 'client'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3001/auth/login", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error logging in');
      }
      
      localStorage.setItem("token", "logged-in");
      localStorage.setItem("userData", JSON.stringify({
        user_type: formData.user_type,
        name: data.name,
        email: data.email,
        userId: data.userId
      }));
      
      alert(data.message); 
      router.push('/');
    } catch (error) {
      console.error(error);
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
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
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
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
