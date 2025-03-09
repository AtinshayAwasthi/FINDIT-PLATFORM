
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Create nodemailer transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.mailtrap.io', // Replace with your SMTP provider
  port: 2525, // Replace with your port
  auth: {
    user: process.env.EMAIL_USERNAME || 'test',
    pass: process.env.EMAIL_PASSWORD || 'test'
  }
});

// Helper function to send verification email
const sendVerificationEmail = async (user, verificationUrl) => {
  const mailOptions = {
    from: '"FindIt Support" <support@findit.com>',
    to: user.email,
    subject: 'Email Verification - FindIt Account',
    html: `
      <h1>Welcome to FindIt!</h1>
      <p>Hello ${user.name},</p>
      <p>Thank you for registering. Please verify your email address to complete the registration.</p>
      <a href="${verificationUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
      <p>If you didn't create an account, please ignore this email.</p>
      <p>Regards,<br/>FindIt Team</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Verification email sent to:', user.email);
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

// Generate verification token
const generateVerificationToken = () => {
  return crypto.randomBytes(20).toString('hex');
};

// Register a new user
exports.register = async (req, res) => {
  try {
    const { name, email, password, phoneNumber, googleId } = req.body;

    // Validate input
    if (!name || !email || (!password && !googleId) || !phoneNumber) {
      return res.status(400).json({ 
        message: 'Please provide all required fields' 
      });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate email verification token
    const emailVerificationToken = generateVerificationToken();
    const emailVerificationTokenExpires = new Date();
    emailVerificationTokenExpires.setHours(emailVerificationTokenExpires.getHours() + 24); // 24 hour expiry

    // Hash password if not using Google
    let hashedPassword;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    // Create a new user
    user = new User({
      name,
      email,
      phoneNumber,
      password: hashedPassword || undefined,
      googleId: googleId || undefined,
      emailVerificationToken,
      emailVerificationTokenExpires,
      isEmailVerified: false
    });

    await user.save();

    // Generate verification URL
    const verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verify-email/${emailVerificationToken}`;
    
    // Send verification email
    await sendVerificationEmail(user, verificationUrl);

    // Generate JWT token with fixed expiration
    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET || 'your-secret-key', 
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt
      },
      message: 'Registration successful. Please verify your email before logging in.'
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Registration failed. Please try again.' 
    });
  }
};

// Verify email
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    // Update user verification status
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpires = undefined;
    await user.save();

    // Redirect to login page with success message
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?verified=true`);
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Email verification failed. Please try again.'
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password, phoneNumber, googleId } = req.body;

    // Validate input
    if (!email || (!password && !googleId) || !phoneNumber) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide email, password/googleId, and phone number' 
      });
    }

    // Find user by email and include password in the query
    const user = await User.findOne({ email }).select('+password');
    
    console.log('Login attempt for email:', email);
    console.log('User found:', user ? 'Yes' : 'No');

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(401).json({
        success: false,
        message: 'Email not verified. Please check your email for verification link.'
      });
    }

    // Check if phone number matches
    if (user.phoneNumber !== phoneNumber) {
      return res.status(401).json({
        success: false,
        message: 'Phone number does not match our records'
      });
    }

    let isAuthenticated = false;

    // Handle Google authentication
    if (googleId && user.googleId === googleId) {
      isAuthenticated = true;
    } 
    // Handle password authentication
    else if (password && user.password) {
      isAuthenticated = await user.matchPassword(password);
    }

    if (!isAuthenticated) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET || 'your-secret-key', 
      { expiresIn: '24h' }
    );

    // Send response without password
    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Login failed. Please try again.' 
    });
  }
};

// Google sign-in handler
exports.googleAuth = async (req, res) => {
  try {
    const { name, email, googleId, phoneNumber } = req.body;

    if (!name || !email || !googleId || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      // Update Google ID if user exists but doesn't have Google ID
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }

      // Check if email is verified
      if (!user.isEmailVerified) {
        return res.status(401).json({
          success: false,
          message: 'Email not verified. Please check your email for verification link.'
        });
      }

      // Check if phone number matches
      if (user.phoneNumber !== phoneNumber) {
        return res.status(401).json({
          success: false,
          message: 'Phone number does not match our records'
        });
      }
    } else {
      // Create new user if not exists
      // Generate email verification token
      const emailVerificationToken = generateVerificationToken();
      const emailVerificationTokenExpires = new Date();
      emailVerificationTokenExpires.setHours(emailVerificationTokenExpires.getHours() + 24);

      user = new User({
        name,
        email,
        phoneNumber,
        googleId,
        emailVerificationToken,
        emailVerificationTokenExpires,
        isEmailVerified: false
      });

      await user.save();

      // Generate verification URL
      const verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verify-email/${emailVerificationToken}`;
      
      // Send verification email
      await sendVerificationEmail(user, verificationUrl);

      return res.status(201).json({
        success: true,
        message: 'Google registration successful. Please verify your email before logging in.'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Google authentication failed. Please try again.'
    });
  }
};

// Resend verification email
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address'
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Generate new verification token
    const emailVerificationToken = generateVerificationToken();
    const emailVerificationTokenExpires = new Date();
    emailVerificationTokenExpires.setHours(emailVerificationTokenExpires.getHours() + 24);

    user.emailVerificationToken = emailVerificationToken;
    user.emailVerificationTokenExpires = emailVerificationTokenExpires;
    await user.save();

    // Generate verification URL
    const verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verify-email/${emailVerificationToken}`;
    
    // Send verification email
    await sendVerificationEmail(user, verificationUrl);

    res.status(200).json({
      success: true,
      message: 'Verification email sent successfully'
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend verification email. Please try again.'
    });
  }
};

// Get current user
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to retrieve user information' 
    });
  }
};
