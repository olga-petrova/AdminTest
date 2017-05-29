/**
* @class stpo.dashboard
* @singleton
*/
ST.pageobject.define('dashboard', {
    _locators: {
        /**
        * @method addButton
        * @member stpo.dashboard
        * @return {ST.future.Button}
        */addButton: {
            locator: 'button[itemId="addNewItemButton"]',
            name: 'addButton',
            type: 'button',
            className: 'ST.future.Button'
        },
        /**
        * @method toDoGrid
        * @member stpo.dashboard
        * @return {ST.future.Grid}
        */toDoGrid: {
            locator: 'todo grid',
            name: 'toDoGrid',
            type: 'grid',
            className: 'ST.future.Grid'
        },
        /**
        * @method toDoWindow
        * @member stpo.dashboard
        * @return {ST.future.Panel}
        */toDoWindow: {
            locator: 'todowindow[reference="todoWindow"]',
            name: 'toDoWindow',
            type: 'panel',
            className: 'ST.future.Panel'
        },
        /**
        * @method toDoText
        * @member stpo.dashboard
        * @return {ST.future.TextField}
        */toDoText: {
            locator: 'textfield[fieldLabel="Enter new TODO"]',
            name: 'toDoText',
            type: 'textField',
            className: 'ST.future.TextField'
        },
        /**
        * @method cancelButton
        * @member stpo.dashboard
        * @return {ST.future.Button}
        */cancelButton: {
            locator: 'button[itemId="cancelButton"]',
            name: 'cancelButton',
            type: 'button',
            className: 'ST.future.Button'
        },
        /**
        * @method saveButton
        * @member stpo.dashboard
        * @return {ST.future.Button}
        */saveButton: {
            locator: 'button[itemId="saveButton"]',
            name: 'saveButton',
            type: 'button',
            className: 'ST.future.Button'
        }
    }
});