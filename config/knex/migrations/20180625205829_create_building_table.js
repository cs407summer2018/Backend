
exports.up = function(knex, Promise) {
    return knex.schema.createTable('buildings', function(table) {
        table.increments('id').primary()
        table.string('name').unique().notNullable()
        table.string('address').unique().notNullable()
        table.string('abbrev').unique().notNullable()
        table.timestamps(true, true)

    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('buildings')
};
