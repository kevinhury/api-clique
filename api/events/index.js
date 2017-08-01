var express = require('express')
const router = express.Router()
const controller = require('./events.controller')
const auth = require('../accounts/accounts.service')

router.use(auth.authMiddleware)

router.post('/createEvent', controller.createEvent)
router.get('/:event_id', controller.eventById)
router.get('/account/:account_id', controller.eventsForAccount)
router.patch('/cancel', controller.cancelEvent)
router.patch('/changeAttendance', controller.changeAttendance)
router.patch('/modifyFields', controller.changeEventFields)

module.exports = router
