var express = require('express')
const router = express.Router()
const controller = require('./accounts.controller')

router.post('/register', controller.registerAccount)
router.post('/verifyRegister', controller.verifyRegistration)
router.post('/authenticate', controller.authenticate)

module.exports = router
