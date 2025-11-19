const { ObjectId } = require('mongodb');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

function configurePassport(passport, db) {
  // Serialize user into the session
  passport.serializeUser((user, done) => {
    done(null, user._id.toString());
  });

  // Deserialize user from the session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await db
        .collection('users')
        .findOne({ _id: new ObjectId(id) });

      done(null, user || null);
    } catch (err) {
      done(err, null);
    }
  });

  // Google OAuth Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/callback' // works locally and on Render
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const usersCollection = db.collection('users');

          const googleId = profile.id;
          const email =
            profile.emails && profile.emails.length
              ? profile.emails[0].value
              : null;
          const name = profile.displayName || 'Unknown User';

          // Check for existing user
          let user = await usersCollection.findOne({ googleId });

          // If the user is not found, create one
          if (!user) {
            const newUser = {
              googleId,
              email,
              name,
              createdAt: new Date()
            };

            const result = await usersCollection.insertOne(newUser);
            user = { _id: result.insertedId, ...newUser };
          }

          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
}

module.exports = configurePassport;
