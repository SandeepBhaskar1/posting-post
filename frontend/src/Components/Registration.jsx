import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Registration = () => {
  const BACKEND_URL = import.meta.env.MODE === 'production' 
    ? import.meta.env.VITE_BACKEND_CLOUD_URL 
    : import.meta.env.VITE_BACKEND_LOCAL_URL;

    const navigate = useNavigate();

  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'Select',
    emailID: '',
    phoneNumber: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BACKEND_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
      });
      const result = await response.json();
      if (response.ok) {
        alert('Registration Successful!');
        navigate('/login')
      } else {
        alert('Error occurred while registering the user.');
      }
    } catch (Error) {
      alert('An error occurred, please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold text-center mb-6">User Registration</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label htmlFor="firstName" className="block">
            First Name:
            <input
              type="text"
              name="firstName"
              id="firstName"
              value={user.firstName}
              onChange={handleChange}
              required
              className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </label>

          <label htmlFor="lastName" className="block">
            Last Name:
            <input
              type="text"
              name="lastName"
              id="lastName"
              value={user.lastName}
              onChange={handleChange}
              required
              className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </label>

          <label htmlFor="dateOfBirth" className="block">
            Date of Birth:
            <input
              type="date"
              name="dateOfBirth"
              id="dateOfBirth"
              value={user.dateOfBirth}
              onChange={handleChange}
              required
              className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </label>

          <label htmlFor="gender" className="block">
            Gender:
            <select
              name="gender"
              id="gender"
              value={user.gender}
              onChange={handleChange}
              required
              className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Select" disabled>Select your gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Others">Others</option>
            </select>
          </label>

          <label htmlFor="emailID" className="block">
            Email ID:
            <input
              type="email"
              name="emailID"
              id="emailID"
              value={user.emailID}
              onChange={handleChange}
              required
              className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </label>

          <label htmlFor="phoneNumber" className="block">
            Phone Number:
            <input
              type="tel"
              name="phoneNumber"
              id="phoneNumber"
              value={user.phoneNumber}
              onChange={handleChange}
              required
              className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </label>

          <label htmlFor="password" className="block">
            Password:
            <input
              type="password"
              name="password"
              id="password"
              value={user.password}
              onChange={handleChange}
              required
              className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </label>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors mt-4"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default Registration;