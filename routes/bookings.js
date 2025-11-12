const bookingsController = require('../controllers/bookingsController');

function registerBookingRoutes(app, db) {
  bookingsController.init(db);

  app.get('/bookings', bookingsController.getAllBookings);
  app.get('/bookings/:id', bookingsController.getBookingById);
  app.post('/bookings', bookingsController.createBooking);
  app.put('/bookings/:id', bookingsController.updateBooking);
  app.delete('/bookings/:id', bookingsController.deleteBooking);
}

module.exports = registerBookingRoutes;
