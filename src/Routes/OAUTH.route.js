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


/**
 * @swagger
 * '/google':
 *   get:
 *     tags:
 *     - OAUTH
 *     summary: Render the Google authentication page.
 *     description: Renders the Google authentication page for the user to log in with their Google account.
 *     responses:
 *      200:
 *        description: Google authentication page rendered successfully.
 *        schema:
 *           type: string
 *      400:
 *        description: Bad request
 */

router.get('/google', function(req, res) {
    res.render('pages/auth');
});

  
var userProfile;
var token;

/**
 * @swagger
 * '/success':
 *   get:
 *     tags:
 *     - OAUTH
 *     summary: Get the user profile data.
 *     description: Returns the user profile data after successful authentication.
 *     responses:
 *      200:
 *        description: User profile data retrieved successfully.
 *        schema:
 *           type: object
 *      400:
 *        description: Bad request
 */ 
router.get('/success', (req, res) => res.status(200).json({userProfile, token}));

/**
 * @swagger
 * '/error':
 *   get:
 *     tags:
 *     - OAUTH
 *     summary: Handle authentication error.
 *     description: Returns an error message when there is an error during authentication.
 *     responses:
 *      200:
 *        description: Error message returned successfully.
 *        schema:
 *           type: string
 *      400:
 *        description: Bad request
 */
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


/**
 * @swagger
 * '/auth/google':
 *   get:
 *     tags:
 *     - OAUTH
 *     summary: Authenticate with Google.
 *     description: Initiates the authentication process with Google using PassportJS.
 *     responses:
 *      200:
 *        description: Initiates the authentication process with Google using PassportJS.
 *        schema:
 *           type: string
 *      400:
 *        description: Bad request
 */   
router.get('/auth/google', 
    passport.authenticate('google', { scope : ['profile', 'email'] }));

    
/**
 * @swagger
 * '/auth/google/callback':
 *   get:
 *     tags:
 *     - OAUTH
 *     summary: Authenticate user with Google OAuth and redirect to success page
 *     description: This endpoint initiates Google OAuth authentication flow and redirects the user to the success page upon successful authentication.
 *     produces:
 *       - application/json
 *     responses:
 *       302:
 *         description: Redirect to success page upon successful authentication
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               description: A success message indicating the user has been authenticated
 *             redirect:
 *               type: string
 *               description: URL of the success page to redirect the user to
 *     security:
 *       - googleOAuth2: []
 */
router.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/error' }),
    function(req, res) {
      // Successful authentication, redirect to success route.
      res.redirect('/success');
});

module.exports = router