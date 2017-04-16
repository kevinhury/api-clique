var jwt = require('jsonwebtoken')
var secret = require('../config/secrets/jwt').secret
var bcrypt = require('bcrypt')
var db = require('../db/db')
// var smsservice = require('../services/smsservice')
const smsservice = { sendSMS: (recipient, message, callback) => { callback(null) } }

var AccountsTokens = []
const genericMessage = ''

const registerNewUser = (phone, password) => {
  return new Promise((resolve, reject) => {
    smsservice.sendSMS(phone, genericMessage, (err, _) => {
      if (err) {
        return reject(err)
      }
      const token = generateToken(6)
      AccountsTokens.push({ phone, password, token })
      resolve(token)
    })
  })
}

const authRegisterToken = (phone, password, token) => {
  return new Promise((resolve, reject) => {
    const user = getRegisteredAccount(phone, password, token)
    if (!user) {
      return reject(new Error('user not found'))
    }
    AccountsTokens = AccountsTokens.filter((x) => x !== user)
    return persistNewUser(phone, password)
  }).then(() => authenticateUser(phone, password))
}

const authMiddleware = (req, res, next) => {
  const token = req.body.token || req.headers['x-access-token']
  if (!token) {
    return res.status(403).send({ success: false, message: 'No token provided.' })
  }

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return res.json({ success: false, message: 'Failed to authenticate token.' })
    }
    req.decoded = decoded
    next()
  })
}

const authenticateUser = (pid, password) => {
  return queryUserInformation(pid)
    .then((user) => {
      return comparePassword(password, user.password)
    })
}

const persistNewUser = (phone, password) => {
  return hashPassword(password)
    .then((hash) => {
      const pid = generatePID()
      return db('Account')
        .insert({ pid, username: phone, phone, password: hash })
    })
}

const queryUserInformation = (pid) => {
  return db('Account')
    .where('pid', pid)
    .first()
}

const hashPassword = (password) => {
  return bcrypt.hash(password, 10)
}

const comparePassword = (userPassword, dbPassword) => {
  return bcrypt.compare(userPassword, dbPassword)
}

const getRegisteredAccount = (phone, password, token) => {
  return AccountsTokens.find((value) => {
    return value.phone === phone &&
      value.password === password &&
      value.token === token
  })
}

const generateToken = (length) => {
  const min = 0
  const max = 9
  const random = () => Math.round(Math.random() * (max - min) + min)
  // return Array.apply(null, Array(length)).map(random).map(String).join('')
  return '123456';
}

const generatePID = () => {
  return 'qwert'
}

module.exports = {
  registerNewUser,
  authRegisterToken,
  authMiddleware,
  authenticateUser,
  persistNewUser,
  queryUserInformation,
  hashPassword,
  comparePassword,
  getRegisteredAccount,
  generateToken,
}
