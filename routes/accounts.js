var express = require('express')
const router = express.Router()
const controller = require('../controllers/auth')
const eventsController = require('../controllers/events')

router.post('/register', (req, res) => {
  const phone = req.body.phone
  const password = req.body.password
  if (!phone || !password) {
    return res.status(400).send({ success: false, message: 'Invalid parameters.' })
  }
  controller.registerNewUser(phone, password)
    .then(() => {
      res.send({ success: true })
    })
    .catch(error => {
      console.log(error)
      res.send({ success: false })
    })
})

router.post('/verifyRegister', (req, res) => {
  const phone = req.body.phone
  const password = req.body.password
  const token = req.body.token
  if (!phone || !password || !token) {
    return res.status(400).send({ success: false, message: 'Invalid parameters.' })
  }
  controller.authRegisterToken(phone, password, token)
    .then((pid) => {
      return eventsController.transformPhoneInvitation(phone)
        .then(() => pid)
    })
    .then((pid) => {
      return controller.authenticateUser(pid, password)
        .then(user => {
          return res.send(Object.assign({}, user, { success: true }))
        })
    })
    .catch(error => {
      console.log(error)
      return res.status(403).send({ success: false, message: 'Invalid crendentials' })
    })
})

router.post('/authenticate', (req, res) => {
  const pid = req.body.pid
  const password = req.body.password
  if (!pid || !password) {
    return res.status(400).send({ success: false, message: 'Invalid parameters.' })
  }
  controller.authenticateUser(pid, password)
    .then(user => {
      return res.send(Object.assign({}, user, { success: true }))
    })
    .catch(error => {
      console.log(error)
      return res.status(403).send({ success: false, message: 'Invalid crendentials' })
    })
})

module.exports = router
