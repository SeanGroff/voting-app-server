const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const poll = new Schema({
  name: String,
  url: String,
  createdBy: {
    id: String,
    name: String,
    email: String,
  },
  votes: Number,
  pollOptions: [
    {
      name: String,
      votes: Number,
    },
  ],
});

module.exports = mongoose.model('PollModel', poll);
