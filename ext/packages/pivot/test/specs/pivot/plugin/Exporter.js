describe('Ext.pivot.plugin.Exporter', function() {
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
        i, j, saveAs, saveBinaryAs, ready, events;

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

    function onEventFired(event){
        return function(){
            events[event] = true;
        }
    }

    function makeCmp(docCfg, gridCfg) {

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
        events = {};

        grid = new Ext.pivot.Grid(Ext.apply({
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

            plugins: 'pivotexporter',

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
                width:      90,
                exportStyle: [{
                    font: {
                        italic: true
                    }
                },{
                    type: 'html',
                    alignment:{
                        horizontal: 'Right'
                    }
                }]
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
        }, gridCfg));

        // temporarily disable saveAs and saveBinaryAs
        saveAs = Ext.exporter.File.saveAs;
        Ext.exporter.File.saveAs = onEventFired('saveAs');
        saveBinaryAs = Ext.exporter.File.saveBinaryAs;
        Ext.exporter.File.saveBinaryAs = onEventFired('saveBinaryAs');

        grid.saveDocumentAs(Ext.apply({
            type: 'excel'
        }, docCfg)).then(function(){
            ready = true;
        });
    }

    function destroyCmp(){
        store = grid = matrix = events = Ext.destroy(grid, store);
        pivotDone = ready = false;
        Ext.exporter.File.saveAs = saveAs;
        Ext.exporter.File.saveBinaryAs = saveBinaryAs;
    }


    describe('exportStyle', function() {
        afterEach(destroyCmp);

        it('should match config for csv exporter', function(){
            makeCmp({
                type: 'csv'
            },{
                listeners: {
                    dataready: function(cmp, table){
                        var cols = table.getColumns();
                        expect(cols.length).toBe(3);
                        expect(cols.getAt(2).getStyle()).toEqual({
                            font: {
                                italic: true
                            }
                        });
                    }
                }
            });

            waitsFor(function(){
                return ready;
            });

            runs(function(){
                expect(1).toBe(1);
            });
        });

        it('should match config for tsv exporter', function(){
            makeCmp({
                type: 'tsv'
            },{
                listeners: {
                    dataready: function(cmp, table){
                        var cols = table.getColumns();
                        expect(cols.length).toBe(3);
                        expect(cols.getAt(2).getStyle()).toEqual({
                            font: {
                                italic: true
                            }
                        });
                    }
                }
            });

            waitsFor(function(){
                return ready;
            });

            runs(function(){
                expect(1).toBe(1);
            });
        });

        it('should match config for html exporter', function(){
            makeCmp({
                type: 'html'
            },{
                listeners: {
                    dataready: function(cmp, table){
                        var cols = table.getColumns();
                        expect(cols.length).toBe(3);
                        expect(cols.getAt(2).getStyle()).toEqual({
                            type: 'html',
                            alignment:{
                                horizontal: 'Right'
                            }
                        });
                    }
                }
            });

            waitsFor(function(){
                return ready;
            });

            runs(function(){
                expect(1).toBe(1);
            });
        });

        it('should match config for excel03 exporter', function(){
            makeCmp({
                type: 'excel03'
            },{
                listeners: {
                    dataready: function(cmp, table){
                        var cols = table.getColumns();
                        expect(cols.length).toBe(3);
                        expect(cols.getAt(2).getStyle()).toEqual({
                            font: {
                                italic: true
                            }
                        });
                    }
                }
            });

            waitsFor(function(){
                return ready;
            });

            runs(function(){
                expect(1).toBe(1);
            });
        });

        it('should match config for excel07 exporter', function(){
            makeCmp({
                type: 'excel07'
            },{
                listeners: {
                    dataready: function(cmp, table){
                        var cols = table.getColumns();
                        expect(cols.length).toBe(3);
                        expect(cols.getAt(2).getStyle()).toEqual({
                            font: {
                                italic: true
                            }
                        });
                    }
                }
            });

            waitsFor(function(){
                return ready;
            });

            runs(function(){
                expect(1).toBe(1);
            });
        });


    });

});