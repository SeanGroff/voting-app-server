const {
  makeExecutableSchema,
  // addMockFunctionsToSchema,
} = require('graphql-tools');
const resolvers = require('./resolvers');
// const mocks = require('./mocks');

const typeDefs = `
type User {
  id: String
  name: String
  email: String
}

input UserInput {
  id: String
  name: String
  email: String
}

type Voter {
  id: String
}

input VoterInput {
  id: String
}

type PollOption {
  id: String
  name: String
  votes: Int
  voters: [Voter]
}

input PollOptionInput {
  name: String
}

input PollOptionVoteInput {
  id: String
  voter: VoterInput
}

type Poll {
  id: String
  createdBy: User
  name: String
  votes: Int
  url: String
  pollOptions: [PollOption]
}

type Query {
  user(uid: String!): User
  users: [User]
  poll(pid: String!): Poll
  polls(uid: String): [Poll]
}

type Mutation {
  createPoll(user: UserInput!, pollName: String!, pollOptions: [PollOptionInput]!): Poll
  removePoll(pollId: String!): Poll
  vote(pollId: String!, pollOption: PollOptionVoteInput!): Poll
  removeVote(pollId: String!, pollOption: PollOptionVoteInput!): Poll
  addOption(pollId: String!, optionName: String!): Poll
}
`;

const schema = makeExecutableSchema({ typeDefs, resolvers });

/* Used for Mock Data */
// addMockFunctionsToSchema({ schema, mocks });

module.exports = schema;
