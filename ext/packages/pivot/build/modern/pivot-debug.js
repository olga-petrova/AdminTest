Ext.define('Ext.overrides.drag.Info', {
    override: 'Ext.drag.Info',
    /**.
     * Find the element that matches the cursor position and selector.
     *
     * @param {String} selector The simple selector to test. See {@link Ext.dom.Query} for information about simple selectors.
     * @param {Number/String/HTMLElement/Ext.dom.Element} [limit]
     * The max depth to search as a number or an element that causes the upward
     * traversal to stop and is **not** considered for inclusion as the result.
     * (defaults to 50 || document.documentElement)
     * @param {Boolean} [returnDom=false] True to return the DOM node instead of Ext.dom.Element
     * @return {Ext.dom.Element/HTMLElement} The matching DOM node (or HTMLElement if
     * _returnDom_ is _true_).  Or null if no match was found.
     */
    getCursorElement: function(selector, limit, returnDom) {
        var pos = this.cursor.current,
            elPoint = Ext.drag.Manager.elementFromPoint(pos.x, pos.y);
        return Ext.fly(elPoint).up(selector, limit, returnDom);
    }
});

Ext.define('Ext.overrides.grid.column.Column', {
    override: 'Ext.grid.column.Column',
    updateSortIndicator: function(direction) {
        var me = this,
            oldDirection = me._sortDirection,
            sortedCls = me.getSortedCls();
        if (oldDirection) {
            me.element.removeCls(sortedCls + '-' + oldDirection.toLowerCase());
        }
        if (direction) {
            me.element.addCls(sortedCls + '-' + direction.toLowerCase());
        }
        me._sortDirection = direction;
    }
});

/**
 * This class contains all predefined aggregator functions for the pivot grid.
 *
 * For each summary function (ie `fn`) defined in this class there's a property name (ie `fnText`) which will be
 * used by the configurator plugin to display the function used for each aggregate dimension.
 *
 * Override this class if more aggregate functions are needed:
 *
 *      Ext.define('overrides.pivot.Aggregators', {
 *          override: 'Ext.pivot.Aggregators',
 *
 *          fnText: 'My special fn', // useful when using the Configurator plugin
 *          fn: function(records, measure, matrix, rowGroupKey, colGroupKey){
 *              var result;
 *
 *              // ... calculate the result
 *
 *              return result;
 *          }
 *      });
 *
 * @singleton
 *
 */
Ext.define('Ext.pivot.Aggregators', {
    alternateClassName: [
        'Mz.aggregate.Aggregators'
    ],
    singleton: true,
    /**
     * @property {String} customText
     *
     * **Note:** Used by the {@link Ext.pivot.plugin.Configurator configurator plugin} when listing all functions that can
     * be used on an aggregate dimension.
     */
    customText: 'Custom',
    /**
     * @property {String} sumText
     *
     * Defines the name of the {@link #sum} function.
     *
     * **Note:** Used by the {@link Ext.pivot.plugin.Configurator configurator plugin} when listing all functions that can
     * be used on an aggregate dimension.
     */
    sumText: 'Sum',
    /**
     * @property {String} avgText
     *
     * Defines the name of the {@link #avg} function.
     *
     * **Note:** Used by the {@link Ext.pivot.plugin.Configurator configurator plugin} when listing all functions that can
     * be used on an aggregate dimension.
     */
    avgText: 'Avg',
    /**
     * @property {String} minText
     *
     * Defines the name of the {@link #min} function.
     *
     * **Note:** Used by the {@link Ext.pivot.plugin.Configurator configurator plugin} when listing all functions that can
     * be used on an aggregate dimension.
     */
    minText: 'Min',
    /**
     * @property {String} maxText
     *
     * Defines the name of the {@link #max} function.
     *
     * **Note:** Used by the {@link Ext.pivot.plugin.Configurator configurator plugin} when listing all functions that can
     * be used on an aggregate dimension.
     */
    maxText: 'Max',
    /**
     * @property {String} countText
     *
     * Defines the name of the {@link #count} function.
     *
     * **Note:** Used by the {@link Ext.pivot.plugin.Configurator configurator plugin} when listing all functions that can
     * be used on an aggregate dimension.
     */
    countText: 'Count',
    /**
     * @property {String} groupSumPercentageText
     *
     * Defines the name of the {@link #groupSumPercentage} function.
     *
     * **Note:** Used by the {@link Ext.pivot.plugin.Configurator configurator plugin} when listing all functions that can
     * be used on an aggregate dimension.
     */
    groupSumPercentageText: 'Group sum percentage',
    /**
     * @property {String} groupCountPercentageText
     *
     * Defines the name of the {@link #groupCountPercentage} function.
     *
     * **Note:** Used by the {@link Ext.pivot.plugin.Configurator configurator plugin} when listing all functions that can
     * be used on an aggregate dimension.
     */
    groupCountPercentageText: 'Group count percentage',
    /**
     * @property {String} varianceText
     *
     * Defines the name of the {@link #variance} function.
     *
     * **Note:** Used by the {@link Ext.pivot.plugin.Configurator configurator plugin} when listing all functions that can
     * be used on an aggregate dimension.
     */
    varianceText: 'Var',
    /**
     * @property {String} variancePText
     *
     * Defines the name of the {@link #varianceP} function.
     *
     * **Note:** Used by the {@link Ext.pivot.plugin.Configurator configurator plugin} when listing all functions that can
     * be used on an aggregate dimension.
     */
    variancePText: 'Varp',
    /**
     * @property {String} stdDevText
     *
     * Defines the name of the {@link #stdDev} function.
     *
     * **Note:** Used by the {@link Ext.pivot.plugin.Configurator configurator plugin} when listing all functions that can
     * be used on an aggregate dimension.
     */
    stdDevText: 'StdDev',
    /**
     * @property {String} stdDevPText
     *
     * Defines the name of the {@link #stdDevP} function.
     *
     * **Note:** Used by the {@link Ext.pivot.plugin.Configurator configurator plugin} when listing all functions that can
     * be used on an aggregate dimension.
     */
    stdDevPText: 'StdDevp',
    /**
     * Calculates the sum of all records using the measure field.
     *
     * @param {Array} records Records to process.
     * @param {String} measure Field to aggregate by.
     * @param {Ext.pivot.matrix.Base} matrix The matrix object reference.
     * @param {String} rowGroupKey Key of the left axis item.
     * @param {String} colGroupKey Key of the top axis item.
     *
     * @return {Number}
     */
    sum: function(records, measure, matrix, rowGroupKey, colGroupKey) {
        var length = records.length,
            total = 0,
            i;
        for (i = 0; i < length; i++) {
            total += Ext.Number.from(records[i].get(measure), 0);
        }
        return total;
    },
    /**
     * Calculates the avg of all records using the measure field.
     *
     * @param {Array} records Records to process.
     * @param {String} measure Field to aggregate by.
     * @param {Ext.pivot.matrix.Base} matrix The matrix object reference.
     * @param {String} rowGroupKey Key of the left axis item.
     * @param {String} colGroupKey Key of the top axis item.
     *
     * @return {Number}
     */
    avg: function(records, measure, matrix, rowGroupKey, colGroupKey) {
        var length = records.length,
            total = 0,
            i;
        for (i = 0; i < length; i++) {
            total += Ext.Number.from(records[i].get(measure), 0);
        }
        return length > 0 ? (total / length) : 0;
    },
    /**
     * Calculates the min of all records using the measure field.
     *
     * @param {Array} records Records to process.
     * @param {String} measure Field to aggregate by.
     * @param {Ext.pivot.matrix.Base} matrix The matrix object reference.
     * @param {String} rowGroupKey Key of the left axis item.
     * @param {String} colGroupKey Key of the top axis item.
     *
     * @return {Number}
     */
    min: function(records, measure, matrix, rowGroupKey, colGroupKey) {
        var data = [],
            length = records.length,
            i, v;
        for (i = 0; i < length; i++) {
            data.push(records[i].get(measure));
        }
        v = Ext.Array.min(data);
        return v;
    },
    /**
     * Calculates the max of all records using the measure field.
     *
     * @param {Array} records Records to process.
     * @param {String} measure Field to aggregate by.
     * @param {Ext.pivot.matrix.Base} matrix The matrix object reference.
     * @param {String} rowGroupKey Key of the left axis item.
     * @param {String} colGroupKey Key of the top axis item.
     *
     * @return {Number}
     */
    max: function(records, measure, matrix, rowGroupKey, colGroupKey) {
        var data = [],
            length = records.length,
            i;
        for (i = 0; i < length; i++) {
            data.push(records[i].get(measure));
        }
        v = Ext.Array.max(data);
        return v;
    },
    /**
     * Calculates the count of all records using the measure field.
     *
     * @param {Array} records Records to process.
     * @param {String} measure Field to aggregate by.
     * @param {Ext.pivot.matrix.Base} matrix The matrix object reference.
     * @param {String} rowGroupKey Key of the left axis item.
     * @param {String} colGroupKey Key of the top axis item.
     *
     * @return {Number}
     */
    count: function(records, measure, matrix, rowGroupKey, colGroupKey) {
        return records.length;
    },
    /**
     * Calculates the percentage from the row group sum.
     *
     * @param {Array} records Records to process.
     * @param {String} measure Field to aggregate by.
     * @param {Ext.pivot.matrix.Base} matrix The matrix object reference.
     * @param {String} rowGroupKey Key of the left axis item.
     * @param {String} colGroupKey Key of the top axis item.
     *
     * @return {Number}
     */
    groupSumPercentage: function(records, measure, matrix, rowGroupKey, colGroupKey) {
        var sumFn = Ext.pivot.Aggregators.sum,
            length = records.length,
            result, resultParent,
            sum = 0,
            sumParent = 0,
            keys = rowGroupKey.split(matrix.keysSeparator);
        if (length == 0)  {
            return 0;
        }
        
        keys.pop();
        keys = keys.join(matrix.keysSeparator);
        if (Ext.isEmpty(keys)) {
            keys = matrix.grandTotalKey;
        }
        result = matrix.results.get(rowGroupKey, colGroupKey);
        if (result) {
            sum = result.getValue('groupSum');
            if (!Ext.isDefined(sum)) {
                sum = result.calculateByFn('groupSum', measure, sumFn);
            }
        }
        resultParent = matrix.results.get(keys, colGroupKey);
        if (resultParent) {
            sumParent = resultParent.getValue('groupSum');
            if (!Ext.isDefined(sumParent)) {
                sumParent = resultParent.calculateByFn('groupSum', measure, sumFn);
            }
        }
        return (sumParent > 0 && sum > 0) ? sum / sumParent * 100 : 0;
    },
    /**
     * Calculates the percentage from the row group count.
     *
     * @param {Array} records Records to process.
     * @param {String} measure Field to aggregate by.
     * @param {Ext.pivot.matrix.Base} matrix The matrix object reference.
     * @param {String} rowGroupKey Key of the left axis item.
     * @param {String} colGroupKey Key of the top axis item.
     *
     * @return {Number}
     */
    groupCountPercentage: function(records, measure, matrix, rowGroupKey, colGroupKey) {
        var countFn = Ext.pivot.Aggregators.count,
            length = records.length,
            result, resultParent,
            sum = 0,
            sumParent = 0,
            keys = rowGroupKey.split(matrix.keysSeparator);
        if (length == 0)  {
            return 0;
        }
        
        keys.pop();
        keys = keys.join(matrix.keysSeparator);
        if (Ext.isEmpty(keys)) {
            keys = matrix.grandTotalKey;
        }
        result = matrix.results.get(rowGroupKey, colGroupKey);
        if (result) {
            sum = result.getValue('groupCount');
            if (!Ext.isDefined(sum)) {
                sum = result.calculateByFn('groupCount', measure, countFn);
            }
        }
        resultParent = matrix.results.get(keys, colGroupKey);
        if (resultParent) {
            sumParent = resultParent.getValue('groupCount');
            if (!Ext.isDefined(sumParent)) {
                sumParent = resultParent.calculateByFn('groupCount', measure, countFn);
            }
        }
        return (sumParent > 0 && sum > 0) ? sum / sumParent * 100 : 0;
    },
    /**
     * Calculates the sample variance of all records using the measure field.
     *
     * @param {Array} records Records to process.
     * @param {String} measure Field to aggregate by.
     * @param {Ext.pivot.matrix.Base} matrix The matrix object reference.
     * @param {String} rowGroupKey Key of the left axis item.
     * @param {String} colGroupKey Key of the top axis item.
     *
     * @return {Number}
     */
    variance: function(records, measure, matrix, rowGroupKey, colGroupKey) {
        var me = Ext.pivot.Aggregators,
            length = records.length,
            avg = me.avg.apply(me, arguments),
            total = 0,
            i;
        if (avg > 0) {
            for (i = 0; i < length; i++) {
                total += Math.pow(Ext.Number.from(records[i].get(measure), 0) - avg, 2);
            }
        }
        return (total > 0 && length > 1) ? (total / (length - 1)) : 0;
    },
    /**
     * Calculates the population variance of all records using the measure field.
     *
     * @param {Array} records Records to process.
     * @param {String} measure Field to aggregate by.
     * @param {Ext.pivot.matrix.Base} matrix The matrix object reference.
     * @param {String} rowGroupKey Key of the left axis item.
     * @param {String} colGroupKey Key of the top axis item.
     *
     * @return {Number}
     */
    varianceP: function(records, measure, matrix, rowGroupKey, colGroupKey) {
        var me = Ext.pivot.Aggregators,
            length = records.length,
            avg = me.avg.apply(me, arguments),
            total = 0,
            i;
        if (avg > 0) {
            for (i = 0; i < length; i++) {
                total += Math.pow(Ext.Number.from(records[i].get(measure), 0) - avg, 2);
            }
        }
        return (total > 0 && length > 0) ? (total / length) : 0;
    },
    /**
     * Calculates the sample standard deviation of all records using the measure field.
     *
     * @param {Array} records Records to process.
     * @param {String} measure Field to aggregate by.
     * @param {Ext.pivot.matrix.Base} matrix The matrix object reference.
     * @param {String} rowGroupKey Key of the left axis item.
     * @param {String} colGroupKey Key of the top axis item.
     *
     * @return {Number}
     */
    stdDev: function(records, measure, matrix, rowGroupKey, colGroupKey) {
        var me = Ext.pivot.Aggregators,
            v = me.variance.apply(me, arguments);
        return v > 0 ? Math.sqrt(v) : 0;
    },
    /**
     * Calculates the population standard deviation of all records using the measure field.
     *
     * @param {Array} records Records to process.
     * @param {String} measure Field to aggregate by.
     * @param {Ext.pivot.matrix.Base} matrix The matrix object reference.
     * @param {String} rowGroupKey Key of the left axis item.
     * @param {String} colGroupKey Key of the top axis item.
     *
     * @return {Number}
     */
    stdDevP: function(records, measure, matrix, rowGroupKey, colGroupKey) {
        var me = Ext.pivot.Aggregators,
            v = me.varianceP.apply(me, arguments);
        return v > 0 ? Math.sqrt(v) : 0;
    }
});

/**
 *
 * This class enhances the {@link Ext.util.MixedCollection} class by allowing the
 * children objects to be destroyed on remove.
 *
 * @private
 *
 */
Ext.define('Ext.pivot.MixedCollection', {
    extend: 'Ext.util.MixedCollection',
    alternateClassName: [
        'Mz.aggregate.MixedCollection'
    ],
    removeAt: function(index) {
        Ext.destroy(this.callParent(arguments));
    },
    clear: function() {
        Ext.destroy(this.items);
        this.callParent(arguments);
    },
    removeAll: function() {
        Ext.destroy(this.items);
        this.callParent(arguments);
    },
    destroy: function() {
        // destroy all objects in the items array
        this.clear();
    }
});

/**
 * Base implementation of a filter. It handles common type of filters.
 *
 */
Ext.define('Ext.pivot.filter.Base', {
    alternateClassName: [
        'Mz.aggregate.filter.Abstract'
    ],
    alias: 'pivotfilter.base',
    mixins: [
        'Ext.mixin.Factoryable'
    ],
    /**
     * @cfg {String} mztype
     *
     * @deprecated 6.0 Use {@link #type} instead. The old type config was renamed to {@link #operator}.
     */
    /**
     * @cfg {String} [type=abstract]
     *
     * Used when you define a filter on a dimension to set what kind of filter is to be
     * instantiated.
     */
    /**
     * @cfg {String} operator (required)
     *
     * Operator to use to compare labels/values to this Filter's {@link #value}.
     *
     * The `between` and `not between` operators expect this filter's {@link #value} to be an array with two values.
     *
     * Possible values are:
     *
     *    * `<`
     *    * `<=`
     *    * `=`
     *    * `>=`
     *    * `>`
     *    * `!=`
     *    * `between`
     *    * `not between`
     */
    operator: null,
    /**
     * @cfg {String} from
     * @deprecated 6.0 Use {@link #value} instead as an array with 2 values.
     *
     * Used in case of a 'between/not between' type of filter
     *
     */
    /**
     * @cfg {String} to
     * @deprecated 6.0 Use {@link #value} instead as an array with 2 values.
     *
     * Used in case of a 'between/not between' operator
     *
     */
    /**
     * @cfg {String/Array} value (required)
     *
     * Value to filter by. For 'between' and 'not between' operators this should be an array of values.
     */
    value: null,
    /**
     * @cfg {Boolean} [caseSensitive=true]
     *
     * During filtering should we use case sensitive comparison?
     *
     */
    caseSensitive: true,
    /**
     * @property {Ext.pivot.dimension.Item} parent Reference to the parent dimension object.
     * @readonly
     *
     * @private
     */
    parent: null,
    isFilter: true,
    constructor: function(config) {
        var me = this,
            fmt = Ext.util.Format;
        // define thousand and decimal separator regexp
        me.thousandRe = new RegExp('[' + fmt.thousandSeparator + ']', 'g');
        me.decimalRe = new RegExp('[' + fmt.decimalSeparator + ']');
        Ext.apply(this, config);
        return this.callParent([
            config
        ]);
    },
    destroy: function() {
        var me = this;
        me.parent = me.thousandRe = me.decimalRe = null;
        me.callParent();
    },
    /**
     * Returns the serialized filter data as an object.
     *
     * @returns {Object}
     */
    serialize: function() {
        var me = this;
        return Ext.apply({
            type: me.type,
            operator: me.operator,
            value: me.value,
            caseSensitive: me.caseSensitive
        }, me.getSerialArgs() || {});
    },
    /**
     * @method
     * Template method to be implemented by all subclasses that is used to
     * get and return serialized filter data.
     *
     * Defaults to Ext.emptyFn.
     *
     */
    getSerialArgs: Ext.emptyFn,
    /**
     * Check if the specified value matches the filter.
     *
     * @returns Boolean True if the value matches the filter
     * @param value
     *
     */
    isMatch: function(value) {
        var me = this,
            v = me.value,
            ret, retFrom, retTo, from, to;
        v = (Ext.isArray(v) ? v[0] : v) || '';
        ret = me.compare(value, v);
        if (me.operator == '=') {
            return (ret === 0);
        }
        if (me.operator == '!=') {
            return (ret !== 0);
        }
        if (me.operator == '>') {
            return (ret > 0);
        }
        if (me.operator == '>=') {
            return (ret >= 0);
        }
        if (me.operator == '<') {
            return (ret < 0);
        }
        if (me.operator == '<=') {
            return (ret <= 0);
        }
        v = me.value;
        from = (Ext.isArray(v) ? v[0] : v) || '';
        to = (Ext.isArray(v) ? v[1] : v) || '';
        retFrom = me.compare(value, from);
        retTo = me.compare(value, to);
        if (me.operator == 'between') {
            return (retFrom >= 0 && retTo <= 0);
        }
        if (me.operator == 'not between') {
            return !(retFrom >= 0 && retTo <= 0);
        }
        // no valid operator was specified. ignore filtering
        return true;
    },
    /**
     * Check if the specified value is a number and returns it.
     *
     * Takes care of the regional settings (decimal and thousand separators).
     *
     * @param value
     * @return {Number} Returns the number or null if the value is not numeric
     * @private
     */
    parseNumber: function(value) {
        var v;
        if (typeof value === 'number') {
            return value;
        }
        if (Ext.isEmpty(value)) {
            value = '';
        }
        // if the value comes as a string it may be a number formatted using locale settings
        // which means that we need to convert it to a number with `.` decimal separator.
        v = String(value).replace(this.thousandRe, '');
        v = v.replace(this.decimalRe, '.');
        if (Ext.isNumeric(v)) {
            return parseFloat(v);
        }
        return null;
    },
    /**
     * Compare 2 values and return the result.
     *
     * @param a
     * @param b
     * @private
     */
    compare: function(a, b) {
        var sorter = Ext.pivot.matrix.Base.prototype.naturalSort,
            v1 = this.parseNumber(a),
            v2 = this.parseNumber(b);
        if (Ext.isNumber(v1) && Ext.isNumber(v2)) {
            return sorter(v1, v2);
        }
        if (Ext.isDate(a)) {
            if (Ext.isDate(b)) {
                return sorter(a, b);
            } else {
                return sorter(a, Ext.Date.parse(b, Ext.Date.defaultFormat));
            }
        }
        return (this.caseSensitive ? sorter(a || '', b || '') : sorter(String(a || '').toLowerCase(), String(b || '').toLowerCase()));
    }
});

/**
 * Label filter class. Use this filter type when you want to filter
 * the left/top axis results by their values.
 *
 * Example:
 *
 *      {
 *          xtype: 'pivotgrid',
 *          // This example will generate a grid column for the year 2012
 *          // instead of columns for all unique years.
 *          topAxis: [{
 *              dataIndex:  'year',
 *              header:     'Year',
 *              filter: {
 *                  type:       'label',
 *                  operator:   '=',
 *                  value:      2012
 *              }
 *          }]
 *
 *          leftAxis: [{
 *              dataIndex:  'country',
 *              header:     'Country',
 *              filter: {
 *                  type:       'label',
 *                  operator:   'in',
 *                  value:      ['USA', 'Canada', 'Australia']
 *              }
 *          }]
 *      }
 *
 */
Ext.define('Ext.pivot.filter.Label', {
    alternateClassName: [
        'Mz.aggregate.filter.Label'
    ],
    extend: 'Ext.pivot.filter.Base',
    alias: 'pivotfilter.label',
    /**
     * @cfg operator
     * @inheritdoc
     * @localdoc
     *  * `begins`
     *  * `not begins`
     *  * `ends`
     *  * `not ends`
     *  * `contains`
     *  * `not contains`
     *  * `in`
     *  * `not in`
     *
     * The `in` and `not in` operators expect this filter's {@link #value} to be an array of values.
     *
     */
    /**
     * @inheritdoc
     */
    isMatch: function(value) {
        var me = this,
            v;
        if (me.operator == 'begins') {
            return Ext.String.startsWith(String(value || ''), String(me.value || ''), !me.caseSensitive);
        }
        if (me.operator == 'not begins') {
            return !Ext.String.startsWith(String(value || ''), String(me.value || ''), !me.caseSensitive);
        }
        if (me.operator == 'ends') {
            return Ext.String.endsWith(String(value || ''), String(me.value || ''), !me.caseSensitive);
        }
        if (me.operator == 'not ends') {
            return !Ext.String.endsWith(String(value || ''), String(me.value || ''), !me.caseSensitive);
        }
        if (me.operator == 'contains') {
            return me.stringContains(String(value || ''), String(me.value || ''), !me.caseSensitive);
        }
        if (me.operator == 'not contains') {
            return !me.stringContains(String(value || ''), String(me.value || ''), !me.caseSensitive);
        }
        if (me.operator == 'in') {
            return me.foundInArray(me.value);
        }
        if (me.operator == 'not in') {
            return !me.foundInArray(me.value);
        }
        // no valid operator was specified. check if it matches the parent class.
        return me.callParent(arguments);
    },
    foundInArray: function(item) {
        var values = Ext.Array.from(this.value),
            len = values.length,
            found = false,
            i;
        if (this.caseSensitive) {
            return Ext.Array.indexOf(values, item) >= 0;
        } else {
            for (i = 0; i < len; i++) {
                found = found || (String(item).toLowerCase() == String(values[i]).toLowerCase());
                if (found) {
                    break;
                }
            }
            return found;
        }
    },
    /**
     * Check if the specified string contains the substring
     *
     * @param {String} s The original string
     * @param {String} start The substring to check
     * @param {Boolean} [ignoreCase=false] True to ignore the case in the comparison
     *
     * @private
     */
    stringContains: function(s, start, ignoreCase) {
        var result = (start.length <= s.length);
        if (result) {
            if (ignoreCase) {
                s = s.toLowerCase();
                start = start.toLowerCase();
            }
            result = (s.lastIndexOf(start) >= 0);
        }
        return result;
    }
});
/**
     * Checks if a string starts with a substring
     *
     * @deprecated 6.0
     *
     * @method startsWith
     * @param {String} s The original string
     * @param {String} start The substring to check
     * @param {Boolean} [ignoreCase=false] True to ignore the case in the comparison
     */
/**
     * Checks if a string ends with a substring
     *
     * @deprecated 6.0
     *
     * @method endsWith
     * @param {String} s The original string
     * @param {String} end The substring to check
     * @param {Boolean} [ignoreCase=false] True to ignore the case in the comparison
     */

/**
 * Value filter class. Use this filter type when you want to filter
 * the left/top axis results by the grand total summary values.
 *
 * Example for a value filter:
 *
 *      {
 *          xtype: 'pivotgrid',
 *          // This example will generate a column for each year
 *          // that has its grand total value between 1,000 and 15,000.
 *          aggregate: [{
 *              id:         'agg',
 *              dataIndex:  'value',
 *              aggregator: 'sum',
 *              header:     'Total'
 *          }],
 *          topAxis: [{
 *              dataIndex:  'year',
 *              header:     'Year',
 *              filter: {
 *                  type:           'value',
 *                  operator:       'between',
 *                  dimensionId:    'agg',  // this is the id of an aggregate dimension
 *                  value:          [1000, 15000]
 *              }
 *          }]
 *      }
 *
 *
 * Top 10 filter works as following:
 *
 * First of all sort axis groups by grand total value of the specified dimension. The sorting
 * order depends on top/bottom configuration.
 *
 *  - Top/Bottom 10 Items: Keep only the top x items from the groups array
 *
 *  - Top/Bottom 10 Percent: Find first combined values to total at least x percent of the parent grandtotal
 *
 *  - Top/Bottom 10 Sum: Find first combined values to total at least x
 *
 *
 * Example for a top 10 value filter:
 *
 *      {
 *          xtype: 'pivotgrid',
 *          // This example will return the bottom 3 years that have the smallest
 *          // sum of value.
 *          aggregate: [{
 *              id:         'agg',
 *              dataIndex:  'value',
 *              aggregator: 'sum',
 *              header:     'Total'
 *          }],
 *          leftAxis: [{
 *              dataIndex:  'year',
 *              header:     'Year',
 *              filter: {
 *                  type:           'value',
 *                  operator:       'top10',
 *                  dimensionId:    'agg',   // this is the id of an aggregate dimension
 *                  topType:        'items',
 *                  topOrder:       'bottom',
 *                  value:          3
 *              }
 *          }]
 *      }
 *
 */
Ext.define('Ext.pivot.filter.Value', {
    alternateClassName: [
        'Mz.aggregate.filter.Value'
    ],
    extend: 'Ext.pivot.filter.Base',
    alias: 'pivotfilter.value',
    /**
     * @cfg operator
     * @inheritdoc
     * @localdoc
     *    * `top10`
     *
     */
    /**
     * @cfg {String} dimensionId (required)
     *
     * Id of the aggregate dimension used to filter by the specified value
     *
     */
    dimensionId: '',
    /**
     * @cfg {String} [topType="items"]
     *
     * Specify here which kind of Top10 we need to perform.
     * Possible values: items, percent, sum
     *
     */
    topType: 'items',
    /**
     * @cfg {String} [topOrder="top"]
     *
     * Which kind of top10 do you want? Possible values: top, bottom
     *
     */
    topOrder: 'top',
    /**
     * @cfg {Boolean} [topSort=true]
     *
     * Should the top10 results be sorted? If True then the dimension sorting is ignored and
     * the results are sorted by the grand total in DESC (topOrder = top) or ASC (topOrder = bottom) order.
     *
     */
    topSort: true,
    /**
     * @property {Boolean} isTopFilter
     * @readonly
     *
     * Is this a top10 type of filter?
     *
     */
    isTopFilter: false,
    constructor: function(config) {
        var ret = this.callParent([
                config
            ]);
        if (Ext.isEmpty(this.dimensionId)) {
            Ext.raise('dimensionId is mandatory on Value filters');
        }
        this.isTopFilter = (this.operator === 'top10');
        return ret;
    },
    destroy: function() {
        this.dimension = null;
        this.callParent();
    },
    getDimension: function() {
        if (!this.parent.matrix.aggregate.getByKey(this.dimensionId)) {
            Ext.raise('There is no aggregate dimension that matches the dimensionId provided');
        }
        return this.parent.matrix.aggregate.getByKey(this.dimensionId);
    },
    /**
     * @inheritdoc
     */
    getSerialArgs: function() {
        return {
            dimensionId: this.dimensionId,
            topType: this.topType,
            topOrder: this.topOrder
        };
    },
    /**
     * This function performs top10 on the specified array.
     *
     * @param axis
     * @param treeItems
     *
     * @private
     */
    applyFilter: function(axis, treeItems) {
        var me = this,
            items = me.topSort ? treeItems : Ext.Array.clone(treeItems),
            ret = [];
        if (treeItems.length == 0) {
            return ret;
        }
        //sort the items by the grand total value in ASC(top)/DESC(bottom) order
        me.sortItemsByGrandTotal(axis, items);
        switch (me.topType) {
            case 'items':
                ret = me.extractTop10Items(items);
                break;
            case 'sum':
                ret = me.extractTop10Sum(items);
                break;
            case 'percent':
                ret = me.extractTop10Percent(axis, items);
                break;
        }
        if (!me.topSort) {
            items.length = 0;
        }
        return ret;
    },
    /**
     *
     * @param items
     * @returns {Array}
     *
     * @private
     */
    extractTop10Items: function(items) {
        // we have to extract all values which are not part of the top
        // ie: we need to extract top2 but there are 3 values which are the same
        var me = this,
            uniqueValues = [],
            i;
        for (i = 0; i < items.length; i++) {
            if (uniqueValues.indexOf(items[i]['tempVar']) < 0) {
                uniqueValues.push(items[i]['tempVar']);
                if (uniqueValues.length > me.value || (me.value < i + 1 && i > 0)) {
                    break;
                }
            }
        }
        return Ext.Array.slice(items, i);
    },
    /**
     *
     * @param items
     * @returns {Array}
     *
     * @private
     */
    extractTop10Sum: function(items) {
        var me = this,
            sum = 0,
            i;
        for (i = 0; i < items.length; i++) {
            sum += items[i]['tempVar'];
            if (sum >= me.value) {
                break;
            }
        }
        return Ext.Array.slice(items, i + 1);
    },
    /**
     *
     * @param axis
     * @param items
     * @returns {Array}
     *
     * @private
     */
    extractTop10Percent: function(axis, items) {
        var me = this,
            sum = 0,
            keys = items[0].key.split(axis.matrix.keysSeparator),
            i, leftKey, topKey, parentKey, result, grandTotal;
        //let's find the parent grand total
        keys.length--;
        parentKey = (keys.length > 0 ? keys.join(axis.matrix.keysSeparator) : axis.matrix.grandTotalKey);
        leftKey = (axis.isLeftAxis ? parentKey : axis.matrix.grandTotalKey);
        topKey = (axis.isLeftAxis ? axis.matrix.grandTotalKey : parentKey);
        result = axis.matrix.results.get(leftKey, topKey);
        grandTotal = (result ? result.getValue(me.dimensionId) : 0);
        for (i = 0; i < items.length; i++) {
            sum += items[i]['tempVar'];
            if ((sum * 100 / grandTotal) >= me.value) {
                break;
            }
        }
        return Ext.Array.slice(items, i + 1);
    },
    /**
     *
     * @param axis
     * @param items
     *
     * @private
     */
    sortItemsByGrandTotal: function(axis, items) {
        var me = this,
            leftKey, topKey, result, i;
        //let's fetch the grandtotal values and store them in a temp var on each item
        for (i = 0; i < items.length; i++) {
            leftKey = (axis.isLeftAxis ? items[i].key : axis.matrix.grandTotalKey);
            topKey = (axis.isLeftAxis ? axis.matrix.grandTotalKey : items[i].key);
            result = axis.matrix.results.get(leftKey, topKey);
            items[i]['tempVar'] = (result ? result.getValue(me.dimensionId) : 0);
        }
        Ext.Array.sort(items, function(a, b) {
            var result = axis.matrix.naturalSort(a['tempVar'], b['tempVar']);
            if (result < 0 && me.topOrder === 'top') {
                return 1;
            }
            if (result > 0 && me.topOrder === 'top') {
                return -1;
            }
            return result;
        });
    }
});

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
        id: '',
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
        header: '',
        /**
         * @cfg {String} dataIndex (required)
         * The field name on the record from where this dimension extracts data.
         */
        dataIndex: '',
        /**
         * @cfg {String} sortIndex
         * Field name on the record used when sorting this dimension results. Defaults to {@link #dataIndex} if
         * none is specified.
         */
        sortIndex: '',
        /**
         * @cfg {Number} [width=100]
         * Default column width when this dimension is a left axis or aggregate dimension.
         * Used by the generated columns.
         */
        width: 100,
        /**
         * @cfg {Number} [flex=0]
         * Column flex when this dimension is a left axis or aggregate dimension.
         * Used by the generated columns.
         */
        flex: 0,
        /**
         * @cfg {String} [align="left"]
         * Column alignment when this dimension is a left axis or aggregate dimension.
         * Used by the generated columns.
         */
        align: 'left',
        /**
         * @cfg {Boolean} [sortable=true]
         * Is this dimension sortable when the pivot is generated?
         */
        sortable: true,
        /**
         * @cfg {"ASC"/"DESC"} [direction="ASC"]
         * If this dimension is sortable then this is the type of sorting.
         */
        direction: 'ASC',
        /**
         * @cfg {Function} sorterFn
         * Provide here your own sorting function for this dimension.
         * If none is specified then the defaultSorterFn is used.
         */
        sorterFn: null,
        /**
         * @cfg {Boolean} [caseSensitiveSort=true]
         * If this dimension is sortable, should we do a case sensitive sort?
         */
        caseSensitiveSort: true,
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
        filter: null,
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
        labelRenderer: null,
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
        renderer: null,
        /**
         * @cfg {String} formatter
         *
         * This formatter will be attached to the grid column generated for this dimension.
         *
         * **Note:** This works when the dimension is used either as a left axis or an aggregate dimension.
         *
         * Read more about grid column formatters {@link Ext.grid.column.Column#formatter here}.
         */
        formatter: null,
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
        exportStyle: null,
        /**
         * @cfg {Object} scope
         *
         * Scope to run all custom functions defined on the dimension item.
         */
        scope: null,
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
        grouperFn: null,
        /**
         * @cfg {String} [blankText="(blank)"]
         * Default text to use when a group name is blank. This value is applied even if you set your own label renderer.
         */
        blankText: '(blank)',
        /**
         * @cfg {Boolean} [showZeroAsBlank=false]
         * Should 0 values be displayed as blank? This config is used when
         * this is an aggregate dimension.
         */
        showZeroAsBlank: false,
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
        aggregator: 'sum',
        /**
         * @cfg {Ext.util.MixedCollection} values
         * Collection of unique values on this dimension; each item has a "value" and a "display".
         */
        values: null
    },
    /**
     * @property {Boolean} isAggregate
     * True to identify a dimension of an aggregate configuration.
     */
    isAggregate: false,
    /**
     * @property {Ext.pivot.matrix.Base} matrix
     * @readonly
     * Reference to the matrix object.
     */
    matrix: null,
    constructor: function(config) {
        var me = this,
            cfg = Ext.apply({
                id: Ext.id()
            }, config || {});
        this.initConfig(cfg);
        if (Ext.isEmpty(me.getId())) {
            // generate an internal id used by the matrix
            me.setId(Ext.id());
        }
        if (Ext.isEmpty(me.dataIndex)) {
            Ext.raise('No dataIndex provided to the dimension!');
        }
        if (Ext.isEmpty(me.getGrouperFn())) {
            me.setGrouperFn('');
        }
        if (me.getSortable() && !me.getSorterFn()) {
            me.setSorterFn(me.defaultSorterFn);
        }
        if (Ext.isEmpty(me.getSortIndex())) {
            me.setSortIndex(me.getDataIndex());
        }
        if (me.isAggregate && !me.getFormatter() && !me.getRenderer()) {
            // in most cases the aggregate value is a number
            me.setRenderer(me.getDefaultFormatRenderer('0,000.00'));
        }
        return this.callParent(arguments);
    },
    destroy: function() {
        var me = this;
        Ext.destroyMembers(me, 'values', 'filter');
        me.matrix = me.values = me.filter = null;
    },
    /**
     * Returns the serialized dimension data.
     */
    serialize: function() {
        var me = this,
            cfg = me.getConfig();
        delete (cfg.values);
        return Ext.apply(cfg, {
            filter: me.filter ? me.filter.serialize() : null,
            aggregator: Ext.isString(cfg.aggregator) ? cfg.aggregator : 'sum'
        });
    },
    // functions cannot be serialized
    applyAggregator: function(agg, oldAgg) {
        var aggregators = Ext.pivot.Aggregators;
        if (agg == null) {
            delete (this.aggregatorFn);
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
    updateExportStyle: function(style) {
        if (style && !style.id) {
            style.id = this.getId();
        }
    },
    updateGrouperFn: function(fn) {
        if (Ext.isEmpty(fn)) {
            this.groupFn = Ext.bind(this.defaultGrouperFn, this);
        } else {
            this.groupFn = fn;
        }
    },
    applyFilter: function(filter, oldFilter) {
        if (filter == null) {
            return filter;
        }
        if (filter && filter.isFilter) {
            filter.parent = this;
            return filter;
        }
        if (Ext.isObject(filter)) {
            Ext.applyIf(filter, {
                type: 'label',
                parent: this
            });
            filter = Ext.Factory.pivotfilter(filter);
        } else {
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
    addValue: function(value, display) {
        var values = this.getValues();
        if (!values.getByKey(value)) {
            values.add({
                value: value,
                display: display
            });
        }
    },
    /**
     * Returns the collection of unique values available for this dimension.
     */
    getValues: function() {
        var ret = this.values;
        if (!ret) {
            ret = Ext.create('Ext.pivot.MixedCollection');
            ret.getKey = function(item) {
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
    defaultSorterFn: function(o1, o2) {
        var me = this,
            s1 = o1.sortValue,
            s2 = o2.sortValue,
            result;
        if (s1 instanceof Date) {
            s1 = s1.getTime();
        }
        if (s2 instanceof Date) {
            s2 = s2.getTime();
        }
        if (!me.caseSensitiveSort) {
            s1 = String(s1).toUpperCase();
            s2 = String(s2).toUpperCase();
        }
        result = Ext.pivot.matrix.Base.prototype.naturalSort(s1, s2);
        if (result < 0 && me.direction === 'DESC') {
            return 1;
        }
        if (result > 0 && me.direction === 'DESC') {
            return -1;
        }
        return result;
    },
    /**
     * Builds a renderer function by using the specified format.
     *
     * @param format Could be either a function or a string
     */
    getDefaultFormatRenderer: function(format) {
        var me = this;
        return function(v) {
            var positive;
            if (Ext.isEmpty(format)) {
                return v;
            }
            if (Ext.isFunction(format)) {
                return format.apply(me, arguments);
            }
            if (!Ext.isNumber(v)) {
                return v;
            }
            if (me.isAggregate && v === 0 && me.showZeroAsBlank) {
                return '';
            }
            positive = (v >= 0);
            v = Math.abs(v);
            v = Ext.util.Format.number(v, format);
            return positive ? v : '-' + v;
        };
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
    getFormatterFn: function() {
        var me = this,
            format = me.getFormatter(),
            scoped;
        if (format) {
            scoped = format.indexOf('this.') === 0;
            if (scoped) {
                format = format.substring(5);
            }
            format = Ext.app.bind.Template.prototype.parseFormat(format);
            if (scoped) {
                format.scope = null;
            }
            return function(v) {
                return format.format(v, format.scope || me.getScope() || me.matrix.cmp.resolveListenerScope('self.controller') || this);
            };
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

/**
 * The axis has items that are generated when the records are processed.
 *
 * This class stores info about such an item.
 *
 */
Ext.define('Ext.pivot.axis.Item', {
    alternateClassName: [
        'Mz.aggregate.axis.Item'
    ],
    /**
     * @property {Number} level The tree level this item belongs to
     * @readonly
     *
     */
    level: 0,
    /**
     * @cfg {String} key
     *
     * The key that uniquely identifies this item in the tree. The key is a string compound of
     * all parent items keys separated by the matrix keysSeparator
     *
     */
    key: '',
    /**
     * @cfg {String/Number} value The item value as it appears in the store
     *
     */
    value: '',
    /**
     * @cfg {String/Number} sortValue The item sort value as it appears in the store. This value will be used when sorting results.
     *
     */
    sortValue: '',
    /**
     * @cfg {String} name The item name after the grouperFn was applied to the {@link #value}
     *
     */
    name: '',
    /**
     * @cfg {String} id Id of the dimension this item refers to.
     *
     */
    dimensionId: '',
    /**
     * @property {Ext.pivot.dimension.Item} dimension The dimension instance
     * @readonly
     *
     */
    dimension: null,
    /**
     * @property {Ext.pivot.axis.Item[]} children Array of children items this item has
     *
     */
    children: null,
    /**
     * @property {Ext.data.Model} record
     * @readonly
     *
     * When the {@link Ext.pivot.matrix.Local Local} matrix is used this is the pivot store record generated for this axis item.
     * Only bottom level items belonging to the leftAxis have this property.
     *
     */
    record: null,
    records: null,
    /**
     * @property {Ext.pivot.axis.Base} axis Parent axis instance
     * @readonly
     *
     */
    axis: null,
    /**
     * Object that stores all values from all axis items parents
     *
     * @private
     */
    data: null,
    /**
     * @property {Boolean} expanded Is this item expanded or collapsed?
     *
     */
    expanded: false,
    constructor: function(config) {
        var me = this;
        Ext.apply(me, config || {});
        if (Ext.isEmpty(me.sortValue)) {
            me.sortValue = me.value;
        }
        me.callParent(arguments);
    },
    destroy: function() {
        var me = this;
        Ext.destroy(me.children);
        me.axis = me.data = me.dimension = me.record = me.children = me.records = null;
        me.callParent(arguments);
    },
    /**
     * Returns the group total text formatted according to the template defined in the matrix
     *
     */
    getTextTotal: function() {
        var me = this,
            groupHeaderTpl = Ext.XTemplate.getTpl(me.axis.matrix, 'textTotalTpl');
        return groupHeaderTpl.apply({
            groupField: me.dimension.dataIndex,
            columnName: me.dimension.dataIndex,
            name: me.name,
            rows: me.children || []
        });
    },
    /**
     * Expand this item and fire the groupexpand event on the matrix
     *
     * @param {Boolean} includeChildren Expand the children tree too?
     */
    expand: function(includeChildren) {
        var me = this;
        me.expanded = true;
        if (includeChildren === true) {
            me.expandCollapseChildrenTree(true);
        }
        me.axis.matrix.fireEvent('groupexpand', me.axis.matrix, (me.axis.isLeftAxis ? 'row' : 'col'), me);
    },
    /**
     * Collapse this item and fire the groupcollapse event on the matrix
     *
     * @param {Boolean} includeChildren Collapse the children tree too?
     */
    collapse: function(includeChildren) {
        var me = this;
        me.expanded = false;
        if (includeChildren === true) {
            me.expandCollapseChildrenTree(false);
        }
        me.axis.matrix.fireEvent('groupcollapse', me.axis.matrix, (me.axis.isLeftAxis ? 'row' : 'col'), me);
    },
    /**
     * Expand or collapse all children tree of the specified item
     *
     * @private
     */
    expandCollapseChildrenTree: function(state) {
        var me = this,
            i;
        me.expanded = state;
        if (Ext.isArray(me.children)) {
            for (i = 0; i < me.children.length; i++) {
                me.children[i].expandCollapseChildrenTree(state);
            }
        }
    }
});

/**
 *
 * Base implementation of a pivot axis. You may customize multiple dimensions
 * on an axis. Basically this class stores all labels that were generated
 * for the configured dimensions.
 *
 * Example:
 *
 *      leftAxis: [{
 *          dataIndex:  'person',
 *          header:     'Person',
 *          sortable:   false
 *      },{
 *          dataIndex:  'country',
 *          header:     'Country',
 *          direction:  'DESC'
 *      }]
 *
 *
 */
Ext.define('Ext.pivot.axis.Base', {
    alternateClassName: [
        'Mz.aggregate.axis.Abstract'
    ],
    alias: 'pivotaxis.base',
    mixins: [
        'Ext.mixin.Factoryable'
    ],
    requires: [
        'Ext.pivot.MixedCollection',
        'Ext.pivot.dimension.Item',
        'Ext.pivot.axis.Item'
    ],
    /**
     * @cfg {Ext.pivot.dimension.Item[]} dimensions All dimensions configured for this axis.
     *
     */
    dimensions: null,
    /**
     * @property {Ext.pivot.matrix.Base} matrix Matrix instance this axis belongs to.
     *
     */
    matrix: null,
    /**
     * @property {Ext.pivot.MixedCollection} items All items generated for this axis are stored in this collection.
     *
     */
    items: null,
    /**
     * When the tree is built for this axis it is stored in this property.
     *
     * @private
     */
    tree: null,
    /**
     * @property {Number} levels No of levels this axis tree has
     * @readonly
     *
     */
    levels: 0,
    /**
     * @property {Boolean} isLeftAxis Internal flag to know which axis is this one
     * @readonly
     */
    isLeftAxis: false,
    constructor: function(config) {
        var me = this,
            i, sorter;
        if (!config || !config.matrix) {
            Ext.log('Wrong initialization of the axis!');
            return;
        }
        me.isLeftAxis = config.isLeftAxis || me.isLeftAxis;
        me.matrix = config.matrix;
        me.tree = [];
        // init dimensions
        me.dimensions = Ext.create('Ext.pivot.MixedCollection');
        me.dimensions.getKey = function(item) {
            return item.getId();
        };
        me.items = Ext.create('Ext.pivot.MixedCollection');
        me.items.getKey = function(item) {
            return item.key;
        };
        Ext.Array.each(Ext.Array.from(config.dimensions || []), me.addDimension, me);
    },
    destroy: function() {
        var me = this;
        Ext.destroyMembers(me, 'dimensions', 'items', 'tree');
        me.matrix = me.dimensions = me.items = me.tree = null;
    },
    /**
     * Create an {@link Ext.pivot.dimension.Item} object with the specified config and add it to the
     * internal collection of dimensions.
     *
     * @param {Object} config Config object for the {@link Ext.pivot.dimension.Item} that is created.
     */
    addDimension: function(config) {
        var cfg;
        if (!config) {
            return;
        }
        if (config instanceof Ext.pivot.dimension.Item) {
            cfg = config;
            cfg.matrix = this.matrix;
        } else {
            cfg = Ext.create('Ext.pivot.dimension.Item', Ext.apply({
                matrix: this.matrix
            }, config));
        }
        this.dimensions.add(cfg);
    },
    /**
     * Add the specified item to the internal collection of items.
     *
     * @param {Object} item Config object for the {@link Ext.pivot.axis.Item} that is added
     */
    addItem: function(item) {
        var me = this;
        if (!Ext.isObject(item) || Ext.isEmpty(item.key) || Ext.isEmpty(item.value) || Ext.isEmpty(item.dimensionId)) {
            return false;
        }
        item.key = String(item.key);
        item.dimension = me.dimensions.getByKey(item.dimensionId);
        item.name = item.name || Ext.callback(item.dimension.getLabelRenderer(), item.dimension.getScope() || 'self.controller', [
            item.value
        ], 0, me.matrix.cmp) || item.value;
        item.dimension.addValue(item.value, item.name);
        item.axis = me;
        if (!me.items.getByKey(item.key) && item.dimension) {
            me.items.add(Ext.create('Ext.pivot.axis.Item', item));
            return true;
        }
        return false;
    },
    /**
     * Clear all items and the tree.
     *
     */
    clear: function() {
        this.items.clear();
        this.tree = null;
    },
    /**
     * This function parses the internal collection of items and builds a tree.
     * This tree is used by the Matrix class to generate the pivot store and column headers.
     *
     */
    getTree: function() {
        if (!this.tree) {
            this.buildTree();
        }
        return this.tree;
    },
    /**
     * Expand all groups
     */
    expandAll: function() {
        Ext.Array.each(this.getTree(), function(item) {
            item.expandCollapseChildrenTree(true);
        });
        // we fire a single groupexpand event without any item
        this.matrix.fireEvent('groupexpand', this.matrix, (this.isLeftAxis ? 'row' : 'col'), null);
    },
    /**
     * Collapse all groups
     */
    collapseAll: function() {
        Ext.Array.each(this.getTree(), function(item) {
            item.expandCollapseChildrenTree(false);
        });
        // we fire a single groupcollapse event without any item
        this.matrix.fireEvent('groupcollapse', this.matrix, (this.isLeftAxis ? 'row' : 'col'), null);
    },
    /**
     * Find the first element in the tree that matches the criteria (attribute = value).
     *
     * It returns an object with the tree element and depth level.
     *
     * @returns {Object}
     */
    findTreeElement: function(attribute, value) {
        var tree = arguments[2] || this.tree || [],
            level = arguments[3] || 1,
            obj = null;
        var filter = Ext.Array.filter(tree, function(item, index, all) {
                return Ext.isDate(value) ? Ext.Date.isEqual(item[attribute], value) : item[attribute] === value;
            }, this);
        if (filter.length > 0) {
            return {
                level: level,
                node: filter[0]
            };
        }
        Ext.Array.each(tree, function(item, index, all) {
            if (item.children) {
                obj = this.findTreeElement(attribute, value, item.children, level + 1);
                if (obj) {
                    return false;
                }
            }
        }, this);
        return obj;
    },
    /**
     * This function builds the internal tree after all records were processed
     *
     * @private
     */
    buildTree: function() {
        var me = this;
        me.tree = [];
        // build the tree
        me.items.each(me.addItemToTree, me);
        me.sortTree();
    },
    /**
     * Add the specified item to the tree
     *
     * @param item
     *
     * @private
     */
    addItemToTree: function(item) {
        var me = this,
            keys = String(item.key).split(me.matrix.keysSeparator),
            parentKey = '',
            el;
        keys = Ext.Array.slice(keys, 0, keys.length - 1);
        parentKey = keys.join(me.matrix.keysSeparator);
        el = me.findTreeElement('key', parentKey);
        if (el) {
            item.level = el.level;
            item.data = Ext.clone(el.node.data || {});
            el.node.children = el.node.children || [];
            el.node.children.push(item);
        } else {
            item.level = 0;
            item.data = {};
            me.tree.push(item);
        }
        item.data[item.dimension.getId()] = item.name;
        //item.data[item.dimension.getId()] = item.value;
        me.levels = Math.max(me.levels, item.level);
    },
    /**
     * Sort the tree using the sorters defined on the axis dimensions
     *
     * @private
     */
    sortTree: function() {
        var tree = arguments[0] || this.tree,
            dimension;
        if (tree.length > 0) {
            dimension = tree[0].dimension;
        }
        if (dimension && dimension.sortable === true) {
            // let's sort this array
            Ext.Array.sort(tree, function(a, b) {
                return dimension.sorterFn(a, b);
            });
        }
        Ext.Array.each(tree, function(item) {
            if (item.children) {
                this.sortTree(item.children);
            }
        }, this);
    },
    /**
     * Sort the tree by the specified field and direction.
     *
     * If the field is one of the axis dimension then sort by that otherwise go to the records and sort
     * them by that field.
     *
     * @param field
     * @param direction
     *
     * @returns {Boolean}
     * @private
     */
    sortTreeByField: function(field, direction) {
        var me = this,
            sorted = false,
            dimension;
        if (field == me.matrix.compactViewKey) {
            // in compact view we need to sort by all axis dimensions
            sorted = me.sortTreeByDimension(me.tree, me.dimensions.getRange(), direction);
            me.dimensions.each(function(item) {
                item.direction = direction;
            });
        } else {
            direction = direction || 'ASC';
            dimension = me.dimensions.getByKey(field);
            if (dimension) {
                // we need to sort the tree level where this dimension exists
                sorted = me.sortTreeByDimension(me.tree, dimension, direction);
                dimension.direction = direction;
            } else {
                // the field is not a dimension defined on the axis, so it's probably a generated field on the
                // pivot record which means we need to sort by calculated values
                sorted = me.sortTreeByRecords(me.tree, field, direction);
            }
        }
        return sorted;
    },
    /**
     * Sort tree by a specified dimension. The dimension's sorter function is used for sorting.
     *
     * @param tree
     * @param dimension
     * @param direction
     * @returns {Boolean}
     *
     * @private
     */
    sortTreeByDimension: function(tree, dimension, direction) {
        var sorted = false,
            dimensions = Ext.Array.from(dimension),
            aDimension, len, i, temp;
        tree = tree || [];
        len = tree.length;
        if (len > 0) {
            aDimension = tree[0].dimension;
        }
        if (Ext.Array.indexOf(dimensions, aDimension) >= 0) {
            if (aDimension.sortable) {
                // we have to sort this tree items by the dimension sorterFn
                temp = aDimension.direction;
                aDimension.direction = direction;
                Ext.Array.sort(tree, Ext.bind(aDimension.sorterFn, aDimension));
                aDimension.direction = temp;
            }
            // we do not change the dimension direction now since we didn't finish yet
            sorted = aDimension.sortable;
        }
        // the dimension we want to sort may be on leaves
        // in compact view mode we need to sort everything
        for (i = 0; i < len; i++) {
            sorted = this.sortTreeByDimension(tree[i].children, dimension, direction) || sorted;
        }
        // ready now so exit
        return sorted;
    },
    /**
     * Sort tree by values on a generated field on the pivot model.
     *
     * @param tree
     * @param field
     * @param direction
     * @returns {boolean}
     *
     * @private
     */
    sortTreeByRecords: function(tree, field, direction) {
        var i, len;
        tree = tree || [];
        len = tree.length;
        if (len <= 0) {
            return false;
        }
        if (tree[0].record) {
            this.sortTreeRecords(tree, field, direction);
        } else {
            this.sortTreeLeaves(tree, field, direction);
        }
        for (i = 0; i < len; i++) {
            this.sortTreeByRecords(tree[i].children, field, direction);
        }
        return true;
    },
    /**
     * Sort the records array of each item in the tree
     *
     * @param tree
     * @param field
     * @param direction
     *
     * @private
     */
    sortTreeRecords: function(tree, field, direction) {
        var sortFn = this.matrix.naturalSort;
        direction = direction || 'ASC';
        // let's sort the records of this item
        Ext.Array.sort(tree || [], function(a, b) {
            var result,
                o1 = a.record,
                o2 = b.record;
            if (!(o1 && o1.isModel && o2 && o2.isModel)) {
                return 0;
            }
            result = sortFn(o1.get(field) || '', o2.get(field) || '');
            if (result < 0 && direction === 'DESC') {
                return 1;
            }
            if (result > 0 && direction === 'DESC') {
                return -1;
            }
            return result;
        });
    },
    /**
     * Sort tree leaves by their group summary.
     *
     * @param tree
     * @param field
     * @param direction
     *
     * @returns {Boolean}
     *
     * @private
     */
    sortTreeLeaves: function(tree, field, direction) {
        var sortFn = this.matrix.naturalSort,
            results = this.matrix.results,
            matrixModel = this.matrix.model,
            idx = Ext.Array.indexOf(Ext.Array.pluck(matrixModel, 'name'), field),
            col, agg;
        if (idx < 0) {
            return false;
        }
        col = matrixModel[idx]['col'];
        agg = matrixModel[idx]['agg'];
        direction = direction || 'ASC';
        // let's sort the records of this item
        Ext.Array.sort(tree || [], function(a, b) {
            var result, o1, o2;
            o1 = results.get(a.key, col);
            if (o1) {
                o1 = o1.getValue(agg);
            } else {
                o1 = 0;
            }
            o2 = results.get(b.key, col);
            if (o2) {
                o2 = o2.getValue(agg);
            } else {
                o2 = 0;
            }
            result = sortFn(o1, o2);
            if (result < 0 && direction === 'DESC') {
                return 1;
            }
            if (result > 0 && direction === 'DESC') {
                return -1;
            }
            return result;
        });
    }
});

/**
 * Axis implementation specific to {@link Ext.pivot.matrix.Local Local} matrix.
 *
 */
Ext.define('Ext.pivot.axis.Local', {
    alternateClassName: [
        'Mz.aggregate.axis.Local'
    ],
    extend: 'Ext.pivot.axis.Base',
    alias: 'pivotaxis.local',
    /**
     * This method processes the record and creates items for the configured dimensions.
     * If there's at least one label filter set on this axis dimensions and there's no
     * match then the function returns null.
     *
     * @param record
     * @returns {Array/null}
     * @private
     *
     */
    processRecord: function(record) {
        var me = this,
            items = [],
            parentKey = '',
            filterOk = true,
            dimCount = me.dimensions.getCount(),
            groupValue, groupKey, dimension, i;
        for (i = 0; i < dimCount; i++) {
            dimension = me.dimensions.getAt(i);
            groupValue = Ext.callback(dimension.groupFn, dimension.getScope() || 'self.controller', [
                record
            ], 0, me.matrix.cmp);
            groupKey = parentKey ? parentKey + me.matrix.keysSeparator : '';
            groupValue = Ext.isEmpty(groupValue) ? dimension.blankText : groupValue;
            groupKey += me.matrix.getKey(groupValue);
            if (dimension.filter instanceof Ext.pivot.filter.Label) {
                // can't use the groupName to filter. That one could have html code in it because of the renderer
                filterOk = dimension.filter.isMatch(groupValue);
            }
            // if at least one filter has no match then don't add this record
            if (!filterOk) {
                break;
            }
            items.push({
                value: groupValue,
                sortValue: record.get(dimension.sortIndex),
                key: groupKey,
                dimensionId: dimension.getId()
            });
            parentKey = groupKey;
        }
        if (filterOk) {
            return items;
        } else {
            return null;
        }
    },
    /**
     * Build the tree and apply value filters.
     *
     */
    buildTree: function() {
        this.callParent(arguments);
        this.filterTree();
    },
    /**
     * Apply all value filters to the tree.
     *
     * @private
     */
    filterTree: function() {
        var me = this,
            length = me.dimensions.getCount(),
            hasFilters = false,
            i;
        // if at least one dimension has a value filter then parse the tree
        for (i = 0; i < length; i++) {
            hasFilters = hasFilters || (me.dimensions.getAt(i).filter instanceof Ext.pivot.filter.Value);
        }
        if (!hasFilters) {
            return;
        }
        me.matrix.filterApplied = true;
        me.filterTreeItems(me.tree);
    },
    filterTreeItems: function(items) {
        var me = this,
            filter, i, filteredItems;
        if (!items || !Ext.isArray(items) || items.length <= 0) {
            return;
        }
        filter = items[0].dimension.filter;
        if (filter && (filter instanceof Ext.pivot.filter.Value)) {
            if (filter.isTopFilter) {
                filteredItems = filter.applyFilter(me, items) || [];
            } else {
                filteredItems = Ext.Array.filter(items, me.canRemoveItem, me);
            }
            me.removeRecordsFromResults(filteredItems);
            me.removeItemsFromArray(items, filteredItems);
            for (i = 0; i < filteredItems.length; i++) {
                me.removeTreeChildren(filteredItems[i]);
            }
        }
        for (i = 0; i < items.length; i++) {
            if (items[i].children) {
                me.filterTreeItems(items[i].children);
                if (items[i].children.length === 0) {
                    // destroy removed item?
                    me.items.remove(items[i]);
                    // if all children were removed then remove the parent too
                    Ext.Array.erase(items, i, 1);
                    i--;
                }
            }
        }
    },
    removeTreeChildren: function(item) {
        var i, len;
        if (item.children) {
            len = item.children.length;
            for (i = 0; i < len; i++) {
                this.removeTreeChildren(item.children[i]);
            }
        }
        this.items.remove(item);
    },
    canRemoveItem: function(item) {
        var me = this,
            leftKey = (me.isLeftAxis ? item.key : me.matrix.grandTotalKey),
            topKey = (me.isLeftAxis ? me.matrix.grandTotalKey : item.key),
            result = me.matrix.results.get(leftKey, topKey),
            filter = item.dimension.filter;
        return (result ? !filter.isMatch(result.getValue(filter.dimensionId)) : false);
    },
    removeItemsFromArray: function(source, toDelete) {
        for (var i = 0; i < source.length; i++) {
            if (Ext.Array.indexOf(toDelete, source[i]) >= 0) {
                Ext.Array.erase(source, i, 1);
                i--;
            }
        }
    },
    removeRecordsFromResults: function(items) {
        for (var i = 0; i < items.length; i++) {
            this.removeRecordsByItem(items[i]);
        }
    },
    removeRecordsByItem: function(item) {
        var me = this,
            keys, i, results, result, toRemove;
        if (item.children) {
            me.removeRecordsFromResults(item.children);
        }
        if (me.isLeftAxis) {
            toRemove = me.matrix.results.get(item.key, me.matrix.grandTotalKey);
            results = me.matrix.results.getByLeftKey(me.matrix.grandTotalKey);
        } else {
            toRemove = me.matrix.results.get(me.matrix.grandTotalKey, item.key);
            results = me.matrix.results.getByTopKey(me.matrix.grandTotalKey);
        }
        if (!toRemove) {
            return;
        }
        // remove records from grand totals
        for (i = 0; i < results.length; i++) {
            me.removeItemsFromArray(results[i].records, toRemove.records);
        }
        keys = item.key.split(me.matrix.keysSeparator);
        keys.length = keys.length - 1;
        while (keys.length > 0) {
            // remove records from parent groups
            if (me.isLeftAxis) {
                results = me.matrix.results.getByLeftKey(keys.join(me.matrix.keysSeparator));
            } else {
                results = me.matrix.results.getByTopKey(keys.join(me.matrix.keysSeparator));
            }
            for (i = 0; i < results.length; i++) {
                me.removeItemsFromArray(results[i].records, toRemove.records);
            }
            keys.length = keys.length - 1;
        }
    }
});

/**
 * This class remodels the grid store when required.
 *
 * @private
 */
Ext.define('Ext.pivot.feature.PivotStore', {
    config: {
        store: null,
        grid: null,
        matrix: null,
        clsGrandTotal: '',
        clsGroupTotal: '',
        summaryDataCls: '',
        rowCls: ''
    },
    constructor: function(config) {
        this.initConfig(config);
        return this.callParent(arguments);
    },
    destroy: function() {
        var me = this;
        Ext.destroy(me.storeListeners, me.matrixListeners);
        me.setConfig({
            store: null,
            matrix: null,
            grid: null
        });
        me.storeInfo = me.storeListeners = null;
        me.callParent(arguments);
    },
    updateStore: function(store) {
        var me = this;
        Ext.destroy(me.storeListeners);
        if (store) {
            me.storeListeners = store.on({
                // this event is fired by the pivot grid for private use
                pivotstoreremodel: me.processStore,
                scope: me,
                destroyable: true
            });
        }
    },
    updateMatrix: function(matrix) {
        var me = this;
        Ext.destroy(me.matrixListeners);
        if (matrix) {
            me.matrixListeners = matrix.on({
                // this event is fired by the pivot grid for private use
                groupexpand: me.onGroupExpand,
                groupcollapse: me.onGroupCollapse,
                scope: me,
                destroyable: true
            });
        }
    },
    processStore: function() {
        var me = this,
            store = me.getStore(),
            matrix = me.getMatrix(),
            records = [],
            isClassic = Ext.toolkit == 'classic',
            items, length, i, group, fields;
        if (!matrix || !store) {
            return;
        }
        fields = matrix.getColumns();
        store.model.replaceFields(fields, true);
        store.removeAll(true);
        me.storeInfo = {};
        if (matrix.rowGrandTotalsPosition == 'first') {
            records.push.apply(records, me.processGrandTotal() || []);
        }
        items = matrix.leftAxis.getTree();
        length = items.length;
        for (i = 0; i < length; i++) {
            group = items[i];
            records.push.apply(records, me.processGroup({
                group: group,
                previousExpanded: (i > 0 ? items[i - 1].expanded : false)
            }) || []);
        }
        if (matrix.rowGrandTotalsPosition == 'last') {
            records.push.apply(records, me.processGrandTotal() || []);
        }
        store.loadData(records);
        if (!isClassic) {
            store.fireEvent('load', store);
        }
    },
    processGroup: function(config) {
        var me = this,
            fn = me['processGroup' + Ext.String.capitalize(me.getMatrix().viewLayoutType)];
        if (!Ext.isFunction(fn)) {
            // specified view type doesn't exist so let's use the outline view
            fn = me.processGroupOutline;
        }
        return fn.call(me, config);
    },
    processGrandTotal: function() {
        var me = this,
            found = false,
            matrix = me.getMatrix(),
            group = {
                key: matrix.grandTotalKey
            },
            records = [];
        Ext.Array.forEach(matrix.totals || [], function(total) {
            var record = total.record,
                i = matrix.leftAxis.dimensions.getCount();
            if (!(record instanceof Ext.data.Model)) {
                return;
            }
            me.storeInfo[record.internalId] = {
                leftKey: group.key,
                rowStyle: '',
                rowClasses: [
                    me.getClsGrandTotal(),
                    me.getSummaryDataCls()
                ],
                rendererParams: {}
            };
            matrix.leftAxis.dimensions.each(function(column, index) {
                var key;
                if (matrix.viewLayoutType == 'compact' || index === 0) {
                    if (matrix.viewLayoutType == 'compact') {
                        key = matrix.compactViewKey;
                        i = 1;
                    } else {
                        key = column.getId();
                    }
                    record.set(key, total.title);
                    record.commit(false, [
                        key
                    ]);
                    me.storeInfo[record.internalId].rendererParams[key] = {
                        fn: 'groupOutlineRenderer',
                        group: group,
                        colspan: i,
                        hidden: false,
                        subtotalRow: true
                    };
                    found = true;
                } else {
                    me.storeInfo[record.internalId].rendererParams[column.getId()] = {
                        fn: 'groupOutlineRenderer',
                        group: group,
                        colspan: 0,
                        hidden: found,
                        subtotalRow: true
                    };
                    i--;
                }
            });
            // for all top axis columns use a new renderer
            me.storeInfo[record.internalId].rendererParams['topaxis'] = {
                fn: 'topAxisRenderer'
            };
            records.push(record);
        });
        return records;
    },
    // Outline view functions    
    processGroupOutline: function(config) {
        var me = this,
            group = config['group'],
            results = [];
        if (group.record) {
            me.processRecordOutline({
                results: results,
                group: group
            });
        } else {
            me.processGroupOutlineWithChildren({
                results: results,
                group: group,
                previousExpanded: config.previousExpanded
            });
        }
        return results;
    },
    processGroupOutlineWithChildren: function(config) {
        var me = this,
            matrix = me.getMatrix(),
            group = config['group'],
            previousExpanded = config['previousExpanded'],
            hasSummaryData, record, i;
        hasSummaryData = (!group.expanded || (group.expanded && matrix.rowSubTotalsPosition == 'first'));
        record = group.expanded ? group.records.expanded : group.records.collapsed;
        me.processGroupHeaderRecordOutline({
            results: config.results,
            group: group,
            record: record,
            previousExpanded: previousExpanded,
            hasSummaryData: hasSummaryData
        });
        if (group.expanded) {
            if (group.children) {
                for (i = 0; i < group.children.length; i++) {
                    if (group.children[i]['children']) {
                        me.processGroupOutlineWithChildren({
                            results: config.results,
                            group: group.children[i]
                        });
                    } else {
                        me.processRecordOutline({
                            results: config.results,
                            group: group.children[i]
                        });
                    }
                }
            }
            if (matrix.rowSubTotalsPosition == 'last') {
                record = group.records.footer;
                me.processGroupHeaderRecordOutline({
                    results: config.results,
                    group: group,
                    record: record,
                    previousExpanded: previousExpanded,
                    subtotalRow: true,
                    hasSummaryData: true
                });
            }
        }
    },
    processGroupHeaderRecordOutline: function(config) {
        var me = this,
            matrix = me.getMatrix(),
            group = config['group'],
            record = config['record'],
            previousExpanded = config['previousExpanded'],
            subtotalRow = config['subtotalRow'],
            hasSummaryData = config['hasSummaryData'],
            i = matrix.leftAxis.dimensions.getCount(),
            found = false;
        me.storeInfo[record.internalId] = {
            leftKey: group.key,
            rowStyle: '',
            rowClasses: [
                me.getClsGroupTotal(),
                hasSummaryData ? me.getSummaryDataCls() : ''
            ],
            rendererParams: {}
        };
        matrix.leftAxis.dimensions.each(function(column, index) {
            if (column.getId() == group.dimension.getId()) {
                me.storeInfo[record.internalId].rendererParams[column.getId()] = {
                    fn: 'groupOutlineRenderer',
                    group: group,
                    colspan: i,
                    hidden: false,
                    previousExpanded: previousExpanded,
                    subtotalRow: subtotalRow
                };
                found = true;
            } else {
                me.storeInfo[record.internalId].rendererParams[column.getId()] = {
                    fn: 'groupOutlineRenderer',
                    group: group,
                    colspan: 0,
                    hidden: found,
                    previousExpanded: previousExpanded,
                    subtotalRow: subtotalRow
                };
                i--;
            }
        });
        // for all top axis columns use a new renderer
        me.storeInfo[record.internalId].rendererParams['topaxis'] = {
            fn: (hasSummaryData ? 'topAxisRenderer' : 'topAxisNoRenderer')
        };
        config.results.push(record);
    },
    processRecordOutline: function(config) {
        var me = this,
            group = config['group'],
            found = false,
            record = group.record;
        me.storeInfo[record.internalId] = {
            leftKey: group.key,
            rowStyle: '',
            rowClasses: [
                me.getSummaryDataCls()
            ],
            rendererParams: {}
        };
        me.getMatrix().leftAxis.dimensions.each(function(column, index) {
            if (column.getId() == group.dimension.getId()) {
                found = true;
            }
            me.storeInfo[record.internalId].rendererParams[column.getId()] = {
                fn: 'recordOutlineRenderer',
                group: group,
                hidden: !found
            };
        });
        // for all top axis columns use a new renderer
        me.storeInfo[record.internalId].rendererParams['topaxis'] = {
            fn: 'topAxisRenderer'
        };
        config.results.push(record);
    },
    // Compact view functions
    processGroupCompact: function(config) {
        var me = this,
            group = config['group'],
            previousExpanded = config['previousExpanded'],
            results = [];
        if (group.record) {
            me.processRecordCompact({
                results: results,
                group: group
            });
        } else {
            me.processGroupCompactWithChildren({
                results: results,
                group: group,
                previousExpanded: previousExpanded
            });
        }
        return results;
    },
    processGroupCompactWithChildren: function(config) {
        var me = this,
            matrix = me.getMatrix(),
            group = config['group'],
            previousExpanded = config['previousExpanded'],
            hasSummaryData, i;
        hasSummaryData = (!group.expanded || (group.expanded && matrix.rowSubTotalsPosition == 'first'));
        me.processGroupHeaderRecordCompact({
            results: config.results,
            group: group,
            record: group.expanded ? group.records.expanded : group.records.collapsed,
            previousExpanded: previousExpanded,
            hasSummaryData: hasSummaryData
        });
        if (group.expanded) {
            if (group.children) {
                for (i = 0; i < group.children.length; i++) {
                    if (group.children[i]['children']) {
                        me.processGroupCompactWithChildren({
                            results: config.results,
                            group: group.children[i]
                        });
                    } else {
                        me.processRecordCompact({
                            results: config.results,
                            group: group.children[i]
                        });
                    }
                }
            }
            if (matrix.rowSubTotalsPosition == 'last') {
                me.processGroupHeaderRecordCompact({
                    results: config.results,
                    group: group,
                    record: group.records.footer,
                    previousExpanded: previousExpanded,
                    subtotalRow: true,
                    hasSummaryData: true
                });
            }
        }
    },
    processGroupHeaderRecordCompact: function(config) {
        var me = this,
            matrix = me.getMatrix(),
            group = config['group'],
            record = config['record'],
            previousExpanded = config['previousExpanded'],
            subtotalRow = config['subtotalRow'],
            hasSummaryData = config['hasSummaryData'];
        me.storeInfo[record.internalId] = {
            leftKey: group.key,
            rowStyle: '',
            rowClasses: [
                me.getClsGroupTotal(),
                hasSummaryData ? me.getSummaryDataCls() : ''
            ],
            rendererParams: {}
        };
        me.storeInfo[record.internalId].rendererParams[matrix.compactViewKey] = {
            fn: 'groupCompactRenderer',
            group: group,
            colspan: 0,
            previousExpanded: previousExpanded,
            subtotalRow: subtotalRow
        };
        // for all top axis columns use a new renderer
        me.storeInfo[record.internalId].rendererParams['topaxis'] = {
            fn: (hasSummaryData ? 'topAxisRenderer' : 'topAxisNoRenderer')
        };
        config.results.push(record);
    },
    processRecordCompact: function(config) {
        var me = this,
            group = config['group'],
            record = group.record;
        me.storeInfo[record.internalId] = {
            leftKey: group.key,
            rowStyle: '',
            rowClasses: [
                me.getSummaryDataCls()
            ],
            rendererParams: {}
        };
        me.storeInfo[record.internalId].rendererParams[me.getMatrix().compactViewKey] = {
            fn: 'recordCompactRenderer',
            group: group
        };
        // for all top axis columns use a new renderer
        me.storeInfo[record.internalId].rendererParams['topaxis'] = {
            fn: 'topAxisRenderer'
        };
        config.results.push(record);
    },
    doExpandCollapse: function(key, oldRecord) {
        var me = this,
            gridMaster = me.getGrid(),
            group;
        group = me.getMatrix().leftAxis.findTreeElement('key', key);
        if (!group) {
            return;
        }
        me.doExpandCollapseInternal(group.node, oldRecord);
        gridMaster.fireEvent((group.node.expanded ? 'pivotgroupexpand' : 'pivotgroupcollapse'), gridMaster, 'row', group.node);
    },
    doExpandCollapseInternal: function(group, oldRecord) {
        var me = this,
            store = me.getStore(),
            isClassic = Ext.toolkit == 'classic',
            items, oldItems, startIdx, len;
        group.expanded = !group.expanded;
        oldItems = me.processGroup({
            group: group,
            previousExpanded: false
        });
        group.expanded = !group.expanded;
        items = me.processGroup({
            group: group,
            previousExpanded: false
        });
        if (items.length && (startIdx = store.indexOf(oldRecord)) !== -1) {
            if (isClassic) {
                store.suspendEvents();
            }
            if (group.expanded) {
                store.remove(store.getAt(startIdx));
                store.insert(startIdx, items);
                oldItems = [
                    oldRecord
                ];
            } else {
                len = oldItems.length;
                oldItems = store.getRange(startIdx, startIdx + len - 1);
                store.remove(oldItems);
                store.insert(startIdx, items);
            }
            me.removeStoreInfoData(oldItems);
            if (isClassic) {
                store.resumeEvents();
                // the replace event is better than remove and inserts
                store.fireEvent('replace', store, startIdx, oldItems, items);
            }
        }
    },
    removeStoreInfoData: function(records) {
        Ext.Array.each(records, function(record) {
            if (this.storeInfo[record.internalId]) {
                delete this.storeInfo[record.internalId];
            }
        }, this);
    },
    onGroupExpand: function(matrix, type, item) {
        if (type == 'row') {
            if (item) {
                this.doExpandCollapseInternal(item, item.records.collapsed);
            } else {
                this.processStore();
            }
        }
    },
    onGroupCollapse: function(matrix, type, item) {
        if (type == 'row') {
            if (item) {
                this.doExpandCollapseInternal(item, item.records.expanded);
            } else {
                this.processStore();
            }
        }
    }
});

/**
 * Base implementation of a result object.
 *
 * The Result object stores all calculated values for the aggregate dimensions
 * for a left/top item pair.
 *
 */
Ext.define('Ext.pivot.result.Base', {
    alias: 'pivotresult.base',
    mixins: [
        'Ext.mixin.Factoryable'
    ],
    /**
     * @cfg {String} leftKey (required)
     *
     *  Key of left axis item or grandTotalKey
     */
    leftKey: '',
    /**
     * @cfg {String} topKey (required)
     *
     * Key of top axis item or grandTotalKey
     */
    topKey: '',
    /**
     * @property {Boolean} dirty
     *
     * Set this flag on true if you modified at least one record in this result.
     * The grid cell will be marked as dirty in such a case.
     */
    dirty: false,
    /**
     * @property {Object} values
     *
     * Object that stores all calculated values for each pivot aggregate.
     * The object keys are the dimension ids.
     *
     * @private
     */
    values: null,
    /**
     * @property {Ext.pivot.matrix.Base} matrix
     * @readonly
     *
     * Reference to the matrix object
     */
    matrix: null,
    constructor: function(config) {
        var me = this;
        Ext.apply(me, config || {});
        me.values = {};
        return me.callParent(arguments);
    },
    destroy: function() {
        var me = this;
        me.matrix = me.values = null;
        me.leftAxisItem = me.topAxisItem = null;
        return me.callParent(arguments);
    },
    /**
     * @method
     * Calculate all pivot aggregate dimensions for the internal records. Useful when using a
     * {@link Ext.pivot.matrix.Local Local} matrix.
     *
     */
    calculate: Ext.emptyFn,
    /**
     * @method
     *
     * Besides the calculation functions defined on your aggregate dimension you could
     * calculate values based on other store fields and custom functions.
     *
     * @param key The generated value will be stored in the result under this key for later extraction
     * @param dataIndex The dataIndex that should be used on the records for doing calculations
     * @param aggFn Your custom function
     */
    calculateByFn: Ext.emptyFn,
    /**
     * Add the calculated value for an aggregate dimension to the internal values storage
     *
     * @param dimensionId
     * @param value
     */
    addValue: function(dimensionId, value) {
        this.values[dimensionId] = value;
    },
    /**
     * Returns the calculated value for the specified aggregate dimension
     *
     * @param dimensionId
     */
    getValue: function(dimensionId) {
        return this.values[dimensionId];
    },
    /**
     * Returns the left axis item
     *
     * @returns {Ext.pivot.axis.Item}
     */
    getLeftAxisItem: function() {
        return this.matrix.leftAxis.items.getByKey(this.leftKey);
    },
    /**
     * Returns the top axis item
     *
     * @returns {Ext.pivot.axis.Item}
     */
    getTopAxisItem: function() {
        return this.matrix.topAxis.items.getByKey(this.topKey);
    }
});

/**
 * This class stores the matrix results. When the pivot component uses the
 * {@link Ext.pivot.matrix.Local Local} matrix then this class does
 * calculations in the browser.
 *
 */
Ext.define('Ext.pivot.result.Collection', {
    alternateClassName: [
        'Mz.aggregate.matrix.Results'
    ],
    requires: [
        'Ext.pivot.MixedCollection',
        'Ext.pivot.result.Base'
    ],
    /**
     * @cfg {String} resultType
     *
     * Define here what class to be used when creating {@link Ext.pivot.result.Base Result} objects
     */
    resultType: 'base',
    /**
     * @property {Ext.pivot.MixedCollection} items
     *
     * Collection of {@link Ext.pivot.result.Base Result} objects
     *
     * @private
     */
    items: null,
    /**
     * @cfg {Ext.pivot.matrix.Base} matrix
     *
     * Reference to the matrix object
     */
    matrix: null,
    constructor: function(config) {
        var me = this;
        Ext.apply(me, config || {});
        me.items = Ext.create('Ext.pivot.MixedCollection');
        me.items.getKey = function(obj) {
            return obj.leftKey + '/' + obj.topKey;
        };
        return me.callParent(arguments);
    },
    destroy: function() {
        var me = this;
        Ext.destroy(me.items);
        me.matrix = me.items = null;
        me.callParent(arguments);
    },
    /**
     * Clear all calculated results.
     *
     */
    clear: function() {
        this.items.clear();
    },
    /**
     * Add a new Result object by left/top axis keys.
     *
     * If there is already a Result object for the left/top axis pair then return that one.
     *
     * @param leftKey
     * @param topKey
     * @returns {Ext.pivot.result.Base}
     */
    add: function(leftKey, topKey) {
        var obj = this.get(leftKey, topKey);
        if (!obj) {
            obj = this.items.add(Ext.Factory.pivotresult({
                type: this.resultType,
                leftKey: leftKey,
                topKey: topKey,
                matrix: this.matrix
            }));
        }
        return obj;
    },
    /**
     * Returns the Result object for the specified left/top axis keys
     *
     * @param leftKey
     * @param topKey
     * @returns {Ext.pivot.result.Base}
     */
    get: function(leftKey, topKey) {
        return this.items.getByKey(leftKey + '/' + topKey);
    },
    /**
     * Return all Result objects for the specified leftKey
     *
     * @param leftKey
     * @returns Array
     */
    getByLeftKey: function(leftKey) {
        var col = this.items.filterBy(function(item, key) {
                var keys = String(key).split('/');
                return (leftKey == keys[0]);
            });
        return col.getRange();
    },
    /**
     * Return all Result objects for the specified topKey
     *
     * @param topKey
     * @returns Array
     */
    getByTopKey: function(topKey) {
        var col = this.items.filterBy(function(item, key) {
                var keys = String(key).split('/');
                return (keys.length > 1 && topKey == keys[1]);
                
            });
        return col.getRange();
    },
    /**
     * Calculate aggregate values for each available Result object
     *
     */
    calculate: function() {
        this.items.each(function(item) {
            item.calculate();
        });
    }
});

/**
 * Base implementation of a pivot matrix.
 *
 * This class contains basic methods that are used to generate the pivot data. It
 * needs to be extended by other classes to properly generate the results.
 *
 *
 */
Ext.define('Ext.pivot.matrix.Base', {
    alternateClassName: [
        'Mz.aggregate.matrix.Abstract'
    ],
    extend: 'Ext.util.Observable',
    alias: 'pivotmatrix.base',
    mixins: [
        'Ext.mixin.Factoryable'
    ],
    requires: [
        'Ext.util.DelayedTask',
        'Ext.data.ArrayStore',
        'Ext.XTemplate',
        'Ext.pivot.Aggregators',
        'Ext.pivot.MixedCollection',
        'Ext.pivot.axis.Base',
        'Ext.pivot.dimension.Item',
        'Ext.pivot.result.Collection'
    ],
    /**
     * @cfg {String} mztype
     *
     * @deprecated 6.0 Use {@link #type} instead.
     */
    /**
     * @cfg {String} [type=abstract]
     *
     * Used when you define a filter on a dimension to set what kind of filter is to be
     * instantiated.
     */
    /**
     * @cfg {String} resultType
     *
     * Define the type of Result this class uses. Specify here the pivotresult alias.
     */
    resultType: 'base',
    /**
     * @cfg {String} leftAxisType
     *
     * Define the type of left Axis this class uses. Specify here the pivotaxis alias.
     */
    leftAxisType: 'base',
    /**
     * @cfg {String} mztypeLeftAxis
     * @deprecated 6.0 Use {@link #leftAxisType} instead.
     *
     * Define the type of left Axis this class uses. Specify here the pivotaxis alias.
     */
    /**
     * @cfg {String} topAxisType
     *
     * Define the type of top Axis this class uses. Specify here the pivotaxis alias.
     */
    topAxisType: 'base',
    /**
     * @cfg {String} mztypeTopAxis
     * @deprecated 6.0 Use {@link #topAxisType} instead.
     *
     * Define the type of top Axis this class uses. Specify here the pivotaxis alias.
     */
    /**
     * @cfg {String} textRowLabels
     *
     * In compact layout only one column is generated for the left axis dimensions.
     * This is value of that column header.
     */
    textRowLabels: 'Row labels',
    /**
     * @cfg {String} textTotalTpl Configure the template for the group total. (i.e. '{name} ({rows.length} items)')
     * @cfg {String}           textTotalTpl.groupField         The field name being grouped by.
     * @cfg {String}           textTotalTpl.name               Group name
     * @cfg {Ext.data.Model[]} textTotalTpl.rows               An array containing the child records for the group being rendered.
     */
    textTotalTpl: 'Total ({name})',
    /**
     * @cfg {String} textGrandTotalTpl Configure the template for the grand total.
     */
    textGrandTotalTpl: 'Grand total',
    /**
     * @cfg {String} keysSeparator
     *
     * An axis item has a key that is a combination of all its parents keys. This is the keys separator.
     *
     * Do not use regexp special chars for this.
     */
    keysSeparator: '#_#',
    /**
     * @cfg {String} grandTotalKey
     *
     * Generic key used by the grand total records.
     */
    grandTotalKey: 'grandtotal',
    /**
     * @cfg {String} compactViewKey
     *
     * In compact view layout mode the matrix generates only one column for all left axis dimensions.
     * This is the 'dataIndex' field name on the pivot store model.
     */
    compactViewKey: '_compactview_',
    /**
     * @cfg {Number} compactViewColumnWidth
     *
     * In compact view layout mode the matrix generates only one column for all left axis dimensions.
     * This is the width of that column.
     */
    compactViewColumnWidth: 200,
    /**
     * @cfg {String} viewLayoutType Type of layout used to display the pivot data.
     * Possible values: outline, compact.
     */
    viewLayoutType: 'outline',
    /**
     * @cfg {String} rowSubTotalsPosition Possible values: `first`, `none`, `last`
     */
    rowSubTotalsPosition: 'first',
    /**
     * @cfg {String} rowGrandTotalsPosition Possible values: `first`, `none`, `last`
     */
    rowGrandTotalsPosition: 'last',
    /**
     * @cfg {String} colSubTotalsPosition Possible values: `first`, `none`, `last`
     */
    colSubTotalsPosition: 'first',
    /**
     * @cfg {String} colGrandTotalsPosition Possible values: `first`, `none`, `last`
     */
    colGrandTotalsPosition: 'last',
    /**
     * @cfg {Boolean} showZeroAsBlank Should 0 values be displayed as blank?
     *
     */
    showZeroAsBlank: false,
    /**
     * @cfg {Ext.pivot.axis.Base} leftAxis
     *
     * Left axis object stores all generated groups for the left axis dimensions
     */
    leftAxis: null,
    /**
     * @cfg {Ext.pivot.axis.Base} topAxis
     *
     * Top axis object stores all generated groups for the top axis dimensions
     */
    topAxis: null,
    /**
     * @cfg {Ext.pivot.MixedCollection} aggregate
     *
     * Collection of configured aggregate dimensions
     */
    aggregate: null,
    /**
     * @property {Ext.pivot.result.Collection} results
     * @readonly
     *
     * Stores the calculated results
     */
    results: null,
    /**
     * @property {Ext.data.ArrayStore} pivotStore
     * @readonly
     *
     * The generated pivot store
     *
     * @private
     */
    pivotStore: null,
    /**
     * @property {Boolean} isDestroyed
     * @readonly
     *
     * This property is set to true when the matrix object is destroyed.
     * This is useful to check when functions are deferred.
     */
    isDestroyed: false,
    /**
     * Reference to the pivot component that monitors this matrix
     * @private
     */
    cmp: null,
    isPivotMatrix: true,
    constructor: function(config) {
        var ret = this.callParent(arguments);
        /**
         * Fires before the generated data is destroyed.
         * The components that uses the matrix should unbind this pivot store before is destroyed.
         * The grid panel will trow errors if the store is destroyed and the grid is refreshed.
         *
         * @event cleardata
         * @param {Ext.pivot.matrix.Base} matrix Reference to the Matrix object
         */
        /**
         * Fires before the matrix is reconfigured.
         *
         * Return false to stop reconfiguring the matrix.
         *
         * @event beforereconfigure
         * @param {Ext.pivot.matrix.Base} matrix Reference to the Matrix object
         * @param {Object} config Object used to reconfigure the matrix
         */
        /**
         * Fires when the matrix is reconfigured.
         *
         * @event reconfigure
         * @param {Ext.pivot.matrix.Base} matrix Reference to the Matrix object
         * @param {Object} config Object used to reconfigure the matrix
         */
        /**
         * Fires when the matrix starts processing the records.
         *
         * @event start
         * @param {Ext.pivot.matrix.Base} matrix Reference to the Matrix object
         */
        /**
         * Fires during records processing.
         *
         * @event progress
         * @param {Ext.pivot.matrix.Base} matrix Reference to the Matrix object
         * @param {Integer} index Current index of record that is processed
         * @param {Integer} total Total number of records to process
         */
        /**
         * Fires when the matrix finished processing the records
         *
         * @event done
         * @param {Ext.pivot.matrix.Base} matrix Reference to the Matrix object
         */
        /**
         * Fires after the matrix built the store model.
         *
         * @event modelbuilt
         * @param {Ext.pivot.matrix.Base} matrix Reference to the Matrix object
         * @param {Ext.data.Model} model The built model
         */
        /**
         * Fires after the matrix built the columns.
         *
         * @event columnsbuilt
         * @param {Ext.pivot.matrix.Base} matrix Reference to the Matrix object
         * @param {Array} columns The built columns
         */
        /**
         * Fires after the matrix built a pivot store record.
         *
         * @event recordbuilt
         * @param {Ext.pivot.matrix.Base} matrix Reference to the Matrix object
         * @param {Ext.data.Model} record The built record
         */
        /**
         * Fires before grand total records are created in the pivot store.
         * Push additional objects to the array if you need to create additional grand totals.
         *
         * @event buildtotals
         * @param {Ext.pivot.matrix.Base} matrix Reference to the Matrix object
         * @param {Array} totals Array of objects that will be used to create grand total records in the pivot store. Each object should have:
         * @param {String} totals.title Name your grand total
         * @param {Object} totals.values Values used to generate the pivot store record
         */
        /**
         * Fires after the matrix built the pivot store.
         *
         * @event storebuilt
         * @param {Ext.pivot.matrix.Base} matrix Reference to the Matrix object
         * @param {Ext.data.Store} store The built store
         */
        this.initialize(true, config);
        return ret;
    },
    destroy: function() {
        var me = this;
        me.delayedTask.cancel();
        me.delayedTask = null;
        if (Ext.isFunction(me.onDestroy)) {
            me.onDestroy();
        }
        Ext.destroy(me.results, me.leftAxis, me.topAxis, me.aggregate, me.pivotStore);
        me.results = me.leftAxis = me.topAxis = me.aggregate = me.pivotStore = null;
        if (Ext.isArray(me.columns)) {
            me.columns.length = 0;
        }
        if (Ext.isArray(me.model)) {
            me.model.length = 0;
        }
        if (Ext.isArray(me.totals)) {
            me.totals.length = 0;
        }
        me.columns = me.model = me.totals = me.keysMap = me.cmp = me.modelInfo = null;
        me.isDestroyed = true;
        me.callParent(arguments);
    },
    /**
     * The arguments are combined in a string and the function returns the crc32
     * for that key
     *
     * @deprecated 6.0
     * @method formatKeys
     * @returns {String}
     */
    /**
     * Return a unique id for the specified value. The function builds a keys map so that same values get same ids.
     *
     * @param value
     * @returns {String}
     *
     * @private
     */
    getKey: function(value) {
        var me = this;
        me.keysMap = me.keysMap || {};
        if (!Ext.isDefined(me.keysMap[value])) {
            me.keysMap[value] = Ext.id();
        }
        return me.keysMap[value];
    },
    /**
     * Natural Sort algorithm for Javascript - Version 0.8 - Released under MIT license
     * Author: Jim Palmer (based on chunking idea from Dave Koelle)
     * https://github.com/overset/javascript-natural-sort/blob/master/naturalSort.js
     *
     * @private
     */
    naturalSort: (function() {
        var re = /(^([+\-]?(?:\d*)(?:\.\d*)?(?:[eE][+\-]?\d+)?)?$|^0x[\da-fA-F]+$|\d+)/g,
            sre = /^\s+|\s+$/g,
            // trim pre-post whitespace
            snre = /\s+/g,
            // normalize all whitespace to single ' ' character
            dre = /(^([\w ]+,?[\w ]+)?[\w ]+,?[\w ]+\d+:\d+(:\d+)?[\w ]?|^\d{1,4}[\/\-]\d{1,4}[\/\-]\d{1,4}|^\w+, \w+ \d+, \d{4})/,
            hre = /^0x[0-9a-f]+$/i,
            ore = /^0/,
            normChunk = function(s, l) {
                // normalize spaces; find floats not starting with '0', string or 0 if not defined (Clint Priest)
                s = s || '';
                return (!s.match(ore) || l == 1) && parseFloat(s) || s.replace(snre, ' ').replace(sre, '') || 0;
            };
        return function(a, b) {
            // convert all to strings strip whitespace
            var x = String(a instanceof Date ? a.getTime() : (a || '')).replace(sre, ''),
                y = String(b instanceof Date ? b.getTime() : (b || '')).replace(sre, ''),
                // chunk/tokenize
                xN = x.replace(re, '\x00$1\x00').replace(/\0$/, '').replace(/^\0/, '').split('\x00'),
                yN = y.replace(re, '\x00$1\x00').replace(/\0$/, '').replace(/^\0/, '').split('\x00'),
                // numeric, hex or date detection
                xD = parseInt(x.match(hre), 16) || (xN.length !== 1 && Date.parse(x)),
                yD = parseInt(y.match(hre), 16) || xD && y.match(dre) && Date.parse(y) || null,
                oFxNcL, oFyNcL;
            // first try and sort Hex codes or Dates
            if (yD) {
                if (xD < yD) {
                    return -1;
                } else if (xD > yD) {
                    return 1;
                }
            }
            // natural sorting through split numeric strings and default strings
            for (var cLoc = 0,
                xNl = xN.length,
                yNl = yN.length,
                numS = Math.max(xNl, yNl); cLoc < numS; cLoc++) {
                oFxNcL = normChunk(xN[cLoc], xNl);
                oFyNcL = normChunk(yN[cLoc], yNl);
                // handle numeric vs string comparison - number < string - (Kyle Adams)
                if (isNaN(oFxNcL) !== isNaN(oFyNcL)) {
                    return (isNaN(oFxNcL)) ? 1 : -1;
                }
                // rely on string comparison if different types - i.e. '02' < 2 != '02' < '2'
                else if (typeof oFxNcL !== typeof oFyNcL) {
                    oFxNcL += '';
                    oFyNcL += '';
                }
                if (oFxNcL < oFyNcL) {
                    return -1;
                }
                if (oFxNcL > oFyNcL) {
                    return 1;
                }
            }
            return 0;
        };
    }()),
    /**
     *
     * Initialize the matrix with the new config object
     *
     * @param firstTime
     * @param config
     *
     * @private
     *
     */
    initialize: function(firstTime, config) {
        var me = this,
            props = [
                'viewLayoutType',
                'rowSubTotalsPosition',
                'rowGrandTotalsPosition',
                'colSubTotalsPosition',
                'colGrandTotalsPosition',
                'showZeroAsBlank'
            ],
            i;
        // initialize the results object
        me.initResults();
        // initialize aggregates
        me.initAggregates(config.aggregate || []);
        // initialize dimensions and build axis tree
        me.initAxis(config.leftAxis || [], config.topAxis || []);
        for (i = 0; i < props.length; i++) {
            if (config.hasOwnProperty(props[i])) {
                me[props[i]] = config[props[i]];
            }
        }
        me.totals = [];
        me.modelInfo = {};
        me.keysMap = null;
        if (firstTime) {
            me.pivotStore = Ext.create('Ext.data.ArrayStore', {
                autoDestroy: false,
                fields: []
            });
            me.delayedTask = new Ext.util.DelayedTask(me.startProcess, me);
            if (Ext.isFunction(me.onInitialize)) {
                me.onInitialize();
            }
        }
    },
    /**
     * @method
     * Template method called to do your internal initialization when you extend this class.
     */
    onInitialize: Ext.emptyFn,
    /**
     * @method
     * Template method called before destroying the instance.
     */
    onDestroy: Ext.emptyFn,
    /**
     * Call this function to reconfigure the matrix with a new set of configs
     *
     * @param {Object} config Config object which has all configs that you want to change on this instance
     */
    reconfigure: function(config) {
        var me = this,
            config = Ext.clone(config || {});
        if (me.fireEvent('beforereconfigure', me, config) !== false) {
            if (Ext.isFunction(me.onReconfigure)) {
                me.onReconfigure(config);
            }
            // the user can change values on the config before reinitializing the matrix
            me.fireEvent('reconfigure', me, config);
            me.initialize(false, config);
            me.clearData();
            me.delayedTask.delay(5);
        } else {
            me.delayedTask.cancel();
        }
    },
    /**
     * @method
     *
     * Template function called when the matrix has to be reconfigured with a new set of configs.
     *
     * @param {Object} config Config object which has all configs that need to be changed on this instance
     */
    onReconfigure: Ext.emptyFn,
    /**
     * Initialize the Results object
     *
     * @private
     */
    initResults: function() {
        Ext.destroy(this.results);
        this.results = Ext.create('Ext.pivot.result.Collection', {
            resultType: this.resultType,
            matrix: this
        });
    },
    /**
     * @private
     */
    initAggregates: function(aggregates) {
        var me = this,
            i, item;
        Ext.destroy(me.aggregate);
        me.aggregate = Ext.create('Ext.pivot.MixedCollection');
        me.aggregate.getKey = function(item) {
            return item.getId();
        };
        if (Ext.isEmpty(aggregates)) {
            return;
        }
        aggregates = Ext.Array.from(aggregates);
        for (i = 0; i < aggregates.length; i++) {
            item = aggregates[i];
            if (!(item instanceof Ext.pivot.dimension.Item)) {
                Ext.applyIf(item, {
                    isAggregate: true,
                    align: 'right',
                    showZeroAsBlank: me.showZeroAsBlank
                });
                item.matrix = this;
                item = Ext.create('Ext.pivot.dimension.Item', item);
            }
            me.aggregate.add(item);
        }
    },
    /**
     * @private
     */
    initAxis: function(leftAxis, topAxis) {
        var me = this;
        leftAxis = Ext.Array.from(leftAxis || []);
        topAxis = Ext.Array.from(topAxis || []);
        Ext.destroy(me.leftAxis);
        me.leftAxis = Ext.Factory.pivotaxis({
            type: me.leftAxisType,
            matrix: me,
            dimensions: leftAxis,
            isLeftAxis: true
        });
        Ext.destroy(me.topAxis);
        me.topAxis = Ext.Factory.pivotaxis({
            type: me.topAxisType,
            matrix: me,
            dimensions: topAxis,
            isLeftAxis: false
        });
    },
    /**
     * This function clears any data that was previously calculated/generated.
     *
     */
    clearData: function() {
        var me = this;
        me.fireEvent('cleardata', me);
        me.leftAxis.clear();
        me.topAxis.clear();
        me.results.clear();
        if (Ext.isArray(me.columns)) {
            me.columns.length = 0;
        }
        if (Ext.isArray(me.model)) {
            me.model.length = 0;
        }
        me.totals = [];
        me.modelInfo = {};
        me.keysMap = null;
        if (me.pivotStore) {
            me.pivotStore.removeAll(true);
        }
    },
    /**
     * Template function called when the calculation process is started.
     * This function needs to be implemented in the subclass.
     */
    startProcess: Ext.emptyFn,
    /**
     * Call this function after you finished your matrix processing.
     * This function will build up the pivot store and column headers.
     */
    endProcess: function() {
        var me = this;
        // force tree creation on both axis
        me.leftAxis.getTree();
        me.topAxis.getTree();
        // build pivot store model and column headers
        me.buildModelAndColumns();
        // build pivot store rows
        me.buildPivotStore();
        if (Ext.isFunction(me.onBuildStore)) {
            me.onBuildStore(me.pivotStore);
        }
        me.fireEvent('storebuilt', me, me.pivotStore);
        me.fireEvent('done', me);
    },
    /**
     * @method
     *
     * Template function called after the pivot store model was created.
     * You could extend the model in a subclass if you implement this method.
     *
     * @param {Array} model
     */
    onBuildModel: Ext.emptyFn,
    /**
     * @method
     *
     * Template function called after the pivot columns were created.
     * You could extend the columns in a subclass if you implement this method.
     *
     * @param {Array} columns
     */
    onBuildColumns: Ext.emptyFn,
    /**
     * @method
     *
     * Template function called after a pivot store record was created.
     * You can use this to populate the record with your data.
     *
     * @param {Ext.data.Model} record
     */
    onBuildRecord: Ext.emptyFn,
    /**
     * @method
     *
     * Template function called before building grand total records.
     * Use it to add additional grand totals to the pivot grid.
     * You have to push objects into the totals array with properties for each matrix.model fields.
     * For each object that you add a new record will be added to the pivot store
     * and will be styled as a grand total.
     *
     * @param {Array} totals
     */
    onBuildTotals: Ext.emptyFn,
    /**
     * @method
     *
     * Template function called after the pivot store was created.
     *
     * @param {Ext.data.ArrayStore} store
     */
    onBuildStore: Ext.emptyFn,
    /**
     * This function dynamically builds the model of the pivot records.
     *
     * @private
     */
    buildModelAndColumns: function() {
        var me = this;
        me.model = [
            {
                name: 'id',
                type: 'string'
            },
            {
                name: 'isRowGroupHeader',
                type: 'boolean',
                defaultValue: false
            },
            {
                name: 'isRowGroupTotal',
                type: 'boolean',
                defaultValue: false
            },
            {
                name: 'isRowGrandTotal',
                type: 'boolean',
                defaultValue: false
            },
            {
                name: 'leftAxisKey',
                type: 'boolean',
                defaultValue: null
            }
        ];
        me.internalCounter = 0;
        me.columns = [];
        if (me.viewLayoutType == 'compact') {
            me.generateCompactLeftAxis();
        } else {
            me.leftAxis.dimensions.each(function(item) {
                this.parseLeftAxisDimension(item);
            }, me);
        }
        if (me.colGrandTotalsPosition == 'first') {
            me.columns.push(me.parseAggregateForColumn(null, {
                text: me.textGrandTotalTpl,
                grandTotal: true
            }));
        }
        Ext.Array.each(me.topAxis.getTree(), function(item) {
            this.parseTopAxisItem(item);
        }, me);
        if (me.colGrandTotalsPosition == 'last') {
            me.columns.push(me.parseAggregateForColumn(null, {
                text: me.textGrandTotalTpl,
                grandTotal: true
            }));
        }
        // call the hook functions
        if (Ext.isFunction(me.onBuildModel)) {
            me.onBuildModel(me.model);
        }
        me.fireEvent('modelbuilt', me, me.model);
        if (Ext.isFunction(me.onBuildColumns)) {
            me.onBuildColumns(me.columns);
        }
        me.fireEvent('columnsbuilt', me, me.columns);
    },
    getDefaultFieldInfo: function(config) {
        return Ext.apply({
            isColGroupTotal: false,
            isColGrandTotal: false,
            leftAxisColumn: false,
            topAxisColumn: false,
            topAxisKey: null
        }, config);
    },
    /**
     * @private
     */
    parseLeftAxisDimension: function(dimension) {
        var me = this,
            id = dimension.getId();
        me.model.push({
            name: id,
            type: 'string'
        });
        me.columns.push({
            dataIndex: id,
            text: dimension.header,
            dimension: dimension,
            leftAxis: true
        });
        me.modelInfo[id] = me.getDefaultFieldInfo({
            leftAxisColumn: true
        });
    },
    /**
     * @private
     */
    generateCompactLeftAxis: function() {
        var me = this;
        me.model.push({
            name: me.compactViewKey,
            type: 'string'
        });
        me.columns.push({
            dataIndex: me.compactViewKey,
            text: me.textRowLabels,
            leftAxis: true,
            width: me.compactViewColumnWidth
        });
        me.modelInfo[me.compactViewKey] = me.getDefaultFieldInfo({
            leftAxisColumn: true
        });
    },
    /**
     * @private
     */
    parseTopAxisItem: function(item) {
        var me = this,
            columns = [],
            retColumns = [],
            o1, o2,
            doAdd = false;
        if (!item.children) {
            columns = me.parseAggregateForColumn(item, null);
            if (item.level === 0) {
                me.columns.push(columns);
            } else {
                // we reached the deepest level so we can add to the model now
                return columns;
            }
        } else {
            if (me.colSubTotalsPosition == 'first') {
                o2 = me.addColSummary(item);
                if (o2) {
                    retColumns.push(o2);
                }
            }
            // this part has to be done no matter if the column is added to the grid or not
            // the dataIndex is generated incrementally
            Ext.Array.each(item.children, function(child) {
                var ret = me.parseTopAxisItem(child);
                if (Ext.isArray(ret)) {
                    columns = Ext.Array.merge(columns, ret);
                } else {
                    columns.push(ret);
                }
            });
            o1 = {
                text: item.name,
                group: item,
                columns: columns,
                key: item.key,
                xexpandable: true,
                xgrouped: true
            };
            if (item.level === 0) {
                me.columns.push(o1);
            }
            retColumns.push(o1);
            if (me.colSubTotalsPosition == 'last') {
                o2 = me.addColSummary(item);
                if (o2) {
                    retColumns.push(o2);
                }
            }
            if (me.colSubTotalsPosition == 'none') {
                o2 = me.addColSummary(item);
                if (o2) {
                    retColumns.push(o2);
                }
            }
            return retColumns;
        }
    },
    /**
     * @private
     */
    addColSummary: function(item) {
        var me = this,
            o2,
            doAdd = false;
        // add subtotal columns if required
        o2 = me.parseAggregateForColumn(item, {
            text: item.expanded ? item.getTextTotal() : item.name,
            group: item,
            subTotal: true
        });
        if (item.level === 0) {
            me.columns.push(o2);
        }
        Ext.apply(o2, {
            key: item.key,
            xexpandable: true,
            xgrouped: true
        });
        return o2;
    },
    /**
     * @private
     */
    parseAggregateForColumn: function(item, config) {
        var me = this,
            columns = [],
            column = {},
            dimensions = me.aggregate.getRange(),
            length = dimensions.length,
            i, agg;
        for (i = 0; i < length; i++) {
            agg = dimensions[i];
            me.internalCounter++;
            me.model.push({
                name: 'c' + me.internalCounter,
                type: 'auto',
                defaultValue: undefined,
                useNull: true,
                col: item ? item.key : me.grandTotalKey,
                agg: agg.getId()
            });
            columns.push({
                dataIndex: 'c' + me.internalCounter,
                text: agg.header,
                topAxis: true,
                // generated based on the top axis
                subTotal: (config ? config.subTotal === true : false),
                grandTotal: (config ? config.grandTotal === true : false),
                dimension: agg
            });
            me.modelInfo['c' + me.internalCounter] = me.getDefaultFieldInfo({
                isColGroupTotal: (config ? config.subTotal === true : false),
                isColGrandTotal: (config ? config.grandTotal === true : false),
                topAxisColumn: true,
                topAxisKey: item ? item.key : me.grandTotalKey
            });
        }
        if (columns.length == 0 && me.aggregate.getCount() == 0) {
            me.internalCounter++;
            column = Ext.apply({
                text: item ? item.name : '',
                dataIndex: 'c' + me.internalCounter
            }, config || {});
        } else if (columns.length == 1) {
            column = Ext.applyIf({
                text: item ? item.name : ''
            }, columns[0]);
            Ext.apply(column, config || {});
            // if there is only one aggregate available then don't show the grand total text
            // use the aggregate header instead.
            if (config && config.grandTotal && me.aggregate.getCount() == 1) {
                column.text = me.aggregate.getAt(0).header || config.text;
            }
        } else {
            column = Ext.apply({
                text: item ? item.name : '',
                columns: columns
            }, config || {});
        }
        return column;
    },
    /**
     * @private
     */
    buildPivotStore: function() {
        var me = this;
        if (Ext.isFunction(me.pivotStore.model.setFields)) {
            me.pivotStore.model.setFields(me.model);
        } else {
            // ExtJS 5 has no "setFields" anymore so fallback to "replaceFields"
            me.pivotStore.model.replaceFields(me.model, true);
        }
        me.pivotStore.removeAll(true);
        Ext.Array.each(me.leftAxis.getTree(), me.addRecordToPivotStore, me);
        me.addGrandTotalsToPivotStore();
    },
    /**
     * @private
     */
    addGrandTotalsToPivotStore: function() {
        var me = this,
            totals = [];
        // first of all add the grand total
        totals.push({
            title: me.textGrandTotalTpl,
            values: me.preparePivotStoreRecordData({
                key: me.grandTotalKey
            }, {
                isRowGrandTotal: true
            })
        });
        // additional grand totals can be added. collect these using events or 
        if (Ext.isFunction(me.onBuildTotals)) {
            me.onBuildTotals(totals);
        }
        me.fireEvent('buildtotals', me, totals);
        // add records to the pivot store for each grand total
        Ext.Array.forEach(totals, function(t) {
            if (Ext.isObject(t) && Ext.isObject(t.values)) {
                Ext.applyIf(t.values, {
                    isRowGrandTotal: true
                });
                me.totals.push({
                    title: t.title || '',
                    record: me.pivotStore.add(t.values)[0]
                });
            }
        });
    },
    /**
     * @private
     */
    addRecordToPivotStore: function(item) {
        var me = this,
            record, dataIndex;
        if (!item.children) {
            // we are on the deepest level so it's time to build the record and add it to the store
            record = me.pivotStore.add(me.preparePivotStoreRecordData(item))[0];
            item.record = record;
            // this should be moved into the function "preparePivotStoreRecordData"
            if (Ext.isFunction(me.onBuildRecord)) {
                me.onBuildRecord(record);
            }
            me.fireEvent('recordbuilt', me, record);
        } else {
            // This group is expandable so let's generate records for the following use cases
            // - expanded group
            // - collapsed group
            // - footer for an expanded group that has rowSubTotalsPosition = last.
            // We define all these records on the group item so that we can update them as well
            // when we have an editable pivot. Without doing this we can't mark dirty records
            // in the pivot grid cells
            item.records = {};
            dataIndex = (me.viewLayoutType == 'outline' ? item.dimensionId : me.compactViewKey);
            // a collapsed group will always be the same
            item.records.collapsed = me.pivotStore.add(me.preparePivotStoreRecordData(item, {
                isRowGroupHeader: true,
                isRowGroupTotal: true
            }))[0];
            if (me.rowSubTotalsPosition == 'first') {
                item.records.expanded = me.pivotStore.add(me.preparePivotStoreRecordData(item, {
                    isRowGroupHeader: true
                }))[0];
            } else {
                record = {};
                record[dataIndex] = item.name;
                record.isRowGroupHeader = true;
                item.records.expanded = me.pivotStore.add(record)[0];
                if (me.rowSubTotalsPosition == 'last') {
                    record = me.preparePivotStoreRecordData(item, {
                        isRowGroupTotal: true
                    });
                    record[dataIndex] = item.getTextTotal();
                    item.records.footer = me.pivotStore.add(record)[0];
                }
            }
            Ext.Array.each(item.children, function(child) {
                me.addRecordToPivotStore(child);
            });
        }
    },
    /**
     * Create an object using the pivot model and data of an axis item.
     * This object is used to create a record in the pivot store.
     *
     * @private
     */
    preparePivotStoreRecordData: function(group, values) {
        var me = this,
            data = {};
        if (group) {
            if (group.dimensionId) {
                data[group.dimensionId] = group.name;
            }
            data.leftAxisKey = group.key;
            Ext.Array.each(me.model, function(field) {
                var result;
                if (field.col && field.agg) {
                    result = me.results.get(group.key, field.col);
                    if (result) {
                        data[field.name] = result.getValue(field.agg);
                    }
                }
            });
            if (me.viewLayoutType == 'compact') {
                data[me.compactViewKey] = group.name;
            }
        }
        return Ext.applyIf(data, values);
    },
    /**
     * Returns the generated model fields
     *
     * @returns {Object[]} Array of config objects used to build the pivot store model fields
     */
    getColumns: function() {
        return this.model;
    },
    /**
     * Returns all generated column headers
     *
     * @returns {Object[]} Array of config objects used to build the pivot grid columns
     */
    getColumnHeaders: function() {
        var me = this;
        if (!me.model) {
            me.buildModelAndColumns();
        }
        return me.columns;
    },
    /**
     *    Find out if the specified key belongs to a row group.
     *
     *    Returns FALSE if the key is not found.
     *
     *    Returns 0 if the current key doesn't belong to a group. That means that group children items will always be 0.
     *
     *    If it'a a group then it returns the level number which is always > 0.
     *
     * @param {String} key
     * @returns {Number/Boolean}
     */
    isGroupRow: function(key) {
        var obj = this.leftAxis.findTreeElement('key', key);
        if (!obj)  {
            return false;
        }
        
        return (obj.node.children && obj.node.children.length == 0) ? 0 : obj.level;
    },
    /**
     *    Find out if the specified key belongs to a col group.
     *
     *    Returns FALSE if the key is not found.
     *
     *    Returns 0 if the current key doesn't belong to a group. That means that group children items will always be 0.
     *
     *    If it'a a group then it returns the level number which is always > 0.
     *
     * @param {String} key
     * @returns {Number/Boolean}
     */
    isGroupCol: function(key) {
        var obj = this.topAxis.findTreeElement('key', key);
        if (!obj)  {
            return false;
        }
        
        return (obj.node.children && obj.node.children.length == 0) ? 0 : obj.level;
    },
    deprecated: {
        '6.0': {
            properties: {
                mztype: 'type',
                mztypeLeftAxis: 'leftAxisType',
                mztypeTopAxis: 'topAxisType'
            }
        }
    }
});

/**
 * The Result object stores all calculated values for the aggregate dimensions
 * for a left/top item pair and all records that are used to calculate
 * those values.
 *
 * It is used by the {@link Ext.pivot.matrix.Local Local} matrix class.
 *
 */
Ext.define('Ext.pivot.result.Local', {
    extend: 'Ext.pivot.result.Base',
    alias: 'pivotresult.local',
    alternateClassName: [
        'Mz.aggregate.matrix.Result'
    ],
    /**
     * @property {Ext.data.Model[]} records
     *
     * Array of records for the left/top axis keys pair. Only available for a {@link Ext.pivot.matrix.Local Local} matrix.
     */
    records: null,
    constructor: function(config) {
        this.records = [];
        return this.callParent(arguments);
    },
    destroy: function() {
        this.records.length = 0;
        this.records = null;
        return this.callParent(arguments);
    },
    /**
     * @inheritdoc
     */
    calculate: function() {
        var me = this,
            i, dimension,
            length = me.matrix.aggregate.getCount();
        // for each pivot aggregate dimension calculate the value and call addValue
        for (i = 0; i < length; i++) {
            dimension = me.matrix.aggregate.getAt(i);
            me.addValue(dimension.getId(), Ext.callback(dimension.aggregatorFn, dimension.getScope() || 'self.controller', [
                me.records,
                dimension.dataIndex,
                me.matrix,
                me.leftKey,
                me.topKey
            ], 0, me.matrix.cmp));
        }
    },
    /**
     * @inheritdoc
     */
    calculateByFn: function(key, dataIndex, aggFn) {
        var me = this,
            v;
        if (Ext.isString(aggFn)) {
            aggFn = Ext.pivot.Aggregators[aggFn];
        }
        if (!Ext.isFunction(aggFn)) {
            Ext.raise('Invalid function provided!');
        }
        v = aggFn(me.records, dataIndex, me.matrix, me.leftKey, me.topKey);
        me.addValue(key, v);
        return v;
    },
    /**
     * Add the specified record to the internal records storage.
     * These records will be used for calculating the pivot aggregate dimension values.
     * This should be used only when all calculations are done locally and not remotely.
     *
     * @param {Ext.data.Model} record
     */
    addRecord: function(record) {
        this.records.push(record);
    }
});

/**
 * This type of matrix does all calculations in the browser.
 *
 * You need to provide at least a store that contains the records
 * that need to be processed.
 *
 * The store records are processed in batch jobs to avoid freezing the browser.
 * You can also configure how many records should be processed per job
 * and time to wait between jobs.
 *
 *
 * Example:
 *
 *      {
 *          xtype: 'pivotgrid',
 *          matrixConfig: {
 *              type: 'local',
 *              store: 'yourStore'
 *          },
 *
 *          leftAxis: [...],
 *          topAxis: [...],
 *          aggregate: [...]
 *      }
 *
 */
Ext.define('Ext.pivot.matrix.Local', {
    alternateClassName: [
        'Mz.aggregate.matrix.Local'
    ],
    extend: 'Ext.pivot.matrix.Base',
    alias: 'pivotmatrix.local',
    requires: [
        'Ext.pivot.matrix.Base',
        'Ext.pivot.axis.Local',
        'Ext.pivot.result.Local'
    ],
    resultType: 'local',
    leftAxisType: 'local',
    topAxisType: 'local',
    /**
     * Fires before updating the matrix data due to a change in the bound store.
     *
     * @event beforeupdate
     * @param {Ext.pivot.matrix.Base} matrix Reference to the Matrix object
     * @private
     */
    /**
     * Fires after updating the matrix data due to a change in the bound store.
     *
     * @event afterupdate
     * @param {Ext.pivot.matrix.Base} matrix Reference to the Matrix object
     * @private
     */
    /**
     * @cfg {Ext.data.Store/String} store (required)
     *
     * This is the store that needs to be processed. The store should contain all records
     * and cannot be paginated or buffered.
     */
    store: null,
    /**
     * @cfg {Number} recordsPerJob
     *
     * The matrix processes the records in multiple jobs.
     * Specify here how many records should be processed in a single job.
     */
    recordsPerJob: 1000,
    /**
     * @cfg {Number} timeBetweenJobs
     *
     * How many milliseconds between processing jobs?
     */
    timeBetweenJobs: 2,
    onInitialize: function() {
        var me = this;
        me.localDelayedTask = new Ext.util.DelayedTask(me.delayedProcess, me);
        me.newRecordsDelayedTask = new Ext.util.DelayedTask(me.onOriginalStoreAddDelayed, me);
        me.updateRecordsDelayedTask = new Ext.util.DelayedTask(me.onOriginalStoreUpdateDelayed, me);
        me.initializeStore({
            store: me.store
        });
        me.callParent(arguments);
    },
    initializeStore: function(config) {
        var me = this,
            store, newStore;
        if (config.store) {
            // a new store was passed to
            newStore = config.store;
        } else {
            if (me.store) {
                if (me.store.isStore && !me.storeListeners) {
                    // we have a store but no listeners were attached to it
                    store = me.store;
                } else {
                    // we need to initialize the store that we got
                    newStore = me.store;
                }
            }
        }
        if (newStore) {
            store = Ext.getStore(newStore || '');
            if (Ext.isEmpty(store) && Ext.isString(newStore)) {
                store = Ext.create(newStore);
            }
        }
        if (store && store.isStore) {
            Ext.destroy(me.storeListeners);
            if (me.store && me.store.autoDestroy && store != me.store) {
                Ext.destroy(me.store);
            }
            // let's initialize the store (if needed)
            me.store = store;
            // add listeners to the store
            me.storeListeners = me.store.on({
                refresh: me.startProcess,
                //datachanged:    me.startProcess,
                beforeload: me.onOriginalStoreBeforeLoad,
                add: me.onOriginalStoreAdd,
                update: me.onOriginalStoreUpdate,
                remove: me.onOriginalStoreRemove,
                clear: me.startProcess,
                scope: me,
                destroyable: true
            });
            if (store.isLoaded()) {
                me.startProcess();
            }
        }
    },
    onReconfigure: function(config) {
        this.initializeStore(config);
        this.callParent(arguments);
    },
    onDestroy: function() {
        var me = this;
        me.localDelayedTask.cancel();
        me.localDelayedTask = null;
        me.newRecordsDelayedTask.cancel();
        me.newRecordsDelayedTask = null;
        me.updateRecordsDelayedTask.cancel();
        me.updateRecordsDelayedTask = null;
        if (Ext.isArray(me.records)) {
            me.records.length = 0;
        }
        me.records = null;
        Ext.destroy(me.storeListeners);
        if (me.store && me.store.isStore && me.store.autoDestroy) {
            Ext.destroy(me.store);
        }
        me.store = me.storeListeners = null;
        me.callParent(arguments);
    },
    /**
     * @private
     */
    onOriginalStoreBeforeLoad: function(store) {
        this.fireEvent('start', this);
    },
    /**
     * @private
     */
    onOriginalStoreAdd: function(store, records) {
        var me = this;
        me.newRecords = me.newRecords || [];
        me.newRecords = Ext.Array.merge(me.newRecords, Ext.Array.from(records));
        me.newRecordsDelayedTask.delay(100);
    },
    /**
     * @private
     */
    onOriginalStoreAddDelayed: function() {
        var me = this,
            i, records;
        records = Ext.Array.from(me.newRecords || []);
        for (i = 0; i < records.length; i++) {
            me.processRecord(records[i], i, records.length);
        }
        me.newRecords = [];
        me.leftAxis.tree = null;
        me.leftAxis.buildTree();
        me.topAxis.tree = null;
        me.topAxis.buildTree();
        me.recalculateResults(me.store, records);
    },
    /**
     * @private
     */
    onOriginalStoreUpdate: function(store, records) {
        var me = this;
        me.updateRecords = me.updateRecords || [];
        me.updateRecords = Ext.Array.merge(me.updateRecords, Ext.Array.from(records));
        me.updateRecordsDelayedTask.delay(100);
    },
    /**
     * @private
     */
    onOriginalStoreUpdateDelayed: function() {
        var me = this;
        me.recalculateResults(me.store, me.updateRecords);
        me.updateRecords.length = 0;
    },
    /**
     * @private
     */
    onOriginalStoreRemove: function(store, record, index, isMove) {
        if (isMove) {
            //don't do anything. nothing changed in the data
            return;
        }
        // this can also be optimized to just remove axis items if necessary
        this.startProcess();
    },
    /**
     * @private
     */
    isReallyDirty: function(store, records) {
        var found = true;
        records = Ext.Array.from(records);
        // for all records find out if there's a new axis value
        this.leftAxis.dimensions.each(function(dimension) {
            Ext.Array.forEach(records, function(record) {
                found = (record && record.isModel && dimension.getValues().containsKey(record.get(dimension.dataIndex)));
                return found;
            });
            return found;
        });
        return !found;
    },
    /**
     * @private
     */
    recalculateResults: function(store, records) {
        var me = this;
        if (me.isReallyDirty(store, records)) {
            me.startProcess();
            return;
        }
        me.fireEvent('beforeupdate', me);
        // recalculate all results
        me.results.calculate();
        // now update the pivot store records
        Ext.Array.each(me.leftAxis.getTree(), me.updateRecordToPivotStore, me);
        // update all grand totals
        me.updateGrandTotalsToPivotStore();
        me.fireEvent('afterupdate', me);
    },
    /**
     * @private
     */
    updateGrandTotalsToPivotStore: function() {
        var me = this,
            totals = [],
            i;
        if (me.totals.length <= 0) {
            return;
        }
        totals.push({
            title: me.textGrandTotalTpl,
            values: me.preparePivotStoreRecordData({
                key: me.grandTotalKey
            })
        });
        // additional grand totals can be added. collect these using events or 
        if (Ext.isFunction(me.onBuildTotals)) {
            me.onBuildTotals(totals);
        }
        me.fireEvent('buildtotals', me, totals);
        // update records to the pivot store for each grand total
        if (me.totals.length === totals.length) {
            for (i = 0; i < me.totals.length; i++) {
                if (Ext.isObject(totals[i]) && Ext.isObject(totals[i].values) && (me.totals[i].record instanceof Ext.data.Model)) {
                    delete (totals[i].values.id);
                    me.totals[i].record.set(totals[i].values);
                }
            }
        }
    },
    /**
     * @private
     */
    updateRecordToPivotStore: function(item) {
        var me = this,
            dataIndex, data;
        if (!item.children) {
            if (item.record) {
                data = me.preparePivotStoreRecordData(item);
                delete (data['id']);
                item.record.set(data);
            }
        } else {
            // update all pivot store records of this item
            if (item.records) {
                dataIndex = (me.viewLayoutType == 'outline' ? item.dimensionId : me.compactViewKey);
                data = me.preparePivotStoreRecordData(item);
                delete (data['id']);
                delete (data[dataIndex]);
                item.records.collapsed.set(data);
                if (me.rowSubTotalsPosition == 'first') {
                    item.records.expanded.set(data);
                } else {
                    if (me.rowSubTotalsPosition == 'last') {
                        item.records.footer.set(data);
                    }
                }
            }
            Ext.Array.each(item.children, me.updateRecordToPivotStore, me);
        }
    },
    startProcess: function() {
        var me = this;
        // if we don't have a store then do nothing
        if (!me.store || (me.store && !me.store.isStore) || me.isDestroyed || me.store.isLoading()) {
            // nothing to do
            return;
        }
        me.clearData();
        me.localDelayedTask.delay(50);
    },
    delayedProcess: function() {
        var me = this;
        // let's start the process
        me.fireEvent('start', me);
        me.records = me.store.getRange();
        if (me.records.length == 0) {
            me.endProcess();
            return;
        }
        me.statusInProgress = false;
        me.processRecords(0);
    },
    processRecords: function(position) {
        var me = this,
            i = position,
            totalLength;
        // don't do anything if the matrix was destroyed while doing calculations.
        if (me.isDestroyed) {
            return;
        }
        totalLength = me.records.length;
        me.statusInProgress = true;
        while (i < totalLength && i < position + me.recordsPerJob && me.statusInProgress) {
            me.processRecord(me.records[i], i, totalLength);
            i++;
        }
        // if we reached the last record then stop the process
        if (i >= totalLength) {
            me.statusInProgress = false;
            // now that the cells matrix was built let's calculate the aggregates
            me.results.calculate();
            // let's build the trees and apply value filters
            me.leftAxis.buildTree();
            me.topAxis.buildTree();
            // recalculate everything after applying the value filters
            if (me.filterApplied) {
                me.results.calculate();
            }
            me.records = null;
            me.endProcess();
            return;
        }
        // if the matrix was not reconfigured meanwhile then start a new job
        if (me.statusInProgress && totalLength > 0) {
            Ext.defer(me.processRecords, me.timeBetweenJobs, me, [
                i
            ]);
        }
    },
    /**
     * Process the specified record and fire the 'progress' event
     *
     * @private
     */
    processRecord: function(record, index, length) {
        var me = this,
            grandTotalKey = me.grandTotalKey,
            leftItems, topItems, i, j;
        // if null is returned that means it was filtered out
        // if array was returned that means it is valid
        leftItems = me.leftAxis.processRecord(record);
        topItems = me.topAxis.processRecord(record);
        // left and top items are added to their respective axis if the record
        // is not filtered out on both axis
        if (leftItems && topItems) {
            me.results.add(grandTotalKey, grandTotalKey).addRecord(record);
            for (i = 0; i < topItems.length; i++) {
                me.topAxis.addItem(topItems[i]);
                me.results.add(grandTotalKey, topItems[i].key).addRecord(record);
            }
            for (i = 0; i < leftItems.length; i++) {
                me.leftAxis.addItem(leftItems[i]);
                me.results.add(leftItems[i].key, grandTotalKey).addRecord(record);
                for (j = 0; j < topItems.length; j++) {
                    me.results.add(leftItems[i].key, topItems[j].key).addRecord(record);
                }
            }
        }
        me.fireEvent('progress', me, index + 1, length);
    },
    /**
     * Fetch all records that belong to the specified row group
     *
     * @param {String} key Row group key
     */
    getRecordsByRowGroup: function(key) {
        var results = this.results.getByLeftKey(key),
            length = results.length,
            records = [],
            i;
        for (i = 0; i < length; i++) {
            records = Ext.Array.merge(records, results[i].records || []);
        }
        return records;
    },
    /**
     * Fetch all records that belong to the specified col group
     *
     * @param {String} key Col group key
     */
    getRecordsByColGroup: function(key) {
        var results = this.results.getByTopKey(key),
            length = results.length,
            records = [],
            i;
        for (i = 0; i < length; i++) {
            records = Ext.Array.merge(records, results[i].records || []);
        }
        return records;
    },
    /**
     * Fetch all records that belong to the specified row/col group
     *
     * @param {String} rowKey Row group key
     * @param {String} colKey Col group key
     */
    getRecordsByGroups: function(rowKey, colKey) {
        var result = this.results.get(rowKey, colKey);
        return (result ? result.records || [] : []);
    }
});

/**
 * This matrix allows you to do all the calculations on the backend.
 * This is handy when you have large data sets.
 *
 * Basically this class sends to the specified URL the following configuration object:
 *
 * - leftAxis: array of serialized dimensions on the left axis
 *
 * - topAxis: array of serialized dimensions on the top axis
 *
 * - aggregate: array of serialized dimensions on the aggregate
 *
 * - keysSeparator: the separator used by the left/top items keys. It's the one defined on the matrix
 *
 * - grandTotalKey: the key for the grand total items. It's the one defined on the matrix
 *
 *
 * The expected JSON should have the following format:
 *
 * - success - true/false
 *
 * - leftAxis - array of items that were generated for the left axis. Each item is an
 * object with keys for: key, value, name, dimensionId. If you send back the item name and you also
 * have a renderer defined then the renderer is not called anymore.
 *
 * - topAxis - array of items that were generated for the top axis.
 *
 * - results - array of results for all left/top axis items. Each result is an object
 * with keys for: leftKey, topKey, values. The 'values' object has keys for each
 * aggregate id that was sent to the backend.
 *
 * Example
 *
 *      // let's assume that we have this configuration on the pivot grid
 *      {
 *          xtype:  'pivotgrid',
 *
 *          matrixConfig: {
 *              type:   'remote',
 *              url:    'your-backend-url'
 *          },
 *
 *          aggregate: [{
 *              id:         'agg1',
 *              dataIndex:  'value',
 *              header:     'Sum of value',
 *              aggregator: 'sum'
 *          },{
 *              id:         'agg2',
 *              dataIndex:  'value',
 *              header:     '# records',
 *              aggregator: 'count',
 *              align:      'right',
 *              renderer:   Ext.util.Format.numberRenderer('0')
 *          }],
 *
 *          leftAxis: [{
 *              id:         'person',
 *              dataIndex:  'person',
 *              header:     'Person',
 *              sortable:   false
 *          },{
 *              id:         'country',
 *              dataIndex:  'country',
 *              header:     'Country'
 *          }],
 *
 *          topAxis: [{
 *              id:         'year',
 *              dataIndex:  'year',
 *              header:     'Year'
 *          },{
 *              id:         'month',
 *              dataIndex:  'month',
 *              header:     'Month'
 *          }]
 *      }
 *
 *      // this is the expected result from the server
 *      {
 *          "success": true,
 *          "leftAxis": [{
 *              "key": "john",
 *              "value": "John",
 *              "name": "John",
 *              "dimensionId": "person"
 *          }, {
 *              "key": "john#_#usa",
 *              "value": "USA",
 *              "name": "United States of America",
 *              "dimensionId": "country"
 *          }, {
 *              "key": "john#_#canada",
 *              "value": "Canada",
 *              "name": "Canada",
 *              "dimensionId": "country"
 *          }],
 *          "topAxis": [{
 *              "key": "2014",
 *              "value": "2014",
 *              "name": "2014",
 *              "dimensionId": "year"
 *          }, {
 *              "key": "2014#_#2",
 *              "value": "2",
 *              "name": "February",
 *              "dimensionId": "month"
 *          }],
 *          "results": [{
 *              "leftKey": "grandtotal",
 *              "topKey": "grandtotal",
 *              "values": {
 *                  "agg1": 100,
 *                  "agg2": 20
 *              }
 *          }, {
 *              "leftKey": "john",
 *              "topKey": "grandtotal",
 *              "values": {
 *                  "agg1": 100,
 *                  "agg2": 20
 *              }
 *          }, {
 *              "leftKey": "john#_#usa",
 *              "topKey": "grandtotal",
 *              "values": {
 *                  "agg1": 30,
 *                  "agg2": 7
 *              }
 *          }, {
 *              "leftKey": "john#_#canada",
 *              "topKey": "grandtotal",
 *              "values": {
 *                  "agg1": 70,
 *                  "agg2": 13
 *              }
 *          }, {
 *              "leftKey": "grandtotal",
 *              "topKey": "2014",
 *              "values": {
 *                  "agg1": 100,
 *                  "agg2": 20
 *              }
 *          }, {
 *              "leftKey": "grandtotal",
 *              "topKey": "2014#_#2",
 *              "values": {
 *                  "agg1": 50,
 *                  "agg2": 70
 *              }
 *          }, {
 *              "leftKey": "john",
 *              "topKey": "2014",
 *              "values": {
 *                  "agg1": 100,
 *                  "agg2": 20
 *              }
 *          }, {
 *              "leftKey": "john",
 *              "topKey": "2014#_#2",
 *              "values": {
 *                  "agg1": 100,
 *                  "agg2": 20
 *              }
 *          }, {
 *              "leftKey": "john#_#usa",
 *              "topKey": "2014",
 *              "values": {
 *                  "agg1": 70,
 *                  "agg2": 13
 *              }
 *          }, {
 *              "leftKey": "john#_#usa",
 *              "topKey": "2014#_#2",
 *              "values": {
 *                  "agg1": 70,
 *                  "agg2": 13
 *              }
 *          }, {
 *              "leftKey": "john#_#canada",
 *              "topKey": "2014",
 *              "values": {
 *                  "agg1": 30,
 *                  "agg2": 7
 *              }
 *          }, {
 *              "leftKey": "john#_#canada",
 *              "topKey": "2014#_#2",
 *              "values": {
 *                  "agg1": 30,
 *                  "agg2": 7
 *              }
 *          }]
 *      }
 *
 *
 * It is very important to use the dimension IDs that were sent to the backend
 * instead of creating new ones.
 *
 * This class can also serve as an example for implementing various types of
 * remote matrix.
 *
 *
 */
Ext.define('Ext.pivot.matrix.Remote', {
    alternateClassName: [
        'Mz.aggregate.matrix.Remote'
    ],
    extend: 'Ext.pivot.matrix.Base',
    alias: 'pivotmatrix.remote',
    /**
     * Fires before requesting data from the server side.
     * Return false if you don't want to make the Ajax request.
     *
     * @event beforerequest
     * @param {Ext.pivot.matrix.Remote} matrix Reference to the Matrix object
     * @param {Object} params Params sent by the Ajax request
     */
    /**
     * Fires if there was any Ajax exception or the success value in the response was false.
     *
     * @event requestexception
     * @param {Ext.pivot.matrix.Remote} matrix Reference to the Matrix object
     * @param {Object} response The Ajax response object
     */
    /**
     * @cfg {String} url
     *
     * URL on the server side where the calculations are performed.
     */
    url: '',
    /**
     * @cfg {Number} timeout
     *
     * The timeout in miliseconds to be used for the server side request.
     * Default to 30 seconds.
     */
    timeout: 3000,
    /**
     * @method
     *
     * Template function called before doing the Ajax request
     * You could change the request params in a subclass if you implement this method.
     * Return false if you don't want to make the Ajax request.
     *
     * @param {Object} params
     */
    onBeforeRequest: Ext.emptyFn,
    /**
     * @method
     *
     * Template function called if there was any Ajax exception or the success value
     * in the response was false.
     * You could handle the exception in a subclass if you implement this method.
     *
     * @param {Object} response
     */
    onRequestException: Ext.emptyFn,
    onInitialize: function() {
        var me = this;
        me.remoteDelayedTask = new Ext.util.DelayedTask(me.delayedProcess, me);
        me.callParent(arguments);
    },
    startProcess: function() {
        var me = this;
        if (Ext.isEmpty(me.url)) {
            // nothing to do
            return;
        }
        me.clearData();
        // let's start the process
        me.fireEvent('start', me);
        me.statusInProgress = false;
        me.remoteDelayedTask.delay(5);
    },
    delayedProcess: function() {
        var me = this,
            leftAxis = [],
            topAxis = [],
            aggregate = [],
            ret, params;
        me.leftAxis.dimensions.each(function(item) {
            leftAxis.push(item.serialize());
        });
        me.topAxis.dimensions.each(function(item) {
            topAxis.push(item.serialize());
        });
        me.aggregate.each(function(item) {
            aggregate.push(item.serialize());
        });
        params = {
            keysSeparator: me.keysSeparator,
            grandTotalKey: me.grandTotalKey,
            leftAxis: leftAxis,
            topAxis: topAxis,
            aggregate: aggregate
        };
        ret = me.fireEvent('beforerequest', me, params);
        if (ret !== false) {
            if (Ext.isFunction(me.onBeforeRequest)) {
                ret = me.onBeforeRequest(params);
            }
        }
        if (ret === false) {
            me.endProcess();
        } else {
            // do an Ajax call to the configured URL and fetch the results
            Ext.Ajax.request({
                url: me.url,
                timeout: me.timeout,
                jsonData: params,
                callback: me.processRemoteResults,
                scope: me
            });
        }
    },
    /**
     * Ajax request callback
     *
     * @private
     */
    processRemoteResults: function(options, success, response) {
        var me = this,
            exception = !success,
            data = Ext.JSON.decode(response.responseText, true);
        if (success) {
            exception = (!data || !data['success']);
        }
        if (exception) {
            // handle exception
            me.fireEvent('requestexception', me, response);
            if (Ext.isFunction(me.onRequestException)) {
                me.onRequestException(response);
            }
            me.endProcess();
            return;
        }
        Ext.Array.each(Ext.Array.from(data.leftAxis || []), function(item) {
            if (Ext.isObject(item)) {
                me.leftAxis.addItem(item);
            }
        });
        Ext.Array.each(Ext.Array.from(data.topAxis || []), function(item) {
            if (Ext.isObject(item)) {
                me.topAxis.addItem(item);
            }
        });
        Ext.Array.each(Ext.Array.from(data.results || []), function(item) {
            if (Ext.isObject(item)) {
                var result = me.results.add(item.leftKey || '', item.topKey || '');
                Ext.Object.each(item.values || {}, result.addValue, result);
            }
        });
        me.endProcess();
    }
});

/**
 * This plugin allows pivot grid data export using various exporters. Each exporter should extend
 * the {@link Ext.exporter.Base Base} class.
 *
 * Two new methods are created on the pivot grid by this plugin:
 *
 *  - saveDocumentAs(config): saves the document
 *  - getDocumentData(config): returns the document content
 *
 * Example usage:
 *
 *
 *      {
 *          xtype: 'pivotgrid',
 *          plugins: [{
 *              ptype: 'pivotexporter'
 *          }]
 *      }
 *
 *      pivot.saveDocumentAs({
 *          type: 'xlsx',
 *          title: 'My export',
 *          fileName: 'myExport.xlsx'
 *      });
 *
 *
 * When the exported data needs to be formatted then the {@link Ext.pivot.dimension.Item#exportStyle exportStyle}
 * can be used on either left axis or aggregate dimensions.
 *
 *      {
 *          xtype: 'pivotgrid',
 *
 *          aggregate: [{
 *              dataIndex:  'value',
 *              header:     'Total',
 *              aggregator: 'sum',
 *              exportStyle: {
 *                  format: 'Currency',
 *                  alignment: {
 *                      horizontal: 'Right'
 *                  }
 *              }
 *          }],
 *
 *          leftAxis: [{
 *              dataIndex:  'date',
 *              header:     'Transaction date',
 *              exportStyle: {
 *                  format: 'Short Date',
 *                  alignment: {
 *                      horizontal: 'Right'
 *                  }
 *              }
 *          },{
 *              dataIndex:  'company',
 *              header:     'Company',
 *              sortable:   false
 *          }]
 *          // ...
 *      }
 *
 */
Ext.define('Ext.pivot.plugin.Exporter', {
    alternateClassName: [
        'Mz.pivot.plugin.ExcelExport'
    ],
    alias: [
        'plugin.pivotexporter',
        'plugin.mzexcelexport'
    ],
    extend: 'Ext.exporter.Plugin',
    /**
     * @event beforedocumentsave
     * Fires on the pivot grid before a document is exported and saved.
     * @param {Ext.pivot.Grid} pivotGrid Reference to the pivot grid
     */
    /**
     * @event documentsave
     * Fires on the pivot grid whenever a document is exported and saved.
     * @param {Ext.pivot.Grid} pivotGrid Reference to the pivot grid
     */
    /**
     * @event dataready
     * Fires on the pivot grid when the {Ext.exporter.data.Table data object} is ready.
     * You could adjust styles or data before the document is generated and saved.
     * @param {Ext.pivot.Grid} pivotGrid Reference to the pivot grid
     */
    /**
     *  `"both"` (the default) - The plugin is added to both grids
     *  `"top"` - The plugin is added to the containing Panel
     *  `"locked"` - The plugin is added to the locked (left) grid
     *  `"normal"` - The plugin is added to the normal (right) grid
     *
     * @private
     */
    lockableScope: 'top',
    init: function(cmp) {
        var me = this;
        // this plugin is available only for the pivot grid
        if (!cmp.isPivotGrid) {
            Ext.raise('This plugin is only compatible with Ext.pivot.Grid');
        }
        return me.callParent([
            cmp
        ]);
    },
    /**
     * @inheritdoc
     */
    prepareData: function(config) {
        var me = this,
            table = new Ext.exporter.data.Table(),
            matrix, group, columns, headers, total, i, j, dLen, tLen, dataIndexes, row;
        me.matrix = matrix = me.cmp.getMatrix();
        me.onlyExpandedNodes = (config && config.onlyExpandedNodes);
        if (!me.onlyExpandedNodes) {
            me.setColumnsExpanded(matrix.topAxis.getTree(), true);
        }
        columns = Ext.clone(matrix.getColumnHeaders());
        headers = me.getColumnHeaders(columns, config);
        dataIndexes = me.getDataIndexColumns(columns);
        if (!me.onlyExpandedNodes) {
            me.setColumnsExpanded(matrix.topAxis.getTree());
        }
        group = table.addGroup({
            text: ''
        });
        me.extractGroups(group, matrix.leftAxis.getTree(), dataIndexes);
        tLen = matrix.totals.length;
        dLen = dataIndexes.length;
        for (i = 0; i < tLen; i++) {
            total = matrix.totals[i];
            row = group.addSummary();
            row.addCell({
                value: total.title
            });
            for (j = 1; j < dLen; j++) {
                row.addCell({
                    value: me.getRecordValue(total.record, dataIndexes[j])
                });
            }
        }
        me.matrix = me.onlyExpandedNodes = null;
        table.addGroup(group);
        table.setColumns(headers);
        return table;
    },
    /**
     * If we have to export everything then expand all top axis tree nodes temporarily
     *
     * @param items
     * @param expanded
     *
     * @private
     */
    setColumnsExpanded: function(items, expanded) {
        for (var i = 0; i < items.length; i++) {
            if (Ext.isDefined(expanded)) {
                items[i].backupExpanded = items[i].expanded;
                items[i].expanded = expanded;
            } else {
                items[i].expanded = items[i].backupExpanded;
                items[i].backupExpanded = null;
            }
            if (items[i].children) {
                this.setColumnsExpanded(items[i].children, expanded);
            }
        }
    },
    /**
     * Returns an array of column headers to be used in the export file
     *
     * @param {Array} columns
     * @param {Object} config
     *
     * @return {Array}
     *
     * @private
     */
    getColumnHeaders: function(columns, config) {
        var cols = [],
            length = columns.length,
            i, obj, col, doExtract;
        for (i = 0; i < length; i++) {
            col = columns[i];
            doExtract = this.onlyExpandedNodes ? (!col.group || col.group.expanded || (!col.group.expanded && col.subTotal)) : true;
            if (doExtract) {
                obj = {
                    text: (col.subTotal && col.group.expanded ? col.group.getTextTotal() : col.text)
                };
                if (col.columns) {
                    obj.columns = this.getColumnHeaders(col.columns, config);
                } else {
                    obj.width = col.dimension ? col.dimension.getWidth() : col.width || 100;
                    obj.style = col.dimension ? this.getExportStyle(col.dimension.getExportStyle(), config) : null;
                }
                cols.push(obj);
            }
        }
        return cols;
    },
    getRecordValue: function(record, obj) {
        var data = record.data;
        return (Ext.isEmpty(data[obj.dataIndex]) || (this.matrix.showZeroAsBlank && data[obj.dataIndex] === 0)) ? '' : data[obj.dataIndex];
    },
    /**
     * Find all columns that have a dataIndex
     *
     * @param columns
     *
     * @returns {Array}
     *
     * @private
     */
    getDataIndexColumns: function(columns) {
        var cols = [],
            i, col, doExtract;
        for (i = 0; i < columns.length; i++) {
            col = columns[i];
            doExtract = this.onlyExpandedNodes ? (!col.group || col.group.expanded || (!col.group.expanded && col.subTotal)) : true;
            if (doExtract) {
                if (col.dataIndex) {
                    cols.push({
                        dataIndex: col.dataIndex,
                        agg: col.dimension ? col.dimension.getId() : null
                    });
                } else if (col.columns) {
                    cols = Ext.Array.merge(cols, this.getDataIndexColumns(col.columns));
                }
            }
        }
        return cols;
    },
    /**
     * Extract data from left axis groups.
     *
     * @param group
     * @param items
     * @param columns
     *
     * @returns {Object}
     *
     * @private
     */
    extractGroups: function(group, items, columns) {
        var i, j, iLen, cLen, doExtract, item, row, subGroup, record;
        iLen = items.length;
        for (i = 0; i < iLen; i++) {
            item = items[i];
            if (item.record) {
                row = group.addRow();
                for (j = 0; j < columns.length; j++) {
                    row.addCell({
                        value: this.getRecordValue(item.record, columns[j])
                    });
                }
            } else if (item.children) {
                subGroup = group.addGroup({
                    text: item.name
                });
                doExtract = this.onlyExpandedNodes ? item.expanded : true;
                if (doExtract) {
                    this.extractGroups(subGroup, item.children, columns);
                }
                row = subGroup.addSummary();
                row.addCell({
                    value: (doExtract ? item.getTextTotal() : item.value)
                });
                record = (item.expanded ? item.records.expanded : item.records.collapsed);
                cLen = columns.length;
                for (j = 1; j < cLen; j++) {
                    row.addCell({
                        value: this.getRecordValue(record, columns[j])
                    });
                }
                group.addGroup(subGroup);
            }
        }
        return group;
    }
});

/**
 * This class allows you to define various settings for each configurator field.
 */
Ext.define('Ext.pivot.plugin.configurator.FieldSettings', {
    $configStrict: false,
    config: {
        /**
         * @cfg {String} cls
         *
         * CSS class to add to this configurator field
         */
        cls: '',
        /**
         * @cfg {String/Object} style Similar to {@link Ext.Component#style Component style config}.
         */
        style: null,
        /**
         * @cfg {String/Array} fixed
         *
         * If you want a field to be fixed in a specific area then you must define those areas here.
         *
         * Possible values:
         *
         * - `aggregate`: "values" area;
         * - `leftAxis`: "row values" area;
         * - `topAxis`: "column values" area;
         *
         */
        fixed: [],
        /**
         * @cfg {String[]} allowed
         *
         * Define here the areas where this field can be used.
         *
         * Possible values:
         *
         * - `aggregate`: "values" area;
         * - `leftAxis`: "row values" area;
         * - `topAxis`: "column values" area;
         *
         */
        allowed: [
            'leftAxis',
            'topAxis',
            'aggregate'
        ],
        /**
         * @cfg {String[]} aggregators
         *
         * Define here the functions that can be used when the dimension is configured as an aggregate.
         *
         * If you need to use your own function then you could override {@link Ext.pivot.Aggregators} like this:
         *
         *      Ext.define('overrides.pivot.Aggregators', {
         *          customFn: function(){
         *              // ... do your own calculation
         *          },
         *          customFnText: 'Custom fn'
         *      });
         *
         * Do not forget to define a text for your function. It will be displayed inside the 'Summarize by' field of
         * the FieldSettings window.
         *
         * If no text is defined then `Custom` will be used.
         *
         * You can also provide a function on the view controller and it will appear in the FieldSettings window as
         * "Custom".
         *
         */
        aggregators: [
            'sum',
            'avg',
            'min',
            'max',
            'count',
            'groupSumPercentage',
            'groupCountPercentage',
            'variance',
            'varianceP',
            'stdDev',
            'stdDevP'
        ],
        /**
         * @cfg {Object} renderers
         *
         * These renderers are used only on the aggregate dimensions.
         *
         * The expected value is an object. Each key of this object is a text that will be shown in the "Format as" field
         * in the FieldSettings window. Check out the {@link Ext.grid.column.Column#renderer grid column renderer}
         * to see what is supported.
         *
         *      renderers: {
         *          'Colored 0,000.00': 'coloredRenderer' // function on the controller
         *      }
         *
         */
        renderers: {},
        /**
         * @cfg {Object} formatters
         *
         * Formatters are used only on the aggregate dimensions.
         *
         * The expected value is an object. Each key of this object is a text that will be shown in the "Format as" field
         * in the FieldSettings window. Check out the {@link Ext.grid.column.Column#formatter grid column formatter}
         * to see what is supported.
         *
         *      formatters: {
         *          '0': 'number("0")',
         *          '0%': 'number("0%")'
         *      }
         *
         */
        formatters: {}
    },
    isFieldSettings: true,
    constructor: function(config) {
        this.initConfig(config || {});
        return this.callParent(arguments);
    },
    getDefaultEmptyArray: function(prop) {
        var ret = this['_' + prop];
        if (!ret) {
            ret = [];
            this['set' + Ext.String.capitalize(prop)](ret);
        }
        return ret;
    },
    applyArrayValues: function(prop, newValue, oldValue) {
        if (newValue == null || (newValue && Ext.isArray(newValue))) {
            return newValue;
        }
        if (newValue) {
            if (!oldValue) {
                oldValue = this['get' + Ext.String.capitalize(prop)]();
            }
            Ext.Array.splice(oldValue, 0, oldValue.length, newValue);
        }
        return oldValue;
    },
    getFixed: function() {
        return this.getDefaultEmptyArray('fixed');
    },
    applyFixed: function(newValue, oldValue) {
        return this.applyArrayValues('fixed', newValue, oldValue);
    },
    getAllowed: function() {
        return this.getDefaultEmptyArray('allowed');
    },
    applyAllowed: function(newValue, oldValue) {
        return this.applyArrayValues('allowed', newValue, oldValue);
    },
    getAggregators: function() {
        return this.getDefaultEmptyArray('aggregators');
    },
    applyAggregators: function(newValue, oldValue) {
        return this.applyArrayValues('aggregators', newValue, oldValue);
    },
    /**
     * Check if this field is fixed in the specified container or not.
     *
     * @param {Ext.pivot.plugin.configurator.Container} fromContainer
     * @return {Boolean}
     */
    isFixed: function(fromContainer) {
        var type;
        if (!fromContainer) {
            return false;
        }
        type = fromContainer.getFieldType();
        return Ext.Array.indexOf(this.getFixed(), type) >= 0;
    },
    /**
     * Check if this field is allowed to be added to the specified container
     *
     * @param {Ext.pivot.plugin.configurator.Container} toContainer
     * @return {Boolean}
     */
    isAllowed: function(toContainer) {
        var fixed = this.getFixed(),
            type;
        if (!toContainer) {
            return false;
        }
        type = toContainer.getFieldType();
        if (fixed.length) {
            // if we have 'fixed' constraints then we can only move there
            return Ext.Array.indexOf(fixed, type) >= 0;
        }
        return (type === 'all') || (Ext.Array.indexOf(this.getAllowed(), type) >= 0);
    }
});

/**
 * This class extends the dimension item to be able to provide additional settings in the configurator plugin.
 */
Ext.define('Ext.pivot.plugin.configurator.Field', {
    extend: 'Ext.pivot.dimension.Item',
    requires: [
        'Ext.pivot.plugin.configurator.FieldSettings'
    ],
    config: {
        /**
         * @cfg {Ext.pivot.plugin.configurator.FieldSettings} settings
         *
         * Define special restrictions or configurations for this field.
         */
        settings: {}
    },
    isField: true,
    clone: function() {
        return new Ext.pivot.plugin.configurator.Field(Ext.applyIf({
            id: Ext.id()
        }, this.getInitialConfig()));
    },
    serialize: function() {
        var cfg = this.callParent(arguments);
        return Ext.apply(cfg, {
            settings: cfg.settings.getConfig()
        });
    },
    applyAggregator: function(agg, oldAgg) {
        var obj = this.getSettings(),
            fns = obj.getAggregators();
        if (fns.length == 0) {
            Ext.Array.remove(obj.getDrop(), 'aggregate');
        } else {
            if (Ext.Array.indexOf(fns, agg) < 0) {
                agg = fns[0];
            }
        }
        return this.callParent(arguments);
    },
    getSettings: function() {
        var ret = this.settings;
        if (!ret) {
            ret = new Ext.pivot.plugin.configurator.FieldSettings({});
            this.setSettings(ret);
        }
        return ret;
    },
    applySettings: function(settings, obj) {
        if (settings == null || (settings && settings.isFieldSettings)) {
            return settings;
        }
        if (settings) {
            if (!obj) {
                obj = this.getSettings();
            }
            obj.setConfig(settings);
        }
        if (obj) {
            this.setAggregator(this.getAggregator());
        }
        return obj;
    },
    getFieldText: function() {
        var header = this.getHeader();
        if (this.isAggregate) {
            header += ' (' + this.getAggText() + ')';
        }
        return header;
    },
    getAggText: function(fn) {
        var Agg = Ext.pivot.Aggregators,
            f = fn || this.getAggregator();
        if (Ext.isFunction(f)) {
            return Agg.customText;
        }
        return Agg[f + 'Text'] || Agg.customText;
    }
});

/**
 * This class defines an update operation that occurs on records belonging to a
 * {@link Ext.pivot.result.Base matrix result}.
 *
 * This class should be extended to provide the update operation algorithm.
 *
 * How does such an update work?
 *
 * The {@link Ext.pivot.result.Base result object} contains an array of records that participate
 * in the result aggregation. The {@link #value} is used to update all these records on the
 * {@link #dataIndex} field.
 *
 * **Note:** These updaters are used by the {@link Ext.pivot.plugin.RangeEditor} plugin.
 */
Ext.define('Ext.pivot.update.Base', {
    extend: 'Ext.mixin.Observable',
    alias: 'pivotupdate.base',
    mixins: [
        'Ext.mixin.Factoryable'
    ],
    config: {
        /**
         * @cfg {String} leftKey (required)
         *
         *  Key of left axis item or grandTotalKey
         */
        leftKey: null,
        /**
         * @cfg {String} topKey (required)
         *
         * Key of top axis item or grandTotalKey
         */
        topKey: null,
        /**
         * @cfg {Ext.pivot.matrix.Base} matrix (required)
         *
         * Reference to the matrix object
         */
        matrix: null,
        /**
         * @cfg {String} dataIndex (required)
         *
         * Field that needs to be updated on all records found on the {@link Ext.pivot.result.Base matrix result}.
         */
        dataIndex: null,
        /**
         * @cfg {Variant} value
         *
         * The new value that is set for each record found on the {@link Ext.pivot.result.Base matrix result}.
         */
        value: null
    },
    destroy: function() {
        this.setMatrix(null);
        this.callParent();
    },
    getResult: function() {
        var matrix = this.getMatrix();
        return matrix ? matrix.results.get(this.getLeftKey(), this.getTopKey()) : null;
    },
    /**
     * Update values on the specified {@link Ext.pivot.result.Base matrix result} records.
     *
     * @return {Ext.Promise}
     */
    update: function() {
        var me = this;
        /**
         * Fires before updating all result records.
         *
         * @event beforeupdate
         * @param {Ext.pivot.update.Base} updater Reference to the updater object
         */
        /**
         * Fires after updating all result records.
         *
         * @event update
         * @param {Ext.pivot.update.Base} updater Reference to the updater object
         */
        return new Ext.Promise(function(resolve, reject) {
            if (!me.getMatrix() || !me.getDataIndex()) {
                Ext.raise('Invalid configuration');
            }
            var result = me.getResult();
            if (result) {
                if (me.fireEvent('beforeupdate', me) !== false) {
                    Ext.asap(me.onUpdate, me, [
                        result,
                        resolve,
                        reject
                    ]);
                } else {
                    reject('Operation canceled!');
                }
            } else {
                reject('No Result found!');
            }
        });
    },
    /**
     * Overwrite this function to provide update operation algorithm.
     *
     * @param {Ext.pivot.result.Base} result
     * @param {Function} resolve Function called if operation is successful
     * @param {Function} reject Function called if operation fails
     */
    onUpdate: function(result, resolve, reject) {
        this.fireEvent('update', this);
        resolve(this);
    }
});

/**
 * This updater increments all records found on the {@link Ext.pivot.result.Base matrix result}
 * using the specified value.
 *
 * Let's say that the result object contains the following records (each record is a
 * {@link Ext.data.Model model instance} in fact but we use json representation for this example):
 *
 *      [
 *          { product: 'Phone', country: 'USA', order: 100 },
 *          { product: 'Tablet', country: 'USA', order: 200 }
 *      ]
 *
 * And we want to increment all orders by a fixed value of 50. This is how the updater config looks like:
 *
 *      {
 *          type: 'increment',
 *          leftKey: resultLeftKey,
 *          topKey: resultTopKey,
 *          matrix: matrix,
 *          dataIndex: 'order',
 *          value: 50
 *      }
 *
 * And this is how the records look after the update:
 *
 *      [
 *          { product: 'Phone', country: 'USA', order: 150 },
 *          { product: 'Tablet', country: 'USA', order: 250 }
 *      ]
 *
 */
Ext.define('Ext.pivot.update.Increment', {
    extend: 'Ext.pivot.update.Base',
    alias: 'pivotupdate.increment',
    onUpdate: function(result, resolve, reject) {
        var dataIndex = this.getDataIndex(),
            value = parseFloat(this.getValue()),
            records = result.records,
            len, i;
        if (records) {
            len = records.length;
            for (i = 0; i < len; i++) {
                records[i].set(dataIndex, records[i].get(dataIndex) + value);
            }
        }
        this.callParent([
            result,
            resolve,
            reject
        ]);
    }
});

/**
 * This updater overwrites the value on all records found on the {@link Ext.pivot.result.Base matrix result}.
 *
 * Let's say that the result object contains the following records (each record is a
 * {@link Ext.data.Model model instance} in fact but we use json representation for this example):
 *
 *      [
 *          { product: 'Phone', country: 'USA', order: 100 },
 *          { product: 'Tablet', country: 'USA', order: 200 }
 *      ]
 *
 * And we want all orders to have the same value of 250. This is how the updater config looks like:
 *
 *      {
 *          type: 'overwrite',
 *          leftKey: resultLeftKey,
 *          topKey: resultTopKey,
 *          matrix: matrix,
 *          dataIndex: 'order',
 *          value: 250
 *      }
 *
 * And this is how the records look after the update:
 *
 *      [
 *          { product: 'Phone', country: 'USA', order: 250 },
 *          { product: 'Tablet', country: 'USA', order: 250 }
 *      ]
 *
 */
Ext.define('Ext.pivot.update.Overwrite', {
    extend: 'Ext.pivot.update.Base',
    alias: 'pivotupdate.overwrite',
    onUpdate: function(result, resolve, reject) {
        var dataIndex = this.getDataIndex(),
            value = this.getValue(),
            records = result.records,
            len, i;
        if (records) {
            len = records.length;
            for (i = 0; i < len; i++) {
                records[i].set(dataIndex, value);
            }
        }
        this.callParent([
            result,
            resolve,
            reject
        ]);
    }
});

/**
 * This updater changes all records found on the {@link Ext.pivot.result.Base matrix result}
 * using the specified value as a percentage.
 *
 * Let's say that the result object contains the following records (each record is a
 * {@link Ext.data.Model model instance} in fact but we use json representation for this example):
 *
 *      [
 *          { product: 'Phone', country: 'USA', order: 100 },
 *          { product: 'Tablet', country: 'USA', order: 200 }
 *      ]
 *
 * And we want to increase all orders by 150%. This is how the updater config looks like:
 *
 *      {
 *          type: 'percentage',
 *          leftKey: resultLeftKey,
 *          topKey: resultTopKey,
 *          matrix: matrix,
 *          dataIndex: 'order',
 *          value: 150
 *      }
 *
 * And this is how the records look after the update:
 *
 *      [
 *          { product: 'Phone', country: 'USA', order: 150 },
 *          { product: 'Tablet', country: 'USA', order: 300 }
 *      ]
 *
 */
Ext.define('Ext.pivot.update.Percentage', {
    extend: 'Ext.pivot.update.Base',
    alias: 'pivotupdate.percentage',
    onUpdate: function(result, resolve, reject) {
        var dataIndex = this.getDataIndex(),
            value = parseFloat(this.getValue()),
            records = result.records,
            len, i;
        if (records) {
            len = records.length;
            for (i = 0; i < len; i++) {
                records[i].set(dataIndex, Math.floor(records[i].get(dataIndex) * value / 100));
            }
        }
        this.callParent([
            result,
            resolve,
            reject
        ]);
    }
});

/**
 * This updater evenly distributes the value across all records found on the {@link Ext.pivot.result.Base matrix result}.
 *
 * Let's say that the result object contains the following records (each record is a
 * {@link Ext.data.Model model instance} in fact but we use json representation for this example):
 *
 *      [
 *          { product: 'Phone', country: 'USA', order: 100 },
 *          { product: 'Tablet', country: 'USA', order: 200 }
 *      ]
 *
 * And we want to evenly distribute the value 300 to all orders. This is how the updater config looks like:
 *
 *      {
 *          type: 'uniform',
 *          leftKey: resultLeftKey,
 *          topKey: resultTopKey,
 *          matrix: matrix,
 *          dataIndex: 'order',
 *          value: 300
 *      }
 *
 * And this is how the records look after the update:
 *
 *      [
 *          { product: 'Phone', country: 'USA', order: 150 },
 *          { product: 'Tablet', country: 'USA', order: 150 }
 *      ]
 *
 */
Ext.define('Ext.pivot.update.Uniform', {
    extend: 'Ext.pivot.update.Base',
    alias: 'pivotupdate.uniform',
    onUpdate: function(result, resolve, reject) {
        var dataIndex = this.getDataIndex(),
            records = result.records,
            len, i, avg;
        if (records) {
            len = records.length;
            if (len > 0) {
                avg = (parseFloat(this.getValue()) / len);
                for (i = 0; i < len; i++) {
                    records[i].set(dataIndex, avg);
                }
            }
        }
        this.callParent([
            result,
            resolve,
            reject
        ]);
    }
});

/**
 * This class is used internally by the pivot grid component.
 * @private
 */
Ext.define('Ext.pivot.cell.Cell', {
    extend: 'Ext.grid.cell.Cell',
    xtype: 'pivotgridcell',
    groupHeaderCollapsedCls: Ext.baseCSSPrefix + 'pivot-grid-group-header-collapsed',
    // outline view css classes
    outlineCellHiddenCls: Ext.baseCSSPrefix + 'pivot-grid-outline-cell-hidden',
    outlineCellGroupExpandedCls: Ext.baseCSSPrefix + 'pivot-grid-outline-cell-previous-expanded',
    // compact view css classes
    compactGroupHeaderCls: Ext.baseCSSPrefix + 'pivot-grid-group-header-compact',
    compactLayoutPadding: 25,
    groupCls: Ext.baseCSSPrefix + 'pivot-grid-group',
    groupHeaderCls: Ext.baseCSSPrefix + 'pivot-grid-group-header',
    groupHeaderCollapsibleCls: Ext.baseCSSPrefix + 'pivot-grid-group-header-collapsible',
    summaryDataCls: Ext.baseCSSPrefix + 'pivot-summary-data',
    // summary rows styling
    summaryRowCls: Ext.baseCSSPrefix + 'pivot-grid-group-total',
    grandSummaryRowCls: Ext.baseCSSPrefix + 'pivot-grid-grand-total',
    encodeHtml: false,
    constructor: function() {
        var me = this,
            ret = me.callParent(arguments),
            model = me.getViewModel(),
            dataIndex = me.dataIndex,
            record = me.getRecord();
        if (model && dataIndex) {
            model.set('column', me.parent.getGrid().getMatrix().modelInfo[dataIndex] || {});
            model.set('value', me.getValue());
            model.set('record', record ? record.data : {});
        }
        return ret;
    },
    handleEvent: function(type, e) {
        var me = this,
            grid = me.parent.getGrid(),
            row = me.parent,
            record = me.getRecord(),
            params = {
                grid: grid
            },
            info, eventName, cls, cell, ret, colDef, leftKey, topKey, matrix, leftItem, topItem;
        if (!record) {
            return;
        }
        if (row.element.hasCls(me.grandSummaryRowCls)) {
            eventName = 'pivottotal';
        } else if (row.element.hasCls(me.summaryRowCls)) {
            eventName = 'pivotgroup';
        } else if (row.element.hasCls(me.summaryDataCls)) {
            eventName = 'pivotitem';
        }
        info = row.getRecordInfo(record);
        matrix = grid.getMatrix();
        leftKey = info.leftKey;
        leftItem = matrix.leftAxis.findTreeElement('key', leftKey);
        leftItem = leftItem ? leftItem.node : null;
        Ext.apply(params, {
            cell: me,
            leftKey: leftKey,
            leftItem: leftItem
        });
        params.column = me.getColumn();
        if (!me.element.hasCls(me.groupHeaderCls)) {
            eventName += 'cell';
            topKey = grid.getTopAxisKey(params.column);
            params.topKey = topKey;
            if (topKey) {
                topItem = matrix.topAxis.findTreeElement('key', topKey);
                topItem = topItem ? topItem.node : null;
                if (topItem) {
                    Ext.apply(params, {
                        topItem: topItem,
                        dimensionId: topItem.dimensionId
                    });
                }
            }
        }
        ret = grid.fireEvent(eventName + type, params, e);
        if (ret !== false && type == 'tap' && me.element.hasCls(me.groupHeaderCollapsibleCls)) {
            if (leftItem.expanded) {
                leftItem.collapse();
            } else {
                leftItem.expand();
            }
        }
        return false;
    },
    updateRecord: function(record, oldRecord) {
        var model = this.getViewModel();
        this.callParent([
            record,
            oldRecord
        ]);
        if (model) {
            model.set('value', this.getValue());
            model.set('record', record ? record.data : {});
        }
    }
});

/**
 * This class is used internally by the pivot grid component.
 * @private
 */
Ext.define('Ext.pivot.cell.Group', {
    extend: 'Ext.pivot.cell.Cell',
    xtype: 'pivotgridgroupcell',
    config: {
        innerGroupStyle: null,
        innerGroupCls: null,
        userGroupStyle: null,
        userGroupCls: null
    },
    element: {
        reference: 'element',
        cls: Ext.baseCSSPrefix + 'grid-cell',
        children: [
            {
                reference: 'innerElement',
                cls: Ext.baseCSSPrefix + 'grid-cell-inner ',
                children: [
                    {
                        reference: 'groupElement',
                        cls: Ext.baseCSSPrefix + 'pivot-grid-group-title'
                    }
                ]
            }
        ]
    },
    updateInnerGroupStyle: function(cellStyle) {
        this.groupElement.applyStyles(cellStyle);
    },
    updateInnerGroupCls: function(cls, oldCls) {
        this.groupElement.replaceCls(oldCls, cls);
    },
    updateUserGroupStyle: function(cellStyle) {
        this.groupElement.applyStyles(cellStyle);
    },
    updateUserGroupCls: function(cls, oldCls) {
        this.groupElement.replaceCls(oldCls, cls);
    },
    updateRawValue: function(rawValue) {
        var dom = this.groupElement.dom;
        if (this.getEncodeHtml()) {
            dom.textContent = rawValue;
        } else {
            dom.innerHTML = rawValue;
        }
    },
    updateRecord: function(record, oldRecord) {
        var me = this,
            info = me.parent.getRecordInfo(),
            dataIndex = me.dataIndex;
        if (info && dataIndex) {
            info = info.rendererParams[dataIndex];
            if (info && me[info.fn]) {
                me[info.fn](info, me.parent.getGrid());
            }
        }
        me.callParent(arguments);
    },
    groupOutlineRenderer: function(config, grid) {
        var me = this,
            cellCls = '';
        if (grid.getMatrix().viewLayoutType == 'compact') {
            // the grand total uses this renderer in compact view and margins need to be reset
            me.setInnerGroupStyle((grid.isRTL() ? 'margin-right: ' : 'margin-left: ') + '0px;');
        }
        if (config.colspan > 0) {
            cellCls += me.groupHeaderCls;
            if (!config.subtotalRow) {
                cellCls += ' ' + me.groupHeaderCollapsibleCls;
                if (!config.group.expanded) {
                    cellCls += ' ' + me.groupHeaderCollapsedCls;
                }
                if (config.previousExpanded) {
                    cellCls += ' ' + me.outlineCellGroupExpandedCls;
                }
            }
            me.setCellCls(cellCls);
            me.setInnerGroupCls(me.groupCls);
            return;
        }
        me.setCellCls(me.outlineCellHiddenCls);
    },
    recordOutlineRenderer: function(config, grid) {
        var me = this;
        if (config.hidden) {
            me.setCellCls(me.outlineCellHiddenCls);
            return;
        }
        me.setCellCls(me.groupHeaderCls);
    },
    groupCompactRenderer: function(config, grid) {
        var me = this,
            cellCls = '';
        me.setInnerGroupStyle((grid.isRTL() ? 'margin-right: ' : 'margin-left: ') + (me.compactLayoutPadding * config.group.level) + 'px;');
        cellCls += me.groupHeaderCls + ' ' + me.compactGroupHeaderCls;
        if (!config.subtotalRow) {
            cellCls += ' ' + me.groupHeaderCollapsibleCls;
            if (!config.group.expanded) {
                cellCls += ' ' + me.groupHeaderCollapsedCls;
            }
            if (config.previousExpanded) {
                cellCls += ' ' + me.outlineCellGroupExpandedCls;
            }
        }
        me.setCellCls(cellCls);
        me.setInnerGroupCls(me.groupCls);
    },
    recordCompactRenderer: function(config, grid) {
        var me = this,
            cellCls = [];
        me.setInnerGroupStyle((grid.isRTL() ? 'margin-right: ' : 'margin-left: ') + (me.compactLayoutPadding * config.group.level) + 'px;');
        me.setCellCls(me.groupHeaderCls + ' ' + me.compactGroupHeaderCls);
    }
});

/**
 * This class is used internally by the pivot grid component.
 * @private
 */
Ext.define('Ext.pivot.Row', {
    extend: 'Ext.grid.Row',
    xtype: 'pivotgridrow',
    requires: [
        'Ext.pivot.cell.Group'
    ],
    config: {
        recordInfo: null,
        rowCls: null
    },
    initialize: function() {
        var model = this.getViewModel();
        if (model) {
            model.set('columns', this.getGrid().getMatrix().modelInfo);
        }
        return this.callParent(arguments);
    },
    destroy: function() {
        this.setRecordInfo(null);
        this.callParent();
    },
    updateRowCls: function(newCls, oldCls) {
        this.element.replaceCls(oldCls, newCls);
    },
    updateRecord: function(record, oldRecord) {
        var me = this,
            info = me.getGrid().getRecordInfo(record);
        me.setRecordInfo(info);
        if (info) {
            me.setRowCls(info.rowClasses);
        }
        me.callParent([
            record,
            oldRecord
        ]);
    }
});

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
    matrixConfig: null,
    /**
     * @cfg {Boolean} enableLoadMask Set this on false if you don't want to see the loading mask.
     */
    enableLoadMask: true,
    /**
     * @cfg {Boolean} enableColumnSort Set this on false if you don't want to allow column sorting
     * in the pivot grid generated columns.
     */
    enableColumnSort: true,
    /**
     * @cfg {String} viewLayoutType Type of layout used to display the pivot data.
     * Possible values: outline, compact.
     */
    viewLayoutType: 'outline',
    /**
     * @cfg {String} rowSubTotalsPosition Possible values: first, none, last
     */
    rowSubTotalsPosition: 'first',
    /**
     * @cfg {String} rowGrandTotalsPosition Possible values: first, none, last
     */
    rowGrandTotalsPosition: 'last',
    /**
     * @cfg {String} colSubTotalsPosition Possible values: first, none, last
     */
    colSubTotalsPosition: 'last',
    /**
     * @cfg {String} colGrandTotalsPosition Possible values: first, none, last
     */
    colGrandTotalsPosition: 'last',
    /**
     * @cfg {String} textTotalTpl Configure the template for the group total. (i.e. '{name} ({rows.length} items)')
     * @cfg {String}           textTotalTpl.groupField         The field name being grouped by.
     * @cfg {String}           textTotalTpl.name               Group name
     * @cfg {Ext.data.Model[]} textTotalTpl.rows               An array containing the child records for the group being rendered.
     */
    textTotalTpl: 'Total ({name})',
    /**
     * @cfg {String} textGrandTotalTpl Configure the template for the grand total.
     */
    textGrandTotalTpl: 'Grand total',
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
    leftAxis: null,
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
    topAxis: null,
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
    aggregate: null,
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
    cellSelector: '.' + Ext.baseCSSPrefix + 'grid-cell',
    /**
     * @cfg {String} clsGroupTotal CSS class assigned to the group totals.
     */
    clsGroupTotal: Ext.baseCSSPrefix + 'pivot-grid-group-total',
    /**
     * @cfg {String} clsGrandTotal CSS class assigned to the grand totals.
     */
    clsGrandTotal: Ext.baseCSSPrefix + 'pivot-grid-grand-total',
    groupHeaderCollapsedCls: Ext.baseCSSPrefix + 'pivot-grid-group-header-collapsed',
    groupHeaderCollapsibleCls: Ext.baseCSSPrefix + 'pivot-grid-group-header-collapsible',
    summaryDataCls: Ext.baseCSSPrefix + 'pivot-summary-data',
    groupCls: Ext.baseCSSPrefix + 'pivot-grid-group',
    relayedMatrixEvents: [
        'beforereconfigure',
        'reconfigure',
        'start',
        'progress',
        'done',
        'modelbuilt',
        'columnsbuilt',
        'recordbuilt',
        'buildtotals',
        'storebuilt',
        'groupexpand',
        'groupcollapse',
        'beforerequest',
        'requestexception'
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
    },
    /**
         * @cfg record
         * @hide
         */
    defaultType: 'pivotgridrow',
    initialize: function() {
        var me = this,
            matrix = {},
            ret;
        me.setColumns([]);
        me.setStore(Ext.create('Ext.data.ArrayStore', {
            fields: []
        }));
        me.addCls(Ext.baseCSSPrefix + 'pivot-grid');
        me.pivotDataSource = new Ext.pivot.feature.PivotStore({
            store: me.getStore(),
            grid: me,
            clsGrandTotal: me.clsGrandTotal,
            clsGroupTotal: me.clsGroupTotal,
            summaryDataCls: me.summaryDataCls
        });
        me.getHeaderContainer().on({
            columntap: 'handleColumnTap',
            headergrouptap: 'handleHeaderGroupTap',
            scope: me
        });
        ret = me.callParent(arguments);
        Ext.apply(matrix, {
            leftAxis: me.leftAxis,
            topAxis: me.topAxis,
            aggregate: me.aggregate,
            showZeroAsBlank: me.showZeroAsBlank,
            textTotalTpl: me.textTotalTpl,
            textGrandTotalTpl: me.textGrandTotalTpl,
            viewLayoutType: me.viewLayoutType,
            rowSubTotalsPosition: me.rowSubTotalsPosition,
            rowGrandTotalsPosition: me.rowGrandTotalsPosition,
            colSubTotalsPosition: me.colSubTotalsPosition,
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
    destroy: function() {
        var me = this;
        Ext.destroy(me.matrixRelayedListeners, me.matrixListeners, me.headerCtListeners, me.lockedHeaderCtListeners);
        Ext.destroy(me.pivotDataSource);
        me.matrixRelayedListeners = me.matrixListeners = me.headerCtListeners = me.lockedHeaderCtListeners = null;
        me.setMatrix(null);
        me.callParent();
        me.lastColumnSorted = me.store = Ext.destroy(me.store);
    },
    updateTopAxisCellConfig: function(obj) {
        var matrix = this.getMatrix(),
            zeroAsBlank;
        zeroAsBlank = matrix ? matrix.showZeroAsBlank : this.showZeroAsBlank;
        if (Ext.isObject(obj)) {
            Ext.apply(obj, {
                zeroValue: zeroAsBlank ? '' : '0'
            });
        }
    },
    applyMatrix: function(newMatrix, oldMatrix) {
        Ext.destroy(oldMatrix);
        if (newMatrix == null) {
            return newMatrix;
        }
        if (newMatrix && newMatrix.isPivotMatrix) {
            newMatrix.cmp = this;
            return newMatrix;
        }
        Ext.applyIf(newMatrix, {
            type: 'local'
        });
        newMatrix.cmp = this;
        return Ext.Factory.pivotmatrix(newMatrix);
    },
    updateMatrix: function(matrix, oldMatrix) {
        var me = this;
        Ext.destroy(oldMatrix, me.matrixListeners, me.matrixRelayedListeners);
        if (matrix) {
            me.matrixListeners = matrix.on({
                cleardata: me.onMatrixClearData,
                start: me.onMatrixProcessStart,
                progress: me.onMatrixProcessProgress,
                done: me.onMatrixDataReady,
                beforeupdate: me.onMatrixBeforeUpdate,
                afterupdate: me.onMatrixAfterUpdate,
                groupexpand: me.onMatrixGroupExpandCollapse,
                groupcollapse: me.onMatrixGroupExpandCollapse,
                scope: me,
                destroyable: true
            });
            me.matrixRelayedListeners = me.relayEvents(matrix, me.relayedMatrixEvents, 'pivot');
            if (me.pivotDataSource) {
                me.pivotDataSource.setMatrix(matrix);
            }
        }
    },
    /**
     * Refresh the view.
     *
     * @private
     */
    refreshView: function() {
        var me = this;
        if (me.destroyed || me.destroying) {
            return;
        }
        me.getStore().fireEvent('pivotstoreremodel', me);
    },
    updateHeaderContainerColumns: function(group) {
        var me = this,
            i = 0,
            cols, index, ownerCt, item, column;
        if (group) {
            // let's find the first column that matches this group
            // that will be our new columns insertion point
            column = me.getColumnForGroup(me.getHeaderContainer().innerItems, group);
            if (column.found) {
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
        } else {
            // we probably have to expand/collapse all group columns
            cols = Ext.clone(me.pivotColumns);
            me.preparePivotColumns(cols);
            me.setColumns(cols);
        }
    },
    getColumnForGroup: function(items, group) {
        var length = items.length,
            ret = {
                found: false,
                index: -1,
                item: null
            },
            i, item;
        // let's find the first column that matches this group
        // that will be our new columns insertion point
        for (i = 0; i < length; i++) {
            item = items[i];
            if (item.group == group) {
                ret.found = true;
                ret.index = i;
                ret.item = item;
            } else if (item.innerItems) {
                ret = this.getColumnForGroup(item.innerItems, group);
            }
            if (ret.found) {
                break;
            }
        }
        return ret;
    },
    /**
     * @private
     *
     */
    onMatrixClearData: function() {
        var me = this;
        me.getStore().removeAll(true);
        if (!me.expandedItemsState) {
            me.lastColumnsState = null;
        }
        me.sortedColumn = null;
    },
    /**
     * @private
     *
     */
    onMatrixProcessStart: function() {
        if (this.enableLoadMask) {
            this.setMasked({
                xtype: 'loadmask',
                indicator: true
            });
        }
    },
    /**
     * @private
     *
     */
    onMatrixProcessProgress: function(matrix, index, length) {
        var percent = ((index || 0.1) * 100) / (length || 0.1);
        if (this.enableLoadMask) {
            this.getMasked().setMessage(Ext.util.Format.number(percent, '0') + '%');
        }
    },
    /**
     * @private
     *
     */
    onMatrixBeforeUpdate: function() {
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
    onMatrixAfterUpdate: function() {
        var store = this.getStore();
        store.resumeEvents();
        store.fireEvent('pivotstoreremodel');
    },
    /**
     * @private
     *
     */
    onMatrixDataReady: function() {
        var me = this,
            matrix = me.getMatrix(),
            cols = matrix.getColumnHeaders(),
            stateApplied = false;
        if (me.enableLoadMask) {
            me.setMasked(false);
        }
        if (me.expandedItemsState) {
            matrix.leftAxis.items.each(function(item) {
                if (Ext.Array.indexOf(me.expandedItemsState['rows'], item.key) >= 0) {
                    item.expanded = true;
                    stateApplied = true;
                }
            });
            matrix.topAxis.items.each(function(item) {
                if (Ext.Array.indexOf(me.expandedItemsState['cols'], item.key) >= 0) {
                    item.expanded = true;
                    stateApplied = true;
                }
            });
            if (stateApplied) {
                cols = matrix.getColumnHeaders();
                delete me.expandedItemsState;
            }
        } else {
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
        if (!Ext.isEmpty(me.sortedColumn)) {
            matrix.leftAxis.sortTreeByField(me.sortedColumn.dataIndex, me.sortedColumn.direction);
        }
        me.getStore().fireEvent('pivotstoreremodel', me);
        if (!Ext.isEmpty(me.sortedColumn)) {
            me.updateColumnSortState(me.sortedColumn.dataIndex, me.sortedColumn.direction);
        }
        me.lastColumnSorted = null;
    },
    onMatrixGroupExpandCollapse: function(matrix, type, item) {
        if (type == 'col') {
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
    getVisiblePivotColumns: function(columns, group) {
        var ret = [],
            len = columns.length,
            i, column;
        for (i = 0; i < len; i++) {
            column = columns[i];
            if (column.group == group) {
                ret.push(column);
            }
            if (column.columns) {
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
    prepareVisiblePivotColumns: function(columns) {
        var len = columns.length,
            ret = [],
            i, column, valid;
        for (i = 0; i < len; i++) {
            column = columns[i];
            if (!column.hidden) {
                ret.push(column);
            }
            if (column.columns) {
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
    preparePivotColumns: function(columns) {
        var me = this,
            defaultColConfig = {
                menuDisabled: true,
                sortable: false,
                lockable: false
            },
            colCount = columns.length,
            i, column;
        for (i = 0; i < colCount; i++) {
            column = columns[i];
            column.cls = column.cls || '';
            Ext.apply(column, defaultColConfig);
            if (column.leftAxis) {
                Ext.apply(column, {
                    cell: Ext.clone(me.getLeftAxisCellConfig())
                });
            } else if (column.topAxis) {
                Ext.apply(column, {
                    cell: Ext.clone(me.getTopAxisCellConfig())
                });
            }
            if (column.subTotal) {
                column.cls = column.userCls = me.clsGroupTotal;
            }
            if (column.group && column.xgrouped) {
                if (column.group.expanded) {
                    if (!column.subTotal) {
                        column.cls += (Ext.isEmpty(column.cls) ? '' : ' ') + me.groupHeaderCollapsibleCls;
                    }
                } else {
                    if (column.subTotal) {
                        column.cls += (Ext.isEmpty(column.cls) ? '' : ' ') + me.groupHeaderCollapsibleCls + ' ' + me.groupHeaderCollapsedCls;
                    }
                }
                if (column.subTotal) {
                    column.text = column.group.expanded ? column.group.getTextTotal() : Ext.String.format('<span class="' + this.groupCls + '">{0}</span>', column.group.name);
                } else if (column.group) {
                    column.text = Ext.String.format('<span class="' + this.groupCls + '">{0}</span>', column.group.name);
                }
                column.xexpandable = column.subTotal ? !column.group.expanded : column.group.expanded;
                if ((!column.group.expanded && !column.subTotal) || (column.group.expanded && column.subTotal && this.getMatrix().colSubTotalsPosition == 'none')) {
                    me.prepareHiddenColumns(column);
                }
            }
            if (column.grandTotal) {
                column.cls = column.userCls = me.clsGrandTotal;
            }
            if (Ext.isEmpty(column.columns)) {
                if (column.dimension) {
                    Ext.apply(column, {
                        renderer: column.dimension ? column.dimension.getRenderer() : false,
                        formatter: column.dimension ? column.dimension.getFormatter() : false,
                        scope: column.dimension ? column.dimension.scope : null,
                        align: column.dimension.align
                    });
                    if (column.dimension.flex > 0) {
                        column.flex = column.flex || column.dimension.flex;
                    } else {
                        column.width = column.width || column.dimension.width;
                    }
                    column.cell = Ext.merge(column.cell, column.dimension.cellConfig);
                }
                if (column.cell && column.cell.bind && !column.cell.viewModel) {
                    column.cell.bind = me.processBindKey(column.cell.bind, column.dataIndex);
                }
            } else {
                column.xtype = 'gridheadergroup';
                me.preparePivotColumns(column.columns);
            }
        }
    },
    processBindKey: function(value, dataIndex) {
        var keys, key, length, i, v;
        if (Ext.isString(value)) {
            v = value.replace('{column', '{columns.' + dataIndex);
            return v.replace('{value', '{record.' + dataIndex);
        } else if (Ext.isObject(value)) {
            keys = Ext.Object.getAllKeys(value);
        } else if (Ext.isArray(value)) {
            keys = value;
        }
        if (keys) {
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
    prepareHiddenColumns: function(column) {
        var i, len;
        column.hidden = true;
        if (!column.columns) {
            return;
        }
        len = column.columns.length;
        for (i = 0; i < len; i++) {
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
    reconfigurePivot: function(config) {
        var me = this,
            props = Ext.clone(me.getStateProperties()),
            i;
        props.push('startRowGroupsCollapsed', 'startColGroupsCollapsed', 'showZeroAsBlank');
        config = config || {};
        for (i = 0; i < props.length; i++) {
            if (!config.hasOwnProperty(props[i])) {
                if (me[props[i]]) {
                    config[props[i]] = me[props[i]];
                }
            } else {
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
    doExpandCollapseTree: function(tree, expanded) {
        var i;
        for (i = 0; i < tree.length; i++) {
            tree[i].expanded = expanded;
            if (tree[i].children) {
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
    doExpandCollapse: function(type, groupId, state, includeChildren) {
        var matrix = this.getMatrix(),
            item;
        if (!matrix) {
            // nothing to do
            return;
        }
        item = (type == 'row' ? matrix.leftAxis : matrix.topAxis)['findTreeElement']('key', groupId);
        if (!item) {
            return;
        }
        item = item.node;
        state = Ext.isDefined(state) ? state : !item.expanded;
        if (state) {
            item.expand(includeChildren);
        } else {
            item.collapse(includeChildren);
        }
    },
    /**
     * Expand the specified left axis item
     *
     * @param {String} leftAxisItemKey Key of the left axis item
     * @param {Boolean} includeChildren Expand the entire children tree below this item
     */
    expandRow: function(leftAxisItemKey, includeChildren) {
        this.doExpandCollapse('row', leftAxisItemKey, true, includeChildren);
    },
    /**
     * Collapse the specified left axis item
     *
     * @param {String} leftAxisItemKey Key of the left axis item
     * @param {Boolean} includeChildren Collapse the entire children tree below this item
     */
    collapseRow: function(leftAxisItemKey, includeChildren) {
        this.doExpandCollapse('row', leftAxisItemKey, false, includeChildren);
    },
    /**
     * Expand the specified top axis item
     *
     * @param {String} topAxisItemKey Key of the top axis item
     * @param {Boolean} includeChildren Expand the entire children tree below this item
     */
    expandCol: function(topAxisItemKey, includeChildren) {
        this.doExpandCollapse('col', topAxisItemKey, true, includeChildren);
    },
    /**
     * Collapse the specified top axis item
     *
     * @param {String} topAxisItemKey Key of the top axis item
     * @param {Boolean} includeChildren Collapse the entire children tree below this item
     */
    collapseCol: function(topAxisItemKey, includeChildren) {
        this.doExpandCollapse('col', topAxisItemKey, false, includeChildren);
    },
    /**
     * Expand all groups.
     *
     */
    expandAll: function() {
        this.expandAllColumns();
        this.expandAllRows();
    },
    /**
     * Expand all row groups
     *
     */
    expandAllRows: function() {
        this.getMatrix().leftAxis.expandAll();
    },
    /**
     * Expand all column groups
     *
     */
    expandAllColumns: function() {
        this.getMatrix().topAxis.expandAll();
    },
    /**
     * Collapse all groups.
     *
     */
    collapseAll: function() {
        this.collapseAllRows();
        this.collapseAllColumns();
    },
    /**
     * Collapse all row groups
     *
     */
    collapseAllRows: function() {
        this.getMatrix().leftAxis.collapseAll();
    },
    /**
     * Collapse all column groups
     *
     */
    collapseAllColumns: function() {
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
    getTopAxisKey: function(column) {
        var me = this,
            matrix = me.getMatrix(),
            columns = matrix.getColumns(),
            key = null,
            i;
        if (!column) {
            return null;
        }
        for (i = 0; i < columns.length; i++) {
            if (columns[i].name === column.getDataIndex()) {
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
    getTopAxisItem: function(column) {
        return this.getMatrix().topAxis.items.getByKey(this.getTopAxisKey(column));
    },
    /**
     * Returns the left axis item used to generate the specified record.
     *
     * @param record {Ext.data.Model}
     */
    getLeftAxisItem: function(record) {
        var info;
        if (!record) {
            return null;
        }
        info = this.pivotDataSource.storeInfo[record.internalId];
        return info ? this.getMatrix().leftAxis.items.getByKey(info.leftKey) : null;
    },
    getStateProperties: function() {
        return [
            'viewLayoutType',
            'rowSubTotalsPosition',
            'rowGrandTotalsPosition',
            'colSubTotalsPosition',
            'colGrandTotalsPosition',
            'aggregate',
            'leftAxis',
            'topAxis',
            'enableColumnSort',
            'sortedColumn'
        ];
    },
    /**
     * @private
     */
    getPivotColumnsState: function() {
        var me = this,
            i, cols;
        if (!me.lastColumnsState) {
            cols = me.getDataIndexColumns(me.getMatrix().getColumnHeaders());
            me.lastColumnsState = {};
            for (i = 0; i < cols.length; i++) {
                if (cols[i].dataIndex) {
                    me.lastColumnsState[cols[i].dataIndex] = {
                        width: cols[i].width,
                        flex: cols[i].flex || 0
                    };
                }
            }
        }
        cols = me.getColumns();
        for (i = 0; i < cols.length; i++) {
            if (cols[i].dataIndex) {
                me.lastColumnsState[cols[i].dataIndex] = {
                    width: cols[i].rendered ? cols[i].getWidth() : cols[i].width,
                    flex: cols[i].flex || 0
                };
            }
        }
        return me.lastColumnsState;
    },
    /**
     * @private
     */
    getDataIndexColumns: function(columns) {
        var cols = [],
            i;
        for (i = 0; i < columns.length; i++) {
            if (columns[i].dataIndex) {
                cols.push(columns[i].dataIndex);
            } else if (Ext.isArray(columns[i].columns)) {
                cols = Ext.Array.merge(cols, this.getDataIndexColumns(columns[i].columns));
            }
        }
        return cols;
    },
    /**
     * @private
     */
    restorePivotColumnsState: function(columns) {
        this.parsePivotColumnsState(this.getPivotColumnsState(), columns);
    },
    parsePivotColumnsState: function(state, columns) {
        var item, i;
        if (!columns) {
            return;
        }
        for (i = 0; i < columns.length; i++) {
            item = state[columns[i].dataIndex];
            if (item) {
                if (item.flex) {
                    columns[i].flex = item.flex;
                } else if (item.width) {
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
    handleRowEvent: function(type, e) {
        var cell = Ext.fly(e.getTarget(this.cellSelector));
        if (cell) {
            return cell.component.handleEvent(type, e);
        }
    },
    handleColumnTap: function(header, column) {
        var me = this,
            sortDirection, newDirection;
        if (column.xexpandable) {
            this.handleHeaderGroupTap(header, column);
            return;
        }
        if (!me.enableColumnSort) {
            return;
        }
        sortDirection = column.getSortDirection() || 'DESC';
        newDirection = (sortDirection === 'DESC') ? 'ASC' : 'DESC';
        if ((column.leftAxis || column.topAxis) && !Ext.isEmpty(column.getDataIndex())) {
            // sort the results when a dataIndex column was clicked
            if (me.getMatrix().leftAxis.sortTreeByField(column.getDataIndex(), newDirection)) {
                me.refreshView();
                me.updateSortIndicator(column, newDirection);
            }
        }
        return false;
    },
    updateSortIndicator: function(column, direction) {
        // for now we handle just one column sorting
        // TODO all left axis dimensions could be sorted and should be shown like this in the grid
        var last = this.lastColumnSorted;
        if (last) {
            // the function is made available on the column via an override
            last.updateSortIndicator(null);
        }
        column.updateSortIndicator(direction);
        this.lastColumnSorted = column;
    },
    handleHeaderGroupTap: function(header, column) {
        if (column.xexpandable) {
            this.doExpandCollapse('col', column.key);
        }
    },
    isRTL: function() {
        if (Ext.isFunction(this.isLocalRtl)) {
            return this.isLocalRtl();
        }
        return false;
    },
    getRecordInfo: function(record) {
        return record ? this.pivotDataSource.storeInfo[record.internalId] : null;
    }
});

/**
 * This class is used for creating a configurator field component.
 *
 * @private
 */
Ext.define('Ext.pivot.plugin.configurator.Column', {
    extend: 'Ext.dataview.component.ListItem',
    requires: [
        'Ext.pivot.plugin.configurator.Field'
    ],
    alias: 'widget.pivotconfigfield',
    userCls: Ext.baseCSSPrefix + 'pivot-grid-config-column',
    filteredCls: Ext.baseCSSPrefix + 'pivot-grid-config-column-filter',
    ascSortIconCls: Ext.baseCSSPrefix + 'pivot-grid-config-column-btn-sort-asc',
    descSortIconCls: Ext.baseCSSPrefix + 'pivot-grid-config-column-btn-sort-desc',
    config: {
        deleteCmp: {
            xtype: 'component',
            baseCls: Ext.baseCSSPrefix + 'pivot-grid-config-column-btn',
            cls: Ext.baseCSSPrefix + 'pivot-grid-config-column-btn-delete',
            docked: 'right',
            hidden: true
        },
        moveCmp: {
            xtype: 'component',
            baseCls: Ext.baseCSSPrefix + 'pivot-grid-config-column-btn',
            cls: Ext.baseCSSPrefix + 'pivot-grid-config-column-btn-move',
            docked: 'left'
        },
        sortCmp: {
            xtype: 'component',
            baseCls: Ext.baseCSSPrefix + 'pivot-grid-config-column-btn',
            docked: 'right',
            hidden: true
        }
    },
    applyDeleteCmp: function(cmp) {
        if (cmp && !cmp.isComponent) {
            cmp = Ext.factory(cmp, Ext.Component, this.getDeleteCmp());
        }
        return cmp;
    },
    updateDeleteCmp: function(cmp, oldCmp) {
        if (cmp) {
            this.add(cmp);
        }
        Ext.destroy(oldCmp);
    },
    applyMoveCmp: function(cmp) {
        if (cmp && !cmp.isComponent) {
            cmp = Ext.factory(cmp, Ext.Component, this.getMoveCmp());
        }
        return cmp;
    },
    updateMoveCmp: function(cmp, oldCmp) {
        if (cmp) {
            this.add(cmp);
        }
        Ext.destroy(oldCmp);
    },
    applySortCmp: function(cmp) {
        if (cmp && !cmp.isComponent) {
            cmp = Ext.factory(cmp, Ext.Component, this.getSortCmp());
        }
        return cmp;
    },
    updateSortCmp: function(cmp, oldCmp) {
        if (cmp) {
            this.add(cmp);
        }
        Ext.destroy(oldCmp);
    },
    getField: function() {
        return this.getRecord().get('field');
    },
    updateRecord: function(record, oldRecord) {
        var me = this,
            body = me.getBody(),
            settings;
        this.callParent([
            record,
            oldRecord
        ]);
        if (!record) {
            return;
        }
        if (oldRecord) {
            settings = oldRecord.get('field').getSettings();
            me.resetStyle(body, settings.getStyle());
            me.removeCls(settings.getCls());
        }
        settings = record.get('field').getSettings();
        // The custom settings style we add to the text component.
        // All button icons are in fact fonts so changing the font style in the list item
        // would affect all buttons not only the text component
        body.setStyle(settings.getStyle());
        // The custom settings cls we add to the entire component
        // With classes you can control better what components to change
        me.addCls(settings.getCls());
        me.refreshData();
    },
    refreshData: function() {
        var me = this,
            dCmp = me.getDeleteCmp(),
            record = me.getRecord(),
            field = record.get('field'),
            settings = field.getSettings(),
            dataView = me.dataview || me.getDataview(),
            fieldType = dataView.getFieldType(),
            isFixed;
        if (fieldType !== 'all') {
            isFixed = settings.isFixed(dataView);
            dCmp.setHidden(isFixed);
        }
        record.set('text', field.getFieldText());
        me.updateSortCmpCls();
        me.updateFilterCls();
    },
    updateFilterCls: function() {
        var me = this,
            dataView = me.dataview || me.getDataview(),
            fieldType = dataView.getFieldType();
        if (fieldType !== 'all') {
            if (me.getField().getFilter()) {
                me.addCls(me.filteredCls);
            } else {
                me.removeCls(me.filteredCls);
            }
        }
    },
    updateSortCmpCls: function() {
        var me = this,
            dataView = me.dataview || me.getDataview(),
            fieldType = dataView.getFieldType(),
            field = me.getField(),
            sCmp = me.getSortCmp();
        if (fieldType === 'leftAxis' || fieldType === 'topAxis') {
            sCmp.show();
            sCmp.setUserCls('');
            if (field.getSortable()) {
                if (field.getDirection() === 'ASC') {
                    sCmp.setUserCls(me.ascSortIconCls);
                } else {
                    sCmp.setUserCls(me.descSortIconCls);
                }
            }
        } else {
            sCmp.hide();
        }
    },
    resetStyle: function(cmp, oldStyle) {
        var style = {},
            keys = Ext.Object.getAllKeys(oldStyle),
            len = keys.length,
            i;
        for (i = 0; i < len; i++) {
            style[keys[i]] = null;
        }
        cmp.setStyle(style);
    },
    onApplyFilterSettings: function(win, filter) {
        this.getField().setFilter(filter);
        this.updateFilterCls();
        this.applyChanges();
    },
    onRemoveFilter: function() {
        this.getField().setFilter(null);
        this.updateFilterCls();
        this.applyChanges();
    },
    /**
     * This is used for firing the 'configchange' event
     *
     */
    applyChanges: function() {
        var dataView = this.dataview || this.getDataView();
        if (dataView) {
            dataView.applyChanges();
        }
    }
});

/**
 * @private
 */
Ext.define('Ext.pivot.plugin.configurator.DragZone', {
    extend: 'Ext.drag.Source',
    requires: [
        'Ext.drag.proxy.Placeholder'
    ],
    groups: 'pivotfields',
    proxy: {
        type: 'placeholder',
        cursorOffset: [
            -20,
            30
        ],
        placeholderCls: Ext.baseCSSPrefix + 'pivot-drag-proxy-placeholder',
        validCls: Ext.baseCSSPrefix + 'pivot-drag-proxy-placeholder-valid',
        invalidCls: Ext.baseCSSPrefix + 'pivot-drag-proxy-placeholder-invalid'
    },
    handle: '.' + Ext.baseCSSPrefix + 'list-item',
    constructor: function(list) {
        this.list = list;
        this.callParent([
            {
                element: list.getScrollable().getElement()
            }
        ]);
    },
    onDragStart: function(info) {
        var item = Ext.fly(info.eventTarget).up(this.getHandle()),
            html = '<span class="x-pivot-drag-placeholder-icon">&nbsp;</span><span>{0}</span>',
            record;
        if (!item || !item.component) {
            return;
        }
        record = item.component.getRecord();
        info.setData('record', record);
        info.setData('sourceList', this.list);
        this.getProxy().setHtml(Ext.String.format(html, record.get('text')));
    }
});

/**
 * @private
 */
Ext.define('Ext.pivot.plugin.configurator.DropZone', {
    extend: 'Ext.drag.Target',
    groups: 'pivotfields',
    leftIndicatorCls: Ext.baseCSSPrefix + 'pivot-grid-left-indicator',
    rightIndicatorCls: Ext.baseCSSPrefix + 'pivot-grid-right-indicator',
    listItemSelector: '.' + Ext.baseCSSPrefix + 'list-item',
    listSelector: '.' + Ext.baseCSSPrefix + 'list',
    constructor: function(list) {
        this.list = list;
        this.callParent([
            {
                element: list.getScrollable().getElement()
            }
        ]);
    },
    getLeftIndicator: function() {
        if (!this.leftIndicator) {
            this.self.prototype.leftIndicator = Ext.getBody().createChild({
                cls: this.leftIndicatorCls,
                html: "&#160;"
            });
            this.self.prototype.indicatorWidth = this.leftIndicator.dom.offsetWidth;
            this.self.prototype.indicatorOffset = Math.round(this.indicatorWidth / 2);
        }
        return this.leftIndicator;
    },
    getRightIndicator: function() {
        if (!this.rightIndicator) {
            this.self.prototype.rightIndicator = Ext.getBody().createChild({
                cls: this.rightIndicatorCls,
                html: "&#160;"
            });
        }
        return this.rightIndicator;
    },
    accepts: function(info) {
        var record = info.data.record;
        if (!record) {
            return true;
        }
        return record.get('field').getSettings().isAllowed(this.list);
    },
    onDragEnter: function(info) {
        info.setData('targetList', this.list);
    },
    onDragMove: function(info) {
        if (info.valid) {
            this.positionIndicator(info);
        } else {
            this.hideIndicators();
        }
    },
    onDragLeave: function(info) {
        info.setData('targetList', null);
        this.hideIndicators();
    },
    onDrop: function(info) {
        var data = info.data,
            panel = this.list.up('pivotconfigpanel');
        this.hideIndicators();
        if (!panel) {
            return;
        }
        panel.dragDropField(data.sourceList, data.targetList, data.record, data.position);
    },
    positionIndicator: function(info) {
        var me = this,
            pos = -1,
            leftIndicator = me.getLeftIndicator(),
            rightIndicator = me.getRightIndicator(),
            indWidth = me.indicatorWidth,
            indOffset = me.indicatorOffset,
            el, item, leftXY, rightXY, minX, maxX, minY, maxY, leftAnchor, rightAnchor;
        el = info.getCursorElement(me.listItemSelector);
        if (el) {
            item = el.component;
            leftAnchor = 'tl';
            rightAnchor = 'tr';
            pos = item.$dataIndex;
        } else {
            leftAnchor = 'bl';
            rightAnchor = 'br';
            pos = me.list.getViewItems().length;
            item = me.list.getItemAt(pos - 1);
            if (item) {
                el = item.element;
            } else {
                el = info.getCursorElement(me.listSelector);
            }
        }
        leftXY = leftIndicator.getAlignToXY(el, leftAnchor);
        rightXY = rightIndicator.getAlignToXY(el, rightAnchor);
        leftXY[0] -= 1;
        rightXY[0] -= indWidth;
        if (leftAnchor === 'tl') {
            leftXY[1] -= indWidth;
            rightXY[1] -= indWidth;
        }
        minX = minY = -indOffset;
        minX += el.getX();
        maxX = minX + el.getWidth();
        minY += el.getY();
        maxY = minY + el.getHeight();
        leftXY[0] = Ext.Number.constrain(leftXY[0], minX, maxX);
        rightXY[0] = Ext.Number.constrain(rightXY[0], minX, maxX);
        leftXY[1] = Ext.Number.constrain(leftXY[1], minY, maxY);
        rightXY[1] = Ext.Number.constrain(rightXY[1], minY, maxY);
        leftIndicator.show();
        rightIndicator.show();
        leftIndicator.setXY(leftXY);
        rightIndicator.setXY(rightXY);
        info.setData('position', pos);
    },
    hideIndicators: function() {
        this.getLeftIndicator().hide();
        this.getRightIndicator().hide();
    }
});

/**
 * This is a container that holds {Ext.pivot.plugin.configurator.Column fields}.
 *
 * @private
 */
Ext.define('Ext.pivot.plugin.configurator.Container', {
    extend: 'Ext.dataview.List',
    alias: 'widget.pivotconfigcontainer',
    requires: [
        'Ext.pivot.plugin.configurator.Column',
        'Ext.pivot.plugin.configurator.DragZone',
        'Ext.pivot.plugin.configurator.DropZone'
    ],
    handleSorting: false,
    handleFiltering: false,
    isConfiguratorContainer: true,
    useSimpleItems: false,
    disableSelection: true,
    defaultType: 'pivotconfigfield',
    deferEmptyText: false,
    touchAction: {
        panX: false,
        pinchZoom: false,
        doubleTapZoom: false
    },
    store: {
        type: 'array',
        fields: [
            {
                name: 'text',
                type: 'string'
            },
            {
                name: 'field',
                type: 'auto'
            }
        ]
    },
    items: [
        {
            docked: 'top',
            xtype: 'titlebar',
            titleAlign: 'left'
        }
    ],
    config: {
        /**
         * Possible values:
         *
         * - `all` = the container is the "all fields" area;
         * - `aggregate` = the container is the "values" area;
         * - `leftAxis` = the container is the "row values" area;
         * - `topAxis` = the container is the "column values" area;
         *
         * @private
         */
        fieldType: 'all',
        title: null
    },
    initialize: function() {
        var me = this;
        me.callParent();
        me.dragZone = new Ext.pivot.plugin.configurator.DragZone(me);
        me.dropZone = new Ext.pivot.plugin.configurator.DropZone(me);
        if (me.getFieldType() !== 'all') {
            me.container.element.on({
                delegate: '.' + Ext.baseCSSPrefix + 'pivot-grid-config-column-btn',
                tap: 'handleColumnBtnTap',
                scope: me
            });
            me.container.element.on({
                delegate: '.' + Ext.baseCSSPrefix + 'list-item-body',
                tap: 'handleColumnTap',
                scope: me
            });
        }
    },
    destroy: function() {
        Ext.destroyMembers(this, 'storeListeners', 'dragZone', 'dropZone');
        this.callParent();
    },
    updateTitle: function(title) {
        var titleBar = this.down('titlebar');
        if (titleBar) {
            titleBar.setTitle(title);
        }
    },
    updateFieldType: function(type) {
        if (type !== 'all') {
            this.setUserCls(Ext.baseCSSPrefix + 'pivot-grid-config-container');
        }
    },
    updateStore: function(store) {
        var me = this;
        Ext.destroy(me.storeListeners);
        if (store) {
            me.storeListeners = store.on({
                datachanged: me.applyChanges,
                scope: me
            });
        }
    },
    /**
     * This is used for firing the 'configchange' event
     *
     */
    applyChanges: function() {
        if (this.getFieldType() !== 'all') {
            this.fireEvent('configchange', this);
        }
    },
    /**
     * This is used for adding a new config field to this container.
     *
     * @private
     */
    addField: function(config, pos) {
        var me = this,
            store = me.getStore(),
            fieldType = me.getFieldType(),
            cfg = {};
        config.isAggregate = (fieldType === 'aggregate');
        Ext.apply(cfg, {
            field: config,
            text: config.getFieldText()
        });
        if (pos >= 0) {
            store.insert(pos, cfg);
        } else {
            store.add(cfg);
        }
    },
    removeField: function(record) {
        this.getStore().remove(record);
        record.set('field', null);
    },
    moveField: function(record, pos) {
        var store = this.getStore(),
            index = store.indexOf(record);
        if (pos === -1 && index === store.getCount() - 1) {
            // nothing to do here;
            // the record is already on the last position in the store
            return;
        }
        store.remove(record);
        if (pos >= 0) {
            store.insert(pos, record);
        } else {
            store.add(record);
        }
    },
    handleColumnBtnTap: function(e) {
        var me = this,
            target = Ext.fly(e.currentTarget),
            item = target.up('.' + me.getBaseCls() + '-item').component,
            record = me.getStore().getAt(item.$dataIndex);
        if (!record) {
            return;
        }
        if (target.hasCls(Ext.baseCSSPrefix + 'pivot-grid-config-column-btn-delete')) {
            me.removeField(record);
            return;
        }
        if (target.hasCls(Ext.baseCSSPrefix + 'pivot-grid-config-column-btn-tools')) {
            me.fireEvent('toolsbtnpressed', me, item);
            return;
        }
    },
    handleColumnTap: function(e) {
        var me = this,
            target = Ext.fly(e.currentTarget),
            item = target.up('.' + me.getBaseCls() + '-item').component,
            record = me.getStore().getAt(item.$dataIndex);
        if (!record) {
            return;
        }
        me.fireEvent('toolsbtnpressed', me, item);
    }
});

/**
 * @private
 */
Ext.define('Ext.pivot.plugin.configurator.PanelController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.pivotconfigpanel',
    destroy: function() {
        var me = this;
        me.pivotListeners = Ext.destroy(me.pivotListeners);
        me.callParent();
    },
    closeMe: function() {
        var view = this.getView();
        view.fireEvent('close', view);
    },
    cancelConfiguration: function() {
        this.refreshDimensions();
        this.closeMe();
    },
    applyConfiguration: function() {
        this.applyChanges().then(function(controller) {
            controller.closeMe();
        });
    },
    backToMainView: function() {
        this.getView().setActiveItem('#main');
    },
    onPivotChanged: function(view, pivot) {
        var me = this;
        Ext.destroy(me.pivotListeners);
        if (pivot) {
            me.pivotListeners = pivot.on({
                pivotdone: me.onPivotDone,
                scope: me,
                destroyable: true
            });
        }
    },
    onFieldsChanged: function(view, fields) {
        if (!fields) {
            return;
        }
        this.refreshDimensions();
    },
    onBeforeApplyConfigFieldSettings: function(form, settings) {
        var view = this.getView();
        return view.getPivot().fireEvent('beforeapplyconfigfieldsettings', view, {
            container: form,
            settings: settings
        });
    },
    onApplyConfigFieldSettings: function(form, settings) {
        var view = this.getView();
        this.onConfigChanged();
        return view.getPivot().fireEvent('applyconfigfieldsettings', view, {
            container: form,
            settings: settings
        });
    },
    onConfigChanged: function() {
        this.configurationChanged = true;
    },
    showCard: function(container, item) {
        var view = this.getView(),
            pivot = view.getPivot(),
            settings = item.getField().getSettings(),
            form = view.down('#field'),
            dataAgg = [];
        if (pivot.fireEvent('beforeshowconfigfieldsettings', view, {
            container: form,
            settings: settings
        }) !== false) {
            view.setActiveItem(form);
            form.setFieldItem(item);
            this.getAggregateContainer().getStore().each(function(record) {
                var field = record.get('field');
                dataAgg.push([
                    field.getHeader(),
                    field.getId()
                ]);
            });
            form.getViewModel().getStore('sDimensions').loadData(dataAgg);
            pivot.fireEvent('showconfigfieldsettings', view, {
                container: form,
                settings: settings
            });
        }
    },
    refreshDimensions: function() {
        var me = this,
            view = me.getView(),
            pivot = view.getPivot(),
            matrix = pivot ? pivot.getMatrix() : null,
            fieldsTopCt, fieldsLeftCt, fieldsAggCt, fieldsAllCt, fieldsTop, fieldsLeft, fieldsAgg, fields;
        if (!matrix) {
            return;
        }
        me.internalReconfiguration = true;
        fieldsAllCt = me.getAllFieldsContainer();
        fieldsTopCt = me.getTopAxisContainer();
        fieldsLeftCt = me.getLeftAxisContainer();
        fieldsAggCt = me.getAggregateContainer();
        fieldsAllCt.getStore().removeAll();
        fieldsTopCt.getStore().removeAll();
        fieldsLeftCt.getStore().removeAll();
        fieldsAggCt.getStore().removeAll();
        fields = view.getFields().clone();
        fieldsTop = me.getConfigFields(matrix.topAxis.dimensions.getRange());
        fieldsLeft = me.getConfigFields(matrix.leftAxis.dimensions.getRange());
        fieldsAgg = me.getConfigFields(matrix.aggregate.getRange());
        // the "All fields" will always contain all available fields (both defined on the plugin and existing in the matrix configuration)
        me.addFieldsToConfigurator(fields.getRange(), fieldsAllCt);
        me.addFieldsToConfigurator(fieldsTop, fieldsTopCt);
        me.addFieldsToConfigurator(fieldsLeft, fieldsLeftCt);
        me.addFieldsToConfigurator(fieldsAgg, fieldsAggCt);
        me.internalReconfiguration = false;
    },
    /**
     * Listener for the 'pivotdone' event. Initialize configurator fields or restore last field focus.
     *
     * @private
     */
    onPivotDone: function() {
        if (this.internalReconfiguration) {
            this.internalReconfiguration = false;
        } else {
            this.refreshDimensions();
        }
    },
    /**
     * Collect configurator changes and reconfigure the pivot component
     *
     * @private
     */
    reconfigurePivot: function(resolve, reject) {
        var me = this,
            view = me.getView(),
            pivot = view.getPivot(),
            obj = {
                topAxis: me.getFieldsFromContainer(me.getTopAxisContainer(), true),
                leftAxis: me.getFieldsFromContainer(me.getLeftAxisContainer(), true),
                aggregate: me.getFieldsFromContainer(me.getAggregateContainer(), true)
            };
        me.internalReconfiguration = true;
        if (pivot.fireEvent('beforeconfigchange', view, obj) !== false) {
            pivot.getMatrix().reconfigure(obj);
            pivot.fireEvent('configchange', view, obj);
        }
        resolve(me);
    },
    /**
     * Returns the container that stores all unused fields.
     *
     * @returns {Ext.pivot.plugin.configurator.Container}
     */
    getAllFieldsContainer: function() {
        return this.lookupReference('fieldsCt');
    },
    /**
     * Returns the container that stores all fields configured on the left axis.
     *
     * @returns {Ext.pivot.plugin.configurator.Container}
     */
    getLeftAxisContainer: function() {
        return this.lookupReference('fieldsLeftCt');
    },
    /**
     * Returns the container that stores all fields configured on the top axis.
     *
     * @returns {Ext.pivot.plugin.configurator.Container}
     */
    getTopAxisContainer: function() {
        return this.lookupReference('fieldsTopCt');
    },
    /**
     * Returns the container that stores all fields configured on the aggregate.
     *
     * @returns {Ext.pivot.plugin.configurator.Container}
     */
    getAggregateContainer: function() {
        return this.lookupReference('fieldsAggCt');
    },
    /**
     * Apply configurator changes to the pivot component.
     *
     * This function will trigger the delayed task which is actually reconfiguring the pivot component
     * with the new configuration.
     *
     * @return {Ext.Promise}
     */
    applyChanges: function() {
        var me = this;
        return new Ext.Promise(function(resolve, reject) {
            var view = me.getView();
            if (me.configurationChanged) {
                me.configurationChanged = false;
                if (view.isHidden() || me.internalReconfiguration) {
                    // if the plugin is disabled don't do anything
                    reject(me);
                    return;
                }
                Ext.asap(me.reconfigurePivot, me, [
                    resolve,
                    reject
                ]);
            } else {
                resolve(me);
            }
        });
    },
    /**
     * This function is used to retrieve all configured fields in a fields container.
     *
     * @private
     */
    getFieldsFromContainer: function(ct, justConfigs) {
        var store = ct.getStore(),
            len = store.getCount(),
            fields = [],
            i, item;
        for (i = 0; i < len; i++) {
            item = store.getAt(i).get('field');
            fields.push(justConfigs === true ? item.serialize() : item);
        }
        return fields;
    },
    /**
     * Easy function for assigning fields to a container.
     *
     * @private
     */
    addFieldsToConfigurator: function(fields, fieldsCt) {
        var len = fields.length,
            i;
        fieldsCt.getStore().removeAll();
        for (i = 0; i < len; i++) {
            fieldsCt.addField(fields[i], -1);
        }
        fieldsCt.refresh();
    },
    /**
     * Build the fields array for each container by parsing all given fields or from the pivot config.
     *
     * @private
     */
    getConfigFields: function(items) {
        var len = items.length,
            fields = this.getView().getFields(),
            list = [],
            i, field;
        for (i = 0; i < len; i++) {
            field = fields.byDataIndex.get(items[i].dataIndex);
            if (field) {
                list.push(field);
            }
        }
        return list;
    }
});

/**
 * @private
 */
Ext.define('Ext.pivot.plugin.configurator.model.Select', {
    extend: 'Ext.data.Model',
    fields: [
        {
            name: 'text',
            type: 'string'
        },
        {
            name: 'value',
            type: 'auto'
        },
        {
            name: 'type',
            type: 'integer'
        }
    ]
});

/**
 * @private
 */
Ext.define('Ext.pivot.plugin.configurator.store.Select', {
    extend: 'Ext.data.ArrayStore',
    alias: 'store.pivotselect',
    model: 'Ext.pivot.plugin.configurator.model.Select'
});

/**
 * @private
 */
Ext.define('Ext.pivot.plugin.configurator.FormController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.pivotconfigform',
    init: function(view) {
        var viewModel = this.getViewModel();
        viewModel.getStore('sSorters').loadData([
            [
                view.sortClearText,
                'none'
            ],
            [
                view.sortAscText,
                'ASC'
            ],
            [
                view.sortDescText,
                'DESC'
            ]
        ]);
        viewModel.getStore('sFilters').loadData([
            [
                view.clearFilterText,
                'none'
            ],
            [
                view.labelFiltersText,
                'label'
            ],
            [
                view.valueFiltersText,
                'value'
            ],
            [
                view.top10FiltersText,
                'top10'
            ]
        ]);
        viewModel.getStore('sTopOrder').loadData([
            [
                view.topOrderTopText,
                'top'
            ],
            [
                view.topOrderBottomText,
                'bottom'
            ]
        ]);
        viewModel.getStore('sTopType').loadData([
            [
                view.topTypeItemsText,
                'items'
            ],
            [
                view.topTypePercentText,
                'percent'
            ],
            [
                view.topTypeSumText,
                'sum'
            ]
        ]);
        viewModel.getStore('sAlign').loadData([
            [
                view.alignLeftText,
                'left'
            ],
            [
                view.alignCenterText,
                'center'
            ],
            [
                view.alignRightText,
                'right'
            ]
        ]);
    },
    applySettings: function() {
        var vm = this.getViewModel(),
            view = this.getView(),
            fieldItem = view.getFieldItem(),
            field = fieldItem.getField(),
            cfg = Ext.clone(vm.get('form')),
            item, store, sort, filter;
        if (cfg.align && cfg.align.isModel) {
            cfg.align = cfg.align.get('value');
        }
        if (field.isAggregate) {
            if (cfg.formatter && cfg.formatter.isModel) {
                item = cfg.formatter;
            } else {
                store = vm.getStore('sFormatters');
                item = store.findRecord('value', cfg.formatter, 0, false, true, true);
            }
            if (item) {
                if (item.get('type') == 1) {
                    cfg.formatter = item.get('value');
                    cfg.renderer = null;
                } else {
                    cfg.renderer = item.get('value');
                    cfg.formatter = null;
                }
            }
            if (cfg.aggregator && cfg.aggregator.isModel) {
                cfg.aggregator = cfg.aggregator.get('value');
            }
        } else {
            sort = cfg.direction;
            if (sort && sort.isModel) {
                sort = sort.get('value');
            }
            cfg.sortable = (sort !== 'none');
            cfg.direction = sort || 'ASC';
            filter = cfg.filter;
            if (!filter || !filter.type || filter.type.get('value') === 'none') {
                filter = null;
            } else {
                filter.type = filter.type.get('value');
                if (filter.operator && filter.operator.isModel) {
                    filter.operator = filter.operator.get('value');
                }
                if (filter.dimensionId && filter.dimensionId.isModel) {
                    filter.dimensionId = filter.dimensionId.get('value');
                }
                if (filter.topType && filter.topType.isModel) {
                    filter.topType = filter.topType.get('value');
                }
                if (filter.topOrder && filter.topOrder.isModel) {
                    filter.topOrder = filter.topOrder.get('value');
                }
                if (filter.type === 'top10') {
                    filter.type = 'value';
                    filter.operator = 'top10';
                }
                if (filter.operator === 'between' || filter.operator === 'not between') {
                    filter.value = [
                        filter.from,
                        filter.to
                    ];
                }
                delete (filter.from);
                delete (filter.to);
                if (filter.type === 'label') {
                    delete (filter.dimensionId);
                    delete (filter.topSort);
                    delete (filter.topType);
                    delete (filter.topOrder);
                }
            }
            cfg.filter = filter;
        }
        if (view.fireEvent('beforeapplyconfigfieldsettings', view, cfg) !== false) {
            field.setConfig(cfg);
            fieldItem.refreshData();
            view.fireEvent('applyconfigfieldsettings', view, cfg);
            this.cancelSettings();
        }
    },
    cancelSettings: function() {
        var view = this.getView();
        view.setFieldItem(null);
        view.fireEvent('close', view);
    },
    onFieldItemChanged: function(view, fieldItem) {
        var viewModel = this.getViewModel(),
            form = {},
            dataFormatters = [],
            dataAggregators = [],
            field, settings, formatters, renderers, fns, length, i, list, data, filter;
        if (!fieldItem) {
            viewModel.set('form', form);
            return;
        }
        field = fieldItem.getField();
        data = field.getConfig();
        Ext.apply(form, {
            dataIndex: data.dataIndex,
            header: data.header
        });
        if (field.isAggregate) {
            settings = field.getSettings();
            formatters = settings.getFormatters();
            renderers = settings.getRenderers();
            fns = settings.getAggregators();
            length = fns.length;
            for (i = 0; i < length; i++) {
                dataAggregators.push([
                    field.getAggText(fns[i]),
                    fns[i]
                ]);
            }
            list = Ext.Object.getAllKeys(formatters || {});
            length = list.length;
            for (i = 0; i < length; i++) {
                dataFormatters.push([
                    list[i],
                    formatters[list[i]],
                    1
                ]);
            }
            list = Ext.Object.getAllKeys(renderers || {});
            length = list.length;
            for (i = 0; i < length; i++) {
                dataFormatters.push([
                    list[i],
                    renderers[list[i]],
                    2
                ]);
            }
            viewModel.getStore('sFormatters').loadData(dataFormatters);
            viewModel.getStore('sAggregators').loadData(dataAggregators);
            Ext.apply(form, {
                formatter: data.formatter || data.renderer,
                aggregator: data.aggregator,
                align: data.align
            });
        } else {
            filter = data.filter;
            Ext.apply(form, {
                direction: (data.sortable ? data.direction : 'none'),
                filter: {
                    type: (filter ? (filter.type === 'value' && filter.operator === 'top10' ? 'top10' : filter.type) : 'none'),
                    operator: (filter ? (filter.type === 'value' && filter.operator === 'top10' ? 'top10' : filter.operator) : null),
                    value: (filter ? filter.value : null),
                    from: (filter ? (Ext.isArray(filter.value) ? filter.value[0] : null) : null),
                    to: (filter ? (Ext.isArray(filter.value) ? filter.value[1] : null) : null),
                    caseSensitive: (filter ? filter.caseSensitive : false),
                    topSort: (filter ? filter.topSort : false),
                    topOrder: (filter ? filter.topOrder : false),
                    topType: (filter ? filter.topType : false),
                    dimensionId: (filter ? filter.dimensionId : null)
                }
            });
        }
        viewModel.set('form', form);
    },
    prepareOperators: function(type) {
        var me = this.getView(),
            viewModel = this.getViewModel(),
            data;
        data = [
            [
                me.equalsLText,
                '='
            ],
            [
                me.doesNotEqualLText,
                '!='
            ],
            [
                me.greaterThanLText,
                '>'
            ],
            [
                me.greaterThanOrEqualToLText,
                '>='
            ],
            [
                me.lessThanLText,
                '<'
            ],
            [
                me.lessThanOrEqualToLText,
                '<='
            ],
            [
                me.betweenLText,
                'between'
            ],
            [
                me.notBetweenLText,
                'not between'
            ]
        ];
        if (type === 'label') {
            Ext.Array.insert(data, 3, [
                [
                    me.beginsWithLText,
                    'begins'
                ],
                [
                    me.doesNotBeginWithLText,
                    'not begins'
                ],
                [
                    me.endsWithLText,
                    'ends'
                ],
                [
                    me.doesNotEndWithLText,
                    'not ends'
                ],
                [
                    me.containsLText,
                    'contains'
                ],
                [
                    me.doesNotContainLText,
                    'not contains'
                ]
            ]);
        }
        viewModel.getStore('sOperators').loadData(data);
    },
    onChangeFilterType: function(combo, record) {
        var me = this,
            view = me.getView(),
            filters = view.down('#commonFilters'),
            type = record && record.isModel ? record.get('value') : record;
        filters.setHidden(type === 'none' || type === 'top10');
        filters.setTitle(type === 'label' ? view.labelFilterText : view.valueFilterText);
        view.down('#top10Filters').setHidden(type !== 'top10');
        view.down('[role=dimensions]').setHidden((type !== 'value'));
        if (type === 'label' || type === 'value') {
            me.prepareOperators(type);
        }
    },
    onChangeFilterOperator: function(combo, record) {
        var op = record && record.isModel ? record.get('value') : record,
            view = this.getView(),
            between = (op === 'between' || op === 'not between');
        view.down('[role=operator]').setHidden(between);
        Ext.Array.each(view.query('[role=between]'), function(item) {
            item.setHidden(!between);
        });
    }
});

/**
 * @private
 */
Ext.define('Ext.pivot.plugin.configurator.Form', {
    extend: 'Ext.form.Panel',
    requires: [
        'Ext.pivot.plugin.configurator.store.Select',
        'Ext.pivot.plugin.configurator.FormController',
        'Ext.form.FieldSet',
        'Ext.field.Toggle',
        'Ext.field.Select',
        'Ext.field.Radio',
        'Ext.field.Text',
        'Ext.field.Hidden',
        'Ext.layout.VBox',
        'Ext.layout.HBox',
        'Ext.TitleBar'
    ],
    xtype: 'pivotconfigform',
    controller: 'pivotconfigform',
    viewModel: {
        stores: {
            sFormatters: {
                type: 'pivotselect'
            },
            sAggregators: {
                type: 'pivotselect'
            },
            sSorters: {
                type: 'pivotselect'
            },
            sFilters: {
                type: 'pivotselect'
            },
            sOperators: {
                type: 'pivotselect'
            },
            sTopOrder: {
                type: 'pivotselect'
            },
            sTopType: {
                type: 'pivotselect'
            },
            sDimensions: {
                type: 'pivotselect'
            },
            sAlign: {
                type: 'pivotselect'
            }
        }
    },
    eventedConfig: {
        fieldItem: null,
        title: null
    },
    listeners: {
        fielditemchange: 'onFieldItemChanged'
    },
    defaults: {
        labelAlign: 'top'
    },
    showAnimation: {
        type: 'slideIn',
        duration: 250,
        easing: 'ease-out',
        direction: 'left'
    },
    /**
     * @cfg
     * @inheritdoc
     */
    hideAnimation: {
        type: 'slideOut',
        duration: 250,
        easing: 'ease-in',
        direction: 'right'
    },
    okText: 'Ok',
    cancelText: 'Cancel',
    formatText: 'Format as',
    summarizeByText: 'Summarize by',
    customNameText: 'Custom name',
    sourceNameText: 'The source name for this field is "{form.dataIndex}"',
    sortText: 'Sort',
    filterText: 'Filter',
    sortResultsText: 'Sort results',
    alignText: 'Align',
    alignLeftText: 'Left',
    alignCenterText: 'Center',
    alignRightText: 'Right',
    caseSensitiveText: 'Case sensitive',
    valueText: 'Value',
    fromText: 'From',
    toText: 'To',
    labelFilterText: 'Show items for which the label',
    valueFilterText: 'Show items for which',
    top10FilterText: 'Show',
    sortAscText: 'Sort A to Z',
    sortDescText: 'Sort Z to A',
    sortClearText: 'Disable sorting',
    clearFilterText: 'Disable filtering',
    labelFiltersText: 'Label filters',
    valueFiltersText: 'Value filters',
    top10FiltersText: 'Top 10 filters',
    equalsLText: 'equals',
    doesNotEqualLText: 'does not equal',
    beginsWithLText: 'begins with',
    doesNotBeginWithLText: 'does not begin with',
    endsWithLText: 'ends with',
    doesNotEndWithLText: 'does not end with',
    containsLText: 'contains',
    doesNotContainLText: 'does not contain',
    greaterThanLText: 'is greater than',
    greaterThanOrEqualToLText: 'is greater than or equal to',
    lessThanLText: 'is less than',
    lessThanOrEqualToLText: 'is less than or equal to',
    betweenLText: 'is between',
    notBetweenLText: 'is not between',
    topOrderTopText: 'Top',
    topOrderBottomText: 'Bottom',
    topTypeItemsText: 'Items',
    topTypePercentText: 'Percent',
    topTypeSumText: 'Sum',
    updateFieldItem: function(item) {
        var me = this,
            items, field;
        me.removeAll(true, true);
        if (!item) {
            return;
        }
        field = item.getField();
        items = [
            {
                xtype: 'titlebar',
                docked: 'top',
                bind: {
                    title: '{form.header}'
                },
                items: [
                    {
                        text: me.cancelText,
                        align: 'left',
                        ui: 'back',
                        handler: 'cancelSettings'
                    },
                    {
                        text: me.okText,
                        align: 'right',
                        ui: 'action',
                        handler: 'applySettings'
                    }
                ]
            },
            {
                xtype: 'fieldset',
                margin: 0,
                bind: {
                    instructions: me.sourceNameText
                },
                items: [
                    {
                        label: me.customNameText,
                        labelAlign: 'top',
                        xtype: 'textfield',
                        bind: '{form.header}'
                    }
                ]
            }
        ];
        if (field.isAggregate) {
            items.push({
                label: me.alignText,
                xtype: 'selectfield',
                autoSelect: false,
                useClearIcon: true,
                bind: {
                    store: '{sAlign}',
                    value: '{form.align}'
                }
            }, {
                label: me.formatText,
                xtype: 'selectfield',
                autoSelect: false,
                useClearIcon: true,
                bind: {
                    store: '{sFormatters}',
                    value: '{form.formatter}'
                }
            }, {
                label: me.summarizeByText,
                xtype: 'selectfield',
                autoSelect: false,
                useClearIcon: true,
                bind: {
                    store: '{sAggregators}',
                    value: '{form.aggregator}'
                }
            });
        } else {
            items.push({
                label: me.sortText,
                labelAlign: 'top',
                xtype: 'selectfield',
                autoSelect: false,
                useClearIcon: true,
                bind: {
                    store: '{sSorters}',
                    value: '{form.direction}'
                }
            }, {
                label: me.filterText,
                labelAlign: 'top',
                xtype: 'selectfield',
                autoSelect: false,
                useClearIcon: true,
                bind: {
                    store: '{sFilters}',
                    value: '{form.filter.type}'
                },
                listeners: {
                    change: 'onChangeFilterType'
                }
            }, {
                itemId: 'commonFilters',
                xtype: 'fieldset',
                margin: 0,
                hidden: true,
                title: me.labelFilterText,
                defaults: {
                    labelAlign: 'top'
                },
                items: [
                    {
                        role: 'dimensions',
                        xtype: 'selectfield',
                        autoSelect: false,
                        bind: {
                            store: '{sDimensions}',
                            value: '{form.filter.dimensionId}'
                        }
                    },
                    {
                        xtype: 'selectfield',
                        autoSelect: false,
                        bind: {
                            store: '{sOperators}',
                            value: '{form.filter.operator}'
                        },
                        listeners: {
                            change: 'onChangeFilterOperator'
                        }
                    },
                    {
                        role: 'operator',
                        xtype: 'textfield',
                        placeHolder: me.valueText,
                        bind: '{form.filter.value}'
                    },
                    {
                        role: 'between',
                        xtype: 'textfield',
                        placeHolder: me.fromText,
                        hidden: true,
                        bind: '{form.filter.from}'
                    },
                    {
                        role: 'between',
                        xtype: 'textfield',
                        placeHolder: me.toText,
                        hidden: true,
                        bind: '{form.filter.to}'
                    },
                    {
                        xtype: 'togglefield',
                        label: me.caseSensitiveText,
                        name: 'fCaseSensitive',
                        bind: '{form.filter.caseSensitive}'
                    }
                ]
            }, {
                itemId: 'top10Filters',
                xtype: 'fieldset',
                margin: 0,
                hidden: true,
                title: me.top10FilterText,
                defaults: {
                    labelAlign: 'top'
                },
                items: [
                    {
                        xtype: 'selectfield',
                        autoSelect: false,
                        bind: {
                            store: '{sTopOrder}',
                            value: '{form.filter.topOrder}'
                        }
                    },
                    {
                        xtype: 'textfield',
                        placeHolder: me.valueText,
                        bind: '{form.filter.value}'
                    },
                    {
                        xtype: 'selectfield',
                        autoSelect: false,
                        bind: {
                            store: '{sTopType}',
                            value: '{form.filter.topType}'
                        }
                    },
                    {
                        xtype: 'selectfield',
                        autoSelect: false,
                        bind: {
                            store: '{sDimensions}',
                            value: '{form.filter.dimensionId}'
                        }
                    },
                    {
                        xtype: 'togglefield',
                        label: me.sortResultsText,
                        bind: '{form.filter.topSort}'
                    }
                ]
            });
        }
        me.add(items);
    }
});

/**
 * This class implements the config panel. It is used internally by the configurator plugin.
 *
 * @private
 */
Ext.define('Ext.pivot.plugin.configurator.Panel', {
    extend: 'Ext.Container',
    requires: [
        'Ext.pivot.plugin.configurator.Container',
        'Ext.pivot.plugin.configurator.DragZone',
        'Ext.pivot.plugin.configurator.DropZone',
        'Ext.pivot.plugin.configurator.PanelController',
        'Ext.pivot.plugin.configurator.Form',
        'Ext.layout.HBox',
        'Ext.layout.VBox',
        'Ext.layout.Card',
        'Ext.TitleBar',
        'Ext.Promise'
    ],
    alias: 'widget.pivotconfigpanel',
    controller: 'pivotconfigpanel',
    cls: Ext.baseCSSPrefix + 'pivot-grid-config-panel',
    translatable: {
        translationMethod: 'csstransform'
    },
    panelTitle: 'Configuration',
    /**
     * @cfg {String} panelAllFieldsText Text displayed in the container reserved for all available fields
     * when docked to top or bottom.
     */
    panelAllFieldsText: 'Drop Unused Fields Here',
    /**
     * @cfg {String} panelAllFieldsTitle Text displayed in the container reserved for all available fields
     * when docked to left or right.
     */
    panelAllFieldsTitle: 'All fields',
    /**
     * @cfg {String} panelTopFieldsText Text displayed in the container reserved for all top axis fields
     * when docked to top or bottom.
     */
    panelTopFieldsText: 'Drop Column Fields Here',
    /**
     * @cfg {String} panelTopFieldsTitle Text displayed in the container reserved for all top axis fields
     * when docked to left or right.
     */
    panelTopFieldsTitle: 'Column labels',
    /**
     * @cfg {String} panelLeftFieldsText Text displayed in the container reserved for all left axis fields
     * when docked to top or bottom.
     */
    panelLeftFieldsText: 'Drop Row Fields Here',
    /**
     * @cfg {String} panelLeftFieldsTitle Text displayed in the container reserved for all left axis fields
     * when docked to left or right.
     */
    panelLeftFieldsTitle: 'Row labels',
    /**
     * @cfg {String} panelAggFieldsText Text displayed in the container reserved for all aggregate fields
     * when docked to top or bottom.
     */
    panelAggFieldsText: 'Drop Agg Fields Here',
    /**
     * @cfg {String} panelAggFieldsTitle Text displayed in the container reserved for all aggregate fields
     * when docked to left or right.
     */
    panelAggFieldsTitle: 'Values',
    cancelText: 'Cancel',
    okText: 'Done',
    eventedConfig: {
        pivot: null,
        fields: null
    },
    listeners: {
        pivotchange: 'onPivotChanged',
        fieldschange: 'onFieldsChanged'
    },
    layout: 'card',
    initialize: function() {
        this.setup();
        return this.callParent();
    },
    /**
     * This function either moves or copies the dragged field from one container to another.
     *
     * @param {Ext.pivot.plugin.configurator.Container/Ext.pivot.plugin.configurator.Column} toTarget
     * @param {Ext.data.Model} record
     * @param {String} pos Position: `after` or `before`
     *
     * @private
     */
    dragDropField: function(fromContainer, toContainer, record, newPos) {
        var me = this,
            pivot = me.getPivot(),
            field = record.get('field'),
            fromFieldType = fromContainer.getFieldType(),
            toFieldType = toContainer.getFieldType(),
            controller = me.getController(),
            topAxisCt = controller.getTopAxisContainer(),
            leftAxisCt = controller.getLeftAxisContainer(),
            item;
        if (pivot.fireEvent('beforemoveconfigfield', this, {
            fromContainer: fromContainer,
            toContainer: toContainer,
            field: field
        }) !== false) {
            if (fromContainer != toContainer) {
                /*
                 The "All fields" container contains all fields defined on the plugin (or on the store model)
                 + all fields defined on the matrix configuration (leftAxis, topAxis, aggregate).

                 There are more scenarios here:
                 1. fromContainer is "All fields" and toContainer is "Row labels"/"Column labels"
                 We check if there is already an instance of this field there
                 - if there is then don't copy it there
                 - if there is not then maybe is on the other axis in which case we move that instance
                 to the toContainer

                 2. fromContainer is "All fields" and toContainer is "Values"
                 Just make a copy of the field in toContainer

                 3. fromContainer is not "All fields" and toContainer is not "All fields"
                 Just move the field to toContainer

                 4. fromContainer is not "All fields" and toContainer is "All fields"
                 Just delete the field from fromContainer since it's already existing in "All fields"
                 */
                if (fromFieldType === 'all' && (toFieldType === 'leftAxis' || toFieldType === 'topAxis')) {
                    // scenario 1
                    item = me.findFieldInContainer(field, toContainer);
                    if (item) {
                        // we found an instance so don't do anything
                        return;
                    }
                    if (toFieldType == 'leftAxis') {
                        item = me.findFieldInContainer(field, topAxisCt);
                        if (item) {
                            // move the field from "Column labels" to "Row labels"
                            topAxisCt.removeField(item);
                            toContainer.addField(field, newPos);
                            return;
                        }
                    } else {
                        item = me.findFieldInContainer(field, leftAxisCt);
                        if (item) {
                            // move the field from "Row labels" to "Column labels"
                            leftAxisCt.removeField(item);
                            toContainer.addField(field, newPos);
                            return;
                        }
                    }
                    toContainer.addField(field.clone(), newPos, true);
                } else if (fromFieldType == 'all' && toFieldType == 'aggregate') {
                    // scenario 2
                    toContainer.addField(field.clone(), newPos, true);
                } else if (fromFieldType != 'all' && toFieldType != 'all') {
                    // scenario 3
                    fromContainer.removeField(record);
                    toContainer.addField(field, newPos);
                } else {
                    // scenario 4
                    fromContainer.removeField(record);
                }
            } else {
                toContainer.moveField(record, newPos);
            }
        }
    },
    /**
     *
     * @param {Ext.pivot.plugin.configurator.Field} field
     * @param {Ext.pivot.plugin.configurator.Container} container
     * @return {Ext.data.Model}
     *
     * @private
     */
    findFieldInContainer: function(field, container) {
        var store = container.getStore(),
            length = store.getCount(),
            i, item;
        for (i = 0; i < length; i++) {
            item = store.getAt(i);
            if (item.get('field').getDataIndex() == field.getDataIndex()) {
                return item;
            }
        }
    },
    setup: function() {
        var me = this,
            listeners = {
                configchange: 'onConfigChanged',
                toolsbtnpressed: 'showCard'
            };
        me.add([
            {
                itemId: 'main',
                xtype: 'container',
                layout: {
                    type: 'hbox',
                    align: 'stretch'
                },
                defaults: {
                    flex: 1
                },
                items: [
                    {
                        xtype: 'titlebar',
                        docked: 'top',
                        title: me.panelTitle,
                        items: [
                            {
                                text: me.cancelText,
                                align: 'left',
                                ui: 'back',
                                handler: 'cancelConfiguration'
                            },
                            {
                                text: me.okText,
                                align: 'right',
                                ui: 'action',
                                handler: 'applyConfiguration'
                            }
                        ]
                    },
                    {
                        reference: 'fieldsCt',
                        xtype: 'pivotconfigcontainer',
                        title: me.panelAllFieldsTitle,
                        emptyText: me.panelAllFieldsText,
                        fieldType: 'all',
                        listeners: listeners
                    },
                    {
                        xtype: 'container',
                        layout: {
                            type: 'vbox',
                            align: 'stretch'
                        },
                        defaults: {
                            xtype: 'pivotconfigcontainer',
                            flex: 1
                        },
                        items: [
                            {
                                reference: 'fieldsAggCt',
                                title: me.panelAggFieldsTitle,
                                emptyText: me.panelAggFieldsText,
                                fieldType: 'aggregate',
                                listeners: listeners
                            },
                            {
                                reference: 'fieldsLeftCt',
                                title: me.panelLeftFieldsTitle,
                                emptyText: me.panelLeftFieldsText,
                                fieldType: 'leftAxis',
                                listeners: listeners
                            },
                            {
                                reference: 'fieldsTopCt',
                                title: me.panelTopFieldsTitle,
                                emptyText: me.panelTopFieldsText,
                                fieldType: 'topAxis',
                                listeners: listeners
                            }
                        ]
                    }
                ]
            },
            {
                itemId: 'field',
                xtype: 'pivotconfigform',
                listeners: {
                    close: 'backToMainView',
                    beforeapplyconfigfieldsettings: 'onBeforeApplyConfigFieldSettings',
                    applyconfigfieldsettings: 'onApplyConfigFieldSettings'
                }
            }
        ]);
    }
});

/**
 * This plugin allows the end user to configure the pivot component.
 *
 * It adds the following methods to the pivot grid:
 * - showConfigurator: which when called will show the configurator panel
 * - hideConfigurator: which when called will hide the configurator panel
 *
 * The configurator panel will be shown when the end-user does a `longpress` or a `swipe` event
 * on the column headers.
 */
Ext.define('Ext.pivot.plugin.Configurator', {
    extend: 'Ext.AbstractPlugin',
    requires: [
        'Ext.util.Collection',
        'Ext.pivot.plugin.configurator.Panel'
    ],
    alias: 'plugin.pivotconfigurator',
    /**
     * Fired on the pivot component before a configurator field is moved.
     *
     * Return false if you don't want to move that field.
     *
     * @event beforemoveconfigfield
     * @param {Ext.pivot.plugin.configurator.Panel} panel Configurator panel
     * @param {Object} config
     * @param {Ext.pivot.plugin.configurator.Container} config.fromContainer Source container to move from
     * @param {Ext.pivot.plugin.configurator.Container} config.toContainer Destination container to move to
     * @param {Ext.pivot.plugin.configurator.Field} config.field Field configuration
     */
    /**
     * Fired on the pivot component before the field settings container is shown.
     *
     * Return false if you don't want to show the field settings container.
     *
     * @event beforeshowconfigfieldsettings
     * @param {Ext.pivot.plugin.configurator.Panel} panel Configurator panel
     * @param {Object} config
     * @param {Ext.form.Panel} config.container Form panel container where you can inject
     * additional fields
     * @param {Object} config.settings Settings that will be loaded into the form
     */
    /**
     * Fired on the pivot component after the configurator field settings container is shown.
     *
     * @event showconfigfieldsettings
     * @param {Ext.pivot.plugin.configurator.Panel} panel Configurator panel
     * @param {Object} config
     * @param {Ext.form.Panel} config.container Form panel container where you can inject
     * additional fields
     * @param {Object} config.settings Settings that were loaded into the form
     */
    /**
     * Fired on the pivot component before settings are applied to the configurator field.
     *
     * Return false if you don't want to apply the settings to the field.
     *
     * @event beforeapplyconfigfieldsettings
     * @param {Ext.pivot.plugin.configurator.Panel} panel Configurator panel
     * @param {Object} config
     * @param {Ext.form.Panel} config.container Form panel container that contains all field settings
     * @param {Object} config.settings Settings that will be loaded into the form
     */
    /**
     * Fired on the pivot component after settings are applied to the configurator field.
     *
     * @event applyconfigfieldsettings
     * @param {Ext.pivot.plugin.configurator.Panel} panel Configurator panel
     * @param {Object} config
     * @param {Ext.form.Panel} config.container Form panel container that contains all field settings
     * @param {Object} config.settings Settings that were loaded into the form
     */
    /**
     * Fired on the pivot component before the new configuration is applied.
     *
     * Return false if you don't want to apply the new configuration to the pivot grid.
     *
     * @event beforeconfigchange
     * @param {Ext.pivot.plugin.configurator.Panel} panel Configurator panel
     * @param {Object} config Config object used to reconfigure the pivot
     */
    /**
     * Fired on the pivot component when the configuration changes.
     *
     * @event configchange
     * @param {Ext.pivot.plugin.configurator.Panel} panel Configurator panel
     * @param {Object} config Config object used to reconfigure the pivot
     */
    /**
     * Fired on the pivot component when the configurator panel is visible
     *
     * @event showconfigpanel
     * @param {Ext.pivot.plugin.configurator.Panel} panel Configurator panel
     */
    /**
     * Fired on the pivot component when the configurator panel is disabled
     *
     * @event hideconfigpanel
     * @param {Ext.pivot.plugin.configurator.Panel} panel Configurator panel
     */
    config: {
        /**
         * @cfg {Ext.pivot.plugin.configurator.Field[]} fields
         *
         * This is the array of fields you want to be used in the configurator.
         *
         * If no fields are defined then all fields are fetched from the store model if
         * a {@link Ext.pivot.matrix.Local Local} matrix is used.
         *
         * The fields are indexed by the dataIndex supplied to them which means that you can't have two fields
         * sharing the same dataIndex. If you want to define two fields that share the same dataIndex then
         * it's best to use a unique dataIndex for the 2nd field and define a grouperFn on it.
         *
         * The dimensions that are configured on the pivot component but do not exist in this fields collection
         * will be added here with a set of default settings.
         */
        fields: [],
        /**
         * @cfg {Number} width
         *
         * The width of the configurator panel.
         */
        width: 400,
        /**
         * @cfg {Object} panel
         *
         * Configuration object used to instantiate the configurator panel.
         */
        panel: {
            xtype: 'pivotconfigpanel',
            docked: 'right'
        },
        /**
         * @cfg {Object} panelWrapper
         *
         * Configuration object used to wrap the configurator panel when needed.
         */
        panelWrapper: {
            xtype: 'sheet',
            right: 0,
            stretchY: true,
            layout: 'fit',
            hideOnMaskTap: true,
            enter: 'right',
            exit: 'right',
            style: {
                padding: 0
            }
        },
        /**
         * @cfg {Boolean} panelWrap
         *
         * Enable or disable the configurator panel wrapper.
         */
        panelWrap: true,
        /**
         * @private
         */
        grid: null,
        /**
         * Reference to the configurator panel.
         * @private
         */
        view: null
    },
    platformConfig: {
        desktop: {
            panelWrap: false
        }
    },
    init: function(grid) {
        this.setGrid(grid);
    },
    /**
     * @private
     * AbstractComponent calls destroy on all its plugins at destroy time.
     */
    destroy: function() {
        this.setConfig({
            grid: null,
            view: null,
            panel: null
        });
        this.callParent();
    },
    /**
     * Enable the plugin to show the configurator panel.
     */
    enable: function() {
        this.disabled = false;
        this.showConfigurator();
    },
    /**
     * Disable the plugin to hide the configurator panel.
     */
    disable: function() {
        this.disabled = true;
        this.hideConfigurator();
    },
    //applyView: function(view) {
    //    if (view && !view.isComponent) {
    //        view = Ext.factory(view, Ext.pivot.plugin.configurator.Panel);
    //    }
    //
    //    return view;
    //},
    updateView: function(view, oldView) {
        var me = this,
            panel;
        Ext.destroy(oldView, me.panelListeners);
        if (view) {
            panel = view.isXType('pivotconfigpanel') ? view : view.down('pivotconfigpanel');
            if (panel) {
                me.panelListeners = panel.on({
                    close: 'hideConfigurator',
                    scope: me
                });
                panel.setConfig({
                    pivot: me.getGrid(),
                    fields: me.getFields()
                });
            } else {
                Ext.raise('Wrong panel configuration! No "pivotconfigpanel" component available.');
            }
        }
    },
    updateGrid: function(grid, oldGrid) {
        var me = this;
        Ext.destroy(me.gridListeners);
        if (oldGrid) {
            oldGrid.showConfigurator = oldGrid.hideConfigurator = null;
        }
        if (grid) {
            // this plugin is only available for the pivot components
            if (!grid.isPivotGrid) {
                Ext.raise('This plugin is only compatible with pivot grid');
            }
            grid.showConfigurator = Ext.bind(me.showConfigurator, me);
            grid.hideConfigurator = Ext.bind(me.hideConfigurator, me);
            if (grid.initialized) {
                me.onGridInitialized();
            } else {
                grid.on({
                    initialize: 'onGridInitialized',
                    single: true,
                    scope: me
                });
            }
        }
    },
    getWidth: function() {
        var grid = this.getGrid(),
            viewport = Ext.Viewport,
            maxWidth = 100;
        if (grid && grid.element) {
            maxWidth = grid.element.getWidth();
        }
        if (viewport) {
            maxWidth = Math.min(maxWidth, viewport.element.getHeight(), viewport.element.getWidth());
        }
        return Ext.Number.constrain(this._width, 100, maxWidth);
    },
    /**
     * @private
     */
    onGridInitialized: function() {
        var me = this,
            grid = me.getGrid(),
            fields = me.getFields(),
            matrix = grid.getMatrix(),
            store, newFields, field, name, length, i, dim;
        // extract fields from the existing pivot configuration
        newFields = Ext.Array.merge(matrix.leftAxis.dimensions.getRange(), matrix.topAxis.dimensions.getRange(), matrix.aggregate.getRange());
        length = newFields.length;
        for (i = 0; i < length; i++) {
            dim = newFields[i].getInitialConfig();
            delete (dim.matrix);
            field = fields.byDataIndex.get(dim.dataIndex);
            if (!field) {
                fields.add(dim);
            } else {
                field.setConfig(dim);
            }
        }
        if (fields.length === 0) {
            // if no fields were provided then try to extract them from the matrix store
            store = me.getCmp().getStore();
            newFields = store ? store.model.getFields() : [];
            length = newFields.length;
            for (i = 0; i < length; i++) {
                name = newFields[i].getName();
                if (!fields.byDataIndex.get(name)) {
                    fields.add({
                        header: Ext.String.capitalize(name),
                        dataIndex: name
                    });
                }
            }
        }
        me.isReady = true;
        me.doneSetup = false;
        me.gridListeners = grid.getHeaderContainer().renderElement.on({
            longpress: 'showConfigurator',
            scope: this
        });
    },
    /**
     * @private
     */
    hideConfigurator: function() {
        var grid = this.getGrid(),
            view;
        this.setup();
        view = this.getView();
        view.translate(this.getWidth(), 0, {
            duration: 100
        });
        view.getTranslatable().on('animationend', function() {
            view.hide(null);
            grid.fireEvent('hideconfigpanel', view);
        }, this, {
            single: true
        });
    },
    /**
     * @private
     */
    showConfigurator: function() {
        var me = this,
            view;
        me.setup();
        view = me.getView();
        view.setWidth(me.getWidth());
        view.show();
        view.translate(0, 0, {
            duration: 100
        });
        this.getGrid().fireEvent('showconfigpanel', view);
    },
    getFields: function() {
        var ret = this._fields;
        if (!ret) {
            ret = new Ext.util.Collection({
                extraKeys: {
                    byDataIndex: 'dataIndex'
                },
                decoder: function(field) {
                    return (field && field.isField) ? field : new Ext.pivot.plugin.configurator.Field(field || {});
                }
            });
            this.setFields(ret);
        }
        return ret;
    },
    applyFields: function(fields, fieldsCollection) {
        if (fields == null || (fields && fields.isCollection)) {
            return fields;
        }
        if (fields) {
            if (!fieldsCollection) {
                fieldsCollection = this.getFields();
            }
            fieldsCollection.splice(0, fieldsCollection.length, fields);
        }
        return fieldsCollection;
    },
    privates: {
        setup: function() {
            var me = this,
                view, panel;
            if (me.doneSetup || !me.isReady) {
                return;
            }
            me.doneSetup = true;
            if (me.getPanelWrap()) {
                view = me.getPanelWrapper();
                if (!view.items) {
                    panel = me.getPanel();
                    panel.docked = null;
                    view.items = [
                        panel
                    ];
                }
            } else {
                view = me.getPanel();
            }
            me.setView(me.getGrid().add(view));
        }
    }
});

/**
 *
 * This plugin allows the user to view all records that were aggregated for a specified cell.
 *
 * The user has to double click that cell to open the records viewer.
 *
 * If a {@link Ext.pivot.matrix.Remote Remote} matrix is used then the plugin requires
 * a {@link #remoteStore} to be provided to fetch the records for a left/top keys pair.
 *
 */
Ext.define('Ext.pivot.plugin.DrillDown', {
    alias: [
        'plugin.pivotdrilldown'
    ],
    extend: 'Ext.AbstractPlugin',
    requires: [
        'Ext.pivot.Grid',
        'Ext.Sheet',
        'Ext.TitleBar',
        'Ext.Button',
        'Ext.data.proxy.Memory',
        'Ext.data.Store',
        'Ext.grid.plugin.PagingToolbar'
    ],
    config: {
        /**
         * @cfg {Ext.grid.column.Column[]} [columns] Specify which columns should be visible in the grid.
         *
         * Use the same definition as for a grid column.
         */
        columns: null,
        /**
         * @cfg {Number} width
         *
         * Width of the viewer's window.
         */
        width: 500,
        /**
         * @cfg {Ext.data.Store} remoteStore
         * Provide either a store config or a store instance when using a {@link Ext.pivot.matrix.Remote Remote} matrix on the pivot grid.
         *
         * The store will be remotely filtered to fetch records from the server.
         */
        remoteStore: null,
        /**
         * @private
         */
        grid: null,
        /**
         * @private
         */
        view: null
    },
    titleText: 'Drill down',
    doneText: 'Done',
    init: function(grid) {
        // this plugin is available only for the pivot grid
        if (!grid.isPivotGrid) {
            Ext.raise('This plugin is only compatible with Ext.pivot.Grid');
        }
        this.setGrid(grid);
        return this.callParent([
            grid
        ]);
    },
    destroy: function() {
        this.setConfig({
            grid: null,
            view: null
        });
        this.callParent();
    },
    updateGrid: function(grid, oldGrid) {
        var me = this;
        Ext.destroy(me.gridListeners);
        if (grid) {
            me.gridListeners = grid.on({
                pivotitemcelldoubletap: 'showPanel',
                pivotgroupcelldoubletap: 'showPanel',
                pivottotalcelldoubletap: 'showPanel',
                scope: me,
                destroyable: true
            });
            me.doneSetup = false;
        }
    },
    updateView: function(view, oldView) {
        Ext.destroy(oldView);
    },
    getWidth: function() {
        var grid = this.getGrid(),
            viewport = Ext.Viewport,
            maxWidth = 100;
        if (grid && grid.element) {
            maxWidth = grid.element.getWidth();
        }
        if (viewport) {
            maxWidth = Math.min(maxWidth, viewport.element.getHeight(), viewport.element.getWidth());
        }
        return Ext.Number.constrain(this._width, 100, maxWidth);
    },
    showPanel: function(params, e, eOpts) {
        var me = this,
            grid = me.getGrid(),
            matrix = grid.getMatrix(),
            columns = Ext.Array.from(me.getColumns() || []),
            result, fields, store, filters, view;
        // do nothing if the plugin is disabled
        if (me.disabled) {
            return;
        }
        result = matrix.results.get(params.leftKey, params.topKey);
        if (!result) {
            return;
        }
        switch (matrix.type) {
            case 'local':
                fields = matrix.store.model.getFields();
                store = Ext.create('Ext.data.Store', {
                    fields: Ext.clone(fields),
                    proxy: {
                        type: 'memory',
                        reader: {
                            type: 'array'
                        }
                    }
                });
                // if no columns are defined then use those defined in the pivot grid store
                if (columns.length === 0) {
                    Ext.Array.each(fields, function(value, index, all) {
                        columns.push({
                            text: Ext.String.capitalize(value.name),
                            dataIndex: value.name,
                            xtype: 'column'
                        });
                    });
                };
                store.loadData(result.records);
                break;
            case 'remote':
                store = Ext.getStore(me.remoteStore);
                if (store) {
                    store.setRemoteFilter(true);
                };
                if (columns.length === 0) {
                    Ext.raise('No columns defined for the drill down grid!');
                };
                filters = Ext.Array.merge(me.getFiltersFromParams(result.getLeftAxisItem() ? result.getLeftAxisItem().data : {}), me.getFiltersFromParams(result.getTopAxisItem() ? result.getTopAxisItem().data : {}));
                store.clearFilter(filters.length > 0);
                store.addFilter(filters);
                break;
            default:
                return;
        }
        // create the window that will show the records
        view = grid.add(Ext.create('Ext.Sheet', {
            width: me.getWidth(),
            hideOnMaskTap: false,
            enter: 'right',
            exit: 'right',
            modal: true,
            right: 0,
            layout: 'fit',
            stretchY: true,
            items: [
                {
                    docked: 'top',
                    xtype: 'titlebar',
                    title: me.titleText,
                    items: {
                        xtype: 'button',
                        text: me.doneText,
                        ui: 'action',
                        align: 'right',
                        listeners: {
                            tap: 'onDoneButton',
                            scope: me
                        }
                    }
                },
                {
                    xtype: 'grid',
                    store: store,
                    columns: columns,
                    plugins: [
                        {
                            type: 'gridpagingtoolbar'
                        }
                    ]
                }
            ]
        }));
        view.show();
        me.setView(view);
    },
    onDoneButton: function() {
        this.setView(null);
    },
    getFiltersFromParams: function(obj) {
        var filters = [],
            i, len, keys;
        if (Ext.isObject(obj)) {
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

/**
 * @private
 */
Ext.define('Ext.pivot.plugin.rangeeditor.PanelController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.pivotrangeeditor',
    applySettings: function() {
        var form = this.getViewModel().get('form'),
            fn = Ext.bind(this.cancelSettings, this),
            updater;
        if (form && form.type && form.type.isModel) {
            form.type = form.type.get('value');
        }
        updater = Ext.Factory.pivotupdate(form);
        updater.update().then(fn, fn);
    },
    cancelSettings: function() {
        var view = this.getView();
        view.fireEvent('close', view);
    }
});

/**
 * @private
 */
Ext.define('Ext.pivot.plugin.rangeeditor.Panel', {
    extend: 'Ext.form.Panel',
    requires: [
        'Ext.pivot.plugin.rangeeditor.PanelController',
        'Ext.form.FieldSet',
        'Ext.field.Select',
        'Ext.field.Number',
        'Ext.layout.VBox',
        'Ext.TitleBar',
        'Ext.Button'
    ],
    xtype: 'pivotrangeeditor',
    controller: 'pivotrangeeditor',
    viewModel: {
        stores: {
            sTypes: {
                type: 'array',
                fields: [
                    'value',
                    'text'
                ],
                autoDestroy: true
            }
        }
    },
    showAnimation: {
        type: 'slideIn',
        duration: 250,
        easing: 'ease-out',
        direction: 'left'
    },
    hideAnimation: {
        type: 'slideOut',
        duration: 250,
        easing: 'ease-in',
        direction: 'right'
    },
    titleText: 'Range editor',
    valueText: 'Value',
    fieldText: 'Source field is "{form.dataIndex}"',
    typeText: 'Type',
    okText: 'Ok',
    cancelText: 'Cancel',
    initialize: function() {
        var me = this;
        me.add([
            {
                xtype: 'titlebar',
                docked: 'top',
                title: me.titleText,
                items: [
                    {
                        text: me.cancelText,
                        align: 'left',
                        ui: 'back',
                        handler: 'cancelSettings'
                    },
                    {
                        text: me.okText,
                        align: 'right',
                        ui: 'action',
                        handler: 'applySettings'
                    }
                ]
            },
            {
                xtype: 'fieldset',
                margin: 0,
                bind: {
                    instructions: me.fieldText
                },
                defaults: {
                    labelAlign: 'top'
                },
                items: [
                    {
                        label: me.typeText,
                        xtype: 'selectfield',
                        autoSelect: false,
                        useClearIcon: true,
                        bind: {
                            store: '{sTypes}',
                            value: '{form.type}'
                        }
                    },
                    {
                        label: me.valueText,
                        xtype: 'numberfield',
                        bind: '{form.value}'
                    }
                ]
            }
        ]);
        return me.callParent();
    }
});

/**
 *
 * This plugin allows the user to modify records behind a pivot cell.
 *
 * The user has to double click that cell to open the range editor window.
 *
 * The following types of range editing are available:
 *
 * - `percentage`: the user fills in a percentage that is applied to each record.
 * - `increment`:  the user fills in a value that is added to each record.
 * - `overwrite`:  the new value filled in by the user overwrites each record.
 * - `uniform`:  replace sum of values with a provided value using uniform distribution
 *
 * More pivot updater types can be defined by extending {@link Ext.pivot.update.Base this class}.
 *
 * @note Only works when using a {@link Ext.pivot.matrix.Local Local matrix} on a pivot grid.
 */
Ext.define('Ext.pivot.plugin.RangeEditor', {
    alias: [
        'plugin.pivotrangeeditor'
    ],
    extend: 'Ext.AbstractPlugin',
    requires: [
        'Ext.pivot.plugin.rangeeditor.Panel',
        'Ext.Sheet',
        'Ext.layout.Fit',
        'Ext.pivot.update.Increment',
        'Ext.pivot.update.Overwrite',
        'Ext.pivot.update.Percentage',
        'Ext.pivot.update.Uniform'
    ],
    config: {
        /**
         * @cfg {Array} updaters
         *
         * Define here the updaters available for the user.
         */
        updaters: [
            [
                'percentage',
                'Percentage'
            ],
            [
                'increment',
                'Increment'
            ],
            [
                'overwrite',
                'Overwrite'
            ],
            [
                'uniform',
                'Uniform'
            ]
        ],
        /**
         * @cfg {String} defaultUpdater
         *
         * Define which updater is selected by default.
         */
        defaultUpdater: 'uniform',
        /**
         * @cfg {Number} width
         *
         * Width of the viewer's window.
         */
        width: 400,
        /**
         * @cfg {Object} panel
         *
         * Configuration object used to instantiate the range editor panel.
         */
        panel: {
            xtype: 'pivotrangeeditor'
        },
        /**
         * @cfg {Object} panelWrapper
         *
         * Configuration object used to wrap the range editor panel when needed.
         */
        panelWrapper: {
            xtype: 'sheet',
            right: 0,
            stretchY: true,
            layout: 'fit',
            hideOnMaskTap: true,
            enter: 'right',
            exit: 'right',
            style: {
                padding: 0
            }
        },
        /**
         * @cfg {Boolean} panelWrap
         *
         * Enable or disable the configurator panel wrapper.
         */
        panelWrap: true,
        /**
         * @private
         */
        grid: null,
        /**
         * @private
         */
        view: null
    },
    init: function(grid) {
        /**
         * Fires on the pivot grid before updating all result records.
         *
         * @event pivotbeforeupdate
         * @param {Ext.pivot.update.Base} updater Reference to the updater object
         */
        /**
         * Fires on the pivot grid after updating all result records.
         *
         * @event pivotupdate
         * @param {Ext.pivot.update.Base} updater Reference to the updater object
         */
        // this plugin is available only for the pivot grid
        if (!grid.isPivotGrid) {
            Ext.raise('This plugin is only compatible with Ext.pivot.Grid');
        }
        this.setGrid(grid);
        return this.callParent([
            grid
        ]);
    },
    destroy: function() {
        this.setConfig({
            grid: null,
            view: null,
            panel: null
        });
        this.callParent();
    },
    updateGrid: function(grid, oldGrid) {
        var me = this;
        Ext.destroy(me.gridListeners);
        if (grid) {
            me.gridListeners = grid.on({
                pivotitemcelldoubletap: 'showPanel',
                pivotgroupcelldoubletap: 'showPanel',
                pivottotalcelldoubletap: 'showPanel',
                scope: me,
                destroyable: true
            });
            me.doneSetup = false;
        }
    },
    updateView: function(view, oldView) {
        var me = this,
            panel;
        Ext.destroy(oldView, me.viewListeners);
        if (view) {
            panel = view.isXType('pivotrangeeditor') ? view : view.down('pivotrangeeditor');
            if (panel) {
                panel.getViewModel().getStore('sTypes').loadData(this.getUpdaters());
                me.getGrid().relayEvents(panel, [
                    'beforeupdate',
                    'update'
                ], 'pivot');
                me.viewListeners = panel.on({
                    close: 'hidePanel',
                    scope: me,
                    destroyable: true
                });
            } else {
                Ext.raise('No pivot range editor view available');
            }
        }
    },
    getWidth: function() {
        var grid = this.getGrid(),
            viewport = Ext.Viewport,
            maxWidth = 100;
        if (grid && grid.element) {
            maxWidth = grid.element.getWidth();
        }
        if (viewport) {
            maxWidth = Math.min(maxWidth, viewport.element.getHeight(), viewport.element.getWidth());
        }
        return Ext.Number.constrain(this._width, 100, maxWidth);
    },
    showPanel: function(params, e, eOpts) {
        var me = this,
            matrix = me.getGrid().getMatrix(),
            view, panel, vm, result, col, dataIndex;
        // do nothing if the plugin is disabled
        if (me.disabled) {
            return;
        }
        if (params.topKey) {
            result = matrix.results.get(params.leftKey, params.topKey);
            me.setup();
            view = me.getView();
            view.setWidth(me.getWidth());
            panel = view.down('pivotrangeeditor');
            if (panel && result) {
                vm = panel.getViewModel();
                col = params.column;
                dataIndex = col.dimension.getDataIndex();
                vm.set('form', {
                    leftKey: params.leftKey,
                    topKey: params.topKey,
                    dataIndex: dataIndex,
                    //field:      col.dimension.header || col.text || dataIndex,
                    value: result.getValue(col.dimension.getId()),
                    type: me.getDefaultUpdater(),
                    matrix: matrix
                });
                view.show();
            } else {
                view.hide();
            }
        }
    },
    hidePanel: function() {
        this.getView().hide();
    },
    setup: function() {
        var me = this,
            view;
        if (me.doneSetup) {
            return;
        }
        if (me.getPanelWrap()) {
            view = me.getPanelWrapper();
            if (!view.items) {
                view.items = [
                    me.getPanel()
                ];
            }
        } else {
            view = me.getPanel();
        }
        me.setView(me.getGrid().add(view));
        me.doneSetup = true;
    }
});

