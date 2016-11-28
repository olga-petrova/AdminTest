/**
 * A target for events for {@link Ext.calendar.view.Weeks}.
 * 
 * @private
 */
Ext.define('Ext.calendar.dd.WeeksTarget', {
    extend: 'Ext.drag.Target',

    requires: [
        'Ext.calendar.date.Range',
        'Ext.calendar.date.Util'
    ],

    config: {
        view: null
    },

    updateView: function(view) {
        if (view) {
            this.setElement(view.element);
        }
    },

    accepts: function(info) {
        return Ext.Array.contains(info.types, 'calendar-event');
    },

    onDragMove: function(info) {
        var D = Ext.Date,
            view = info.view,
            cursor = info.cursor.current,
            span = info.span,
            cell, d, end;

        if (info.valid) {
            cell = view.getCellByPosition(cursor.x, cursor.y);
            d = end = view.getDateFromCell(cell);

            end = D.add(d, D.DAY, span - 1);
            view.selectRange(d, end);
        }
        this.callParent([info]);
    },

    onDragLeave: function(info) {
        this.getView().clearSelected();
        this.callParent([info]);
    },

    onDrop: function(info) {
        var D = Ext.Date,
            cursor = info.cursor.current,
            view = info.view,
            cell = view.getCellByPosition(cursor.x, cursor.y),
            d = D.localToUtc(view.getDateFromCell(cell)),
            event = info.event,
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