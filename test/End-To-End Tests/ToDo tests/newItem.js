describe("ToDo list integration test", function() {
        
    it("should add new tem", function() {
    
    ST.play([
        { type: "tap", target: "button[itemId=\"addNewItemButton\"]", x: 31, y: 23 },
        { type: "type", target: "todowindow textfield", text: "New ToDo" },
        { type: "tap", target: "button[itemId=\"saveButton\"]", x: 26, y: 19 },
        { fn: function () {
            var grid = this.targetEl.getComponent();
            expect(grid.getStore().findRecord('task', "New ToDo")).toBeTruthy();
        }, target: "todo grid"}
        ],
        function() {
            // Optional function that's run after everything has been played
        });
    });
    
    
    
});
