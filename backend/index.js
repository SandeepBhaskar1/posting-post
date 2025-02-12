const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const FRONTEND_URI = process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_CLOUD_URL 
    : process.env.FRONTEND_LOCAL_URL;

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'https://posting-post-frontend.vercel.app',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'], 
    credentials: true,
}));

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const token = req.cookies.auth_token;
    
    if (!token) {
        return res.status(401).json({ message: 'Please login to continue' });
    }
    
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Unauthorized', error: err });
        }
        req.user = decoded;
        next();
    });
};

// User schema definition
const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dateOfBirth: { type: String, required: true },
    gender: { type: String, required: true },
    emailID: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true },
    password: { type: String, required: true },
    posts: [{
        _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
        title: String,
        content: String,
        createdAt: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);

// Post schema definition
const postsSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: {
        _id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        firstName: String,
        lastName: String,
        emailID: String
    },
    createdAt: { type: Date, default: Date.now },
});

const Post = mongoose.model('Post', postsSchema);

mongoose.connect(MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.log('Cannot connect to MongoDB', err));

const getUser = (req, res) => {
    User.find({})
        .populate({ path: 'posts._id', model: 'Post' })
        .then((list) => {
            res.send(list);
        })
        .catch((err) => {
            res.send(err);
        });
};

// Check authentication status
app.get('/checkAuth', authenticateToken, async (req, res) => {
    const user = await User.findById(req.user.userID);
    res.status(200).json({
        isAuthenticated: true,
        user: {
            firstName: user.firstName,
            lastName: user.lastName,
        },
    });
});

// Protected home route
app.get('/', authenticateToken, (req, res) => {
    res.status(200).json({
        message: 'Welcome to home page',
        user: req.user,
    });
});

app.get('/posts', async (req, res) => {
    try {
        const posts = await Post.find().populate('author', 'firstName lastName creattedAt ').sort({createdAt: -1});
        res.json({ posts });
    } catch (error) {
        res.status(404).json({ message: 'Failed to fetch posts' });
    }
});


app.post('/post', authenticateToken, async (req, res) => {
    const { title, content } = req.body;

    if (!title || !content) {
        return res.status(400).json({ message: 'Title and content are required' });
    }

    try {
        // Find the user first to get their details
        const user = await User.findById(req.user.userID);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Create a new post with user details
        const newPost = await Post.create({
            title,
            content,
            author: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                emailID: user.emailID
            }
        });

        // Add post details to user's posts array
        user.posts.push({
            _id: newPost._id,
            title: newPost.title,
            content: newPost.content,
            createdAt: newPost.createdAt
        });

        // Save the user with the updated posts array
        await user.save();

        res.status(201).json({
            message: 'Post added successfully',
            post: newPost,
        });
    } catch (err) {
        console.error('Error while adding the post:', err);
        res.status(500).json({ message: 'Error occurred while adding the post', error: err.message });
    }
});

// Dashboard route
app.get('/dashboard', authenticateToken, (req, res) => {
    res.status(200).json({
        message: 'Welcome to dashboard',
        user: req.user,
    });
});

// Register route
app.post('/register', async (req, res) => {
    const { firstName, lastName, dateOfBirth, gender, emailID, phoneNumber, password } = req.body;

    if (!firstName || !lastName || !dateOfBirth || !emailID || !gender || !phoneNumber || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const existingUser = await User.findOne({ emailID });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = new User({
            firstName,
            lastName,
            dateOfBirth,
            gender,
            emailID,
            phoneNumber,
            password: hashedPassword,
        });

        await newUser.save();
        return res.status(201).json({ message: 'Registration successful!' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error occurred while registering' });
    }
});

// Login route
app.post('/login', async (req, res) => {
    const { emailID, password } = req.body;

    if (!emailID || !password) {
        return res.status(400).json({ message: 'Email and password required!' });
    }

    try {
        const user = await User.findOne({ emailID });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userID: user.id, emailID: user.emailID },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            path: '/',
        });

        return res.status(200).json({
            message: 'Login successful',
            user: {
                firstName: user.firstName,
                emailID: user.emailID,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error occurred during login' });
    }
});

// Logout route
app.post('/logout', authenticateToken, (req, res) => {
    res.cookie('auth_token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        expires: new Date(0),
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
    });

    return res.status(200).json({ message: 'Logout successful' });
});

app.listen(PORT, () => {
    console.log(`Server is listening on http://localhost:${PORT}`);
});