const express = require('express')
const router = express.Router()
const passport = require('passport');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;


router.use(session({
    resave: false,
    saveUninitialized: true,
    secret: 'SECRET' 
}));
  
  
router.use(passport.initialize());
router.use(passport.session());

router.get('/google', function(req, res) {
    res.render('pages/auth');
});

  
var userProfile;
var token;

  
router.get('/success', (req, res) => res.status(200).json({userProfile, token}));
router.get('/error', (req, res) => res.status(200).json("error logging in"));
  
passport.serializeUser(function(user, cb) {
    cb(null, user);
});
  
passport.deserializeUser(function(obj, cb) {
    cb(null, obj);
});
  
  
/*  Google AUTH  */
   
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const CALLBACK_URL = process.env.GOAUTHREDIRECT_URL;
  
passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: CALLBACK_URL
  },
  function(accessToken, refreshToken, profile, done) {
    userProfile=profile;
    token=accessToken;
    return done(null, userProfile, token);
  }
));
   
router.get('/auth/google', 
    passport.authenticate('google', { scope : ['profile', 'email'] }));
   
router.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/error' }),
    function(req, res) {
      // Successful authentication, redirect to success route.
      res.redirect('/success');
});

module.exports = router