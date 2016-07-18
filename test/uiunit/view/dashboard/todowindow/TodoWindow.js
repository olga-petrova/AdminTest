describe("TODO window UI unit test suite", function() {
    var toDoWindow,
    Dash = {
        saveButton: function () {
            return ST.button('#saveButton');
        },
        cancelButton: function () {
            return ST.button('#cancelButton');
        }
    };
    
    //create todo window
    beforeEach(function (done) {
        toDoWindow = Ext.create('Admin.view.dashboard.todowindow.TodoWindow');
        toDoWindow.show();

        Ext.defer(done, 500); 
    });
    
    //destroy todo window
    afterEach(function (done) {
        toDoWindow = Ext.destroy(toDoWindow);
        Ext.defer(done, 500);
    });
    
    it('ToDo window should open', function () {
        expect(toDoWindow.el).toBeTruthy();
    });
    
    it("ToDo window should match the expected screenshot", function(done) {
        ST.screenshot('todowindow', done);
    }, 30000);

        
    it('ToDo window should close on cancel button click', function (done) {
        toDoWindow.on('close', done);
        Dash.cancelButton().click();
        
    });  
    
    it('Save button should not be disabled initially', function () {
        expect(Dash.saveButton().enabled(400)).toBeTruthy();
    });
    
    it('Save button should be disabled when textfield is empty', function () {
        toDoWindow.getViewModel().set('todoText', '');
        expect(Dash.saveButton().disabled(400)).toBeTruthy();
    });
    
    
    it('ToDo window should save ToDo and close on save button click', function (done) {
        //mock toDoStore
        var toDoStore = Ext.create('Admin.store.dashboard.Todo'),
            itemsCount;
        //remember count of items when store is loaded
        toDoStore.on('load', function () {
            itemsCount = toDoStore.getCount();   
        });
        //mock ViewModel 
        toDoWindow.getViewModel().set('todos', toDoStore);
        toDoWindow.getViewModel().set('todoText', 'myText');
        //check count of items on window's close    
        toDoWindow.on('close', function () {
            expect(toDoStore.getCount()).toBe(itemsCount + 1);
            toDoStore = Ext.destroy(toDoStore);
            done();
        });
        //click save button
        Dash.saveButton().click();
    });
    
});
