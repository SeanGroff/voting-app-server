const {
  makeExecutableSchema,
  addMockFunctionsToSchema,
} = require('graphql-tools');
const resolvers = require('./resolvers');
// const mocks = require('./mocks');

const typeDefs = `
type Query {
  user(uid: String!): User
  users: [User]
  poll(pid: String!): Poll
  polls(uid: String): [Poll]
}

type User {
  id: String
  name: String
  email: String
}

type PollOption {
  id: String
  name: String
  votes: Int
}

type Poll {
  id: String
  createdBy: User
  name: String
  votes: Int
  url: String
  pollOptions: [PollOption]
}
`;

const schema = makeExecutableSchema({ typeDefs, resolvers });

/* Used for Mock Data */
// addMockFunctionsToSchema({ schema, mocks });

module.exports = schema;
