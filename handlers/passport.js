const mongoose = require('mongoose');
const passport = require('passport');

const UserModel = require('../models/UserModel');

// createStrategy comes from the passportLocalMongoose plugin
passport.use(UserModel.createStrategy());

passport.serializeUser(UserModel.serializeUser());

passport.deserializeUser(UserModel.deserializeUser());
