/**
 * A panel for display a Week. Composes a 
 * {@link Ext.calendar.view.Week Week View} with a docked header.
 *
 * Configurations for the view can be specified directly on the panel:
 *
 *      {
 *          xtype: 'calendar-week',
 *          firstDayOfWeek: 1,
 *          visibleDays: 5,
 *          listeners: {
 *              eventdrop: function() {
 *                  console.log('Dropped');
 *              }
 *          }
 *      }
 */
Ext.define('Ext.calendar.panel.Week', {
    extend: 'Ext.calendar.panel.Days',
    xtype: 'calendar-week',

    requires: [
        'Ext.calendar.view.Week'
    ],

    config: {
        /**
         * @inheritdoc
         */
        view: {
            xtype: 'calendar-weekview'
        }
    },

    configExtractor: {
        view: {
            /**
             * @inheritdoc Ext.calendar.view.Week#firstDayOfWeek
             */
            firstDayOfWeek: true

            /**
             * @inheritdoc Ext.calendar.view.Week#value
             */

            /**
             * @inheritdoc Ext.calendar.view.Week#visibleDays
             */
        }
    }
});