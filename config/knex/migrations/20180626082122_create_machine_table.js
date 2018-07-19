
exports.up = function(knex, Promise) {
    return knex.schema.createTable('machines', function(table) {
        table.increments('id').primary()
        table.integer('room_id').unsigned().references('id').inTable('rooms')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
        table.string('name').notNullable()
        table.timestamps(true, true)
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('machines')
};
