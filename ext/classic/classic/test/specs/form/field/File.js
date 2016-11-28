describe("Ext.form.field.File", function(){
    var field, makeField;
    
    beforeEach(function() {
        makeField = function(cfg){
            cfg = cfg || {};
            field = new Ext.form.field.File(cfg);
        };
    });
    
    afterEach(function() {
        Ext.destroy(field);
        field = makeField = null;
    });
    
    describe("defaults", function(){
        beforeEach(function(){
            makeField();
        });
        
        it("should default to readOnly", function(){
            expect(field.readOnly).toBe(true);
        });   
        
        it("should default to have a button", function(){
            expect(field.buttonOnly).toBe(false);
        });
        
        it("should tell us it's an upload field", function(){
            expect(field.isFileUpload()).toBe(true);    
        });
    });
    
    describe("config", function() {
        it("should respect the buttonText config", function(){
            makeField({
                renderTo: Ext.getBody(),
                buttonText: 'Foo'
            });    
            expect(field.button.text).toBe('Foo');
        });
    
        it("should respect the buttonConfig config", function(){
                makeField({
                    renderTo: Ext.getBody(),
                    buttonConfig : {
                        text    : 'FooBar',
                        iconCls : 'download'
                    },
                    buttonText: 'Foo'
                });
                expect(field.button.text).toBe('FooBar');
            });
        
        it("should respect the buttonOnly config", function(){
            makeField({
                renderTo: Ext.getBody(),
                buttonOnly: true
            });    
            expect(field.inputWrap.getStyle('display')).toBe('none');
        });
        
        it("should be be able to be configured as disabled", function(){
            makeField({
                renderTo: Ext.getBody(),
                disabled: true
            });
            expect(field.inputEl.dom.disabled).toBe(true);
        });
    });
    
    // Only relevant in IE/Edge
    (Ext.isIE || Ext.isEdge ? describe : xdescribe)("rendering", function() {
        var button, guard;
        
        beforeEach(function() {
            makeField({
                renderTo: Ext.getBody()
            });
            
            button = field.button;
        });
        
        afterEach(function() {
            button = guard = null;
        });
        
        it("should render input el between tab guards", function() {
            var inputEl = field.button.fileInputEl.dom,
                beforeGuard = inputEl.previousSibling,
                afterGuard = inputEl.nextSibling;
            
            expect(beforeGuard).toHaveAttr('data-tabguard', 'true');
            expect(afterGuard).toHaveAttr('data-tabguard', 'true');
        });
        
        describe("before guard", function() {
            beforeEach(function() {
                guard = button.fileInputEl.dom.previousSibling;
            });
            
            it("should render as a span", function() {
                expect(guard.tagName).toBe('SPAN');
            });
            
            it("should have button role", function() {
                expect(guard).toHaveAttr('role', 'button');
            });
            
            it("should be aria-busy", function() {
                expect(guard).toHaveAttr('aria-busy', 'true');
            });
            
            it("should be tabbable", function() {
                expect(Ext.fly(guard).isTabbable()).toBe(true);
            });
        });
        
        describe("after guard", function() {
            beforeEach(function() {
                guard = button.fileInputEl.dom.nextSibling;
            });
            
            it("should render as a span", function() {
                expect(guard.tagName).toBe('SPAN');
            });
            
            it("should have button role", function() {
                expect(guard).toHaveAttr('role', 'button');
            });
            
            it("should be aria-busy", function() {
                expect(guard).toHaveAttr('aria-busy', 'true');
            });
            
            it("should be tabbable", function() {
                expect(Ext.fly(guard).isTabbable()).toBe(true);
            });
        });
    });
    
    describe("extraction", function() {
        it("should be able to produce a fake input when not rendered", function(){
            makeField({
                name: 'foo'
            });
            var input = field.extractFileInput();
            expect(input.name).toBe('foo');
            expect(input.type).toBe('file');
        });
    });
    
    describe("focusing and tabbing", function() {
        var focusSpy, blurSpy, beforeBtn, afterBtn;
        
        beforeEach(function() {
            focusSpy = jasmine.createSpy('focus');
            blurSpy  = jasmine.createSpy('blur');
            
            beforeBtn = new Ext.button.Button({
                renderTo: Ext.getBody(),
                id: 'beforeBtn',
                text: 'before'
            });
            
            makeField({
                renderTo: Ext.getBody(),
                listeners: {
                    focus: focusSpy,
                    blur: blurSpy
                }
            });
            
            afterBtn = new Ext.button.Button({
                renderTo: Ext.getBody(),
                id: 'afterBtn',
                text: 'after'
            });
        });
        
        afterEach(function() {
            Ext.destroy(beforeBtn, afterBtn);
            
            beforeBtn = afterBtn = focusSpy = blurSpy = null;
        });
        
        describe("focus/blur", function() {
            it("should fire focus event on field when button is focused", function() {
                jasmine.focusAndWait(field.button);
                
                waitForSpy(focusSpy);
                
                runs(function() {
                    expect(focusSpy).toHaveBeenCalled();
                });
            });
            
            it("should fire blur event on field when button is blurred", function() {
                jasmine.focusAndWait(field.button);
                
                waitForSpy(focusSpy);
                
                jasmine.focusAndWait(afterBtn);
                
                waitForSpy(blurSpy);
                
                runs(function() {
                    expect(blurSpy).toHaveBeenCalled();
                });
            });
        });
        
        // Tabbing is only an issue in IE and Edge, see comments in the code
        (Ext.isIE || Ext.isEdge ? describe : xdescribe)("tabbing", function() {
            it("should tab from beforeBtn to field", function() {
                pressTabKey(beforeBtn, true);
                
                expectFocused(field.button);
            });
            
            it("should tab from field to afterBtn", function() {
                // This is to prevent the tab guard from focusing file input
                spyOn(field.button.afterInputGuard, 'resumeEvent');
                
                pressTabKey(field.button.fileInputEl, true);
                
                expectFocused(afterBtn);
            });
            
            it("should shift-tab from afterBtn to field", function() {
                pressTabKey(afterBtn, false);
                
                expectFocused(field.button);
            });
            
            it("should shift-tab from field to beforeBtn", function() {
                // This is to prevent the tab guard from focusing file input
                spyOn(field.button.beforeInputGuard, 'resumeEvent');
                
                pressTabKey(field.button.fileInputEl, false);
                
                expectFocused(beforeBtn);
            });
        });
    });
    
    describe("reset", function() {
        beforeEach(function() {
            makeField({
                renderTo: Ext.getBody()
            });
            
            field.reset(true);
        });
        
        it("should assign button id to file input name", function() {
            expect(field.button.fileInputEl.dom.name).toBe(field.button.id);
        });
        
        it("should reassign ariaEl to new file input el", function() {
            expect(field.button.ariaEl).toBe(field.button.fileInputEl);
        });
        
        // Order of elements is only relevant in IE/Edge
        (Ext.isIE || Ext.isEdge ? it : xit)("should place new input between tab guards", function() {
            var inputEl = field.button.fileInputEl.dom,
                beforeGuard = inputEl.previousSibling,
                afterGuard = inputEl.nextSibling;
            
            expect(beforeGuard).toHaveAttr('data-tabguard', 'true');
            expect(afterGuard).toHaveAttr('data-tabguard', 'true');
        });
    });
});
