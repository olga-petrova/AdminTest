describe("ToDoList1.js", function() {
    it("should pass", function() {
        ST.button('button[itemId=\"addNewItemButton\"]').rendered().click();
        ST.textField('todowindow textfield[fieldLabel=\"Enter new TODO\"]').setValue('test');
        ST.button('todowindow button[itemId=\"saveButton\"]').click();
        ST.grid('todo grid').selectWith('task', "test");
    });

});
