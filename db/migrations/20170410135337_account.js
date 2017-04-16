const tableName = 'Account'

exports.up = function (knex) {
  return knex.schema.createTable(tableName, function (table) {
    table.increments()
    table.string('pid').unique().notNullable()
    table.string('username').notNullable()
    table.string('image_url')
    table.string('phone').notNullable()
    table.text('password').notNullable()
  })
}

exports.down = function (knex) {
  return knex.schema.dropTable(tableName)
}
