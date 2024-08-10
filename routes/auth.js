const express = require('express');
const router = express.Router();
const User = require('../models/user'); // Assuming you have a User model
const bcrypt = require('bcrypt');
const passport = require('passport');

// Route for registration page
router.get('/register', (req, res) => {
  res.render('register');
});

// Route for handling registration
router.post('/register', async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.render('register', { error: 'Passwords do not match' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashedPassword });
    res.redirect('/auth/login');
  } catch (err) {
    res.render('register', { error: 'Error creating user' });
  }
});

// Route for login page
router.get('/login', (req, res) => {
  res.render('login');
});

// Route for handling login
router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/auth/login',
  failureFlash: true
}));

// Route for logout
router.get('/logout', (req, res) => {
  req.logout(err => {
    if (err) { return next(err); }
    res.redirect('/auth/login');
  });
});

module.exports = router;
