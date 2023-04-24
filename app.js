const express = require('express')
const morgan = require('morgan')
const createError = require('http-errors')
require('dotenv').config()
require('./helpers/init_mongodb')
const client = require('./helpers/initialize_redis')
const AuthRoute = require('./Routes/Auth.route')
const VolcanoeRoute = require('./Routes/Volcanoe.route')
const OAUTHRoute = require('./Routes/OAUTH.route')
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");

const app = express()

const options = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "VOLCANOE API",
			version: "1.0.0",
			description: "An Express Volcanoe API",
		},
    components: {
      securitySchemas: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
		servers: [
			{
				url: "http://localhost:3000",
			},
		],
	},
	apis: ["./Routes/*.js", "/app.js"],
};

const specs = swaggerJsDoc(options);
  
// Swagger page
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));

// Docs in JSON format
app.get("/docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(specs);
});


app.set('view engine', 'ejs');


app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


 
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



app.use('/auth', AuthRoute)
app.use('/volcanoes', VolcanoeRoute)
app.use(OAUTHRoute)


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