/** */
Ext.define('Ext.calendar.store.Events', {
    extend: 'Ext.data.Store',
    alias: 'store.calendar-events',

    model: 'Ext.calendar.model.Event',

    requires: [
        'Ext.calendar.model.Event',
        'Ext.calendar.date.Range'
    ],

    config: {
        /**
         * @cfg {Ext.calendar.model.Calendar} calendar
         * The calendar for the events.
         */
        calendar: null,

        /**
         * @cfg {String} calendarParam
         * The parameter name for the calendar to be sent to the server.
         */
        calendarParam: 'calendar',

        /**
         * @cfg {String} dateFormat
         * The date format to send to the server.
         */
        dateFormat: 'C',

        /**
         * @cfg {String} endParam
         * The parameter name for the end date to be sent to the server.
         */
        endParam: 'endDate',

        /**
         * @cfg {String} prefetchMode
         * The prefetch mode for pre-loading records on either side of the active range.
         * Possible values are:
         * - `month`
         * - `week`
         * - `day`
         *
         * If this store will be used amongst multiple views, it is recommended to use the largest
         * unit.
         */
        prefetchMode: 'month',

        /**
         * @cfg {String} startParam
         * The parameter name for the start date to be sent to the server.
         */
        startParam: 'startDate'
    },

    remoteSort: false,
    pageSize: 0,

    sorters: [{
        direction: 'ASC',
        sorterFn: function(a, b) {
            return Ext.calendar.model.Event.sort(a, b);
        }
    }],

    prefetchSettings: {
        month: {
            unit: Ext.Date.MONTH,
            amount: 2
        },
        week: {
            unit: Ext.Date.WEEK,
            amount: 2
        },
        day: {
            unit: Ext.Date.DAY,
            amount: 4
        }
    },

    constructor: function(config) {
        this.requests = {};
        this.callParent([config]);
    },

    /**
     * Gets a list of events that occurs in the specified range.
     * @param {Date} start The start of the range.
     * @param {Date} end The end of the range.
     * @return {Ext.calendar.model.EventBase[]} The events.
     */
    getInRange: function(start, end) {
        var records = this.data.items,
            len = records.length,
            ret = [],
            i, rec;

        for (i = 0; i < len; ++i) {
            rec = records[i];
            if (rec.occursInRange(start, end)) {
                ret.push(rec);
            }
        }

        return ret;
    },

    /**
     * Checks whether a particular date range is cached in this store.
     * @param {Date} start The start of the range.
     * @param {Date} end The end of the range.
     * @return {Boolean} `true` if the range is cached.
     */
    hasRangeCached: function(start, end) {
        var range = this.range,
            ret = false;

        if (range) {
            ret = range.full.containsRange(start, end);
        }
        return ret;
    },

    /**
     * Sets the range for the current store. This may trigger the
     * store to load, or to prefetch events.
     * @param {Date} start The start of the range.
     * @param {Date} end The end of the range.
     */
    setRange: function(start, end) {
        var me = this,
            D = Ext.Date,
            R = Ext.calendar.date.Range,
            range = me.range,
            prefetchSettings = me.getPrefetchSetting(),
            fullStart = D.subtract(start, prefetchSettings.unit, prefetchSettings.amount),
            fullEnd = D.add(end, prefetchSettings.unit, prefetchSettings.amount),
            requested = me.requested,
            newRange = {
                actual: new R(start, end),
                full: new R(fullStart, fullEnd)
            },
            fetchCount = 0,
            isLeading = false,
            fetchStart, fetchEnd;

        if (me.compareRange(range, newRange)) {
            return;
        }

        if (range && range.full.containsRange(newRange.full)) {
            return;
        }

        if (me.hasRangeCached(start, end)) {
            if (!me.hasRangeCached(fullStart, fullEnd)) {
                if (range.full.start > fullStart) {
                    fetchStart = fullStart;
                    fetchEnd = range.full.start;
                    ++fetchCount;
                    isLeading = true;
                }

                if (range.full.end < fullEnd) {
                    fetchStart = range.full.end;
                    fetchEnd = fullEnd;
                    ++fetchCount;
                }

                if (fetchCount === 1) {
                    me.prefetchRange(fetchStart, fetchEnd, isLeading, newRange);
                } else if (fetchCount === 2) {
                    me.loadRange(fullStart, fullEnd, newRange);
                }
                //<debug>
                else {
                    Ext.raise('Should never be here.');
                }
                //</debug>
            }
        } else {
            me.loadRange(newRange.full.start, newRange.full.end, newRange);
        }

        me.requested = newRange;
    },

    // Overrides
    onProxyLoad: function(operation) {
        var me = this;

        if (operation.wasSuccessful()) {
            me.range = me.requested;
            me.requested = null;
        }
        me.setCalendarFromLoad = true;
        me.callParent([operation]);
        me.setCalendarFromLoad = false;
    },

    onCollectionAdd: function(collection, info) {
        var me = this;
        me.setRecordCalendar(me.getCalendar(), info.items, !me.setCalendarFromLoad);
        me.callParent([collection, info]);
    },

    onCollectionRemove: function(collection, info) {
        this.callParent([collection, info]);
        if (!this.isMoving) {
            this.setRecordCalendar(null, info.items, true);
        }
    },

    privates: {
        isMoving: 0,

        abortAll: function() {
            var requests = this.requests,
                id;

            for (id in requests) {
                requests[id].abort();
            }
            this.requests = {};
        },

        compareRange: function(a, b) {
            var ret = false;

            if (!a || !b) {
                ret = (a || null) === (b || null);
            } else {
                ret = a.full.equals(b.full) && a.actual.equals(b.actual);
            }
            return ret;
        },

        getPrefetchSetting: function() {
            return this.prefetchSettings[this.getPrefetchMode()];
        },

        loadRange: function(start, end, newRequested) {
            var me = this,
                requested = me.requested,
                range = new Ext.calendar.date.Range(start, end)

            // We don't have the range cached, are we requesting it?
            if (!(requested && requested.full.equals(range))) {
                me.abortAll();

                me.load({
                    params: me.setupParams(start, end),
                    requested: newRequested
                });
            }
        },

        onBeforeLoad: function(operation) {
            this.requests[operation._internalId] = operation;
        },

        onPrefetch: function(operation) {
            var me = this,
                records = operation.getRecords() || [],
                toPrune = [],
                map = Ext.Array.toMap(records, 'id'),
                range = me.getDataSource().getRange(),
                len = range.length,
                start = me.range.full.start,
                end = me.range.full.end,
                i, rec;

            if (operation.wasSuccessful()) {
                me.range = me.requested;
                me.requested = null;
            }

            delete me.requests[operation._internalId];

            me.suspendEvents();
            for (i = 0; i < len; ++i) {
                rec = range[i];
                if (!(map[rec.id] || rec.occursInRange(start, end))) {
                    toPrune.push(rec);
                }
            }

            me.ignoreCollectionRemove = me.setCalendarFromLoad = true;
            me.getData().splice(0, toPrune, records);
            me.ignoreCollectionRemove = me.setCalendarFromLoad = false;
            me.resumeEvents();

            me.fireEvent('prefetch', me, records, toPrune);
        },

        prefetch: function(options) {
            var me = this, 
                operation;

            options = Ext.apply({
                internalScope: me,
                internalCallback: me.onPrefetch
            }, options);

            me.setLoadOptions(options);

            operation = me.createOperation('read', options);
            me.requests[operation._internalId] = operation;
            operation.execute();
        },

        prefetchRange: function(start, end, isLeading, newRequested) {
            this.prefetch({
                params: this.setupParams(start, end),
                isLeading: isLeading,
                newRequested: newRequested
            });
        },

        setRecordCalendar: function(calendar, records, dirty) {
            var len = records.length,
                i, record;

            for (i = 0; i < len; ++i) {
                record = records[i];
                record.$moving = true;
                record.setCalendar(calendar, dirty);
                delete record.$moving;
            }
        },

        setupParams: function(start, end) {
            var me = this,
                D = Ext.Date,
                format = me.getDateFormat(),
                params = {};

            params[me.getCalendarParam()] = me.getCalendar().id;
            params[me.getStartParam()] = D.format(start, format);
            params[me.getEndParam()] = D.format(end, format);

            return params;
        }
    }
});