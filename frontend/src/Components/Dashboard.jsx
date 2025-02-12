// src/components/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BACKEND_URL, fetchWithRetry, checkAuthStatus } from '../utils/apiUtils';

const Dashboard = () => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [posts, setPosts] = useState([]);
    const [newPostTitle, setNewPostTitle] = useState('');
    const [newPostContent, setNewPostContent] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const capitalizeName = (name) => {
        if (!name) return '';
        return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    };

    useEffect(() => {
        const initializeDashboard = async () => {
            try {
                setIsLoading(true);
                const { isAuthenticated, user } = await checkAuthStatus();
                
                if (!isAuthenticated) {
                    navigate('/login');
                    return;
                }

                setUserData(user);
                
                // Fetch posts only if authenticated
                const data = await fetchWithRetry(`${BACKEND_URL}/posts`);
                setPosts(data.posts || []);
            } catch (error) {
                console.error('Dashboard initialization failed:', error);
                setError('Failed to load dashboard. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        initializeDashboard();
    }, [navigate]);

    const handleLogout = async () => {
        try {
            await fetchWithRetry(`${BACKEND_URL}/logout`, {
                method: 'POST'
            });
            navigate('/login');
        } catch (err) {
            console.error('Logout failed:', err);
            alert('Failed to logout. Please try again.');
        }
    };

    const handlePostSubmit = async () => {
        if (!newPostTitle.trim() || !newPostContent.trim()) {
            alert("Title and content are required.");
            return;
        }

        try {
            const data = await fetchWithRetry(`${BACKEND_URL}/post`, {
                method: 'POST',
                body: JSON.stringify({
                    title: newPostTitle,
                    content: newPostContent,
                }),
            });

            if (data && data.post) {
                setPosts([data.post, ...posts]);
                setNewPostTitle('');
                setNewPostContent('');
            }
        } catch (error) {
            console.error('Failed to create post:', error);
            alert('Failed to create post. Please try again.');
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center h-screen">
                <div className="text-xl text-red-500 mb-4">{error}</div>
                <button
                    onClick={() => window.location.reload()}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="p-4 border-b-1">
            <h3 className="text-xl font-bold mb-4">Welcome to the Dashboard</h3>
            {userData && (
                <p className="mb-4">
                    Logged in as: {capitalizeName(userData.firstName)} {capitalizeName(userData.lastName)}
                </p>
            )}

            <div className="mt-6 mb-6 p-4 border rounded shadow-md">
                <input
                    type="text"
                    className="w-full p-2 border rounded mb-4"
                    placeholder="Post Title"
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                />
                <textarea
                    className="w-full p-2 border rounded mb-4"
                    rows="4"
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="Write a new post..."
                />
                <button
                    onClick={handlePostSubmit}
                    className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
                >
                    Post
                </button>
            </div>

            <div className="mt-6">
                <h4 className="text-lg font-semibold mb-3">Posts</h4>
                <div className="space-y-4">
                    {posts.map(post => (
                        <div key={post._id} className="border p-4 rounded shadow-md">
                            <h5 className="font-bold mb-2">{post.title}</h5>
                            <p className="font-bold text-sm text-gray-600">
                                {capitalizeName(post.author.firstName)} {capitalizeName(post.author.lastName)}:
                            </p>
                            <p className="mt-2">{post.content}</p>
                            <p className="text-sm text-gray-500 mt-2">
                                Posted on: {new Date(post.createdAt).toLocaleString()}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 absolute top-4 right-4"
            >
                Log out
            </button>
        </div>
    );
};

export default Dashboard;