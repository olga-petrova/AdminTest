describe("ToDoList2.js", function() {
    it("should pass", function() {
    ST.play([
        { type: "tap", target: "button[itemId=\"addNewItemButton\"]", x: 27, y: 15 },
        { type: "type", target: "textfield[fieldLabel=\"Enter new TODO\"] => input", text: "test", caret: [0,8] },
        { type: "tap", target: "button[itemId=\"saveButton\"]", x: 43, y: 19 }
    ]);
    ST.grid('todo grid').selectWith('task', "test");
        
    });
});
