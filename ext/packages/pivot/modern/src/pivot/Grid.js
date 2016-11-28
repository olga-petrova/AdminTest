/**
 * Pivot grid implementation for the modern toolkit.
 *
 * The modern pivot grid could be styled using data binding as following:
 *
 * ## ViewModel on rows
 *
 * Let's have a look at this example:
 *
 *      {
 *          xtype: 'pivotgrid',
 *          itemConfig: {
 *              viewModel: {
 *                  type: 'pivot-row-model'
 *              },
 *              bind: {
 *                  userCls: '{rowStyle}'
 *                  // or you can define a template
 *                  //userCls: '{record.isRowGroupHeader:pick("","pivotRowHeader")}'
 *              }
 *          }
 *          // ... more configs
 *      }
 *
 * In the ViewModel we would declare a formula that will use the record data. The record
 * has all values that are displayed for that row and the following additional fields:
 *
 * - isRowGroupHeader
 * - isRowGroupTotal
 * - isRowGrandTotal
 * - leftAxisKey: This is either the grand total key or a key that identifies the left axis item
 *
 * All these properties can help us style the entire row without knowing anything about the generated columns.
 *
 * In some case we may want to style positive and negative values generated in the pivot grid. This can be done
 * as following.
 *
 *      {
 *          xtype: 'pivotgrid',
 *          itemConfig: {
 *              viewModel: {
 *                  type: 'default'
 *              }
 *          },
 *          topAxisCellConfig: {
 *              bind: {
 *                  userCls: '{value:sign("pivotCellNegative","pivotCellPositive")}'
 *              }
 *          }
 *          // ... more configs
 *      }
 *
 * The following data is available for use in the bind template:
 *
 * - column
 *      - isColGroupTotal: this tells us that the column for that specific cell is a group total
 *      - isColGrandTotal: this tells us that the column for that specific cell is a grand total
 *
 * - value: cell value
 *
 * **Note:** In such cases you cannot use formulas because the column and value are generated dynamically
 * and can't be replaced in formulas.
 *
 *
 * It is also possible to style a specific dimension from left axis or aggregate:
 *
 *      {
 *          xtype: 'pivotgrid',
 *          itemConfig: {
 *              viewModel: {
 *                  type: 'default'
 *              }
 *          },
 *          aggregate: [{
 *              dataIndex:  'value',
 *              aggregator: 'sum',
 *              align:      'right',
 *
 *              cellConfig: {
 *                  bind: {
 *                      userCls: '{value:sign("pivotCellNegative","pivotCellPositive")}'
 *                  }
 *              }
 *          },{
 *              dataIndex:  'value',
 *              aggregator: 'count'
 *          }],
 *          leftAxis: [{
 *              dataIndex:  'person',
 *              // This is used only when `viewLayoutType` is `outline`
 *              cellConfig: {
 *                  bind: {
 *                      userCls: '{record.isRowGroupHeader::pick("","pivotRowHeader")}'
 *                  }
 *              }
 *          },{
 *              dataIndex:  'country'
 *          }]
 *          // ... more configs
 *      }
 *
 *
 * ## ViewModel on cells
 *
 * This scenario allows you to define formulas to use in cell binding. Be careful that this means that
 * each cell will have an own ViewModel and this may decrease the pivot grid performance. Use it only
 * if necessary.
 *
 *      {
 *          xtype: 'pivotgrid',
 *          leftAxisCellConfig: {
 *              viewModel: {
 *                  type: 'default'
 *              },
 *              bind: {
 *                  userCls: '{record.isRowGroupHeader::pick("","pivotRowHeader")}'
 *              }
 *          },
 *          topAxisCellConfig: {
 *              viewModel: {
 *                  type: 'pivot-cell-model' // to be able to define your own formulas
 *              },
 *              bind: {
 *                  userCls: '{value:sign("pivotCellNegative","pivotCellPositive")}'
 *                  //userCls: '{column.isColGrandTotal:pick(null,"pivotCellGrandTotal")}'
 *                  //userCls: '{cellCls}
 *              }
 *          }
 *          // ... more configs
 *      }
 *
 * This approach lets you use record, column and value in both bind templates and formulas.
 *
 *
 * If multiple aggregate dimensions are available and you want to style one of them you can define the
 * binding on that dimension like this:
 *
 *      {
 *          xtype: 'pivotgrid',
 *          aggregate: [{
 *              dataIndex:  'value',
 *              aggregator: 'sum',
 *              align:      'right',
 *
 *              cellConfig: {
 *                  viewModel: {
 *                      type: 'pivot-cell-model'
 *                  },
 *                  bind: {
 *                      userCls: '{value:sign("pivotCellNegative","pivotCellPositive")}'
 *                      //userCls: '{column.isColGrandTotal:pick(null,"pivotCellGrandTotal")}'
 *                      //userCls: '{cellCls}
 *                  }
 *              }
 *          },{
 *              dataIndex:  'value',
 *              aggregator: 'count'
 *          }]
 *          // ... more configs
 *      }
 *
 */
Ext.define('Ext.pivot.Grid', {
    extend: 'Ext.grid.Grid',
    xtype: 'pivotgrid',

    requires: [
        'Ext.LoadMask',
        'Ext.pivot.Row',
        'Ext.pivot.feature.PivotStore',
        'Ext.pivot.matrix.Local',
        'Ext.pivot.matrix.Remote',
        'Ext.data.ArrayStore'
    ],

    isPivotGrid: true,

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
     * @cfg {Boolean} enableColumnSort Set this on false if you don't want to allow column sorting
     * in the pivot grid generated columns.
     */
    enableColumnSort:   true,

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
    showZeroAsBlank:        false,


    cellSelector:               '.' + Ext.baseCSSPrefix + 'grid-cell',
    /**
     * @cfg {String} clsGroupTotal CSS class assigned to the group totals.
     */
    clsGroupTotal:              Ext.baseCSSPrefix + 'pivot-grid-group-total',
    /**
     * @cfg {String} clsGrandTotal CSS class assigned to the grand totals.
     */
    clsGrandTotal:              Ext.baseCSSPrefix + 'pivot-grid-grand-total',

    groupHeaderCollapsedCls:    Ext.baseCSSPrefix + 'pivot-grid-group-header-collapsed',
    groupHeaderCollapsibleCls:  Ext.baseCSSPrefix + 'pivot-grid-group-header-collapsible',
    summaryDataCls:             Ext.baseCSSPrefix + 'pivot-summary-data',
    groupCls:                   Ext.baseCSSPrefix + 'pivot-grid-group',

    relayedMatrixEvents: [
        'beforereconfigure', 'reconfigure',
        'start', 'progress', 'done', 'modelbuilt', 'columnsbuilt', 'recordbuilt',
        'buildtotals', 'storebuilt', 'groupexpand', 'groupcollapse',
        'beforerequest', 'requestexception'
    ],

    config: {
        /**
         * @private
         */
        matrix: null,

        /**
         * @cfg {Object} leftAxisCellConfig
         *
         * Cell configuration for columns generated for the left axis dimensions.
         *
         * Binding could be defined here.
         */
        leftAxisCellConfig: {
            xtype: 'pivotgridgroupcell'
        },

        /**
         * @cfg {Object} topAxisCellConfig
         *
         * Cell configuration for columns generated for the top axis and aggregate dimensions.
         *
         * Binding could be defined here.
         */
        topAxisCellConfig: {
            xtype: 'pivotgridcell'
        }

        /**
         * @cfg record
         * @hide
         */
    },

    defaultType: 'pivotgridrow',

    initialize: function(){
        var me = this,
            matrix = {},
            ret;

        me.setColumns([]);

        me.setStore(Ext.create('Ext.data.ArrayStore', {
            fields: []
        }));
        me.addCls(Ext.baseCSSPrefix + 'pivot-grid');

        me.pivotDataSource = new Ext.pivot.feature.PivotStore({
            store:          me.getStore(),
            grid:           me,
            clsGrandTotal:  me.clsGrandTotal,
            clsGroupTotal:  me.clsGroupTotal,
            summaryDataCls: me.summaryDataCls
        });

        me.getHeaderContainer().on({
            columntap:      'handleColumnTap',
            headergrouptap: 'handleHeaderGroupTap',
            scope:          me
        });

        ret = me.callParent(arguments);

        Ext.apply(matrix, {
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

        Ext.applyIf(matrix, me.matrixConfig || {});

        me.setMatrix(matrix);

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
         * Fires when a tap is detected on a pivot group element.
         * The pivot group element is the one that belongs to the columns generated for the left axis dimensions.
         *
         * Return false if you want to prevent expanding/collapsing that group.
         *
         * @event pivotgrouptap
         * @param {Object} params Object with following configuration
         * @param {Ext.pivot.Grid} params.grid Pivot grid instance
         * @param {Ext.grid.cell.Cell} params.cell The target of the event
         * @param {String} params.leftKey Key of the left axis item
         * @param {Ext.pivot.axis.Item} params.leftItem Left axis item
         * @param {Ext.grid.column.Column} params.column Column header object
         * @param {Ext.event.Event} e Event object
         */

        /**
         * Fires when a double tap is detected on a pivot group element.
         * The pivot group element is the one that belongs to the columns generated for the left axis dimensions.
         *
         * @event pivotgroupdoubletap
         * @param {Object} params Object with following configuration
         * @param {Ext.pivot.Grid} params.grid Pivot grid instance
         * @param {Ext.grid.cell.Cell} params.cell The target of the event
         * @param {String} params.leftKey Key of the left axis item
         * @param {Ext.pivot.axis.Item} params.leftItem Left axis item
         * @param {Ext.grid.column.Column} params.column Column header object
         * @param {Ext.event.Event} e Event object
         */

        /**
         * Fires when a tap hold is detected on a pivot group element.
         * The pivot group element is the one that belongs to the columns generated for the left axis dimensions.
         *
         * @event pivotgrouptaphold
         * @param {Object} params Object with following configuration
         * @param {Ext.pivot.Grid} params.grid Pivot grid instance
         * @param {Ext.grid.cell.Cell} params.cell The target of the event
         * @param {String} params.leftKey Key of the left axis item
         * @param {Ext.pivot.axis.Item} params.leftItem Left axis item
         * @param {Ext.grid.column.Column} params.column Column header object
         * @param {Ext.event.Event} e Event object
         */

        /**
         * Fires when a tap is detected on a pivot group cell.
         * The pivot group cell is the one that belongs to the columns generated for the top axis dimensions.
         *
         * @event pivotgroupcelltap
         * @param {Object} params Object with following configuration
         * @param {Ext.pivot.Grid} params.grid Pivot grid instance
         * @param {Ext.grid.cell.Cell} params.cell The target of the event
         * @param {String} params.leftKey Key of the left axis item
         * @param {Ext.pivot.axis.Item} params.leftItem Left axis item
         * @param {String} params.topKey Key of the top axis item
         * @param {Ext.pivot.axis.Item} params.topItem Top axis item
         * @param {String} params.dimensionId Id of the aggregate dimension
         * @param {Ext.grid.column.Column} params.column Column header object
         * @param {Ext.event.Event} e Event object
         */

        /**
         * Fires when a double tap is detected on a pivot group cell.
         * The pivot group cell is the one that belongs to the columns generated for the top axis dimensions.
         *
         * @event pivotgroupcelldoubletap
         * @param {Object} params Object with following configuration
         * @param {Ext.pivot.Grid} params.grid Pivot grid instance
         * @param {Ext.grid.cell.Cell} params.cell The target of the event
         * @param {String} params.leftKey Key of the left axis item
         * @param {Ext.pivot.axis.Item} params.leftItem Left axis item
         * @param {String} params.topKey Key of the top axis item
         * @param {Ext.pivot.axis.Item} params.topItem Top axis item
         * @param {String} params.dimensionId Id of the aggregate dimension
         * @param {Ext.grid.column.Column} params.column Column header object
         * @param {Ext.event.Event} e Event object
         */

        /**
         * Fires when a tap hold is detected on a pivot group cell.
         * The pivot group cell is the one that belongs to the columns generated for the top axis dimensions.
         *
         * @event pivotgroupcelltaphold
         * @param {Object} params Object with following configuration
         * @param {Ext.pivot.Grid} params.grid Pivot grid instance
         * @param {Ext.grid.cell.Cell} params.cell The target of the event
         * @param {String} params.leftKey Key of the left axis item
         * @param {Ext.pivot.axis.Item} params.leftItem Left axis item
         * @param {String} params.topKey Key of the top axis item
         * @param {Ext.pivot.axis.Item} params.topItem Top axis item
         * @param {String} params.dimensionId Id of the aggregate dimension
         * @param {Ext.grid.column.Column} params.column Column header object
         * @param {Ext.event.Event} e Event object
         */

        /**
         * Fires when a tap is detected on a pivot item element.
         * The pivot item element is the one that belongs to the columns generated for the left axis dimensions.
         *
         * @event pivotitemtap
         * @param {Object} params Object with following configuration
         * @param {Ext.pivot.Grid} params.grid Pivot grid instance
         * @param {Ext.grid.cell.Cell} params.cell The target of the event
         * @param {String} params.leftKey Key of the left axis item
         * @param {Ext.pivot.axis.Item} params.leftItem Left axis item
         * @param {Ext.grid.column.Column} params.column Column header object
         * @param {Ext.event.Event} e Event object
         */

        /**
         * Fires when a double tap is detected on a pivot item element.
         * The pivot item element is the one that belongs to the columns generated for the left axis dimensions.
         *
         * @event pivotitemdoubletap
         * @param {Object} params Object with following configuration
         * @param {Ext.pivot.Grid} params.grid Pivot grid instance
         * @param {Ext.grid.cell.Cell} params.cell The target of the event
         * @param {String} params.leftKey Key of the left axis item
         * @param {Ext.pivot.axis.Item} params.leftItem Left axis item
         * @param {Ext.grid.column.Column} params.column Column header object
         * @param {Ext.event.Event} e Event object
         */

        /**
         * Fires when a tap hold is detected on a pivot item element.
         * The pivot item element is the one that belongs to the columns generated for the left axis dimensions.
         *
         * @event pivotitemtaphold
         * @param {Object} params Object with following configuration
         * @param {Ext.pivot.Grid} params.grid Pivot grid instance
         * @param {Ext.grid.cell.Cell} params.cell The target of the event
         * @param {String} params.leftKey Key of the left axis item
         * @param {Ext.pivot.axis.Item} params.leftItem Left axis item
         * @param {Ext.grid.column.Column} params.column Column header object
         * @param {Ext.event.Event} e Event object
         */

        /**
         * Fires when a tap is detected on a pivot item cell.
         * The pivot item cell is the one that belongs to the columns generated for the top axis dimensions.
         *
         * @event pivotitemcelltap
         * @param {Object} params Object with following configuration
         * @param {Ext.pivot.Grid} params.grid Pivot grid instance
         * @param {Ext.grid.cell.Cell} params.cell The target of the event
         * @param {String} params.leftKey Key of the left axis item
         * @param {Ext.pivot.axis.Item} params.leftItem Left axis item
         * @param {String} params.topKey Key of the top axis item
         * @param {Ext.pivot.axis.Item} params.topItem Top axis item
         * @param {String} params.dimensionId Id of the aggregate dimension
         * @param {Ext.grid.column.Column} params.column Column header object
         * @param {Ext.event.Event} e Event object
         */

        /**
         * Fires when a double tap is detected on a pivot item cell.
         * The pivot item cell is the one that belongs to the columns generated for the top axis dimensions.
         *
         * @event pivotitemcelldoubletap
         * @param {Object} params Object with following configuration
         * @param {Ext.pivot.Grid} params.grid Pivot grid instance
         * @param {Ext.grid.cell.Cell} params.cell The target of the event
         * @param {String} params.leftKey Key of the left axis item
         * @param {Ext.pivot.axis.Item} params.leftItem Left axis item
         * @param {String} params.topKey Key of the top axis item
         * @param {Ext.pivot.axis.Item} params.topItem Top axis item
         * @param {String} params.dimensionId Id of the aggregate dimension
         * @param {Ext.grid.column.Column} params.column Column header object
         * @param {Ext.event.Event} e Event object
         */

        /**
         * Fires when a tap hold is detected on a pivot item cell.
         * The pivot item cell is the one that belongs to the columns generated for the top axis dimensions.
         *
         * @event pivotitemcelltaphold
         * @param {Object} params Object with following configuration
         * @param {Ext.pivot.Grid} params.grid Pivot grid instance
         * @param {Ext.grid.cell.Cell} params.cell The target of the event
         * @param {String} params.leftKey Key of the left axis item
         * @param {Ext.pivot.axis.Item} params.leftItem Left axis item
         * @param {String} params.topKey Key of the top axis item
         * @param {Ext.pivot.axis.Item} params.topItem Top axis item
         * @param {String} params.dimensionId Id of the aggregate dimension
         * @param {Ext.grid.column.Column} params.column Column header object
         * @param {Ext.event.Event} e Event object
         */

        /**
         * Fires when a tap is detected on a pivot grand total element.
         * The pivot grand total element is the one that belongs to the columns generated for the left axis dimensions.
         *
         * @event pivottotaltap
         * @param {Object} params Object with following configuration
         * @param {Ext.pivot.Grid} params.grid Pivot grid instance
         * @param {Ext.grid.cell.Cell} params.cell The target of the event
         * @param {String} params.leftKey Key of the left axis item
         * @param {Ext.grid.column.Column} params.column Column header object
         * @param {Ext.event.Event} e Event object
         */

        /**
         * Fires when a double tap is detected on a pivot grand total element.
         * The pivot grand total element is the one that belongs to the columns generated for the left axis dimensions.
         *
         * @event pivottotaldoubletap
         * @param {Object} params Object with following configuration
         * @param {Ext.pivot.Grid} params.grid Pivot grid instance
         * @param {Ext.grid.cell.Cell} params.cell The target of the event
         * @param {String} params.leftKey Key of the left axis item
         * @param {Ext.grid.column.Column} params.column Column header object
         * @param {Ext.event.Event} e Event object
         */

        /**
         * Fires when a tap hold is detected on a pivot grand total element.
         * The pivot grand total element is the one that belongs to the columns generated for the left axis dimensions.
         *
         * @event pivottotaltaphold
         * @param {Object} params Object with following configuration
         * @param {Ext.pivot.Grid} params.grid Pivot grid instance
         * @param {Ext.grid.cell.Cell} params.cell The target of the event
         * @param {String} params.leftKey Key of the left axis item
         * @param {Ext.grid.column.Column} params.column Column header object
         * @param {Ext.event.Event} e Event object
         */

        /**
         * Fires when a tap is detected on a pivot grand total cell.
         * The pivot total cell is the one that belongs to the columns generated for the top axis dimensions.
         *
         * @event pivottotalcelltap
         * @param {Object} params Object with following configuration
         * @param {Ext.pivot.Grid} params.grid Pivot grid instance
         * @param {Ext.grid.cell.Cell} params.cell The target of the event
         * @param {String} params.leftKey Key of the left axis item
         * @param {String} params.topKey Key of the top axis item
         * @param {String} params.dimensionId Id of the aggregate dimension
         * @param {Ext.grid.column.Column} params.column Column header object
         * @param {Ext.event.Event} e Event object
         */

        /**
         * Fires when a double tap is detected on a pivot grand total cell.
         * The pivot total cell is the one that belongs to the columns generated for the top axis dimensions.
         *
         * @event pivottotalcelldoubletap
         * @param {Object} params Object with following configuration
         * @param {Ext.pivot.Grid} params.grid Pivot grid instance
         * @param {Ext.grid.cell.Cell} params.cell The target of the event
         * @param {String} params.leftKey Key of the left axis item
         * @param {String} params.topKey Key of the top axis item
         * @param {String} params.dimensionId Id of the aggregate dimension
         * @param {Ext.grid.column.Column} params.column Column header object
         * @param {Ext.event.Event} e Event object
         */

        /**
         * Fires when a double tap is detected on a pivot grand total cell.
         * The pivot total cell is the one that belongs to the columns generated for the top axis dimensions.
         *
         * @event pivottotalcelltaphold
         * @param {Object} params Object with following configuration
         * @param {Ext.pivot.Grid} params.grid Pivot grid instance
         * @param {Ext.grid.cell.Cell} params.cell The target of the event
         * @param {String} params.leftKey Key of the left axis item
         * @param {String} params.topKey Key of the top axis item
         * @param {String} params.dimensionId Id of the aggregate dimension
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

        return ret;
    },

    destroy: function(){
        var me = this;

        Ext.destroy(me.matrixRelayedListeners, me.matrixListeners, me.headerCtListeners, me.lockedHeaderCtListeners);
        Ext.destroy(me.pivotDataSource);
        me.matrixRelayedListeners = me.matrixListeners = me.headerCtListeners = me.lockedHeaderCtListeners = null;
        me.setMatrix(null);

        me.callParent();

        me.lastColumnSorted = me.store = Ext.destroy(me.store);
    },

    updateTopAxisCellConfig: function(obj){
        var matrix = this.getMatrix(),
            zeroAsBlank;

        zeroAsBlank = matrix ? matrix.showZeroAsBlank : this.showZeroAsBlank;

        if(Ext.isObject(obj)){
            Ext.apply(obj, {
                zeroValue: zeroAsBlank ? '' : '0'
            });
        }
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

        return Ext.Factory.pivotmatrix(newMatrix);
    },

    updateMatrix: function(matrix, oldMatrix){
        var me = this;

        Ext.destroy(oldMatrix, me.matrixListeners, me.matrixRelayedListeners);

        if(matrix){
            me.matrixListeners = matrix.on({
                cleardata:          me.onMatrixClearData,
                start:              me.onMatrixProcessStart,
                progress:           me.onMatrixProcessProgress,
                done:               me.onMatrixDataReady,
                beforeupdate:       me.onMatrixBeforeUpdate,
                afterupdate:        me.onMatrixAfterUpdate,
                groupexpand:        me.onMatrixGroupExpandCollapse,
                groupcollapse:      me.onMatrixGroupExpandCollapse,
                scope:              me,
                destroyable:        true
            });

            me.matrixRelayedListeners = me.relayEvents(matrix, me.relayedMatrixEvents, 'pivot');

            if(me.pivotDataSource){
                me.pivotDataSource.setMatrix(matrix);
            }
        }
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

        me.getStore().fireEvent('pivotstoreremodel', me);
    },

    updateHeaderContainerColumns: function(group){
        var me = this,
            i = 0,
            cols, index, ownerCt, item, column;

        if(group) {
            // let's find the first column that matches this group
            // that will be our new columns insertion point
            column = me.getColumnForGroup(me.getHeaderContainer().innerItems, group);
            if(column.found) {
                ownerCt = column.item.getParent();
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
                ownerCt.insert(index, cols);
            }
        }else{
            // we probably have to expand/collapse all group columns
            cols = Ext.clone(me.pivotColumns);
            me.preparePivotColumns(cols);
            me.setColumns(cols);
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
            item = items[i];
            if(item.group == group){
                ret.found = true;
                ret.index = i;
                ret.item = item;
            }else if(item.innerItems){
                ret = this.getColumnForGroup(item.innerItems, group);
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

        me.getStore().removeAll(true);
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
            this.setMasked({
                xtype:  'loadmask',
                indicator: true
            });
        }
    },

    /**
     * @private
     *
     */
    onMatrixProcessProgress: function(matrix, index, length){
        var percent = ((index || 0.1) * 100)/(length || 0.1);

        if(this.enableLoadMask) {
            this.getMasked().setMessage(Ext.util.Format.number(percent, '0') + '%');
        }
    },

    /**
     * @private
     *
     */
    onMatrixBeforeUpdate: function(){
        /*
         * Auto update of html elements when a record is updated doesn't work on ExtJS 5
         * because the pivot grid uses an outerTpl which add table cols to each grid row
         * and this messes up the logic in Ext.view.Table.handleUpdate function.
         * The workaround is to suspend events on the grid store before updating the matrix
         * and resume events after all store records were update.
         * As a final step the grid is refreshed.
         */
        this.getStore().suspendEvents();
    },

    /**
     * @private
     *
     */
    onMatrixAfterUpdate: function(){
        var store = this.getStore();

        store.resumeEvents();
        store.fireEvent('pivotstoreremodel');
    },

    /**
     * @private
     *
     */
    onMatrixDataReady: function(){
        var me = this,
            matrix = me.getMatrix(),
            cols = matrix.getColumnHeaders(),
            stateApplied = false;

        if (me.enableLoadMask) {
            me.setMasked(false);
        }

        if(me.expandedItemsState){
            matrix.leftAxis.items.each(function(item){
                if(Ext.Array.indexOf(me.expandedItemsState['rows'], item.key) >= 0){
                    item.expanded = true;
                    stateApplied = true;
                }
            });

            matrix.topAxis.items.each(function(item){

                if(Ext.Array.indexOf(me.expandedItemsState['cols'], item.key) >= 0){
                    item.expanded = true;
                    stateApplied = true;
                }
            });

            if(stateApplied){
                cols = matrix.getColumnHeaders();
                delete me.expandedItemsState;
            }

        }else{
            me.doExpandCollapseTree(matrix.leftAxis.getTree(), !me.startRowGroupsCollapsed);
            me.doExpandCollapseTree(matrix.topAxis.getTree(), !me.startColGroupsCollapsed);
            cols = matrix.getColumnHeaders();
        }

        me.pivotColumns = Ext.clone(cols);
        cols = Ext.clone(me.pivotColumns);

        me.preparePivotColumns(cols);
        me.restorePivotColumnsState(cols);

        cols = me.prepareVisiblePivotColumns(cols);
        me.setColumns(cols);

        if(!Ext.isEmpty(me.sortedColumn)){
            matrix.leftAxis.sortTreeByField(me.sortedColumn.dataIndex, me.sortedColumn.direction);
        }

        me.getStore().fireEvent('pivotstoreremodel', me);

        if(!Ext.isEmpty(me.sortedColumn)){
            me.updateColumnSortState(me.sortedColumn.dataIndex, me.sortedColumn.direction);
        }
        me.lastColumnSorted = null;
    },

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
                Ext.apply(column, {
                    cell: Ext.clone(me.getLeftAxisCellConfig())
                });
            }else if(column.topAxis){
                Ext.apply(column, {
                    cell: Ext.clone(me.getTopAxisCellConfig())
                });
            }

            if(column.subTotal){
                column.cls = column.userCls = me.clsGroupTotal;
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
                    me.prepareHiddenColumns(column);
                }
            }

            if(column.grandTotal){
                column.cls = column.userCls = me.clsGrandTotal;
            }

            if(Ext.isEmpty(column.columns)){
                if(column.dimension){
                    Ext.apply(column, {
                        renderer: column.dimension ? column.dimension.getRenderer() : false,
                        formatter: column.dimension ? column.dimension.getFormatter() : false,
                        scope: column.dimension ? column.dimension.scope : null,
                        align: column.dimension.align
                    });

                    if(column.dimension.flex > 0){
                        column.flex = column.flex || column.dimension.flex;
                    }else{
                        column.width = column.width || column.dimension.width;
                    }
                    column.cell = Ext.merge(column.cell, column.dimension.cellConfig);
                }
                if(column.cell && column.cell.bind && !column.cell.viewModel){
                    column.cell.bind = me.processBindKey(column.cell.bind, column.dataIndex);
                }
            }else{
                column.xtype = 'gridheadergroup';

                me.preparePivotColumns(column.columns);
            }
        }
    },

    processBindKey: function(value, dataIndex){
        var keys, key, length, i, v;

        if(Ext.isString(value)){
            v = value.replace('{column', '{columns.' + dataIndex);
            return v.replace('{value', '{record.' + dataIndex);
        }else if(Ext.isObject(value)) {
            keys = Ext.Object.getAllKeys(value);
        }else if(Ext.isArray(value)){
            keys = value;
        }

        if(keys){
            length = keys.length;

            for (i = 0; i < length; i++) {
                key = keys[i];
                value[key] = this.processBindKey(value[key], dataIndex);
            }
        }

        return value;
    },

    /**
     * Just hide all children columns below the specified column
     *
     * @param column
     *
     * @private
     */
    prepareHiddenColumns: function(column){
        var i, len;

        column.hidden = true;

        if(!column.columns){
            return;
        }

        len = column.columns.length;
        for(i = 0; i < len; i++){
            this.prepareHiddenColumns(column.columns[i]);
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
     *
     * Find the top axis item key that maps to the specified grid column
     *
     * @param column {Ext.grid.column.Column}
     * @returns {null/String}
     *
     * @private
     */
    getTopAxisKey: function(column){
        var me = this,
            matrix = me.getMatrix(),
            columns = matrix.getColumns(),
            key = null,
            i;

        if(!column){
            return null;
        }

        for(i = 0; i < columns.length; i++){
            if(columns[i].name === column.getDataIndex()){
                key = columns[i].col;
                break;
            }
        }

        return key;
    },

    /**
     * Returns the top axis item used to generate the specified column.
     *
     * @param column {Ext.grid.column.Column}
     */
    getTopAxisItem: function(column){
        return this.getMatrix().topAxis.items.getByKey(this.getTopAxisKey(column));
    },

    /**
     * Returns the left axis item used to generate the specified record.
     *
     * @param record {Ext.data.Model}
     */
    getLeftAxisItem: function(record){
        var info;

        if(!record){
            return null;
        }

        info = this.pivotDataSource.storeInfo[record.internalId];

        return info ? this.getMatrix().leftAxis.items.getByKey(info.leftKey) : null;
    },

    getStateProperties: function(){
        return ['viewLayoutType', 'rowSubTotalsPosition', 'rowGrandTotalsPosition', 'colSubTotalsPosition', 'colGrandTotalsPosition', 'aggregate', 'leftAxis', 'topAxis', 'enableColumnSort', 'sortedColumn'];
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

        cols = me.getColumns();
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
    },

    onItemTap: function(e) {
        this.handleRowEvent('tap', e);
        this.callParent(arguments);
    },

    onItemTapHold: function(e) {
        this.handleRowEvent('taphold', e);
        this.callParent(arguments);
    },

    onItemSingleTap: function(e) {
        this.handleRowEvent('singletap', e);
        this.callParent(arguments);
    },

    onItemDoubleTap: function(e) {
        this.handleRowEvent('doubletap', e);
        this.callParent(arguments);
    },

    handleRowEvent: function(type, e){
        var cell = Ext.fly(e.getTarget(this.cellSelector));

        if(cell){
            return cell.component.handleEvent(type, e);
        }
    },

    handleColumnTap: function(header, column){
        var me = this,
            sortDirection, newDirection;

        if(column.xexpandable){
            this.handleHeaderGroupTap(header, column)
            return;
        }

        if(!me.enableColumnSort){
            return;
        }

        sortDirection = column.getSortDirection() || 'DESC';
        newDirection = (sortDirection === 'DESC') ? 'ASC' : 'DESC';

        if((column.leftAxis || column.topAxis) && !Ext.isEmpty(column.getDataIndex())){
            // sort the results when a dataIndex column was clicked
            if(me.getMatrix().leftAxis.sortTreeByField(column.getDataIndex(), newDirection )){
                me.refreshView();
                me.updateSortIndicator(column, newDirection);
            }
        }

        return false;
    },

    updateSortIndicator: function(column, direction){
        // for now we handle just one column sorting
        // TODO all left axis dimensions could be sorted and should be shown like this in the grid
        var last = this.lastColumnSorted;

        if(last){
            // the function is made available on the column via an override
            last.updateSortIndicator(null);
        }
        column.updateSortIndicator(direction);
        this.lastColumnSorted = column;
    },

    handleHeaderGroupTap: function(header, column){
        if(column.xexpandable) {
            this.doExpandCollapse('col', column.key);
        }
    },

    isRTL: function(){
        if(Ext.isFunction(this.isLocalRtl)){
            return this.isLocalRtl();
        }

        return false;
    },

    getRecordInfo: function(record){
        return record ? this.pivotDataSource.storeInfo[record.internalId] : null;
    }
});