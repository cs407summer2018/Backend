
exports.up = function(knex, Promise) {
	return knex.schema.createTable('user', function(table) {
		table.increments('id').primary();
		table.string('name').notNullable();
		table.string('email').notNullable();
		table.timestamps();
	}) 
};

exports.down = function(knex, Promise) {
	return knex.schema.dropTableIfExists('user')
};
