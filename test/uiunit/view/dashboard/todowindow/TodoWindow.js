describe("TODO window UI unit test suite", function() {
    var toDoWindow,
    Dash = {
        toDoWindow: function () {
            return ST.component('todowindow');    
        },
        saveButton: function () {
            return ST.button('#saveButton');
        },
        cancelButton: function () {
            return ST.button('#cancelButton');
        }
    };
    
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
        Dash.toDoWindow()
        .rendered()
        .and(function (window) {
            expect(window.el).toBeTruthy();    
        });
    });
    
    it("ToDo window should match the expected screenshot", function() {
        ST.screenshot('todowindow');
    });

        
    it('ToDo window should close on cancel button click', function (done) {
        Dash.toDoWindow()
        .rendered()
        .and(function (window) {
            window.on('close', function () {
                console.log(done);
                done();
            });
            Dash.cancelButton().click();
        });
    });  
    
    it('Save button should not be disabled initially', function () {
        expect(Dash.saveButton().enabled(400)).toBeTruthy();
        
    });
    
    it('Save button should be disabled when textfield is empty', function () {
        Dash.toDoWindow()
        .rendered()
        .and(function (window) {
            window.getViewModel().set('todoText', '');
            expect(Dash.saveButton().disabled(400)).toBeTruthy();
        });
    });
    
    
    it('ToDo window should save ToDo and close on save button click', function (done) {
        //mock toDoStore
        var toDoStore = Ext.create('Admin.store.dashboard.Todo'),
            itemsCount;
        //remember count of items when store is loaded
        toDoStore.on('load', function () {
            itemsCount = toDoStore.getCount();   
        });
        Dash.toDoWindow()
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
            Dash.saveButton().click();
        });
    });
    
});
