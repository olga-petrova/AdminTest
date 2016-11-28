/**
 * A panel for display a calendar month. Composes a 
 * {@link Ext.calendar.view.Month Month View} with a docked header.
 *
 * Configurations for the view can be specified directly on the panel:
 *
 *      {
 *          xtype: 'calendar-weeks',
 *          showOverflow: false,
 *          visibleWeeks: null, // Auto size
 *          draggable: false,
 *          listeners: {
 *              eventdrop: function() {
 *                  console.log('Dropped');
 *              }
 *          }
 *      }
 */
Ext.define('Ext.calendar.panel.Month', {
    extend: 'Ext.calendar.panel.Weeks',
    xtype: 'calendar-month',

    requires: [
        'Ext.calendar.view.Month'
    ],

    config: {
        /**
         * @inheritdoc
         */
        view: {
            xtype: 'calendar-monthview'
        }
    },

    /**
     * @inheritdoc Ext.calendar.view.Month#value
     */
    
    /**
     * @inheritdoc Ext.calendar.view.Month#visibleWeeks
     */
    
    /**
     * @inheritdoc Ext.calendar.view.Month#nextMonth
     */
    nextMonth: function(months) {
        this.getView().nextMonth(months);
    },

    /**
     * @inheritdoc Ext.calendar.view.Month#nextYear
     */
    nextYear: function(years) {
        this.getView().nextYear(yers);
    },

    /**
     * @inheritdoc Ext.calendar.view.Month#previousMonth
     */
    previousMonth: function(months) {
        this.getView().previousMonth(months);
    },

    /**
     * @inheritdoc Ext.calendar.view.Month#previousYear
     */
    previousYear: function(years) {
        this.getView().previousYears(years);
    }
});