/**
 * This class is used to initialize the dimensions defined on the pivot grid leftAxis,
 * topAxis and aggregate.
 *
 *
 */
Ext.define('Ext.pivot.dimension.Item', {
    alternateClassName: [
        'Mz.aggregate.dimension.Item'
    ],

    requires: [
        'Ext.pivot.MixedCollection',
        'Ext.pivot.filter.Label',
        'Ext.pivot.filter.Value'
    ],

    $configPrefixed: false,
    $configStrict: false,

    config: {
        /**
         * @cfg {String} id
         * Unique id of this dimension.
         */
        id:                 '',

        /**
         * @cfg {String} header (required)
         *
         * This text is visible in the pivot grid in the following cases:
         *
         * - the dimension is defined on the left axis. The pivot grid will generate one grid column per dimension and
         * this header will go into the grid column header.
         *
         * - the dimension is defined on the aggregate. The pivot grid will generate one grid column per dimension per top
         * axis label. If there are at least 2 aggregate dimensions then this header will be visible. When only one is
         * defined the aggregate dimension header is replaced by the top axis label.
         *
         * - if the {@link Ext.pivot.plugin.Configurator Configurator plugin} is used then this header will be visible
         * in the axis panels.
         *
         */
        header:             '',

        /**
         * @cfg {String} dataIndex (required)
         * The field name on the record from where this dimension extracts data.
         */
        dataIndex:          '',

        /**
         * @cfg {String} sortIndex
         * Field name on the record used when sorting this dimension results. Defaults to {@link #dataIndex} if
         * none is specified.
         */
        sortIndex:          '',

        /**
         * @cfg {Number} [width=100]
         * Default column width when this dimension is a left axis or aggregate dimension.
         * Used by the generated columns.
         */
        width:              100,

        /**
         * @cfg {Number} [flex=0]
         * Column flex when this dimension is a left axis or aggregate dimension.
         * Used by the generated columns.
         */
        flex:               0,

        /**
         * @cfg {String} [align="left"]
         * Column alignment when this dimension is a left axis or aggregate dimension.
         * Used by the generated columns.
         */
        align:              'left',

        /**
         * @cfg {Boolean} [sortable=true]
         * Is this dimension sortable when the pivot is generated?
         */
        sortable:           true,

        /**
         * @cfg {"ASC"/"DESC"} [direction="ASC"]
         * If this dimension is sortable then this is the type of sorting.
         */
        direction:          'ASC',

        /**
         * @cfg {Function} sorterFn
         * Provide here your own sorting function for this dimension.
         * If none is specified then the defaultSorterFn is used.
         */
        sorterFn:           null,

        /**
         * @cfg {Boolean} [caseSensitiveSort=true]
         * If this dimension is sortable, should we do a case sensitive sort?
         */
        caseSensitiveSort:  true,

        /**
         * @cfg {Ext.pivot.filter.Base} filter
         * Provide a filter configuration to filter your axis items.
         * This works only on left/top axis dimensions.
         *
         * Example for a label filter:
         *
         *      {
         *          dataIndex:  'year',
         *          header:     'Year',
         *          filter: {
         *              type:       'label',
         *              operator:   '=',
         *              value:      2012
         *          }
         *      }
         *
         *
         * Example for a value filter:
         *
         *      {
         *          dataIndex:  'year',
         *          header:     'Year',
         *          filter: {
         *              type:       'value',
         *              operator:   'between',
         *              value:      [2012, 2015]
         *          }
         *      }
         *
         *
         * Example for a top 10 value filter:
         *
         *      {
         *          dataIndex:  'year',
         *          header:     'Year',
         *          filter: {
         *              type:           'value',
         *              operator:       'top10',
         *              dimensionId:    'value',   // this is the id of an aggregate dimension
         *              topType:        'items',
         *              topOrder:       'bottom'
         *          }
         *      }
         */
        filter:             null,

        /**
         * @cfg {String/Function} labelRenderer
         *
         * Callback function or the name of the callback function to execute when labels
         * are generated for this dimension.
         *
         * **Note:** This works when the dimension is used as either left or top axis dimension.
         *
         * Example:
         *
         *      {
         *          xtype: 'pivot',
         *
         *          topAxis: [{
         *              dataIndex: 'month'
         *              labelRenderer: function(monthValue){
         *                  return Ext.Date.monthNames[monthValue];
         *              }
         *          }]
         *
         *          // ...
         *      }
         *
         * The above labelRenderer will convert the month value to a textual month name.
         *
         * @param {Mixed} value Value that needs to be formatted
         * @returns {String} The label value displayed in the pivot grid
         */
        labelRenderer:      null,

        /**
         * @cfg {String/Function} renderer
         *
         * Callback function or the name of the callback function that will be attached to the grid column
         * generated for this dimension.
         *
         * **Note:** This works when the dimension is used as either left axis or aggregate dimension.
         *
         * The following example describes how columns are generated by the pivot grid:
         *
         *      {
         *          xtype: 'pivot',
         *
         *          leftAxis: [{
         *              dataIndex: 'country'
         *          }],
         *
         *          topAxis: [{
         *              dataIndex: 'year',
         *              labelRenderer: function(v) {
         *                  return 'Year ' + v;
         *              }
         *          }],
         *
         *          aggregate: [{
         *              dataIndex: 'value',
         *              aggregator: 'sum',
         *              renderer: function(value, metaData, record, rowIndex, colIndex, store, view){
         *                  metaData.tdCls = (value < 0) ? 'redCls' : 'greenCls';
         *                  return Ext.util.Format(value, '0,000.00');
         *              }
         *          },{
         *              dataIndex: 'qty',
         *              aggregator: 'sum',
         *              renderer: function(value, metaData, record, rowIndex, colIndex, store, view){
         *                  metaData.tdCls = (value < 0) ? 'redCls' : 'greenCls';
         *                  return Ext.util.Format(value, '0.00');
         *              }
         *          }]
         *      }
         *
         * Let's say that we have records for the years 2015 and 2016. In this scenario the resulting grid will have:
         *
         *  - 1 column for the left axis dimension defined. This column will use the renderer defined on the left
         *  axis dimension
         *  - 4 columns calculated for the top axis results (2) multiplied by the number of aggregate dimensions (2). These columns will
         *  use the renderers defined on the aggregate dimensions and each group column header is generated using
         *  labelRenderer defined on the top axis dimension.
         *
         * Read more about grid column renderers {@link Ext.grid.column.Column#renderer here}.
         *
         */
        renderer:           null,

        /**
         * @cfg {String} formatter
         *
         * This formatter will be attached to the grid column generated for this dimension.
         *
         * **Note:** This works when the dimension is used either as a left axis or an aggregate dimension.
         *
         * Read more about grid column formatters {@link Ext.grid.column.Column#formatter here}.
         */
        formatter:          null,

        /**
         * @cfg {Ext.exporter.file.Style/Ext.exporter.file.Style[]} exportStyle
         *
         * Style used during export by the {@link Ext.pivot.plugin.Exporter exporter plugin}. This style will
         * be applied to the columns generated for the aggregate or left axis dimensions in the exported file.
         *
         * You could define it as a single object that will be used by all exporters:
         *
         *      aggregate: [{
         *          dataIndex: 'price',
         *          header: 'Total',
         *          aggregator: 'sum',
         *          exportStyle: {
         *              format: 'Currency',
         *              alignment: {
         *                  horizontal: 'Right'
         *              },
         *              font: {
         *                  italic: true
         *              }
         *          }
         *      }]
         *
         * You could also define it as an array of objects, each object having a `type` that specifies by
         * which exporter will be used:
         *
         *      aggregate: [{
         *          dataIndex: 'price',
         *          header: 'Total',
         *          aggregator: 'sum',
         *          exportStyle: [{
         *              type: 'html', // used by the `html` exporter
         *              format: 'Currency',
         *              alignment: {
         *                  horizontal: 'Right'
         *              },
         *              font: {
         *                  italic: true
         *              }
         *          },{
         *              type: 'csv', // used by the `csv` exporter
         *              format: 'General'
         *          }]
         *      }]
         *
         *
         * Or you can define it as an array of objects that has:
         *
         * - one object with no `type` key that is considered the style to use by all exporters
         * - objects with the `type` key defined that are exceptions of the above rule
         *
         *
         *      aggregate: [{
         *          dataIndex: 'price',
         *          header: 'Total',
         *          aggregator: 'sum',
         *          exportStyle: [{
         *              // no type defined means this is the default
         *              format: 'Currency',
         *              alignment: {
         *                  horizontal: 'Right'
         *              },
         *              font: {
         *                  italic: true
         *              }
         *          },{
         *              type: 'csv', // only the CSV exporter has a special style
         *              format: 'General'
         *          }]
         *      }]
         *
         */
        exportStyle:        null,

        /**
         * @cfg {Object} scope
         *
         * Scope to run all custom functions defined on the dimension item.
         */
        scope:              null,

        /**
         * @cfg {Function} grouperFn
         *
         * This function is used when the groups are generated for the axis.
         * It will return the value that will uniquely identify a group on the axis.
         *
         * ie: you have a Date field that you want to group by year.
         * This renderer could return the year from that Date value.
         *
         * The function receives one parameter and that is the record.
         *
         * @param {Ext.data.Model} record Record used to extract the group value
         * @return {String/Number}
         */
        grouperFn:          null,

        /**
         * @cfg {String} [blankText="(blank)"]
         * Default text to use when a group name is blank. This value is applied even if you set your own label renderer.
         */
        blankText:          '(blank)',

        /**
         * @cfg {Boolean} [showZeroAsBlank=false]
         * Should 0 values be displayed as blank? This config is used when
         * this is an aggregate dimension.
         */
        showZeroAsBlank:    false,

        /**
         * @cfg {String/Function} [aggregator="sum"]
         * This is the function that should be used to aggregate when this is an aggregate dimension.
         *
         * You can either provide a function name available in {@link Ext.pivot.Aggregators} or
         * set your own function.
         *
         * It's probably best to override {@link Ext.pivot.Aggregators} to add you own function
         * and use that function name on this config. This way the stateles pivot will save this value.
         */
        aggregator:         'sum',

        /**
         * @cfg {Ext.util.MixedCollection} values
         * Collection of unique values on this dimension; each item has a "value" and a "display".
         */
        values:             null
    },

    /**
     * @property {Boolean} isAggregate
     * True to identify a dimension of an aggregate configuration.
     */
    isAggregate:        false,

    /**
     * @property {Ext.pivot.matrix.Base} matrix
     * @readonly
     * Reference to the matrix object.
     */
    matrix:             null,

    constructor: function(config){
        var me = this,
            cfg = Ext.apply({id: Ext.id()}, config || {});

        this.initConfig(cfg);

        if(Ext.isEmpty(me.getId())){
            // generate an internal id used by the matrix
            me.setId(Ext.id());
        }

        //<debug>
        if(Ext.isEmpty(me.dataIndex)){
            Ext.raise('No dataIndex provided to the dimension!');
        }
        //</debug>

        if(Ext.isEmpty(me.getGrouperFn())){
            me.setGrouperFn('');
        }
        if(me.getSortable() && !me.getSorterFn()){
            me.setSorterFn(me.defaultSorterFn);
        }
        if(Ext.isEmpty(me.getSortIndex())){
            me.setSortIndex(me.getDataIndex());
        }

        if(me.isAggregate && !me.getFormatter() && !me.getRenderer()){
            // in most cases the aggregate value is a number
            me.setRenderer(me.getDefaultFormatRenderer('0,000.00'));
        }

        return this.callParent(arguments);
    },
    
    destroy: function(){
        var me = this;

        Ext.destroyMembers(me, 'values', 'filter');
        me.matrix = me.values = me.filter = null;
    },
    
    /**
     * Returns the serialized dimension data.
     */
    serialize: function(){
        var me = this,
            cfg = me.getConfig();

        delete(cfg.values);
        return Ext.apply(cfg, {
            filter:     me.filter ? me.filter.serialize() : null,
            aggregator: Ext.isString(cfg.aggregator) ? cfg.aggregator : 'sum' // functions cannot be serialized
        });
    },

    applyAggregator: function(agg, oldAgg){
        var aggregators = Ext.pivot.Aggregators;

        if(agg == null) {
            delete(this.aggregatorFn);
            return agg;
        }

        if (Ext.isEmpty(agg)) {
            agg = 'sum';
        }
        if (Ext.isString(agg) && Ext.isFunction(aggregators[agg])) {
            this.aggregatorFn = Ext.bind(aggregators[agg], aggregators);
        } else {
            this.aggregatorFn = agg;
        }
        return agg;
    },

    updateExportStyle: function(style){
        if(style && !style.id){
            style.id = this.getId();
        }
    },

    updateGrouperFn: function(fn){
        if(Ext.isEmpty(fn)){
            this.groupFn = Ext.bind(this.defaultGrouperFn, this);
        }else{
            this.groupFn = fn;
        }
    },

    applyFilter: function(filter, oldFilter){
        if(filter == null){
            return filter;
        }

        if(filter && filter.isFilter){
            filter.parent = this;
            return filter;
        }


        if(Ext.isObject(filter)){
            Ext.applyIf(filter, {
                type:   'label',
                parent: this
            });
            filter = Ext.Factory.pivotfilter(filter);
        }else{
            filter = false;
        }

        return filter;
    },
    
    /**
     * Add unique values available for this dimension. These are used when filtering.
     *
     * @param value
     * @param display
     */
    addValue: function(value, display){
        var values = this.getValues();

        if(!values.getByKey(value)){
            values.add({
                value:      value,
                display:    display
            });
        }
    },
    
    /**
     * Returns the collection of unique values available for this dimension.
     */
    getValues: function(){
        var ret = this.values;

        if(!ret) {
            ret = Ext.create('Ext.pivot.MixedCollection');
            ret.getKey = function (item) {
                return item.value;
            };
            this.setValues(ret);
        }
        return ret;
    },

    /**
     * Default sorter function used to sort the axis dimensions on the same tree level.
     *
     * @param o1
     * @param o2
     *
     * @returns {Number}
     */
    defaultSorterFn: function(o1, o2){
        var me = this,
            s1 = o1.sortValue,
            s2 = o2.sortValue,
            result;
        
        if(s1 instanceof Date){
            s1 = s1.getTime();
        }
        if(s2 instanceof Date){
            s2 = s2.getTime();
        }
        if(!me.caseSensitiveSort){
            s1 = String(s1).toUpperCase();
            s2 = String(s2).toUpperCase();
        }
        result = Ext.pivot.matrix.Base.prototype.naturalSort(s1, s2);
        
        if(result < 0 && me.direction === 'DESC'){
            return 1;
        }
        if(result > 0 && me.direction === 'DESC'){
            return -1;
        }
        return result;
    },
    
    /**
     * Builds a renderer function by using the specified format.
     *
     * @param format Could be either a function or a string
     */
    getDefaultFormatRenderer: function(format){
        var me = this;
        
        return function(v){
            var positive;
            
            if(Ext.isEmpty(format)){
                return v;
            }
            
            if(Ext.isFunction(format)){
                return format.apply(me, arguments);
            }
            
            if(!Ext.isNumber(v)) {
                return v;
            }

            if(me.isAggregate && v === 0 && me.showZeroAsBlank){
                return '';
            }
            
            positive = (v >= 0);
            v = Math.abs(v);
            v = Ext.util.Format.number(v, format);

            return positive ? v : '-' + v;
        }
    },
    
    /**
     * Default grouper function used for rendering axis item values.
     * The grouper function can be used to group together multiple items.
     * Returns a group value
     *
     * @param record
     */
    defaultGrouperFn: function(record) {
        return record.get(this.dataIndex);
    },

    getFormatterFn: function(){
        var me = this,
            format = me.getFormatter(),
            scoped;

        if(format){
            scoped = format.indexOf('this.') === 0;
            if(scoped){
                format = format.substring(5);
            }
            format = Ext.app.bind.Template.prototype.parseFormat(format);
            if(scoped){
                format.scope = null;
            }

            return function(v){
                return format.format(v, format.scope || me.getScope() || me.matrix.cmp.resolveListenerScope('self.controller') || this);
            }
        }
    },

    /**
     * @method
     * This function is used when we summarize the records for a left/top pair.
     *
     * @private
     */
    aggregatorFn: Ext.emptyFn,

    /**
     * @method
     * This function is used when the axis item value is generated. It will either be the defaultGrouperFn or a custom one.
     * It will run using Ext.callback to you can also provide a String that resolves to the view controller.
     *
     * @private
     */
    groupFn: Ext.emptyFn

});
