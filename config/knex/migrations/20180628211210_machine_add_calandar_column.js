
exports.up = function(knex, Promise) {
    return knex.schema.table('machines', function(table) {
        table.string('google_calender_id');
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.table('machines', function(table) {
        table.string('google_calender_id')
    });
};
