const { ObjectId } = require('mongodb');

let db; // for the database connection

function init(database) {
  db = database;
}

// validate booking info for both creation and update
async function validateBookingPayload(body) {
  const { tripId, customerName, customerEmail, numTravelers, status } = body;

  if (!tripId || !customerName || !customerEmail || !numTravelers) {
    return {
      ok: false,
      status: 400,
      error:
        'All fields are required: tripId, customerName, customerEmail, numTravelers'
    };
  }

  if (!ObjectId.isValid(tripId)) {
    return {
      ok: false,
      status: 400,
      error: 'Invalid tripId format'
    };
  }

  // check email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(customerEmail)) {
    return {
      ok: false,
      status: 400,
      error: 'Invalid email format'
    };
  }

  // check number of travelers
  const travelers = Number(numTravelers);
  if (Number.isNaN(travelers) || travelers <= 0) {
    return {
      ok: false,
      status: 400,
      error: 'numTravelers must be a positive number'
    };
  }

  // check trip status
  const allowedStatuses = ['pending', 'confirmed', 'cancelled'];
  const bookingStatus = status
    ? status.toLowerCase()
    : 'pending';

  if (!allowedStatuses.includes(bookingStatus)) {
    return {
      ok: false,
      status: 400,
      error: `status must be one of: ${allowedStatuses.join(', ')}`
    };
  }

  // check if trip exists
  const trip = await db
    .collection('trips')
    .findOne({ _id: new ObjectId(tripId) });

  if (!trip) {
    return {
      ok: false,
      status: 404,
      error: 'Trip is not found'
    };
  }

  const booking = {
    tripId: new ObjectId(tripId),
    customerName,
    customerEmail,
    numTravelers: travelers,
    status: bookingStatus
  };

  return { ok: true, booking };
}

// GET /bookings
async function getAllBookings(req, res) {
  try {
    const bookings = await db.collection('bookings').find().toArray();
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
}

// GET /bookings/:id
async function getBookingById(req, res) {
  try {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid booking ID' });
    }

    const booking = await db
      .collection('bookings')
      .findOne({ _id: new ObjectId(id) });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.status(200).json(booking);
  } catch (error) {
    console.error('Error fetching booking by ID:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
}

// POST /bookings
async function createBooking(req, res) {
  try {
    const validation = await validateBookingPayload(req.body);

    if (!validation.ok) {
      return res
        .status(validation.status)
        .json({ error: validation.error });
    }

    const newBooking = {
      ...validation.booking,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('bookings').insertOne(newBooking);

    res.status(201).json({
      message: 'Booking created successfully',
      bookingId: result.insertedId,
      booking: newBooking
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
}

// PUT /bookings/:id
async function updateBooking(req, res) {
  try {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid booking ID' });
    }

    const validation = await validateBookingPayload(req.body);

    if (!validation.ok) {
      return res
        .status(validation.status)
        .json({ error: validation.error });
    }

    const updatedBooking = {
      ...validation.booking,
      updatedAt: new Date()
    };

    const result = await db
      .collection('bookings')
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedBooking }
      );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.status(200).json({
      message: 'Booking updated successfully',
      bookingId: id,
      booking: { _id: id, ...updatedBooking }
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ error: 'Failed to update booking' });
  }
}

// DELETE /bookings/:id
async function deleteBooking(req, res) {
  try {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid booking ID' });
    }

    const result = await db
      .collection('bookings')
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.status(200).json({
      message: 'Booking deleted successfully',
      bookingId: id
    });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ error: 'Failed to delete booking' });
  }
}

module.exports = {
  init,
  getAllBookings,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking
};