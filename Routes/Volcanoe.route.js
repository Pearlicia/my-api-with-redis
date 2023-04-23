const express = require("express");
const router = express.Router();
const client = require('../helpers/initialize_redis')
const Volcanoe = require("../Models/Volcanoe.model");
const { verifyTokenAndCUD } = require('../helpers/verify_access_token')


/**
 * @swagger
 * components:
 *   schemas:
 *     Volcanoe:
 *       type: object
 *       required:
 *         - name
 *         - subregion
 *         - volcanoe-type
 *         - evidence
 *       properties:
 *         id:
 *           type: string
 *           description: The volcanoe id
 *         name:
 *           type: string
 *           description: The volcanoe name
 *         subregion:
 *           type: string
 *           description: The sub region of the volcanoe
 *         volcanoe-type:
 *           type: string
 *           description: The volcanoe type
 *         evidence:
 *           type: string
 *           description: Evidence
 *       example:
 *         id: ytghghhg
 *         name: Amasing
 *         subregion: Halmahera
 *         volcanoe-type: Stratovolcano(es)
 *         evidence: Evidence Credible
 */

 /**
  * @swagger
  * tags:
  *   name: Volcanoes
  *   description: A Volcanoe API
  */


/**
 * @swagger
 * /volcanoes:
 *   post:
 *     summary: Create a new volcanoe
 *     tags: [Volcanoes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Volcanoe'
 *     responses:
 *       200:
 *         description: The volcanoe was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Volcanoe'
 *       500:
 *         description: Some server error
 */

// CREATE NEW VOLCANOE
router.post("/", verifyTokenAndCUD, async (req, res) => {
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


/**
 * @swagger
 * /volcanoes/{id}:
 *  put:
 *    summary: Update a volcanoe by the id
 *    tags: [Volcanoes]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: The volcanoe id
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Volcanoe'
 *    responses:
 *      200:
 *        description: The volcanoe was updated succesfully
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Volcanoe'
 *      404:
 *        description: The volcanoe was not found
 *      500:
 *        description: Server error
 */


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

/**
 * @swagger
 * /volcanoes/{id}:
 *   delete:
 *     summary: Remove the volcanoe by id
 *     tags: [Volcanoes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The volcanoe id
 * 
 *     responses:
 *       200:
 *         description: The volcanoe was deleted successfully
 *       404:
 *         description: The volcanoe was not found
 */

// DELETE VOLCANOE
router.delete("/:id", verifyTokenAndCUD,  async (req, res) => {
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


/**
 * @swagger
 * /volcanoes/{id}:
 *   get:
 *     summary: Get the volcanoe by id
 *     tags: [Volcanoes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The volcanoe id
 *     responses:
 *       200:
 *         description: Get a volcanoe by id successful
 *         contens:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Volcanoe'
 *       404:
 *         description: The volcanoe was not found
 */


//GET VOLCANOE
router.get("/:id", async (req, res) => {
  try {
    // Check if the data is already present in Redis
    // client.get(`volcano_${req.params.id}`, async (err, result) => {
      // if (err) console.log(err.message);

      // If the data is present in Redis, return it
      // if (result) {
        // const volcano = JSON.parse(result);
        // res.status(200).json(volcano);
      // } else {
        // If the data is not present in Redis, get it from MongoDB
        const volcano = await Volcanoe.findById(req.params.id);

        // Save the data in Redis for future requests
        // client.setex(`volcano_${req.params.id}`, 3600, JSON.stringify(volcano));

        res.status(200).json(volcano);
      // }
    // });
  } catch (err) {
    res.status(500).json(err);
  }
});


/**
 * @swagger
 * /volcanoes:
 *   get:
 *     summary: Returns the list of all the volcanoes
 *     tags: [Volcanoes]
 *     responses:
 *       200:
 *         description: The list of all the volcanoes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Volcanoe'
 */


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
