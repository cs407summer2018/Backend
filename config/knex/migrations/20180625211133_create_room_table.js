
exports.up = function(knex, Promise) {
    return knex.schema.createTable('rooms', function(table) {
        table.increments('id').primary()
        table.integer('building_id').unsigned().references('id').inTable('buildings')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
        table.string('room_number').notNullable()
        table.integer('capacity').notNullable()
        table.string('google_calender_id')
        table.timestamps(true, true)

    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('rooms')
};
