// Authentication
const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const passport = require('passport')
const Post = require('../../models/Post')
const Profile = require('../../models/Profile')
const validatePostInput = require('../../validation/post')
router.get('/test', (req, res) => res.json({ msg: 'post works' }))

// Create post
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body)
    if (!isValid) {
      return res.status(400).json(errors)
    }
    const newPost = new Post({
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.name,
      user: req.user.id
    })
    newPost
      .save()
      .then(post => {
        res.json(post)
      })
      .catch(err => res.status(404).json(err))
  }
)
// Edit post

// Delete post
router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        Post.findById(req.params.id).then(post => {
          // Check post owner
          if (post.user.toString() !== req.user.id) {
            return res
              .status(401)
              .json({ notAuthorized: 'User not authorized' })
          }
          Post.remove()
            .then(() => res.json({ success: true }))
            .catch(err => res.status(404).json(err))
        })
      })
      .catch(err => res.json(err))
  }
)

// Get all posts
router.get('/', (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json(err))
})

// Get post
router.get('/:post_id', (req, res) => {
  Post.findById(req.params.post_id)
    .then(post => res.json(post))
    .catch(err => res.status(404).json(err))
})

// @route POST api/posts/like/:id
// @desc Like a post
// @access Private
router.post(
  '/like/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .lenght > 0
          ) {
            return res
              .status(400)
              .json({ alreadyLiked: 'User already liked this post' })
          }
          post.likes.unshift({ user: req.user.id })
          post.save().then(post => res.json(post))
        })
        .catch(err => res.status(404).json(err))
    })
  }
)

// @route POST api/posts/unlike/:id
// @desc Unlike a post
// @access Private
router.post(
  '/unlike/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .lenght === 0
          ) {
            return res
              .status(400)
              .json({ alreadyLiked: 'You havent liked this post yet' })
          }
          const removeIndex = post.likes
            .map(item => item.user.toString())
            .indexOf(req.user.id)

          post.likes.splice(removeIndex, 1)
          post.save().then(post => res.json(post))
        })
        .catch(err => res.status(404).json(err))
    })
  }
)

// @route POST api/posts/comment/:id
// @desc Add comment in post
// @access Private
router.post(
  '/comment/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body)
    if (!isValid) {
      return res.status(400).json(errors)
    }
    Post.findById(req.params.id).then(post => {
      const newComment = {
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.user.id
      }

      post.comments.unshift(newComment)
      post
        .save()
        .then(post => res.json(post))
        .catch(err => res.status(404).json(err))
    })
  }
)

// @route DELETE api/posts/comment/:id/:comment_id
// @desc Delete comment in post
// @access Private
router.delete(
  '/comment/:id/:comment_id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Post.findById(req.params.id).then(post => {
      if (
        post.comments.filter(
          comment => comment._id.toString() === req.params.comment_id
        ).lenght === 0
      ) {
        return res
          .status(404)
          .json({ commentNotExists: 'Comment does not exists' })
      }
      const removeIndex = post.comments
        .map(item => item._id.toString())
        .indexOf(req.params.comment_id)

      post.comments.splice(removeIndex, 1)
      post
        .save()
        .then(post => res.json(post))
        .catch(err => res.status(404).json(err))
    })
  }
)

module.exports = router
