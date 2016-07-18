Ext.define('Admin.store.dashboard.Todo', {
    extend: 'Ext.data.Store',

    alias: 'store.todo',

    model: 'Admin.model.dashboard.Todo',

    autoLoad: true,

    proxy: {
        type: 'api',
        url: '~api/dashboard/tasks'
    },
    
    addNewToDo: function (text) {
        if (!Ext.isEmpty(text) && Ext.isEmpty(this.findRecord('task', text))) {
           this.add({
               task: text
           });
        }     
    }
});


/*

if (!Ext.isEmpty(text)) {
   this.add({
       task: text
   });
} 

if (!Ext.isEmpty(text) && Ext.isEmpty(this.findRecord('task', text))) {
   this.add({
       task: text
   });
} 

*/