var bcrypt = require('bcrypt')
var db = require('../db/db')
var smsservice = require('../services/smsservice')

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

const authenticateUser = (pid, password) => {
  return queryUserInformation(pid)
    .then((user) => {
      return comparePassword(password, user.password)
    })
    .then((res) => {
      if (!res) {
        throw new Error('bad password')
      }
    })
}

const persistNewUser = (phone, password) => {
  return hashPassword(password)
    .then((hash) => {
      return db('UserEvent')
        .insert({ phone, password: hash })
    })
}

const queryUserInformation = (pid) => {
  return db('UserEvent')
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
  const random = () => Math.random() * (max - min) + min
  const round = (x) => Math.round(x)
  return Array.apply(null, Array(length)).map(round(random))
}

module.exports = {
  registerNewUser,
  authRegisterToken,
  authenticateUser,
}
