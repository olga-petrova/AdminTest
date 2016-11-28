describe("Ext.grid.RowBody", function () {
    var numRecords = 5,
        fields = ['d1', 'd2', 'd3'],
        TestModel = Ext.define(null, {
            extend: 'Ext.data.Model',
            fields: fields
        }),
        TestGrid = Ext.define(null, {
            extend: 'Ext.grid.Grid',

            // This method forces a synchronous layout of the grid to make testing easier
            $testRefresh: function () {
                var container = this.container;
                this.onContainerResize(container, {height: container.element.getHeight()});
            }
        }),
        store, grid;

    function getStore() {
        var data = [], field, i, j;

        for (i = 0; i < numRecords; i++) {
            data[i] = {};
            for (j = 0; j < fields.length; j++) {
                field = fields[j];
                data[i][field] = 'foo'
            }
        }

        return new Ext.data.Store({
            model: TestModel,
            data: data
        })
    }

    function getTplGrid(config) {
        var defaults = {
            width: 300,
            height: 400,
            store: getStore(),
            columns: fields.map(function (name) {
                return {
                    dataIndex: name,
                    width: 100,
                    text: name.toUpperCase(),
                    itemId: 'col' + name
                }
            }),
            itemConfig: {
                viewModel: {},
                body: {
                    tpl: '{d1}'
                }
            }
        };

        config = Ext.apply(defaults, config);
        return new TestGrid(config);
    }

    function getWidgetGrid(config) {
        var defaults = {
            width: 300,
            height: 400,
            store: getStore(),
            columns: fields.map(function (name) {
                return {
                    dataIndex: name,
                    width: 100,
                    text: name.toUpperCase(),
                    itemId: 'col' + name
                }
            }),
            itemConfig: {
                viewModel: {},
                body: {
                    widget: {
                        xtype: 'button',
                        height: 42,
                        bind: '{record.d1}'
                    }
                }
            }
        };

        config = Ext.apply(defaults, config);
        return new TestGrid(config);
    }


    afterEach(function () {
        store = grid = Ext.destroy(grid, store);
    });


    describe("Visibility", function () {
        beforeEach(function () {
            store = getStore();
            grid = getTplGrid();

            grid.renderTo(Ext.getBody());
            grid.$testRefresh();
        });

        it("should be collapsed and hidden by default", function () {
            var row = grid.getItemAt(0),
                body = row.getBody();

            expect(row.getCollapsed()).toBe(true);
            expect(body.getHidden()).toBe(true);
            expect(body.el.isVisible()).toBe(false);
        });

        it("should set collapsed false and unhide when expanded", function () {
            var top = grid.getItemAt(0),
                body = top.getBody();

            top.expand();

            expect(top.getCollapsed()).toBe(false);
            expect(body.getHidden()).toBe(false);
            expect(body.el.isVisible()).toBe(true);
        });

        it("should call the updater when collapse/expand is called", function () {
            var top = grid.getItemAt(0),
                body = top.getBody();

            spyOn(top, 'updateCollapsed');
            top.expand();
            top.collapse();

            expect(top.updateCollapsed.calls.length).toEqual(2);
            expect(top.getCollapsed()).toBe(true);
            expect(body.getHidden()).toBe(true);
            expect(body.el.isVisible()).toBe(false);
        });

        it("should trigger grid item layout when expanded", function () {
            var top = grid.getItemAt(0);

            spyOn(grid, 'onItemHeightChange');
            top.expand();

            expect(grid.onItemHeightChange).toHaveBeenCalled();
        });
    });

    describe("Template Based Row Body", function () {
        beforeEach(function () {
            store = getStore();
            grid = getTplGrid();

            grid.renderTo(Ext.getBody());
            grid.$testRefresh();
        });

        describe("Template Based ViewModel Access", function () {
            it("should render data from the view model properly", function () {
                var row = grid.getItemAt(0),
                    body = row.getBody(),
                    inner = body.getInnerHtmlElement(),
                    html = inner.getHtml();

                expect(html).toBe('foo');
            });
        });

        describe("Template Based Row Spacing", function () {
            it("should space rows properly when RowBody is collapsed", function () {
                var count = grid.getStore().getCount(),
                    headerHeight = grid.getHeaderContainer().el.getHeight(),
                    height = grid.getItemAt(0).el.getHeight(),
                    i, y, row;

                for (i = 0; i < count; i++) {
                    row = grid.getItemAt(i);
                    y = headerHeight + (i * height);
                    expect(row.el.getY()).toBe(y);
                }
            });

            it("should space rows properly when RowBody is expanded", function () {
                var top = grid.getItemAt(0),
                    headerHeight = grid.getHeaderContainer().el.getHeight(),
                    rowHeight = top.el.getHeight(), rowBodyHeight,
                    count = grid.getStore().getCount(), i, row, y;

                top.expand();
                rowBodyHeight = top.getBody().el.getHeight();

                for (i = 1; i < count; ++i) {
                    row = grid.getItemAt(i);
                    y = headerHeight + (i * (rowHeight + rowBodyHeight));
                    expect(row.el.getY()).toBe(y);
                    row.expand();
                }
            });

            it("should space rows properly when RowBody is expanded and collapsed", function () {
                var top = grid.getItemAt(0),
                    headerHeight = grid.getHeaderContainer().el.getHeight(),
                    height = top.el.getHeight(),
                    count = grid.getStore().getCount(), i, row, y;


                for (i = 0; i < count; ++i) {
                    row = grid.getItemAt(i);
                    row.expand();
                }

                for (i = 0; i < count; ++i) {
                    row = grid.getItemAt(i);
                    row.collapse();
                    y = headerHeight + (i * height);
                    expect(row.el.getY()).toBe(y);
                }
            });
        });
    });


    describe("Widget Based Row Body", function () {
        beforeEach(function () {
            store = getStore();
            grid = getWidgetGrid();

            grid.renderTo(Ext.getBody());
            grid.$testRefresh();
        });

        describe("Widget Based ViewModel Access", function () {
            it("should render data from the view model properly", function () {
                var row = grid.getItemAt(0),
                    body = row.getBody(),
                    widget = body.getWidget(), text;


                // Update bindings for testing
                row.getViewModel().notify();
                text = widget.getText();
                expect(text).toBe('foo');
            });
        });

        describe("Widget Based Row Spacing", function () {
                it("should space rows properly when RowBody is collapsed", function () {
                    var count = grid.getStore().getCount(),
                        headerHeight = grid.getHeaderContainer().el.getHeight(),
                        height = grid.getItemAt(0).el.getHeight(),
                        i, y, row;

                    for (i = 0; i < count; i++) {
                        row = grid.getItemAt(i);
                        y = headerHeight + (i * height);
                        expect(row.el.getY()).toBe(y);
                    }
                });

                it("should space rows properly when RowBody is expanded", function () {
                    var top = grid.getItemAt(0),
                        headerHeight = grid.getHeaderContainer().el.getHeight(),
                        rowHeight = top.el.getHeight(), rowBodyHeight,
                        count = grid.getStore().getCount(), i, row, padding, y;

                    top.expand();
                    // Widget height is set to 42
                    rowBodyHeight = 42;

                    for (i = 1; i < count; ++i) {
                        row = grid.getItemAt(i);
                        padding = row.getBody().el.getPadding('tb');
                        y = headerHeight + (i * (padding + rowHeight + rowBodyHeight));
                        expect(row.el.getY()).toBe(y);
                        row.expand();
                    }
                });
        });
    });
});