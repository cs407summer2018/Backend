
exports.up = function(knex, Promise) {
    return knex.schema.createTable('building', function(table) {
        table.increments('id').primary()
        table.string('name').notNullable()
        table.string('address').notNullable()
        table.string('abbrev').notNullable()
        table.timestamps()

    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('building')
};
