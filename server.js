const express = require('express')
const mongoose = require('mongoose')
const body_parser = require('body-parser')
const users = require('./routes/api/users')
const post = require('./routes/api/post')
const profile = require('./routes/api/profile')
const passport = require('passport')
const app = express()

// Body parser
app.use(body_parser.urlencoded({ extended: false }))
app.use(body_parser.json())

// DB CONFIG
const db = require('./config/key').mongoURI

// CONNECT TO DB
mongoose
  .connect(
    db,
    { useNewUrlParser: true }
  )
  .then(() => console.log('Mongoose connected'))
  .catch(err => console.log(err))

// PASSPORT MIDDLEWARE
app.use(passport.initialize())
// PASSPORT CONFIG
require('./config/passport')(passport)

// USE routes
app.use('/api/users', users)
app.use('/api/profile', profile)
app.use('/api/post', post)

const port = process.env.PORT || 5000

app.listen(port, () => console.log(`Server running on port ${port}`))
