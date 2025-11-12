const tripsController = require('../controllers/tripsController');

function registerTripRoutes(app, db) {
  // this gives the controller access to the database
  tripsController.init(db);

  // set up routes
  app.get('/trips', tripsController.getAllTrips);
  app.get('/trips/:id', tripsController.getTripById);
  app.post('/trips', tripsController.createTrip);
  app.put('/trips/:id', tripsController.updateTrip);
  app.delete('/trips/:id', tripsController.deleteTrip);
}

module.exports = registerTripRoutes;