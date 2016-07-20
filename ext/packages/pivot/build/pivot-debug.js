/**
 * This class contains all predefined aggregator functions for the pivot grid.
 * @singleton
 *
 */
Ext.define('Ext.pivot.Aggregators', {
    alternateClassName: [
        'Mz.aggregate.Aggregators'
    ],
    singleton: true,
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
    constructor: function(config) {
        Ext.apply(this, config || {});
        return this.callParent(arguments);
    },
    destroy: function() {
        this.parent = null;
        return this.callParent(arguments);
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
            sorter = Ext.pivot.matrix.Base.prototype.naturalSort,
            v = me.value,
            ret, retFrom, retTo, from, to;
        v = (Ext.isArray(v) ? v[0] : v) || '';
        ret = (me.caseSensitive ? sorter(value || '', v) : sorter(String(value || '').toLowerCase(), String(v).toLowerCase()));
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
        retFrom = (me.caseSensitive ? sorter(String(value || '').toLowerCase(), String(from).toLowerCase()) : sorter(value || '', from));
        retTo = (me.caseSensitive ? sorter(String(value || '').toLowerCase(), String(to).toLowerCase()) : sorter(value || '', to));
        if (me.operator == 'between') {
            return (retFrom >= 0 && retTo <= 0);
        }
        if (me.operator == 'not between') {
            return !(retFrom >= 0 && retTo <= 0);
        }
        // no valid operator was specified. ignore filtering
        return true;
    }
});

/**
 * Label filter class. Use this filter type when you want to filter
 * the left/top axis results by their values.
 *
 * Example:
 *
 *      // This example will generate a grid column for the year 2012
 *      // instead of columns for all unique years.
 *      topAxis: [{
 *          dataIndex:  'year',
 *          header:     'Year',
 *          filter: {
 *              type:       'label',
 *              operator:   '=',
 *              value:      2012
 *          }
 *      }]
 *
 *      leftAxis: [{
 *          dataIndex:  'country',
 *          header:     'Country',
 *          filter: {
 *              type:       'label',
 *              operator:   'in',
 *              value:      ['USA', 'Canada', 'Australia']
 *          }
 *      }]
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
 *      // This example will generate a column for each year
 *      // that has its grand total value between 1,000 and 15,000.
 *      aggregate: [{
 *          id:         'agg',
 *          dataIndex:  'value',
 *          aggregator: 'sum',
 *          header:     'Total'
 *      }],
 *      topAxis: [{
 *          dataIndex:  'year',
 *          header:     'Year',
 *          filter: {
 *              type:           'value',
 *              operator:       'between',
 *              dimensionId:    'agg',  // this is the id of an aggregate dimension
 *              value:          [1000, 15000]
 *          }
 *      }]
 *
 *
 * Top 10 works as following:
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
 *      // This example will return the bottom 3 years that have the smallest
 *      // sum of value.
 *      aggregate: [{
 *          id:         'agg',
 *          dataIndex:  'value',
 *          aggregator: 'sum',
 *          header:     'Total'
 *      }],
 *      leftAxis: [{
 *          dataIndex:  'year',
 *          header:     'Year',
 *          filter: {
 *              type:           'value',
 *              operator:       'top10',
 *              dimensionId:    'agg',   // this is the id of an aggregate dimension
 *              topType:        'items',
 *              topOrder:       'bottom',
 *              value:          3
 *          }
 *      }]
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
    constructor: function() {
        var me = this,
            ret = me.callParent(arguments);
        if (Ext.isEmpty(me.dimensionId)) {
            Ext.raise('dimensionId is mandatory on Value filters');
        } else if (!me.parent.matrix.aggregate.getByKey(me.dimensionId)) {
            Ext.raise('There is no aggregate dimension that matches the dimensionId provided');
        }
        me.dimension = me.parent.matrix.aggregate.getByKey(me.dimensionId);
        me.isTopFilter = (me.operator === 'top10');
        return ret;
    },
    destroy: function() {
        this.dimension = null;
        return this.callParent(arguments);
    },
    /**
     * @inheritdoc
     */
    isMatch: function(value) {
        // The value filters are called after the matrix has calculated everything
        // and are used to filter the results. It might happen that the user is looking
        // for the value 520.43 but the axis item value is 520.43243.
        // We need to compare the values using the aggregate dimension renderer
        var me = this,
            temp = me.value,
            match = me.callParent(arguments);
        if (!match) {
            me.value = me.dimension.renderer(Ext.isNumeric(temp) ? parseFloat(temp) : temp);
            match = me.callParent([
                me.dimension.renderer(Ext.isNumeric(value) ? parseFloat(value) : value)
            ]);
            me.value = temp;
        }
        return match;
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
     * Default column width when this dimension is used on the top/left axis.
     * Used by the generated columns.
     */
    width: 100,
    /**
     * @cfg {Number} [flex=0]
     * Column flex when this dimension is used on the top/left axis.
     * Used by the generated columns.
     */
    flex: 0,
    /**
     * @cfg {String} [align="left"]
     * Column alignment when this dimension is used on the top/left axis.
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
     * @cfg {String/Function} renderer
     * Default renderer for this dimension. This renderer is used when displaying the data in the pivot table.
     * You can either provide a string value with a number format or your own function.
     * The renderer function will have only one parameter and that is the value that need to be formatted.
     * The renderer function is running in the Dimension scope.
     *
     * If a renderer function is defined for a left or top axis dimension then this is NOT used in the grid.
     * It is instead used for formatting the value as you wish.
     *
     * On the other hand if you define a renderer function on an aggregate dimension then this will be
     * used in the grid and allows you to change cell formatting as well.
     */
    renderer: null,
    /**
     * @cfg {Function} grouperFn
     * This function is used when the groups are generated for the axis.
     * It will return the value that will uniquely identify a group on the axis.
     * ie: you have a Date field that you want to group by year.
     * This renderer could return the year from that Date value.
     *
     * The function receives one parameter and that is the record.
     */
    grouperFn: null,
    /**
     * @cfg {String} [blankText="(blank)"]
     * Default text to use when a group name is blank. This value is applied even if you set your own group renderer.
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
     * You can either provide a function name available in {@link Ext.pivot.Aggregators} or
     * set your own function.
     *
     * It's probably best to override {@link Ext.pivot.Aggregators} to add you own function
     * and use that function name on this config. This way the stateles pivot will save this value.
     */
    aggregator: 'sum',
    /**
     * @property {Boolean} isAggregate
     * True to identify a dimension of an aggregate configuration.
     */
    isAggregate: false,
    /**
     * @cfg {String} id
     * Unique id of this dimension.
     */
    id: '',
    /**
     * @cfg {Object[]} values
     * Collection of unique values on this dimension; each item has a "value" and a "display".
     */
    values: null,
    /**
     * @property {Ext.pivot.matrix.Base} matrix
     * @readonly
     * Reference to the matrix object.
     */
    matrix: null,
    constructor: function(config) {
        var me = this,
            aggregators = Ext.pivot.Aggregators;
        me.initialConfig = config || {};
        if (config.isAggregate === true && Ext.isEmpty(config.align)) {
            config.align = 'left';
        }
        Ext.apply(me, config || {});
        if (Ext.isEmpty(me.id)) {
            // generate an internal id used by the matrix
            me.id = Ext.id();
        }
        if (me.isAggregate) {
            if (Ext.isEmpty(me.dataIndex) && Ext.isDefined(me.measure)) {
                me.dataIndex = me.measure;
                delete me.measure;
            }
            if (Ext.isEmpty(me.aggregator)) {
                me.aggregator = 'sum';
            }
            if (Ext.isString(me.aggregator) && Ext.isFunction(aggregators[me.aggregator])) {
                me.aggregatorFn = Ext.bind(aggregators[me.aggregator], aggregators);
            } else if (Ext.isFunction(me.aggregator)) {
                me.aggregatorFn = me.aggregator;
            }
            me.filter = false;
        } else {
            if (Ext.isObject(me.filter)) {
                Ext.applyIf(me.filter, {
                    type: 'label',
                    parent: me
                });
                me.filter = Ext.Factory.pivotfilter(me.filter);
            } else {
                me.filter = false;
            }
        }
        if (!Ext.isFunction(me.grouperFn)) {
            me.grouperFn = me.defaultGrouperFn;
        }
        if (me.sortable && !me.sorterFn) {
            me.sorterFn = me.defaultSorterFn;
        }
        if (Ext.isEmpty(me.sortIndex)) {
            me.sortIndex = me.dataIndex;
        }
        if (!me.renderer) {
            me.renderer = me.getDefaultFormatRenderer(me.isAggregate ? '0,000.00' : '');
        } else if (Ext.isString(me.renderer)) {
            me.renderer = me.getDefaultFormatRenderer(me.renderer);
        }
        me.values = Ext.create('Ext.pivot.MixedCollection');
        me.values.getKey = function(item) {
            return item.value;
        };
        me.callParent(arguments);
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
        var me = this;
        return {
            id: me.id,
            header: me.header,
            dataIndex: me.dataIndex,
            sortIndex: me.sortIndex,
            width: me.width,
            flex: me.flex,
            align: me.align,
            sortable: me.sortable,
            direction: me.direction,
            caseSensitiveSort: me.caseSensitiveSort,
            filter: me.filter ? me.filter.serialize() : null,
            aggregator: Ext.isString(me.aggregator) ? me.aggregator : 'sum',
            // functions cannot be serialized
            showZeroAsBlank: me.showZeroAsBlank
        };
    },
    /**
     * Add unique values available for this dimension. These are used when filtering.
     *
     * @param value
     * @param display
     */
    addValue: function(value, display) {
        if (!this.values.getByKey(value)) {
            this.values.add({
                value: value,
                display: display
            });
        }
    },
    /**
     * Returns the collection of unique values available for this dimension.
     */
    getValues: function() {
        return this.values;
    },
    /**
     * Returns the internal id of this dimension.
     */
    getId: function() {
        return this.id;
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
    }
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
     * Only items belonging to the leftAxis have this property.
     *
     */
    record: null,
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
        me.axis = me.data = me.dimension = me.record = me.children = null;
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
            me.expandCollapseChildrenTree(me, true);
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
            me.expandCollapseChildrenTree(me, false);
        }
        me.axis.matrix.fireEvent('groupcollapse', me.axis.matrix, (me.axis.isLeftAxis ? 'row' : 'col'), me);
    },
    /**
     * Expand or collapse all children tree of the specified item
     *
     * @private
     */
    expandCollapseChildrenTree: function(item, state) {
        var me = this,
            i;
        item.expanded = state;
        if (Ext.isArray(me.children)) {
            for (i = 0; i < me.children.length; i++) {
                me.expandCollapseChildrenTree(me.children[i], state);
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
        if (config) {
            this.dimensions.add(Ext.create('Ext.pivot.dimension.Item', Ext.apply({
                matrix: this.matrix
            }, config)));
        }
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
        item.name = item.name || item.dimension.renderer(item.value);
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
    rowGrandTotalsPosition: 'first',
    /**
     * @cfg {String} colSubTotalsPosition Possible values: `first`, `none`, `last`
     */
    colSubTotalsPosition: 'first',
    /**
     * @cfg {String} colGrandTotalsPosition Possible values: `first`, `none`, `last`
     */
    colGrandTotalsPosition: 'first',
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
        me.columns = me.model = me.totals = me.keysMap = null;
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
     * Template method called to do your internal initialization when you extend this class.
     */
    onInitialize: Ext.emptyFn,
    /**
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
        me.initialize(false, config);
        me.clearData();
        if (Ext.isFunction(me.onReconfigure)) {
            me.onReconfigure(config);
        }
        me.delayedTask.delay(5);
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
            Ext.applyIf(item, {
                isAggregate: true,
                align: 'right',
                showZeroAsBlank: me.showZeroAsBlank
            });
            me.aggregate.add(Ext.create('Ext.pivot.dimension.Item', item));
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
        me.fireEvent('done');
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
            }
        ];
        //{name: 'info', type: 'object'}
        me.buildColumnHeaders(false);
    },
    /**
     * @private
     */
    buildColumnHeaders: function(disableChangeModel) {
        var me = this;
        me.internalCounter = 0;
        me.columns = [];
        if (me.viewLayoutType == 'compact') {
            me.generateCompactLeftAxis(disableChangeModel);
        } else {
            me.leftAxis.dimensions.each(function(item) {
                this.parseLeftAxisDimension(item, disableChangeModel);
            }, me);
        }
        if (me.colGrandTotalsPosition == 'first') {
            me.columns.push(me.parseAggregateForColumn(null, {
                text: me.textGrandTotalTpl,
                grandTotal: true
            }, disableChangeModel));
        }
        Ext.Array.each(me.topAxis.getTree(), function(item) {
            this.parseTopAxisItem(item, disableChangeModel);
        }, me);
        if (me.colGrandTotalsPosition == 'last') {
            me.columns.push(me.parseAggregateForColumn(null, {
                text: me.textGrandTotalTpl,
                grandTotal: true
            }, disableChangeModel));
        }
        // call the hook functions
        if (!disableChangeModel) {
            if (Ext.isFunction(me.onBuildModel)) {
                me.onBuildModel(me.model);
            }
            me.fireEvent('modelbuilt', me, me.model);
        }
        if (Ext.isFunction(me.onBuildColumns)) {
            me.onBuildColumns(me.columns);
        }
        me.fireEvent('columnsbuilt', me, me.columns);
    },
    /**
     * @private
     */
    parseLeftAxisDimension: function(dimension, disableChangeModel) {
        if (!disableChangeModel) {
            this.model.push({
                name: dimension.getId(),
                type: 'string'
            });
        }
        this.columns.push({
            dataIndex: dimension.getId(),
            text: dimension.header,
            dimension: dimension,
            leftAxis: true
        });
    },
    /**
     * @private
     */
    generateCompactLeftAxis: function(disableChangeModel) {
        var me = this;
        if (!disableChangeModel) {
            me.model.push({
                name: me.compactViewKey,
                type: 'string'
            });
        }
        me.columns.push({
            dataIndex: me.compactViewKey,
            text: me.textRowLabels,
            leftAxis: true,
            width: 200
        });
    },
    /**
     * @private
     */
    parseTopAxisItem: function(item, disableChangeModel) {
        var me = this,
            columns = [],
            retColumns = [],
            o1, o2,
            doAdd = false;
        if (!item.children) {
            columns = me.parseAggregateForColumn(item, null, disableChangeModel);
            if (item.level === 0) {
                me.columns.push(columns);
            } else {
                // we reached the deepest level so we can add to the model now
                return columns;
            }
        } else {
            if (me.colSubTotalsPosition == 'first') {
                o2 = me.addColSummary(item, disableChangeModel, true);
                if (o2) {
                    retColumns.push(o2);
                }
            }
            // this part has to be done no matter if the column is added to the grid or not
            // the dataIndex is generated incrementally
            Ext.Array.each(item.children, function(child) {
                var ret = me.parseTopAxisItem(child, disableChangeModel);
                if (Ext.isArray(ret)) {
                    columns = Ext.Array.merge(columns, ret);
                } else {
                    columns.push(ret);
                }
            });
            if (item.expanded || !disableChangeModel) {
                o1 = {
                    text: item.name,
                    columns: columns,
                    key: item.key,
                    xcollapsible: item.expanded,
                    xexpanded: item.expanded,
                    xexpandable: true
                };
                if (item.level === 0) {
                    me.columns.push(o1);
                }
                retColumns.push(o1);
            }
            if (me.colSubTotalsPosition == 'last') {
                o2 = me.addColSummary(item, disableChangeModel, true);
                if (o2) {
                    retColumns.push(o2);
                }
            }
            if (me.colSubTotalsPosition == 'none') {
                o2 = me.addColSummary(item, disableChangeModel, false);
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
    addColSummary: function(item, disableChangeModel, addColumns) {
        var me = this,
            o2,
            doAdd = false;
        // add subtotal columns if required
        o2 = me.parseAggregateForColumn(item, {
            text: item.expanded ? item.getTextTotal() : item.name,
            subTotal: true
        }, disableChangeModel);
        if (addColumns) {
            doAdd = true;
        } else {
            // this has to change since we want to show the totals
            // when the column is collapsed but hide them when is expanded
            /*o2 = {
                text:           item.expanded ? item.getTextTotal() : item.name,
                dimension:      item.dimension,
                subTotal:       true
            };*/
            doAdd = !item.expanded;
        }
        if (doAdd) {
            if (item.level === 0) {
                me.columns.push(o2);
            }
            Ext.apply(o2, {
                key: item.key,
                xcollapsible: !item.expanded,
                xexpanded: item.expanded,
                xexpandable: !item.expanded
            });
            return o2;
        }
    },
    /**
     * @private
     */
    parseAggregateForColumn: function(item, config, disableChangeModel) {
        var me = this,
            columns = [],
            column = {};
        me.aggregate.each(function(agg) {
            me.internalCounter++;
            if (!disableChangeModel) {
                me.model.push({
                    name: 'c' + me.internalCounter,
                    type: 'auto',
                    defaultValue: undefined,
                    useNull: true,
                    col: item ? item.key : me.grandTotalKey,
                    agg: agg.getId()
                });
            }
            columns.push({
                dataIndex: 'c' + me.internalCounter,
                text: agg.header,
                topAxis: true,
                // generated based on the top axis
                subTotal: (config ? config.subTotal === true : false),
                grandTotal: (config ? config.grandTotal === true : false),
                dimension: agg
            });
        });
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
                //t.values.id = '';
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
            record;
        if (!item.children) {
            // we are on the deepest level so it's time to build the record and add it to the store
            record = me.pivotStore.add(me.preparePivotStoreRecordData(item));
            item.record = record[0];
            // this should be moved into the function "preparePivotStoreRecordData"
            if (Ext.isFunction(me.onBuildRecord)) {
                me.onBuildRecord(record[0]);
            }
            me.fireEvent('recordbuilt', me, record[0]);
        } else {
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
    preparePivotStoreRecordData: function(group) {
        var me = this,
            data = {};
        data['id'] = group.key;
        Ext.apply(data, group.data || {});
        // merge the left axis data
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
        // @TODO this function is used intensively in the pivot grid when the pivot grid store is generated
        // there is a need for a "recordbuild" event so that the developer can add
        // additional data to the record that will be added to the pivot store.
        // the matrix should fire "recordbuild" and the pivot grid should relay that event
        return data;
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
        } else {
            me.buildColumnHeaders(true);
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
        
        return (obj.node.children && obj.nodel.children.length == 0) ? 0 : obj.level;
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
            groupValue = dimension.grouperFn(record);
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
     * Calculate all pivot aggregate dimensions for the internal records. Useful when using a
     * {@link Ext.pivot.matrix.Local Local} matrix.
     *
     */
    calculate: function() {
        var me = this,
            i, dimension,
            length = me.matrix.aggregate.getCount();
        // for each pivot aggregate dimension calculate the value and call addValue
        for (i = 0; i < length; i++) {
            dimension = me.matrix.aggregate.getAt(i);
            me.addValue(dimension.getId(), dimension.aggregatorFn(me.records, dimension.dataIndex, me.matrix, me.leftKey, me.topKey));
        }
    },
    /**
     * Besides the calculation functions defined on your aggregate dimension you could
     * calculate values based on other store fields and custom functions.
     *
     * @param key The generated value will be stored in the result under this key for later extraction
     * @param dataIndex The dataIndex that should be used on the records for doing calculations
     * @param aggFn Your custom function
     */
    calculateByFn: function(key, dataIndex, aggFn) {
        var me = this,
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
        me.callParent(arguments);
    },
    onReconfigure: function(config) {
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
        }
        me.callParent(arguments);
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
                found = (record && record.isModel && dimension.values.containsKey(record.get(dimension.dataIndex)));
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
        if (!item.children) {
            if (item.record) {
                item.record.set(this.preparePivotStoreRecordData(item));
            }
        } else {
            Ext.Array.each(item.children, function(child) {
                this.updateRecordToPivotStore(child);
            }, this);
        }
    },
    startProcess: function() {
        var me = this;
        // if we don't have a store then do nothing
        if (!me.store || (me.store && !me.store.isStore) || me.isDestroyed) {
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
 * This class remodels the grid store when required.
 *
 * @private
 *
 */
Ext.define('Ext.pivot.feature.PivotStore', {
    constructor: function(config) {
        Ext.apply(this, config);
        this.bindStore(config.store);
    },
    destroy: function() {
        var me = this;
        Ext.destroy(me.storeListeners);
        me.store = me.matrix = me.pivotFeature = null;
        me.storeInfo = me.storeListeners = me.store = null;
        me.callParent(arguments);
    },
    bindStore: function(store) {
        var me = this;
        if (me.store) {
            Ext.destroy(me.storeListeners);
            me.store = null;
        }
        if (store) {
            me.storeListeners = store.on({
                // this event is fired by the pivot grid for private use
                pivotstoreremodel: me.processStore,
                scope: me,
                destroyable: true
            });
            me.store = store;
        }
    },
    processStore: function() {
        if (!this.matrix) {
            return;
        }
        var me = this,
            fn = me['processGroup' + Ext.String.capitalize(me.matrix.viewLayoutType)],
            fields = me.matrix.getColumns(),
            outputFn;
        me.store.model.replaceFields(fields, true);
        me.store.removeAll(true);
        me.store.suspendEvents(false);
        me.storeInfo = {};
        if (!Ext.isFunction(fn)) {
            // specified view type doesn't exist so let's use the outline view
            fn = me.processGroupOutline;
        }
        outputFn = Ext.Function.bind(fn, me);
        if (me.matrix.rowGrandTotalsPosition == 'first') {
            me.processGrandTotal();
        }
        Ext.Array.each(me.matrix.leftAxis.getTree(), function(group, index, all) {
            me.store.add(outputFn({
                group: group,
                previousExpanded: (index > 0 ? all[index - 1].expanded : false)
            }));
        }, me);
        if (me.matrix.rowGrandTotalsPosition == 'last') {
            me.processGrandTotal();
        }
        me.store.resumeEvents();
        me.store.fireEvent('refresh', me.store);
    },
    processGroup: function(config) {
        var me = this,
            fn = me['processGroup' + Ext.String.capitalize(me.matrix.viewLayoutType)],
            outputFn;
        if (!Ext.isFunction(fn)) {
            // specified view type doesn't exist so let's use the outline view
            fn = me.processGroupOutline;
        }
        outputFn = Ext.Function.bind(fn, me);
        return outputFn(config);
    },
    createGridStoreRecord: function(values) {
        var me = this,
            data = me.matrix.preparePivotStoreRecordData(values || {}),
            record;
        data.id = '';
        record = new me.store.model(data);
        if (Ext.isEmpty(values)) {
            Ext.Object.each(data, function(field) {
                if (field != 'id') {
                    record.set(field, null);
                }
            });
            record.commit();
        }
        record.isPlaceholder = true;
        //record.internalId = values.key;
        return record;
    },
    processGrandTotal: function() {
        var me = this,
            found = false,
            group = {
                key: me.matrix.grandTotalKey
            };
        Ext.Array.forEach(me.matrix.totals || [], function(total) {
            var record = total.record,
                i = me.matrix.leftAxis.dimensions.getCount();
            if (!(record instanceof Ext.data.Model)) {
                return;
            }
            me.storeInfo[record.internalId] = {
                leftKey: group.key,
                rowStyle: '',
                rowClasses: [
                    me.pivotFeature.gridMaster.clsGrandTotal,
                    me.pivotFeature.summaryDataCls
                ],
                rendererParams: {}
            };
            me.matrix.leftAxis.dimensions.each(function(column, index) {
                var key;
                if (me.matrix.viewLayoutType == 'compact' || index === 0) {
                    if (me.matrix.viewLayoutType == 'compact') {
                        key = me.matrix.compactViewKey;
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
                // for all top axis columns use a new renderer
                me.storeInfo[record.internalId].rendererParams['topaxis'] = {
                    fn: 'topAxisRenderer'
                };
            });
            me.store.add(record);
        });
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
            group = config['group'],
            previousExpanded = config['previousExpanded'],
            hasSummaryData = false,
            record, i;
        if (!group.expanded || (group.expanded && me.matrix.rowSubTotalsPosition == 'first')) {
            // summary row is on the group header
            hasSummaryData = true;
            record = me.createGridStoreRecord(group);
        } else if (me.matrix.rowSubTotalsPosition == 'last' || me.matrix.rowSubTotalsPosition == 'none') {
            record = me.createGridStoreRecord();
            record.set(group.dimension.getId(), group.name);
        }
        record.commit();
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
            if (me.matrix.rowSubTotalsPosition == 'last') {
                record = me.createGridStoreRecord(group);
                record.set(group.dimension.getId(), group.getTextTotal());
                record.commit();
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
            group = config['group'],
            record = config['record'],
            previousExpanded = config['previousExpanded'],
            subtotalRow = config['subtotalRow'],
            hasSummaryData = config['hasSummaryData'],
            i = me.matrix.leftAxis.dimensions.getCount(),
            found = false;
        me.storeInfo[record.internalId] = {
            leftKey: group.key,
            rowStyle: '',
            rowClasses: [
                me.pivotFeature.gridMaster.clsGroupTotal,
                hasSummaryData ? me.pivotFeature.summaryDataCls : ''
            ],
            rendererParams: {}
        };
        me.matrix.leftAxis.dimensions.each(function(column, index) {
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
            //record = me.createGridStoreRecord(group);
            record = group.record;
        me.storeInfo[record.internalId] = {
            leftKey: group.key,
            rowStyle: '',
            rowClasses: [
                me.pivotFeature.rowCls,
                me.pivotFeature.summaryDataCls
            ],
            rendererParams: {}
        };
        me.matrix.leftAxis.dimensions.each(function(column, index) {
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
            group = config['group'],
            previousExpanded = config['previousExpanded'],
            hasSummaryData = false,
            record, i;
        if (!group.expanded || (group.expanded && me.matrix.rowSubTotalsPosition == 'first')) {
            // summary row is on the group header
            hasSummaryData = true;
            record = me.createGridStoreRecord(group);
        } else if (me.matrix.rowSubTotalsPosition == 'last' || me.matrix.rowSubTotalsPosition == 'none') {
            record = me.createGridStoreRecord();
            record.set(me.matrix.compactViewKey, group.name);
        }
        record.commit();
        me.processGroupHeaderRecordCompact({
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
            if (me.matrix.rowSubTotalsPosition == 'last') {
                record = me.createGridStoreRecord(group);
                record.set(me.matrix.compactViewKey, group.getTextTotal());
                record.commit();
                me.processGroupHeaderRecordCompact({
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
    processGroupHeaderRecordCompact: function(config) {
        var me = this,
            group = config['group'],
            record = config['record'],
            previousExpanded = config['previousExpanded'],
            subtotalRow = config['subtotalRow'],
            hasSummaryData = config['hasSummaryData'],
            i = me.matrix.leftAxis.dimensions.getCount(),
            found = false;
        me.storeInfo[record.internalId] = {
            leftKey: group.key,
            rowStyle: '',
            rowClasses: [
                me.pivotFeature.gridMaster.clsGroupTotal,
                hasSummaryData ? me.pivotFeature.summaryDataCls : ''
            ],
            rendererParams: {}
        };
        me.storeInfo[record.internalId].rendererParams[me.matrix.compactViewKey] = {
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
            found = false,
            record = me.createGridStoreRecord(group);
        me.storeInfo[record.internalId] = {
            leftKey: group.key,
            rowStyle: '',
            rowClasses: [
                me.pivotFeature.rowCls,
                me.pivotFeature.summaryDataCls
            ],
            rendererParams: {}
        };
        me.storeInfo[record.internalId].rendererParams[me.matrix.compactViewKey] = {
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
            gridMaster = me.pivotFeature.gridMaster,
            group;
        group = me.matrix.leftAxis.findTreeElement('key', key);
        if (!group) {
            return;
        }
        me.doExpandCollapseInternal(group, oldRecord);
        gridMaster.fireEvent((group.node.expanded ? 'pivotgroupexpand' : 'pivotgroupcollapse'), gridMaster, 'row', group.node);
    },
    doExpandCollapseInternal: function(group, oldRecord) {
        var me = this,
            items, oldItems, startIdx, len;
        oldItems = me.processGroup({
            group: group.node,
            previousExpanded: false
        });
        group.node.expanded = !group.node.expanded;
        items = me.processGroup({
            group: group.node,
            previousExpanded: false
        });
        if (items.length && (startIdx = me.store.indexOf(oldRecord)) !== -1) {
            me.store.suspendEvents();
            if (group.node.expanded) {
                me.store.remove(me.store.getAt(startIdx));
                me.store.insert(startIdx, items);
                oldItems = [
                    oldRecord
                ];
            } else {
                len = oldItems.length;
                oldItems = me.store.getRange(startIdx, startIdx + len - 1);
                me.store.remove(oldItems);
                me.store.insert(startIdx, items);
            }
            me.removeStoreInfoData(oldItems);
            me.store.resumeEvents();
            me.store.fireEvent('replace', me.store, startIdx, oldItems, items);
        }
    },
    removeStoreInfoData: function(records) {
        Ext.Array.each(records, function(record) {
            if (this.storeInfo[record.internalId]) {
                delete this.storeInfo[record.internalId];
            }
        }, this);
    }
});

/**
 * This is the class that takes care of pivot grid mouse events.
 *
 * @private
 *
 */
Ext.define('Ext.pivot.feature.PivotEvents', {
    alternateClassName: [
        'Mz.pivot.feature.PivotEvents'
    ],
    extend: 'Ext.grid.feature.Feature',
    alias: 'feature.pivotevents',
    requires: [
        'Ext.pivot.feature.PivotStore'
    ],
    eventPrefix: 'pivotcell',
    eventSelector: '.' + Ext.baseCSSPrefix + 'grid-cell',
    // this cls is used to catch events on the summary data rows (not on the header)
    summaryDataCls: Ext.baseCSSPrefix + 'pivot-summary-data',
    summaryDataSelector: '.' + Ext.baseCSSPrefix + 'pivot-summary-data',
    cellSelector: '.' + Ext.baseCSSPrefix + 'grid-cell',
    groupHeaderCls: Ext.baseCSSPrefix + 'pivot-grid-group-header',
    groupHeaderCollapsibleCls: Ext.baseCSSPrefix + 'pivot-grid-group-header-collapsible',
    // summary rows styling
    summaryRowCls: Ext.baseCSSPrefix + 'pivot-grid-group-total',
    summaryRowSelector: '.' + Ext.baseCSSPrefix + 'pivot-grid-group-total',
    grandSummaryRowCls: Ext.baseCSSPrefix + 'pivot-grid-grand-total',
    grandSummaryRowSelector: '.' + Ext.baseCSSPrefix + 'pivot-grid-grand-total',
    init: function(grid) {
        var me = this,
            view = me.view,
            lockPartner;
        me.initEventsListeners();
        // if summaryRowCls or grandSummaryRowCls are changed then the selectors should match the new classes otherwise
        // events handling will have problems
        me.summaryRowSelector = '.' + me.summaryRowCls;
        me.grandSummaryRowSelector = '.' + me.grandSummaryRowCls;
        me.callParent(arguments);
        // Share the GroupStore between both sides of a locked grid
        lockPartner = me.lockingPartner;
        if (lockPartner && lockPartner.dataSource) {
            me.dataSource = lockPartner.dataSource;
        } else {
            me.dataSource = new Ext.pivot.feature.PivotStore({
                store: me.grid.store,
                pivotFeature: me
            });
        }
    },
    destroy: function() {
        var me = this;
        me.destroyEventsListeners();
        Ext.destroy(me.dataSource);
        me.view = me.grid = me.gridMaster = me.matrix = me.dataSource = null;
        me.callParent(arguments);
    },
    initEventsListeners: function() {
        var me = this;
        me.eventsViewListeners = me.view.on(Ext.apply({
            scope: me,
            destroyable: true
        }, me.getViewListeners() || {}));
        me.gridListeners = me.grid.on(Ext.apply({
            scope: me,
            destroyable: true
        }, me.getGridListeners() || {}));
    },
    getViewListeners: function() {
        var me = this,
            listeners = {
                afterrender: me.onViewAfterRender
            };
        listeners[me.eventPrefix + 'click'] = me.onCellEvent;
        listeners[me.eventPrefix + 'dblclick'] = me.onCellEvent;
        listeners[me.eventPrefix + 'contextmenu'] = me.onCellEvent;
        return listeners;
    },
    getGridListeners: Ext.emptyFn,
    destroyEventsListeners: function() {
        Ext.destroyMembers(this, 'eventsViewListeners', 'gridListeners');
        this.eventsViewListeners = this.gridListeners = null;
    },
    onViewAfterRender: function() {
        var me = this;
        me.gridMaster = me.view.up('pivotgrid');
        me.matrix = me.gridMaster.getMatrix();
        me.dataSource.matrix = me.matrix;
    },
    getRowId: function(record) {
        return this.view.id + '-record-' + record.internalId;
    },
    getRecord: function(row) {
        return this.view.getRecord(row);
    },
    onCellEvent: function(view, tdCell, e) {
        var me = this,
            row = Ext.fly(tdCell).findParent(me.summaryDataSelector) || Ext.fly(tdCell).findParent(me.summaryRowSelector),
            record = me.getRecord(row),
            params = {
                grid: me.gridMaster,
                view: me.view,
                cellEl: tdCell
            },
            colIndex, ret, eventName, column, colDef, leftKey, topKey;
        if (!row || !record) {
            return false;
        }
        leftKey = me.dataSource.storeInfo[record.internalId].leftKey;
        row = Ext.fly(row);
        if (row.hasCls(me.grandSummaryRowCls)) {
            // we are on the grand total row
            eventName = 'pivottotal';
        } else if (row.hasCls(me.summaryRowCls)) {
            // we are on a group total row
            eventName = 'pivotgroup';
        } else if (row.hasCls(me.summaryDataCls)) {
            // we are on a pivot item row
            eventName = 'pivotitem';
        }
        colIndex = Ext.getDom(tdCell).getAttribute('data-columnid');
        column = me.getColumnHeaderById(colIndex);
        Ext.apply(params, {
            columnId: colIndex,
            column: column,
            leftKey: leftKey
        });
        if (Ext.fly(tdCell).hasCls(me.groupHeaderCls)) {}
        // it's a header cell
        else if (column) {
            eventName += 'cell';
            colDef = me.getTopAxisGroupByDataIndex(column.dataIndex);
            if (colDef) {
                topKey = colDef.col;
                Ext.apply(params, {
                    topKey: topKey,
                    dimensionId: colDef.agg
                });
            }
        }
        ret = me.gridMaster.fireEvent(eventName + e.type, params, e);
        if (ret !== false && e.type == 'click' && Ext.fly(tdCell).hasCls(me.groupHeaderCollapsibleCls)) {
            // if this is a pivotgroupclick event type then expand/collapse that row group
            me.dataSource.doExpandCollapse(leftKey, record);
            if (!me.view.bufferedRenderer && Ext.fly(me.getRowId(record))) {
                Ext.fly(me.getRowId(record)).scrollIntoView(me.view.el, false, false);
            }
        }
        return false;
    },
    getColumnHeaderById: function(columnId) {
        var columns = this.view.getGridColumns(),
            i;
        for (i = 0; i < columns.length; i++) {
            if (columns[i].id === columnId) {
                return columns[i];
            }
        }
    },
    getTopAxisGroupByDataIndex: function(dataIndex) {
        var columns = this.gridMaster.matrix.getColumns(),
            i;
        for (i = 0; i < columns.length; i++) {
            if (columns[i].name === dataIndex) {
                return columns[i];
            }
        }
    }
});

/**
 * This grid feature is automatically used by the pivot grid to customize grid templates.
 * @private
 */
Ext.define('Ext.pivot.feature.PivotView', {
    extend: 'Ext.pivot.feature.PivotEvents',
    alias: 'feature.pivotview',
    // all views css classes
    groupTitleCls: Ext.baseCSSPrefix + 'pivot-grid-group-title',
    groupHeaderCollapsedCls: Ext.baseCSSPrefix + 'pivot-grid-group-header-collapsed',
    tableCls: Ext.baseCSSPrefix + 'grid-table',
    rowCls: Ext.baseCSSPrefix + 'grid-row',
    dirtyCls: Ext.baseCSSPrefix + 'grid-dirty-cell',
    // outline view css classes
    outlineCellHiddenCls: Ext.baseCSSPrefix + 'pivot-grid-outline-cell-hidden',
    outlineCellGroupExpandedCls: Ext.baseCSSPrefix + 'pivot-grid-outline-cell-previous-expanded',
    compactGroupHeaderCls: Ext.baseCSSPrefix + 'pivot-grid-group-header-compact',
    compactLayoutPadding: 25,
    outerTpl: [
        '{%',
        // Set up the grouping unless we are disabled
        'var me = this.pivotViewFeature;',
        'if (!(me.disabled)) {',
        'me.setup();',
        '}',
        // Process the item
        'this.nextTpl.applyOut(values, out, parent);',
        '%}',
        {
            priority: 200
        }
    ],
    rowTpl: [
        '{%',
        'var me = this.pivotViewFeature;',
        'me.setupRowData(values.record, values.rowIndex, values);',
        'values.view.renderColumnSizer(values, out);',
        'this.nextTpl.applyOut(values, out, parent);',
        'me.resetRenderers();',
        '%}',
        {
            priority: 200,
            syncRowHeights: function(firstRow, secondRow) {
                var firstHeight, secondHeight;
                firstRow = Ext.fly(firstRow, 'syncDest');
                if (firstRow) {
                    firstHeight = firstRow.offsetHeight;
                }
                secondRow = Ext.fly(secondRow, 'sycSrc');
                if (secondRow) {
                    secondHeight = secondRow.offsetHeight;
                }
                // Sync the heights of row body elements in each row if they need it.
                if (firstRow && secondRow) {
                    if (firstHeight > secondHeight) {
                        Ext.fly(secondRow).setHeight(firstHeight);
                    } else if (secondHeight > firstHeight) {
                        Ext.fly(firstRow).setHeight(secondHeight);
                    }
                }
            }
        }
    ],
    cellTpl: [
        '{%',
        'values.hideCell = values.tdAttr == "hidden";\n',
        '%}',
        '<tpl if="!hideCell">',
        '<td class="{tdCls}" role="{cellRole}" {tdAttr} {cellAttr:attributes}',
        ' style="width:{column.cellWidth}px;<tpl if="tdStyle">{tdStyle}</tpl>"',
        ' tabindex="-1" data-columnid="{[values.column.getItemId()]}">',
        '<div {unselectableAttr} class="' + Ext.baseCSSPrefix + 'grid-cell-inner {innerCls}" ',
        'style="text-align:{align};<tpl if="style">{style}</tpl>" ',
        '{cellInnerAttr:attributes}>{value}</div>',
        '</td>',
        '</tpl>',
        {
            priority: 0
        }
    ],
    rtlCellTpl: [
        '{%',
        'values.hideCell = values.tdAttr == "hidden";\n',
        '%}',
        '<tpl if="!hideCell">',
        '<td class="{tdCls}" role="{cellRole}" {tdAttr} {cellAttr:attributes}',
        ' style="width:{column.cellWidth}px;<tpl if="tdStyle">{tdStyle}</tpl>"',
        ' tabindex="-1" data-columnid="{[values.column.getItemId()]}">',
        '<div {unselectableAttr} class="' + Ext.baseCSSPrefix + 'grid-cell-inner {innerCls}" ',
        'style="text-align:{align};<tpl if="style">{style}</tpl>" ',
        '{cellInnerAttr:attributes}>{value}</div>',
        '</td>',
        '</tpl>',
        {
            priority: 200,
            rtlAlign: {
                right: 'left',
                left: 'right',
                center: 'center'
            },
            getAlign: function(align) {
                return this.rtlAlign[align];
            }
        }
    ],
    init: function(grid) {
        var me = this,
            view = me.view;
        me.callParent(arguments);
        // Add a table level processor
        view.addTpl(Ext.XTemplate.getTpl(me, 'outerTpl')).pivotViewFeature = me;
        // Add a row level processor
        view.addRowTpl(Ext.XTemplate.getTpl(me, 'rowTpl')).pivotViewFeature = me;
        view.preserveScrollOnRefresh = true;
        if (view.bufferedRenderer) {
            view.bufferedRenderer.variableRowHeight = true;
        } else {
            grid.variableRowHeight = view.variableRowHeight = true;
        }
    },
    destroy: function() {
        this.columns = null;
        this.callParent(arguments);
    },
    setup: function() {
        this.columns = this.view.getGridColumns();
    },
    isRTL: function() {
        var me = this,
            grid = me.gridMaster || me.grid;
        if (Ext.isFunction(grid.isLocalRtl)) {
            return grid.isLocalRtl();
        }
        return false;
    },
    getGridListeners: function() {
        var me = this;
        return Ext.apply(me.callParent(arguments) || {}, {
            beforerender: me.onBeforeGridRendered
        });
    },
    onBeforeGridRendered: function(grid) {
        var me = this;
        if (me.isRTL()) {
            me.view.addCellTpl(Ext.XTemplate.getTpl(me, 'rtlCellTpl'));
        } else {
            me.view.addCellTpl(Ext.XTemplate.getTpl(me, 'cellTpl'));
        }
    },
    vetoEvent: function(record, row, rowIndex, e) {
        // Do not veto mouseover/mouseout
        if (e.type !== 'mouseover' && e.type !== 'mouseout' && e.type !== 'mouseenter' && e.type !== 'mouseleave' && e.getTarget(this.eventSelector)) {
            return false;
        }
    },
    setupRowData: function(record, idx, rowValues) {
        var storeInfo = this.dataSource.storeInfo[record.internalId],
            rendererParams = storeInfo ? storeInfo.rendererParams : {};
        rowValues.rowClasses.length = 0;
        Ext.Array.insert(rowValues.rowClasses, 0, storeInfo ? storeInfo.rowClasses : []);
        this.setRenderers(rendererParams);
    },
    setRenderers: function(rendererParams) {
        Ext.Array.each(this.columns, function(column) {
            if (Ext.isDefined(rendererParams[column.dataIndex])) {
                column.savedRenderer = column.renderer;
                column.renderer = this[rendererParams[column.dataIndex].fn](Ext.apply({
                    renderer: column.savedRenderer
                }, rendererParams[column.dataIndex]));
            } else if (Ext.isDefined(rendererParams['topaxis'])) {
                column.savedRenderer = column.renderer;
                column.renderer = this[rendererParams['topaxis'].fn](Ext.apply({
                    renderer: column.savedRenderer
                }, rendererParams[column.dataIndex]));
            }
        }, this);
    },
    resetRenderers: function() {
        Ext.Array.each(this.columns, function(column) {
            if (Ext.isDefined(column.savedRenderer)) {
                column.renderer = column.savedRenderer;
                delete column.savedRenderer;
            }
        });
    },
    groupOutlineRenderer: function(config) {
        var me = this,
            prevRenderer = config['renderer'],
            group = config['group'],
            colspan = config['colspan'],
            hidden = config['hidden'],
            previousExpanded = config['previousExpanded'],
            subtotalRow = config['subtotalRow'];
        return function(value, metaData, record, rowIndex, colIndex, store, view) {
            if (Ext.isFunction(prevRenderer)) {
                value = prevRenderer.apply(this, arguments);
            }
            // the value has to be encoded to avoid messing up the DOM
            value = me.encodeValue(value, group);
            if (colspan > 0) {
                metaData.tdAttr = 'colspan = "' + colspan + '"';
                //metaData.tdCls = me.summaryTableTitleCls;
                metaData.tdCls = me.groupHeaderCls;
                if (!subtotalRow) {
                    metaData.tdCls += ' ' + me.groupHeaderCollapsibleCls;
                    if (!group.expanded) {
                        metaData.tdCls += ' ' + me.groupHeaderCollapsedCls;
                    }
                    if (previousExpanded) {
                        metaData.tdCls += ' ' + me.outlineCellGroupExpandedCls;
                    }
                }
                return '<div class="' + me.groupTitleCls + '">' + value + '</div>';
            }
            if (hidden) {
                metaData.tdAttr = 'hidden';
            }
            metaData.tdCls = me.outlineCellHiddenCls;
            return '';
        };
    },
    recordOutlineRenderer: function(config) {
        var me = this,
            prevRenderer = config['renderer'],
            group = config['group'],
            hidden = config['hidden'];
        return function(value, metaData, record, rowIndex, colIndex, store, view) {
            if (Ext.isFunction(prevRenderer)) {
                value = prevRenderer.apply(this, arguments);
            }
            // the value has to be encoded to avoid messing up the DOM
            value = me.encodeValue(value, group);
            if (hidden) {
                metaData.tdCls = me.outlineCellHiddenCls;
                // a class that hides the cell borders
                return '';
            }
            metaData.tdCls = me.groupHeaderCls + ' ' + me.groupTitleCls;
            return value;
        };
    },
    groupCompactRenderer: function(config) {
        var me = this,
            prevRenderer = config['renderer'],
            group = config['group'],
            colspan = config['colspan'],
            previousExpanded = config['previousExpanded'],
            subtotalRow = config['subtotalRow'];
        return function(value, metaData, record, rowIndex, colIndex, store, view) {
            if (Ext.isFunction(prevRenderer)) {
                value = prevRenderer.apply(this, arguments);
            }
            // the value has to be encoded to avoid messing up the DOM
            value = me.encodeValue(value, group);
            if (group.level > 0) {
                metaData.style = (me.isRTL() ? 'margin-right: ' : 'margin-left: ') + (me.compactLayoutPadding * group.level) + 'px;';
            }
            metaData.tdCls = me.groupHeaderCls + ' ' + me.compactGroupHeaderCls;
            if (!subtotalRow) {
                metaData.tdCls += ' ' + me.groupHeaderCollapsibleCls;
                if (!group.expanded) {
                    metaData.tdCls += ' ' + me.groupHeaderCollapsedCls;
                }
                if (previousExpanded) {
                    metaData.tdCls += ' ' + me.outlineCellGroupExpandedCls;
                }
            }
            return '<div class="' + me.groupTitleCls + '">' + value + '</div>';
        };
    },
    recordCompactRenderer: function(config) {
        var me = this,
            prevRenderer = config['renderer'],
            group = config['group'];
        return function(value, metaData, record, rowIndex, colIndex, store, view) {
            if (Ext.isFunction(prevRenderer)) {
                value = prevRenderer.apply(this, arguments);
            }
            // the value has to be encoded to avoid messing up the DOM
            value = me.encodeValue(value, group);
            if (group.level > 0) {
                metaData.style = (me.isRTL() ? 'margin-right: ' : 'margin-left: ') + (me.compactLayoutPadding * group.level) + 'px;';
            }
            metaData.tdCls = me.groupHeaderCls + ' ' + me.groupTitleCls + ' ' + me.compactGroupHeaderCls;
            return value;
        };
    },
    topAxisNoRenderer: function(config) {
        return function(value, metaData, record, rowIndex, colIndex, store, view) {
            return '';
        };
    },
    topAxisRenderer: function(config) {
        var me = this,
            prevRenderer = config['renderer'];
        return function(value, metaData, record, rowIndex, colIndex, store, view) {
            var hideValue = (value === 0 && me.gridMaster.showZeroAsBlank);
            if (Ext.isFunction(prevRenderer)) {
                value = prevRenderer.apply(this, arguments);
            }
            return hideValue ? '' : value;
        };
    },
    /**
     * @private
     * At some point maybe provide a way on the Dimension item to html encode the value?
     * @param value
     * @param group
     */
    encodeValue: function(value, group) {
        return value;
    }
});
//return Ext.String.htmlEncode(String(value));

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
        'Ext.util.DelayedTask',
        'Ext.data.ArrayStore'
    ],
    subGridXType: 'gridpanel',
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
    matrixConfig: null,
    /**
     * @cfg {Boolean} enableLoadMask Set this on false if you don't want to see the loading mask.
     */
    enableLoadMask: true,
    /**
     * @cfg {Boolean} enableLocking Set this on false if you don't want to lock the left axis columns.
     */
    enableLocking: false,
    /**
     * @cfg {Boolean} enableColumnSort Set this on false if you don't want to allow column sorting
     * in the pivot grid generated columns.
     */
    enableColumnSort: true,
    /**
     * @cfg {Boolean} columnLines Set this on false if you don't want to show the column lines.
     */
    columnLines: true,
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
     * @cfg {String} clsGroupTotal CSS class assigned to the group totals.
     */
    clsGroupTotal: Ext.baseCSSPrefix + 'pivot-grid-group-total',
    /**
     * @cfg {String} clsGrandTotal CSS class assigned to the grand totals.
     */
    clsGrandTotal: Ext.baseCSSPrefix + 'pivot-grid-grand-total',
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
        'pivotgroupexpand',
        'pivotgroupcollapse',
        'pivotdone'
    ],
    isPivotGrid: true,
    /**
     * @private
     */
    initComponent: function() {
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
    preInitialize: function() {
        var me = this;
        me.features = [
            {
                id: 'group',
                ftype: 'pivotview',
                summaryRowCls: me.clsGroupTotal,
                grandSummaryRowCls: me.clsGrandTotal
            }
        ];
        me.addCls(Ext.baseCSSPrefix + 'pivot-grid');
        if (me.store) {
            me.originalStore = me.store;
        }
        // create a grid store that will be reconfigured whenever the matrix store changes
        me.store = Ext.create('Ext.data.ArrayStore', {
            fields: []
        });
        me.enableColumnMove = false;
        me.delayedTask = new Ext.util.DelayedTask(me.refreshView, me);
    },
    /**
     * @private
     */
    postInitialize: function() {
        var me = this,
            matrixConfig = {},
            headerListener = {
                headerclick: me.onHeaderClick,
                scope: me,
                destroyable: true
            };
        if (me.enableLocking) {
            me.lockedHeaderCtListeners = me.getView().lockedView.getHeaderCt().on(headerListener);
            me.headerCtListeners = me.getView().normalView.getHeaderCt().on(headerListener);
        } else {
            me.headerCtListeners = me.getView().getHeaderCt().on(headerListener);
        }
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
         * @event pivotgroupexpand
         * @param {String} type  Either 'row' or 'col'
         * @param {Ext.pivot.axis.Item} group The axis item
         */
        /**
         * Fires when a pivot group is collapsed. Could be a row or col pivot group.
         * @event pivotgroupcollapse
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
         * @param {String} params.topKey Key of the top axis item
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
         * @param {String} params.topKey Key of the top axis item
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
         * @param {String} params.topKey Key of the top axis item
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
         * @param {String} params.topKey Key of the top axis item
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
         * @param {String} params.topKey Key of the top axis item
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
         * @param {String} params.topKey Key of the top axis item
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
        Ext.applyIf(matrixConfig, me.matrixConfig || {});
        Ext.applyIf(matrixConfig, {
            type: 'local'
        });
        // just a bit of hardcoding for old version compatibility
        if (matrixConfig.type == 'local' && me.originalStore) {
            Ext.applyIf(matrixConfig, {
                store: me.originalStore
            });
        }
        me.matrix = Ext.Factory.pivotmatrix(matrixConfig);
        me.matrixListeners = me.matrix.on({
            cleardata: me.onMatrixClearData,
            start: me.onMatrixProcessStart,
            progress: me.onMatrixProcessProgress,
            done: me.onMatrixDataReady,
            beforeupdate: me.onMatrixBeforeUpdate,
            afterupdate: me.onMatrixAfterUpdate,
            scope: me,
            destroyable: true
        });
        me.matrixRelayedListeners = me.relayEvents(me.matrix, [
            'start',
            'progress',
            'done',
            'modelbuilt',
            'columnsbuilt',
            'recordbuilt',
            'buildtotals',
            'storebuilt',
            'beforerequest',
            'requestexception'
        ], 'pivot');
    },
    destroy: function() {
        var me = this;
        me.delayedTask.cancel();
        Ext.destroy(me.matrixRelayedListeners, me.matrixListeners, me.headerCtListeners, me.lockedHeaderCtListeners);
        Ext.destroy(me.matrix, me.delayedTask, me.originalStore);
        me.matrixRelayedListeners = me.matrixListeners = me.headerCtListeners = me.lockedHeaderCtListeners = null;
        me.matrix = me.delayedTask = me.originalStore = null;
        me.callParent(arguments);
        Ext.destroy(me.store);
        me.store = null;
    },
    afterRender: function() {
        this.reconfigurePivot();
        this.callParent(arguments);
    },
    /**
     * Refresh the view.
     *
     * @private
     */
    refreshView: function() {
        var me = this,
            columns;
        if (me.scheduledReconfigure === true) {
            me.scheduledReconfigure = false;
            columns = me.getMatrix().getColumnHeaders();
            me.preparePivotColumns(columns);
            me.restorePivotColumnsState(columns);
            me.reconfigure(undefined, columns);
        }
        me.store.fireEvent('pivotstoreremodel', me);
    },
    /**
     * @private
     *
     */
    onMatrixClearData: function() {
        var me = this;
        me.store.removeAll(true);
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
            this.setLoading(true);
        }
    },
    /**
     * @private
     *
     */
    onMatrixProcessProgress: function(matrix, index, length) {
        var me = this,
            percent = ((index || 0.1) * 100) / (length || 0.1),
            pEl;
        if (me.loadMask) {
            if (me.loadMask.msgTextEl) {
                pEl = me.loadMask.msgTextEl;
            } else if (me.loadMask.msgEl) {
                pEl = me.loadMask.msgEl;
            }
            if (pEl) {
                pEl.update(Ext.util.Format.number(percent, '0') + '%');
            }
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
        this.store.suspendEvents();
    },
    /**
     * @private
     *
     */
    onMatrixAfterUpdate: function() {
        var me = this;
        me.store.resumeEvents();
        me.store.fireEvent('pivotstoreremodel');
    },
    /**
     * @private
     *
     */
    onMatrixDataReady: function() {
        var me = this,
            cols = me.matrix.getColumnHeaders(),
            stateApplied = false;
        if (me.enableLoadMask) {
            me.setLoading(false);
        }
        if (me.expandedItemsState) {
            me.matrix.leftAxis.items.each(function(item) {
                if (Ext.Array.indexOf(me.expandedItemsState['rows'], item.key) >= 0) {
                    item.expanded = true;
                    stateApplied = true;
                }
            });
            me.matrix.topAxis.items.each(function(item) {
                if (Ext.Array.indexOf(me.expandedItemsState['cols'], item.key) >= 0) {
                    item.expanded = true;
                    stateApplied = true;
                }
            });
            if (stateApplied) {
                cols = me.matrix.getColumnHeaders();
                delete me.expandedItemsState;
            }
        } else {
            me.doExpandCollapseTree(me.matrix.leftAxis.getTree(), !me.startRowGroupsCollapsed);
            me.doExpandCollapseTree(me.matrix.topAxis.getTree(), !me.startColGroupsCollapsed);
            cols = me.matrix.getColumnHeaders();
        }
        me.preparePivotColumns(cols);
        me.restorePivotColumnsState(cols);
        me.reconfigure(undefined, cols);
        if (!Ext.isEmpty(me.sortedColumn)) {
            me.matrix.leftAxis.sortTreeByField(me.sortedColumn.dataIndex, me.sortedColumn.direction);
        }
        me.store.fireEvent('pivotstoreremodel', me);
        if (!Ext.isEmpty(me.sortedColumn)) {
            me.updateColumnSortState(me.sortedColumn.dataIndex, me.sortedColumn.direction);
        }
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
                column.locked = me.enableLocking;
            }
            //else leave it as it is
            if (column.subTotal) {
                column.cls = column.tdCls = me.clsGroupTotal;
            }
            if (column.grandTotal) {
                column.cls = column.tdCls = me.clsGrandTotal;
            }
            if (!column.xexpanded) {
                column.cls += ' ' + Ext.baseCSSPrefix + 'grid-row-collapsed';
            }
            if (column.xcollapsible) {
                column.text = Ext.String.format('<span class="' + Ext.baseCSSPrefix + 'grid-row-expander" style="padding-left: 13px">{0}</span>', column.text);
            }
            if (Ext.isEmpty(column.columns)) {
                if (column.dimension) {
                    column.renderer = column.dimension ? column.dimension.renderer : false;
                    column.align = column.dimension.align;
                    if (column.dimension.flex > 0) {
                        column.flex = column.flex || column.dimension.flex;
                    } else {
                        column.width = column.width || column.dimension.width;
                    }
                }
            } else {
                me.preparePivotColumns(column.columns);
            }
        }
    },
    /**
     * If you want to reconfigure the pivoting parameters then use this function.
     * If you use a local matrix then send the new store here too.
     * The config object is used to reconfigure the matrix object.
     *
     * @param config
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
     * Returns the matrix object that does all calculations
     * @returns {Ext.pivot.matrix.Base}
     *
     */
    getMatrix: function() {
        return this.matrix;
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
        var me = this,
            item;
        if (!me.matrix) {
            // nothing to do
            return;
        }
        item = (type == 'row' ? me.matrix.leftAxis : me.matrix.topAxis)['findTreeElement']('key', groupId);
        if (!item) {
            return;
        }
        state = Ext.isDefined(state) ? state : !item.node.expanded;
        if (includeChildren === true) {
            me.doExpandCollapseTree([
                item.node
            ], state);
        } else {
            item.node.expanded = state;
        }
        if (type == 'col') {
            me.scheduledReconfigure = true;
        }
        me.refreshView();
        // fire the pivotgroupexpand or pivotgroupcollapse event
        me.fireEvent((item.node.expanded ? 'pivotgroupexpand' : 'pivotgroupcollapse'), me, type, item.node);
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
        var me = this;
        me.expandAllColumns();
        me.expandAllRows();
    },
    /**
     * Expand all row groups
     *
     */
    expandAllRows: function() {
        var me = this;
        if (!me.getMatrix())  {
            return;
        }
        
        me.doExpandCollapseTree(me.getMatrix().leftAxis.getTree(), true);
        me.delayedTask.delay(10);
    },
    /**
     * Expand all column groups
     *
     */
    expandAllColumns: function() {
        var me = this;
        if (!me.getMatrix())  {
            return;
        }
        
        me.doExpandCollapseTree(me.getMatrix().topAxis.getTree(), true);
        me.scheduledReconfigure = true;
        me.delayedTask.delay(10);
    },
    /**
     * Collapse all groups.
     *
     */
    collapseAll: function() {
        var me = this;
        me.collapseAllRows();
        me.collapseAllColumns();
    },
    /**
     * Collapse all row groups
     *
     */
    collapseAllRows: function() {
        var me = this;
        if (!me.getMatrix())  {
            return;
        }
        
        me.doExpandCollapseTree(me.getMatrix().leftAxis.getTree(), false);
        me.delayedTask.delay(10);
    },
    /**
     * Collapse all column groups
     *
     */
    collapseAllColumns: function() {
        var me = this;
        if (!me.getMatrix())  {
            return;
        }
        
        me.doExpandCollapseTree(me.getMatrix().topAxis.getTree(), false);
        me.scheduledReconfigure = true;
        me.delayedTask.delay(10);
    },
    /**
     * Set a new store to pivot. This function is also used by the model binding in ExtJS 5.x.
     */
    setStore: function(store) {
        this.reconfigurePivot({
            store: store
        });
    },
    /**
     *     Returns the original store with the data to process.
     *    @returns {Ext.data.Store}
     */
    getStore: function() {
        var me = this,
            matrix = me.getMatrix();
        return ((matrix instanceof Ext.pivot.matrix.Local) ? matrix.store : me.originalStore) || me.store;
    },
    /**
     *    Returns the pivot store with the aggregated values
     *    @returns {Ext.data.Store}
     */
    getPivotStore: function() {
        return this.store;
    },
    /**
     * Returns the top axis item used to generate the specified column.
     *
     * @param column {Ext.grid.column.Column}
     */
    getTopAxisItem: function(column) {
        var me = this,
            matrix = me.getMatrix(),
            columns = matrix.getColumns(),
            key, i;
        if (!column) {
            return null;
        }
        for (i = 0; i < columns.length; i++) {
            if (columns[i].name === column.dataIndex) {
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
    getLeftAxisItem: function(record) {
        var me = this,
            view = me.getView(),
            info, feature;
        if (!record) {
            return null;
        }
        view = view.normalView || view;
        feature = view.getFeature('group');
        if (!feature) {
            return null;
        }
        info = feature.dataSource.storeInfo[record.internalId];
        return info ? me.getMatrix().leftAxis.items.getByKey(info.leftKey) : null;
    },
    /**
     * @private
     */
    onHeaderClick: function(ct, column, e) {
        var me = this,
            columns, el,
            sortState = (column.sortState ? (column.sortState == 'ASC' ? 'DESC' : 'ASC') : 'ASC');
        if (!me.enableColumnSort) {
            return;
        }
        if (!column.xexpandable) {
            if (e) {
                e.stopEvent();
            }
            if ((column.leftAxis || column.topAxis) && !Ext.isEmpty(column.dataIndex)) {
                // sort the results when a dataIndex column was clicked
                if (me.getMatrix().leftAxis.sortTreeByField(column.dataIndex, sortState)) {
                    me.refreshView();
                    me.updateColumnSortState(column, sortState);
                }
            }
            return false;
        }
        me.doExpandCollapse('col', column.key);
        if (e)  {
            e.stopEvent();
        }
        
    },
    updateColumnSortState: function(column, sortState) {
        if (Ext.isString(column)) {
            column = this.down('[dataIndex="' + column + '"]');
        }
        if (!column) {
            return;
        }
        // we need to create a dummy sorter object to be able to change the column styling
        column.setSortState(new Ext.util.Sorter({
            direction: sortState,
            property: 'dummy'
        }));
        column.sortState = sortState;
        this.sortedColumn = {
            dataIndex: column.dataIndex,
            direction: sortState
        };
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
     * Applies the saved state of the pivot grid
     */
    applyState: function(state) {
        var me = this,
            props = me.getStateProperties(),
            i;
        for (i = 0; i < props.length; i++) {
            if (state[props[i]]) {
                me[props[i]] = state[props[i]];
            }
        }
        if (state['expandedItems']) {
            me.expandedItemsState = state['expandedItems'];
        }
        me.lastColumnsState = state['pivotcolumns'] || {};
        if (me.rendered) {
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
    getState: function() {
        var me = this,
            state = {},
            props = me.getStateProperties(),
            i;
        for (i = 0; i < props.length; i++) {
            state[props[i]] = me[props[i]];
        }
        // save the state of all expanded axis groups
        state['expandedItems'] = {
            cols: [],
            rows: []
        };
        me.matrix.leftAxis.items.each(function(item) {
            if (item.expanded) {
                state['expandedItems']['rows'].push(item.key);
            }
        });
        me.matrix.topAxis.items.each(function(item) {
            if (item.expanded) {
                state['expandedItems']['cols'].push(item.key);
            }
        });
        // to be able to restore the width/flex of the left axis columns we need the IDs
        me.matrix.leftAxis.dimensions.each(function(item, index) {
            state['leftAxis'][index]['id'] = item.getId();
        });
        state['pivotcolumns'] = me.getPivotColumnsState();
        return state;
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
        cols = me.getView().getGridColumns();
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
    }
});

/**
 *
 * This is the window that allows configuring a label filter
 *
 * @private
 *
 */
Ext.define('Ext.pivot.plugin.configurator.FilterLabelWindow', {
    extend: 'Ext.window.Window',
    requires: [
        'Ext.form.Panel',
        'Ext.form.FieldContainer',
        'Ext.form.field.Text',
        'Ext.form.field.Hidden',
        'Ext.form.field.ComboBox',
        'Ext.layout.container.HBox'
    ],
    modal: true,
    closeAction: 'destroy',
    titleText: 'Label filter ({0})',
    fieldText: 'Show items for which the label',
    caseSensitiveText: 'Case sensitive',
    initComponent: function() {
        var me = this,
            items = [];
        items = me.filterFields || [];
        items.push({
            xtype: 'combo',
            editable: false,
            queryMode: 'local',
            valueField: 'value',
            store: me.store,
            name: 'operator',
            listeners: {
                change: function(combo, newValue) {
                    var me = this,
                        hidden = me.isOperatorBetween(newValue);
                    me.down('#fValue').setVisible(!hidden);
                    me.down('#fValue').allowBlank = hidden;
                    me.down('#fFrom').setVisible(hidden);
                    me.down('#fFrom').allowBlank = !hidden;
                    me.down('#fTo').setVisible(hidden);
                    me.down('#fTo').allowBlank = !hidden;
                },
                scope: me
            }
        }, {
            itemId: 'fValue',
            xtype: 'textfield',
            margin: '0 0 0 5',
            name: 'value'
        }, {
            itemId: 'fFrom',
            xtype: 'textfield',
            margin: '0 0 0 5',
            name: 'from'
        }, {
            itemId: 'fTo',
            xtype: 'textfield',
            margin: '0 0 0 5',
            name: 'to'
        });
        Ext.apply(me, {
            title: Ext.String.format(me.titleText, me.title),
            layout: 'fit',
            items: [
                {
                    xtype: 'form',
                    bodyPadding: 5,
                    items: [
                        {
                            xtype: 'hidden',
                            name: 'type'
                        },
                        {
                            xtype: 'fieldcontainer',
                            labelSeparator: '',
                            fieldLabel: me.fieldText,
                            labelAlign: 'top',
                            layout: {
                                type: 'hbox',
                                align: 'stretch'
                            },
                            defaults: {
                                allowBlank: false,
                                flex: 1
                            },
                            items: items
                        },
                        {
                            xtype: 'checkbox',
                            boxLabel: me.caseSensitiveText,
                            name: 'caseSensitive'
                        }
                    ]
                }
            ],
            buttons: [
                {
                    text: Ext.Msg.buttonText.ok,
                    handler: me.applyFilter,
                    scope: me
                },
                {
                    text: Ext.Msg.buttonText.cancel,
                    handler: me.cancelFilter,
                    scope: me
                }
            ]
        });
        me.callParent(arguments);
    },
    applyFilter: function() {
        var form = this.down('form').getForm(),
            filter;
        if (form.isValid()) {
            filter = form.getValues();
            if (this.isOperatorBetween(filter.operator)) {
                filter.value = [
                    filter.from,
                    filter.to
                ];
            }
            delete (filter.from);
            delete (filter.to);
            filter.caseSensitive = (filter.caseSensitive === 'on');
            filter.topSort = (filter.topSort === 'on');
            this.fireEvent('filter', this, filter);
        }
    },
    cancelFilter: function() {
        this.close();
    },
    isOperatorBetween: function(operator) {
        return Ext.Array.indexOf([
            'between',
            'not between'
        ], operator) >= 0;
    }
});

/**
 *
 * This is the window that allows configuring a value filter
 *
 * @private
 *
 */
Ext.define('Ext.pivot.plugin.configurator.FilterValueWindow', {
    extend: 'Ext.pivot.plugin.configurator.FilterLabelWindow',
    titleText: 'Value filter ({0})',
    fieldText: 'Show items for which',
    initComponent: function() {
        var me = this;
        me.filterFields = [
            {
                xtype: 'combo',
                editable: false,
                queryMode: 'local',
                valueField: 'value',
                store: me.storeAgg,
                name: 'dimensionId'
            }
        ];
        me.callParent(arguments);
    }
});

/**
 *
 * This is the window that allows configuring a top10 value filter
 *
 * @private
 *
 */
Ext.define('Ext.pivot.plugin.configurator.FilterTopWindow', {
    extend: 'Ext.window.Window',
    requires: [
        'Ext.form.Panel',
        'Ext.form.FieldContainer',
        'Ext.form.field.Text',
        'Ext.form.field.Hidden',
        'Ext.form.field.ComboBox',
        'Ext.layout.container.HBox'
    ],
    modal: true,
    closeAction: 'destroy',
    titleText: 'Top 10 filter ({0})',
    fieldText: 'Show',
    sortResultsText: 'Sort results',
    initComponent: function() {
        var me = this,
            items = [];
        items.push({
            xtype: 'combo',
            editable: false,
            queryMode: 'local',
            valueField: 'value',
            store: me.storeTopOrder,
            name: 'topOrder'
        }, {
            xtype: 'textfield',
            margin: '0 0 0 5',
            name: 'value'
        }, {
            xtype: 'combo',
            margin: '0 0 0 5',
            editable: false,
            queryMode: 'local',
            valueField: 'value',
            store: me.storeTopType,
            name: 'topType'
        }, {
            xtype: 'combo',
            margin: '0 0 0 5',
            editable: false,
            queryMode: 'local',
            valueField: 'value',
            store: me.storeAgg,
            name: 'dimensionId'
        });
        Ext.apply(me, {
            title: Ext.String.format(me.titleText, me.title),
            layout: 'fit',
            items: [
                {
                    xtype: 'form',
                    bodyPadding: 5,
                    defaults: {
                        allowBlank: false
                    },
                    items: [
                        {
                            xtype: 'hidden',
                            name: 'type'
                        },
                        {
                            xtype: 'hidden',
                            name: 'operator'
                        },
                        {
                            xtype: 'fieldcontainer',
                            labelSeparator: '',
                            fieldLabel: me.fieldText,
                            labelAlign: 'top',
                            layout: {
                                type: 'hbox',
                                align: 'stretch'
                            },
                            defaults: {
                                flex: 1,
                                allowBlank: false
                            },
                            items: items
                        },
                        {
                            xtype: 'checkbox',
                            boxLabel: me.sortResultsText,
                            name: 'topSort'
                        }
                    ]
                }
            ],
            buttons: [
                {
                    text: Ext.Msg.buttonText.ok,
                    handler: me.applyFilter,
                    scope: me
                },
                {
                    text: Ext.Msg.buttonText.cancel,
                    handler: me.cancelFilter,
                    scope: me
                }
            ]
        });
        me.callParent(arguments);
    },
    applyFilter: function() {
        var form = this.down('form').getForm();
        if (form.isValid()) {
            this.fireEvent('filter', this, form.getValues());
        }
    },
    cancelFilter: function() {
        this.close();
    }
});

/**
 *
 * This class is used for creating a configuration field.
 *
 * @private
 *
 */
Ext.define('Ext.pivot.plugin.configurator.Column', {
    extend: 'Ext.Component',
    requires: [
        'Ext.menu.Menu',
        'Ext.menu.CheckItem',
        'Ext.menu.Item',
        'Ext.menu.Separator',
        'Ext.pivot.plugin.configurator.FilterLabelWindow',
        'Ext.pivot.plugin.configurator.FilterValueWindow',
        'Ext.pivot.plugin.configurator.FilterTopWindow'
    ],
    alias: 'widget.pivotconfigcolumn',
    childEls: [
        'textCol',
        'filterCol',
        'sortCol'
    ],
    renderTpl: '<div id="{id}-configCol" class="' + Ext.baseCSSPrefix + 'pivot-grid-config-column-inner">' + '<tpl if="isCustomizable">' + '<span id={id}-customCol class="' + Ext.baseCSSPrefix + 'pivot-grid-config-column-btn-customize ' + Ext.baseCSSPrefix + 'border-box ' + Ext.baseCSSPrefix + 'pivot-grid-config-column-btn ' + Ext.baseCSSPrefix + 'pivot-grid-config-column-btn-image"></span>' + '</tpl>' + '<span id={id}-sortCol data-ref="sortCol" class="' + Ext.baseCSSPrefix + 'border-box ' + Ext.baseCSSPrefix + 'pivot-grid-config-column-btn"></span>' + '<span id={id}-filterCol data-ref="filterCol" class="' + Ext.baseCSSPrefix + 'border-box ' + Ext.baseCSSPrefix + 'pivot-grid-config-column-btn"></span>' + '<span id="{id}-textCol" data-ref="textCol" data-qtip="{header}{aggregator}" class="' + Ext.baseCSSPrefix + 'pivot-grid-config-column-text ' + Ext.baseCSSPrefix + 'column-header-text ' + Ext.baseCSSPrefix + 'border-box">' + '{header}{aggregator}' + '</span>' + '</div>',
    header: '&#160;',
    isCustomizable: false,
    dimension: null,
    isAgg: false,
    sumText: 'Sum',
    avgText: 'Avg',
    countText: 'Count',
    minText: 'Min',
    maxText: 'Max',
    groupSumPercentageText: 'Group sum percentage',
    groupCountPercentageText: 'Group count percentage',
    varText: 'Var',
    varPText: 'Varp',
    stdDevText: 'StdDev',
    stdDevPText: 'StdDevp',
    sortAscText: 'Sort A to Z',
    sortDescText: 'Sort Z to A',
    sortClearText: 'Disable sorting',
    clearFilterText: 'Clear filter from "{0}"',
    labelFiltersText: 'Label filters',
    valueFiltersText: 'Value filters',
    equalsText: 'Equals...',
    doesNotEqualText: 'Does not equal...',
    beginsWithText: 'Begins with...',
    doesNotBeginWithText: 'Does not begin with...',
    endsWithText: 'Ends with...',
    doesNotEndWithText: 'Does not end with...',
    containsText: 'Contains...',
    doesNotContainText: 'Does not contain...',
    greaterThanText: 'Greater than...',
    greaterThanOrEqualToText: 'Greater than or equal to...',
    lessThanText: 'Less than...',
    lessThanOrEqualToText: 'Less than or equal to...',
    betweenText: 'Between...',
    notBetweenText: 'Not between...',
    top10Text: 'Top 10...',
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
    top10LText: 'Top 10...',
    topOrderTopText: 'Top',
    topOrderBottomText: 'Bottom',
    topTypeItemsText: 'Items',
    topTypePercentText: 'Percent',
    topTypeSumText: 'Sum',
    baseCls: Ext.baseCSSPrefix + 'pivot-grid-config-column',
    btnIconCls: Ext.baseCSSPrefix + 'pivot-grid-config-column-btn-image',
    setFilterIconCls: Ext.baseCSSPrefix + 'pivot-grid-config-column-btn-filter-set',
    clearFilterIconCls: Ext.baseCSSPrefix + 'pivot-grid-config-column-btn-filter-clear',
    ascSortIconCls: Ext.baseCSSPrefix + 'pivot-grid-config-column-btn-sort-asc',
    descSortIconCls: Ext.baseCSSPrefix + 'pivot-grid-config-column-btn-sort-desc',
    clearSortIconCls: Ext.baseCSSPrefix + 'pivot-grid-config-column-btn-sort-clear',
    /**
     * Fires when user changes sorting on this field
     *
     * @event sortchange
     * @param {Ext.pivot.plugin.configurator.Column} col
     * @param {String} direction
     * @private
     */
    /**
     * Fires when user changes the filter on this field
     *
     * @event filterchange
     * @param {Ext.pivot.plugin.configurator.Column} col
     * @param {Object} filter
     * @private
     */
    destroy: function() {
        var me = this;
        Ext.destroyMembers(me, 'relayers', 'menu');
        me.dimension = me.relayers = me.menu = null;
        me.callParent(arguments);
    },
    initRenderData: function() {
        var me = this;
        return Ext.apply(me.callParent(arguments), {
            header: me.dimension.header,
            aggregator: me.isAgg ? ' (' + me.dimension.aggregator + ')' : '',
            dimension: me.dimension,
            isCustomizable: me.isCustomizable
        });
    },
    afterRender: function() {
        var me = this;
        me.callParent();
        if (me.isCustomizable) {
            if (!me.isAgg && (!Ext.isDefined(me.dimension.sortable) || me.dimension.sortable)) {
                me.addSortCls(me.dimension.direction);
            }
            if (me.dimension.filter) {
                me.addFilterCls();
            }
            me.mon(me.getTargetEl(), {
                scope: me,
                click: me.handleColClick
            });
        }
    },
    handleColClick: function(e, t) {
        // handles grid column sorting
        var me = this;
        if (me.isAgg) {
            me.showAggMenu();
            e.stopEvent();
        } else {
            me.showColMenu();
        }
    },
    handleMenuClick: function(item, e) {
        var me = this,
            method;
        me.dimension.aggregator = item.aggregator;
        if (me.textCol) {
            method = me.textCol.setHtml ? 'setHtml' : 'setHTML';
            me.textCol[method](me.header + ' (' + me.dimension.aggregator + ')');
        }
        me.ownerCt.updateLayout();
        me.fireEvent('configchange');
    },
    addSortCls: function(direction) {
        var me = this;
        if (!me.sortCol) {
            return;
        }
        if (direction === 'ASC' || !direction) {
            me.sortCol.addCls(me.ascSortIconCls);
            me.sortCol.removeCls(me.descSortIconCls);
        } else {
            me.sortCol.addCls(me.descSortIconCls);
            me.sortCol.removeCls(me.ascSortIconCls);
        }
        me.sortCol.addCls(me.btnIconCls);
    },
    removeSortCls: function(direction) {
        var me = this;
        if (!me.sortCol) {
            return;
        }
        if (direction === 'ASC') {
            me.sortCol.removeCls(me.ascSortIconCls);
        } else {
            me.sortCol.removeCls(me.descSortIconCls);
        }
        me.sortCol.removeCls(me.btnIconCls);
    },
    addFilterCls: function() {
        var me = this;
        if (me.filterCol && !me.filterCol.hasCls(me.setFilterIconCls)) {
            me.filterCol.addCls(me.setFilterIconCls);
            me.filterCol.addCls(me.btnIconCls);
        }
    },
    removeFilterCls: function() {
        var me = this;
        if (me.filterCol) {
            me.filterCol.removeCls(me.setFilterIconCls);
            me.filterCol.removeCls(me.btnIconCls);
        }
    },
    serialize: function() {
        var me = this;
        return Ext.applyIf({
            idColumn: me.id
        }, me.initialConfig);
    },
    showAggMenu: function() {
        var me = this,
            aggregator = me.dimension.aggregator;
        //create a menu with possible aggregate functions
        Ext.destroy(me.menu);
        me.menu = Ext.create('Ext.menu.Menu', {
            floating: true,
            defaults: {
                handler: me.handleMenuClick,
                scope: me,
                xtype: 'menucheckitem',
                group: 'aggregator'
            },
            items: [
                {
                    text: me.sumText,
                    aggregator: 'sum',
                    checked: aggregator == 'sum'
                },
                {
                    text: me.avgText,
                    aggregator: 'avg',
                    checked: aggregator == 'avg'
                },
                {
                    text: me.countText,
                    aggregator: 'count',
                    checked: aggregator == 'count'
                },
                {
                    text: me.maxText,
                    aggregator: 'max',
                    checked: aggregator == 'max'
                },
                {
                    text: me.minText,
                    aggregator: 'min',
                    checked: aggregator == 'min'
                },
                {
                    text: me.groupSumPercentageText,
                    aggregator: 'groupSumPercentage',
                    checked: aggregator == 'groupSumPercentage'
                },
                {
                    text: me.groupCountPercentageText,
                    aggregator: 'groupCountPercentage',
                    checked: aggregator == 'groupCountPercentage'
                },
                {
                    text: me.stdDevText,
                    aggregator: 'stdDev',
                    checked: aggregator == 'stdDev'
                },
                {
                    text: me.stdDevPText,
                    aggregator: 'stdDevP',
                    checked: aggregator == 'stdDevP'
                },
                {
                    text: me.varText,
                    aggregator: 'variance',
                    checked: aggregator == 'variance'
                },
                {
                    text: me.varPText,
                    aggregator: 'varianceP',
                    checked: aggregator == 'varianceP'
                }
            ]
        });
        me.menu.showBy(me);
    },
    showColMenu: function() {
        var me = this,
            items = [],
            labelItems, valueItems, commonItems, i,
            filter = me.dimension.filter;
        Ext.destroy(me.menu);
        // check if the dimension is sortable
        items.push({
            text: me.sortAscText,
            direction: 'ASC',
            iconCls: me.ascSortIconCls,
            handler: me.sortMe
        }, {
            text: me.sortDescText,
            direction: 'DESC',
            iconCls: me.descSortIconCls,
            handler: me.sortMe
        }, {
            text: me.sortClearText,
            direction: '',
            disabled: me.dimension.sortable === false,
            iconCls: me.clearSortIconCls,
            handler: me.sortMe
        }, {
            xtype: 'menuseparator'
        });
        commonItems = [
            {
                text: me.equalsText,
                operator: '='
            },
            {
                text: me.doesNotEqualText,
                operator: '!='
            },
            {
                xtype: 'menuseparator'
            },
            {
                text: me.greaterThanText,
                operator: '>'
            },
            {
                text: me.greaterThanOrEqualToText,
                operator: '>='
            },
            {
                text: me.lessThanText,
                operator: '<'
            },
            {
                text: me.lessThanOrEqualToText,
                operator: '<='
            },
            {
                xtype: 'menuseparator'
            },
            {
                text: me.betweenText,
                operator: 'between'
            },
            {
                text: me.notBetweenText,
                operator: 'not between'
            }
        ];
        labelItems = Ext.clone(commonItems);
        Ext.Array.insert(labelItems, 3, [
            {
                text: me.beginsWithText,
                operator: 'begins'
            },
            {
                text: me.doesNotBeginWithText,
                operator: 'not begins'
            },
            {
                text: me.endsWithText,
                operator: 'ends'
            },
            {
                text: me.doesNotEndWithText,
                operator: 'not ends'
            },
            {
                xtype: 'menuseparator'
            },
            {
                text: me.containsText,
                operator: 'contains'
            },
            {
                text: me.doesNotContainText,
                operator: 'not contains'
            },
            {
                xtype: 'menuseparator'
            }
        ]);
        for (i = 0; i < labelItems.length; i++) {
            labelItems[i]['checked'] = (filter && filter.type == 'label' && filter.operator == labelItems[i].operator);
        }
        valueItems = Ext.clone(commonItems);
        valueItems.push({
            xtype: 'menuseparator'
        }, {
            text: me.top10Text,
            operator: 'top10'
        });
        for (i = 0; i < valueItems.length; i++) {
            valueItems[i]['checked'] = (filter && filter.type == 'value' && filter.operator == valueItems[i].operator);
        }
        items.push({
            text: Ext.String.format(me.clearFilterText, me.header),
            iconCls: me.clearFilterIconCls,
            disabled: !filter,
            handler: me.onRemoveFilter
        }, {
            text: me.labelFiltersText,
            menu: {
                defaults: {
                    handler: me.onShowFilter,
                    scope: me,
                    xtype: 'menucheckitem',
                    group: 'filterlabel',
                    type: 'label'
                },
                items: labelItems
            }
        }, {
            text: me.valueFiltersText,
            menu: {
                defaults: {
                    handler: me.onShowFilter,
                    scope: me,
                    xtype: 'menucheckitem',
                    group: 'filtervalue',
                    type: 'value'
                },
                items: valueItems
            }
        });
        me.menu = Ext.create('Ext.menu.Menu', {
            floating: true,
            defaults: {
                scope: me
            },
            items: items
        });
        me.menu.showBy(me);
    },
    sortMe: function(btn) {
        var me = this;
        if (Ext.isEmpty(btn.direction)) {
            //disable sorting
            me.dimension.sortable = false;
            me.removeSortCls(me.dimension.direction);
        } else {
            me.dimension.sortable = true;
            me.addSortCls(btn.direction);
            me.dimension.direction = btn.direction;
        }
        me.fireEvent('sortchange', me, btn.direction);
    },
    onShowFilter: function(btn) {
        var me = this,
            win, winClass,
            winCfg = {},
            data, dataAgg,
            filter = me.dimension.filter,
            values = {
                type: btn.type,
                operator: btn.operator,
                value: (filter ? filter.value : ''),
                from: (filter ? (Ext.isArray(filter.value) ? filter.value[0] : '') : ''),
                to: (filter ? (Ext.isArray(filter.value) ? filter.value[1] : '') : ''),
                caseSensitive: (filter ? filter.caseSensitive : false),
                topSort: (filter ? filter.topSort : false)
            };
        dataAgg = [];
        Ext.each(me.ownerCt.aggregateDimensions, function(field) {
            dataAgg.push([
                field.header,
                field.id
            ]);
        });
        if (btn.type == 'label' || (btn.type == 'value' && btn.operator != 'top10')) {
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
            if (btn.type == 'label') {
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
                winClass = 'Ext.pivot.plugin.configurator.FilterLabelWindow';
            } else {
                winClass = 'Ext.pivot.plugin.configurator.FilterValueWindow';
                Ext.apply(values, {
                    dimensionId: (filter ? filter.dimensionId : '')
                });
                winCfg.storeAgg = Ext.create('Ext.data.ArrayStore', {
                    fields: [
                        'text',
                        'value'
                    ],
                    data: dataAgg
                });
            }
            winCfg.store = Ext.create('Ext.data.ArrayStore', {
                fields: [
                    'text',
                    'value'
                ],
                data: data
            });
        } else {
            winClass = 'Ext.pivot.plugin.configurator.FilterTopWindow';
            data = [];
            Ext.apply(winCfg, {
                storeTopOrder: Ext.create('Ext.data.ArrayStore', {
                    fields: [
                        'text',
                        'value'
                    ],
                    data: [
                        [
                            me.topOrderTopText,
                            'top'
                        ],
                        [
                            me.topOrderBottomText,
                            'bottom'
                        ]
                    ]
                }),
                storeTopType: Ext.create('Ext.data.ArrayStore', {
                    fields: [
                        'text',
                        'value'
                    ],
                    data: [
                        [
                            me.topTypeItemsText,
                            'items'
                        ],
                        [
                            me.topTypePercentText,
                            'percent'
                        ],
                        [
                            me.topTypeSumText,
                            'sum'
                        ]
                    ]
                }),
                storeAgg: Ext.create('Ext.data.ArrayStore', {
                    fields: [
                        'text',
                        'value'
                    ],
                    data: dataAgg
                })
            });
            Ext.apply(values, {
                operator: 'top10',
                dimensionId: (filter ? filter.dimensionId : ''),
                topType: (filter ? filter.topType : 'items'),
                topOrder: (filter ? filter.topOrder : 'top')
            });
        }
        win = Ext.create(winClass, Ext.apply(winCfg || {}, {
            title: me.header,
            listeners: {
                filter: me.onApplyFilter,
                scope: me
            }
        }));
        win.down('form').getForm().setValues(values);
        win.show();
    },
    onApplyFilter: function(win, filter) {
        var me = this;
        filter.caseSensitive = (filter.caseSensitive === 'on');
        filter.topSort = (filter.topSort === 'on');
        win.close();
        me.addFilterCls();
        me.dimension.filter = filter;
        me.fireEvent('filterchange', me, filter);
    },
    onRemoveFilter: function() {
        var me = this;
        me.removeFilterCls();
        me.dimension.filter = null;
        me.fireEvent('filterchange', me, null);
    }
});

/**
 *
 * This class is used for managing the drag zone for each container.
 *
 * @private
 *
 */
Ext.define('Ext.pivot.plugin.configurator.DragZone', {
    extend: 'Ext.dd.DragZone',
    configColumnSelector: '.' + Ext.baseCSSPrefix + 'pivot-grid-config-column',
    configColumnInnerSelector: '.' + Ext.baseCSSPrefix + 'pivot-grid-config-column-inner',
    maxProxyWidth: 120,
    dragging: false,
    constructor: function(panel) {
        this.panel = panel;
        this.ddGroup = this.getDDGroup();
        this.callParent([
            panel.el
        ]);
    },
    getDDGroup: function() {
        // return the column header dd group so we can allow column droping inside the grouping panel
        return 'configurator-' + this.panel.up('gridpanel').id;
    },
    getDragData: function(e) {
        if (e.getTarget(this.configColumnInnerSelector)) {
            var header = e.getTarget(this.configColumnSelector),
                headerCmp, ddel;
            if (header) {
                headerCmp = Ext.getCmp(header.id);
                if (!this.panel.dragging) {
                    ddel = document.createElement('div');
                    ddel.innerHTML = headerCmp.header;
                    return {
                        ddel: ddel,
                        header: headerCmp
                    };
                }
            }
        }
        return false;
    },
    onBeforeDrag: function() {
        return !(this.panel.dragging || this.disabled);
    },
    onInitDrag: function() {
        this.panel.dragging = true;
        this.callParent(arguments);
    },
    onDragDrop: function() {
        if (!this.dragData.dropLocation) {
            this.panel.dragging = false;
            this.callParent(arguments);
            return;
        }
        /*
            when a column is dragged out from the grouping panel we have to do the following:
            1. remove the column from grouping panel
            2. adjust the grid groupers
        */
        var dropCol = this.dragData.dropLocation.header,
            dragCol = this.dragData.header,
            pos = -1;
        if (dropCol instanceof Ext.grid.column.Column) {
            dropCol.show();
            pos = this.panel.items.findIndex('idColumn', dragCol.id);
            this.panel.remove(this.panel.items.getAt(pos));
            this.panel.notifyGroupChange();
        }
        this.panel.dragging = false;
        this.callParent(arguments);
    },
    afterRepair: function() {
        this.callParent();
        this.panel.dragging = false;
    },
    getRepairXY: function() {
        return this.dragData.header.el.getXY();
    },
    disable: function() {
        this.disabled = true;
    },
    enable: function() {
        this.disabled = false;
    }
});

/**
 *
 * This class is used for managing the drop zone for each container.
 *
 * @private
 *
 */
Ext.define('Ext.pivot.plugin.configurator.DropZone', {
    extend: 'Ext.dd.DropZone',
    proxyOffsets: [
        -4,
        -9
    ],
    configPanelCls: Ext.baseCSSPrefix + 'pivot-grid-config-container-body',
    configColumnCls: Ext.baseCSSPrefix + 'pivot-grid-config-column',
    constructor: function(panel) {
        this.panel = panel;
        this.ddGroup = this.getDDGroup();
        this.callParent([
            panel.id
        ]);
    },
    disable: function() {
        this.disabled = true;
    },
    enable: function() {
        this.disabled = false;
    },
    getDDGroup: function() {
        // return the column header dd group so we can allow column droping inside the grouping panel
        return 'configurator-' + this.panel.up('gridpanel').id;
    },
    getTargetFromEvent: function(e) {
        return e.getTarget('.' + this.configColumnCls) || e.getTarget('.' + this.configPanelCls);
    },
    getTopIndicator: function() {
        if (!this.topIndicator) {
            this.self.prototype.topIndicator = Ext.DomHelper.append(Ext.getBody(), {
                cls: 'col-move-top ' + Ext.baseCSSPrefix + 'col-move-top',
                html: "&#160;"
            }, true);
            this.self.prototype.indicatorXOffset = Math.floor((this.topIndicator.dom.offsetWidth + 1) / 2);
        }
        return this.topIndicator;
    },
    getBottomIndicator: function() {
        if (!this.bottomIndicator) {
            this.self.prototype.bottomIndicator = Ext.DomHelper.append(Ext.getBody(), {
                cls: 'col-move-bottom ' + Ext.baseCSSPrefix + 'col-move-bottom',
                html: "&#160;"
            }, true);
        }
        return this.bottomIndicator;
    },
    getLocation: function(e, t) {
        var x = e.getXY()[0],
            target = Ext.getCmp(t.id),
            region, pos;
        if (target instanceof Ext.pivot.plugin.configurator.Container) {
            // that means that the column is dragged above the grouping panel so find out if there are any columns already
            if (target.items.getCount() > 0) {
                // now fetch the position of the last item
                region = Ext.fly(target.items.last().el).getRegion();
            } else {
                region = new Ext.util.Region(0, 1000000, 0, 0);
            }
        } else {
            region = Ext.fly(t).getRegion();
        }
        if ((region.right - x) <= (region.right - region.left) / 2) {
            pos = "after";
        } else {
            pos = "before";
        }
        return {
            pos: pos,
            header: Ext.getCmp(t.id),
            node: t
        };
    },
    positionIndicator: function(data, node, e) {
        var me = this,
            dragHeader = data.header,
            dropLocation = me.getLocation(e, node),
            targetHeader = dropLocation.header,
            pos = dropLocation.pos,
            nextHd, prevHd, topIndicator, bottomIndicator, topAnchor, bottomAnchor, topXY, bottomXY, headerCtEl, minX, maxX, allDropZones, ln, i, dropZone;
        // Avoid expensive CQ lookups and DOM calculations if dropPosition has not changed
        if (targetHeader === me.lastTargetHeader && pos === me.lastDropPos) {
            return;
        }
        nextHd = dragHeader.nextSibling('gridcolumn:not([hidden])');
        prevHd = dragHeader.previousSibling('gridcolumn:not([hidden])');
        me.lastTargetHeader = targetHeader;
        me.lastDropPos = pos;
        data.dropLocation = dropLocation;
        if ((dragHeader !== targetHeader) && ((pos === "before" && nextHd !== targetHeader) || (pos === "after" && prevHd !== targetHeader)) && !targetHeader.isDescendantOf(dragHeader)) {
            // As we move in between different DropZones that are in the same
            // group (such as the case when in a locked grid), invalidateDrop
            // on the other dropZones.
            allDropZones = Ext.dd.DragDropManager.getRelated(me);
            ln = allDropZones.length;
            i = 0;
            for (; i < ln; i++) {
                dropZone = allDropZones[i];
                if (dropZone !== me && dropZone.invalidateDrop) {
                    dropZone.invalidateDrop();
                }
            }
            me.valid = true;
            topIndicator = me.getTopIndicator();
            bottomIndicator = me.getBottomIndicator();
            if (pos === 'before') {
                topAnchor = 'bc-tl';
                bottomAnchor = 'tc-bl';
            } else {
                topAnchor = 'bc-tr';
                bottomAnchor = 'tc-br';
            }
            // Calculate arrow positions. Offset them to align exactly with column border line
            if (targetHeader instanceof Ext.pivot.plugin.configurator.Container && targetHeader.items.getCount() > 0) {
                // if dropping zone is the container then align the rows to the last column item
                topXY = topIndicator.getAlignToXY(targetHeader.items.last().el, topAnchor);
                bottomXY = bottomIndicator.getAlignToXY(targetHeader.items.last().el, bottomAnchor);
            } else {
                topXY = topIndicator.getAlignToXY(targetHeader.el, topAnchor);
                bottomXY = bottomIndicator.getAlignToXY(targetHeader.el, bottomAnchor);
            }
            // constrain the indicators to the viewable section
            headerCtEl = me.panel.el;
            minX = headerCtEl.getX() - me.indicatorXOffset;
            maxX = headerCtEl.getX() + headerCtEl.getWidth();
            topXY[0] = Ext.Number.constrain(topXY[0], minX, maxX);
            bottomXY[0] = Ext.Number.constrain(bottomXY[0], minX, maxX);
            // position and show indicators
            topIndicator.setXY(topXY);
            bottomIndicator.setXY(bottomXY);
            topIndicator.show();
            bottomIndicator.show();
        } else // invalidate drop operation and hide indicators
        {
            me.invalidateDrop();
        }
    },
    invalidateDrop: function() {
        this.valid = false;
        this.hideIndicators();
    },
    onNodeOver: function(node, dragZone, e, data) {
        var me = this,
            from = data.header,
            doPosition, to, fromPanel, toPanel;
        doPosition = true;
        if (data.header.el.dom === node) {
            doPosition = false;
        }
        if (doPosition) {
            me.positionIndicator(data, node, e);
        } else {
            me.valid = false;
        }
        return me.valid ? me.dropAllowed : me.dropNotAllowed;
    },
    hideIndicators: function() {
        var me = this;
        me.getTopIndicator().hide();
        me.getBottomIndicator().hide();
        me.lastTargetHeader = me.lastDropPos = null;
    },
    onNodeOut: function() {
        this.hideIndicators();
    },
    onNodeDrop: function(node, dragZone, e, data) {
        //debugger;
        var me = this,
            dragColumn = data.header,
            dropLocation = data.dropLocation,
            newCol, pos, newPos;
        if (me.valid && dropLocation) {
            /* 
                there are 2 possibilities here:
                1. a new grid column should be added to the grouping panel
                2. an existing group column changes its position
            */
            if (dragZone.id != me.panel.id) {
                pos = me.panel.getColumnPosition(dropLocation.header, dropLocation.pos);
                newCol = dragColumn.serialize();
                // the field has to be removed from the dragZone
                if (!me.panel.isAgg) {
                    dragZone.panel.remove(dragColumn);
                }
                me.panel.addColumn(newCol.dimension, pos, true);
            } else {
                // 2nd possibility
                me.panel.moveColumn(dragColumn.id, dropLocation.header instanceof Ext.pivot.plugin.configurator.Container ? dropLocation.header.items.last().id : dropLocation.header.id, dropLocation.pos);
            }
        }
    }
});

/**
 *
 * This class is used for managing all fields for an axis.
 *
 * @private
 *
 */
Ext.define('Ext.pivot.plugin.configurator.Container', {
    extend: 'Ext.panel.Panel',
    requires: [
        'Ext.pivot.plugin.configurator.Column',
        'Ext.pivot.plugin.configurator.DragZone',
        'Ext.pivot.plugin.configurator.DropZone',
        'Ext.layout.container.VBox',
        'Ext.layout.container.Column'
    ],
    alias: 'widget.pivotconfigcontainer',
    childEls: [
        'innerCt',
        'targetEl'
    ],
    handleSorting: false,
    handleFiltering: false,
    position: 'top',
    isAgg: false,
    border: false,
    dragDropText: 'Drop Column Fields Here',
    cls: Ext.baseCSSPrefix + 'pivot-grid-config-container-body',
    dockedTopRightCls: Ext.baseCSSPrefix + 'pivot-grid-config-container-body-tr',
    dockedBottomLeftCls: Ext.baseCSSPrefix + 'pivot-grid-config-container-body-bl',
    hintTextCls: Ext.baseCSSPrefix + 'pivot-grid-config-container-hint',
    initComponent: function() {
        var me = this;
        if (me.position == 'top' || me.position == 'bottom') {
            Ext.apply(me, {
                style: 'overflow:hidden',
                layout: 'column',
                height: 'auto'
            });
        } else {
            Ext.apply(me, {
                layout: {
                    type: 'vbox',
                    align: 'stretch'
                }
            });
        }
        if (me.position == 'top' || me.position == 'right') {
            me.cls += ' ' + me.dockedTopRightCls;
        } else {
            me.cls += ' ' + me.dockedBottomLeftCls;
        }
        me.callParent(arguments);
    },
    destroy: function() {
        var me = this;
        Ext.destroyMembers(me, 'dragZone', 'dropZone', 'relayers', 'targetEl');
        me.dragZone = me.dropZone = me.relayers = me.targetEl = null;
        me.callParent();
    },
    enable: function() {
        var me = this;
        if (me.dragZone) {
            me.dragZone.enable();
        }
        if (me.dropZone) {
            me.dropZone.enable();
        }
    },
    disable: function() {
        var me = this;
        if (me.dragZone) {
            me.dragZone.disable();
        }
        if (me.dropZone) {
            me.dropZone.disable();
        }
    },
    afterRender: function() {
        var me = this;
        me.callParent();
        me.dragZone = new Ext.pivot.plugin.configurator.DragZone(me);
        me.dropZone = new Ext.pivot.plugin.configurator.DropZone(me);
        me.mon(me, 'afterlayout', me.showGroupByText, me);
    },
    /**
     * This is used for adding a new config field to this container.
     *
     * @private
     */
    addColumn: function(config, pos, notify) {
        var me = this,
            cfg = {
                xtype: 'pivotconfigcolumn'
            },
            itemFound = me.items.findIndex('dimensionId', new RegExp('^' + config.id + '$', 'i')) >= 0,
            newCol;
        if (!me.isAgg) {
            // if column found then don't do anything
            if (itemFound) {
                if (notify === true) {
                    me.notifyGroupChange();
                }
                return;
            }
        } else {
            if (itemFound) {
                config.id = Ext.id();
            }
        }
        if (me.items.getCount() == 0) {
            me.hideGroupByText();
        }
        Ext.apply(cfg, {
            dimension: config,
            dimensionId: config.id,
            header: config.header,
            isCustomizable: me.isCustomizable,
            isAgg: me.isAgg
        });
        if (me.isAgg) {
            config.aggregator = config.aggregator || 'sum';
        }
        if (pos != -1) {
            newCol = me.insert(pos, cfg);
        } else {
            newCol = me.add(cfg);
        }
        me.updateColumnIndexes();
        newCol.relayers = me.relayEvents(newCol, [
            'sortchange',
            'filterchange',
            'configchange'
        ]);
        if (notify === true) {
            me.notifyGroupChange();
        }
    },
    /**
     * This is used for calculating column position in this container.
     *
     * @private
     */
    getColumnPosition: function(column, position) {
        var me = this,
            pos;
        if (column instanceof Ext.pivot.plugin.configurator.Column) {
            //we have to insert before or after this column
            pos = me.items.findIndex('id', column.id);
            pos = (position === 'before') ? pos : pos + 1;
        } else {
            pos = -1;
        }
        return pos;
    },
    /**
     * This is used for moving a column inside this container.
     *
     * @private
     */
    moveColumn: function(idFrom, idTo, position) {
        var me = this,
            pos = me.items.findIndex('id', idFrom),
            newPos = me.items.findIndex('id', idTo);
        if (pos != newPos) {
            if (newPos > pos) {
                newPos = (position === 'before') ? Math.max(newPos - 1, 0) : newPos;
            } else {
                newPos = (position === 'before') ? newPos : newPos + 1;
            }
            me.move(pos, newPos);
            me.updateColumnIndexes();
            me.notifyGroupChange();
        }
    },
    /**
     * After a column is moved the indexes has to be updated.
     *
     * @private
     */
    updateColumnIndexes: function() {
        this.items.each(function(item, index, all) {
            item.index = index;
        });
    },
    /**
     * This is used for firing the 'configchange' event
     *
     * @private
     */
    notifyGroupChange: function() {
        this.fireEvent('configchange');
    },
    /**
     * The container has an info text displayed inside. This function makes it visible.
     *
     * @private
     */
    showGroupByText: function() {
        var me = this;
        if (me.items.getCount() === 0) {
            me.innerCt.setHeight(me.minHeight);
            if (me.targetEl) {
                me.targetEl.setHtml('<div class="' + me.hintTextCls + '">' + me.dragDropText + '</div>');
            } else {
                me.targetEl = me.innerCt.createChild();
            }
        }
    },
    /**
     * The container has an info text displayed inside. This function hides it.
     *
     * @private
     */
    hideGroupByText: function() {
        if (this.targetEl) {
            this.targetEl.setHtml('');
        }
    }
});

/**
 *
 * This class implements the config panel. It is used internally by the configurator plugin.
 *
 * @private
 *
 */
Ext.define('Ext.pivot.plugin.configurator.Panel', {
    extend: 'Ext.panel.Panel',
    requires: [
        'Ext.pivot.plugin.configurator.Container',
        'Ext.panel.Header',
        'Ext.layout.container.HBox',
        'Ext.layout.container.VBox'
    ],
    alias: 'widget.pivotconfigpanel',
    dock: 'right',
    weight: 50,
    // the column header container has a weight of 100 so we want to dock it before that.
    grid: null,
    fields: [],
    refreshDelay: 1000,
    defaultMinHeight: 70,
    defaultMinWidth: 250,
    header: false,
    title: 'Configurator',
    collapsible: true,
    collapseMode: 'placeholder',
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
    headerContainerCls: Ext.baseCSSPrefix + 'pivot-grid-config-container-header',
    initComponent: function() {
        var me = this,
            listeners = {
                configchange: me.onConfigChanged,
                sortchange: me.onSortChanged,
                filterchange: me.onFilterChanged,
                scope: me,
                destroyable: true
            };
        Ext.apply(me, Ext.Array.indexOf([
            'top',
            'bottom'
        ], me.dock) >= 0 ? me.getHorizontalConfig() : me.getVerticalConfig());
        me.callParent(arguments);
        me.fieldsCt = me.down('#fieldsCt');
        me.fieldsTopCt = me.down('#fieldsTopCt');
        me.fieldsLeftCt = me.down('#fieldsLeftCt');
        me.fieldsAggCt = me.down('#fieldsAggCt');
        me.fieldsCtListeners = me.fieldsCt.on(listeners);
        me.fieldsLeftCtListeners = me.fieldsLeftCt.on(listeners);
        me.fieldsTopCtListeners = me.fieldsTopCt.on(listeners);
        me.fieldsAggCtListeners = me.fieldsAggCt.on(listeners);
        me.fieldsExtracted = false;
        me.gridListeners = me.grid.on({
            pivotdone: me.initPivotFields,
            scope: me,
            destroyable: true
        });
        me.task = new Ext.util.DelayedTask(function() {
            me.grid.reconfigurePivot({
                topAxis: me.getFieldsFromContainer(me.fieldsTopCt),
                leftAxis: me.getFieldsFromContainer(me.fieldsLeftCt),
                aggregate: me.getFieldsFromContainer(me.fieldsAggCt)
            });
        });
    },
    destroy: function() {
        var me = this;
        delete (me.grid);
        Ext.destroy(me.relayers, me.fieldsCtListeners, me.fieldsLeftCtListeners, me.fieldsTopCtListeners, me.fieldsAggCtListeners, me.gridListeners);
        me.callParent();
    },
    enable: function() {
        var me = this;
        if (me.fieldsCt) {
            me.fieldsCt.enable();
            me.fieldsTopCt.enable();
            me.fieldsLeftCt.enable();
            me.fieldsAggCt.enable();
            me.initPivotFields();
        }
        me.show();
    },
    disable: function() {
        var me = this;
        if (me.fieldsCt) {
            me.fieldsCt.disable();
            me.fieldsTopCt.disable();
            me.fieldsLeftCt.disable();
            me.fieldsAggCt.disable();
        }
        me.hide();
    },
    getPanelConfigHeader: function(config) {
        return Ext.apply({
            xtype: 'header',
            // make it look like a panel header but with a different padding
            baseCls: Ext.baseCSSPrefix + 'panel-header',
            cls: this.headerContainerCls,
            border: 1,
            width: 100
        }, config || {});
    },
    getHorizontalConfig: function() {
        var me = this;
        return {
            minHeight: me.defaultMinHeight,
            headerPosition: me.dock == 'top' ? 'bottom' : 'top',
            collapseDirection: me.dock,
            defaults: {
                xtype: 'container',
                layout: {
                    type: 'hbox',
                    align: 'stretchmax'
                },
                minHeight: me.defaultMinHeight / 3
            },
            items: [
                {
                    items: [
                        me.getPanelConfigHeader({
                            title: me.panelAllFieldsTitle,
                            tools: me.collapsible ? [
                                {
                                    type: me.dock == 'top' ? 'up' : 'down',
                                    handler: me.collapseMe,
                                    scope: me
                                }
                            ] : []
                        }),
                        {
                            itemId: 'fieldsCt',
                            xtype: 'pivotconfigcontainer',
                            isCustomizable: false,
                            dragDropText: me.panelAllFieldsText,
                            position: me.dock,
                            flex: 1
                        }
                    ]
                },
                {
                    items: [
                        me.getPanelConfigHeader({
                            title: me.panelAggFieldsTitle
                        }),
                        {
                            itemId: 'fieldsAggCt',
                            xtype: 'pivotconfigcontainer',
                            isCustomizable: true,
                            isAgg: true,
                            dragDropText: me.panelAggFieldsText,
                            position: me.dock,
                            flex: 1
                        }
                    ]
                },
                {
                    defaults: {
                        xtype: 'pivotconfigcontainer',
                        minHeight: me.defaultMinHeight / 3,
                        position: me.dock
                    },
                    items: [
                        me.getPanelConfigHeader({
                            title: me.panelLeftFieldsTitle
                        }),
                        {
                            itemId: 'fieldsLeftCt',
                            pivotField: 'leftAxis',
                            isCustomizable: true,
                            dragDropText: me.panelLeftFieldsText,
                            flex: 1
                        },
                        me.getPanelConfigHeader({
                            title: me.panelTopFieldsTitle
                        }),
                        {
                            itemId: 'fieldsTopCt',
                            pivotField: 'topAxis',
                            isCustomizable: true,
                            dragDropText: me.panelTopFieldsText,
                            flex: 1
                        }
                    ]
                }
            ]
        };
    },
    getVerticalConfig: function() {
        var me = this;
        return {
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            width: me.defaultMinWidth,
            minWidth: me.defaultMinWidth,
            headerPosition: me.dock == 'right' ? 'left' : 'right',
            collapseDirection: me.dock,
            defaults: {
                flex: 1
            },
            items: [
                {
                    itemId: 'fieldsCt',
                    xtype: 'pivotconfigcontainer',
                    position: me.dock,
                    title: me.panelAllFieldsTitle,
                    isCustomizable: false,
                    dragDropText: me.panelAllFieldsText,
                    autoScroll: true,
                    header: {
                        cls: me.headerContainerCls
                    },
                    tools: me.collapsible ? [
                        {
                            type: me.dock,
                            handler: me.collapseMe,
                            scope: me
                        }
                    ] : []
                },
                {
                    xtype: 'container',
                    defaults: {
                        xtype: 'pivotconfigcontainer',
                        flex: 1,
                        autoScroll: true,
                        position: me.dock,
                        header: {
                            cls: me.headerContainerCls
                        }
                    },
                    layout: {
                        type: 'vbox',
                        align: 'stretch'
                    },
                    items: [
                        {
                            itemId: 'fieldsAggCt',
                            title: me.panelAggFieldsTitle,
                            isCustomizable: true,
                            isAgg: true,
                            dragDropText: me.panelAggFieldsText
                        },
                        {
                            itemId: 'fieldsLeftCt',
                            title: me.panelLeftFieldsTitle,
                            pivotField: 'leftAxis',
                            isCustomizable: true,
                            dragDropText: me.panelLeftFieldsText
                        },
                        {
                            itemId: 'fieldsTopCt',
                            title: me.panelTopFieldsTitle,
                            pivotField: 'topAxis',
                            isCustomizable: true,
                            dragDropText: me.panelTopFieldsText
                        }
                    ]
                }
            ]
        };
    },
    /**
     * This is the 'configchange' event handler raised by each sub container.
     *
     * @private
     */
    onConfigChanged: function() {
        var me = this,
            topAxis = [],
            leftAxis = [],
            agg = [];
        if (me.disabled) {
            // if the plugin is disabled don't do anything
            return;
        }
        if (me.grid.fireEvent('configchange', me, {
            topAxis: me.getFieldsFromContainer(me.fieldsTopCt),
            leftAxis: me.getFieldsFromContainer(me.fieldsLeftCt),
            aggregate: me.getFieldsFromContainer(me.fieldsAggCt)
        }) !== false) {
            me.task.delay(me.refreshDelay);
        }
    },
    collapseMe: function() {
        this.collapse(this.dock);
    },
    /**
     * This function is used to retrieve all configured fields in a fields container.
     *
     * @private
     */
    getFieldsFromContainer: function(ct, excludeWidth) {
        var fields = [];
        ct.items.each(function(item) {
            fields.push(item.dimension);
        });
        return fields;
    },
    /**
     * This is the 'sortchange' event handler raised by each sub container.
     *
     * @private
     */
    onSortChanged: function(column, direction) {
        var me = this,
            fields;
        if (me.disabled) {
            // if the plugin is disabled don't do anything
            return;
        }
        fields = me.grid[column.ownerCt.pivotField];
        Ext.each(fields, function(field) {
            if (field.dataIndex == column.dataIndex) {
                field.direction = direction;
                return false;
            }
        });
        me.task.delay(me.refreshDelay);
    },
    onFilterChanged: function(column, filter) {
        var me = this,
            fields;
        if (me.disabled) {
            // if the plugin is disabled don't do anything
            return;
        }
        me.task.delay(me.refreshDelay);
    },
    /**
     * Initialize all container fields fetching the configuration from the pivot grid.
     *
     * @private
     */
    initPivotFields: function() {
        var me = this,
            store = me.grid.getStore(),
            model = store ? store.model : null,
            fieldsTop, fieldsLeft, fieldsAgg, cFields;
        if (model != me.lastModel) {
            Ext.destroy(me.lastFields);
            delete (me.lastFields);
            me.lastModel = model;
        }
        // let's collect all field configurations
        if (!me.lastFields) {
            me.lastFields = me.fetchAllFieldConfigurations();
        }
        cFields = me.lastFields.clone();
        // remove all previously created columns
        me.fieldsCt.removeAll();
        me.fieldsTopCt.removeAll();
        me.fieldsLeftCt.removeAll();
        me.fieldsAggCt.removeAll();
        fieldsTop = me.getConfigFields(me.grid.topAxis);
        fieldsLeft = me.getConfigFields(me.grid.leftAxis);
        fieldsAgg = me.getConfigFields(me.grid.aggregate);
        // remove all config fields from the fieldsAll
        Ext.each(Ext.Array.merge(fieldsTop, fieldsLeft), function(item) {
            var i,
                found = false;
            // if the dimension is filtered but there is no aggregate with that id then remove filter
            if (item.filter && item.filter.dimensionId) {
                for (i = 0; i < fieldsAgg.length; i++) {
                    if (fieldsAgg[i].id == item.filter.dimensionId) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    delete item.filter;
                }
            }
            cFields.removeAtKey(item.header);
            me.mergeFieldConfig(item);
        });
        Ext.each(fieldsAgg, me.mergeFieldConfig, me);
        Ext.suspendLayouts();
        me.addFieldsToConfigurator(cFields.getRange(), me.fieldsCt);
        me.addFieldsToConfigurator(fieldsTop, me.fieldsTopCt);
        me.addFieldsToConfigurator(fieldsLeft, me.fieldsLeftCt);
        me.addFieldsToConfigurator(fieldsAgg, me.fieldsAggCt);
        me.fieldsTopCt.aggregateDimensions = fieldsAgg;
        me.fieldsLeftCt.aggregateDimensions = fieldsAgg;
        Ext.resumeLayouts(true);
    },
    mergeFieldConfig: function(item) {
        var el = this.lastFields.getByKey(item.header),
            id;
        if (el) {
            id = el.id;
            Ext.apply(el, item);
            el.id = id;
        }
    },
    fetchAllFieldConfigurations: function() {
        var me = this,
            store = me.grid.getStore(),
            fields = store ? store.model.getFields() : [],
            allFields = [],
            lastFields;
        lastFields = Ext.create('Ext.util.MixedCollection');
        lastFields.getKey = function(el) {
            return el.header;
        };
        if (me.fields.length > 0) {
            allFields = me.fields;
        } else {
            Ext.each(fields, function(field) {
                allFields.push({
                    header: Ext.String.capitalize(field.name),
                    dataIndex: field.name,
                    direction: field.sortDir
                });
            });
        }
        Ext.each(allFields, function(field) {
            field.id = field.id || Ext.id();
        });
        lastFields.addAll(allFields);
        return lastFields;
    },
    /**
     * Easy function for assigning fields to a container.
     *
     * @private
     */
    addFieldsToConfigurator: function(fields, fieldsCt) {
        Ext.each(fields, function(item, index, len) {
            fieldsCt.addColumn(item, -1);
        });
    },
    /**
     * Build the fields array for each container by parsing all given fields or from the pivot config.
     *
     * @private
     */
    getConfigFields: function(dimension) {
        var me = this,
            fields = [];
        Ext.each(dimension, function(obj) {
            var field = Ext.clone(obj);
            field.id = field.id || Ext.id();
            if (!me.lastFields.getByKey(field.header)) {
                me.lastFields.add(field);
            }
            fields.push(field);
        });
        return fields;
    },
    /**
     * This function is temporarily added here until the placeholder expanding/collpasing
     * is fixed for docked panels.
     *
     * @param direction
     * @param animate
     * @returns {Ext.pivot.plugin.configurator.Panel}
     * @private
     */
    placeholderCollapse: function(direction, animate) {
        var me = this,
            ownerCt = me.ownerCt,
            collapseDir = direction || me.collapseDirection,
            floatCls = Ext.panel.Panel.floatCls,
            placeholder = me.getPlaceholder(collapseDir),
            slideInDirection;
        me.isCollapsingOrExpanding = 1;
        // Upcoming layout run will ignore this Component
        me.setHiddenState(true);
        me.collapsed = collapseDir;
        if (placeholder.rendered) {
            // We may have been added to another Container from that in which we rendered the placeholder
            if (placeholder.el.dom.parentNode !== me.el.dom.parentNode) {
                me.el.dom.parentNode.insertBefore(placeholder.el.dom, me.el.dom);
            }
            placeholder.hidden = false;
            placeholder.setHiddenState(false);
            placeholder.el.show();
            ownerCt.updateLayout();
        } else {
            //ATE - this is the fix
            if (me.dock) {
                placeholder.dock = me.dock;
                ownerCt.addDocked(placeholder);
            } else {
                ownerCt.insert(ownerCt.items.indexOf(me), placeholder);
            }
        }
        if (me.rendered) {
            // We assume that if collapse was caused by keyboard action
            // on focused collapse tool, the logical focus transition
            // is to placeholder's expand tool. Note that it may not be
            // the case when the user *clicked* collapse tool while focus
            // was elsewhere; in that case we dare not touch focus
            // to avoid sudden jumps.
            if (Ext.ComponentManager.getActiveComponent() === me.collapseTool) {
                me.focusPlaceholderExpandTool = true;
            }
            // We MUST NOT hide using display because that resets all scroll information.
            me.el.setVisibilityMode(me.placeholderCollapseHideMode);
            if (animate) {
                me.el.addCls(floatCls);
                placeholder.el.hide();
                slideInDirection = me.convertCollapseDir(collapseDir);
                me.el.slideOut(slideInDirection, {
                    preserveScroll: true,
                    duration: Ext.Number.from(animate, Ext.fx.Anim.prototype.duration),
                    listeners: {
                        scope: me,
                        afteranimate: function() {
                            var me = this;
                            me.el.removeCls(floatCls);
                            /* We need to show the element so that slideIn will work correctly.
                             * However, if we leave it visible then it can be seen before
                             * the animation starts, causing a flicker. The solution,
                             * borrowed from date picker, is to hide it using display:none.
                             * The slideIn effect includes a call to fixDisplay() that will
                             * undo the display none at the appropriate time.
                             */
                            me.placeholder.el.show().setStyle('display', 'none').slideIn(slideInDirection, {
                                easing: 'linear',
                                duration: 100,
                                listeners: {
                                    afteranimate: me.doPlaceholderCollapse,
                                    scope: me
                                }
                            });
                        }
                    }
                });
            } else {
                me.el.hide();
                me.doPlaceholderCollapse();
            }
        } else {
            me.isCollapsingOrExpanding = 0;
            if (!me.preventCollapseFire) {
                me.fireEvent('collapse', me);
            }
        }
        return me;
    },
    /**
     * This function is temporarily added here until the placeholder expanding/collpasing
     * is fixed for docked panels.
     *
     * @param animate
     * @returns {Ext.pivot.plugin.configurator.Panel}
     * @private
     */
    placeholderExpand: function(animate) {
        var me = this,
            collapseDir = me.collapsed,
            expandTool = me.placeholder.expandTool,
            floatCls = Ext.panel.Panel.floatCls,
            center = me.ownerLayout ? me.ownerLayout.centerRegion : null,
            finalPos, floatedPos;
        // Layouts suspended - don't bother with animation shenanigans
        if (Ext.Component.layoutSuspendCount) {
            animate = false;
        }
        if (me.floatedFromCollapse) {
            floatedPos = me.getPosition(true);
            // these are the same cleanups performed by the normal slideOut mechanism:
            me.slideOutFloatedPanelBegin();
            me.slideOutFloatedPanelEnd();
            me.floated = false;
        }
        // We assume that if expand was caused by keyboard action on focused
        // placeholder expand tool, the logical focus transition is to the
        // panel header's collapse tool.
        // Note that it may not be the case when the user *clicked* expand tool
        // while focus was elsewhere; in that case we dare not touch focus to avoid
        // sudden jumps.
        if (Ext.ComponentManager.getActiveComponent() === expandTool) {
            me.focusHeaderCollapseTool = true;
            // There is an odd issue with JAWS screen reader: when expanding a panel,
            // it will announce Expand tool again before focus is forced to Collapse
            // tool. I'm not sure why that happens since focus does not move from
            // Expand tool during animation; this hack should work around
            // the problem until we come up with more understanding and a proper
            // solution. The attributes are restored below in doPlaceholderExpand.
            expandTool._ariaRole = expandTool.ariaEl.dom.getAttribute('role');
            expandTool._ariaLabel = expandTool.ariaEl.dom.getAttribute('aria-label');
            expandTool.ariaEl.dom.setAttribute('role', 'presentation');
            expandTool.ariaEl.dom.removeAttribute('aria-label');
        }
        if (animate) {
            // Expand me and hide the placeholder
            Ext.suspendLayouts();
            me.placeholder.hide();
            me.el.show();
            me.collapsed = false;
            me.setHiddenState(false);
            // Stop the center region from moving when laid out without the placeholder there.
            // Unless we are expanding from a floated out situation. In that case, it's laid out immediately.
            if (center && !floatedPos) {
                center.hidden = true;
            }
            Ext.resumeLayouts(true);
            //ATE - this is the fix
            if (center) {
                center.hidden = false;
            }
            me.el.addCls(floatCls);
            // At this point, this Panel is arranged in its correct, expanded layout.
            // The center region has not been affected because it has been flagged as hidden.
            //
            // If we are proceeding from floated, the center region has also been arranged
            // in its new layout to accommodate this expansion, so no further layout is needed, just
            // element animation.
            //
            // If we are proceeding from fully collapsed, the center region has *not* been relayed out because
            // the UI look and feel dictates that it stays stable until the expanding panel has slid in all the
            // way, and *then* it snaps into place.
            me.isCollapsingOrExpanding = 2;
            // Floated, move it back to the floated pos, and thence into the correct place
            if (floatedPos) {
                finalPos = me.getXY();
                me.setLocalXY(floatedPos[0], floatedPos[1]);
                me.setXY([
                    finalPos[0],
                    finalPos[1]
                ], {
                    duration: Ext.Number.from(animate, Ext.fx.Anim.prototype.duration),
                    listeners: {
                        scope: me,
                        afteranimate: function() {
                            var me = this;
                            me.el.removeCls(floatCls);
                            me.isCollapsingOrExpanding = 0;
                            me.fireEvent('expand', me);
                        }
                    }
                });
            } else // Not floated, slide it in to the correct place
            {
                me.el.hide();
                me.placeholder.el.show();
                me.placeholder.hidden = false;
                // Slide this Component's el back into place, after which we lay out AGAIN
                me.setHiddenState(false);
                me.el.slideIn(me.convertCollapseDir(collapseDir), {
                    preserveScroll: true,
                    duration: Ext.Number.from(animate, Ext.fx.Anim.prototype.duration),
                    listeners: {
                        afteranimate: me.doPlaceholderExpand,
                        scope: me
                    }
                });
            }
        } else {
            me.floated = me.collapsed = false;
            me.doPlaceholderExpand(true);
        }
        return me;
    }
});

/**
 *
 * This plugin allows the user to configure the pivot grid using drag and drop.
 */
Ext.define('Ext.pivot.plugin.Configurator', {
    alternateClassName: [
        'Mz.pivot.plugin.Configurator'
    ],
    extend: 'Ext.AbstractPlugin',
    requires: [
        'Ext.util.DelayedTask',
        'Ext.menu.Menu',
        'Ext.menu.CheckItem',
        'Ext.pivot.plugin.configurator.Panel'
    ],
    alias: [
        'plugin.pivotconfigurator',
        'plugin.mzconfigurator'
    ],
    /**
     * @cfg {Array} fields This is the array of fields you want to be used in the configurator.
     * Each field is an object with the following properties: dataIndex, header.
     * If no fields are defined then all fields are fetched from the store model if
     * a {@link Ext.pivot.matrix.Local Local} matrix is used.
     *
     */
    fields: [],
    /**
     * @cfg {Number} refreshDelay Number of miliseconds to wait for pivot refreshing when a config change occurred.
     */
    refreshDelay: 300,
    /**
     * @cfg {String} dock Docking position for the configurator panel. Possible values: top, right, bottom, left
     */
    dock: 'right',
    /**
     * @cfg {Boolean} collapsible Is the configurator panel collapsible?
     */
    collapsible: true,
    /**
     *  `"both"` (the default) - The plugin is added to both grids
     *  `"top"` - The plugin is added to the containing Panel
     *  `"locked"` - The plugin is added to the locked (left) grid
     *  `"normal"` - The plugin is added to the normal (right) grid
     *
     * @private
     */
    lockableScope: 'top',
    init: function(grid) {
        var me = this;
        // this plugin is available only for the pivot grid
        if (!grid.isPivotGrid) {
            Ext.raise('This plugin is only compatible with Ext.pivot.Grid');
        }
        me.pivot = grid;
        me.fields = Ext.Array.from(me.fields);
        me.pivotListeners = me.pivot.on({
            beforerender: me.onBeforeGridRendered,
            afterrender: me.onAfterGridRendered,
            single: true,
            scope: me,
            destroyable: true
        });
        me.callParent(arguments);
    },
    /**
     * @private
     * AbstractComponent calls destroy on all its plugins at destroy time.
     */
    destroy: function() {
        var me = this;
        Ext.destroyMembers(me, 'configCt', 'pivotListeners');
        me.pivot = me.fields = me.pivotListeners = me.configCt = null;
        me.callParent(arguments);
    },
    /**
     * Enable the plugin to show the configurator panel.
     *
     */
    enable: function() {
        var me = this;
        me.disabled = false;
        if (me.configCt) {
            me.configCt.enable();
        }
        me.pivot.fireEvent('showconfigpanel', me.configCt);
    },
    /**
     * Disable the plugin to hide the configurator panel.
     *
     */
    disable: function() {
        var me = this;
        me.disabled = true;
        if (me.configCt) {
            me.configCt.disable();
        }
        me.pivot.fireEvent('hideconfigpanel', me.configCt);
    },
    onBeforeGridRendered: function() {
        this.setDock(this.dock);
    },
    /**
         * Fired on the pivot grid when the configuration changes.
         * Return false if you don't want to apply the new configuration to the pivot grid.
         *
         * @event configchange
         * @param {Ext.pivot.plugin.Configurator} panel
         * @param {Object} config
         */
    /**
         * @event showconfigpanel
         * @param {Ext.pivot.plugin.configurator.Panel} panel
         */
    /**
         * @event hideconfigpanel
         * @param {Ext.pivot.plugin.configurator.Panel} panel
         */
    onAfterGridRendered: function() {
        if (this.disabled === true) {
            this.disable();
        } else {
            this.enable();
        }
    },
    /**
     * Change configurator panel position.
     *
     * @param {String} position Possible values: top, right, bottom, left.
     */
    setDock: function(position) {
        var me = this,
            exists = Ext.isDefined(me.configCt);
        Ext.destroy(me.configCt);
        me.configCt = me.pivot.addDocked({
            xtype: 'pivotconfigpanel',
            dock: position || me.dock,
            grid: me.pivot,
            fields: me.fields,
            refreshDelay: me.refreshDelay,
            collapsible: me.collapsible
        })[0];
        if (exists) {
            // we only initialize the fields if docking is changed
            me.configCt.initPivotFields();
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
    columns: null,
    /**
     * @cfg {Number} width Width of the viewer's window.
     */
    width: 400,
    /**
     * @cfg {Number} height Height of the viewer's window.
     */
    height: 300,
    /**
     * @cfg {Ext.data.Store} remoteStore
     * Provide either a store config or a store instance when using a {@link Ext.pivot.matrix.Remote Remote} matrix on the pivot grid.
     *
     * The store will be remotely filtered to fetch records from the server.
     */
    remoteStore: null,
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
    lockableScope: 'top',
    init: function(grid) {
        var me = this;
        // this plugin is available only for the pivot grid
        if (!grid.isPivotGrid) {
            Ext.raise('This plugin is only compatible with Ext.pivot.Grid');
        }
        me.pivot = grid;
        me.pivotListeners = me.pivot.on({
            pivotitemcelldblclick: me.runPlugin,
            pivotgroupcelldblclick: me.runPlugin,
            pivottotalcelldblclick: me.runPlugin,
            scope: me,
            destroyable: true
        });
        me.callParent(arguments);
    },
    destroy: function() {
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
    showView: function(result) {
        var me = this,
            matrix = me.pivot.getMatrix(),
            columns = me.columns || [],
            fields, store, filters;
        if (!result) {
            return;
        }
        if (!me.view) {
            switch (matrix.type) {
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
                        Ext.Array.each(fields, function(value, index, all) {
                            columns.push({
                                header: Ext.String.capitalize(value.name),
                                dataIndex: value.name
                            });
                        });
                    };
                    break;
                case 'remote':
                    store = Ext.getStore(me.remoteStore);
                    if (store) {
                        store.setRemoteFilter(true);
                    };
                    if (columns.length === 0) {
                        Ext.raise('No columns defined for the drill down grid!');
                    };
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
                items: [
                    {
                        xtype: 'grid',
                        border: false,
                        viewConfig: {
                            loadMask: false
                        },
                        columns: columns,
                        store: store,
                        dockedItems: [
                            {
                                itemId: 'idPager',
                                xtype: 'pagingtoolbar',
                                store: store,
                                // same store GridPanel is using
                                dock: 'bottom',
                                displayInfo: true
                            }
                        ]
                    }
                ]
            });
            me.store = store;
        }
        switch (matrix.type) {
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
    runPlugin: function(params, e, eOpts) {
        // do nothing if the plugin is disabled
        if (this.disabled) {
            return;
        }
        this.showView(this.pivot.getMatrix().results.get(params.leftKey, params.topKey));
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
 *      {
 *          xtype: 'pivot',
 *          plugins: [{
 *              ptype: 'pivotexporter'
 *          }]
 *      }
 *
 *      pivot.saveDocumentAs({
 *          type: 'excel',
 *          title: 'My export',
 *          fileName: 'myExport.xml'
 *      });
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
    extend: 'Ext.AbstractPlugin',
    requires: [
        'Ext.exporter.Excel'
    ],
    /**
     *  `"both"` (the default) - The plugin is added to both grids
     *  `"top"` - The plugin is added to the containing Panel
     *  `"locked"` - The plugin is added to the locked (left) grid
     *  `"normal"` - The plugin is added to the normal (right) grid
     *
     * @private
     */
    lockableScope: 'top',
    init: function(grid) {
        var me = this;
        // this plugin is available only for the pivot grid
        if (!grid.isPivotGrid) {
            Ext.raise('This plugin is only compatible with Ext.pivot.Grid');
        }
        grid.saveDocumentAs = Ext.bind(me.saveDocumentAs, me);
        grid.getDocumentData = Ext.bind(me.getDocumentData, me);
        me.pivot = grid;
        return me.callParent(arguments);
    },
    destroy: function() {
        var me = this;
        me.pivot.saveDocumentAs = me.pivot.getDocumentData = me.pivot = me.matrix = null;
        return me.callParent(arguments);
    },
    /**
     * Save the export file. This method is added to the grid panel as "saveDocumentAs".
     *
     * Pass in exporter specific configs to the config parameter.
     *
     * @param {Ext.exporter.Base} config Config object used to initialize the proper exporter
     * @param {String} config.type Type of the exporter as defined in the exporter alias. Default is `excel`.
     * @param {Boolean} [config.onlyExpandedNodes] True to export only what is visible in the grid. False to export everything.
     * @param {Boolean} [config.showSummary] True to export group summaries
     * @param {String} [config.title] Title added to the export document
     * @param {String} [config.author] Who exported the document?
     * @param {String} [config.fileName] Name of the exported file, including the extension
     * @param {String} [config.charset] Exported file's charset
     *
     */
    saveDocumentAs: function(config) {
        var exporter;
        if (this.disabled) {
            return;
        }
        exporter = this.getExporter.apply(this, arguments);
        exporter.saveAs();
        Ext.destroy(exporter);
    },
    /**
     * Fetch the export data. This method is added to the grid panel as "getDocumentData".
     *
     * Pass in exporter specific configs to the config parameter.
     *
     * @param {Ext.exporter.Base} config Config object used to initialize the proper exporter
     * @param {String} config.type Type of the exporter as defined in the exporter alias. Default is `excel`.
     * @param {Boolean} [config.onlyExpandedNodes] True to export only what is visible in the grid. False to export everything.
     * @param {Boolean} [config.showSummary] True to export group summaries
     * @param {String} [config.title] Title added to the export document
     * @param {String} [config.author] Who exported the document?
     * @returns {String}
     *
     */
    getDocumentData: function(config) {
        var exporter, ret;
        if (this.disabled) {
            return;
        }
        exporter = this.getExporter.apply(this, arguments);
        ret = exporter.getContent();
        Ext.destroy(exporter);
        return ret;
    },
    /**
     * Builds the exporter object and returns it.
     *
     * @param config
     * @returns {Ext.exporter.Base}
     *
     * @private
     */
    getExporter: function(config) {
        var me = this;
        config = config || {};
        me.matrix = me.pivot.getMatrix();
        me.onlyExpandedNodes = config.onlyExpandedNodes;
        delete (config.onlyExpandedNodes);
        return Ext.Factory.exporter(Ext.apply({
            type: 'excel',
            data: me.prepareData()
        }, config));
    },
    /**
     * This method creates the data object that will be consumed by the exporter.
     * @returns {Object}
     *
     * @private
     */
    prepareData: function() {
        var me = this,
            matrix = me.matrix,
            group, columns, headers, record, i, dataIndexes;
        if (!me.onlyExpandedNodes) {
            me.setColumnsExpanded(matrix.topAxis.getTree(), true);
        }
        columns = Ext.clone(matrix.getColumnHeaders());
        headers = me.getColumnHeaders(columns);
        dataIndexes = me.getDataIndexColumns(columns);
        if (!me.onlyExpandedNodes) {
            me.setColumnsExpanded(matrix.topAxis.getTree());
        }
        group = me.extractGroups(matrix.leftAxis.getTree(), dataIndexes);
        Ext.apply(group, {
            summary: [],
            text: ''
        });
        group.summary.push(matrix.textGrandTotalTpl);
        record = matrix.preparePivotStoreRecordData({
            key: matrix.grandTotalKey
        });
        for (i = 1; i < dataIndexes.length; i++) {
            group.summary.push((Ext.isEmpty(record[dataIndexes[i]]) || (matrix.showZeroAsBlank && record[dataIndexes[i]] === 0)) ? '' : record[dataIndexes[i]]);
        }
        return {
            columns: headers,
            groups: [
                group
            ]
        };
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
     * @param columns
     *
     * @returns {Array}
     *
     * @private
     */
    getColumnHeaders: function(columns) {
        var cols = [],
            i, obj;
        for (i = 0; i < columns.length; i++) {
            obj = {
                text: columns[i].text
            };
            if (columns[i].columns) {
                obj.columns = this.getColumnHeaders(columns[i].columns);
            }
            cols.push(obj);
        }
        return cols;
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
     * Extract data from left axis groups.
     *
     * @param items
     * @param columns
     *
     * @returns {Object}
     *
     * @private
     */
    extractGroups: function(items, columns) {
        var matrix = this.matrix,
            group = {},
            i, j, doExtract, item, row, record;
        for (i = 0; i < items.length; i++) {
            item = items[i];
            if (item.record) {
                group.rows = group.rows || [];
                row = [];
                for (j = 0; j < columns.length; j++) {
                    row.push((Ext.isEmpty(item.record.get(columns[j])) || (matrix.showZeroAsBlank && item.record.get(columns[j]) === 0)) ? '' : item.record.get(columns[j]));
                }
                group.rows.push(row);
            } else if (item.children) {
                group.groups = group.groups || [];
                row = {};
                doExtract = this.onlyExpandedNodes ? item.expanded : true;
                if (doExtract) {
                    row = this.extractGroups(item.children, columns);
                }
                Ext.apply(row, {
                    summary: [],
                    text: item.name
                });
                row.summary.push(item.getTextTotal());
                record = matrix.preparePivotStoreRecordData(item);
                for (j = 1; j < columns.length; j++) {
                    row.summary.push((Ext.isEmpty(record[columns[j]]) || (matrix.showZeroAsBlank && record[columns[j]] === 0)) ? '' : record[columns[j]]);
                }
                group.groups.push(row);
            }
        }
        return group;
    }
});

/**
 *
 * This plugin allows the user to modify records behind a pivot cell.
 * The user has to double click that cell to open the range editor window.
 *
 * The following types of range editing are available:
 * - percentage: the user fills in a percentage that is applied to each record.
 * - increment:  the user fills in a value that is added to each record.
 * - overwrite:  the new value filled in by the user overwrites each record.
 * - uniformly:  the user fills in a value that is uniformly applied to each record.
 *
 */
Ext.define('Ext.pivot.plugin.RangeEditor', {
    alternateClassName: [
        'Mz.pivot.plugin.RangeEditor'
    ],
    alias: [
        'plugin.pivotrangeeditor',
        'plugin.mzrangeeditor'
    ],
    extend: 'Ext.AbstractPlugin',
    requires: [
        'Ext.pivot.Grid',
        'Ext.window.Window',
        'Ext.form.field.Text',
        'Ext.form.field.Number',
        'Ext.form.field.ComboBox',
        'Ext.form.field.Display',
        'Ext.form.Panel',
        'Ext.button.Button',
        'Ext.layout.container.Fit',
        'Ext.data.Store'
    ],
    mixins: {
        observable: 'Ext.util.Observable'
    },
    /**
     * @cfg {Number} width Width of the viewer's window.
     */
    width: null,
    /**
     * @cfg {Number} height Height of the viewer's window.
     */
    height: null,
    /**
     * @cfg {String} textWindowTitle Range editor window title
     */
    textWindowTitle: 'Range editor',
    /**
     * @cfg {String} textFieldValue Range editor field Value label
     */
    textFieldValue: 'Value',
    /**
     * @cfg {String} textFieldEdit Range editor field Edit label
     */
    textFieldEdit: 'Field',
    /**
     * @cfg {String} textFieldType Range editor field Type label
     */
    textFieldType: 'Type',
    /**
     * @cfg {String} textButtonOk Range editor window Ok button text
     */
    textButtonOk: 'Ok',
    /**
     * @cfg {String} textButtonCancel Range editor window Cancel button text
     */
    textButtonCancel: 'Cancel',
    /**
     * @cfg {String} textTypePercentage Type of range editing
     */
    textTypePercentage: 'Percentage',
    /**
     * @cfg {String} textTypeIncrement Type of range editing
     */
    textTypeIncrement: 'Increment',
    /**
     * @cfg {String} textTypeOverwrite Type of range editing
     */
    textTypeOverwrite: 'Overwrite',
    /**
     * @cfg {String} textTypeUniformly Type of range editing
     */
    textTypeUniformly: 'Uniformly',
    /**
     * @cfg {Function} onBeforeRecordsUpdate Provide a function to handle the records update.
     *       This one will be fired before updating the records. Return false if you want to stop the process.
     *       The function receives the following arguments: pivot, colDefinition, records, newValue, oldValue
     */
    onBeforeRecordsUpdate: Ext.emptyFn,
    /**
     * @cfg {Function} onAfterRecordsUpdate Provide a function to handle the records update.
     *       This one will be fired after all records were updated. "sync" could be called on the store inside this function.
	 *		The function receives the following arguments: pivot, colDefinition, records, newValue, oldValue
     */
    onAfterRecordsUpdate: Ext.emptyFn,
    /**
     *  `"both"` (the default) - The plugin is added to both grids
     *  `"top"` - The plugin is added to the containing Panel
     *  `"locked"` - The plugin is added to the locked (left) grid
     *  `"normal"` - The plugin is added to the normal (right) grid
     *
     * @private
     */
    lockableScope: 'top',
    init: function(grid) {
        var me = this;
        // this plugin is available only for the pivot grid
        if (!grid.isPivotGrid) {
            Ext.raise('This plugin is only compatible with Ext.pivot.Grid');
        }
        me.pivot = grid;
        me.pivotListeners = me.pivot.on({
            pivotitemcelldblclick: me.runPlugin,
            pivotgroupcelldblclick: me.runPlugin,
            pivottotalcelldblclick: me.runPlugin,
            scope: me,
            destroyable: true
        });
        me.callParent(arguments);
    },
    destroy: function() {
        var me = this;
        Ext.destroyMembers(me, 'view', 'pivotListeners');
        me.pivot = me.view = me.pivotListeners = me.currentRecord = me.currentCol = me.currentResult = null;
        me.callParent(arguments);
    },
    runPlugin: function(params, e, eOpts) {
        var me = this,
            matrix = me.pivot.getMatrix(),
            dataIndex;
        // do nothing if the plugin is disabled
        if (me.disabled) {
            return;
        }
        if (params.topKey) {
            me.initEditorWindow();
            me.currentResult = matrix.results.get(params.leftKey, params.topKey);
            if (me.currentResult) {
                me.currentCol = params.column;
                dataIndex = me.currentCol.dimension.getId();
                me.view.down('form').getForm().setValues({
                    field: me.currentCol.dimension.header || me.currentCol['text'] || me.currentCol.dimension.dataIndex,
                    value: me.currentResult.getValue(dataIndex),
                    type: 'uniformly'
                });
                me.view.show();
            }
        }
    },
    updateRecords: function() {
        var me = this,
            result = me.currentResult,
            colDef = me.currentCol,
            agg = colDef.dimension.getId(),
            dataIndex = colDef.dimension.dataIndex,
            values = me.view.down('form').getForm().getValues(),
            records, avg;
        records = result.records;
        if (me.onBeforeRecordsUpdate(me.pivot, colDef, records, values.value, result.getValue(agg)) === false) {
            return;
        }
        me.view.getEl().mask();
        values.value = parseFloat(values.value);
        if (records.length > 0) {
            avg = (values.value / records.length);
        }
        Ext.defer(function() {
            Ext.Array.each(records, function(item, index) {
                var currValue = item.get(dataIndex),
                    v;
                switch (values.type) {
                    case 'percentage':
                        v = Math.floor(currValue * values.value / 100);
                        break;
                    case 'increment':
                        v = currValue + values.value;
                        break;
                    case 'overwrite':
                        v = values.value;
                        break;
                    case 'uniformly':
                        v = avg;
                        break;
                }
                // only apply a change if there is actually a change
                if (currValue != v) {
                    item.set(dataIndex, v);
                }
            });
            me.onAfterRecordsUpdate(me.pivot, colDef, records, values.value, result.getValue(agg));
            me.view.getEl().unmask();
            me.view.close();
        }, 10);
    },
    initEditorWindow: function() {
        var me = this;
        if (!me.view) {
            // create the editor window
            me.view = Ext.create('Ext.window.Window', {
                title: me.textWindowTitle,
                width: me.width,
                height: me.height,
                layout: 'fit',
                modal: true,
                closeAction: 'hide',
                items: [
                    {
                        xtype: 'form',
                        padding: 5,
                        border: false,
                        defaults: {
                            anchor: '100%'
                        },
                        items: [
                            {
                                fieldLabel: me.textFieldEdit,
                                xtype: 'displayfield',
                                name: 'field'
                            },
                            {
                                fieldLabel: me.textFieldType,
                                xtype: 'combo',
                                name: 'type',
                                queryMode: 'local',
                                valueField: 'id',
                                displayField: 'text',
                                editable: false,
                                store: Ext.create('Ext.data.Store', {
                                    fields: [
                                        'id',
                                        'text'
                                    ],
                                    data: [
                                        {
                                            'id': 'percentage',
                                            'text': me.textTypePercentage
                                        },
                                        {
                                            'id': 'increment',
                                            'text': me.textTypeIncrement
                                        },
                                        {
                                            'id': 'overwrite',
                                            'text': me.textTypeOverwrite
                                        },
                                        {
                                            'id': 'uniformly',
                                            'text': me.textTypeUniformly
                                        }
                                    ]
                                })
                            },
                            {
                                fieldLabel: me.textFieldValue,
                                xtype: 'numberfield',
                                name: 'value'
                            }
                        ]
                    }
                ],
                buttons: [
                    {
                        text: me.textButtonOk,
                        handler: me.updateRecords,
                        scope: me
                    },
                    {
                        text: me.textButtonCancel,
                        handler: function() {
                            this.view.close();
                        },
                        scope: me
                    }
                ]
            });
        }
    }
});

/**
 * Pivot Simlet does remote pivot calculations.
 * Filtering the pivot results doesn't work.
 */
Ext.define('Ext.ux.ajax.PivotSimlet', {
    extend: 'Ext.ux.ajax.JsonSimlet',
    alias: 'simlet.pivot',
    lastPost: null,
    // last Ajax params sent to this simlet
    lastResponse: null,
    // last JSON response produced by this simlet
    keysSeparator: '',
    grandTotalKey: '',
    doPost: function(ctx) {
        var me = this,
            ret = me.callParent(arguments);
        // pick up status/statusText
        me.lastResponse = me.processData(me.getData(ctx), Ext.decode(ctx.xhr.body));
        ret.responseText = Ext.encode(me.lastResponse);
        return ret;
    },
    processData: function(data, params) {
        var me = this,
            len = data.length,
            response = {
                success: true,
                leftAxis: [],
                topAxis: [],
                results: []
            },
            leftAxis = new Ext.util.MixedCollection(),
            topAxis = new Ext.util.MixedCollection(),
            results = new Ext.util.MixedCollection(),
            i, j, k, leftKeys, topKeys, item, agg;
        me.lastPost = params;
        me.keysSeparator = params.keysSeparator;
        me.grandTotalKey = params.grandTotalKey;
        for (i = 0; i < len; i++) {
            leftKeys = me.extractValues(data[i], params.leftAxis, leftAxis);
            topKeys = me.extractValues(data[i], params.topAxis, topAxis);
            // add record to grand totals
            me.addResult(data[i], me.grandTotalKey, me.grandTotalKey, results);
            for (j = 0; j < leftKeys.length; j++) {
                // add record to col grand totals
                me.addResult(data[i], leftKeys[j], me.grandTotalKey, results);
                // add record to left/top keys pair
                for (k = 0; k < topKeys.length; k++) {
                    me.addResult(data[i], leftKeys[j], topKeys[k], results);
                }
            }
            // add record to row grand totals
            for (j = 0; j < topKeys.length; j++) {
                me.addResult(data[i], me.grandTotalKey, topKeys[j], results);
            }
        }
        // extract items from their left/top collections and build the json response
        response.leftAxis = leftAxis.getRange();
        response.topAxis = topAxis.getRange();
        len = results.getCount();
        for (i = 0; i < len; i++) {
            item = results.getAt(i);
            item.values = {};
            for (j = 0; j < params.aggregate.length; j++) {
                agg = params.aggregate[j];
                item.values[agg.id] = me[agg.aggregator](item.records, agg.dataIndex, item.leftKey, item.topKey);
            }
            delete (item.records);
            response.results.push(item);
        }
        leftAxis.clear();
        topAxis.clear();
        results.clear();
        return response;
    },
    getKey: function(value) {
        var me = this;
        me.keysMap = me.keysMap || {};
        if (!Ext.isDefined(me.keysMap[value])) {
            me.keysMap[value] = Ext.id();
        }
        return me.keysMap[value];
    },
    extractValues: function(record, dimensions, col) {
        var len = dimensions.length,
            keys = [],
            i, j, key, item, dim;
        key = '';
        for (j = 0; j < len; j++) {
            dim = dimensions[j];
            key += (j > 0 ? this.keysSeparator : '') + this.getKey(record[dim.dataIndex]);
            item = col.getByKey(key);
            if (!item) {
                item = col.add(key, {
                    key: key,
                    value: record[dim.dataIndex],
                    dimensionId: dim.id
                });
            }
            keys.push(key);
        }
        return keys;
    },
    addResult: function(record, leftKey, topKey, results) {
        var item = results.getByKey(leftKey + '/' + topKey);
        if (!item) {
            item = results.add(leftKey + '/' + topKey, {
                leftKey: leftKey,
                topKey: topKey,
                records: []
            });
        }
        item.records.push(record);
    },
    sum: function(records, measure, rowGroupKey, colGroupKey) {
        var length = records.length,
            total = 0,
            i;
        for (i = 0; i < length; i++) {
            total += Ext.Number.from(records[i][measure], 0);
        }
        return total;
    },
    avg: function(records, measure, rowGroupKey, colGroupKey) {
        var length = records.length,
            total = 0,
            i;
        for (i = 0; i < length; i++) {
            total += Ext.Number.from(records[i][measure], 0);
        }
        return length > 0 ? (total / length) : 0;
    },
    min: function(records, measure, rowGroupKey, colGroupKey) {
        var data = [],
            length = records.length,
            i, v;
        for (i = 0; i < length; i++) {
            data.push(records[i][measure]);
        }
        v = Ext.Array.min(data);
        return v;
    },
    max: function(records, measure, rowGroupKey, colGroupKey) {
        var data = [],
            length = records.length,
            i;
        for (i = 0; i < length; i++) {
            data.push(records[i][measure]);
        }
        v = Ext.Array.max(data);
        return v;
    },
    count: function(records, measure, rowGroupKey, colGroupKey) {
        return records.length;
    },
    variance: function(records, measure, rowGroupKey, colGroupKey) {
        var me = Ext.pivot.Aggregators,
            length = records.length,
            avg = me.avg.apply(me, arguments),
            total = 0,
            i;
        if (avg > 0) {
            for (i = 0; i < length; i++) {
                total += Math.pow(Ext.Number.from(records[i][measure], 0) - avg, 2);
            }
        }
        return (total > 0 && length > 1) ? (total / (length - 1)) : 0;
    },
    varianceP: function(records, measure, rowGroupKey, colGroupKey) {
        var me = Ext.pivot.Aggregators,
            length = records.length,
            avg = me.avg.apply(me, arguments),
            total = 0,
            i;
        if (avg > 0) {
            for (i = 0; i < length; i++) {
                total += Math.pow(Ext.Number.from(records[i][measure], 0) - avg, 2);
            }
        }
        return (total > 0 && length > 0) ? (total / length) : 0;
    },
    stdDev: function(records, measure, rowGroupKey, colGroupKey) {
        var me = Ext.pivot.Aggregators,
            v = me.variance.apply(me, arguments);
        return v > 0 ? Math.sqrt(v) : 0;
    },
    stdDevP: function(records, measure, rowGroupKey, colGroupKey) {
        var me = Ext.pivot.Aggregators,
            v = me.varianceP.apply(me, arguments);
        return v > 0 ? Math.sqrt(v) : 0;
    }
});

