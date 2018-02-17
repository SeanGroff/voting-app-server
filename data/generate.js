const mongoose = require('mongoose');
const casual = require('casual');

const UserModel = require('../models/UserModel');
const PollModel = require('../models/PollModel');

async function mongoData() {
  casual.seed(123);
  for (let i = 0; i < 10; i += 1) {
    const user = await UserModel.create({
      name: casual.first_name,
      email: casual.email,
      password: casual.password,
    });
    await PollModel.create({
      name: casual.title,
      createdBy: user._id,
      votes: casual.integer((from = 0), (to = 1000)),
      url: casual.url,
      pollOptions: [
        {
          name: casual.title,
          votes: casual.integer((from = 0), (to = 500)),
        },
        {
          name: casual.title,
          votes: casual.integer((from = 0), (to = 500)),
        },
        {
          name: casual.title,
          votes: casual.integer((from = 0), (to = 500)),
        },
      ],
    });
  }
}

module.exports = {
  mongoData,
};
