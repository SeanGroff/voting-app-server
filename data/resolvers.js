const mongoose = require('mongoose');

const UserModel = require('../models/UserModel');
const PollModel = require('../models/PollModel');

module.exports = {
  Query: {
    async user(root, args) {
      const { _id, name, email } = await UserModel.findOne({ _id: args.uid });
      return {
        id: _id,
        name,
        email,
      };
    },
    async users(root, args) {
      const users = await UserModel.find();
      return users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
      }));
    },
    async poll(root, args) {
      const {
        _id,
        name,
        createdBy,
        votes,
        pollOptions,
      } = await PollModel.findOne({ _id: args.pid });
      return {
        id: _id,
        name,
        createdBy,
        votes,
        pollOptions,
      };
    },
    async polls(root, args) {
      let polls = [];
      if (typeof args.uid === String && args.uid) {
        polls = await PollModel.find({ createdBy: args.uid });
      } else {
        polls = await PollModel.find();
      }
      return polls.map(poll => ({
        id: poll._id,
        name: poll.name,
        url: poll.url,
        createdBy: poll.createdBy,
        votes: poll.votes,
        pollOptions: poll.pollOptions,
      }));
    },
  },
  // Mutation: {
  // Vote
  // Create a poll
  // Delete own poll
  // Add new option to poll
  // Register Account
  // Login
  // Logout
  // },
  User: {},
  Poll: {
    createdBy({ createdBy }) {
      return UserModel.findOne({ _id: createdBy });
    },
    pollOptions(poll) {
      return poll.pollOptions.map(option => ({
        id: option._id,
        name: option.name,
        votes: option.votes,
      }));
    },
  },
  PollOption: {},
};
