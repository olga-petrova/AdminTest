/* global Ext, expect */

describe('Ext.d3.hierarchy.Pack', function () {

    if (Ext.isIE8 || Ext.isIE9 || Ext.isIE10) {
        return;
    }

    var component,
        precision = 12; // first 12 decimal points should match

    var data1 = [{ // no expanded
        text: 'R',
        children: [
            {
                text: 'R-C1',
                children: [
                    {
                        text: 'R-C1-C1'
                    },
                    {
                        text: 'R-C1-C2'
                    }
                ]
            },
            {
                text: 'R-C2'
            }
        ]
    }];

    var data2 = [{ // some expanded
        text: 'R',
        expanded: true,
        children: [
            {
                text: 'R-C1',
                expanded: false,
                children: [
                    {
                        text: 'R-C1-C1'
                    },
                    {
                        text: 'R-C1-C2'
                    }
                ]
            },
            {
                text: 'R-C2'
            }
        ]
    }];

    var data3 = [{ // all expanded, with size and alternative text
        text: 'R',
        //altText: '_R' // altText is missing on purpose here
        size: 500,
        customSize: 50,
        expanded: true,
        children: [
            {
                text: 'R-C1',
                altText: '_R-C1',
                size: 400,
                customSize: 40,
                expanded: true,
                children: [
                    {
                        text: 'R-C1-C1',
                        altText: '_R-C1-C1',
                        size: 100,
                        customSize: 10
                    },
                    {
                        text: 'R-C1-C2',
                        altText: '_R-C1-C2',
                        size: 300,
                        customSize: 30
                    }
                ]
            },
            {
                text: 'R-C2',
                altText: '_R-C2',
                size: 100,
                customSize: 10
            }
        ]
    }];

    function createPack(data, config) {
        return component = new Ext.d3.hierarchy.Pack(Ext.apply({
            renderTo: document.body,
            width: 200,
            height: 200,
            store: new Ext.data.TreeStore({
                data: Ext.clone(data)
            })
        }, config));
    }

    afterEach(function() {
        component = Ext.destroy(component);
    });

    describe('childrenFn', function () {
        it('should return children of only expanded nodes by default', function () {
            var sceneRendered;

            runs(function () {
                component = createPack(data2, {
                    listeners: {
                        scenerender: function () {
                            sceneRendered = true;
                        }
                    }
                });
            });
            waitsFor(function () {
                return sceneRendered;
            });
            runs(function () {
                expect(component.nodes.length).toEqual(4); // 3 + root node
            });
        });
    });

    describe('textFn', function () {
        it('should return correct text', function () {
            var sceneRendered,
                notFoundText = 'empty';

            var nodeText = function (component, node) {
                var data = node && node.data;
                return (data && data.altText) || notFoundText;
            };

            runs(function () {
                component = createPack(data3, {
                    nodeText: nodeText,
                    listeners: {
                        scenerender: function () {
                            sceneRendered = true;
                        }
                    }
                });
            });
            waitsFor(function () {
                return sceneRendered;
            });
            runs(function () {
                var node = component.getStore().getAt(0);
                var nodeEl = component.findNodeElement(node);
                expect(nodeEl.select('.' + component.defaultCls.label).text()).toBe(notFoundText);
                node = component.getStore().getAt(2);
                nodeEl = component.findNodeElement(node);
                expect(nodeEl.select('.' + component.defaultCls.label).text().charAt(0)).toBe('_');
            });
        });
    });

    describe('colorFn', function () {
        function normalize(color) {
            if (color.charAt(0) === '#') {
                var parts = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color),
                    r = parseInt(parts[1], 16),
                    g = parseInt(parts[2], 16),
                    b = parseInt(parts[3], 16);

                color = 'rgb(' + [r, g, b].join(', ') + ')';
            }
            return color;
        }

        it('should set correct color, should update element colors when changed', function () {
            var red = 'rgb(255, 0, 0)',
                yellow = 'rgb(255, 255, 0)',
                sceneRendered;

            runs(function () {
                component = createPack(data3, {
                    colorAxis: {
                        processor: function () {
                            return yellow;
                        }
                    },
                    listeners: {
                        scenerender: function () {
                            sceneRendered = true;
                        }
                    }
                });
            });
            waitsFor(function () {
                return sceneRendered;
            });
            runs(function () {
                var node = component.getStore().getAt(2);
                var nodeEl = component.findNodeElement(node);
                expect(normalize(nodeEl.select('circle').style('fill'))).toBe(yellow);
                component.setColorAxis({
                    processor: function () {
                        return red;
                    }
                });
                expect(normalize(nodeEl.select('circle').style('fill'))).toBe(red);
            });
        });
    });

    describe('valueFn', function () {
        it('should default to "count", i.e. all siblings have equal area', function () {
            var haveFirstRender;

            runs(function () {
                component = createPack(data3, {
                    listeners: {
                        scenerender: function () {
                            haveFirstRender = true;
                        }
                    }
                });
            });
            waitsFor(function () {
                return haveFirstRender;
            });
            runs(function () {
                var siblings = component.getStore().getAt(1).childNodes,
                    sib1 = siblings[0],
                    sib2 = siblings[1];

                expect(sib1.r).toEqual(sib2.r);
            });
        });

        it('should set radius according to "size" property of a node, if set to "size"', function () {
            var haveFirstRender;

            runs(function () {
                component = createPack(data3, {
                    nodeValue: 'size',
                    listeners: {
                        scenerender: function () {
                            haveFirstRender = true;
                        }
                    }
                });
            });
            waitsFor(function () {
                return haveFirstRender;
            });
            runs(function () {
                var siblings = component.getStore().getAt(1).childNodes,
                    sib1 = siblings[0],
                    sib2 = siblings[1];

                // area (not radius) relationship should be the same
                expect(sib1.data.size / sib2.data.size)
                    .toBeCloseTo((sib1.r * sib1.r) / (sib2.r * sib2.r), precision);
            });
        });

        it('should set circle areas properly when custom valueFn function is used', function () {
            var haveFirstRender;

            runs(function () {
                component = createPack(data3, {
                    nodeValue: function (node) {
                        return node.data.customSize;
                    },
                    listeners: {
                        scenerender: function () {
                            haveFirstRender = true;
                        }
                    }
                });
            });
            waitsFor(function () {
                return haveFirstRender;
            });
            runs(function () {
                var siblings = component.getStore().getAt(1).childNodes,
                    sib1 = siblings[0],
                    sib2 = siblings[1];

                // area (not radius) relationship should be the same
                expect(sib1.data.size / sib2.data.size)
                    .toBeCloseTo((sib1.r * sib1.r) / (sib2.r * sib2.r), precision);
            });
        });
    });

    describe('nodeClass', function () {
        it('should use proper classes on elements by default', function () {
            // "x-d3-parent", "x-d3-expanded" and "x-d3-root"
            var haveFirstRender;

            runs(function () {
                component = createPack(data2, {
                    listeners: {
                        scenerender: function () {
                            haveFirstRender = true;
                        }
                    }
                });
            });
            waitsFor(function () {
                return haveFirstRender;
            });
            runs(function () {
                var store = component.getStore(),
                    node1 = store.getRoot(),
                    node2 = store.getAt(1),
                    node3 = store.getAt(2),
                    nodeEl;

                nodeEl = component.findNodeElement(node1);
                expect(nodeEl.classed(component.defaultCls.root)).toBe(true);
                expect(nodeEl.classed(component.defaultCls.parent)).toBe(!node1.isLeaf());
                expect(nodeEl.classed(component.defaultCls.expanded)).toBe(true);
                nodeEl = component.findNodeElement(node2);
                expect(nodeEl.classed(component.defaultCls.root)).toBe(false);
                expect(nodeEl.classed(component.defaultCls.parent)).toBe(!node2.isLeaf());
                expect(nodeEl.classed(component.defaultCls.expanded)).toBe(false);
                nodeEl = component.findNodeElement(node3);
                expect(nodeEl.classed(component.defaultCls.root)).toBe(false);
                expect(nodeEl.classed(component.defaultCls.parent)).toBe(!node3.isLeaf());
                expect(nodeEl.classed(component.defaultCls.expanded)).toBe(false);
            });
        });
    });

    describe('sorter', function () {
        it('should be null by default', function () {
            createPack(data2);
            expect(component.getSorter()).toBe(null);
            Ext.destroy(component);
        });
        it('should apply to the layout', function () {
            function mySorter(nodeA, nodeB) {
                return nodeB.value - nodeA.value;
            }
            var component = createPack(data2, {
                sorter: mySorter
            });
            expect(component.getLayout().sort()).toBe(mySorter);
        });
    });

    describe('selection', function () {
        it('should fire "select" event and select correct node on first render', function () {
            var haveFirstSelection;

            runs(function () {
                component = createPack(data1, {
                    nodeChildren: function (node) {
                        return node.childNodes;
                    },
                    listeners: {
                        select: function () {
                            haveFirstSelection = true;
                        }
                    }
                });
                component.setSelection(component.getStore().getRoot());
            });
            waitsFor(function () {
                return component.sceneRect && haveFirstSelection;
            });
            runs(function () {
                expect(component.nodesGroup.select('.' + component.defaultCls.root).classed(component.defaultCls.selected)).toBe(true);
            });
        });

        it('should have no selection by default', function () {
            var haveFirstRender;

            runs(function () {
                component = createPack(data3, {
                    listeners: {
                        scenerender: function () {
                            haveFirstRender = true;
                        }
                    }
                });
            });
            waitsFor(function () {
                return haveFirstRender;
            });
            runs(function () {
                expect(component.getRenderedNodes().selectAll('.' + component.defaultCls.selected).size()).toBe(0);
            });
        });

        it('should only select rendered nodes from the bound store', function () {
            // and deselect selection, if something else was provided.
            var sceneRendered;

            runs(function () {
                component = createPack(data2, {
                    listeners: {
                        scenerender: function () {
                            sceneRendered = true;
                        }
                    }
                });
            });
            waitsFor(function () {
                return sceneRendered;
            });
            runs(function () {
                var node = component.getStore().getAt(2);
                var nodeEl = component.findNodeElement(node);
                component.setSelection(node);
                expect(nodeEl.classed(component.defaultCls.selected)).toBe(true);
                component.setSelection(null);
                expect(nodeEl.classed(component.defaultCls.selected)).toBe(false);
                component.setSelection(node);
                expect(nodeEl.classed(component.defaultCls.selected)).toBe(true);
                var store = new Ext.data.TreeStore({
                    data: Ext.clone(data2)
                });
                component.setSelection(store.getAt(1));
                expect(nodeEl.classed(component.defaultCls.selected)).toBe(false);
                expect(component.getSelection()).toBe(null);
                component.setSelection(node);
                expect(nodeEl.classed(component.defaultCls.selected)).toBe(true);
                node = component.getStore().getAt(1);
                expect(node.isExpanded()).toBe(false);
                // only children of expanded nodes are rendered by default
                component.setSelection(component.getStore().getAt(1).childNodes[0]); // not rendered = cannot be selected
                expect(nodeEl.classed(component.defaultCls.selected)).toBe(false);
                expect(component.getSelection()).toBe(null);
            });
        });

    });

});