/**
 * A target for events for the body of {@link Ext.calendar.view.Days}.
 * 
 * @private
 */
Ext.define('Ext.calendar.dd.DaysBodyTarget', {
    extend: 'Ext.drag.Target',

    config: {
        view: null
    },

    updateView: function(view) {
        if (view) {
            this.setElement(view.bodyTable);
        }
    },

    accepts: function(info) {
        return Ext.Array.contains(info.types, 'calendar-event');
    },

    onDragMove: function(info) {
        var sizes = info.sizes,
            view = info.view,
            event = info.event,
            D = Ext.Date,
            y, start, end;

        if (info.valid) {
            y = Math.max(0, info.proxy.current.y - view.bodyTable.getY());
            slot = Math.floor(y / sizes.slotStyle.halfHeight);
            start = D.clone(view.active.visible.start);
            start = D.add(start, D.DAY, info.dayIndex || 0);

            start = D.add(start, D.MINUTE, view.minimumEventMinutes * slot);
            end = D.add(start, D.MINUTE, event.getDuration());

            info.widgetClone.setStartDate(start);
            info.widgetClone.setEndDate(end);

            info.range = [start, end];
        }
        this.callParent([info]);
    },

    onDrop: function(info) {
        var view = this.getView(),
            proxy = info.source.getProxy();

        info.deferCleanup = true;

        view.handleChange('drop', info.event, new Ext.calendar.date.Range(
            info.range[0], 
            info.range[1]
        ), function() {
            proxy.cleanup();
            var w = info.widget;
            if (!w.destroyed) {
                w.element.show();
            }
            view.clearSelected();
        });
        this.callParent([info]);
    },

    destroy: function() {
        this.setView(null);
        this.callParent();
    }
})