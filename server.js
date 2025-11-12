require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const registerTripRoutes = require('./routes/trips');
const registerBookingRoutes = require('./routes/bookings');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');


const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Environment Variables
const port = process.env.PORT || 8080;
const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'tripPlanner';

if (!uri) {
    console.error("Missing MONGODB_URI in .env");
    process.exit(1);
}

let db; // Hold the database connection

// Connect to MongoDB
MongoClient.connect(uri)
    .then((client) => {
        db = client.db(dbName);
        console.log(`Connected to database: ${dbName}`);

        // Routes
        app.get('/', (req, res) => {
            res.json({ message: 'Trip Planner API is running' });
        });

        registerTripRoutes(app, db);
        registerBookingRoutes(app, db);
        
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    })
    .catch((error) => {
        console.error("Failed to connect to the database:", error);
        process.exit(1);
});