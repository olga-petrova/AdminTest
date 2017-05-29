describe("TODO window UI unit test suite", function() {
    var toDoWindow;
    
    //create todo window
    beforeEach(function () {
        toDoWindow = Ext.create('Admin.view.dashboard.todowindow.TodoWindow');
        toDoWindow.show();
    });
    
    //destroy todo window
    afterEach(function () {
        toDoWindow = Ext.destroy(toDoWindow);
    });
    
    it('ToDo window should open', function () {
        stpo.dashboard.toDoWindow()
        .rendered()
        .and(function (window) {
            expect(window.el).toBeTruthy();    
        });
    });

        
    it('ToDo window should close on cancel button click', function (done) {
        stpo.dashboard.toDoWindow()
        .rendered()
        .and(function (window) {
            window.on('close', function () {
                done();
            });
            stpo.dashboard.cancelButton().click();
        });
    });  
    
    it('Save button should not be disabled initially', function () {
        expect(stpo.dashboard.saveButton().enabled(400)).toBeTruthy();
    });
    
    
    it('ToDo window should save ToDo and close on save button click', function (done) {
        //mock toDoStore
        var toDoStore = Ext.create('Admin.store.dashboard.Todo'),
            itemsCount;
        //remember count of items when store is loaded
        toDoStore.on('load', function () {
            itemsCount = toDoStore.getCount();   
        });
        stpo.dashboard.toDoWindow()
        .rendered()
        .and(function (window) {
            //mock ViewModel 
            window.getViewModel().set('todos', toDoStore);
            window.getViewModel().set('todoText', 'myText');
            
            //check count of items on window's close    
            window.on('close', function () {
                expect(toDoStore.getCount()).toBe(itemsCount + 1);
                toDoStore = Ext.destroy(toDoStore);
                done();
            });
            //click save button
            stpo.dashboard.saveButton().click();
        });
    });
    
});
