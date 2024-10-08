const passport = require('passport');


exports.googleLogin = passport.authenticate('google', {
  scope: ['profile', 'email'],
});


exports.googleCallback = (req, res, next) => {
  passport.authenticate('google', { failureRedirect: '/' }, async (err, user) => {

    if (err) {
      return next(err);
    }
    if (!user) {
      return res.redirect('/');
    }

    req.login(user, (loginErr) => {
      if (loginErr) {
        return next(loginErr);
      }

      res.redirect('https://foyr-frontend.vercel.app/dashboard');
      res.status(200).json({
        user,
        isAuthenticated: true,
        message: 'User successfully authenticated'
      });
    });
  })(req, res, next);
};


exports.logout = (req, res) => {
  req.logout();
  res.redirect('/');
};

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
