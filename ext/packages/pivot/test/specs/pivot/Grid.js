/**
 * We only define here tests that apply to the Matrix classes which should be
 * common to both toolkits.
 */

describe('Ext.pivot.Grid', function() {
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

    var store, grid, pivotDone, matrix,
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

    function onPivotDone() {
        pivotDone = true;
    }

    function makeGrid() {

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
        pivotDone = false;

        grid = new Ext.pivot.Grid({
            title: 'Outline layout',
            collapsible: true,
            multiSelect: true,
            height: 350,
            width: 750,
            selModel: {
                type: 'rowmodel'
            },
            listeners: {
                pivotDone: onPivotDone
            },

            matrixConfig: {
                type: 'local',
                store: store
            },

            // Set layout type to "outline". If this config is missing then the default layout is "outline"
            viewLayoutType: 'outline',

            // Set this to false if multiple dimensions are configured on leftAxis and
            // you want to automatically expand the row groups when calculations are ready.
            startRowGroupsCollapsed: false,

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
                id:         'country',
                dataIndex:  'country',
                header:     'Country'
            }],
            renderTo: document.body
        });
        matrix = grid.getMatrix();
    }

    function destroyGrid(){
        Ext.destroy(grid, store);
        store = grid = matrix = null;
        pivotDone = false;
    }

    beforeEach(makeGrid);
    afterEach(destroyGrid);

    describe('Matrix calculations', function(){

        function checkAxisResults(item, index, len, additionalFilters){
            var keys = Ext.Object.getKeys(item.data),
                filters = Ext.Array.from(additionalFilters || []),
                i;

            store.clearFilter();

            for(i = 0; i < keys.length; i++){
                filters.push({
                    property: keys[i],
                    operator: '=',
                    value: item.data[keys[i]],
                    exactMatch: true
                });
            }
            store.addFilter(filters);

            if(item.axis.isLeftAxis) {
                expect(matrix.results.get(item.key, matrix.grandTotalKey).getValue('agg')).toBe(store.sum('value'));
            }else{
                expect(matrix.results.get(matrix.grandTotalKey, item.key).getValue('agg')).toBe(store.sum('value'));
            }
        }

        it('should apply natural sort correctly', function(){
            waitsFor(function(){
                return pivotDone;
            });

            runs(function() {
                expect(matrix.naturalSort('aaa12', 'aaa12sds')).toBe(-1);
            });
        });

        it('should calculate OK when matrix is NOT filtered', function(){
            waitsFor(function(){
                return pivotDone;
            });

            runs(function(){
                store.suspendEvents(false);

                // grand totals check
                expect(matrix.results.get(matrix.grandTotalKey, matrix.grandTotalKey).getValue('agg')).toBe(store.sum('value'));

                // row grand totals check
                matrix.leftAxis.items.each(checkAxisResults);

                // col grand totals check
                matrix.topAxis.items.each(checkAxisResults);

                store.resumeEvents();
            });
        });

        it('should calculate OK with Label filters on top axis', function(){
            grid.reconfigurePivot({
                topAxis: [{
                    id:         'country',
                    dataIndex:  'country',
                    header:     'Country',
                    filter: {
                        type: 'label',
                        operator: '=',
                        value: 'Belgium'
                    }
                }]
            });

            waitsFor(function(){
                return pivotDone;
            });

            runs(function(){
                var filters = [{
                        property: 'country',
                        operator: '=',
                        value: 'Belgium',
                        exactMatch: true
                    }],
                    checkFn = Ext.bind(checkAxisResults, this, filters, true);

                store.suspendEvents(false);

                store.clearFilter();
                store.addFilter(filters);

                // grand totals check
                expect(matrix.results.get(matrix.grandTotalKey, matrix.grandTotalKey).getValue('agg')).toBe(store.sum('value'));

                // row grand totals check
                matrix.leftAxis.items.each(checkFn);

                // col grand totals check
                matrix.topAxis.items.each(checkFn);

                store.resumeEvents();
            });
        });

        it('should calculate OK with Label filters on left axis', function(){
            grid.reconfigurePivot({
                leftAxis: [{
                    id:         'person',
                    dataIndex:  'person',
                    header:     'Person',
                    width:      80,
                    filter: {
                        type: 'label',
                        operator: '=',
                        value: 'John'
                    }
                },{
                    id:         'company',
                    dataIndex:  'company',
                    header:     'Company',
                    sortable:   false,
                    width:      80
                }]
            });

            waitsFor(function(){
                return pivotDone;
            });

            runs(function(){
                var filters = [{
                        property: 'person',
                        operator: '=',
                        value: 'John',
                        exactMatch: true
                    }],
                    checkFn = Ext.bind(checkAxisResults, this, filters, true);

                store.suspendEvents(false);

                store.clearFilter();
                store.addFilter(filters);

                // grand totals check
                expect(matrix.results.get(matrix.grandTotalKey, matrix.grandTotalKey).getValue('agg')).toBe(store.sum('value'));

                // row grand totals check
                matrix.leftAxis.items.each(checkFn);

                // col grand totals check
                matrix.topAxis.items.each(checkFn);

                store.resumeEvents();
            });
        });

        it('should calculate OK with Value filters on top axis', function(){
            var limit = 50000;

            grid.reconfigurePivot({
                topAxis: [{
                    id:         'country',
                    dataIndex:  'country',
                    header:     'Country',
                    filter: {
                        type: 'value',
                        operator: '<',
                        dimensionId: 'agg',
                        value: limit
                    }
                },{
                    id:         'year',
                    dataIndex:  'year',
                    header:     'Year'
                }]
            });

            waitsFor(function(){
                return pivotDone;
            });

            runs(function(){

                matrix.topAxis.items.each(function(item){
                    if(item.level > 0){
                        return;
                    }
                    expect(matrix.results.get(matrix.grandTotalKey, item.key).getValue('agg')).toBeLessThan(limit);
                });

            });
        });

        it('should calculate OK with Value filters on left axis', function(){
            var limit = 50000;

            grid.reconfigurePivot({
                leftAxis: [{
                    id:         'person',
                    dataIndex:  'person',
                    header:     'Person',
                    width:      80,
                    filter: {
                        type: 'value',
                        operator: '<',
                        dimensionId: 'agg',
                        value: limit
                    }
                },{
                    id:         'company',
                    dataIndex:  'company',
                    header:     'Company',
                    sortable:   false,
                    width:      80
                }]
            });

            waitsFor(function(){
                return pivotDone;
            });

            runs(function(){

                matrix.leftAxis.items.each(function(item){
                    if(item.level > 0){
                        return;
                    }
                    expect(matrix.results.get(item.key, matrix.grandTotalKey).getValue('agg')).toBeLessThan(limit);
                });
            });
        });

        it('should return correct results when adding a Value filter with "=" operator', function(){
            waitsFor(function(){
                return pivotDone;
            });

            runs(function(){
                // let's find one pivot result and extract its value
                var leftItem = matrix.leftAxis.tree[0],
                    value = matrix.results.get(leftItem.key, matrix.grandTotalKey).getValue('agg');

                pivotDone = false;

                grid.reconfigurePivot({
                    leftAxis: [{
                        id:         'person',
                        dataIndex:  'person',
                        header:     'Person',
                        width:      80,
                        filter: {
                            type: 'value',
                            operator: '=',
                            dimensionId: 'agg',
                            value: Ext.Number.toFixed(value, 2)
                        }
                    },{
                        id:         'company',
                        dataIndex:  'company',
                        header:     'Company',
                        sortable:   false,
                        width:      80
                    }]
                });

                waitsFor(function(){
                    return pivotDone;
                });

                runs(function(){

                    matrix.leftAxis.items.each(function(item){
                        if(item.value === leftItem.value){
                            expect(matrix.results.get(item.key, matrix.grandTotalKey).getValue('agg')).toBe(value);
                        }
                    });
                });
            });
        });

        it('should return correct results when adding a Value filter with ">" operator', function(){
            waitsFor(function(){
                return pivotDone;
            });

            runs(function(){
                // let's find one pivot result and extract its value
                var value = '50000';

                pivotDone = false;

                grid.reconfigurePivot({
                    leftAxis: [{
                        id:         'person',
                        dataIndex:  'person',
                        header:     'Person',
                        width:      80,
                        filter: {
                            type: 'value',
                            operator: '>',
                            dimensionId: 'agg',
                            value: value
                        }
                    },{
                        id:         'company',
                        dataIndex:  'company',
                        header:     'Company',
                        sortable:   false,
                        width:      80
                    }]
                });

                waitsFor(function(){
                    return pivotDone;
                });

                runs(function(){
                    matrix.leftAxis.items.each(function(item){
                        if(item.level === 0) {
                            expect(matrix.results.get(item.key, matrix.grandTotalKey).getValue('agg')).toBeGreaterThan(value);
                        }
                    });
                });
            });
        });


        describe('Matrix events', function() {
            //beforeEach(makeGrid);
            //afterEach(destroyGrid);

            it('should fire pivotbeforereconfigure', function(){
                var fired = false;

                grid.on({
                    pivotbeforereconfigure: function(){
                        fired = true;
                    }
                });

                grid.reconfigurePivot({
                    leftAxis: [{
                        dataIndex:  'person'
                    }]
                });

                waitsFor(function(){
                    return pivotDone;
                });

                runs(function(){
                    expect(fired).toBe(true);
                });
            });

            it('should fire pivotreconfigure', function(){
                var fired = false;

                grid.on({
                    pivotreconfigure: function(){
                        fired = true;
                    }
                });

                grid.reconfigurePivot({
                    leftAxis: [{
                        dataIndex:  'person'
                    }]
                });

                waitsFor(function(){
                    return pivotDone;
                });

                runs(function(){
                    expect(fired).toBe(true);
                });
            });

            it('should cancel reconfiguration', function(){
                var fired = false;

                grid.on({
                    pivotbeforereconfigure: function(){
                        return false;
                    },
                    pivotreconfigure: function(){
                        fired = true;
                    }
                });

                grid.reconfigurePivot({
                    leftAxis: [{
                        dataIndex:  'person'
                    }]
                });

                waitsFor(function(){
                    return pivotDone;
                });

                runs(function(){
                    expect(fired).toBe(false);
                });
            });

        });


    });
});
