
exports.up = function(knex, Promise) {
    return knex.schema.createTable('session', function(table) {
        table.increments('id').primary()
        table.integer('machine_id').unsigned().references('id').inTable('machine')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
        table.integer('user_id').unsigned().references('id').inTable('user')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
        table.integer('pid').notNullable()
        table.dateTime('start_time').notNullable()
        table.dateTime('end_time')
        table.timestamps()
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('session')
};
