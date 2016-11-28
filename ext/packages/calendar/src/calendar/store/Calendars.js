Ext.define('Ext.calendar.store.Calendars', {
    extend: 'Ext.data.Store',
    alias: 'store.calendar-calendars',

    requires: [
        'Ext.calendar.store.EventSource',
        'Ext.calendar.model.Calendar'
    ],

    config: {
        eventStoreDefaults: null
    },

    model: 'Ext.calendar.model.Calendar',

    onCollectionAdd: function(collection, info) {
        var cfg = this.getEventStoreDefaults(),
            items = info.items,
            len = items.length,
            i, rec;

        this.callParent([collection, info]);
        if (cfg) {
            for (i = 0; i < len; ++i) {
                rec = items[i];
                if (!rec.hasOwnProperty('eventStoreDefaults')) {
                    rec.eventStoreDefaults = Ext.merge({}, rec.eventStoreDefaults, cfg);
                }
            }
        }
    },

    privates: {
        getEventSource: function() {
            var source = this.eventSource;
            if (!source) {
                this.eventSource = source = new Ext.calendar.store.EventSource({
                    source: this
                });
            }
            return source;
        }
    }
});