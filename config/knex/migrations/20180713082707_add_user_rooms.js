exports.up = function(knex, Promise) {
    return knex.schema.table('users', function(table) {
        table.boolean('B131').defaultTo(false);
        table.boolean('B146').defaultTo(false);
        table.boolean('B148').defaultTo(false);
        table.boolean('B158').defaultTo(false);
        table.boolean('B160').defaultTo(false);
        table.boolean('G040').defaultTo(false);
        table.boolean('GO56').defaultTo(false);
        table.boolean('257').defaultTo(false);
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.table('users', function(table) {
        table.boolean('B131');
        table.boolean('B146');
        table.boolean('B148');
        table.boolean('B158');
        table.boolean('B160');
        table.boolean('G040');
        table.boolean('GO56');
        table.boolean('257');
    });
};
