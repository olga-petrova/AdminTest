describe("ToDo store unit test suite", function() {
    var toDoStore, itemsCount;
    
    beforeEach(function (done) {
        toDoStore = Ext.create('Admin.store.dashboard.Todo'); 
        
        Ext.defer(done, 1000);
    });
    
    afterEach(function (done) {
        toDoStore = Ext.destroy(toDoStore);
        
        Ext.defer(done, 1000);
    });
        
    it("should be able to add new ToDo item", function() {
        var itemsCount = toDoStore.getCount();
        toDoStore.addNewToDo('new todo item');
        expect(toDoStore.getCount()).toBe(itemsCount + 1);
    });
    
    it("should not add duplicated item", function() {
        var firstItem = toDoStore.getAt(0),
            itemsCount = toDoStore.getCount();
        toDoStore.addNewToDo(firstItem.get('task'));
        expect(toDoStore.getCount()).toBe(itemsCount);
    });
    
});

/*


it("should be able to add new ToDo item", function() {
    var itemsCount = toDoStore.getCount();
    toDoStore.addNewToDo('new todo item');
    expect(toDoStore.getCount()).toBe(itemsCount + 1);
});

it("should not add duplicated item", function() {
    var firstItem = toDoStore.getAt(0),
        itemsCount = toDoStore.getCount();
    toDoStore.addNewToDo(firstItem.get('task'));
    expect(toDoStore.getCount()).toBe(itemsCount);
});

*/