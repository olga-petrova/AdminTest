/**
 *
 * This plugin allows the user to view all records that were aggregated for a specified cell.
 *
 * The user has to double click that cell to open the records viewer.
 *
 * If a {@link Ext.pivot.matrix.Remote Remote} matrix is used then the plugin requires
 * an url to be provided to fetch the records for a left/top keys pair.
 *
 */
Ext.define('Ext.pivot.plugin.DrillDown', {
    alternateClassName: [
        'Mz.pivot.plugin.DrillDown'
    ],

    alias: [
        'plugin.pivotdrilldown',
        'plugin.mzdrilldown'
    ],

    extend: 'Ext.AbstractPlugin',
    
    requires: [
        'Ext.pivot.Grid',
        'Ext.window.Window',
        'Ext.data.proxy.Memory',
        'Ext.data.Store',
        'Ext.toolbar.Paging'
    ],

    mixins: {
        observable: 'Ext.util.Observable'
    },
    
    /**
     * @cfg {Ext.grid.column.Column[]} [columns] Specify which columns should be visible in the grid.
     *
     * Use the same definition as for a grid column. Header and dataIndex are the most important ones.
     */
    columns:     null,
    /**
     * @cfg {Number} width Width of the viewer's window.
     */
    width:        400,
    /**
     * @cfg {Number} height Height of the viewer's window.
     */
    height:        300,
    /**
     * @cfg {Ext.data.Store} remoteStore
     * Provide either a store config or a store instance when using a {@link Ext.pivot.matrix.Remote Remote} matrix on the pivot grid.
     *
     * The store will be remotely filtered to fetch records from the server.
     */
    remoteStore:    null,
    /**
     * @cfg {String} textWindow Viewer's window title.
     */
    textWindow: 'Drill down window',
    
    /**
     *  `"both"` (the default) - The plugin is added to both grids
     *  `"top"` - The plugin is added to the containing Panel
     *  `"locked"` - The plugin is added to the locked (left) grid
     *  `"normal"` - The plugin is added to the normal (right) grid
     *
     * @private
    */
    lockableScope:  'top',
    
    init: function(grid){
        var me = this;

        //<debug>
        // this plugin is available only for the pivot grid
        if (!grid.isPivotGrid) {
            Ext.raise('This plugin is only compatible with Ext.pivot.Grid');
        }
        //</debug>

        me.pivot = grid;
        me.pivotListeners = me.pivot.on({
            pivotitemcelldblclick:      me.runPlugin,
            pivotgroupcelldblclick:     me.runPlugin,
            pivottotalcelldblclick:     me.runPlugin,
            scope:                      me,
            destroyable:                true
        });
        
        me.callParent(arguments);        
    },
    
    destroy: function(){
        var me = this;
        
        Ext.destroyMembers(me, 'view', 'pivotListeners');

        me.pivot = me.view = me.pivotListeners = me.store = null;

        me.callParent(arguments);
    },

    /**
     *
     * @param {Ext.pivot.result.Base} result
     * @private
     */
    showView: function(result){
        var me = this,
            matrix = me.pivot.getMatrix(),
            columns = me.columns || [],
            fields, store, filters;

        if(!result){
            return;
        }

        if (!me.view) {
            
            switch(matrix.type){
                case 'local':
                    fields = matrix.store.model.getFields();
                    store = Ext.create('Ext.data.Store', {
                        pageSize: 25,
                        remoteSort: true,
                        fields: Ext.clone(fields),
                        proxy: {
                            type: 'memory',
                            reader: {
                                type: 'array'
                            },
                            enablePaging: true
                        }
                    });
                    // if no columns are defined then use those defined in the pivot grid store
                    if (columns.length === 0) {
                        Ext.Array.each(fields, function (value, index, all) {
                            columns.push({
                                header: Ext.String.capitalize(value.name),
                                dataIndex: value.name
                            });
                        });
                    }
                    break;

                case 'remote':
                    store = Ext.getStore(me.remoteStore);

                    if(store){
                        store.setRemoteFilter(true);
                    }

                    //<debug>
                    if(columns.length === 0){
                        Ext.raise('No columns defined for the drill down grid!');
                    }
                    //</debug>

                    break;

                default:
                    return;
            }

            // create the window that will show the records
            me.view = Ext.create('Ext.window.Window', {
                title: me.textWindow,
                width: me.width,
                height: me.height,
                layout: 'fit',
                modal: true,
                closeAction: 'hide',
                items: [{
                    xtype: 'grid',
                    border: false,
                    viewConfig: {
                        loadMask: false
                    },
                    columns: columns,
                    store: store,
                    dockedItems: [{
                        itemId: 'idPager',
                        xtype: 'pagingtoolbar',
                        store: store,   // same store GridPanel is using
                        dock: 'bottom',
                        displayInfo: true
                    }]
                }]
            });

            me.store = store;
        }

        switch(matrix.type){
            case 'local':
                me.store.getProxy().data = result.records;
                me.store.load();
                me.view.down('#idPager').moveFirst();
                break;

            case 'remote':
                filters = Ext.Array.merge(me.getFiltersFromParams(result.getLeftAxisItem() ? result.getLeftAxisItem().data : {}), me.getFiltersFromParams(result.getTopAxisItem() ? result.getTopAxisItem().data : {}));
                me.store.clearFilter(filters.length > 0);
                me.store.addFilter(filters);
                break;

            default:
                return;
        }

        me.view.show();
    },

    runPlugin: function(params, e, eOpts){
        // do nothing if the plugin is disabled
        if(this.disabled) {
            return;
        }

        this.showView(this.pivot.getMatrix().results.get(params.leftKey, params.topKey));
    },

    getFiltersFromParams: function(obj){
        var filters = [],
            i, len, keys;

        if(Ext.isObject(obj)) {
            keys = Ext.Object.getKeys(obj);
            len = keys.length;

            for (i = 0; i < len; i++) {
                filters.push({
                    property: keys[i],
                    exactMatch: true,
                    value: obj[keys[i]]
                });
            }
        }

        return filters;
    }

});