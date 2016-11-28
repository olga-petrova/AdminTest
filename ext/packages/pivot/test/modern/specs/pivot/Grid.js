/* global Ext, jasmine, expect */

describe('Ext.pivot.Grid.modern', function() {
    var data = [],
        items = 500,
        rand = 37,
        companies = ['Google', 'Apple', 'Dell', 'Microsoft', 'Adobe'],
        countries = ['Belgium', 'Netherlands', 'United Kingdom', 'Canada', 'United States', 'Australia'],
        persons = ['John', 'Michael', 'Mary', 'Anne', 'Robert'],
        regions = {
            "Belgium": 'Europe',
            "Netherlands": 'Europe',
            "United Kingdom": 'Europe',
            "Canada": 'North America',
            "United States": 'North America',
            "Australia": 'Australia'
        },
        randomItem = function(data){
            var k = rand % data.length;

            rand = rand * 1664525 + 1013904223;
            rand &= 0x7FFFFFFF;
            return data[k];
        },
        randomDate = function(start, end){
            return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime() ));
        },
        i, j;

    for (i = 0; i < items; i++){
        j = rand % companies;
        data.push({
            id:         i,
            company:    randomItem(companies),
            country:    randomItem(countries),
            person:     randomItem(persons),
            date:       randomDate(new Date(2012, 0, 1), new Date()),
            value:      Math.random() * 1000 + 1,
            quantity:   Math.floor(Math.random() * 30 + 1)
        });
    }

    var store, grid, container, matrix,
        pivotEvents = {},
        Sale = Ext.define(null, {
            extend: 'Ext.data.Model',

            fields: [
                {name: 'id',        type: 'int'},
                {name: 'company',   type: 'string'},
                {name: 'country',   type: 'string'},
                {name: 'person',    type: 'string'},
                {name: 'date',      type: 'date'},
                {name: 'value',     type: 'float'},
                {name: 'quantity',  type: 'float'},
                {
                    name: 'year',
                    convert: function(v, record){
                        return Ext.Date.format(record.get('date'), "Y");
                    }
                },{
                    name: 'month',
                    convert: function(v, record){
                        return parseInt(Ext.Date.format(record.get('date'), "m"), 10) - 1;
                    }
                },{
                    name: 'continent',
                    convert: function(v, record){
                        return regions[record.get('country')];
                    }
                }
            ]
        });

    function fireClick(target) {
        if (Ext.supports.TouchEvents) {
            Ext.testHelper.tap(target);
        } else {
            jasmine.fireMouseEvent(target, 'click');
        }
    }

    function fireDblClick(target) {
        if (Ext.supports.TouchEvents) {
            Ext.testHelper.tap(target);
            Ext.testHelper.tap(target);
        } else {
            jasmine.fireMouseEvent(target, 'dblclick');
        }
    }

    function getEventHandler(type){
        return function(){
            pivotEvents[type] = true;
        };
    }

    function makeGrid(gridConfig) {

        store = new Ext.data.Store({
            model: Sale,
            proxy: {
                type: 'memory',
                limitParam: null,
                data: data,
                reader: {
                    type: 'json'
                }
            },
            autoLoad: true
        });

        // Reset flag that is set when the pivot grid has processed the data and rendered
        pivotEvents = {};

        grid = new Ext.pivot.Grid(Ext.merge({
            title: 'Test pivot',
            collapsible: true,
            multiSelect: true,
            height: 350,
            width: 750,
            listeners: {
                pivotDone: getEventHandler('done'),
                pivotGroupExpand: function(matrix, type){
                    if(type === 'row') {
                        pivotEvents.groupRowExpand = true;
                    }else{
                        pivotEvents.groupColExpand = true;
                    }
                },
                pivotGroupCollapse: function(matrix, type){
                    if(type === 'row') {
                        pivotEvents.groupRowCollapse = true;
                    }else{
                        pivotEvents.groupColCollapse = true;
                    }
                },
                pivotGroupTap: getEventHandler('groupTap'),
                pivotGroupDoubleTap: getEventHandler('groupDoubleTap'),
                pivotGroupTapHold: getEventHandler('groupTapHold'),
                pivotGroupCellTap: getEventHandler('groupCellTap'),
                pivotGroupCellDoubleTap: getEventHandler('groupCellDoubleTap'),
                pivotGroupCellTapHold: getEventHandler('groupCellTapHold'),
                pivotItemTap: getEventHandler('itemTap'),
                pivotItemDoubleTap: getEventHandler('itemDoubleTap'),
                pivotItemTapHold: getEventHandler('itemTapHold'),
                pivotItemCellTap: getEventHandler('itemCellTap'),
                pivotItemCellDoubleTap: getEventHandler('itemCellDoubleTap'),
                pivotItemCellTapHold: getEventHandler('itemCellTapHold')
            },

            matrixConfig: {
                type: 'local',
                store: store
            },

            // Set layout type to "outline". If this config is missing then the default layout is "outline"
            viewLayoutType: 'outline',

            // Configure the aggregate dimensions. Multiple dimensions are supported.
            aggregate: [{
                id:         'agg',
                dataIndex:  'value',
                header:     'Sum of value',
                aggregator: 'sum',
                width:      90
            }],

            // Configure the left axis dimensions that will be used to generate the grid rows
            leftAxis: [{
                id:         'person',
                dataIndex:  'person',
                header:     'Person',
                width:      80
            },{
                id:         'company',
                dataIndex:  'company',
                header:     'Company',
                sortable:   false,
                width:      80
            }],

            /**
             * Configure the top axis dimensions that will be used to generate the columns.
             * When columns are generated the aggregate dimensions are also used. If multiple aggregation dimensions
             * are defined then each top axis result will have in the end a column header with children
             * columns for each aggregate dimension defined.
             */
            topAxis: [{
                id:         'year',
                dataIndex:  'year',
                header:     'Year'
            }, {
                id:         'month',
                dataIndex:  'month',
                header:     'Month'
            }],

            renderTo: document.body
        }, gridConfig));
        container = grid.container;
        grid.onContainerResize(container, { height: container.element.getHeight() });

        matrix = grid.getMatrix();
    }

    function destroyGrid(){
        Ext.destroy(grid, store);
        store = grid = matrix = null;
        pivotEvents = {};
    }

    describe('styling via data binding', function(){

        describe('viewModel on row level', function(){
            afterEach(function() {
                destroyGrid();
            });

            it('should style a row using a formula', function(){
                makeGrid({
                    itemConfig: {
                        viewModel: {
                            type: 'default',
                            formulas: {
                                rowStyle: function (get) {
                                    var isGrandTotal = get('record.isRowGrandTotal'),
                                        isHeader = get('record.isRowGroupHeader'),
                                        isFooter = get('record.isRowGroupTotal'),
                                        cls = '';

                                    if (isGrandTotal) {
                                        cls = 'pivotRowGrandTotal';
                                    } else if (isHeader) {
                                        cls = 'pivotRowHeader';
                                    } else if (isFooter) {
                                        cls = 'pivotRowTotal';
                                    }
                                    return cls;
                                }
                            }
                        },
                        bind: {
                            userCls: '{rowStyle}'
                        }
                    }
                });

                waitsFor(function(){
                    // Also wait for data to appear in case it comes from a binding
                    return pivotEvents.done && store.getCount();
                });

                runs(function(){
                    var row = grid.getItemAt(0);
                    row.getViewModel().notify();
                    expect(row.element.hasCls('pivotRowHeader')).toBe(true);
                });
            });

            it('should style a row using a template', function(){
                makeGrid({
                    itemConfig: {
                        viewModel: {
                            type: 'default'
                        },
                        bind: {
                            userCls: '{record.isRowGroupHeader:pick("","pivotRowHeader")}'
                        }
                    }
                });

                waitsFor(function(){
                    // Also wait for data to appear in case it comes from a binding
                    return pivotEvents.done && store.getCount();
                });

                runs(function(){
                    var row = grid.getItemAt(0);
                    row.getViewModel().notify();
                    expect(row.element.hasCls('pivotRowHeader')).toBe(true);
                });
            });

            it('should style a cell using a cell template', function(){
                makeGrid({
                    itemConfig: {
                        viewModel: {
                            type: 'default'
                        }
                    },
                    topAxisCellConfig: {
                        bind: {
                            // you can't define formulas that use `column` since `column` can't be
                            // replaced in a formula with the dynamically generated column information
                            userCls: '{column.isColGrandTotal:pick(null,"pivotCellGrandTotal")}'
                        }
                    }
                });

                waitsFor(function(){
                    // Also wait for data to appear in case it comes from a binding
                    return pivotEvents.done && store.getCount();
                });

                runs(function(){
                    var row = grid.getItemAt(0);
                    row.getViewModel().notify();
                    expect(row.cells[7].element.hasCls('pivotCellGrandTotal')).toBe(true);
                });
            });

            it('should style a cell using an aggregate bind', function(){
                makeGrid({
                    itemConfig: {
                        viewModel: {
                            type: 'default'
                        }
                    },
                    aggregate: [{
                        id:         'agg',
                        dataIndex:  'value',
                        header:     'Sum of value',
                        aggregator: 'sum',
                        width:      90,
                        cellConfig: {
                            bind: {
                                userCls: '{value:sign("pivotCellNegative","pivotCellPositive")}'
                            }
                        }
                    }]
                });

                waitsFor(function(){
                    // Also wait for data to appear in case it comes from a binding
                    return pivotEvents.done && store.getCount();
                });

                runs(function(){
                    var row = grid.getItemAt(0);
                    row.getViewModel().notify();
                    expect(row.cells[6].element.hasCls('pivotCellPositive')).toBe(true);
                });
            });

        });

        describe('viewModel on cell level', function(){
            afterEach(destroyGrid);

            it('should style a cell using a formula', function(){
                makeGrid({
                    topAxisCellConfig: {
                        viewModel: {
                            type: 'default',
                            formulas: {
                                cellStyle: function (get) {
                                    var isGrandTotal = get('record.isRowGrandTotal') || get('column.isColGrandTotal'),
                                        isHeader = get('record.isRowGroupHeader') || get('column.isColGroupTotal'),
                                        isFooter = get('record.isRowGroupTotal'),
                                        value = get('value'),
                                        cls = get('column.topAxisColumn') ? (value >= 500 ? 'pivotCellAbove500' : 'pivotCellUnder500') : '';

                                    if(isGrandTotal){
                                        cls = 'pivotCellGrandTotal';
                                    }else if(isFooter){
                                        cls = 'pivotCellGroupFooter';
                                    }else if(isHeader){
                                        cls = 'pivotCellGroupHeader';
                                    }

                                    return cls;
                                }
                            }
                        },
                        bind: {
                            userCls: '{cellStyle}'
                        }
                    }
                });

                waitsFor(function(){
                    // Also wait for data to appear in case it comes from a binding
                    return pivotEvents.done && store.getCount();
                });

                runs(function(){
                    var cell = grid.getItemAt(0).cells[7];
                    cell.getViewModel().notify();
                    expect(cell.element.hasCls('pivotCellGrandTotal')).toBe(true);
                });
            });

        });

    });

    describe('Events', function(){
        beforeEach(function() {
            makeGrid();
        });
        afterEach(function() {
            destroyGrid();
        });

        it('should fire "pivotgroupexpand" on rows', function(){
            waitsFor(function() {
                // Also wait for data to appear in case it comes from a binding
                return pivotEvents.done && store.getCount();
            });

            runs(function() {
                fireClick(grid.getItemAt(0).cells[0].element);
            });

            waitsFor(function() {
                return pivotEvents.groupRowExpand;
            });

            runs(function() {
                var result = matrix.results.get(matrix.leftAxis.tree[0].children[0].key, matrix.topAxis.tree[0].key);

                expect(pivotEvents.groupRowExpand).toBe(true);

                if (result) {
                    // check the value of an expanded cell
                    expect(result.getValue('agg')).toBe(grid.getItemAt(1).cells[2].getValue());
                }
            });
        });

        it('should fire "pivotgroupexpand" on leftAxis items', function(){
            waitsFor(function() {
                // Also wait for data to appear in case it comes from a binding
                return pivotEvents.done && store.getCount();
            });

            runs(function() {
                matrix.leftAxis.tree[0].expand();
            });

            waitsFor(function() {
                return pivotEvents.groupRowExpand;
            });

            runs(function() {
                var result = matrix.results.get(matrix.leftAxis.tree[0].children[0].key, matrix.topAxis.tree[0].key);

                expect(pivotEvents.groupRowExpand).toBe(true);

                if (result) {
                    // check the value of an expanded cell
                    expect(result.getValue('agg')).toBe(grid.getItemAt(1).cells[2].getValue());
                }
            });
        });

        it('should fire "pivotgroupexpand" on columns', function(){
            waitsFor(function() {
                // Also wait for data to appear in case it comes from a binding
                return pivotEvents.done && store.getCount();
            });

            runs(function() {
                var column = grid.getHeaderContainer().innerItems[2];

                fireClick(column.element);
            });

            waitsFor(function() {
                return pivotEvents.groupColExpand;
            });

            runs(function() {
                var column = grid.getHeaderContainer().innerItems[2],
                    topKey = column.group.children[0].key,
                    leftKey = grid.getItemAt(0).getRecordInfo().leftKey,
                    result = matrix.results.get(leftKey, topKey);

                expect(pivotEvents.groupColExpand).toBe(true);

                if (result) {
                    // check the value of an expanded cell
                    expect(result.getValue('agg')).toBe(grid.getItemAt(0).cells[2].getValue());
                }
            });
        });

        it('should fire "pivotgroupexpand" on topAxis items', function(){
            waitsFor(function() {
                // Also wait for data to appear in case it comes from a binding
                return pivotEvents.done && store.getCount();
            });

            runs(function() {
                matrix.topAxis.tree[0].expand();
            });

            waitsFor(function() {
                return pivotEvents.groupColExpand;
            });

            runs(function() {
                var result = matrix.results.get(matrix.leftAxis.tree[0].key, matrix.topAxis.tree[0].children[0].key);
                expect(pivotEvents.groupColExpand).toBe(true);

                if (result) {
                    // check the value of an expanded cell
                    expect(result.getValue('agg')).toBe(grid.getItemAt(0).cells[2].getValue());
                }
            });
        });

        it('should fire "pivotgrouptap"', function(){
            waitsFor(function(){
                // Also wait for data to appear in case it comes from a binding
                return pivotEvents.done && store.getCount();
            });

            runs(function(){
                fireClick(grid.getItemAt(0).cells[0].element);
            });

            waitsFor(function(){
                return pivotEvents.groupTap;
            });

            runs(function(){
                expect(pivotEvents.groupTap).toBe(true);
            });
        });

        it('should fire "pivotgroupdoubletap"', function(){
            waitsFor(function(){
                // Also wait for data to appear in case it comes from a binding
                return pivotEvents.done && store.getCount();
            });

            runs(function(){
                fireDblClick(grid.getItemAt(0).cells[0].element);
            });

            waitsFor(function(){
                return pivotEvents.groupDoubleTap;
            });

            runs(function(){
                expect(pivotEvents.groupDoubleTap).toBe(true);
            });
        });

        //it('should fire "pivotgrouptaphold"', function(){
        //    waitsFor(function(){
        //        // Also wait for data to appear in case it comes from a binding
        //        return pivotEvents.done && store.getCount();
        //    });
        //
        //    runs(function(){
        //        debugger;
        //        jasmine.fireMouseEvent(grid.getItemAt(0).cells[0].element, 'click', 0, 0, 2);
        //
        //        waitsFor(function(){
        //            return pivotEvents.groupTapHold;
        //        });
        //
        //        runs(function(){
        //            expect(pivotEvents.groupTapHold).toBe(true);
        //        });
        //    });
        //});

        it('should fire "pivotgroupcelltap"', function(){
            waitsFor(function(){
                // Also wait for data to appear in case it comes from a binding
                return pivotEvents.done && store.getCount();
            });

            runs(function(){
                fireClick(grid.getItemAt(0).cells[3].element);
            });

            waitsFor(function(){
                return pivotEvents.groupCellTap;
            });

            runs(function(){
                expect(pivotEvents.groupCellTap).toBe(true);
            });
        });

        it('should fire "pivotgroupcelldoubletap"', function(){
            waitsFor(function(){
                // Also wait for data to appear in case it comes from a binding
                return pivotEvents.done && store.getCount();
            });

            runs(function(){
                fireDblClick(grid.getItemAt(0).cells[3].element);
            });

            waitsFor(function(){
                return pivotEvents.groupCellDoubleTap;
            });

            runs(function(){
                expect(pivotEvents.groupCellDoubleTap).toBe(true);
            });
        });

        it('should fire "pivotitemtap"', function(){
            waitsFor(function(){
                // Also wait for data to appear in case it comes from a binding
                return pivotEvents.done && store.getCount();
            });

            runs(function(){
                fireClick(grid.getItemAt(0).cells[0].element);
            });

            waitsFor(function(){
                return pivotEvents.groupRowExpand;
            });

            runs(function(){
                fireClick(grid.getItemAt(1).cells[1].element);
            });

            waitsFor(function(){
                return pivotEvents.itemTap;
            });

            runs(function(){
                expect(pivotEvents.itemTap).toBe(true);
            });
        });

        it('should fire "pivotitemdoubletap"', function(){
            waitsFor(function(){
                // Also wait for data to appear in case it comes from a binding
                return pivotEvents.done && store.getCount();
            });

            runs(function(){
                fireClick(grid.getItemAt(0).cells[0].element);
            });

            waitsFor(function(){
                return pivotEvents.groupRowExpand;
            }, 'group row expand event');

            // Wait for the the doubletap timer to expire after the above single tap.
            // Otherwise the upcoming two taps won't be recognized as a double tap pair.
            waits(300);

            runs(function(){
                fireDblClick(grid.getItemAt(1).cells[1].element);
            });

            waitsFor(function(){
                return pivotEvents.itemDoubleTap;
            }, 'item double tap event');

            runs(function(){
                expect(pivotEvents.itemDoubleTap).toBe(true);
            });
        });

        it('should fire "pivotitemcelltap"', function(){
            waitsFor(function(){
                // Also wait for data to appear in case it comes from a binding
                return pivotEvents.done && store.getCount();
            });

            runs(function(){
                fireClick(grid.getItemAt(0).cells[0].element);
            });

            waitsFor(function(){
                return pivotEvents.groupRowExpand;
            });

            runs(function(){
                fireClick(grid.getItemAt(1).cells[3].element);
            });

            waitsFor(function(){
                return pivotEvents.itemCellTap;
            });

            runs(function(){
                expect(pivotEvents.itemCellTap).toBe(true);
            });
        });

        it('should fire "pivotitemcelldoubletap"', function(){
            waitsFor(function(){
                // Also wait for data to appear in case it comes from a binding
                return pivotEvents.done && store.getCount();
            });

            runs(function(){
                fireClick(grid.getItemAt(0).cells[0].element);
            });

            waitsFor(function(){
                return pivotEvents.groupRowExpand;
            }, 'group row expand event');

            // Wait for the the doubletap timer to expire after the above single tap.
            // Otherwise the upcoming two taps won't be recognized as a double tap pair.
            waits(300);

            runs(function(){
                fireDblClick(grid.getItemAt(1).cells[3].element);
            });

            waitsFor(function(){
                return pivotEvents.itemCellDoubleTap;
            }, 'item cell double tap event');

            runs(function(){
                expect(pivotEvents.itemCellDoubleTap).toBe(true);
            });
        });

    });


});
