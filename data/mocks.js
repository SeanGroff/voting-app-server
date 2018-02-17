const casual = require('casual');
const { MockList } = require('graphql-tools');

module.exports = {
  String: () => casual.title,
  Query: () => ({
    user: (root, args) => {
      return {
        id: args.id,
        name: 'coolguy0711',
        email: 'coolguy0711@live.com',
      };
    },
    poll: (root, args) => {
      return {
        id: args.id,
        name: casual.title,
        options: casual.array_of_words((n = 7)),
        votes: casual.integer((from = 0), (to = 1000)),
      };
    },
    allPolls: () =>
      new MockList(5, () => ({
        id: casual.id,
        name: casual.title,
        options: casual.array_of_words((n = 7)),
        votes: casual.integer((from = 0), (to = 1000)),
      })),
  }),
  User: () => ({
    id: () => casual.id,
    name: () => casual.username,
    email: () => casual.email,
  }),
  Poll: () => ({
    id: () => casual.id,
    name: () => casual.title,
    options: () => casual.array_of_words((n = 7)),
    votes: casual.integer((from = 0), (to = 10000)),
  }),
  VoteOption: () => ({
    option: () => casual.title,
  }),
};
