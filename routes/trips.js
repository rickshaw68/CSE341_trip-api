const tripsController = require('../controllers/tripsController');
const { isAuthenticated } = require('../middleware/auth');

function registerTripRoutes(app, db) {  
  tripsController.init(db); // adds access to db in controller

  // set up routes
  app.get('/trips', tripsController.getAllTrips);
  app.get('/trips/:id', tripsController.getTripById);
  
  // Protected routes
  app.post('/trips', isAuthenticated, tripsController.createTrip);
  app.put('/trips/:id', isAuthenticated, tripsController.updateTrip);
  app.delete('/trips/:id', isAuthenticated, tripsController.deleteTrip);
}

module.exports = registerTripRoutes;