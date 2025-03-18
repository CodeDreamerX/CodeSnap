const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/User');

module.exports = (passport) => {
  // Local Strategy
  passport.use(
    new LocalStrategy(
      { usernameField: 'email' },
      async (email, password, done) => {
        try {
          // Find user by email
          const user = await User.findOne({ email, authStrategy: 'local' });
          
          // Check if user exists
          if (!user) {
            return done(null, false, { message: 'Incorrect email or password' });
          }
          
          // Check if user is verified
          if (!user.isVerified) {
            return done(null, false, { message: 'Email not verified' });
          }
          
          // Check password
          const isMatch = await user.comparePassword(password);
          if (!isMatch) {
            return done(null, false, { message: 'Incorrect email or password' });
          }
          
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );
  
  // Google Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/auth/google/callback'
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists
          let user = await User.findOne({ googleId: profile.id });
          
          if (user) {
            return done(null, user);
          }
          
          // Check if user exists with same email
          user = await User.findOne({ email: profile.emails[0].value });
          
          if (user) {
            // Update user with Google ID
            user.googleId = profile.id;
            await user.save();
            return done(null, user);
          }
          
          // Create new user
          const newUser = new User({
            email: profile.emails[0].value,
            name: profile.displayName,
            googleId: profile.id,
            authStrategy: 'google',
            isVerified: true // Google account is already verified
          });
          
          await newUser.save();
          return done(null, newUser);
        } catch (err) {
          return done(err);
        }
      }
    )
  );
  
  // GitHub Strategy
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: '/api/auth/github/callback',
        scope: ['user:email']
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists
          let user = await User.findOne({ githubId: profile.id });
          
          if (user) {
            return done(null, user);
          }
          
          // Get primary email from GitHub
          const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
          
          if (email) {
            // Check if user exists with same email
            user = await User.findOne({ email });
            
            if (user) {
              // Update user with GitHub ID
              user.githubId = profile.id;
              await user.save();
              return done(null, user);
            }
          } else {
            return done(null, false, { message: 'Email access is required' });
          }
          
          // Create new user
          const newUser = new User({
            email,
            name: profile.displayName || profile.username,
            githubId: profile.id,
            authStrategy: 'github',
            isVerified: true // GitHub account is already verified
          });
          
          await newUser.save();
          return done(null, newUser);
        } catch (err) {
          return done(err);
        }
      }
    )
  );
  
  // JWT Strategy
  const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
  };
  
  passport.use(
    new JwtStrategy(jwtOptions, async (payload, done) => {
      try {
        const user = await User.findById(payload.id);
        
        if (user) {
          return done(null, user);
        }
        
        return done(null, false);
      } catch (err) {
        return done(err, false);
      }
    })
  );
}; 