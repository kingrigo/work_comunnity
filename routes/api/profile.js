// Location, experience, skills
const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const passport = require('passport')

const Profile = require('../../models/Profile')
const User = require('../../models/User')

const validateProfileInput = require('../../validation/profile')
const validateExperienceInput = require('../../validation/experience')
const validateEducationInput = require('../../validation/education.js')
router.get('/test', (req, res) => res.json({ msg: 'Profile works' }))

router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    errors = {}
    Profile.findOne({ user: req.user.id })
      .populate('user', ['name', 'avatar'])
      .then(profile => {
        if (!profile) {
          errors.user = 'User does not have a profile'
          return res.status(404).json(errors)
        }
        res.json(profile)
      })
      .catch(err => res.status(400).json(err))
  }
)
// Create User
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { errors, isValid } = validateProfileInput(req.body)

    if (!isValid) {
      return res.status(400).json(errors)
    }
    const profileFields = {}
    profileFields.user = req.user.id
    if (req.body.handle) profileFields.handle = req.body.handle
    if (req.body.degree) profileFields.degree = req.body.degree
    if (req.body.website) profileFields.website = req.body.website
    if (req.body.location) profileFields.location = req.body.location
    if (req.body.status) profileFields.status = req.body.status
    if (req.body.bio) profileFields.bio = req.body.bio
    if (req.body.status) profileFields.status = req.body.status
    if (req.body.githubUsername) {
      profileFields.githubUsername = req.body.githubUsername
    }
    if (req.body.handle) profileFields.handle = req.body.handle
    if (typeof req.body.skills !== 'undefined') {
      profileFields.skills = req.body.skills.split(',')
    }
    profileFields.social = {}
    if (req.body.youtube) profileFields.social.youtube = req.body.youtube
    if (req.body.twitter) profileFields.social.twitter = req.body.twitter
    if (req.body.facebook) profileFields.social.facebook = req.body.facebook
    if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin
    if (req.body.instagram) profileFields.social.instagram = req.body.instagram

    Profile.findOne({ user: req.user.id }).then(profile => {
      if (profile) {
        // Already exists, update
        Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        ).then(profile => res.json(profile))
      } else {
        // Does not exists, create one
        // First check if handle exists
        Profile.findOne({ handle: profileFields.handle }).then(profile => {
          if (profile) {
            errors.handle = 'That handle already exists'
            res.status(400).json(errors)
          }
          // Save profile
          new Profile(profileFields).save().then(profile => res.json(profile))
        })
      }
    })
  }
)
// Get profile by handle
router.get('/handle/:handle', (req, res) => {
  const errors = {}
  Profile.findOne({ handle: req.params.handle })
    .populate('users', ['name', 'avatar'])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "There's no profile to be shown"
        res.status(404).json(errors)
      }
      res.json(profile)
    })
    .catch(err => res.status(400).json(err))
})
// Get profile by user_id
router.get('/user/:user_id', (req, res) => {
  const errors = {}
  Profile.findOne({ handle: req.params.user_id })
    .populate('users', ['name', 'avatar'])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "There's no profile to be shown"
        res.status(404).json(errors)
      }
      res.json(profile)
    })
    .catch(err => res.status(400).json(err))
})
// Get all profiles
router.get('/profile/all', (req, res) => {
  const errors = {}
  Profile.find()
    .populate('users', ['name', 'avatar'])
    .then(profiles => {
      if (!profiles) {
        errors.noprofiles = "There're no profiles to be shown"
        res.status(404).json(errors)
      }
      res.json(profiles)
    })
    .catch(err => res.json(err))
})
// Delete user and profile
router.delete(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOneAndRemove({ user: req.user.id })
      .then(() => {
        User.findOneAndRemove({ id: req.user.id }).then(() =>
          res.json({ success: true })
        )
      })
      .catch(err => res.status(404).json(err))
  }
)

// Add experience object to experience array
router.post(
  '/experience',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { errors, isValid } = validateExperienceInput(req.body)
    Profile.findOne({ user: req.user.id }).then(profile => {
      const newEdu = {
        school: req.body.school,
        degree: req.body.degree,
        location: req.body.location,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      }
      // Add to experience array
      profile.experience.unshift(newEdu)
      profile.save().then(profile => res.json(profile))
    })
  }
)
// Delete experience from profile
router.delete(
  '/experience/:exp_id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        const removeIndex = profile.experience
          .map(item => item.id)
          .indexOf(req.params.exp_id)

        profile.experience.splice(removeIndex, 1)

        profile.save().then(profile => res.json(profile))
      })
      .catch(err => res.status(404).json(err))
  }
)

// Add education to profile
router.post(
  '/education',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { errors, isValid } = validateEducationInput(req.body)
    Profile.findOne({ user: req.user.id }).then(profile => {
      const newEdu = {
        school: req.body.school,
        degree: req.body.degree,
        fieldOfStudy: req.body.fieldOfStudy,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      }
      // Add to experience array
      profile.education.unshift(newEdu)
      profile.save().then(profile => res.json(profile))
    })
  }
)
// Delete education from profile
router.delete(
  '/education/:edu_id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        const removeIndex = profile.experience
          .map(item => item.id)
          .indexOf(req.params.edu_id)

        profile.education.splice(removeIndex, 1)

        profile.save().then(profile => res.json(profile))
      })
      .catch(err => res.status(404).json(err))
  }
)

module.exports = router
