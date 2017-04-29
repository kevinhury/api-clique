var jwt = require('jsonwebtoken')
var secret = require('../config/secrets/jwt').secret
var bcrypt = require('bcrypt')
var db = require('../db/db')
var smsservice = require('../services/smsservice')
var uuidservice = require('../services/uuidservice')
// var smsservice = {
//   sendSMS: (str, str2, callback) => {
//     console.log(str2)
//     callback(null, str)
//   }
// }

var AccountsTokens = []

// sends sms message to phone number specified
// generates a random token
// saves the user in memory until a auth-register comes
const registerNewUser = (phone, password) => {
  const token = generateToken(6)
  AccountsTokens.push({ phone, password, token })
  return new Promise((resolve, reject) => {
    smsservice.sendSMS(phone, generateSMSMessage(token), (err, _) => {
      if (err) {
        return reject(err)
      }
      resolve(token)
    })
  })
}

// checks if the token sent by sms is valid
// saves a new user to the database
// returns pid
const authRegisterToken = (phone, password, token) => {
  return new Promise((resolve, reject) => {
    const user = getRegisteredAccount(phone, password, token)
    if (!user) {
      return reject(new Error('user not found'))
    }
    AccountsTokens = AccountsTokens.filter((x) => x.phone !== phone)
    resolve(token)
  }).then(() => persistNewUser(phone, password))
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

// authenticates a user by its password
// returns an access token to make actions
const authenticateUser = (pid, password) => {
  return queryUserInformation(pid)
    .then((user) => {
      if (!user) {
        throw new Error('Invalid credentials.')
      }
      return comparePassword(password, user.password)
        .then((results) => {
          if (!results) {
            throw new Error('Invalid credentials.')
          }
          return jwt.sign(user, secret, { expiresIn: 1440 })
        })
        .then(accessToken => {
          return { pid: user.pid, username: user.username, image: user.image_url, phone: user.phone, accessToken }
        })
    })
}

// saves the user to the database
const persistNewUser = (phone, password) => {
  return hashPassword(password)
    .then((hash) => {
      const pid = generatePID()
      return db('Account')
        .insert({ pid, username: phone, phone, password: hash })
        .then((results) => {
          if (results.length < 1) {
            throw new Error('Persisting user failed.')
          }
          return pid
        })
    })
}

// looks for a specific user by its pid
const queryUserInformation = (pid) => {
  return db('Account')
    .where({ pid })
    .first()
}

const hashPassword = (password) => {
  return bcrypt.hash(password, 10)
}

const comparePassword = (userPassword, dbPassword) => {
  return bcrypt.compare(userPassword, dbPassword)
}

// returns a user that is listed in the sms token array
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
  return Array.apply(null, Array(length)).map(random).map(String).join('')
}

const generatePID = () => {
  return uuidservice.generateUUID()
}

const generateSMSMessage = (token) => {
  return `This is your new token: ${token}`
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
  generatePID,
  generateSMSMessage,
}
