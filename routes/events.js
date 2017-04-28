var moment = require('moment')
var express = require('express')
const router = express.Router()
const controller = require('../controllers/events')

/**
 * Creates a new event.
 */
router.post('/createEvent', (req, res) => {
  const pid = req.body.pid
  const accessToken = req.body.accessToken
  const fields = req.body.fields
  if (!pid || !accessToken) {
    return res.sendStatus(400)
  }
  const eventFields = fetchEventFieldsFromBody(fields)
  // Validate form
  controller.getAccountIdForPid(pid)
    .then(accountId => controller.createNewEvent(eventFields, accountId))
    .then((results) => res.send({ success: true, results }))
    .catch(() => res.send({ success: false }))
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
  const accessToken = req.body.accessToken
  const CANCEL_CODE = 1
  if (!accountId || !eventId || !accessToken) {
    return res.sendStatus(400)
  }
  controller.isAccountAdminInEvent(accountId, eventId)
    .then((isAdmin) => {
      if (!isAdmin) { throw isAdmin }
      return controller.modifyEventStatus(eventId, CANCEL_CODE)
    })
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
  const accessToken = req.body.accessToken
  if (!accountId || !eventId || !approval || !accessToken) {
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

const fetchEventFieldsFromBody = (body) => {
  const { name, description, locationName, length, minAtendees, maxAtendees, location, contacts, dates } = body
  const formattedDates = dates.map(date => moment(date).format('YYYY-MM-DD HH:mm:ss'))
  const expires = moment().add(body.deadline, 'hours').format('YYYY-MM-DD HH:mm:ss')
  const latlng = `${location.latitude};${location.longitude}`
  const phoneNumbers = contacts.map(x => x.phone.replace(/[-+()\s]/g, ''))
  const event = { title: name, description, location: latlng, locationName, lengthInDays: length, expires, minAtendees, maxAtendees }
  const adminInvite = { approval: 2, admin: 1, date1: formattedDates[0], date2: formattedDates[1], date3: formattedDates[2] }
  return { event, adminInvite, phoneNumbers }
}
