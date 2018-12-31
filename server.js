const express = require('express')
const mongoose = require('mongoose')

const users = require('./routes/api/users')
const post = require('./routes/api/post')
const profile = require('./routes/api/profile')

const app = express()

// DB CONFIG
const db = require('./config/key').mongoURI

// CONNECT TO DB
mongoose
  .connect(db)
  .then(() => console.log('Mongoose connected'))
  .catch(err => console.log(err))

app.get('/', (req, res) => res.send('Hello world'))
// USE routes
app.use('/api/users', users)
app.use('/api/profile', profile)
app.use('/api/post', post)

const port = process.env.PORT || 5000

app.listen(port, () => console.log(`Server running on port ${port}`))
