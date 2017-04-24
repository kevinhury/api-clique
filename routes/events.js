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
  const eventId = req.params.event_id
  if (!eventId) {
    return res.sendStatus(400)
  }
  controller.getEventById(eventId)
    .then((result) => res.send(result))
})

/**
 * Returns all events by a given account id.
 */
router.get('/account/:account_id', (req, res) => {
  const accountId = req.params.account_id
  if (!accountId) {
    return res.sendStatus(400)
  }
  controller.getEventsForAccountId(accountId)
    .then((result) => res.send(result))
})

/**
 * Cancels an event by a given event id.
 */
router.patch('/cancel', (req, res) => {
  const accountId = req.body.pid
  const eventId = req.body.eventId
  const CANCEL_CODE = 1
  if (!accountId || !eventId) {
    return res.sendStatus(400)
  }
  controller.modifyEventStatus(eventId, CANCEL_CODE)
    .then(() => res.send({ success: true }))
    .catch(() => res.send({ success: false }))
})

/**
 * Change an account attendance by an acocunt id and event id.
 */
router.patch('/changeAttendance', (req, res) => {
  const accountId = req.body.pid
  const eventId = req.body.eventId
  const approval = req.body.approval
  if (!accountId || !eventId || !approval) {
    return res.sendStatus(400)
  }

  const dates = req.body.dates
    .map(date => new Date(date))
    .map(date => {
      return date.toISOString().slice(0, 19).replace('T', ' ')
    })
  if (approval === '2' && (!Array.isArray(dates) || !dates.length)) {
    return res.sendStatus(400)
  }
  // TODO: Add check for admin dates
  // TODO: Check if admin changes dates
  controller.changeEventInvitation(accountId, eventId, approval, dates)
    .then(() => res.send({ success: true }))
    .catch((err) => {
      console.log(err)
      res.send({ success: false })
    })
})

/**
 * Change an event fields based on the event id.
 */
router.patch('/modifyFields', (req, res) => {
  const accountId = req.body.account_id
  const eventId = req.body.event_id
  if (!accountId || !eventId) {
    return res.sendStatus(400)
  }
  const fields = populateFieldsWithRequestBody(req.body)
  if (Object.keys(fields).length === 0) {
    return res.send({ success: false })
  }
  controller.changeEventFields(eventId, fields)
    .then(() => res.send({ success: true }))
    .catch(() => res.send({ success: false }))
})

/**
 * Make a date vote for a given event id, date and account id.
 */
router.post('/vote', (req, res) => {
  const accountId = req.body.account_id
  const eventId = req.body.eventId
  const dates = req.body.dates
  if (!accountId || !eventId) {
    return res.sendStatus(400)
  }
  controller.dateVoteForEventId(accountId, eventId, dates)
    .then(() => res.send({ success: true }))
    .catch(() => res.send({ success: false }))
})

module.exports = router

const populateFieldsWithRequestBody = (body) => {
  const fields = {}
  if (body.title) fields.title = body.title
  if (body.description) fields.description = body.description
  if (body.locationName) fields.locationName = body.locationName
  if (body.location) fields.location = body.location
  if (body.lengthInDays) fields.lengthInDays = body.lengthInDays
  if (body.expires) fields.expires = body.expires
  if (body.minAtendees) fields.minAtendees = body.minAtendees
  if (body.maxAtendees) fields.maxAtendees = body.maxAtendees
  return fields
}
