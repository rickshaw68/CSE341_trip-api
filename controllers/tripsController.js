const { ObjectId } = require('mongodb');

let db; // for the database connection

function init(database) {
  db = database;
}

// validate trip data for both creation and update
function validateTripPayload(body, isUpdate = false) {
  const {
    title,
    destination,
    category,
    durationDays,
    price,
    difficulty,
    description
  } = body;

  // require all fields for creation, optional for update
  if (
    !title ||
    !destination ||
    !category ||
    !durationDays ||
    !price ||
    !difficulty ||
    !description
  ) {
    return {
      ok: false,
      status: 400,
      error:
        'All fields are required: title, destination, category, durationDays, price, difficulty, description'
    };
  }

  const duration = Number(durationDays);
  const tripPrice = Number(price);

  if (Number.isNaN(duration) || duration <= 0) {
    return {
      ok: false,
      status: 400,
      error: 'durationDays must be a positive number'
    };
  }

  if (Number.isNaN(tripPrice) || tripPrice < 0) {
    return {
      ok: false,
      status: 400,
      error: 'price cannot be a negative number'
    };
  }

  const allowedDifficulties = ['easy', 'moderate', 'hard'];
  if (
    !difficulty ||
    !allowedDifficulties.includes(difficulty.toLowerCase())
  ) {
    return {
      ok: false,
      status: 400,
      error: `difficulty must be one of the following: ${allowedDifficulties.join(
        ', '
      )}`
    };
  }

  const trip = {
    title,
    destination,
    category,
    durationDays: duration,
    price: tripPrice,
    difficulty: difficulty.toLowerCase(),
    description
  };

  return { ok: true, trip };
}

// GET /trips
async function getAllTrips(req, res) {
  try {
    const trips = await db.collection('trips').find().toArray();
    res.status(200).json(trips);
  } catch (error) {
    console.error('Error fetching trips:', error);
    res.status(500).json({ error: 'Failed to fetch trips' });
  }
}

// GET /trips/:id
async function getTripById(req, res) {
  try {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid trip ID' });
    }

    const trip = await db
      .collection('trips')
      .findOne({ _id: new ObjectId(id) });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    res.status(200).json(trip);
  } catch (error) {
    console.error('Error fetching trip by ID:', error);
    res.status(500).json({ error: 'Failed to fetch trip' });
  }
}

// POST /trips
async function createTrip(req, res) {
  try {
    const validation = validateTripPayload(req.body);

    if (!validation.ok) {
      return res.status(validation.status).json({ error: validation.error });
    }

    const newTrip = {
      ...validation.trip,
      createdAt: new Date()
    };

    const result = await db.collection('trips').insertOne(newTrip);

    res.status(201).json({
      message: 'Trip created successfully',
      tripId: result.insertedId,
      trip: newTrip
    });
  } catch (error) {
    console.error('Error creating trip:', error);
    res.status(500).json({ error: 'Failed to create trip' });
  }
}

// PUT /trips/:id
async function updateTrip(req, res) {
  try {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid trip ID' });
    }

    const validation = validateTripPayload(req.body, true);

    if (!validation.ok) {
      return res.status(validation.status).json({ error: validation.error });
    }

    const updatedTrip = {
      ...validation.trip,
      updatedAt: new Date()
    };

    const result = await db
      .collection('trips')
      .updateOne({ _id: new ObjectId(id) }, { $set: updatedTrip });

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    res.status(200).json({
      message: 'Trip updated successfully',
      tripId: id,
      trip: { _id: id, ...updatedTrip }
    });
  } catch (error) {
    console.error('Error updating trip:', error);
    res.status(500).json({ error: 'Failed to update trip' });
  }
}

// DELETE /trips/:id
async function deleteTrip(req, res) {
  try {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid trip ID' });
    }

    const result = await db
      .collection('trips')
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    res
      .status(200)
      .json({ message: 'Trip deleted successfully', tripId: id });
  } catch (error) {
    console.error('Error deleting trip:', error);
    res.status(500).json({ error: 'Failed to delete trip' });
  }
}

module.exports = {
  init,
  getAllTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip
};
