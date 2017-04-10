const tableName = 'UserEvent'

exports.up = function (knex) {
  return knex.schema.createTable(tableName, function (table) {
    table.increments()
    table.string('title').notNullable()
    table.string('description').notNullable()
    table.string('locatioName').notNullable()
    table.string('location').notNullable()
    table.integer('lengthInDays').unsigned()
    table.integer('eventStatus').unsigned().defaultTo(0)
    table.date('expires').notNullable()
    table.integer('minAtendees').unsigned().defaultTo(0)
    table.integer('maxAtendees').unsigned().defaultTo(0)
  })
}

exports.down = function (knex) {
  return knex.schema.dropTable(tableName)
}
