/**
 * Display a single week as a series of detailed days. The week is defined by
 * the {@link #firstDayOfWeek} and the {@link #value}.
 */
Ext.define('Ext.calendar.view.Week', {
    extend: 'Ext.calendar.view.Days',
    xtype: 'calendar-weekview',

    config: {
        /**
         * @cfg {Number} firstDayOfWeek
         * The day on which the calendar week begins. `0` (Sunday) through `6` (Saturday).
         * Defaults to {@link Ext.Date#firstDayOfWeek}
         */
        firstDayOfWeek: undefined,

        /**
         * @cfg {Date} [value=new Date()]
         * The start of the date range to show. The visible range of the view will begin
         * at the {@link #firstDayOfWeek} immediately preceding this value, or the value if
         * it is the {@link #firstDayOfWeek}. For example, using the following configuration:
         *
         *      {
         *          firstDayOfWeek: 0, // Sunday
         *          value: new Date(2010, 2, 3) // Wed, 3 March 2010
         *      }
         *
         * The visible range would begin on Sun 28th Feb.
         */
        
        /**
         * @inheritdoc
         */
        visibleDays: 7
    },

    // Appliers/Updaters
    applyFirstDayOfWeek: function(firstDayOfWeek) {
        if (typeof firstDayOfWeek !== 'number') {
            firstDayOfWeek = Ext.Date.firstDayOfWeek;
        }
        return firstDayOfWeek;
    },

    updateFirstDayOfWeek: function() {
        var me = this;

        if (!me.isConfiguring) {
            me.recalculate();
            me.refreshHeaders();
            me.checkNowMarker();
        }
    },

    privates: {
        /**
         * @inheritdoc
         */
        doRecalculate: function() {
            var me = this,
                D = Ext.Date,
                v = me.getValue(),
                value = me.toUtcOffset(v.getFullYear(), v.getMonth(), v.getDate(), 0),
                daysInWeek = D.DAYS_IN_WEEK,
                // The number of days before the value date to reach the previous firstDayOfWeek
                startOffset = (value.getDay() + daysInWeek - me.getFirstDayOfWeek()) % daysInWeek;

            return me.callParent([D.subtract(value, D.DAY, startOffset)]);
        },

        /**
         * @inheritdoc
         */
        getMoveBaseValue: function() {
            return this.active.full.start;
        },

        /**
         * @inheritdoc
         */
        getMoveInterval: function() {
            var D = Ext.Date;
            return {
                unit: D.DAY,
                amount: D.DAYS_IN_WEEK
            };
        }
    }
});