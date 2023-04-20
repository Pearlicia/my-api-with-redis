const express = require('express')
const morgan = require('morgan')
const createError = require('http-errors')
require('dotenv').config()
require('./helpers/init_mongodb')
require('./helpers/init_redis')
const Volcanoe = require("./Models/Volcanoe");
const { verifyAccessToken } = require('./helpers/jwt_helper')

const AuthRoute = require('./Routes/Auth.route')

const app = express()
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

//CREATE

app.post("/volcanoes", async (req, res) => {
  const newVolcanoe = new Volcanoe(req.body);

  try {
    const savedVolcanoe = await newVolcanoe.save();
    res.status(200).json(savedVolcanoe);
  } catch (err) {
    res.status(500).json(err);
  }
});

//UPDATE
app.put("/:id", async (req, res) => {
  try {
    const updatedVolcanoe = await Volcanoe.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedVolcanoe);
  } catch (err) {
    res.status(500).json(err);
  }
});

//DELETE
app.delete("/:id",  async (req, res) => {
  try {
    await Volcanoe.findByIdAndDelete(req.params.id);
    res.status(200).json("Volcanoe has been deleted...");
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET VOLCANOE
app.get("/find/:id", async (req, res) => {
  try {
    const volcanoe = await Volcanoe.findById(req.params.id);
    res.status(200).json(volcanoe);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET ALL VOLCANOES
app.get("/", async (req, res) => {
  const page = 1; // current page number
  const limit = 20; // number of items to show per page

  // Calculate the number of items to skip based on the current page number
  const skipIndex = (page - 1) * limit;
  try {
    let volcanoes;

    volcanoes = await Volcanoe.find().sort({ createdAt: -1 }).skip(skipIndex).limit(limit);

    res.status(200).json(volcanoes);
  } catch (err) {
    res.status(500).json(err);
  }
});

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