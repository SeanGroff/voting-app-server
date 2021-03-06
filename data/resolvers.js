const shortid = require('shortid');
const jwt = require('jsonwebtoken');
const { skip, combineResolvers } = require('graphql-resolvers');

const config = require('../config');
const UserModel = require('../models/UserModel');
const PollModel = require('../models/PollModel');

const isAuthenticated = (parent, args, { token }) => {
  try {
    const decoded = jwt.verify(token.split(' ')[1], process.env.SECRET);
    if (decoded) return skip;
  } catch (err) {
    return new Error('Not authenticated');
  }
};

module.exports = {
  Query: {
    async user(root, { uid }) {
      const { _id, name, email, ip } = await UserModel.findOne({ _id: uid });
      return {
        id: _id,
        name,
        email,
        ip,
      };
    },

    async users(root, args) {
      const users = await UserModel.find();
      return users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        ip: user.ip,
      }));
    },

    async poll(root, args, context) {
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

    async polls(root, { uid }, context) {
      let polls = [];
      if (typeof uid === 'string' && uid) {
        polls = await PollModel.find({ 'createdBy.id': uid });
      } else {
        polls = await PollModel.find();
      }
      return polls.map(poll => ({
        id: poll._id,
        name: poll.name,
        url: poll.url,
        createdBy: {
          id: poll.createdBy.id,
          name: poll.createdBy.name,
          email: poll.createdBy.email,
          ip: poll.createdBy.ip,
        },
        votes: poll.votes,
        pollOptions: poll.pollOptions,
      }));
    },
  },

  Mutation: {
    // Vote
    vote: async (parent, { pollId, pollOption }, { clientIp }) => {
      try {
        // find Poll
        const poll = await PollModel.findById(pollId);
        // Convert Mongo Document to JS Object
        const pollObj = poll.toObject();
        // map over poll options, update the correct poll option
        const updatedPoll = {
          ...pollObj,
          pollOptions: pollObj.pollOptions.map((option, index) => {
            if (String(option._id) !== String(pollOption.id)) return option;

            return {
              ...option,
              votes: option.votes + 1,
              voters: [...option.voters, { ip: clientIp }],
            };
          }),
        };

        // Find Poll by Poll ID then update Poll.pollOptions
        return PollModel.findByIdAndUpdate(pollId, updatedPoll, {
          new: true,
        });
      } catch (err) {
        console.log(err);
      }
    },
    // Remove Vote
    removeVote: async (parent, { pollId, pollOption }, { clientIp }) => {
      try {
        const Poll = await PollModel.findById(pollId);
        const pollObj = Poll.toObject();

        const updatedPoll = {
          ...pollObj,
          pollOptions: pollObj.pollOptions.map((option, index) => {
            if (String(option._id) !== String(pollOption.id)) return option;

            return {
              ...option,
              votes: option.votes - 1,
              voters: option.voters.filter(voter => voter.ip !== clientIp),
            };
          }),
        };

        return PollModel.findByIdAndUpdate(pollId, updatedPoll, { new: true });
      } catch (err) {
        console.log(err);
      }
    },
    // Create a poll
    createPoll: combineResolvers(
      isAuthenticated,
      async (parent, { user, pollName, pollOptions }, { clientIp }) => {
        const newPoll = new PollModel({
          name: pollName,
          url: `${config.baseUrl}/polls/${shortid.generate()}`,
          createdBy: {
            id: user.id,
            name: user.name,
            email: user.email,
            ip: clientIp,
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
      }
    ),
    // Delete own poll
    removePoll: combineResolvers(
      isAuthenticated,
      async (parent, { pollId }) => {
        try {
          return PollModel.findByIdAndRemove(pollId);
        } catch (err) {
          console.log(err);
        }
      }
    ),
    // Add new option to poll
    addOption: combineResolvers(
      isAuthenticated,
      async (parent, { pollId, optionName }) => {
        try {
          const Poll = await PollModel.findById(pollId);
          const pollObj = Poll.toObject();

          const updatedPoll = {
            ...pollObj,
            pollOptions: [
              ...pollObj.pollOptions,
              {
                name: optionName,
                votes: 0,
                voters: [],
              },
            ],
          };

          return PollModel.findByIdAndUpdate(pollId, updatedPoll, {
            new: true,
          });
        } catch (err) {
          console.log(err);
        }
      }
    ),
  },
  User: {},
  Poll: {
    createdBy({ createdBy }) {
      return {
        id: createdBy.id,
        name: createdBy.name,
        email: createdBy.email,
        ip: createdBy.ip,
      };
    },
    pollOptions(poll) {
      return poll.pollOptions.map(option => ({
        id: option._id,
        name: option.name,
        votes: option.votes,
        voters: option.voters.map(voter => ({
          ip: voter.ip,
        })),
      }));
    },
  },
  PollOption: {},
};
