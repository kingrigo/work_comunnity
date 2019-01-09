// Authentication
const express = require('express')
const router = express.Router()
const gravatar = require('gravatar')
const bcryp = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../../models/User')
const secretkey = require('../../config/key').superSecretKey
const passport = require('passport')

const validateRegisterInput = require('../../validation/register')
const validateLoginInput = require('../../validation/login')
router.get('/test', (req, res) => res.json({ msg: 'Users works' }))

router.post('/register', (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body)

  if (!isValid) {
    res.status(400).json(errors)
  }

  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      errors.email = 'Email already exists'
      return res.status(400).json(errors)
    } else {
      const avatar = gravatar.url(req.body.email, {
        // size
        s: 200,
        // rating
        r: 'pg',
        // default
        d: 'mm'
      })
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        avatar
      })
      bcryp.genSalt(10, (err, salt) => {
        bcryp.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err
          newUser.password = hash
          newUser
            .save()
            .then(user => res.json(user))
            .catch(err => res.json({ msg: err }))
        })
      })
    }
  })
})

router.post('/login', (req, res) => {
  const email = req.body.email
  const password = req.body.password
  const { errors, isValid } = validateLoginInput(req.body)

  if (!isValid) {
    res.status(400).json(errors)
  }

  User.findOne({ email }).then(user => {
    if (!user) {
      errors.email = 'User not found'
      return res.status(404).json(errors)
    }
    bcryp.compare(password, user.password).then(match => {
      if (match) {
        // Create payload
        const payload = { id: user.id, name: user.name, avatar: user.avatar }
        // Get token, send payload

        jwt.sign(payload, secretkey, { expiresIn: 3600 }, (err, token) => {
          res.json({
            success: true,
            token: 'Bearer ' + token
          })
        })
      } else {
        errors.password = 'Password is incorrect'
        return res.status(400).json(errors)
      }
    })
  })
})

router.get(
  '/current',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email
    })
  }
)

module.exports = router
