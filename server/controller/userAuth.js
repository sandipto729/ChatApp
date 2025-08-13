const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../model/User');

// Generate access token (short-lived)
const generateAccessToken = (userId) => {
    return jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
};

// Generate refresh token (long-lived)
const generateRefreshToken = (userId) => {
    return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
};

// Register user
const register = async (req, res) => {
    try {
        const { name, email, password, profilePic } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            profilePic: profilePic || ''
        });

        await newUser.save();

        // Generate tokens
        const accessToken = generateAccessToken(newUser._id);
        const refreshToken = generateRefreshToken(newUser._id);

        // Save refresh token in database
        newUser.refreshToken = refreshToken;
        await newUser.save();

        // Set refresh token as httpOnly cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                profilePic: newUser.profilePic,
                status: newUser.status
            },
            accessToken
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Login user
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate tokens
        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        // Save refresh token in database
        user.refreshToken = refreshToken;
        await user.save();

        // Set refresh token as httpOnly cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.status(200).json({
            message: 'Login successful',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                profilePic: user.profilePic,
                status: user.status
            },
            accessToken
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Fetch user profile (requires valid access token)
const fetchUser = async (req, res) => {
    try {
        // Get user ID from the authenticated request (set by middleware)
        const userId = req.userId;

        // Find user by ID (excluding sensitive information)
        const user = await User.findById(userId).select('-password -refreshToken');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            message: 'User fetched successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                profilePic: user.profilePic,
                status: user.status,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });

    } catch (error) {
        console.error('Fetch user error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Logout user
const logout = async (req, res) => {
    try {
        const userId = req.userId;
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(400).json({ message: 'No refresh token found' });
        }

        // Remove refresh token from database
        await User.findByIdAndUpdate(userId, { refreshToken: null });

        // Clear the refresh token cookie
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        res.status(200).json({ message: 'Logout successful' });

    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Refresh access token
const refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({ message: 'Refresh token not found' });
        }

        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const userId = decoded.userId;

        // Check if refresh token exists in database
        const user = await User.findById(userId);
        if (!user || user.refreshToken !== refreshToken) {
            return res.status(403).json({ message: 'Invalid refresh token' });
        }

        // Generate new access token
        const newAccessToken = generateAccessToken(userId);

        res.status(200).json({
            message: 'Token refreshed successfully',
            accessToken: newAccessToken
        });

    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(403).json({ message: 'Invalid or expired refresh token' });
        }
        console.error('Refresh token error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Middleware to verify access token
const verifyAccessToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; 

    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(403).json({ message: 'Invalid access token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(403).json({ message: 'Access token expired' });
        }
        return res.status(403).json({ message: 'Token verification failed' });
    }
};

module.exports = {
    register,
    login,
    fetchUser,
    logout,
    refreshToken,
    verifyAccessToken
};
