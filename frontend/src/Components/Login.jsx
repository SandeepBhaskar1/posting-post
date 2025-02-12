import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const BACKEND_URL = import.meta.env.MODE === 'production' ? 
        import.meta.env.VITE_BACKEND_CLOUD_URL : import.meta.env.VITE_BACKEND_LOCAL_URL;

    const [user, setUser] = useState({
        emailID: '',
        password: ''
    });

    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const response = await fetch(`${BACKEND_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user),
            credentials: 'include', 
        });

        const result = await response.json();

        if (response.ok) {
            navigate('/'); 
        } else {
            setErrorMessage(result.message || 'Error while logging in');
        }
    };

    const handleChange = (e) => {
        setUser({
            ...user,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-lg">
                <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Login</h1>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="emailID" className="block text-gray-700">Email ID:</label>
                        <input
                            type="email"
                            name="emailID"
                            id="emailID"
                            value={user.emailID}
                            onChange={handleChange}
                            autoComplete="user-name"
                            required
                            className="w-full px-4 py-2 mt-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="password" className="block text-gray-700">Password:</label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            value={user.password}
                            onChange={handleChange}
                            autoComplete="current-password"
                            required
                            className="w-full px-4 py-2 mt-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div className="mb-4">
                        <button
                            type="submit"
                            className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
                        >
                            Login
                        </button>
                    </div>
                </form>
                {errorMessage && <div className="text-red-500 text-center mt-4">{errorMessage}</div>}
                <div className="text-center mt-4">
                    <button
                        onClick={() => navigate('/register')}
                        className="text-blue-500 underline"
                    >
                        Create Account
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
