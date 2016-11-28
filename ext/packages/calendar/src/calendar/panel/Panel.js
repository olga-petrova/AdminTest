/**
 * This class is the main calendar panel.
 *
 * It allows switching between multiple views of the same dataset. It
 * is composed of the other calendar types such as {@link Ext.calendar.panel.Month},
 * {@link Ext.calendar.panel.Week} and {@link Ext.calendar.panel.Day}.
 */
Ext.define('Ext.calendar.panel.Panel', {
    extend: 'Ext.calendar.panel.AbstractPanel',
    xtype: 'calendar',

    requires: [
        'Ext.calendar.panel.Day',
        'Ext.calendar.panel.Week',
        'Ext.calendar.panel.Month',
        'Ext.calendar.List'
    ],

    platformConfig: {
        phone:  {
            compact: true
        }
    },

    config: {
        /**
         * @cfg {Boolean} compact
         * `true` to display in compact mode, typically used
         * for smaller form factors.
         */
        compact: false,

        /**
         * @cfg {Object/Ext.calendar.store.Calendars} store
         * A calendar store instance or configuration.
         */
        store: null,

        /**
         * @cfg {Number} timezoneOffset
         * The timezone offset to display this calendar in. The value should be
         * specified in the same way as the native Date offset. That is, the number
         * of minutes between UTC and local time. For example the offset for UTC+10
         * would be -600 (10 hours * 60 minutes ahead).
         *
         * Defaults to the current browser offset.
         */
        timezoneOffset: undefined,

        /**
         * @cfg {Date} value
         * The value that controls the underlying {@link #views}.
         */
        value: undefined,

        //<locale>
        /**
         * @cfg {Object} views
         * The calendar views to have available, each item in
         * this configuration (labelled by a key) is to contain
         * the configuration for the view. There are also other
         * configurations available only when used in conjunction
         * with this panel:
         *
         * - `label` - A label to display on the switcher display.
         * - `weight` - A number to indicate the order in which items are
         * displayed, lower numbers are displayed first.
         * - `titleTpl` - A template string for displaying the current date title.
         * The values passed are the start and end dates.
         * - `isDefault` - `true` to mark a view as the default view.
         */
        views: {
            day: {
                xtype: 'calendar-day',
                titleTpl: '{start:date("l F d, Y")}',
                controlStoreRange: false,
                label: 'Day',
                weight: 10,
                dayHeader: null
            },
            week: {
                xtype: 'calendar-week',
                dayHeaderFormat: 'D d',
                controlStoreRange: false,
                titleTpl: '{start:date("j M")} - {end:date("j M")}',
                label: 'Week',
                weight: 20
            },
            month: {
                xtype: 'calendar-month',
                titleTpl: '{start:date("F Y")}',
                label: 'Month',
                weight: 30,
                isDefault: true
            }
        }
        //</locale>
    },

    cls: Ext.baseCSSPrefix + 'calendar-panel',

    /**
     * @method setViews
     * @hide
     */

     //<locale>
     /**
      * @cfg {String} sidebarTitle
      * A title to show for the calendar sidebar.
      */
    sidebarTitle: 'Calendars',
    //</locale>

    //<locale>
    /**
     * @cfg {String} createText
     * Text to show for the create button.
     */
    createText: 'Create',
    //</locale>

    //<locale>
    /**
     * @cfg {String} todayText
     * Text to show for the today button.
     */
    todayText: 'Today',
    //</locale>

    //<locale>
    /**
     * @cfg {String} nextText
     * Text to show for the button the moves the active view forward.
     */
    nextText: '>',
    //</locale>

    //<locale>
    /**
     * @cfg {String} previousText
     * Text to show for the button the moves the active view backward.
     */
    previousText: '<',
    //</locale>

    /**
     * Moves the active view forward. The amount moved
     * depends on the current view.
     */
    moveNext: function() {
        var view = this.activeView;
        view.moveNext();
        this.setValue(view.getValue());
    },

    /**
     * Moves the active view backward. The amount moved
     * depends on the current view.
     */
    movePrevious: function() {
        var view = this.activeView;
        view.movePrevious();
        this.setValue(view.getValue());
    },

    /**
     * Move the current view by an amount based of the current {@link #value}.
     * @param {Number} amount The number of intervals to move.
     * @param {String} [interval=Ext.Date.DAY] The interval to navigate by. See {@link Ext.Date}
     * for valid intervals.
     */
    navigate: function(amount, interval) {
        var D = Ext.Date;
        if (amount !== 0) {
            this.setValue(D.add(this.getValue(), interval || D.DAY, amount));
        }
    },

    /**
     * Set the active view.
     * @param {String} view The view name from {@link #views}.
     */
    setView: function(view, /* private */fromSwitcher) {
        var me = this,
            active = me.activeView;

        if (typeof view === 'string') {
            view = me.down('#' + view);
        }

        if (!fromSwitcher) {
            me.setSwitcherValue(view.getItemId());
        }

        if (view === active) {
            return;
        }

        me.activeView = view;
        me.doSetView(view);
        me.refreshCalTitle();
    },

    // Appliers/Updaters
    updateCompact: function(compact, oldCompact) {
        this.callParent([compact, oldCompact]);
        this.setViewsCfg('setCompact', compact);
    },

    applyStore: function(store) {
        if (store) {
            store = Ext.StoreManager.lookup(store, 'calendar-calendars');
        }
        return store;
    },

    updateStore: function(store) {
        var list = this.calList;
        this.setViewsCfg('setStore', store);
        if (list) {
            list.setStore(store);
        }
    },

    applyTimezoneOffset: function(timezoneOffset) {
        if (timezoneOffset === undefined) {
            timezoneOffset = this.getDefaultTimezoneOffset();
        }
        return timezoneOffset;
    },

    updateTimezoneOffset: function(timezoneOffset) {
        this.setViewsCfg('setTimezoneOffset', timezoneOffset);
    },

    applyValue: function(value) {
        if (!value) {
            value = this.getLocalNow();
        }
        return Ext.Date.clearTime(value, true);
    },

    updateValue: function(value) {
        var me = this;

        if (me.isConfiguring) {
            return;
        }

        me.setViewsValue(value);
        me.refreshCalTitle();
    },

    destroy: function() {
        this.calViews = this.activeView = null;
        this.callParent();
    },

    privates: {
        createItems: function() {
            var me = this,
                views = me.getViews(),
                items = [],
                o, key, defaultView;

            for (key in views) {
                o = views[key];
                if (o) {
                    items.push(me.createView(Ext.apply({
                        itemId: key
                    }, o)));
                    if (o.isDefault) {
                        defaultView = key;
                    }
                }
            }

            items.sort(me.weightSorter);

            if (!defaultView) {
                defaultView = items[0].itemId;
            }
            me.defaultView = defaultView;

            return items;
        },

        createList: function() {
            var me = this;
            if (!me.calList) {
                me.calList = Ext.create({
                    xtype: 'calendar-list',
                    store: me.getStore()
                });
            }
            return me.calList;
        },

        createView: function(cfg) {
            var me = this;

            cfg = Ext.apply({}, cfg);
            cfg = Ext.apply({
                compact: me.getCompact(),
                store: me.getStore(),
                timezoneOffset: me.getTimezoneOffset(),
                value: me.getValue(),
                listeners: {
                    scope: me,
                    valuechange: 'onValueChange'
                }
            }, cfg);

            return cfg;
        },

        getCalViews: function() {
            var me = this,
                calViews = me.calViews,
                viewMap, key;

            if (!calViews) {
                viewMap = me.getViews();
                me.calViews = calViews = [];
                for (key in viewMap) {
                    calViews.push(me.down('#' + key));
                }
            }

            return calViews;
        },

        getDefaultTimezoneOffset: function() {
            return (new Date()).getTimezoneOffset();
        },

        getLocalNow: function() {
            return new Date();
        },

        getSwitcherItems: function() {
            var views = this.getViews(),
                items = [],
                key, o;

            for (key in views) {
                o = views[key];
                items.push({
                    text: o.label,
                    value: key,
                    weight: o.weight
                });
            }

            items.sort(this.weightSorter);
            return items;
        },

        onAddTap: function() {
            this.activeView.showAddForm();
        },

        onNextTap: function() {
            this.moveNext();
        },

        onPrevTap: function() {
            this.movePrevious();
        },

        onValueChange: function(view, context) {
            if (this.settingValue) {
                return;
            }
            this.setValue(context.value);
        },

        onTodayTap: function() {
            this.setValue(new Date());
        },

        refreshCalTitle: function() {
            var view = this.activeView,
                calTitle = this.calTitle,
                tpl;

            if (view && calTitle) {
                tpl = view.titleTpl;
                if (!tpl.isXTemplate) {
                    view.titleTpl = tpl = new Ext.XTemplate(tpl);
                }
                calTitle.setHtml(tpl.apply(view.getDisplayRange()));
            }
        },

        setViewsCfg: function(method, value) {
            if (this.isConfiguring) {
                return;
            }

            var views = this.getCalViews(),
                len = views.length,
                i;

            for (i = 0; i < len; ++i) {
                views[i][method](value);
            }
        },

        setViewsValue: function(value) {
            var D = Ext.Date,
                me = this,
                views = Ext.Array.clone(me.getCalViews()),
                len = views.length,
                i, val, first, currentFirst, view;

            me.settingValue = true;

            // The default behaviour of views with a firstDayOfWeek is to
            // look backwards to find a startimg point for that day. In isolation
            // this is fine, however when used with other views it can be problematic.
            // For example, say we have 2 week views:
            // {firstDayOfWeek: 0, visibleDays: 7}, {firstDayOfWeek: 1, visibleDays: 5}.
            // If the the current day is Sunday (defaulted date), then the first view will
            // show from Sunday (today) through 7 days as expected. However the second view
            // would need to calculate back, since the current day is before the start of the week
            // in that view. Here, we stop that from occurring by using the smallest first day of
            // the week as an offset.
            views.sort(me.valueSorter);
            for (i = 0; i < len; ++i) {
                view = views[i];
                val = value;
                if (view.getFirstDayOfWeek) {
                    first = view.getFirstDayOfWeek();
                    if (currentFirst !== undefined) {
                        if (first > currentFirst) {
                            val = D.add(value, D.DAY, first - currentFirst);
                        }
                    } else {
                        currentFirst = first;
                    }
                }
                view.setValue(val);
            }
            me.settingValue = false;
        },

        valueSorter: function(a, b) {
            var ret;

            a = a.getFirstDayOfWeek || null;
            b = b.getFirstDayOfWeek || null;

            if (a === b) {
                ret = 0;
                if (a) {
                    a = a.getFirstDayOfWeek();
                    b = b.getFirstDayOfWeek();

                    ret = a < b ? 1 : -1;
                }
            } else {
                ret = a === null ? 1 : -1;
            }

            return ret;
        },

        weightSorter: function(a, b) {
            return a.weight - b.weight;
        }
    }
});