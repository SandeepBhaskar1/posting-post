import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [posts, setPosts] = useState([]);
    const [newPostTitle, setNewPostTitle] = useState(''); // New state for title
    const [newPostContent, setNewPostContent] = useState('');
    const BACKEND_URL = import.meta.env.MODE === 'production'
        ? import.meta.env.VITE_BACKEND_CLOUD_URL 
        : import.meta.env.VITE_BACKEND_LOCAL_URL;

    const capitalizeName = (name) => {
        if (!name) return '';  // If name is empty, return empty string
        return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    };

    useEffect(() => {
        const checkAuthentication = async () => {
            try {
                const response = await fetch(`${BACKEND_URL}/checkAuth`, {
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    navigate('/login');
                    return;
                }

                const data = await response.json();
                setUserData(data.user);
            } catch (error) {
                console.error('Authentication check failed:', error);
                navigate('/login');
            }
        };

        checkAuthentication();
    }, [navigate, BACKEND_URL]);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await fetch(`${BACKEND_URL}/posts`,{
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setPosts(data.posts);
                } else {
                    console.error('Failed to fetch posts');
                }
            } catch (error) {
                console.error('Error fetching posts:', error);
            }
        };

        fetchPosts();
    }, [BACKEND_URL]);

    const handleLogout = async () => {
        try {
            const response = await fetch(`${BACKEND_URL}/logout`, {
                method: 'POST',
                credentials: 'include',
            });

            if (response.ok) {
                navigate('/login');
            } else {
                const data = await response.json();
                alert(data.message || 'Logout failed');
            }
        } catch (err) {
            console.error('Error in logging out:', err);
            alert('An error occurred while logging out');
        }
    };

    const handlePostSubmit = async () => {
        if (!newPostTitle.trim() || !newPostContent.trim()) {
            alert("Title and content are required.");
            return;
        }

        try {
            const response = await fetch(`${BACKEND_URL}/post`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    title: newPostTitle,  
                    content: newPostContent,  
                }),
            });

            const contentType = response.headers.get('Content-Type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Expected JSON response');
            }

            const data = await response.json();

            if (response.ok) {
                setPosts([data.post, ...posts]);
                setNewPostTitle('');  
                setNewPostContent('');  
            } else {
                alert(data.message || 'Failed to post');
            }
        } catch (error) {
            console.error('Error posting new post:', error);
            alert('An error occurred while posting');
        }
    };

    if (!userData || posts.length === 0) {
        return <div>Loading...</div>;
    }

    return (
        <div className="p-4 border-b-1">
            <h3 className="text-xl font-bold mb-4">Welcome to the Dashboard</h3>
            {userData && (
                <p className="mb-4">Logged in as: {capitalizeName(userData.firstName)} {capitalizeName(userData.lastName)}</p>
            )}

            {/* New Post Block */}
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
                            <p className="font-bold">{capitalizeName(post.author.firstName)} {capitalizeName(post.author.lastName)}:</p>
                            <p>{post.content}</p>
                            <p className="text-sm text-gray-500">Posted on: {new Date(post.createdAt).toLocaleString()}</p>
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
