var Nexmo = require('nexmo')
var config = require('../config/sms')

const options = {
  debug: true,
}

const nexmo = new Nexmo(config, options)

const sendSMS = (recipient, message, callback) => {
  return nexmo.message.sendSms('Clique', recipient, message, {}, callback)
}

module.exports = {
  sendSMS: sendSMS,
}
