var Nexmo = require('nexmo')
var config = require('../config/sms')

const options = {
  debug: true,
}

const nexmo = new Nexmo(config, options)

const sendSMS = (recipient, message) => {
  return new Promise((resolve, reject) => {
    nexmo.message.sendSms('Clique', recipient, message, {}, (err, results) => {
      if (err) { return reject(err) }
      resolve(results)
    })
  })
}

module.exports = {
  sendSMS: sendSMS,
}
