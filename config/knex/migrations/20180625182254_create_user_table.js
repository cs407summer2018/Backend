
exports.up = function(knex, Promise) {
	return knex.schema.createTable('users', function(table) {
		table.increments('id').primary()
		table.string('name').unique().notNullable()
		table.string('email').unique().notNullable()
		table.timestamps(true, true)
	}) 
};

exports.down = function(knex, Promise) {
	return knex.schema.dropTableIfExists('users')
};
