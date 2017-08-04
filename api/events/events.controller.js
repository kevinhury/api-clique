var moment = require('moment')
const eventsService = require('./events.service')
const smsService = require('../../services/smsservice')

const createEvent = (req, res) => {
  const pid = req.body.pid
  const fields = req.body.fields
  if (!pid) {
    return res.sendStatus(400)
  }
  const eventFields = fetchEventFieldsFromBody(fields)
  // Validate form
  eventsService.getAccountIdForPid(pid)
    .then(accountId => eventsService.createNewEvent(eventFields, accountId))
    .then(event => {
      return eventsService
        .groupPhoneRegistration(eventFields.phoneNumbers, event.id)
        .then(({ exist, notExist }) => {
          console.log(`TODO: Push for exist recipeints ${exist}`)
          const smsActions = notExist.map(({ phone }) =>
            smsService.sendSMS(phone, 'You have been invited to an event')
          )
          return Promise.all(smsActions)
            .catch(error => {
              console.log(error)
              return event
            })
        })
        .then(() => event)
    })
    .then((results) => res.send({ success: true, results }))
    .catch(error => {
      console.log(error)
      res.send({ success: false })
    })
}

const eventById = (req, res) => {
  const eventId = req.params.event_id
  if (!eventId) {
    return res.sendStatus(400)
  }
  eventsService.getEventById(eventId)
    .then((result) => res.send(result))
}

const eventsForAccount = (req, res) => {
  const accountId = req.params.account_id
  if (!accountId) {
    return res.sendStatus(400)
  }
  eventsService.getEventsForAccountId(accountId)
    .then((result) => res.send(result))
}

const cancelEvent = (req, res) => {
  const accountId = req.body.pid
  const eventId = req.body.eventId
  const CANCEL_CODE = 1
  if (!accountId || !eventId) {
    return res.sendStatus(400)
  }
  eventsService.isAccountAdminInEvent(accountId, eventId)
    .then((isAdmin) => {
      if (!isAdmin) { throw isAdmin }
      return eventsService.modifyEventStatus(eventId, CANCEL_CODE)
    })
    .then(() => res.send({ success: true }))
    .catch(error => {
      console.log(error)
      res.send({ success: false })
    })
}

const changeAttendance = (req, res) => {
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
  // TODO: Check if admin changes dates
  eventsService.availableEventDates(eventId)
    .then(availableDates => {
      req.body.dates
        .map(x => new Date(x))
        .forEach(date => {
          if (!availableDates.find(x => x.getTime() === date.getTime())) throw date
        })
      return true
    })
    .then(() => eventsService.changeEventInvitation(accountId, eventId, approval, dates))
    .then(() => res.send({ success: true }))
    .catch(error => {
      console.log(error)
      res.status(400).send({ success: false })
    })
}

const changeEventFields = (req, res) => {
  const accountId = req.body.pid
  const eventId = req.body.eventId
  if (!accountId || !eventId) {
    return res.sendStatus(400)
  }
  const fields = populateFieldsWithRequestBody(req.body)
  if (Object.keys(fields).length === 0) {
    return res.send({ success: false })
  }
  eventsService.changeEventFields(eventId, fields)
    .then(() => res.send({ success: true }))
    .catch(error => {
      console.log(error)
      res.send({ success: false })
    })
}

module.exports = {
  createEvent,
  eventById,
  eventsForAccount,
  cancelEvent,
  changeAttendance,
  changeEventFields,
}

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
  const address = location.address
  const phoneNumbers = contacts.map(x => x.phone.replace(/[-+()\s]/g, ''))
  const event = { title: name, description, location: latlng, locationName, address, lengthInDays: length, expires, minAtendees, maxAtendees }
  const adminInvite = { approval: 2, admin: 1, date1: formattedDates[0], date2: formattedDates[1], date3: formattedDates[2] }
  return { event, adminInvite, phoneNumbers }
}
