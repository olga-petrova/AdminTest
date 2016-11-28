/* global Ext, xit, expect, jasmine */

describe("Ext.GlobalEvents", function() {
    describe('idle event', function() {
        var delay = Ext.isIE ? 50 : 10,
            idleFired, done;

        function onIdle() {
            idleFired = true;
        }

        beforeEach(function() {
            idleFired = false;
            done = false;
            Ext.on('idle', onIdle);
        });

        afterEach(function() {
            Ext.un('idle', onIdle);
        });

        it("should fire after DOM event handler are invoked, but before control is returned to the browser", function() {
            var element = Ext.getBody().createChild(),
                handledCount = 0;

            function expectFalse() {
                expect(idleFired).toBe(false);
                handledCount ++;
            }

            // attach a couple mousedown listeners, the idle event should fire after both
            // handlers have fired
            element.on('mousedown', expectFalse);
            element.on('mousedown', function() {
                expectFalse();
            });

            jasmine.fireMouseEvent(element, 'mousedown');

            expect(handledCount).toBe(2);
            expect(idleFired).toBe(true);

            element.destroy();
        });

        it("should fire after a JsonPProxy processes a return packet", function() {
            var store = Ext.create('Ext.data.Store', {
                proxy: {
                    type: 'jsonp',
                    reader: {
                        rootProperty: 'topics',
                        totalProperty: 'totalCount'
                    },
                    url: 'http://www.sencha.com/forum/remote_topics/index.php'
                },
                fields: ['title'],
                listeners: {
                    load: function() {
                        done = true;
                    }
                }
            });
            store.loadPage(1);
            waitsFor(function() {
                return done === true;
            });
            runs(function() {
                waits(delay);
                runs(function() {
                    expect(idleFired).toBe(true);
                    store.destroy();
                });
            });
        });

        it("should fire after a JsonP request is processed", function() {
            Ext.data.JsonP.request({
                url: 'http://www.sencha.com/forum/remote_topics/index.php?page=1&start=0&limit=100',
                callback: function() {
                    done = true;
                }
            });
            waitsFor(function() {
                return done === true;
            });
            runs(function() {
                waits(delay);
                runs(function() {
                    expect(idleFired).toBe(true);
                });
            });
        });
        
        it("should fire after an Ajax request is processed", function() {
            Ext.Ajax.request({
                url: '../../../../packages/core/test/resources/foo.json',
                callback: function() {
                    done = true;
                }
            });
            waitsFor(function() {
                return done === true;
            });
            runs(function() {
                waits(delay);
                runs(function() {
                    expect(idleFired).toBe(true);
                });
            });
        });

        it("should fire after a scheduled Task is run", function() {
            Ext.TaskManager.newTask({
                run: function(){
                    done = true;
                }, 
                repeat: 1, 
                interval: 1
            }).start();
            waitsFor(function() {
                return done === true;
            });
            runs(function() {
                waits(delay);
                runs(function() {
                    expect(idleFired).toBe(true);
                });
            });
        });
    });
    
    describe('scroll event', function() {
        var stretcher,
            scrollingPanel,
            scrolledElements = [];

        afterEach(function() {
            stretcher.destroy();
            scrollingPanel.destroy();
        });

        function onGlobalScroll(scroller) {
            // Check for duplicates because on iOS a single call to scrollBy can trigger multiple scroll events
            var element = scroller.getElement();

            if (!Ext.Array.contains(scrolledElements, element)) {
                scrolledElements.push(element);
            }
        }

        it('should fire the global scroll event whenever anything scrolls', function() {
            stretcher = Ext.getBody().createChild({
                style: 'height:10000px'
            });
            
            // Use Ext.Panel class - it will work in Classic and Modern
            scrollingPanel = new Ext.Panel({
                renderTo: document.body,
                floating: true,
                left: 0,
                top: 0,
                width: 300,
                height: 300,
                
                // Modern defaults to 'card', so explicitly use 'auto'
                layout: 'auto',
                scrollable: true,
                items: {
                    xtype: 'component',
                    style: 'height:1000px'
                }
            });

            // Record all scroll events
            Ext.on({
                scroll: onGlobalScroll
            });
            Ext.getViewportScroller().scrollBy(null, 100);

            // Wait for scroll events to fire (may be async)
            waitsFor(function() {
                return scrolledElements.length === 1 &&
                       scrolledElements[0] === Ext.scroll.Scroller.viewport.getElement();
            }, 'Scroll of document to fire through the Ext.scroll.Scroller.viewport Scroller');
            
            runs(function() {
                scrollingPanel.getScrollable().scrollBy(null, 100);
            });
            
            // Wait for scroll events to fire (may be async)
            waitsFor(function() {
                return scrolledElements.length === 2 &&
                       scrolledElements[1] === scrollingPanel.getScrollable().getElement();
            }, 'Scroll of panel to fire through the Ext.scroll.Scroller.viewport Scroller');
        });
    });
});
