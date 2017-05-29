describe("ToDoList.js", function() {
    
    it('ToDo window should save ToDo and close on save button click', function () {
   
       stpo.dashboard.addButton().click();
       stpo.dashboard.toDoText().setValue('test');
       stpo.dashboard.saveButton().click();
       stpo.dashboard.toDoGrid().selectWith('task', "test");
        
        //ST.button('button[itemId=\"addNewItemButton\"]').rendered().click();
        //ST.textField('todowindow textfield[fieldLabel=\"Enter new TODO\"]').setValue('test');
        //ST.button('todowindow button[itemId=\"saveButton\"]').click();
        //ST.grid('todo grid').selectWith('task', "test");
    });
});
