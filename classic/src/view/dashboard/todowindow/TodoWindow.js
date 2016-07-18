/**
 * Created by Olga on 29/02/16.
 */
Ext.define('Admin.view.dashboard.todowindow.TodoWindow', {
    extend: 'Ext.window.Window',

    requires: [
        'Admin.view.dashboard.todowindow.TodoWindowModel',
		'Admin.view.dashboard.todowindow.TodoWindowController'
    ],


    xtype: 'todowindow',
    reference: 'todoWindow',
    
    viewModel: {
        type: 'todowindow'
    },

    controller: 'todowindow',

    items: [
        {
            xtype: 'form',
            padding: 10,
            items: [
                {
                    xtype: 'textfield',
                    fieldLabel: 'Enter new TODO',
                    allowBlank: false,
                    bind: {
                        value: '{todoText}'
                    }
                }    
            ],

            buttons: [{
                text: 'Cancel',
                itemId: 'cancelButton',
                handler: 'closeWindow'
            },{
                text: 'Save',
                itemId: 'saveButton',
                formBind: true,
                handler: 'saveToDo'
            }]
        }
    ]
});