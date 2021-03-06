const requestIp = require('request-ip');
const { promisify } = require('es6-promisify');

const UserModel = require('../models/UserModel');

exports.validateSignUp = async (req, res, next) => {
  // express-validator middleware adds these methods to req object in app.js
  req.sanitizeBody('name');
  req.sanitizeBody('email').normalizeEmail({
    remove_dots: false,
    remove_extension: false,
    gmail_remove_subaddress: false,
  });
  req.checkBody('name', 'You must supply a name!').notEmpty();
  req.checkBody('email', 'That email is not valid').isEmail();
  // From browser dev tools user can remove required form input attr! This protects against that
  req.checkBody('password', 'Password cannot be blank').notEmpty();
  req
    .checkBody('confirmPassword', 'Confirm password cannot be blank')
    .notEmpty();
  req
    .checkBody('confirmPassword', 'Oops, your passwords do not match')
    .equals(req.body.password);

  try {
    // Will check all the methods above and return an array of errors.
    await req.asyncValidationErrors();
    next();
  } catch (errors) {
    // send the first error msg in the errors array
    res.status(401).send(errors[0].msg);
  }
};

exports.register = async (req, res, next) => {
  const user = new UserModel({
    name: req.body.name,
    email: req.body.email,
    ip: requestIp.getClientIp(req),
  });

  // If Promisifying a method on an object like User.register.
  // You have to specify what Object to bind the method to.
  const register = promisify(UserModel.register.bind(UserModel));

  try {
    // register() is from the passportLocalMongoose plugin
    // Will hash the password before saving the user to the database. (like .save())
    await register(user, req.body.password);
    next();
  } catch (err) {
    res.status(401).send(err.message);
  }
};
