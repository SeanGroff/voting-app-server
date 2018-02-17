const passport = require('passport');

exports.login = passport.authenticate('local');

exports.logout = (req, res) => {
  req.logout();
  res.json({ success: true });
};
