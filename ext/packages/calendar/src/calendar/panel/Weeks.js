/**
 * A panel for display a series of weeks. Composes a 
 * {@link Ext.calendar.view.Weeks Weeks View} with a docked header.
 *
 * Configurations for the view can be specified directly on the panel:
 *
 *      {
 *          xtype: 'calendar-weeks',
 *          showOverflow: false,
 *          visibleWeeks: 3,
 *          dayFormat: 'd',
 *          listeners: {
 *              eventdrop: function() {
 *                  console.log('Dropped');
 *              }
 *          }
 *      }
 */
Ext.define('Ext.calendar.panel.Weeks', {
    extend: 'Ext.calendar.panel.Base',
    xtype: 'calendar-weeks',

    requires: [
        'Ext.calendar.header.Weeks',
        'Ext.calendar.view.Weeks'
    ],

    config: {
        /**
         * @inheritdoc
         */
        dayHeader: {
            xtype: 'calendar-weeksheader'
        },

        /**
         * @inheritdoc
         */
        eventRelayers: {
            view: {
                /**
                 * @inheritdoc Ext.calendar.view.Weeks#beforeeventdragstart
                 */
                beforeeventdragstart: true,

                /**
                 * @inheritdoc Ext.calendar.view.Weeks#validateeventdrop
                 */
                validateeventdrop: true,

                /**
                 * @inheritdoc Ext.calendar.view.Weeks#eventdrop
                 */
                eventdrop: true
            }
        },

        /**
         * @inheritdoc
         */
        view: {
            xtype: 'calendar-weeksview'
        }
    },

    /**
     * @inheritdoc
     */
    configExtractor: {
        dayHeader: {
            /**
             * @inheritdoc Ext.calendar.header.Weeks#format
             */
            dayHeaderFormat: 'format'
        },

        view: {
            /**
             * @inheritdoc Ext.calendar.view.Weeks#addOnSelect
             */
            addOnSelect: true,

            /**
             * @inheritdoc Ext.calendar.view.Weeks#addOnSelect
             */
            allowSelection: true,

            /**
             * @inheritdoc Ext.calendar.view.Weeks#addOnSelect
             */
            dayFormat: true,

            /**
             * @inheritdoc Ext.calendar.view.Weeks#addOnSelect
             */
            draggable: true,

            /**
             * @inheritdoc Ext.calendar.view.Weeks#addOnSelect
             */
            droppable: true,

            /**
             * @inheritdoc Ext.calendar.view.Weeks#addOnSelect
             */
            firstDayOfWeek: true,

            /**
             * @inheritdoc Ext.calendar.view.Weeks#addOnSelect
             */
            overflowText: true,

            /**
             * @inheritdoc Ext.calendar.view.Weeks#showOverflow
             */
            showOverflow: true,

            /**
             * @inheritdoc Ext.calendar.view.Weeks#addOnSelect
             */
            visibleDays: true,

            /**
             * @inheritdoc Ext.calendar.view.Weeks#addOnSelect
             */
            visibleWeeks: true,

            /**
             * @inheritdoc Ext.calendar.view.Weeks#addOnSelect
             */
            weekendDays: true
        }
    }
});