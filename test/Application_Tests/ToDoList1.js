describe("ToDoList1.js", function() {
    it("should pass", function() {
       stpo.dashboard.addButton().click();
       stpo.dashboard.toDoText().setValue('test');
       stpo.dashboard.saveButton().click();
       stpo.dashboard.toDoGrid().selectWith('task', "test");
    });
    
    it("ToDo window should match the expected screenshot", function() {
        ST.screenshot('todowindow');
    });

});
