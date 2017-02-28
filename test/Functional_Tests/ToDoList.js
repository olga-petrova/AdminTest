describe("ToDoList.js", function() {
    
    it('ToDo window should save ToDo and close on save button click', function () {
        ST.button('button[itemId=\"addNewItemButton\"]').rendered().click();
        ST.textField('todowindow textfield[fieldLabel=\"Enter new TODO\"]').setValue('test');
        ST.button('todowindow button[itemId=\"saveButton\"]').click();
        ST.grid('todo grid').selectWith('task', "test");
    });
});
