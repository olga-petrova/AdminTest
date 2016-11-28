describe('Ext.d3.hierarchy.partition.Sunburst', function () {

    if (Ext.isIE8 || Ext.isIE9 || Ext.isIE10) {
        return;
    }

    var precision = 12; // first 12 decimal points should match

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

    function createSunburst(data, config) {
        return new Ext.d3.hierarchy.partition.Sunburst(Ext.apply({
            renderTo: document.body,
            nodeZoomTransition: false,
            nodeSelectTransition: false,
            width: 200,
            height: 200,
            store: new Ext.data.TreeStore({
                data: Ext.clone(data)
            })
        }, config));
    }

    describe('childrenFn', function () {
        it('should return children of only expanded nodes by default', function () {
            var component, sceneRendered;

            runs(function () {
                component = createSunburst(data2, {
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
                Ext.destroy(component);
            });
        });
    });

    describe('nodeText', function () {
        it('should return correct text', function () {
            var component, sceneRendered,
                notFoundText = 'empty';

            var nodeText = function (component, node) {
                var data = node && node.data;
                return (data && data.altText) || notFoundText;
            };

            runs(function () {
                component = createSunburst(data3, {
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
                Ext.destroy(component);
            });
        });
    });

    describe('colorAxis', function () {
        function normalize(color) {
            if (color.charAt(0) === '#') {
                var parts = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color),
                    r = parseInt(parts[1], 16),
                    g = parseInt(parts[2], 16),
                    b = parseInt(parts[3], 16);

                color = 'rgb(' + [r, g, b].join(', ') + ')'
            }
            return color;
        }

        it('should set correct color, should update element colors when changed', function () {
            var red = 'rgb(255, 0, 0)',
                yellow = 'rgb(255, 255, 0)',
                component, sceneRendered;

            runs(function () {
                component = createSunburst(data3, {
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
                expect(normalize(nodeEl.select('path').style('fill'))).toBe(yellow);
                component.setColorAxis({
                    processor: function () {
                        return red;
                    }
                });
                expect(normalize(nodeEl.select('path').style('fill'))).toBe(red);
                Ext.destroy(component);
            });
        });
    });

    describe('valueFn', function () {
        it('should default to "count", i.e. all siblings have equal area', function () {
            var component, haveFirstRender;

            runs(function () {
                component = createSunburst(data3, {
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

                expect(sib1.dx).toEqual(sib2.dx);
                expect(sib1.dy).toEqual(sib2.dy);
                Ext.destroy(component);
            });
        });

        it('should set angle and radius according to "size" property of a node, if set to "size"', function () {
            var component, haveFirstRender;

            runs(function () {
                component = createSunburst(data3, {
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

                expect(sib1.data.size / sib2.data.size).toBeCloseTo(sib1.dx / sib2.dx, precision);
                expect(sib1.y).toBeCloseTo(sib2.y, precision);
                expect(sib1.dy).toBeCloseTo(sib2.dy, precision);

                Ext.destroy(component);
            });
        });

        it('should set angle and raduis properly when custom valueFn function is used', function () {
            var component, haveFirstRender;

            runs(function () {
                component = createSunburst(data3, {
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

                expect(sib1.data.size / sib2.data.size).toBeCloseTo(sib1.dx / sib2.dx, precision);
                expect(sib1.y).toBeCloseTo(sib2.y, precision);
                expect(sib1.dy).toBeCloseTo(sib2.dy, precision);

                Ext.destroy(component);
            });
        });
    });

    describe('nodeClass', function () {
        it('should use proper classes on elements by default', function () {
            // "x-d3-parent", "x-d3-expanded" and "x-d3-root"
            var component, haveFirstRender;

            runs(function () {
                component = createSunburst(data2, {
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

                Ext.destroy(component);
            });
        });
    });

    describe('sorter', function () {
        it('should apply to the layout', function () {
            function mySorter(nodeA, nodeB) {
                return nodeB.value - nodeA.value;
            }
            var component = createSunburst(data2, {
                sorter: mySorter
            });
            expect(component.getLayout().sort()).toBe(mySorter);
            Ext.destroy(component);
        });
    });

    describe('selection', function () {
        it('should fire "select" event and select correct node on first render', function () {
            var component, haveFirstSelection;

            runs(function () {
                component = createSunburst(data1, {
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
                Ext.destroy(component);
            });
        });

        it('should have no selection by default', function () {
            var component, haveFirstRender;

            runs(function () {
                component = createSunburst(data3, {
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
                Ext.destroy(component);
            });
        });

        it('should only select rendered nodes from the bound store', function () {
            // and deselect selection, if something else was provided.
            var component, sceneRendered;

            runs(function () {
                component = createSunburst(data2, {
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
                Ext.destroy(component);
            });
        });

    });

});