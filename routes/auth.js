const passport = require('passport');

function registerAuthRoutes(app) {
  // Google OAuth login
  app.get(
    '/auth/google',
    passport.authenticate('google', {
      scope: ['profile', 'email'],      
      prompt: 'select_account'
    })
  );

  // Google OAuth callback
  app.get(
    '/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/auth/failure' }),
    (req, res) => {      
      res.redirect('/auth/success');
    }
  );

  // Logged in info
  app.get('/auth/success', (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    res.json({
      message: 'Login successful',
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email
      }
    });
  });

  // failure to login info
  app.get('/auth/failure', (req, res) => {
    res.status(401).json({ error: 'Authentication failed' });
  });

  // Get current logged in user
  app.get('/me', (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    res.json({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email
    });
  });

  // LOGOUT (GET)
  app.get('/auth/logout', (req, res, next) => {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.json({ message: 'Logged out successfully' });
      });
    });
  });

  // LOGOUT (POST)
  app.post('/auth/logout', (req, res, next) => {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.json({ message: 'Logged out successfully' });
      });
    });
  });
}

module.exports = registerAuthRoutes;
