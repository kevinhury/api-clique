var moment = require('moment')
var db = require('../../db/db')

const createNewEvent = (fields, accountId) => {
  const { event, adminInvite, phoneNumbers } = fields
  return db('UserEvent')
    .insert(event)
    .then(rowsInserted => rowsInserted[0])
    .then((eventId) => {
      return insertAdminInvitation(adminInvite, accountId, eventId)
        .then(() => insertContactsInvitations(phoneNumbers, eventId))
        .then(() => eventId)
    })
    .then((eventId) => getEventById(eventId))
}

const insertAdminInvitation = (invite, accountId, eventId) => {
  const { approval, admin, date1, date2, date3 } = invite
  return db('EventInvitation')
    .insert({ account_id: accountId, userevent_id: eventId, approval, admin, date1, date2, date3 })
    .catch((err) => console.log(err))
}

const groupPhoneRegistration = (phoneNumbers, eventId) => {
  return db('Account')
    .whereIn('phone', phoneNumbers)
    .then(accounts => {
      const existPhones = accounts.map(account => account.phone)
      const exist = accounts.map(account => {
        return { account_id: account.id, userevent_id: eventId }
      })
      const notExist = phoneNumbers
        .filter(phone => existPhones.indexOf(phone) < 0)
        .map(phone => {
          return { phone, userevent_id: eventId }
        })
      return { exist, notExist }
    })
}

const insertContactsInvitations = (phoneNumbers, eventId) => {
  return groupPhoneRegistration(phoneNumbers, eventId)
    .then(({ exist, notExist }) =>
      Promise.all([
        db('PhoneInvitation').insert(notExist),
        db('EventInvitation').insert(exist),
      ])
    )
}

const getEventById = (eventId) => {
  return db('Account')
    .innerJoin('EventInvitation', 'Account.id', 'EventInvitation.account_id')
    .innerJoin('UserEvent', 'EventInvitation.userevent_id', 'UserEvent.id')
    .where('UserEvent.id', eventId)
    .then(mapEventResultsToResponse)
    .then(res => {
      return modifyStatusByExpiration(res)
        .then(() => res)
    })
}

const getEventsForAccountId = (accountId) => {
  return db('Account')
    .select('EventInvitation.userevent_id')
    .innerJoin('EventInvitation', 'Account.id', 'EventInvitation.account_id')
    .where('Account.pid', accountId)
    .map((result) => getEventById(result.userevent_id))
}

const getAccountIdForPid = (pid) => {
  return db('Account')
    .select('id')
    .where({ pid })
    .then(res => res[0].id)
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

const isAccountAdminInEvent = (accountId, eventId) => {
  return db('EventInvitation')
    .innerJoin('Account', 'EventInvitation.account_id', 'Account.id')
    .where({ pid: accountId, userevent_id: eventId })
    .map((result) => {
      return result.admin
    })
    .then((result) => result[0] || 0)
}

const availableEventDates = (eventId) => {
  return db('EventInvitation')
    .where({ userevent_id: eventId, admin: 1 })
    .map(res => {
      return [res.date1, res.date2, res.date3]
        .filter(date => date)
    })
    .then(res => res[0] || null)
    .map(str => str ? new Date(str) : null)
}

const modifyStatusByExpiration = ({ event, atendees }) => {
  if (event.eventStatus === 0 && moment(event.expires).isAfter(moment())) {
    return Promise.resolve(true)
  }
  const dates = atendees
    .filter(x => x.approval === 2)
    .map(x => [x.date1, x.date2, x.date3].filter(Boolean))
    .reduce((a, b) => a.concat(b), [])
    .map(String)

  const dateRepetition = commonElement(dates).max
  const eventStatus = dateRepetition < event.minAtendees ? 1 : 2
  event.eventStatus = eventStatus

  return db('UserEvent')
    .where('id', event.id)
    .update({ eventStatus })
}

const transformPhoneInvitation = (phone) => {
  // TODO: invitations check dates of invites, maybe event is already over?
  const queryInvitations =
    db('PhoneInvitation')
      .select('*')
      .innerJoin('Account', 'PhoneInvitation.phone', 'Account.phone')
      .where({ 'PhoneInvitation.phone': phone, 'PhoneInvitation.used': 0 })

  const turnOffInvitations = (invites) =>
    db('PhoneInvitation')
      .whereIn('id', invites.map(x => x.id))
      .update({ used: 1 })

  const createEventInvitations = (invites) => {
    const mapped = invites.map(x => {
      return { account_id: x.id, userevent_id: x.userevent_id }
    })
    return db('EventInvitation')
      .insert(mapped)
  }

  return queryInvitations
    .then(invites => {
      if (!invites.length) return Promise.resolve()
      return turnOffInvitations(invites)
        .then(() => createEventInvitations(invites))
    })
}

module.exports = {
  createNewEvent,
  getEventById,
  getEventsForAccountId,
  getAccountIdForPid,
  modifyEventStatus,
  changeEventInvitation,
  changeEventFields,
  isAccountAdminInEvent,
  availableEventDates,
  modifyStatusByExpiration,
  transformPhoneInvitation,
  groupPhoneRegistration,
}

const mapEventResultsToResponse = (results) => {
  const atendees = results.map((object) => {
    const { pid, username, image_url, phone, approval, admin, date1, date2, date3 } = object
    return { pid, username, image_url, phone, approval, admin, date1, date2, date3 }
  })
  const { id, title, description, locationName, location, address, lengthInDays, eventStatus, expires, minAtendees, maxAtendees } = results[0]
  const event = { id, title, description, locationName, location, address, lengthInDays, eventStatus, expires, minAtendees, maxAtendees }
  return { event, atendees }
}

const commonElement = (array) => {
  const frequency = {}
  let max = 0
  let element = null
  for (let v in array) {
    frequency[array[v]] = (frequency[array[v]] || 0) + 1
    if (frequency[array[v]] > max) {
      max = frequency[array[v]]
      element = array[v]
    }
  }
  return { element, max }
}
