Ext.define('Admin.model.dashboard.Todo', {
    extend: 'Admin.model.Base',

    fields: [
        {
            type: 'int',
            name: 'id'
        },
        {
            type: 'string',
            name: 'task'
        },
        {
            type: 'boolean',
            name: 'done'
        }
    ]
});
