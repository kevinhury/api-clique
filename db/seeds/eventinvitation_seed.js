const tableName = 'EventInvitation'
exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex(tableName).del()
    .then(function () {
      // Inserts seed entries
      return knex(tableName).insert([
        { id: 1, account_id: 1, userevent_id: 1, admin: true, date1: new Date() },
        { id: 2, account_id: 2, userevent_id: 1, admin: false, date1: new Date() },
        { id: 3, account_id: 3, userevent_id: 1, admin: false, date1: new Date() },
        { id: 4, account_id: 2, userevent_id: 2, admin: true, date1: new Date() },
        { id: 5, account_id: 3, userevent_id: 2, admin: false, date1: new Date() },
      ])
    })
}
