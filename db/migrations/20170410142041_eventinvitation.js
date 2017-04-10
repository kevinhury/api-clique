const tableName = 'EventInvitation'

exports.up = function (knex) {
  return knex.schema.createTable(tableName, function (table) {
    table.increments()
    table.integer('account_id').unsigned().notNullable()
    table.integer('userevent_id').unsigned().notNullable()
    table.integer('approval').unsigned().defaultTo(0)
    table.boolean('admin').notNullable().defaultTo(0)
    table.dateTime('date1')
    table.dateTime('date2')
    table.dateTime('date3')
    table.foreign('account_id').references('id').inTable('Account')
    table.foreign('userevent_id').references('id').inTable('UserEvent')
  })
}

exports.down = function (knex) {
  return knex.schema.dropTable(tableName)
}
