const mongoose = require('mongoose');
const validator = require('validator');
const mongodbErrorHandler = require('mongoose-mongodb-errors');
const passportLocalMongoose = require('passport-local-mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: 'Please supply a name',
    minLength: 1,
    trim: true,
  },
  email: {
    type: String,
    required: 'Please supply a vaid email address',
    minLength: 1,
    trim: true,
    lowercase: true,
    // unique: true, // uncomment after fake users are removed
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email',
    },
  },
  // tokens: [
  //   {
  //     access: {
  //       type: String,
  //       required: true,
  //     },
  //     token: {
  //       type: String,
  //       required: true,
  //     },
  //   },
  // ],
});

userSchema.plugin(passportLocalMongoose, { usernameField: 'email' });
userSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model('UserModel', userSchema);
