/**
 * A base class for an event widget. A default implementation is provided
 * by {@link Ext.calendar.Event}. This class should be extended to
 * provide a custom implementation.
 * @abstract
 */
Ext.define('Ext.calendar.EventBase', {
    extend: 'Ext.Gadget',

    config: {
        /**
         * @cfg {String} cls 
         * A class to add to this event.
         */
        cls: null,

        /**
         * @cfg {Date} endDate
         * The end date for this event (as UTC). Will be set automatically if
         * a {@link #model} is passed. May be set independently
         * of any attached {@link #model}.
         */
        endDate: null,

        /**
         * @cfg {String} mode
         * The display mode for this event. Possible options are:
         * - `weekspan`
         * - `weekinline`
         * - `day`
         */
        mode: null,

        /**
         * @cfg {Ext.calendar.model.EventBase} model
         * A backing model for this widget.
         */
        model: null,
        
        /**
         * @cfg {Ext.calendar.theme.Palette} palette
         * A color palette for this event.
         */
        palette: null,

        /**
         * @cfg {Boolean} resize
         * `true` to allow this event to be resized via the UI.
         */
        resize: false,

        /**
         * @cfg {Date} startDate
         * The start date for this event (as UTC). Will be set automatically if
         * a {@link #model} is passed. May be set independently
         * of any attached {@link #model}.
         */
        startDate: null,

        /**
         * @cfg {String} title
         * The title for this event. Will be set automatically if
         * a {@link #model} is passed.
         */
        title: null,

        /**
         * @cfg {Ext.calendar.view.Base} view
         * The view for this event.
         */
        view: null
    },

    /**
     * Clone this event to be used as a proxy for a drag.
     * @return {Ext.calendar.EventBase} The event.
     */
    cloneForProxy: function() {
        var T = this.self;
        return new T(this.getCurrentConfig());
    },

    // Appliers/Updaters
    updateCls: function(cls) {
        if (cls) {
            this.element.addCls(cls);
        }
    },

    updateModel: function(model) {
        var me = this,
            dom;

        if (model) {
            me.setStartDate(model.getStartDate());
            me.setEndDate(model.getEndDate());
            me.setTitle(model.getTitle());

            dom = me.element.dom;
            dom.setAttribute('data-eventId', model.id);
            dom.setAttribute('data-calendarId', model.getCalendarId());
        }
    },

    destroy: function() {
        this.setView(null);
        this.setModel(null);
        this.callParent();
    }
});