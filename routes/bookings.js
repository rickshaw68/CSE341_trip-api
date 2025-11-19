const bookingsController = require('../controllers/bookingsController');
const { isAuthenticated } = require('../middleware/auth');

function registerBookingRoutes(app, db) {
  bookingsController.init(db);

  app.get('/bookings', bookingsController.getAllBookings);
  app.get('/bookings/:id', bookingsController.getBookingById);
  
  // Protected routes
  app.post('/bookings', isAuthenticated, bookingsController.createBooking);
  app.put('/bookings/:id', isAuthenticated, bookingsController.updateBooking);
  app.delete('/bookings/:id', isAuthenticated, bookingsController.deleteBooking);
}

module.exports = registerBookingRoutes;
