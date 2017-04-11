const tableName = 'UserEvent'
exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex(tableName).del()
    .then(function () {
      // Inserts seed entries
      return knex(tableName).insert([
        { id: 1, title: 'On the fire', description: 'Were going to have fun', locationName: 'My place', location: '123;123', expires: new Date(), maxAtendees: 10 },
        { id: 2, title: 'Basketball', description: 'Is my favorite sport', locationName: 'Court', location: '456;456', expires: new Date(), minAtendees: 3 },
      ])
    })
}
