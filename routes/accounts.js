var express = require('express')
const router = express.Router()
const controller = require('../controllers/accounts')

router.post('/register', (req, res) => {
  res.send('ok')
})

router.post('/verifyRegister', (req, res) => {
  res.send('ok')
})

router.post('/authenticate', (req, res) => {
  res.send('ok')
})

module.exports = router
