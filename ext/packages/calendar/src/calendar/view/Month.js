/**
 * This view displays events over entire month. The view shows a summary of 
 * the events that occur on each day. It provides several extra
 * capabilities than the {@link Ext.calendar.view.Weeks weeks} view.
 *
 * - The {@link #value} will use the first date of the specified month, so
 * passing `new Date()` as the initial value is equivalent to specifying the
 * current month.
 *
 * - It will display (as needed) days from trailing/leading months as required to 
 * fill the space in the view based on the {@link #value} and the {@link #firstDayOfWeek}.
 * In the following example, the view will start on the Sun Dec 27 and conclude on Sat Feb 6,
 * because we require 6 rows to display the month of January.
 *
 *      {
 *          value: new Date(2010, 0, 1) // Fri
 *          firstDayOfWeek: 0 // Sunday
 *      }
 *
 * - The {@link #visibleWeeks} can be specified as `null` to allow the view to calculate
 * the appropriate number of rows to show in the view, as this varies from month to month.
 * This defaults to the largest possible value (6 weeks) so that the view size is consistent
 * across months.
 */
Ext.define('Ext.calendar.view.Month', {
    extend: 'Ext.calendar.view.Weeks',
    xtype: 'calendar-monthview',

    config: {
        /**
         * @cfg {Date} [value=new Date()]
         * The current month to show. The value will default to the 
         * first date of the configured month.  For example:
         *
         *      calendar.setValue(new Date(2010, 0, 13));
         *      console.log(calendar.getValue()); // -> 2010-01-01
         */
        value: undefined,
        
        /**
         * @cfg {Number} [visibleWeeks=6]
         * The number of weeks to show in this view. If specified as `null`, the view will generate the appropriate
         * number of rows to display a full month based on the passed {@link #value}. In a majority of cases, 
         * this will be 5, however some months will only require 4, while others will need 6. Defaults to the
         * largest value to keep the view size consistent.
         */
        visibleWeeks: 6
    },

    /**
     * Move forward by a number of months.
     * @param {Number} [months=1] The number of months to move.
     */
    nextMonth: function(months) {
        this.navigate(this.getNavigateValue(months), Ext.Date.MONTH);
    },

    /**
     * Move forward by a number of years.
     * @param {Number} [years=1] The number of years to move.
     */
    nextYear: function(years) {
        this.navigate(this.getNavigateValue(years), Ext.Date.YEAR);
    },

    /**
     * Move backward by a number of months.
     * @param {Number} [months=1] The number of months to move.
     */
    previousMonth: function(months) {
        this.navigate(-this.getNavigateValue(months), Ext.Date.MONTH);
    },

    /**
     * Move backward by a number of years.
     * @param {Number} [years=1] The number of years to move.
     */
    previousYear: function(years) {
        this.navigate(-this.getNavigateValue(years), Ext.Date.YEAR);
    },

    // Appliers/Updaters
    applyValue: function(value, oldValue) {
        value = this.callParent([value, oldValue]);
        if (value && value.getDate() !== 1) {
            // Date is cloned in the superclass
            value.setDate(1);
        }
        if (value && oldValue && value.getTime() === oldValue.getTime()) {
            value = undefined;
        }
        return value;
    },

    privates: {
        displayRangeProp: 'monthRange',

        /**
         * @property {Number} maxWeeks
         * The maximum amount of weeks to be shown 
         *
         * @private
         */
        maxWeeks: 6,

        /**
         * @property {String[]} rowClasses
         * The row classes for the view when they are to be displayed as 
         * @private
         */
        $rowClasses: [
            Ext.baseCSSPrefix + 'calendar-month-4weeks',
            Ext.baseCSSPrefix + 'calendar-month-5weeks',
            Ext.baseCSSPrefix + 'calendar-month-6weeks'
        ],

        /**
         * @inheritdoc
         */
        trackRanges: true,

        /**
         * Calculate the relevant date ranges given the current value.
         * @return {Object} The active values.
         * @return {Date[]} return.visibleRange The visible date range.
         * @return {Date[]} return.activeRange The active range for the view.
         * @return {Date[]} return.monthRange The month range for the view.
         * @return {Number} return.requireWeeks The number of weeks in the current view.
         *
         * @private
         */
        doRecalculate: function() {
            var me = this,
                D = Ext.Date,
                daysInWeek = D.DAYS_IN_WEEK,
                firstDayOfWeek = me.getFirstDayOfWeek(),
                v = me.getValue(),
                first = me.toUtcOffset(v.getFullYear(), v.getMonth(), v.getDate(), 0),
                l = D.getLastDateOfMonth(v),
                last = me.toUtcOffset(l.getFullYear(), l.getMonth(), l.getDate(), 0),
                visibleWeeks = me.getVisibleWeeks(),
                visibleDays = me.getVisibleDays(),
                visibleRange = [],
                // The number of days before the value date to reach the previous firstDayOfWeek
                startOffset = (first.getDay() + daysInWeek - firstDayOfWeek) % daysInWeek,
                requiredWeeks = me.maxWeeks,
                days, end;

            // A null value means we need to figure out how many weeks we need
            if (visibleWeeks === null) {
                if (startOffset >= visibleDays) {
                    startOffset = visibleDays - startOffset;
                }
                days = startOffset + D.getDaysInMonth(first);
                requiredWeeks = Math.ceil(days / daysInWeek);
            }

            end = daysInWeek * requiredWeeks - (daysInWeek - visibleDays);

            visibleRange[0] = D.subtract(first, D.DAY, startOffset);
            visibleRange[1] = D.add(visibleRange[0], D.DAY, end);

            return {
                visibleRange: visibleRange,
                activeRange: [visibleRange[0], D.subtract(visibleRange[1], D.DAY, 1)],
                monthRange: [first, last],
                requiredWeeks: requiredWeeks
            };
        },

        /**
         * @inheritdoc
         */
        doRefresh: function() {
            var me = this,
                cls = me.$rowClasses,
                weeks = me.active.requiredWeeks;

            me.element.replaceCls(cls, cls[weeks - 1 - cls.length]);

            me.callParent();
        },

        /**
         * @inheritdoc
         */
        getMoveBaseValue: function() {
            return this.active.monthRange[0];
        },

        /**
         * @inheritdoc
         */
        getMoveInterval: function() {
            return {
                unit: Ext.Date.MONTH,
                amount: 1
            };
        },

        /**
         * @inheritdoc
         */
        generateCells: function() {
            // Always generate the max number of cells and we'll hide/show as needed.
            return this.callParent([this.maxWeeks, false]);
        },

        /**
         * Gets the value to navigate by, if no value is specified then
         * it will default to `1`.
         * @param {Number} n Get the value to navigate by.
         * @return {Number} The value to navigate by, `1` if no value is passed.
         *
         * @private
         */
        getNavigateValue: function(n) {
            return n || n === 0 ? n : 1;
        }
    }
});