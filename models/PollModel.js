const mongoose = require('mongoose');
const schema = mongoose.Schema;

const poll = new schema({
  name: String,
  url: String,
  createdBy: { type: schema.ObjectId, ref: 'UserModel' },
  votes: Number,
  pollOptions: [
    {
      name: String,
      votes: Number,
    },
  ],
});

module.exports = mongoose.model('PollModel', poll);
