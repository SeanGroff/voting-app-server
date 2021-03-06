require('dotenv').config();

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const bodyParser = require('body-parser');
const morgan = require('morgan');
const path = require('path');
const jwt = require('jsonwebtoken');
const expressValidator = require('express-validator');
const requestIp = require('request-ip');
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
    context: {
      token: req.get('Authorization'),
      clientIp: requestIp.getClientIp(req),
    },
  }))
);

app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));

app.use(express.static(`${__dirname}/../voting-app-vuejs/dist`));

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
app.get('/ip', (req, res) => {
  res.send({ ip: requestIp.getClientIp(req) });
});

app.get('/secret', (req, res) => {
  try {
    const token = req.headers.authorization
      ? req.headers.authorization.split(' ')[1]
      : undefined;

    const decoded = jwt.verify(token, process.env.SECRET);

    if (decoded) {
      res.send({ authorized: true });
    }
  } catch (err) {
    console.log(err);
    res.status(403).send({ authorized: false });
  }
});

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
    ip: req.user.ip,
  });
});

app.post('/logout', authController.logout);

app.post(
  '/signup',
  userController.validateSignUp,
  userController.register,
  authController.login,
  (req, res) => {
    console.log(req.user.ip);
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
      ip: req.user.ip,
    });
  }
);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../voting-app-vuejs/dist/index.html'));
});

app.listen(PORT, () =>
  console.log(`GraphiQL running on http://localhost:${PORT}/graphiql`)
);
