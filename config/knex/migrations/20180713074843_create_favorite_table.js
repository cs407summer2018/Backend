
exports.up = function(knex, Promise) {
    return knex.schema.createTable('favorites', function(table) {
        table.increments('id').primary()
        table.integer('user_id').unsigned().references('id').inTable('users')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
        table.integer('room_id').unsigned().references('id').inTable('rooms')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
        table.timestamps(true, true)

    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('favorites')
};
