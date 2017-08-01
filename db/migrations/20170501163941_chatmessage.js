const tableName = 'ChatMessage'

exports.up = (knex) => {
  return knex.schema.createTable(tableName, (table) => {
    table.increments()
    table.integer('account_id').unsigned().notNullable()
    table.integer('userevent_id').unsigned().notNullable()
    table.text('message').notNullable()
    table.foreign('account_id').references('id').inTable('Account')
    table.foreign('userevent_id').references('id').inTable('UserEvent')
  })
}

exports.down = (knex) => {
  return knex.schema.dropTable(tableName)
}
