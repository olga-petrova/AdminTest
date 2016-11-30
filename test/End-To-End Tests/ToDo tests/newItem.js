describe("ToDo list integration test", function() {
        
    it("should add new tem", function() {
    

    
    ST.play([
        { type: "tap", target: "button[itemId=\"addNewItemButton\"]", x: 28, y: 14 },
        { type: "type", target: "textfield[fieldLabel=\"Enter new TODO\"] => input", text: "test", caret: "0,8" },
        { type: "tap", target: "button[itemId=\"saveButton\"]", x: 29, y: 12 },
        { fn: function () {
            var grid = this.targetEl.getComponent();
            expect(grid.getStore().findRecord('task', "test")).toBeTruthy();
        }, target: "todo grid"}
        ],
        function() {
            // Optional function that's run after everything has been played
        });
    });
    
    
    
    
});
