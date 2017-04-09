var db = require('../db')

const getEventById = (eventId) => {
  return db('Account')
    .outerJoin('UserEvent_Account', 'Account.id', 'UserEvent_Account.account_id')
    .outerJoin('UserEvent', 'UserEvent_Account.userevent_id', 'UserEvent.id')
    .where('UserEvent.id', eventId)
}

const getEvents = (accountId) => {
  return db('Account')
    .innerJoin('UserEvent_Account', 'Account.id', 'UserEvent_Account.account_id')
    .innerJoin('UserEvent', 'UserEvent_Account.userevent_id', 'UserEvent.id')
    .where('Account.id', accountId)
}

const cancelEventById = (eventId) => {
  return db('UserEvent')
    .where('id', eventId)
    .update({ eventStatus: 'Cancelled' })
}

const changeEventApproval = (eventId, approved) => {
  return db('UserEvent_Account')
    .where('userevent_id', eventId)
    .update({ approved })
}

module.exports = {
  getEventById,
  getEvents,
  cancelEventById,
  changeEventApproval,
}
