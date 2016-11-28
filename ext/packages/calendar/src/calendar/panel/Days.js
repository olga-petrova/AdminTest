/**
 * A panel for display a series of days. Composes a 
 * {@link Ext.calendar.view.Days Days View} with a docked header.
 *
 * Configurations for the view can be specified directly on the panel:
 *
 *      {
 *          xtype: 'calendar-days',
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
Ext.define('Ext.calendar.panel.Days', {
    extend: 'Ext.calendar.panel.Base',
    xtype: 'calendar-days',

    requires: [
        'Ext.calendar.header.Days',
        'Ext.calendar.view.Days',
        'Ext.scroll.Scroller'
    ],

    config: {
        /**
         * @inheritdoc
         */
        dayHeader: {
            xtype: 'calendar-daysheader'
        },

        /**
         * @inheritdoc
         */
        eventRelayers: {
            view: {
                /**
                * @inheritdoc Ext.calendar.view.Days#beforeeventdragstart
                */
                beforeeventdragstart: true,

                /**
                * @inheritdoc Ext.calendar.view.Days#validateeventdrop
                */
                validateeventdrop: true,

                /**
                * @inheritdoc Ext.calendar.view.Days#eventdrop
                */
                eventdrop: true,

                /**
                * @inheritdoc Ext.calendar.view.Days#beforeeventresizestart
                */
                beforeeventresizestart: true,

                /**
                * @inheritdoc Ext.calendar.view.Days#validateeventresize
                */
                validateeventresize: true,

                /**
                * @inheritdoc Ext.calendar.view.Days#eventresize
                */
                eventresize: true
            }
        },

        /**
         * @inheritdoc
         */
        view: {
            xtype: 'calendar-daysview'
        }
    },

    /**
     * @inheritdoc
     */
    configExtractor: {
        dayHeader: {
            /**
             * @inheritdoc Ext.calendar.header.Days#format
             */
            dayHeaderFormat: 'format'
        },

        view: {
            /**
             * @inheritdoc Ext.calendar.view.Days#allowSelection
             */
            allowSelection: true,

            /**
             * @inheritdoc Ext.calendar.view.Days#displayOverlap
             */
            displayOverlap: true,

            /**
             * @inheritdoc Ext.calendar.view.Days#draggable
             */
            draggable: true,

            /**
             * @inheritdoc Ext.calendar.view.Days#droppable
             */
            droppable: true,

            /**
             * @inheritdoc Ext.calendar.view.Days#endTime
             */
            endTime: true,

            /**
             * @inheritdoc Ext.calendar.view.Days#resizeEvents
             */
            resizeEvents: true,

            /**
             * @inheritdoc Ext.calendar.view.Days#showNowMarker
             */
            showNowMarker: true,

            /**
             * @inheritdoc Ext.calendar.view.Days#startTime
             */
            startTime: true,

            /**
             * @inheritdoc Ext.calendar.view.Days#timeFormat
             */
            timeFormat: true,

            /**
             * @inheritdoc Ext.calendar.view.Days#visibleDays
             */
            visibleDays: true
        }
    },

    /**
     * @inheritdoc Ext.calendar.view.Days#setTimeRange
     */
    setTimeRange: function(start, end) {
        this.getView().setTimeRange(start, end);
    },

    privates: {
        /**
         * @property {Boolean} syncHeaderSize
         * Indicates that we need to sync the header size
         * with the body.
         *
         * @private
         */
        syncHeaderSize: true
    }
});