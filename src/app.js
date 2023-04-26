const express = require('express')
const morgan = require('morgan')
const createError = require('http-errors')
require('dotenv').config()
require('./helpers/init_mongodb')
require('./helpers/initialize_redis')
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
	apis: ["./Routes/*.js"],
};

const specs = swaggerJsDoc(options);
  
// Swagger page
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));

// Docs in JSON format
app.get("/docs-json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(specs);
});


app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.status(200).json("My Volcanoe Api")
})

app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))



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