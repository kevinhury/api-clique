const tableName = 'Account'
exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex(tableName).del()
    .then(function () {
      // Inserts seed entries
      return knex(tableName).insert([
        { id: 1, pid: 'kevin1', username: 'Kevin Hury', phone: '123456789' },
        { id: 2, pid: 'moshe2', username: 'Moshiko Balagan', phone: '234567891' },
        { id: 3, pid: 'kishk3', username: 'Kishkush Balabush', phone: '345678912' },
      ])
    })
}
