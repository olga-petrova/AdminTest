describe("ToDoList2.js", function() {
    it("should pass", function() {
    ST.play([
        { type: "tap", target: "button[itemId=\"addNewItemButton\"]", x: 24, y: 9 },
        { type: "type", target: "textfield[fieldLabel=\"Enter new TODO\"] => input", text: "test", caret: [0,8] },
        { type: "tap", target: "todowindow[reference=\"todoWindow\"]", x: 253, y: 132 },
        { type: "tap", target: "button[itemId=\"saveButton\"]", x: 54, y: 20 }
    ]);
    
        
    /*ST.play([
        { type: "tap", target: "button[itemId=\"addNewItemButton\"]", x: 18, y: 13 },
        { type: "tap", target: "textfield[fieldLabel=\"Enter new TODO\"]", x: 211, y: 16 },
        { type: "mousedown", target: "textfield[fieldLabel=\"Enter new TODO\"]", x: 203, y: 18, detail: 1 },
        { type: "mouseup", target: "textfield[fieldLabel=\"Enter new TODO\"]", x: 38, y: 26, detail: 1 },
        { type: "type", target: "textfield[fieldLabel=\"Enter new TODO\"] => input", text: "new item", caret: [0,8] },
        { type: "tap", target: "button[itemId=\"saveButton\"]", x: 22, y: 18 }
    ]);*/
    
    
        
    });
});
