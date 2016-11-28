/**
 *
 * The pivot grid helps you analyze your data.
 *
 * Calculations can be done either in your browser using a {@link Ext.pivot.matrix.Local Local}
 * matrix or remotely on the server using a {@link Ext.pivot.matrix.Remote Remote} matrix.
 *
 * Example usage:
 *
 *      {
 *          xtype:  'pivotgrid',
 *          matrixConfig: {
 *              type: 'local',
 *              store: 'yourStoreId'    // or a store instance
 *          },
 *          leftAxis: [{
 *              dataIndex: 'country',
 *              direction: 'DESC',
 *              header: 'Countries'
 *              width: 150
 *          }],
 *          topAxis: [{
 *              dataIndex: 'year',
 *              direction: 'ASC'
 *          }],
 *          aggregate: [{
 *              dataIndex: 'value',
 *              header: 'Total',
 *              aggregator: 'sum',
 *              width: 120
 *          }]
 *      }
 *
 *
 */
Ext.define('Ext.pivot.Grid', {
    extend: 'Ext.grid.Panel',

    alternateClassName: [
        'Mz.pivot.Grid',
        'Mz.pivot.Table'
    ],

    xtype: [
        'pivotgrid',
        'mzpivotgrid'
    ],
    
    requires: [
        'Ext.pivot.matrix.Local',
        'Ext.pivot.matrix.Remote',
        'Ext.pivot.feature.PivotView',
        'Ext.data.ArrayStore'
    ],
    
    subGridXType:       'gridpanel',
    isPivotGrid:        true,

    /**
     * @cfg {Array} columns
     * @hide
     * Has no effect on a pivot grid
     */

    /**
     * @cfg {Ext.data.Store} store
     * If {@link #matrixConfig} is not configured and store is set then pivot grid will use a {@link Ext.pivot.matrix.Local Local}
     * matrix which does all calculations in the browser.
     */

    /**
     * @cfg {Object} matrixConfig Define here matrix specific configuration.
     *
     */
    matrixConfig:       null,
    
    /**
     * @cfg {Boolean} enableLoadMask Set this on false if you don't want to see the loading mask.
     */
    enableLoadMask:     true,

    /**
     * @cfg {Boolean} enableLocking Set this on false if you don't want to lock the left axis columns.
     */
    enableLocking:      false,
    
    /**
     * @cfg {Boolean} enableColumnSort Set this on false if you don't want to allow column sorting
     * in the pivot grid generated columns.
     */
    enableColumnSort:   true,

    /**
     * @cfg {Boolean} columnLines Set this on false if you don't want to show the column lines.
     */
    columnLines:        true,

    /**
     * @cfg {String} viewLayoutType Type of layout used to display the pivot data.
     * Possible values: outline, compact.
     */
    viewLayoutType:             'outline',

    /**
     * @cfg {String} rowSubTotalsPosition Possible values: first, none, last
     */
    rowSubTotalsPosition:       'first',

    /**
     * @cfg {String} rowGrandTotalsPosition Possible values: first, none, last
     */
    rowGrandTotalsPosition:     'last',

    /**
     * @cfg {String} colSubTotalsPosition Possible values: first, none, last
     */
    colSubTotalsPosition:       'last',

    /**
     * @cfg {String} colGrandTotalsPosition Possible values: first, none, last
     */
    colGrandTotalsPosition:     'last',

    /**
     * @cfg {String} textTotalTpl Configure the template for the group total. (i.e. '{name} ({rows.length} items)')
     * @cfg {String}           textTotalTpl.groupField         The field name being grouped by.
     * @cfg {String}           textTotalTpl.name               Group name
     * @cfg {Ext.data.Model[]} textTotalTpl.rows               An array containing the child records for the group being rendered.
     */
    textTotalTpl:               'Total ({name})',

    /**
     * @cfg {String} textGrandTotalTpl Configure the template for the grand total.
     */
    textGrandTotalTpl:          'Grand total',

    /**
     * @cfg {Ext.pivot.dimension.Item[]} leftAxis Define the left axis used by the grid. Each item of the array
     * is a configuration object used to instantiate an {@link Ext.pivot.dimension.Item Item}.
     *
     * Example:
     *
     *      leftAxis: [{
     *          width:      80,         // column width in the grid
     *          dataIndex:  'person',   // field used for extracting data from the store
     *          header:     'Persons',  // column title
     *          direction:  'ASC'       // sort values ascending
     *      },{
     *          width:      90,
     *          dataIndex:  'quarter',
     *          header:     'Quarter'
     *      },{
     *          width:      90,
     *          dataIndex:  'product',
     *          header:     'Products',
     *          sortable:   false
     *      }]
     *
     */
    leftAxis:           null,

    /**
     * @cfg {Ext.pivot.dimension.Item[]} topAxis Define the top axis used by the pivot grid. Each item of the array
     * is a configuration object used to instantiate an {@link Ext.pivot.dimension.Item Item}.
     *
     * Example:
     *
     *      topAxis: [{
     *          dataIndex:  'city',     // field used for extracting data from the store
     *          direction:  'ASC'       // sort values ascending
     *          renderer: function(v){
     *              return v;           // do your own stuff here
     *          }                       // this renderer is used to format the value of top axis labels
     *      }]
     *
     *
     */
    topAxis:            null,

    /**
     * @cfg {Ext.pivot.dimension.Item[]} aggregate Define the fields you want to aggregate in the pivot grid.
     * You can have one or multiple fields. Each item of the array
     * is a configuration object used to instantiate an {@link Ext.pivot.dimension.Item Item}.
     *
     * Example:
     *
     *      aggregate: [{
     *          dataIndex:  'value',        // what field is aggregated
     *          header:     'Total',        // column title
     *          aggregator: 'sum',          // function used for aggregating
     *          align:      'right',        // grid cell alignment
     *          width:      100,            // column width
     *          renderer:   '0'             // grid cell renderer
     *      },{
     *          measure:    'quantity',
     *          header:     'Quantity',
     *          aggregator: function(records, measure, matrix, rowGroupKey, colGroupKey){
     *              // provide your own aggregator function
     *              return records.length;
     *          },
     *          align:      'right',
     *          width:      80,
     *          renderer: function(v){
     *              return v; // grid cell renderer
     *          }
     *      }]
     *
     *
     */
    aggregate:          null,
    
    /**
     * @cfg {String} clsGroupTotal CSS class assigned to the group totals.
     */
    clsGroupTotal:      Ext.baseCSSPrefix + 'pivot-grid-group-total',

    /**
     * @cfg {String} clsGrandTotal CSS class assigned to the grand totals.
     */
    clsGrandTotal:      Ext.baseCSSPrefix + 'pivot-grid-grand-total',
    
    /**
     * @cfg {Boolean} startRowGroupsCollapsed Should the row groups be expanded on first init?
     *
     */
    startRowGroupsCollapsed: true,
    
    /**
     * @cfg {Boolean} startColGroupsCollapsed Should the col groups be expanded on first init?
     *
     */
    startColGroupsCollapsed: true,
    
    /**
     * @cfg {Boolean} showZeroAsBlank Should 0 values be displayed as blank?
     *
     */
    showZeroAsBlank: false,
    
    /**
     * @cfg stateEvents
     * @inheritdoc Ext.state.Stateful#cfg-stateEvents
     * @localdoc By default the following stateEvents are added:
     * 
     *  - {@link #event-resize} - _(added by Ext.Component)_
     *  - {@link #event-collapse} - _(added by Ext.panel.Panel)_
     *  - {@link #event-expand} - _(added by Ext.panel.Panel)_
     *  - {@link #event-columnresize} - _(added by Ext.panel.Table)_
     *  - {@link #event-columnmove} - _(added by Ext.panel.Table)_
     *  - {@link #event-columnhide} - _(added by Ext.panel.Table)_
     *  - {@link #event-columnshow} - _(added by Ext.panel.Table)_
     *  - {@link #event-sortchange} - _(added by Ext.panel.Table)_
     *  - {@link #event-filterchange} - _(added by Ext.panel.Table)_
     *  - {@link #event-groupchange} - _(added by Ext.panel.Table)_
     *  - {@link #event-pivotgroupexpand}
     *  - {@link #event-pivotgroupcollapse}
     *  - {@link #event-pivotdone}
     */
    stateEvents: [
        'pivotgroupexpand', 'pivotgroupcollapse', 'pivotdone'
    ],

    groupHeaderCollapsedCls:    Ext.baseCSSPrefix + 'pivot-grid-group-header-collapsed',
    groupHeaderCollapsibleCls:  Ext.baseCSSPrefix + 'pivot-grid-group-header-collapsible',
    groupCls:                   Ext.baseCSSPrefix + 'pivot-grid-group',

    relayedMatrixEvents: [
        'beforereconfigure', 'reconfigure',
        'start', 'progress', 'done', 'modelbuilt', 'columnsbuilt', 'recordbuilt',
        'buildtotals', 'storebuilt', 'groupexpand', 'groupcollapse',
        'beforerequest', 'requestexception'
    ],

    config: {
        matrix: null
    },

    /**
     * @private
     */
    initComponent : function(){
        var me = this;
        
        me.columns = [];

        me.preInitialize();
        me.callParent(arguments);
        me.postInitialize();
    },
    
    /***
     * @private
     *
     */
    preInitialize: function(){
        var me = this;

        me.features = [{
            id:                 'group',
            ftype:              'pivotview',
            summaryRowCls:      me.clsGroupTotal,
            grandSummaryRowCls: me.clsGrandTotal
        }];

        me.addCls(Ext.baseCSSPrefix + 'pivot-grid');

        if(me.store){
            me.originalStore = me.store;
        }
        
        // create a grid store that will be reconfigured whenever the matrix store changes
        me.store = Ext.create('Ext.data.ArrayStore', {
            fields: []
        });
        
        me.enableColumnMove = false;
    },
    
    /**
     * @private
     */
    postInitialize: function(){
        var me = this,
            matrixConfig = {},
            headerListener = {
                headerclick:    me.onHeaderClick,
                scope:          me,
                destroyable:    true
            };
        
        if(me.enableLocking){
            me.lockedHeaderCtListeners = me.getView().lockedView.getHeaderCt().on(headerListener);
            me.headerCtListeners = me.getView().normalView.getHeaderCt().on(headerListener);
        }else{
            me.headerCtListeners = me.getView().getHeaderCt().on(headerListener);
        }

        /**
         * Fires before the matrix is reconfigured.
         *
         * Return false to stop reconfiguring the matrix.
         *
         * @event pivotbeforereconfigure
         * @param {Ext.pivot.matrix.Base} matrix Reference to the Matrix object
         * @param {Object} config Object used to reconfigure the matrix
         */

        /**
         * Fires when the matrix is reconfigured.
         *
         * @event pivotreconfigure
         * @param {Ext.pivot.matrix.Base} matrix Reference to the Matrix object
         * @param {Object} config Object used to reconfigure the matrix
         */

        /**
         * Fires when the matrix starts processing the records.
         *
         * @event pivotstart
         * @param {Ext.pivot.matrix.Base} matrix Reference to the Matrix object
         */

        /**
         * Fires during records processing.
         *
         * @event pivotprogress
         * @param {Ext.pivot.matrix.Base} matrix Reference to the Matrix object
         * @param {Integer} index Current index of record that is processed
         * @param {Integer} total Total number of records to process
         */

        /**
         * Fires when the matrix finished processing the records
         *
         * @event pivotdone
         * @param {Ext.pivot.matrix.Base} matrix Reference to the Matrix object
         */

        /**
         * Fires after the matrix built the store model.
         *
         * @event pivotmodelbuilt
         * @param {Ext.pivot.matrix.Base} matrix Reference to the Matrix object
         * @param {Ext.data.Model} model The built model
         */

        /**
         * Fires after the matrix built the columns.
         *
         * @event pivotcolumnsbuilt
         * @param {Ext.pivot.matrix.Base} matrix Reference to the Matrix object
         * @param {Array} columns The built columns
         */

        /**
         * Fires after the matrix built a pivot store record.
         *
         * @event pivotrecordbuilt
         * @param {Ext.pivot.matrix.Base} matrix Reference to the Matrix object
         * @param {Ext.data.Model} record The built record
         */

        /**
         * Fires before grand total records are created in the pivot store.
         * Push additional objects to the array if you need to create additional grand totals.
         *
         * @event pivotbuildtotals
         * @param {Ext.pivot.matrix.Base} matrix Reference to the Matrix object
         * @param {Array} totals Array of objects that will be used to create grand total records in the pivot store. Each object should have:
         * @param {String} totals.title Name your grand total
         * @param {Object} totals.values Values used to generate the pivot store record
         */

        /**
         * Fires after the matrix built the pivot store.
         *
         * @event pivotstorebuilt
         * @param {Ext.pivot.matrix.Base} matrix Reference to the Matrix object
         * @param {Ext.data.Store} store The built store
         */

        /**
         * Fires when a pivot group is expanded. Could be a row or col pivot group.
         *
         * The same event is fired when all groups are expanded but no group param is provided.
         *
         * @event pivotgroupexpand
         * @param {Ext.pivot.matrix.Base} matrix Reference to the Matrix object
         * @param {String} type  Either 'row' or 'col'
         * @param {Ext.pivot.axis.Item} group The axis item
         */

        /**
         * Fires when a pivot group is collapsed. Could be a row or col pivot group.
         *
         * The same event is fired when all groups are collapsed but no group param is provided.
         *
         * @event pivotgroupcollapse
         * @param {Ext.pivot.matrix.Base} matrix Reference to the Matrix object
         * @param {String} type  Either 'row' or 'col'
         * @param {Ext.pivot.axis.Item} group The axis item
         */

        /**
         * Fires when a mouse click is detected on a pivot group element.
         * The pivot group element is the one that belongs to the columns generated for the left axis dimensions.
         *
         * Return false if you want to prevent expanding/collapsing that group.
         *
         * @event pivotgroupclick
         * @param {Object} params Object with following configuration
         * @param {Ext.pivot.Grid} params.grid Pivot grid instance
         * @param {Ext.view.Table} params.view Grid view
         * @param {HTMLElement} params.cellEl The target of the event
         * @param {String} params.leftKey Key of the left axis item
         * @param {Ext.pivot.axis.Item} params.leftItem Left axis item
         * @param {String} params.columnId Id of the column header
         * @param {Ext.grid.column.Column} params.column Column header object
         * @param {Ext.event.Event} e Event object
         */

        /**
         * Fires when a mouse double click is detected on a pivot group element.
         * The pivot group element is the one that belongs to the columns generated for the left axis dimensions.
         *
         * @event pivotgroupdblclick
         * @param {Object} params Object with following configuration
         * @param {Ext.pivot.Grid} params.grid Pivot grid instance
         * @param {Ext.view.Table} params.view Grid view
         * @param {HTMLElement} params.cellEl The target of the event
         * @param {String} params.leftKey Key of the left axis item
         * @param {Ext.pivot.axis.Item} params.leftItem Left axis item
         * @param {String} params.columnId Id of the column header
         * @param {Ext.grid.column.Column} params.column Column header object
         * @param {Ext.event.Event} e Event object
         */

        /**
         * Fires when a mouse right click is detected on a pivot group element.
         * The pivot group element is the one that belongs to the columns generated for the left axis dimensions.
         *
         * @event pivotgroupcontextmenu
         * @param {Object} params Object with following configuration
         * @param {Ext.pivot.Grid} params.grid Pivot grid instance
         * @param {Ext.view.Table} params.view Grid view
         * @param {HTMLElement} params.cellEl The target of the event
         * @param {String} params.leftKey Key of the left axis item
         * @param {Ext.pivot.axis.Item} params.leftItem Left axis item
         * @param {String} params.columnId Id of the column header
         * @param {Ext.grid.column.Column} params.column Column header object
         * @param {Ext.event.Event} e Event object
         */

        /**
         * Fires when a mouse click is detected on a pivot group cell.
         * The pivot group cell is the one that belongs to the columns generated for the top axis dimensions.
         *
         * @event pivotgroupcellclick
         * @param {Object} params Object with following configuration
         * @param {Ext.pivot.Grid} params.grid Pivot grid instance
         * @param {Ext.view.Table} params.view Grid view
         * @param {HTMLElement} params.cellEl The target of the event
         * @param {String} params.leftKey Key of the left axis item
         * @param {Ext.pivot.axis.Item} params.leftItem Left axis item
         * @param {String} params.topKey Key of the top axis item
         * @param {Ext.pivot.axis.Item} params.topItem Top axis item
         * @param {String} params.dimensionId Id of the aggregate dimension
         * @param {String} params.columnId Id of the column header
         * @param {Ext.grid.column.Column} params.column Column header object
         * @param {Ext.event.Event} e Event object
         */

        /**
         * Fires when a mouse double click is detected on a pivot group cell.
         * The pivot group cell is the one that belongs to the columns generated for the top axis dimensions.
         *
         * @event pivotgroupcelldblclick
         * @param {Object} params Object with following configuration
         * @param {Ext.pivot.Grid} params.grid Pivot grid instance
         * @param {Ext.view.Table} params.view Grid view
         * @param {HTMLElement} params.cellEl The target of the event
         * @param {String} params.leftKey Key of the left axis item
         * @param {Ext.pivot.axis.Item} params.leftItem Left axis item
         * @param {String} params.topKey Key of the top axis item
         * @param {Ext.pivot.axis.Item} params.topItem Top axis item
         * @param {String} params.dimensionId Id of the aggregate dimension
         * @param {String} params.columnId Id of the column header
         * @param {Ext.grid.column.Column} params.column Column header object
         * @param {Ext.event.Event} e Event object
         */

        /**
         * Fires when a mouse right click is detected on a pivot group cell.
         * The pivot group cell is the one that belongs to the columns generated for the top axis dimensions.
         *
         * @event pivotgroupcellcontextmenu
         * @param {Object} params Object with following configuration
         * @param {Ext.pivot.Grid} params.grid Pivot grid instance
         * @param {Ext.view.Table} params.view Grid view
         * @param {HTMLElement} params.cellEl The target of the event
         * @param {String} params.leftKey Key of the left axis item
         * @param {Ext.pivot.axis.Item} params.leftItem Left axis item
         * @param {String} params.topKey Key of the top axis item
         * @param {Ext.pivot.axis.Item} params.topItem Top axis item
         * @param {String} params.dimensionId Id of the aggregate dimension
         * @param {String} params.columnId Id of the column header
         * @param {Ext.grid.column.Column} params.column Column header object
         * @param {Ext.event.Event} e Event object
         */

        /**
         * Fires when a mouse click is detected on a pivot item element.
         * The pivot item element is the one that belongs to the columns generated for the left axis dimensions.
         *
         * @event pivotitemclick
         * @param {Object} params Object with following configuration
         * @param {Ext.pivot.Grid} params.grid Pivot grid instance
         * @param {Ext.view.Table} params.view Grid view
         * @param {HTMLElement} params.cellEl The target of the event
         * @param {String} params.leftKey Key of the left axis item
         * @param {Ext.pivot.axis.Item} params.leftItem Left axis item
         * @param {String} params.columnId Id of the column header
         * @param {Ext.grid.column.Column} params.column Column header object
         * @param {Ext.event.Event} e Event object
         */

        /**
         * Fires when a mouse double click is detected on a pivot item element.
         * The pivot item element is the one that belongs to the columns generated for the left axis dimensions.
         *
         * @event pivotitemdblclick
         * @param {Object} params Object with following configuration
         * @param {Ext.pivot.Grid} params.grid Pivot grid instance
         * @param {Ext.view.Table} params.view Grid view
         * @param {HTMLElement} params.cellEl The target of the event
         * @param {String} params.leftKey Key of the left axis item
         * @param {Ext.pivot.axis.Item} params.leftItem Left axis item
         * @param {String} params.columnId Id of the column header
         * @param {Ext.grid.column.Column} params.column Column header object
         * @param {Ext.event.Event} e Event object
         */

        /**
         * Fires when a mouse right click is detected on a pivot item element.
         * The pivot item element is the one that belongs to the columns generated for the left axis dimensions.
         *
         * @event pivotitemcontextmenu
         * @param {Object} params Object with following configuration
         * @param {Ext.pivot.Grid} params.grid Pivot grid instance
         * @param {Ext.view.Table} params.view Grid view
         * @param {HTMLElement} params.cellEl The target of the event
         * @param {String} params.leftKey Key of the left axis item
         * @param {Ext.pivot.axis.Item} params.leftItem Left axis item
         * @param {String} params.columnId Id of the column header
         * @param {Ext.grid.column.Column} params.column Column header object
         * @param {Ext.event.Event} e Event object
         */

        /**
         * Fires when a mouse click is detected on a pivot item cell.
         * The pivot item cell is the one that belongs to the columns generated for the top axis dimensions.
         *
         * @event pivotitemcellclick
         * @param {Object} params Object with following configuration
         * @param {Ext.pivot.Grid} params.grid Pivot grid instance
         * @param {Ext.view.Table} params.view Grid view
         * @param {HTMLElement} params.cellEl The target of the event
         * @param {String} params.leftKey Key of the left axis item
         * @param {Ext.pivot.axis.Item} params.leftItem Left axis item
         * @param {String} params.topKey Key of the top axis item
         * @param {Ext.pivot.axis.Item} params.topItem Top axis item
         * @param {String} params.dimensionId Id of the aggregate dimension
         * @param {String} params.columnId Id of the column header
         * @param {Ext.grid.column.Column} params.column Column header object
         * @param {Ext.event.Event} e Event object
         */

        /**
         * Fires when a mouse double click is detected on a pivot item cell.
         * The pivot item cell is the one that belongs to the columns generated for the top axis dimensions.
         *
         * @event pivotitemcelldblclick
         * @param {Object} params Object with following configuration
         * @param {Ext.pivot.Grid} params.grid Pivot grid instance
         * @param {Ext.view.Table} params.view Grid view
         * @param {HTMLElement} params.cellEl The target of the event
         * @param {String} params.leftKey Key of the left axis item
         * @param {Ext.pivot.axis.Item} params.leftItem Left axis item
         * @param {String} params.topKey Key of the top axis item
         * @param {Ext.pivot.axis.Item} params.topItem Top axis item
         * @param {String} params.dimensionId Id of the aggregate dimension
         * @param {String} params.columnId Id of the column header
         * @param {Ext.grid.column.Column} params.column Column header object
         * @param {Ext.event.Event} e Event object
         */

        /**
         * Fires when a mouse right click is detected on a pivot item cell.
         * The pivot item cell is the one that belongs to the columns generated for the top axis dimensions.
         *
         * @event pivotitemcellcontextmenu
         * @param {Object} params Object with following configuration
         * @param {Ext.pivot.Grid} params.grid Pivot grid instance
         * @param {Ext.view.Table} params.view Grid view
         * @param {HTMLElement} params.cellEl The target of the event
         * @param {String} params.leftKey Key of the left axis item
         * @param {Ext.pivot.axis.Item} params.leftItem Left axis item
         * @param {String} params.topKey Key of the top axis item
         * @param {Ext.pivot.axis.Item} params.topItem Top axis item
         * @param {String} params.dimensionId Id of the aggregate dimension
         * @param {String} params.columnId Id of the column header
         * @param {Ext.grid.column.Column} params.column Column header object
         * @param {Ext.event.Event} e Event object
         */

        /**
         * Fires when a mouse click is detected on a pivot grand total element.
         * The pivot grand total element is the one that belongs to the columns generated for the left axis dimensions.
         *
         * @event pivottotalclick
         * @param {Object} params Object with following configuration
         * @param {Ext.pivot.Grid} params.grid Pivot grid instance
         * @param {Ext.view.Table} params.view Grid view
         * @param {HTMLElement} params.cellEl The target of the event
         * @param {String} params.leftKey Key of the left axis item
         * @param {String} params.columnId Id of the column header
         * @param {Ext.grid.column.Column} params.column Column header object
         * @param {Ext.event.Event} e Event object
         */

        /**
         * Fires when a mouse double click is detected on a pivot grand total element.
         * The pivot grand total element is the one that belongs to the columns generated for the left axis dimensions.
         *
         * @event pivottotaldblclick
         * @param {Object} params Object with following configuration
         * @param {Ext.pivot.Grid} params.grid Pivot grid instance
         * @param {Ext.view.Table} params.view Grid view
         * @param {HTMLElement} params.cellEl The target of the event
         * @param {String} params.leftKey Key of the left axis item
         * @param {String} params.columnId Id of the column header
         * @param {Ext.grid.column.Column} params.column Column header object
         * @param {Ext.event.Event} e Event object
         */

        /**
         * Fires when a mouse right click is detected on a pivot grand total element.
         * The pivot grand total element is the one that belongs to the columns generated for the left axis dimensions.
         *
         * @event pivottotalcontextmenu
         * @param {Object} params Object with following configuration
         * @param {Ext.pivot.Grid} params.grid Pivot grid instance
         * @param {Ext.view.Table} params.view Grid view
         * @param {HTMLElement} params.cellEl The target of the event
         * @param {String} params.leftKey Key of the left axis item
         * @param {String} params.columnId Id of the column header
         * @param {Ext.grid.column.Column} params.column Column header object
         * @param {Ext.event.Event} e Event object
         */

        /**
         * Fires when a mouse click is detected on a pivot grand total cell.
         * The pivot total cell is the one that belongs to the columns generated for the top axis dimensions.
         *
         * @event pivottotalcellclick
         * @param {Object} params Object with following configuration
         * @param {Ext.pivot.Grid} params.grid Pivot grid instance
         * @param {Ext.view.Table} params.view Grid view
         * @param {HTMLElement} params.cellEl The target of the event
         * @param {String} params.leftKey Key of the left axis item
         * @param {String} params.topKey Key of the top axis item
         * @param {String} params.dimensionId Id of the aggregate dimension
         * @param {String} params.columnId Id of the column header
         * @param {Ext.grid.column.Column} params.column Column header object
         * @param {Ext.event.Event} e Event object
         */

        /**
         * Fires when a mouse double click is detected on a pivot grand total cell.
         * The pivot total cell is the one that belongs to the columns generated for the top axis dimensions.
         *
         * @event pivottotalcelldblclick
         * @param {Object} params Object with following configuration
         * @param {Ext.pivot.Grid} params.grid Pivot grid instance
         * @param {Ext.view.Table} params.view Grid view
         * @param {HTMLElement} params.cellEl The target of the event
         * @param {String} params.leftKey Key of the left axis item
         * @param {String} params.topKey Key of the top axis item
         * @param {String} params.dimensionId Id of the aggregate dimension
         * @param {String} params.columnId Id of the column header
         * @param {Ext.grid.column.Column} params.column Column header object
         * @param {Ext.event.Event} e Event object
         */

        /**
         * Fires when a mouse double click is detected on a pivot grand total cell.
         * The pivot total cell is the one that belongs to the columns generated for the top axis dimensions.
         *
         * @event pivottotalcellcontextmenu
         * @param {Object} params Object with following configuration
         * @param {Ext.pivot.Grid} params.grid Pivot grid instance
         * @param {Ext.view.Table} params.view Grid view
         * @param {HTMLElement} params.cellEl The target of the event
         * @param {String} params.leftKey Key of the left axis item
         * @param {String} params.topKey Key of the top axis item
         * @param {String} params.dimensionId Id of the aggregate dimension
         * @param {String} params.columnId Id of the column header
         * @param {Ext.grid.column.Column} params.column Column header object
         * @param {Ext.event.Event} e Event object
         */

        /**
         * Available only when using a {@link Ext.pivot.matrix.Remote Remote} matrix.
         * Fires before requesting data from the server side.
         * Return false if you don't want to make the Ajax request.
         *
         * @event pivotbeforerequest
         * @param {Ext.pivot.matrix.Base} matrix Reference to the Matrix object
         * @param {Object} params Params sent by the Ajax request
         */

        /**
         * Available only when using a {@link Ext.pivot.matrix.Remote Remote} matrix.
         * Fires if there was any Ajax exception or the success value in the response was false.
         *
         * @event pivotrequestexception
         * @param {Ext.pivot.matrix.Base} matrix Reference to the Matrix object
         * @param {Object} response The Ajax response object
         */

        Ext.apply(matrixConfig, {
            leftAxis:               me.leftAxis,
            topAxis:                me.topAxis,
            aggregate:              me.aggregate,
            showZeroAsBlank:        me.showZeroAsBlank,
            textTotalTpl:           me.textTotalTpl,
            textGrandTotalTpl:      me.textGrandTotalTpl,
            viewLayoutType:         me.viewLayoutType,
            rowSubTotalsPosition:   me.rowSubTotalsPosition,
            rowGrandTotalsPosition: me.rowGrandTotalsPosition,
            colSubTotalsPosition:   me.colSubTotalsPosition,
            colGrandTotalsPosition: me.colGrandTotalsPosition
        });
        
        Ext.applyIf(matrixConfig, me.matrixConfig || {});
        Ext.applyIf(matrixConfig, {
            type: 'local'
        });

        me.setMatrix(matrixConfig);
    },
    
    destroy: function(){
        var me = this;

        me.setMatrix(null);
        Ext.destroy(me.headerCtListeners, me.lockedHeaderCtListeners);
        Ext.destroy(me.originalStore);
        me.headerCtListeners = me.lockedHeaderCtListeners = null;
        me.originalStore = me.pivotColumns = null;
        
        me.callParent(arguments);
        
        Ext.destroy(me.store);
        me.store = null;
    },

    applyMatrix: function(newMatrix, oldMatrix){
        Ext.destroy(oldMatrix);

        if(newMatrix == null){
            return newMatrix;
        }

        if(newMatrix && newMatrix.isPivotMatrix){
            newMatrix.cmp = this;
            return newMatrix;
        }

        Ext.applyIf(newMatrix, {
            type: 'local'
        });
        newMatrix.cmp = this;
        // just a bit of hardcoding for old version compatibility
        if(newMatrix.type == 'local' && this.originalStore){
            Ext.applyIf(newMatrix, {
                store: this.originalStore
            });
        }

        return Ext.Factory.pivotmatrix(newMatrix);
    },

    updateMatrix: function(matrix, oldMatrix){
        var me = this;

        Ext.destroy(oldMatrix, me.matrixListeners, me.matrixRelayedListeners);
        me.matrixRelayedListeners = me.matrixListeners = null;

        if(matrix) {
            me.matrixListeners = me.matrix.on({
                cleardata: me.onMatrixClearData,
                start: me.onMatrixProcessStart,
                progress: me.onMatrixProcessProgress,
                done: me.onMatrixDataReady,
                groupexpand: me.onMatrixGroupExpandCollapse,
                groupcollapse: me.onMatrixGroupExpandCollapse,
                scope: me,
                destroyable: true
            });

            me.matrixRelayedListeners = me.relayEvents(me.matrix, me.relayedMatrixEvents, 'pivot');
        }
    },
    
    afterRender: function(){
        this.reconfigurePivot();
        
        this.callParent(arguments);
    },
    
    /**
     * Refresh the view.
     *
     * @private
     */
    refreshView: function(){
        var me = this;

        if(me.destroyed || me.destroying){
            return;
        }

        me.store.fireEvent('pivotstoreremodel', me);
    },

    /**
     * @private
     */
    updateHeaderContainerColumns: function(group){
        var me = this,
            view = this.getView(),
            headerCt = view.normalView ? view.normalView.getHeaderCt() : view.getHeaderCt(),
            i = 0,
            cols, index, ownerCt, item, column;

        if(group) {
            // let's find the first column that matches this group
            // that will be our new columns insertion point
            column = me.getColumnForGroup(headerCt.items, group);
            if(column.found) {
                ownerCt = column.item.ownerCt;
                index = column.index;

                while (i < ownerCt.items.length) {
                    item = ownerCt.items.getAt(i);
                    if (item.group == group) {
                        Ext.destroy(item);
                    } else {
                        i++;
                    }
                }

                cols = Ext.clone(me.pivotColumns);
                me.preparePivotColumns(cols);
                cols = me.getVisiblePivotColumns(me.prepareVisiblePivotColumns(cols), group);
                cols = ownerCt.insert(index, cols);
                // let's focus the first inserted column now
                if (cols && cols.length) {
                    cols[0].focus();
                }
            }
        }else{
            // we probably have to expand/collapse all group columns
            cols = Ext.clone(me.pivotColumns);
            me.preparePivotColumns(cols);
            me.reconfigure(undefined, cols);
        }
    },

    getColumnForGroup: function(items, group){
        var length = items.length,
            ret = {
                found:  false,
                index:  -1,
                item:   null
            },
            i, item;

        // let's find the first column that matches this group
        // that will be our new columns insertion point
        for(i = 0; i < length; i++){
            item = items.getAt(i);
            if(item.group == group){
                ret.found = true;
                ret.index = i;
                ret.item = item;
            }else if(item.items){
                ret = this.getColumnForGroup(item.items, group);
            }
            if(ret.found){
                break;
            }
        }

        return ret;
    },

    /**
     * @private
     *
     */
    onMatrixClearData: function(){
        var me = this;
        
        me.store.removeAll(true);
        if(!me.expandedItemsState){
            me.lastColumnsState = null;
        }
        me.sortedColumn = null;
    },
    
    /**
     * @private
     *
     */
    onMatrixProcessStart: function(){
        if (this.enableLoadMask) {
            this.setLoading(true);
        }
    },
    
    /**
     * @private
     *
     */
    onMatrixProcessProgress: function(matrix, index, length){
        var me = this,
            percent = ((index || 0.1) * 100)/(length || 0.1),
            pEl;
        
        if(me.loadMask){
            if(me.loadMask.msgTextEl){
                pEl = me.loadMask.msgTextEl;
            }else if(me.loadMask.msgEl){
                pEl = me.loadMask.msgEl;
            }

            if(pEl){
                pEl.update(Ext.util.Format.number(percent, '0')  + '%');
            }
        }
    },
    
    /**
     * @private
     *
     */
    onMatrixDataReady: function(){
        var me = this,
            cols = me.matrix.getColumnHeaders(),
            stateApplied = false;
        
        if (me.enableLoadMask) {
            me.setLoading(false);
        }
        
        if(me.expandedItemsState){
            me.matrix.leftAxis.items.each(function(item){
                if(Ext.Array.indexOf(me.expandedItemsState['rows'], item.key) >= 0){
                    item.expanded = true;
                    stateApplied = true;
                }
            });
            
            me.matrix.topAxis.items.each(function(item){

                if(Ext.Array.indexOf(me.expandedItemsState['cols'], item.key) >= 0){
                    item.expanded = true;
                    stateApplied = true;
                }
            });
            
            if(stateApplied){
                delete me.expandedItemsState;
            }
            
        }else{
            me.doExpandCollapseTree(me.matrix.leftAxis.getTree(), !me.startRowGroupsCollapsed);
            me.doExpandCollapseTree(me.matrix.topAxis.getTree(), !me.startColGroupsCollapsed);
        }

        me.pivotColumns = Ext.clone(cols);
        cols = Ext.clone(me.pivotColumns);

        me.preparePivotColumns(cols);
        me.restorePivotColumnsState(cols);

        cols = me.prepareVisiblePivotColumns(cols);
        me.reconfigure(undefined, cols);
        
        if(!Ext.isEmpty(me.sortedColumn)){
            me.matrix.leftAxis.sortTreeByField(me.sortedColumn.dataIndex, me.sortedColumn.direction);
        }
        
        me.store.fireEvent('pivotstoreremodel', me);

        if(!Ext.isEmpty(me.sortedColumn)){
            me.updateColumnSortState(me.sortedColumn.dataIndex, me.sortedColumn.direction);
        }

    },

    /**
     * @private
     */
    onMatrixGroupExpandCollapse: function(matrix, type, item){
        if(type == 'col'){
            this.updateHeaderContainerColumns(item);
        }
    },

    /**
     * Extract from all visible pivot columns only those that match the respective top axis group
     *
     * @param columns
     * @param group
     * @returns {Array}
     *
     * @private
     */
    getVisiblePivotColumns: function(columns, group){
        var ret = [],
            len = columns.length,
            i, column;

        for(i = 0; i < len; i++){
            column = columns[i];
            if(column.group == group){
                ret.push(column);
            }

            if(column.columns) {
                ret = Ext.Array.merge(ret, this.getVisiblePivotColumns(column.columns, group));
            }
        }

        return ret;
    },

    /**
     * Extract from all generated pivot columns only those that are visible
     *
     * @param columns
     * @returns {Array}
     *
     * @private
     */
    prepareVisiblePivotColumns: function(columns){
        var len = columns.length,
            ret = [],
            i, column, valid;

        for(i = 0; i < len; i++){
            column = columns[i];
            if(!column.hidden){
                ret.push(column);
            }

            if(column.columns){
                column.columns = this.prepareVisiblePivotColumns(column.columns);
            }
        }

        return ret;
    },

    /**
     *
     * Prepare columns delivered by the Matrix to be used inside the grid panel
     *
     * @param columns
     *
     * @private
     */
    preparePivotColumns: function(columns){
        var me = this,
            defaultColConfig = {
                menuDisabled:   true,
                sortable:       false,
                lockable:       false
            },
            colCount = columns.length,
            i, column;
        
        for(i = 0; i < colCount; i++){
            column = columns[i];
            column.cls = column.cls || '';
            
            Ext.apply(column, defaultColConfig);
            
            if(column.leftAxis){
                column.locked = me.enableLocking;
            }//else leave it as it is
            
            if(column.subTotal){
                column.cls = column.tdCls = me.clsGroupTotal;
            }
            if(column.grandTotal){
                column.cls = column.tdCls = me.clsGrandTotal;
            }

            if(column.group && column.xgrouped){
                if(column.group.expanded){
                    if(!column.subTotal){
                        column.cls += (Ext.isEmpty(column.cls) ? '' : ' ') + me.groupHeaderCollapsibleCls;
                    }
                }else{
                    if(column.subTotal){
                        column.cls += (Ext.isEmpty(column.cls) ? '' : ' ') + me.groupHeaderCollapsibleCls + ' ' + me.groupHeaderCollapsedCls;
                    }
                }
                if(column.subTotal){
                    column.text = column.group.expanded ? column.group.getTextTotal() : Ext.String.format('<span class="' + this.groupCls + '">{0}</span>', column.group.name);
                }else if(column.group){
                    column.text = Ext.String.format('<span class="' + this.groupCls + '">{0}</span>', column.group.name);
                }
                column.xexpandable = column.subTotal ? !column.group.expanded : column.group.expanded;
                if ((!column.group.expanded && !column.subTotal) || (column.group.expanded && column.subTotal && this.getMatrix().colSubTotalsPosition == 'none')) {
                    column.hidden = true;
                }
            }

            if(Ext.isEmpty(column.columns)){
                if(column.dimension){
                    column.renderer = column.dimension ? column.dimension.getRenderer() : false;
                    column.formatter = column.dimension ? column.dimension.getFormatter() : false;
                    column.scope = column.dimension ? column.dimension.scope : null;
                    column.align = column.dimension.align;
                    if(column.dimension.flex > 0){
                        column.flex = column.flex || column.dimension.flex;
                    }else{
                        column.width = column.width || column.dimension.width;
                    }
                }
            }else{
                column.focusable = true;
                column.enableFocusableContainer = true;
                me.preparePivotColumns(column.columns);
            }
        }
    },

    /**
     * If you want to reconfigure the pivoting parameters then use this function.
     * The config object is used to reconfigure the matrix object.
     *
     * This function can't be used to change the matrix type (ie from {@link Ext.pivot.matrix.Local local} to
     * {@link Ext.pivot.matrix.Remote remote}).
     *
     * @param {Ext.pivot.matrix.Base} config Configuration object used to reconfigure the pivot matrix
     */
    reconfigurePivot: function(config){
        var me = this,
            props = Ext.clone(me.getStateProperties()),
            i;
        
        props.push('startRowGroupsCollapsed', 'startColGroupsCollapsed', 'showZeroAsBlank');
        
        config = config || {};
        
        for(i = 0; i < props.length; i++){
            if(!config.hasOwnProperty(props[i])){
                if(me[props[i]]){
                    config[props[i]] = me[props[i]];
                }
            }else{
                me[props[i]] = config[props[i]];
            }
        }

        me.getMatrix().reconfigure(config);
    },
    
    /**
     * Returns the matrix object that does all calculations
     * @returns {Ext.pivot.matrix.Base}
     *
     */
    getMatrix: function(){
        return this.matrix;
    },
    
    /**
     * Collapse or expand the Matrix tree items.
     *
     * @private
     */
    doExpandCollapseTree: function(tree, expanded){
        var i;
        
        for(i = 0; i < tree.length; i++){
            tree[i].expanded = expanded;
            if(tree[i].children){
                this.doExpandCollapseTree(tree[i].children, expanded);
            }
        }
    },

    /**
     *
     *   Expand or collapse the specified group.
     *   If no "state" is provided then toggle the expanded property
     *
     * @private
     */
    doExpandCollapse: function(type, groupId, state, includeChildren){
        var matrix = this.getMatrix(),
            item;
        
        if(!matrix){
            // nothing to do
            return;
        }
        
        item = (type == 'row' ? matrix.leftAxis : matrix.topAxis)['findTreeElement']('key', groupId);
        if(!item){
            return;
        }

        item = item.node;
        state = Ext.isDefined(state) ? state : !item.expanded;

        if(state){
            item.expand(includeChildren);
        }else{
            item.collapse(includeChildren);
        }
    },

    setHeaderGroupVisibility: function(column){
        var i, len, col, columns;

        if(column.xgrouped) {
            // if it's a subtotal then change the column text depending on the group expanded
            if (column.subTotal) {
                column.setText(column.group.expanded ? column.group.getTextTotal() : Ext.String.format('<span class="' + this.groupCls + '">{0}</span>', column.group.name));
                if (!column.group.expanded) {
                    column.addCls(this.groupHeaderCollapsibleCls);
                    column.addCls(this.groupHeaderCollapsedCls);
                } else {
                    column.removeCls(this.groupHeaderCollapsibleCls);
                    column.removeCls(this.groupHeaderCollapsedCls);
                }
            } else {
                column.setText(Ext.String.format('<span class="' + this.groupCls + '">{0}</span>', column.group.name));
                column.addCls(this.groupHeaderCollapsibleCls);
            }

            column.xexpandable = column.subTotal ? !column.group.expanded : column.group.expanded;

            if ((!column.group.expanded && !column.subTotal) || (column.group.expanded && column.subTotal && this.getMatrix().colSubTotalsPosition == 'none')) {
                column.hide();
                return;
            }
        }

        column.show();
        column.items.each(this.setHeaderGroupVisibility, this);
    },

    /**
     * Expand the specified left axis item
     *
     * @param {String} leftAxisItemKey Key of the left axis item
     * @param {Boolean} includeChildren Expand the entire children tree below this item
     */
    expandRow: function(leftAxisItemKey, includeChildren){
        this.doExpandCollapse('row', leftAxisItemKey, true, includeChildren);
    },
    
    /**
     * Collapse the specified left axis item
     *
     * @param {String} leftAxisItemKey Key of the left axis item
     * @param {Boolean} includeChildren Collapse the entire children tree below this item
     */
    collapseRow: function(leftAxisItemKey, includeChildren){
        this.doExpandCollapse('row', leftAxisItemKey, false, includeChildren);
    },
    
    /**
     * Expand the specified top axis item
     *
     * @param {String} topAxisItemKey Key of the top axis item
     * @param {Boolean} includeChildren Expand the entire children tree below this item
     */
    expandCol: function(topAxisItemKey, includeChildren){
        this.doExpandCollapse('col', topAxisItemKey, true, includeChildren);
    },
    
    /**
     * Collapse the specified top axis item
     *
     * @param {String} topAxisItemKey Key of the top axis item
     * @param {Boolean} includeChildren Collapse the entire children tree below this item
     */
    collapseCol: function(topAxisItemKey, includeChildren){
        this.doExpandCollapse('col', topAxisItemKey, false, includeChildren);
    },
    
    /**
     * Expand all groups.
     *
     */
    expandAll: function(){
        this.expandAllColumns();
        this.expandAllRows();
    },
    
    /**
     * Expand all row groups
     *
     */
    expandAllRows: function(){
        this.getMatrix().leftAxis.expandAll();
    },
    
    /**
     * Expand all column groups
     *
     */
    expandAllColumns: function(){
        this.getMatrix().topAxis.expandAll();
    },
    
    /**
     * Collapse all groups.
     *
     */
    collapseAll: function(){
        this.collapseAllRows();
        this.collapseAllColumns();
    },
    
    /**
     * Collapse all row groups
     *
     */
    collapseAllRows: function(){
        this.getMatrix().leftAxis.collapseAll();
    },
    
    /**
     * Collapse all column groups
     *
     */
    collapseAllColumns: function(){
        this.getMatrix().topAxis.collapseAll();
    },

    /**
     * Set a new store to pivot. This function is also used by the model binding in ExtJS 5.x.
     */
    setStore: function(store){
        this.reconfigurePivot({
            store: store
        });
    },
    
    /**
     *     Returns the original store with the data to process.
     *    @returns {Ext.data.Store}
     */
    getStore: function(){
        var me = this,
            matrix = me.getMatrix();
        
        return ( (matrix instanceof Ext.pivot.matrix.Local) ? matrix.store : me.originalStore ) || me.store;
    },
    
    /**
     *    Returns the pivot store with the aggregated values
     *    @returns {Ext.data.Store}
     */
    getPivotStore: function(){
        return this.store;
    },
    
    /**
     * Returns the top axis item used to generate the specified column.
     *
     * @param column {Ext.grid.column.Column}
     */
    getTopAxisItem: function(column){
        var me = this,
            matrix = me.getMatrix(),
            columns = matrix.getColumns(),
            key, i;
        
        if(!column){
            return null;
        }
        
        for(i = 0; i < columns.length; i++){
            if(columns[i].name === column.dataIndex){
                key = columns[i].col;
                break;
            }
        }
        
        return Ext.isEmpty(key) ? null : matrix.topAxis.items.getByKey(key);
    },
    
    /**
     * Returns the left axis item used to generate the specified record.
     *
     * @param record {Ext.data.Model}
     */
    getLeftAxisItem: function(record){
        var me = this,
            view = me.getView(),
            info, feature;
        
        if(!record){
            return null;
        }
        
        view = view.normalView || view;
        feature = view.getFeature('group');
        if(!feature){
            return null;
        }
        
        info = feature.dataSource.storeInfo[record.internalId];
        
        return info ? me.getMatrix().leftAxis.items.getByKey(info.leftKey) : null;
    },
    
    /**
     * @private
     */
    onHeaderClick: function(ct, column, e){
        var me = this, 
            sortState = (column.sortState ? (column.sortState == 'ASC' ? 'DESC' : 'ASC') : 'ASC');

        if (e) {
            e.stopEvent();
        }

        if(!column.xexpandable) {
            if(!me.enableColumnSort){
                return;
            }

            if((column.leftAxis || column.topAxis) && !Ext.isEmpty(column.dataIndex)){
                // sort the results when a dataIndex column was clicked
                if(me.getMatrix().leftAxis.sortTreeByField(column.dataIndex, sortState )){
                    me.refreshView();
                    me.updateColumnSortState(column, sortState);
                }
            }

            return false;
        }

        me.doExpandCollapse('col', column.key);

        return false;
    },
    
    updateColumnSortState: function(column, sortState){
        if (Ext.isString(column)) {
            column = this.down('[dataIndex="' + column + '"]');
        }
        
        if(!column){
            return;
        }

        // we need to create a dummy sorter object to be able to change the column styling
        column.setSortState(new Ext.util.Sorter({direction: sortState, property: 'dummy'}));
        column.sortState = sortState;

        this.sortedColumn = {
            dataIndex:  column.dataIndex,
            direction:  sortState
        };
    },

    
    getStateProperties: function(){
        return ['viewLayoutType', 'rowSubTotalsPosition', 'rowGrandTotalsPosition', 'colSubTotalsPosition', 'colGrandTotalsPosition', 'aggregate', 'leftAxis', 'topAxis', 'enableColumnSort', 'sortedColumn'];
    },
    
    /**
     * Applies the saved state of the pivot grid
     */
    applyState: function(state){
        var me = this,
            props = me.getStateProperties(),
            i;
        
        for(i = 0; i < props.length; i++){
            if(state[props[i]]){
                me[props[i]] = state[props[i]];
            }
        }
        
        if(state['expandedItems']){
            me.expandedItemsState = state['expandedItems'];
        }
        
        me.lastColumnsState = state['pivotcolumns'] || {};
        
        if(me.rendered){
            me.reconfigurePivot();
        }
    },
    
    /**
     *    Get the current state of the pivot grid.
     *     Be careful that the stateful feature won't work correctly in this cases:
     *
     *    - if you provide an aggregator function to the aggregate item then this won't be serialized.
     *        You could extend {@link Ext.pivot.Aggregators Aggregators} to add your own function
     *
     *    - if you provide a renderer function then this won't be serialized. You need to provide a formatting string instead.
     */
    getState: function(){
        var me = this,
            state = {},
            props = me.getStateProperties(),
            i;
        
        for(i = 0; i < props.length; i++){
            state[props[i]] = me[props[i]];
        }
        
        // save the state of all expanded axis groups
        state['expandedItems'] = {
            cols:   [],
            rows:   []
        };
        
        me.matrix.leftAxis.items.each(function(item){
            if(item.expanded){
                state['expandedItems']['rows'].push(item.key);
            }
        });
        
        me.matrix.topAxis.items.each(function(item){
            if(item.expanded){
                state['expandedItems']['cols'].push(item.key);
            }
        });
        
        // to be able to restore the width/flex of the left axis columns we need the IDs
        me.matrix.leftAxis.dimensions.each(function(item, index){
            state['leftAxis'][index]['id'] = item.getId();
        });
        
        state['pivotcolumns'] = me.getPivotColumnsState();
        
        return state;
    },
    
    /**
     * @private
     */
    getPivotColumnsState: function(){
        var me = this,
            i, cols;
        
        if(!me.lastColumnsState){
            cols = me.getDataIndexColumns(me.getMatrix().getColumnHeaders());
            me.lastColumnsState = {};
            
            for(i = 0; i < cols.length; i++){
                if(cols[i].dataIndex){
                    me.lastColumnsState[cols[i].dataIndex] = {
                        width:  cols[i].width,
                        flex:   cols[i].flex || 0
                    };
                }
            }
        }
        
        cols = me.getView().getGridColumns();
        for(i = 0; i < cols.length; i++){
            if(cols[i].dataIndex){
                me.lastColumnsState[cols[i].dataIndex] = {
                    width:  cols[i].rendered ? cols[i].getWidth() : cols[i].width,
                    flex:   cols[i].flex || 0
                };
            }
        }
        
        return me.lastColumnsState;
    },

    /**
     * @private
     */
    getDataIndexColumns: function(columns){
        var cols = [], i;
        
        for(i = 0; i < columns.length; i++){
            if(columns[i].dataIndex){
                cols.push(columns[i].dataIndex);
            }else if (Ext.isArray(columns[i].columns)){
                cols = Ext.Array.merge(cols, this.getDataIndexColumns(columns[i].columns));
            }
        }
        
        return cols;
    },
    
    /**
     * @private
     */
    restorePivotColumnsState: function(columns){
        this.parsePivotColumnsState(this.getPivotColumnsState(), columns);
    },

    parsePivotColumnsState: function(state, columns){
        var item, i;

        if(!columns){
            return;
        }
        for(i = 0; i < columns.length; i++){
            item = state[columns[i].dataIndex];
            if(item){
                if(item.flex){
                    columns[i].flex = item.flex;
                }else if(item.width){
                    columns[i].width = item.width;
                }
            }
            this.parsePivotColumnsState(state, columns[i].columns);
        }
    }
    
});

