/**
 * This view displays events for a single day, with the time of day 
 * along the y axis.
 *
 * It also allows for any events that span the entire day to be viewed in
 * a separate area.
 */
Ext.define('Ext.calendar.view.Day', {
    extend: 'Ext.calendar.view.Days',
    xtype: 'calendar-dayview',

    config: {
        /**
         * @inheritdoc
         */
        compactOptions: {
            displayOverlap: true
        },

        /**
         * @inheritdoc
         */
        visibleDays: 1
    },

    privates: {
        /**
         * @inheritdoc
         */
        getMoveInterval: function() {
            return {
                unit: Ext.Date.DAY,
                amount: 1
            };
        }
    }
});