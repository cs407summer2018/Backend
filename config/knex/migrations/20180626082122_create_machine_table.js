
exports.up = function(knex, Promise) {
    return knex.schema.createTable('machine', function(table) {
        table.increments('id').primary()
        table.integer('room_id').unsigned().references('id').inTable('room')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
        table.string('name').notNullable()
        table.timestamps()
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('machine')
};
