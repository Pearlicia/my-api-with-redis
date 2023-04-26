const createError = require('http-errors')
const User = require('../Models/User.model')
require('dotenv').config()
const JWT = require('jsonwebtoken')
const { authSchema } = require('../helpers/validation_schema')
const { verifyAccessToken } = require('../helpers/verify_access_token')
const client = require('../helpers/initialize_redis')


module.exports = {
  register: async (req, res, next) => {
    try {
      const result = await authSchema.validateAsync(req.body)

      const doesExist = await User.findOne({ email: result.email })
      if (doesExist)
        throw createError.Conflict(`${result.email} is already been registered`)

      const user = new User(result)
      const savedUser = await user.save();

      const accessToken = JWT.sign(
        {
          id: user._id,
        }, 
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn:"7d"}
      );


      res.status(201).json({savedUser, accessToken})

    } catch (error) {
      if (error.isJoi === true) error.status = 422
      next(error)
    }
  },

  login: async (req, res, next) => {
    try {
      const result = await authSchema.validateAsync(req.body)
      const user = await User.findOne({ email: result.email })
      if (!user) throw createError.NotFound('User not registered')

      const isMatch = await user.isValidPassword(result.password)
      if (!isMatch)
        throw createError.Unauthorized('Username/password not valid')

        const accessToken = JWT.sign(
          {
            id: user._id,
          }, 
          process.env.ACCESS_TOKEN_SECRET,
          {expiresIn:"7d"}
        );

      const { password, ...withoutPassw } = user._doc; 

      res.status(200).json({...withoutPassw, accessToken});

    } catch (error) {
      if (error.isJoi === true)
        return next(createError.BadRequest('Invalid Username/Password'))
      next(error)
    }
  },

  logout: async (req, res, next) => {
    try {
      const { accessToken } = req.body
      if (!accessToken) throw createError.BadRequest()
      const userId = await verifyAccessToken(accessToken)
      client.DEL(userId, (err, val) => {
        if (err) {
          console.log(err.message)
          throw createError.InternalServerError()
        }
        console.log(val)
        res.sendStatus(204)
      })
    } catch (error) {
      next(error)
    }
  },
}