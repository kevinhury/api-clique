var db = require('../db')

const createNewEvent = (eventFields) => {
  return db('UserEvent')
    .insert(eventFields)
}

const getEventById = (eventId) => {
  return db('Account')
    .outerJoin('EventApproval', 'Account.id', 'EventApproval.account_id')
    .outerJoin('UserEvent', 'EventApproval.userevent_id', 'UserEvent.id')
    .where('UserEvent.id', eventId)
}

const getEventsForAccountId = (accountId) => {
  return db('Account')
    .innerJoin('EventApproval', 'Account.id', 'EventApproval.account_id')
    .innerJoin('UserEvent', 'EventApproval.userevent_id', 'UserEvent.id')
    .where('Account.id', accountId)
}

const modifyEventStatus = (eventId, eventStatus) => {
  return db('UserEvent')
    .where('id', eventId)
    .update({ eventStatus })
}

const changeEventApproval = (eventId, approval) => {
  return db('EventApproval')
    .where('userevent_id', eventId)
    .update({ approval })
}

const changeEventFields = (eventId, fields) => {
  return db('UserEvent')
    .where('id', eventId)
    .update(fields)
}

const getNumberOfInviteesForEvent = (eventId) => {
  return db('EventApproval')
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
  changeEventApproval,
  changeEventFields,
  getNumberOfInviteesForEvent,
  dateVoteForEventId,
}
