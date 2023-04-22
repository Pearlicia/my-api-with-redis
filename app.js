const express = require('express')
const morgan = require('morgan')
const createError = require('http-errors')
require('dotenv').config()
require('./helpers/init_mongodb')
const client = require('./helpers/init_redis')
const Volcanoe = require("./Models/Volcanoe");
const { verifyTokenAndCUD } = require('./helpers/verify_access_token')
const AuthRoute = require('./Routes/Auth.route')
const { authSchema } = require('./helpers/validation_schema')

const passport = require('passport');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;


const app = express()

app.set('view engine', 'ejs');

app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: 'SECRET' 
}));


app.use(passport.initialize());
app.use(passport.session());

app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


app.get('/google', function(req, res) {
  res.render('pages/auth');
});

var userProfile;

app.get('/success', (req, res) => res.send(userProfile));
app.get('/error', (req, res) => res.send("error logging in"));

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
      return done(null, userProfile);
  }
));
 
app.get('/auth/google', 
  passport.authenticate('google', { scope : ['profile', 'email'] }));
 
app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/error' }),
  function(req, res) {
    // Successful authentication, redirect to success route.
    res.redirect('/success');
  });

// CREATE NEW VOLCANOE
app.post("/volcanoes", verifyTokenAndCUD, async (req, res) => {
  const newVolcanoe = new Volcanoe(req.body);

  try {
    const savedVolcanoe = await newVolcanoe.save();

    // Save data in Redis
    client.SET(savedVolcanoe._id.toString(), JSON.stringify(savedVolcanoe), 'EX', 3600, (err, reply) => {
      if (err) console.log(err.message)
      console.log(reply)
    })

    res.status(200).json(savedVolcanoe);
  } catch (err) {
    res.status(500).json(err);
  }
});

// UPDATE VOLCANOE
app.put("/volcanoes:id", verifyTokenAndCUD, async (req, res) => {
  try {
    const updatedVolcanoe = await Volcanoe.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );

    // Update data in Redis
    client.SET(updatedVolcanoe._id.toString(), JSON.stringify(updatedVolcanoe), 'EX', 3600, (err, reply) => {
      if (err) console.log(err.message)
      console.log(reply)
    })

    res.status(200).json(updatedVolcanoe);
  } catch (err) {
    res.status(500).json(err);
  }
});

// DELETE VOLCANOE
app.delete("/volcanoes:id", verifyTokenAndCUD,  async (req, res) => {
  try {
    await Volcanoe.findByIdAndDelete(req.params.id);

    // Delete data from Redis
    client.DEL(req.params.id.toString(), (err, reply) => {
      if (err) console.log(err.message)
      console.log(reply)
    })

    res.status(200).json("Volcanoe has been deleted...");
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET VOLCANOE
app.get("/volcanoes/find/:id", async (req, res) => {
  try {
    // Check if the data is already present in Redis
    client.get(`volcano_${req.params.id}`, async (err, result) => {
      if (err) console.log(err.message);

      // If the data is present in Redis, return it
      if (result) {
        const volcano = JSON.parse(result);
        res.status(200).json(volcano);
      } else {
        // If the data is not present in Redis, get it from MongoDB
        const volcano = await Volcanoe.findById(req.params.id);

        // Save the data in Redis for future requests
        client.setex(`volcano_${req.params.id}`, 3600, JSON.stringify(volcano));

        res.status(200).json(volcano);
      }
    });
  } catch (err) {
    res.status(500).json(err);
  }
});


//GET ALL VOLCANOES
app.get("/", async (req, res) => {
  const page = 1; // current page number
  const limit = 20; // number of items to show per page

  //Calculate the number of items to skip based on the current page number
  const skipIndex = (page - 1) * limit;
  try {
    let volcanoes;

    volcanoes = await Volcanoe.find().sort({ createdAt: -1 }).skip(skipIndex).limit(limit);

    res.status(200).json(volcanoes);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET ALL VOLCANOES
// app.get("/", async (req, res) => {
//   const page = 1; // current page number
//   const limit = 20; // number of items to show per page

//   // Calculate the number of items to skip based on the current page number
//   const skipIndex = (page - 1) * limit;

//   try {
//     // Check if the data is already present in Redis
//     client.get(`volcanoes_${skipIndex}_${limit}`, async (err, result) => {
//       if (err) console.log(err.message);

//       // If the data is present in Redis, return it
//       if (result) {
//         const volcanoes = JSON.parse(result);
//         // res.status(200).json(volcanoes);
//       } else {
//         // If the data is not present in Redis, get it from MongoDB
//         let volcanoes = await Volcanoe.find()
//           .sort({ createdAt: -1 })
//           .skip(skipIndex)
//           .limit(limit);

//         // Save the data in Redis for future requests
//         client.setex(
//           `volcanoes_${skipIndex}_${limit}`,
//           3600,
//           JSON.stringify(volcanoes)
//         );

//         res.status(200).json(volcanoes);
//       }
//     });
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });


app.use('/auth', AuthRoute)

app.use(async (req, res, next) => {
  next(createError.NotFound())
})

app.use((err, req, res, next) => {
  res.status(err.status || 500)
  res.send({
    error: {
      status: err.status || 500,
      message: err.message,
    },
  })
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})