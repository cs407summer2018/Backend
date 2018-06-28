exports.up = function(knex, Promise) {
    return knex.schema.createTable('specifications', function(table) {
        table.increments('id').primary()
        table.integer('room_id').unsigned().references('id').inTable('room')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
        table.string('CPU')
        table.string('RAM')
        table.string('OS')
        table.string('monitor')
        table.string('printer')
        table.string('printer_id')
        table.timestamps()

    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('specifications')
};
