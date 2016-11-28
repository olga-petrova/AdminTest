/**
 * A panel for display a single day. Composes a 
 * {@link Ext.calendar.view.Day Day View} with a docked header.
 *
 * Configurations for the view can be specified directly on the panel:
 *
 *      {
 *          xtype: 'calendar-day',
 *          resizeEvents: false,
 *          startTime: 8,
 *          endTime: 16,
 *          listeners: {
 *              eventdrop: function() {
 *                  console.log('Dropped');
 *              }
 *          }
 *      }
 */
Ext.define('Ext.calendar.panel.Day', {
    extend: 'Ext.calendar.panel.Days',
    xtype: 'calendar-day',

    requires: [
        'Ext.calendar.view.Day'
    ],

    config: {
        /**
         * @inheritdoc
         */
        view: {
            xtype: 'calendar-dayview'
        }
    }

    /**
     * @inheritdoc Ext.calendar.view.Day#visibleDays
     */
});