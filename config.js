const uuidV4 = require('uuid/v4');

module.exports = {
  database: 'mongodb://localhost/pollz',
  secret: () => uuidV4(),
};
