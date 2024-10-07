const passport = require('passport');

// @desc    Initiates Google OAuth2 login
// @route   GET /auth/google
exports.googleLogin = passport.authenticate('google', {
  scope: ['profile', 'email'],
});

// @desc    Callback after Google OAuth2 login success
// @route   GET /auth/google/callback
exports.googleCallback = (req, res, next) => {
  passport.authenticate('google', { failureRedirect: '/' }, async (err, user) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.redirect('/');
    }

    // Manually log in the user (since we're using a custom callback)
    req.login(user, (loginErr) => {
      if (loginErr) {
        return next(loginErr);
      }

      // Optionally, perform additional logic here (e.g., sending data to frontend)

      // Redirect to the frontend dashboard after successful login
      res.redirect('http://localhost:8080/dashboard');
    });
  })(req, res, next);
};

// @desc    Logout the user 
// @route   GET /auth/logout
exports.logout = (req, res) => {
  req.logout();
  res.redirect('/');
};

// @desc    Get the authenticated user's session
// @route   GET /auth/session
exports.getSession = (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      user: req.user,
      isAuthenticated: true,
    });
  } else {
    res.json({ isAuthenticated: false });
  }
};
