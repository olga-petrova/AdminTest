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

    var store, grid, view, selModel, navModel, pivotDone, matrix,
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
        view = grid.getView();
        selModel = view.getSelectionModel();
        navModel = view.getNavigationModel();
        matrix = grid.getMatrix();
    }

    function destroyGrid(){
        Ext.destroy(grid, store);
        store = grid = view = navModel = selModel = matrix = null;
        pivotDone = false;
    }

    describe('Outline view', function() {
        beforeEach(makeGrid);
        afterEach(destroyGrid);

        // https://sencha.jira.com/browse/EXTJS-17921
        it('should allow cell to cell navigation when there are colSpans', function() {
            waitsFor(function() {
                return pivotDone;
            });

            runs(function() {
                var c0_0 = view.getCellByPosition({row:0,column:0}, true),
                    c0_2 = view.getCellByPosition({row:0,column:2}, true),
                    c1_0 = view.getCellByPosition({row:1,column:0}, true),
                    c1_1 = view.getCellByPosition({row:1,column:1}, true);

                view.focus();

                // Focus must be on cell 0,0
                expect(navModel.getPosition().getCell(true)).toBe(c0_0);

                jasmine.fireKeyEvent(c0_0, 'keydown', Ext.event.Event.DOWN);

                // Focus must be on cell 1,0
                expect(navModel.getPosition().getCell(true)).toBe(c1_0);

                jasmine.fireKeyEvent(c1_0, 'keydown', Ext.event.Event.RIGHT);

                // Focus must be on cell 1,1
                expect(navModel.getPosition().getCell(true)).toBe(c1_1);

                jasmine.fireKeyEvent(c1_1, 'keydown', Ext.event.Event.UP);

                // Focus must be on cell 0,0
                expect(navModel.getPosition().getCell(true)).toBe(c0_0);

                jasmine.fireKeyEvent(c0_0, 'keydown', Ext.event.Event.RIGHT);

                // Focus must be on cell 0,2 (0,1 is spanned out)
                expect(navModel.getPosition().getCell(true)).toBe(c0_2);

                jasmine.fireKeyEvent(c0_2, 'keydown', Ext.event.Event.LEFT);

                // Focus must be on cell 0,0
                expect(navModel.getPosition().getCell(true)).toBe(c0_0);
            });
        });

    });

    describe('Matrix calculations', function(){
        beforeEach(makeGrid);
        afterEach(destroyGrid);

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



    });
});
