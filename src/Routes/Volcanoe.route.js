const express = require("express");
const router = express.Router();
const client = require('../helpers/initialize_redis')
const Volcanoe = require("../Models/Volcanoe.model");
const { verifyTokenAndCUD } = require('../helpers/verify_access_token')



// CREATE NEW VOLCANOE
router.post("/create", verifyTokenAndCUD, async (req, res) => {
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
router.put("/:id", verifyTokenAndCUD, async (req, res) => {
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
router.delete("/:deleteid", verifyTokenAndCUD,  async (req, res) => {
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
router.get("/:getid", async (req, res) => {
  try {
        const volcano = await Volcanoe.findById(req.params.id);

        res.status(200).json(volcano);
      // }
    // });
  } catch (err) {
    res.status(500).json(err);
  }
});



// //GET ALL VOLCANOES
router.get("/", async (req, res) => {
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



module.exports = router;
