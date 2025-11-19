require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectToDb } = require('./models/db');
const registerTripRoutes = require('./routes/trips');
const registerBookingRoutes = require('./routes/bookings');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const session = require('express-session');
const passport = require('passport');
const configurePassport = require('./config/passport');

const registerAuthRoutes = require('./routes/auth');

const app = express();
app.set('trust proxy', 1);

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(
    session({
        secret: process.env.SESSION_SECRET || 'defaultsecret',
        resave: false,
        saveUninitialized: false,
        cookie: { httpOnly: true, secure: false }
    })
);

app.use(passport.initialize());
app.use(passport.session());

// Environment Variables
const port = process.env.PORT || 8080;

// Connect to MongoDB
connectToDb()
  .then((db) => {
    configurePassport(passport, db);    
    app.get('/', (req, res) => {
      res.json({ message: 'Trip Planner API is running' });
    });

    // Register authentication routes
    registerAuthRoutes(app);

    // Register routes with the db instance
    registerTripRoutes(app, db);
    registerBookingRoutes(app, db);

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to the database:', error);
    process.exit(1);
  });