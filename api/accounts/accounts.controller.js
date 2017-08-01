const service = require('./accounts.service')
const eventsService = require('../events/events.service')

const registerAccount = (req, res) => {
  const phone = req.body.phone
  const password = req.body.password
  if (!phone || !password) {
    return res.status(400).send({ success: false, message: 'Invalid parameters.' })
  }
  service.registerNewUser(phone, password)
    .then(() => {
      res.send({ success: true })
    })
    .catch(error => {
      console.log(error)
      res.send({ success: false })
    })
}

const verifyRegistration = (req, res) => {
  const phone = req.body.phone
  const password = req.body.password
  const token = req.body.token
  if (!phone || !password || !token) {
    return res.status(400).send({ success: false, message: 'Invalid parameters.' })
  }
  service.authRegisterToken(phone, password, token)
    .then((pid) => {
      return eventsService.transformPhoneInvitation(phone)
        .then(() => pid)
    })
    .then((pid) => {
      return service.authenticateUser(pid, password)
        .then(user => {
          return res.send(Object.assign({}, user, { success: true }))
        })
    })
    .catch(error => {
      console.log(error)
      return res.status(403).send({ success: false, message: 'Invalid crendentials' })
    })
}

const authenticate = (req, res) => {
  const pid = req.body.pid
  const password = req.body.password
  if (!pid || !password) {
    return res.status(400).send({ success: false, message: 'Invalid parameters.' })
  }
  service.authenticateUser(pid, password)
    .then(user => {
      return res.send(Object.assign({}, user, { success: true }))
    })
    .catch(error => {
      console.log(error)
      return res.status(403).send({ success: false, message: 'Invalid crendentials' })
    })
}

module.exports = {
  registerAccount,
  verifyRegistration,
  authenticate,
}
