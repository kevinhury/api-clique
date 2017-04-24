var db = require('../db/db')

const createNewEvent = (eventFields) => {
  return db('UserEvent')
    .insert(eventFields)
}

const getEventById = (eventId) => {
  return db('Account')
    .innerJoin('EventInvitation', 'Account.id', 'EventInvitation.account_id')
    .innerJoin('UserEvent', 'EventInvitation.userevent_id', 'UserEvent.id')
    .where('UserEvent.id', eventId)
    .then(mapEventResultsToResponse)
}

const getEventsForAccountId = (accountId) => {
  return db('Account')
    .select('EventInvitation.userevent_id')
    .innerJoin('EventInvitation', 'Account.id', 'EventInvitation.account_id')
    .where('Account.pid', accountId)
    .map((result) => getEventById(result.userevent_id))
}

const modifyEventStatus = (eventId, eventStatus) => {
  return db('UserEvent')
    .where('id', eventId)
    .update({ eventStatus })
}

const changeEventInvitation = (accountId, eventId, approval, dates) => {
  return db('EventInvitation')
    .innerJoin('Account', 'EventInvitation.account_id', 'Account.id')
    .where({ pid: accountId, userevent_id: eventId })
    .update({ approval, date1: dates[0] || null, date2: dates[1] || null, date3: dates[2] || null })
}

const changeEventFields = (eventId, fields) => {
  return db('UserEvent')
    .where('id', eventId)
    .update(fields)
}

const getNumberOfInviteesForEvent = (eventId) => {
  return db('EventInvitation')
    .count('account_id as count')
    .where('userevent_id', eventId)
    .then((results) => results[0].count)
}

const dateVoteForEventId = (accountId, eventId, dates) => {
  return db('EventInvitation')
    .where({ account_id: accountId, userevent_id: eventId })
    .update({ date1: dates[0], date2: dates[1], date3: dates[2] })
}

const isAccountAdminInEvent = (accountId, eventId) => {
  return db('EventInvitation')
    .innerJoin('Account', 'EventInvitation.account_id', 'Account.id')
    .where({ pid: accountId, userevent_id: eventId })
    .map((result) => {
      return result.admin
    })
    .then((result) => result[0] || 0)
}

const availableDatesForEvent = (eventId) => {
  return db('EventInvitation')
    .where({ userevent_id: eventId, admin: true })
    .map((result) => { return { date1: result.date1, date2: result.date2, date3: result.date3 } })
}

module.exports = {
  createNewEvent,
  getEventById,
  getEventsForAccountId,
  modifyEventStatus,
  changeEventInvitation,
  changeEventFields,
  getNumberOfInviteesForEvent,
  dateVoteForEventId,
  isAccountAdminInEvent,
  availableDatesForEvent,
}

const mapEventResultsToResponse = (results) => {
  const atendees = results.map((object) => {
    const { pid, username, image_url, phone, approval, admin, date1, date2, date3 } = object
    return { pid, username, image_url, phone, approval, admin, date1, date2, date3 }
  })
  const { id, title, description, locationName, location, lengthInDays, eventStatus, expires, minAtendees, maxAtendees } = results[0]
  const event = { id, title, description, locationName, location, lengthInDays, eventStatus, expires, minAtendees, maxAtendees }
  return { event, atendees }
}
