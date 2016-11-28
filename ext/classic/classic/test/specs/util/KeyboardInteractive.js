/* global Ext, jasmine, expect */

describe("Ext.util.KeyboardInteractive", function() {
    var Event = Ext.event.Event,
        createSpy = jasmine.createSpy,
        focusAndWait = jasmine.focusAndWait,
        waitAWhile = jasmine.waitAWhile,
        pressArrowKey = jasmine.pressArrowKey,
        fireKeyEvent = jasmine.fireKeyEvent,
        c, focusEl;
    
    function stdComponent(config) {
        return Ext.apply({
            xtype: 'component',
            renderTo: Ext.getBody(),
            width: 100,
            height: 100,
            focusable: true,
            tabIndex: 0,
            getFocusEl: function() {
                return this.el;
            },
            onKeyDefault: Ext.emptyFn
        }, config);
    }
    
    function makeComponent(config) {
        var cmpCfg = stdComponent(config);
        
        c = new Ext.Component(cmpCfg);
        
        return c;
    }
    
    afterEach(function() {
        if (c) {
            c.destroy();
        }
        
        c = null;
    });
    
    describe("config", function() {
        describe("extending", function() {
            it("should allow nulling keyMap config", function() {
                var ParentClass = Ext.define(null, {
                    extend: 'Ext.Component',
                    keyMap: {
                        ENTER: 'onKeyEnter'
                    },
                    onKeyEnter: Ext.emptyFn
                });
                
                var ChildClass = Ext.define(null, {
                    extend: ParentClass,
                    keyMap: null
                });
                
                c = new ChildClass();
                
                expect(c.getKeyMap()).toBe(null);
            });
        });
        
        describe("handling", function() {
            beforeEach(function() {
                makeComponent();
            });
            
            it("should accept binding as function", function() {
                spyOn(Ext.log, 'warn');
                
                c.setKeyMap({ UP: Ext.emptyFn });
                
                expect(Ext.log.warn).not.toHaveBeenCalled();
                
                var handlers = c.getKeyMap();
                
                expect(handlers.UP.handler).toBe(Ext.emptyFn);
            });
            
            it("should accept binding as fn name", function() {
                c.setKeyMap({ DOWN: 'onKeyDefault' });
                
                var handlers = c.getKeyMap();
                
                expect(handlers.DOWN.handler).toBe('onKeyDefault');
            });
            
            it("should throw on unknown keycode", function() {
                var err = 'Invalid kepMap key specification "FOO"';
                
                expect(function() {
                    c.setKeyMap({ FOO: 'onKeyFoo' });
                }).toThrow(err);
            });
            
            it("should throw an error on undefined binding", function() {
                expect(function() {
                    c.setKeyMap({ UP: undefined });
                }).toThrow();            
            });
            
            it("should allow disabled option", function() {
                c.setKeyMap({
                    UP: Ext.emptyFn,
                    disabled: true
                });
                
                expect(c.getKeyMap().disabled).toBe(true);
            });
        });
    });
    
    describe("keydown listener", function() {
        describe("w/o config", function() {
            beforeEach(function() {
                makeComponent();
                
                focusEl = c.getFocusEl();
            });
            
            it("should not attach listener initially", function() {
                expect(focusEl.hasListener('keydown')).toBe(false);
            });
            
            it("should attach listener on config update", function() {
                c.setKeyMap({ HOME: 'onKeyDefault' });
                
                expect(focusEl.hasListener('keydown')).toBe(true);
            });
        });
        
        describe("with config", function() {
            beforeEach(function() {
                makeComponent({
                    keyMap: {
                        target: 'focusEl',
                        LEFT: 'onKeyDefault'
                    }
                });
                
                focusEl = c.getFocusEl();
            });
        
            it("should attach listener after render", function() {
                expect(focusEl.hasListener('keydown')).toBe(true);
            });
            
            it("should not attach listener more than once", function() {
                c.setKeyMap({ RIGHT: 'onKeyDefault' });
                
                expect(focusEl.hasListeners.keydown).toBe(1);
            });
        });
    });
    
    describe("handlers", function() {
        var leftSpy, rightSpy, handleEventSpy;
        
        beforeEach(function() {
            leftSpy = createSpy('left');
            rightSpy = createSpy('right');
            
            makeComponent({
                keyMap: {
                    LEFT: 'onKeyLeft',
                    RIGHT: 'onKeyRight'
                },
                
                onKeyLeft: leftSpy,
                onKeyRight: rightSpy,
                
                renderTo: null
            });
            
            handleEventSpy = spyOn(c, 'handleEvent').andCallThrough();
            
            c.render(Ext.getBody());
        });
        
        afterEach(function() {
            leftSpy = rightSpy = null;
        });
        
        describe("resolving", function() {
            it("should resolve handler name to function", function() {

                jasmine.fireKeyEvent(c.el, 'keydown', Ext.event.Event.LEFT);
                expect(leftSpy.callCount).toBe(1);
                expect(rightSpy.callCount).toBe(0);

                jasmine.fireKeyEvent(c.el, 'keydown', Ext.event.Event.RIGHT);
                expect(leftSpy.callCount).toBe(1);
                expect(rightSpy.callCount).toBe(01);
            });
        });
        
        describe("invoking", function() {
            describe("matching a handler", function() {
                it("should invoke the handler", function() {
                    pressArrowKey(c, 'left');
                
                    runs(function() {
                        expect(leftSpy).toHaveBeenCalled();
                    });
                });
            
                it("should pass the key event", function() {
                    focusAndWait(c);
                
                    runs(function() {
                        fireKeyEvent(c.getFocusEl(), 'keydown', Event.RIGHT);
                    });
                
                    waitAWhile();
                
                    runs(function() {
                        var args = rightSpy.mostRecentCall.args,
                            ev = args[0];
                        
                        expect(ev.getKey()).toBe(Event.RIGHT);
                    });
                });
            });
            
            describe("disabled keyMap", function() {
                beforeEach(function() {
                    c.getKeyMap().disabled = true;
                });
                
                it("should not invoke the handler", function() {
                    pressArrowKey(c, 'left');
                    
                    waitForSpy(handleEventSpy);
                    
                    runs(function() {
                        expect(leftSpy).not.toHaveBeenCalled();
                    });
                });
            });
            
            describe("not matching a handler", function() {
                it("should not throw", function() {
                    focusAndWait(c);
                    
                    runs(function() {
                        expect(function() {
                            fireKeyEvent(c.getFocusEl(), 'keydown', Event.UP);
                        }).not.toThrow();
                    });
                });
            });
        });
    });
});
