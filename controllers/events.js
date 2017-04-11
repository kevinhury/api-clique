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
    .then((results) => {
      const atendees = results.map((object) => {
        const { pid, username, image_url, phone, approval, admin, date1, date2, date3 } = object
        return { pid, username, image_url, phone, approval, admin, date1, date2, date3 }
      })
      const { title, description, locationName, location, lengthInDays, eventStatus, expires, minAtendees, maxAtendees } = results[0]
      const event = { title, description, locationName, location, lengthInDays, eventStatus, expires, minAtendees, maxAtendees }
      return { event, atendees }
    })
}

const getEventsForAccountId = (accountId) => {
  return db('Account')
    .innerJoin('EventInvitation', 'Account.id', 'EventInvitation.account_id')
    .innerJoin('UserEvent', 'EventInvitation.userevent_id', 'UserEvent.id')
    .where('Account.id', accountId)
}

const modifyEventStatus = (eventId, eventStatus) => {
  return db('UserEvent')
    .where('id', eventId)
    .update({ eventStatus })
}

const changeEventInvitation = (eventId, approval) => {
  return db('EventInvitation')
    .where('userevent_id', eventId)
    .update({ approval })
}

const changeEventFields = (eventId, fields) => {
  return db('UserEvent')
    .where('id', eventId)
    .update(fields)
}

const getNumberOfInviteesForEvent = (eventId) => {
  return db('EventInvitation')
    .count('account_id')
    .where('event_id', eventId)
}

const dateVoteForEventId = (eventId, accountId, date) => {
  return db('EventDate')
    .insert({ account_id: accountId, userevent_id: eventId, date })
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
}
