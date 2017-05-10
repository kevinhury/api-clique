const tableName = 'PhoneInvitation'

exports.up = function (knex) {
  return knex.schema.createTable(tableName, (table) => {
    table.increments()
    table.string('phone').notNullable()
    table.integer('used').unsigned().defaultTo(0)
    table.integer('userevent_id').unsigned().notNullable()
    table.foreign('userevent_id').references('id').inTable('UserEvent')
  })
}

exports.down = function (knex) {
  return knex.schema.dropTable(tableName)
}
