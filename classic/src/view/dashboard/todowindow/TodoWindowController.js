/**
 * Created by Olga on 29/02/16.
 */
Ext.define('Admin.view.dashboard.todowindow.TodoWindowController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.todowindow',

    
    closeWindow: function() {
        this.getView().close();
    },
    
    saveToDo: function () {
        var toDoStore = this.getViewModel().get('todos');
        if (!Ext.isEmpty(toDoStore)) {
            toDoStore.addNewToDo(this.getViewModel().get('todoText'));
        }
        this.closeWindow();
    }
});