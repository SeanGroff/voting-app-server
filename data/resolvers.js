const shortid = require('shortid');

const config = require('../config');
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
      if (typeof args.uid === 'string' && args.uid) {
        polls = await PollModel.find({ createdBy: args.uid });
      } else {
        polls = await PollModel.find();
      }
      return polls.map(poll => ({
        id: poll._id,
        name: poll.name,
        url: poll.url,
        createdBy: {
          id: poll.createdBy._id,
          name: poll.createdBy.name,
          email: poll.createdBy.email,
        },
        votes: poll.votes,
        pollOptions: poll.pollOptions,
      }));
    },
  },
  Mutation: {
    // Vote
    vote: async (parent, { pollId, pollOption }, context) => {
      try {
        // find Poll
        const poll = await PollModel.findById(pollId);

        // Get index of pollOption by id to be updated
        const optionIndex = poll.pollOptions.findIndex(
          option => String(option._id) === String(pollOption.id)
        );

        // Poll Option to be updated
        const optionToUpdate = poll.pollOptions[optionIndex];

        // Find Poll by Poll ID then update Poll.pollOptions
        const { pollOptions } = await PollModel.findByIdAndUpdate(
          pollId,
          {
            pollOptions: poll.pollOptions.splice(optionIndex, 1, {
              ...optionToUpdate,
              votes: (optionToUpdate.votes += 1),
              voters: optionToUpdate.voters.push(pollOption.voters[0]),
            }),
          },
          { new: true }
        );

        return pollOptions[optionIndex];
      } catch (err) {
        console.log(err);
      }
    },
    // Create a poll
    createPoll: async (parent, { user, pollName, pollOptions }, context) => {
      const newPoll = new PollModel({
        name: pollName,
        url: `${config.baseUrl}/polls/${shortid.generate()}`,
        createdBy: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        votes: 0,
        pollOptions: pollOptions.map(option => ({
          name: option.name,
          votes: 0,
          voters: [],
        })),
      });

      try {
        return await newPoll.save();
      } catch (err) {
        console.log(err);
      }
    },
    // Delete own poll
    // Add new option to poll
  },
  User: {},
  Poll: {
    createdBy({ createdBy }) {
      return {
        id: createdBy.id,
        name: createdBy.name,
        email: createdBy.email,
      };
    },
    pollOptions(poll) {
      return poll.pollOptions.map(option => ({
        id: option._id,
        name: option.name,
        votes: option.votes,
        voters: option.voters.map(voter => ({
          id: voter.id,
        })),
      }));
    },
  },
  PollOption: {},
};
