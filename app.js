require('dotenv').config();

const app = require('express')();
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const bodyParser = require('body-parser');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const expressValidator = require('express-validator');
const passport = require('passport');
const { graphqlExpress, graphiqlExpress } = require('apollo-server-express');

const userController = require('./controllers/userController');
const authController = require('./controllers/authController');
const schema = require('./data/schema');
const config = require('./config');

require('./handlers/passport');

const PORT = process.env.PORT || 3000;

// Connect to Database and get server secret
mongoose
  .connect(config.database)
  .then(() => console.log('Successfully connected to DB!'))
  .catch(err => console.log(`Error connecting to DB: ${err}`));

// Exposes a bunch of methods for validating date. (Mainly in the userController)
app.use(expressValidator());

app.use(cors());

// Setup express session
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ url: config.database }),
  })
);

// Body Parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// use morgan to log requests to the console
app.use(morgan('dev'));

// GraphQL
app.use(
  '/graphql',
  bodyParser.json(),
  graphqlExpress(req => ({
    schema,
    context: { token: req.get('Authorization') },
  }))
);

app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));

// Passport Init
app.use(passport.initialize());
app.use(passport.session());

// Error handler
app.use((err, req, res, next) => {
  console.log('====== ERROR =======');
  console.error(err.stack);
  res.status(500);
});

// Routes
app.post('/login', authController.login, (req, res) => {
  const payload = {
    id: req.user._id,
  };

  const token = jwt.sign(payload, process.env.SECRET, {
    expiresIn: '24h',
  });

  res.json({
    token,
    uid: req.user._id,
    email: req.user.email,
    name: req.user.name,
  });
});

app.post('/logout', authController.logout);

app.post(
  '/signup',
  userController.validateSignUp,
  userController.register,
  authController.login,
  (req, res) => {
    const payload = {
      id: req.user._id,
    };

    const token = jwt.sign(payload, process.env.SECRET, {
      expiresIn: '24h',
    });

    res.json({
      token,
      uid: req.user._id,
      email: req.user.email,
      name: req.user.name,
    });
  }
);

app.listen(PORT, () =>
  console.log(`GraphiQL running on http://localhost:${PORT}/graphiql`)
);
