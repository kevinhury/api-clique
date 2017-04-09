var connection = require('./knexfile').development
var knex = require('knex')(connection)

module.exports = knex
