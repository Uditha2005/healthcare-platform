const User = require('../models/User');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const DOCTOR_SERVICE_URL = process.env.DOCTOR_SERVICE_URL || 'http://localhost:5002';

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, specialization, experience } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password, role });

    if (role === 'doctor') {
      try {
        await axios.post(`${DOCTOR_SERVICE_URL}/api/doctors`, {
          userId: user._id,
          name,
          email,
          specialization: specialization || 'General',
          experience: Number(experience) || 0,
          availability: []
        });
      } catch (syncErr) {
        console.error('Doctor profile sync failed:', syncErr.message);
        // Clean up: remove the user if doctor profile creation fails
        await User.findByIdAndDelete(user._id);
        return res.status(500).json({ message: 'Failed to create doctor profile. Please try again.' });
      }
    }

    const token = generateToken(user);

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/auth/verify
exports.verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ valid: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ valid: false, message: 'User not found' });
    }

    res.status(200).json({ valid: true, user });
  } catch (err) {
    res.status(401).json({ valid: false, message: 'Invalid or expired token' });
  }
};

// GET /api/auth/users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
};

// PUT /api/auth/users/:id/verify
exports.updateUserVerification = async (req, res) => {
  try {
    const { isVerified } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isVerified: !!isVerified },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Sync verification status to doctor-service if user is a doctor
    if (user.role === 'doctor') {
      try {
        const axios = require('axios');
        const doctorServiceUrl = process.env.DOCTOR_SERVICE_URL || 'http://localhost:5002';
        const doctorRes = await axios.get(`${doctorServiceUrl}/api/doctors/user/${user._id}`);
        if (doctorRes.data && doctorRes.data._id) {
          await axios.put(`${doctorServiceUrl}/api/doctors/${doctorRes.data._id}`, { isVerified: !!isVerified });
        }
      } catch (syncErr) {
        console.error('Doctor verification sync failed:', syncErr.message);
      }
    }

    res.status(200).json({ message: 'User verification updated', user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update verification', error: err.message });
  }
};

// DELETE /api/auth/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If deleting a doctor, also remove their profile from doctor-service
    if (user.role === 'doctor') {
      try {
        let doctorId = null;

        // Try lookup by userId first
        try {
          const docRes = await axios.get(`${DOCTOR_SERVICE_URL}/api/doctors/user/${user._id}`);
          if (docRes.data && docRes.data._id) doctorId = docRes.data._id;
        } catch (_) {}

        // Fallback: lookup by email for doctors registered before userId was added
        if (!doctorId && user.email) {
          try {
            const docRes = await axios.get(`${DOCTOR_SERVICE_URL}/api/doctors/email/${encodeURIComponent(user.email)}`);
            if (docRes.data && docRes.data._id) doctorId = docRes.data._id;
          } catch (_) {}
        }

        if (doctorId) {
          await axios.delete(`${DOCTOR_SERVICE_URL}/api/doctors/${doctorId}`);
        }
      } catch (err) {
        console.error('Failed to delete doctor profile from doctor-service:', err.message);
      }
    }

    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'User deleted successfully', user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user', error: err.message });
  }
};