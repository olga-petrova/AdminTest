/**
 * A target for events for the all day section of {@link Ext.calendar.view.Days}.
 * 
 * @private
 */
Ext.define('Ext.calendar.dd.DaysAllDayTarget', {
    extend: 'Ext.drag.Target',

    requires: [
        'Ext.calendar.util.Dom',
        'Ext.calendar.date.Util',
        'Ext.calendar.date.Range'
    ],

    config: {
        view: null
    },

    updateView: function(view) {
        if (view) {
            this.setElement(view.allDayContent);
        }
    },

    accepts: function(info) {
        return Ext.Array.contains(info.types, 'calendar-event-allday');
    },

    onDragMove: function(info) {
        var D = Ext.Date,
            view = info.view,
            index;

        if (info.valid) {
            index = Ext.calendar.util.Dom.getIndexPosition(info.positions, info.cursor.current.x);
            view.selectRange(index, index + info.span - 1);
        }
        this.callParent([info]);
    },

    onDragLeave: function(info) {
        this.getView().clearSelected();
        this.callParent([info]);
    },

    onDrop: function(info) {
        var D = Ext.Date,
            view = info.view,
            event = info.event,
            index = Ext.calendar.util.Dom.getIndexPosition(info.positions, info.cursor.current.x),
            d = D.add(view.active.full.start, D.DAY, index),
            start = Ext.calendar.date.Util.clearTimeUtc(event.getStartDate(), true),
            before = d < start;
            difference = D.diff(before ? d : start, before ? start : d, D.DAY);

        if (before) {
            difference = -difference;
        }
  
        view.handleChange('drop', event, new Ext.calendar.date.Range(
            D.add(event.getStartDate(), D.DAY, difference),
            D.add(event.getEndDate(), D.DAY, difference)
        ), function() {
            view.clearSelected();
        });

        this.callParent([info]);
    },

    destroy: function() {
        this.setView(null);
        this.callParent();
    }
})