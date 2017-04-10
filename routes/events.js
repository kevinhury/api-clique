var express = require('express')
const router = express.Router()
const controller = require('../controllers/events')

/**
 * Creates a new event.
 */
router.post('/createEvent', (req, res) => {
  res.send('ok')
})

/**
 * Returns event information by its id.
 */
router.get('/:event_id', (req, res) => {
  res.send('ok')
})

/**
 * Returns all events by a given account id.
 */
router.get('/account/:account_id', (req, res) => {
  res.send('ok')
})

/**
 * Cancels an event by a given event id.
 */
router.patch('/cancel', (req, res) => {
  res.send('ok')
})

/**
 * Change an account attendance by an acocunt id and event id.
 */
router.patch('/changeAttendance', (req, res) => {
  res.send('ok')
})

/**
 * Change an event fields based on the event id.
 */
router.patch('/modifyFields', (req, res) => {
  res.send('ok')
})

/**
 * Make a date vote for a given event id, date and account id.
 */
router.post('/vote', (req, res) => {
  res.send('ok')
})

