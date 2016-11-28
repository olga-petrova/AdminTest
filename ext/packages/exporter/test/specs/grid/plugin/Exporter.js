describe('Ext.grid.plugin.Exporter', function() {
    var cmp, events, ready, saveAs, saveBinaryAs;

    function onEventFired(event){
        return function(){
            events[event] = true;
        }
    }

    function makeCmp(docCfg, gridCfg){
        var store = new Ext.data.Store({
            fields: ['name', 'email', 'phone', 'age'],
            data: [
                { name: 'Lisa', email: 'lisa@simpsons.com', phone: '555-111-1224', age: 15 },
                { name: 'Bart', email: 'bart@simpsons.com', phone: '555-222-1234' , age: 17 },
                { name: 'Homer', email: 'homer@simpsons.com', phone: '555-222-1244', age: 44 },
                { name: 'Marge', email: 'marge@simpsons.com', phone: '555-222-1254', age: 42 }
            ]
        });

        events = {};
        cmp = Ext.create(Ext.apply({
            xtype: 'grid',
            title: 'Simpsons',
            store: store,
            columns: [{
                text: 'Name',
                dataIndex: 'name',
                width: 100
            },{
                text: 'Email',
                dataIndex: 'email',
                flex: 1,
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
            },{
                text: 'Phone',
                dataIndex: 'phone',
                flex: 1,
                ignoreExport: true
            },{
                text: 'Age',
                dataIndex: 'age',
                width: 50
            }],

            plugins: 'gridexporter',
            listeners: {
                beforedocumentsave: onEventFired('beforedocumentsave'),
                dataready: onEventFired('dataready'),
                documentsave: onEventFired('documentsave')
            },
            renderTo: document.body,
            width: 500,
            height: 300
        }, gridCfg));

        // temporarily disable saveAs and saveBinaryAs
        saveAs = Ext.exporter.File.saveAs;
        Ext.exporter.File.saveAs = onEventFired('saveAs');
        saveBinaryAs = Ext.exporter.File.saveBinaryAs;
        Ext.exporter.File.saveBinaryAs = onEventFired('saveBinaryAs');

        cmp.saveDocumentAs(Ext.apply({
            type: 'excel'
        }, docCfg)).then(function(){
            ready = true;
        });

    }

    function destroyCmp(){
        events = cmp = ready = Ext.destroy(cmp);
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
                        expect(cols.getAt(1).getStyle()).toEqual({
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
                        expect(cols.getAt(1).getStyle()).toEqual({
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
                        expect(cols.getAt(1).getStyle()).toEqual({
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
                        expect(cols.getAt(1).getStyle()).toEqual({
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
                        expect(cols.getAt(1).getStyle()).toEqual({
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