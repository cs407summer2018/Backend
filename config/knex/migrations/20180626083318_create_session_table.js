
exports.up = function(knex, Promise) {
    return knex.schema.createTable('usages', function(table) {
        table.increments('id').primary()
        table.integer('machine_id').unsigned().references('id').inTable('machines')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
        table.integer('user_id').unsigned().references('id').inTable('users')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
        table.integer('pid').notNullable()
        table.dateTime('start_time').notNullable()
        table.dateTime('end_time')
        table.timestamps(true, true)
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('usages')
};
