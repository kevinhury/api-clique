var uuid = require('uuid/v4')

const generateUUID = () => {
  return uuid()
}

module.exports = {
  generateUUID,
}
