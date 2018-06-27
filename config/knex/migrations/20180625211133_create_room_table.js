
exports.up = function(knex, Promise) {
    return knex.schema.createTable('room', function(table) {
        table.increments('id').primary()
        table.integer('building_id').unsigned().references('id').inTable('building')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
        table.string('room_number').notNullable()
        table.timestamps()

    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('room')
};
