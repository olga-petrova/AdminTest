/** 
 * A base class for calendar views.
 * @abstract
 */
Ext.define('Ext.calendar.view.Base', {
    extend: 'Ext.Gadget',

    requires: [
        'Ext.calendar.store.Calendars',
        'Ext.calendar.theme.Theme',
        'Ext.calendar.Event',
        'Ext.Promise'
    ],

    config: {
        /**
         * @cfg {Object} addForm
         * The configuration for the add form to be used when an event
         * is to be created. Use `null` to disable creation.
         */
        addForm: {
            xtype: 'calendar-form-add'
        },

        /**
         * @cfg {Boolean} compact
         * `true` to display this view in compact mode, typically used
         * for smaller form factors.
         */
        compact: false,

        /**
         * @cfg {Object} [compactOptions]
         * A series of config options for this class to set when this class is in
         * {@link #compact} mode.
         */
        compactOptions: null,

        /**
         * @cfg {Boolean} controlStoreRange
         * `true` to allow this view to set the date range on event stores
         * in reaction to the value changing. The need to disable this surfaces
         * when using multiple views together and allowing one view (the one with
         * the largest range) to be the in control of loading the stores.
         *
         * @private
         */
        controlStoreRange: true,
        
        /**
         * @cfg {Object} editForm
         * The configuration for the edit form to be used when an event
         * is to be modified. Use `null` to disable editing.
         */
        editForm: {
            xtype: 'calendar-form-edit'
        },

        /**
         * @cfg {Object} eventDefaults
         * The default configuration for event widgets.
         */
        eventDefaults: {
            xtype: 'calendar-event'
        },

        /**
         * @cfg {Boolean} gestureNavigation
         * Allow the view to have the value changed via swipe navigation on devices
         * that support that.
         */
        gestureNavigation: true,

        /**
         * @cfg {Ext.calendar.header.Base} header
         * A header object to link to this view.
         * 
         * @private
         */
        header: null,

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
         * The value for the current view.
         */
        value: undefined
    },

    platformConfig: {
        phone:  {
            compact: true
        }
    },

    twoWayBindable: {
        value: 1
    },

    /**
     * @event beforeeventadd
     * Fired before an event {@link #addForm} is shown.
     * @param {Ext.calendar.view.Base} this This view.
     * @param {Object} context The context.
     * @param {Ext.calendar.model.EventBase} context.event The new event to be added.
     *
     * Return `false` to cancel the form being shown.
     */
    
    /**
     * @event beforeeventedit
     * Fired before an event {@link #editForm} is shown.
     * @param {Ext.calendar.view.Base} this This view.
     * @param {Object} context The context.
     * @param {Ext.calendar.model.EventBase} context.event The event to be edited.
     *
     * Return `false` to cancel the form being shown.
     */
    
    /**
     * @event eventadd
     * Fired when an event has been added via the {@link #addForm}.
     * @param {Ext.calendar.view.Base} this This view.
     * @param {Object} context The context.
     * @param {Ext.calendar.model.EventBase} context.event The newly added event with data.
     * @param {Object} context.data The data provided by the form.
     */
    
    /**
     * @event eventedit
     * Fired when an event has been edited via the {@link #editForm}.
     * @param {Ext.calendar.view.Base} this This view.
     * @param {Object} context The context.
     * @param {Ext.calendar.model.EventBase} context.event The edited event with data.
     * @param {Object} context.data The data provided by the form.
     */
    
    /**
     * @event eventdrop
     * Fired when an event has been deleted via the {@link #editForm}.
     * @param {Ext.calendar.view.Base} this This view.
     * @param {Object} context The context.
     * @param {Ext.calendar.model.EventBase} context.event The removed event.
     */

    /**
     * @event eventtap
     * Fired when an event is tapped.
     * @param {Ext.calendar.view.Base} this This view.
     * @param {Object} context The context.
     * @param {Ext.calendar.model.EventBase} context.event The event model.
     */
    
    /**
     * @event validateeventadd
     * Fired after the {@link #addForm} has been completed, but before the event
     * is added. Allows the add to be validated.
     * @param {Ext.calendar.view.Base} this This view.
     * @param {Object} context The context.
     * @param {Ext.calendar.model.EventBase} context.event The new event to be added, the
     * data is not yet set on the event.
     * @param {Object} context.data The data provided by the form. This will be used to set the 
     * event data using {@link Ext.calendar.model.EventBase#setData}.
     * @param {Ext.Promise} context.validate A promise that allows validation to occur.
     * The default behavior is for no validation to take place. To achieve asynchronous
     * validation, the promise on the context object must be replaced:
     *
     *     {
     *         listeners: {
     *             validateeventadd: function(view, context) {
     *                 context.validate = context.then(function() {
     *                     return Ext.Ajax.request({
     *                         url: '/checkAdd'
     *                     }).then(function(response) {
     *                         if (response.responseText === 'ok') {
     *                             return Promise.resolve();
     *                         } else {
     *                             return Promise.reject();
     *                         }
     *                     });
     *                 });
     *             }
     *         }
     *     }
     */
    
    /**
     * @event validateeventedit
     * Fired after the {@link #editForm} has been completed, but before the event
     * is saved. Allows the edit to be validated.
     * @param {Ext.calendar.view.Base} this This view.
     * @param {Object} context The context.
     * @param {Ext.calendar.model.EventBase} context.event The event to be edited, the data
     * is not yet set on the event.
     * @param {Object} context.data The data provided by the form. This will be used to set the 
     * event data using {@link Ext.calendar.model.EventBase#setData}.
     * @param {Ext.Promise} context.validate A promise that allows validation to occur.
     * The default behavior is for no validation to take place. To achieve asynchronous
     * validation, the promise on the context object must be replaced:
     *
     *     {
     *         listeners: {
     *             validateeventedit: function(view, context) {
     *                 context.validate = context.then(function() {
     *                     return Ext.Ajax.request({
     *                         url: '/checkEdit'
     *                     }).then(function(response) {
     *                         if (response.responseText === 'ok') {
     *                             return Promise.resolve();
     *                         } else {
     *                             return Promise.reject();
     *                         }
     *                     });
     *                 });
     *             }
     *         }
     *     }
     */
    
    /**
     * @event validateeventdrop
     * Fired when the delete button has been tapped on the {@link #editForm}, but before the event
     * is removed. Allows the removal to be validated.
     * @param {Ext.calendar.view.Base} this This view.
     * @param {Object} context The context.
     * @param {Ext.calendar.model.EventBase} context.event The event to be removed.
     * @param {Ext.Promise} context.validate A promise that allows validation to occur.
     * The default behavior is for no validation to take place. To achieve asynchronous
     * validation, the promise on the context object must be replaced:
     *
     *     {
     *         listeners: {
     *             validateeventdrop: function(view, context) {
     *                 context.validate = context.then(function() {
     *                     return new Promise(function(resolve, reject) {
     *                         Ext.Msg.confirm('Delete', 'Really delete this event?', function(btn) {
     *                             if (btn === 'yes') {
     *                                 resolve();
     *                             } else {
     *                                 reject();
     *                             }
     *                         });
     *                     });
     *                 });
     *             }
     *         }
     *     }
     */
    
    /**
     * @event valuechange
     * Fired when the {@link #value} changes.
     * @param {Ext.calendar.view.Base} this This view.
     * @param {Object} context The context.
     * @param {Date} context.value The new value.
     */

    constructor: function(config) {
        this.eventMap = {};
        this.callParent([config]);
    },

    /**
     * @method getDisplayRange
     * Get the display range for this view.
     * @return {Ext.calendar.date.Range} The display range.
     */
    
    /**
     * Get the active {@link #editForm} or {@link #addForm} if it exists.
     * @return {Ext.calendar.form.Base} The active form. `null` if not active.
     */
    getForm: function() {
        return this.form || null;
    },

    /**
     * @method getVisibleRange
     * Get the visible range for this view.
     * @return {Ext.calendar.date.Range} The visible range.
     */
    

    // Public methods
    /**
     * Move the view forward to view the "next" portion of the view based
     * on the current {@link #value}.
     * This amount depends on the current view.
     */
    moveNext: function() {
        var interval = this.getMoveInterval(),
            val = this.getMoveBaseValue();

        this.setValue(Ext.Date.add(val, interval.unit, interval.amount));
    },

    /**
     * Move the view forward to view the "next" portion of the view based
     * on the current {@link #value}.
     * This amount depends on the current view.
     */
    movePrevious: function() {
        var interval = this.getMoveInterval(),
            val = this.getMoveBaseValue();

        this.setValue(Ext.Date.subtract(val, interval.unit, interval.amount));
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
     * Show the {@link #addForm} for this calendar. Has no behavior if
     * {@link #addForm} is `null`.
     * @param {Ext.calendar.model.EventBase} [event] A new event record containing
     * any data to be passed to the forn. If not specified, detault dates from
     * this view will be chosen.
     * @param {Object} [options] Callback options for form creation.
     * @param {Function} [options.onSave] A save callback function.
     * @param {Function} [options.onCancel] A cancel callback function.
     * @param {Object} [options.scope] A scope for the callback functions.
     */
    showAddForm: function(event, options) {
        var me = this;

        if (me.getAddForm()) {
            if (!event) {
                range = me.getDefaultCreateRange();
                event = me.createModel({
                    startDate: range.start,
                    endDate: range.end
                });
            }
            me.doShowForm(event, 'add', me.createAddForm(), 'onFormCreateSave', options);
        }
    },

    /**
     * Show the {@link #editForm} for this calendar. Has no behavior if
     * {@link #editForm} is `null`.
     * @param {Ext.calendar.model.EventBase} event The event to be passed to the form.
     * @param {Object} [options] Callback options for form creation.
     * @param {Function} [options.onSave] A save callback function.
     * @param {Function} [options.onCancel] A cancel callback function.
     * @param {Object} [options.scope] A scope for the callback functions.
     */
    showEditForm: function(event, options) {
        if (this.getEditForm()) {
            this.doShowForm(event, 'edit', this.createEditForm(), 'onFormEditSave', options);
        }
    },

    // protected methods

    /**
     * Create the add form configuration. Can be hooked to provide any
     * runtime customization.
     * @return {Object} A configuration for the form instance.
     * 
     * @protected
     */
    createAddForm: function() {
        return Ext.merge({
            view: this
        }, this.getAddForm());
    },

    /**
     * Create the edit form configuration. Can be hooked to provide any
     * runtime customization.
     * @return {Object} A configuration for the form instance.
     * 
     * @protected
     */
    createEditForm: function(event) {
        return Ext.merge({
            view: this
        }, this.getEditForm());
    },

    /**
     * Get the event source for this view.
     * @return {Ext.calendar.store.EventSource} The event source.
     *
     * @protected
     */
    getEventSource: function() {
        return this.eventSource;
    },

    /**
     * Creates a UTC date at the specified time, taking into account
     * the timezone offset. For example if the timezone offset is +01:00GMT
     * and the values are 2010-01-05:00:00, then the resulting value would be
     * 2010-01-04:23:00.
     * 
     * @param {Number} year The year.
     * @param {Number} month The month.
     * @param {Number} day The day.
     * @param {Number} [hour=0] The hour.
     * @param {Number} [minute=0] The minute.
     * @return {Date} The offsetted date.
     */
    toUtcOffset: function(year, month, day, hour, minute)  {
        var D = Ext.Date,
            d = D.utc(year, month, day, hour, minute),
            tzOffset = this.getTimezoneOffset();

        return D.add(d, D.MINUTE, tzOffset);
    },

    /**
     * Get a UTC date as a local date, taking into account the {@link #timezoneOffset}.
     * For example, if the current date is:
     * `Thu May 05 2016 10:00:00 GMT+1000` and the timezoneOffset is `-60`, then the value will
     * be `Thu May 05 2016 01:00:00 GMT+1000`.
     * @param {Date} d The date
     * @return {Date} The offset
     */
    utcToLocal: function(d)  {
        var D = Ext.Date;
        if (d) {
            // The offset will be negative if it's +GMT
            d = D.subtract(D.utcToLocal(d), D.MINUTE, this.getTimezoneOffset());
        }
        return d;
    },

    // Appliers/updaters
    updateCompact: function(compact) {
        var me = this,
            baseCls = me.getBaseCls();

        me.toggleCls(Ext.baseCSSPrefix + 'calendar-compact', compact);
        me.toggleCls(baseCls + '-compact', compact);
        me.toggleCls(Ext.baseCSSPrefix + 'calendar-large', !compact);
        me.toggleCls(baseCls + '-large', !compact);
        me.setupCompactState();
    },

    updateCompactOptions: function() {
        if (!this.isConfiguring && this.getCompact()) {
            this.setupCompactState();
        }
    },

    updateGestureNavigation: function(gestureNavigation) {
        var method;

        if (Ext.supports.Touch) {
            method = gestureNavigation ? 'on' : 'un';
            this.getBodyElement()[method]('swipe', 'onBodySwipe', this);
        }
    },

    updateHeader: function(header, oldHeader) {
        if (oldHeader) {
            oldHeader.destroy();
        }
        
        if (header) {
            header.setCompact(this.getCompact());
            this.refreshHeaders();
        }
    },

    applyStore: function(store) {
        if (store) {
            store = Ext.StoreManager.lookup(store, 'calendar-calendars');
        }
        return store;
    },

    updateStore: function(store, oldStore) {
        var me = this;

        me.eventSource = null;

        if (oldStore) {
            if (oldStore.getAutoDestroy()) {
                oldStore.destroy();
            } else {
                oldStore.getEventSource().un(me.getSourceListeners());
                oldStore.un(me.getStoreListeners());
            }
        }

        if (store) {
            store.on(me.getStoreListeners());
            me.eventSource = store.getEventSource();
            me.eventSource.on(me.getSourceListeners());
            if (!me.isConfiguring) {
                me.onSourceAttach();
                me.refreshEvents();
            }
        }
    },

    applyTimezoneOffset: function(timezoneOffset) {
        if (timezoneOffset === undefined) {
            timezoneOffset = this.getDefaultTimezoneOffset();
        }
        return timezoneOffset;
    },

    applyValue: function(value, oldValue) {
        if (!value) {
            value = this.getLocalNow();
        }
        
        value = Ext.Date.clearTime(value, true);

        if (oldValue && oldValue.getTime() === value.getTime()) {
            value = undefined;
        }
        return value;
    },

    updateValue: function(value) {
        if (!this.isConfiguring) {
            this.fireEvent('valuechange', this, {
                value: value
            });
        }
    },

    // Overrides
    destroy: function() {
        var me = this;

        me.clearEvents();
        me.form = Ext.destroy(me.form);
        me.eventMap = null;
        me.setHeader(null);
        me.setStore(null);
        me.callParent();
    },

    privates: {
        $eventCls: Ext.baseCSSPrefix + 'calendar-event',
        $eventInnerCls: Ext.baseCSSPrefix + 'calendar-event-inner',
        $eventColorCls: Ext.baseCSSPrefix + 'calendar-event-marker-color',
        $staticEventCls: Ext.baseCSSPrefix + 'calendar-event-static',
        $tableCls: Ext.baseCSSPrefix + 'calendar-table',

        eventRefreshSuspend: 0,
        refreshCounter: 0,

        forwardDirection: 'left',
        backwardDirection: 'right',

        /**
         * Clear events from the view.
         *
         * @private
         */
        clearEvents: function() {
            var map = this.eventMap,
                key;

            for (key in map) {
                map[key].destroy();
            }
            this.eventMap = {};
        },

        /**
         * Create an event widget.
         * @param {Ext.calendar.model.EventBase} event The event record.
         * @param {Object} [cfg] A config for the event.
         * @param {Boolean} [dummy=false] `true` if this is a dummy event not backed by a record.
         * @return {Ext.calendar.EventBase} The event widget.
         *
         * @private
         */
        createEvent: function(event, cfg, dummy) {
            var me = this,
                defaults = Ext.apply({}, me.getEventDefaults()),
                widget, d;

            if (dummy) {
                d = me.getUtcNow();
                cfg.title = '&#160;';
                cfg.startDate = d;
                cfg.endDate = d;
            } else {
                cfg.palette = me.getEventPalette(event);
            }
                
            cfg = cfg || {};
            cfg.model = event;
            cfg.view = me;

            widget = Ext.widget(Ext.apply(cfg, defaults));

            if (!dummy) {
                me.eventMap[widget.id] = widget;
            }

            return widget;
        },

        /**
         * Create a number of event widgets.
         * @param {Ext.calendar.model.EventBase[]} events The events.
         * @param {Object} [cfg] A config for each event.
         * @return {Ext.calendar.EventBase[]} The event widgets.
         *
         * @private
         */
        createEvents: function(events, cfg) {
            var len = events.length,
                ret = [],
                i;

            for (i = 0; i < len; ++i) {
                ret.push(this.createEvent(events[i], Ext.apply({}, cfg)));
            }
            return ret;
        },

        createModel: function(data) {
            return this.getEventSource().createEvent(data);
        },

        /**
         * Execute a full refresh of the view and events.
         * 
         * @private
         */
        doRefresh: Ext.privateFn,

        /**
         * Execute a full refresh of events.
         *
         * @private
         */
        doRefreshEvents: Ext.privateFn,

        /**
         * Show a form for this calendar.
         * @param {Ext.calendar.model.EventBase} event The event.
         * @param {Object} cfg The config for the form.
         * @param {Function} successFn A function to call if the edit is successful.
         * @param {Object} [options] Callback options for form creation.
         * @param {Function} [options.onSave] A save callback function.
         * @param {Function} [options.onCancel] A cancel callback function.
         * @param {Object} [options.scope] A scope for the callback functions.
         *
         * @private
         */
        doShowForm: function(event, type, cfg, successFn, options) {
            var me = this,
                c;

            if (!me.getStore() || !event.isEditable()) {
                return;
            }

            if (me.fireEvent('beforeevent' + type, me, {event: event}) === false) {
                return;
            }

            options = options || {};

            me.form = c = Ext.create(Ext.apply({
                event: event
            }, cfg));

            c.on({
                save: function(form, context) {
                    var data = context.data,
                        o = {
                            event: event,
                            data: data,
                            validate: Ext.Promise.resolve(undefined)
                        };

                    me.fireEvent('validateevent' + type, me, o);
                    o.validate.then(function() {
                        if (options.onSave) {
                            options.onSave.call(options.scope || me, me, event, data);
                        }
                        me[successFn](form, event, data);
                        me.fireEvent('event' + type, me, {
                            event: event,
                            data: data
                        });
                    }, function() {
                        me.onFormCancel(form);
                    });
                },
                cancel: function(form, context) {
                    if (options.onCancel) {
                        options.onCancel.call(options.scope || me, me, event);
                    }
                    me.onFormCancel(form);
                    me.fireEvent('event' + type + 'cancel', me, {
                        event: event
                    });
                },
                close: function(form) {
                   if (options.onCancel) {
                        options.onCancel.call(options.scope || me, me, event);
                    }
                    me.onFormCancel(form); 
                },
                drop: function(form) {
                    var o = {
                        event: event,
                        validate: Ext.Promise.resolve(undefined)
                    };
                    me.fireEvent('validateeventdrop', me, o);
                    o.validate.then(function() {
                        if (options.onDrop) {
                            options.onDrop.call(options.scope || me, me, event);
                        }
                        me.onFormDrop(form, event);
                        me.fireEvent('eventdrop', me, {
                            event: event
                        });
                    }, function() {
                        me.onFormCancel(form);
                    });
                }
            });
            c.show();
        },

        /**
         * Get the body element of this view.
         * @return {Ext.dom.Element} The body.
         *
         * @private
         */
        getBodyElement: function() {
            return this.element;
        },

        /**
         * Get a calendar by id.
         * @param {Object} id The id of the calendar.
         * @return {Ext.calendar.model.CalendarBase} The calendar
         *
         * @private
         */
        getCalendar: function(id) {
            return this.getStore().getById(id);
        },

        /**
         * Get the number of days covered for a range. For example,
         * 2010-01-01 22:00, 2010-01-02 01:00 is 2 days because it has boundaries
         * within 2 days.
         * @param {Date} start The start of the range.
         * @param {Date} end The end of the range.
         * @param {Boolean} allDay `true` if the time range should be considered as an all
         * day event.
         * @return {Number} The number of days spanned.
         *
         * @private
         */
        getDaysSpanned: function(start, end, allDay)  {
            var D = Ext.Date,
                ret;

            if (allDay) {
                ret = D.diff(start, end, D.DAY);
            } else {
                start = this.utcToLocal(start);
                end = this.utcToLocal(end);
                ret = Ext.calendar.model.Event.getDaysSpanned(start, end);
            }
            return ret;
        },

        /**
         * The the default range when creating a event.
         * @return {Ext.calendar.date.Range} The range.
         *
         * @private
         */
        getDefaultCreateRange: function() {
            var me = this,
                now = me.getLocalNow(),
                displayRange = me.getDisplayRange(),
                d;

            now = me.toUtcOffset(now.getFullYear(), now.getMonth(), now.getDate());
            if (displayRange.contains(now)) {
                d = now;
            } else {
                d = displayRange.start;
            }
            return new Ext.calendar.date.Range(d, d);
        },

        /**
         * Get the default color palette for this view. Defaults to the
         * color of the first calendar, otherwise the first color in the palette.
         * @return {Ext.calendar.theme.Palette} The color palette.
         *
         * @private
         */
        getDefaultPalette: function() {
            var store = this.getStore(),
                Theme = Ext.calendar.theme.Theme,
                rec, color;

            if (store) {
                rec = store.first();
                if (rec) {
                    color = rec.getBaseColor();
                }
            }

            return Theme.getPalette(color || Theme.colors[0]);
        },

        /**
         * Get the default timezone offset for this view, if not specified.
         * Defaults to the current date, can be overridden for unit testing.
         * @return {Number} The timezone offset.
         *
         * @private
         */
        getDefaultTimezoneOffset: function() {
            return (new Date()).getTimezoneOffset();
        },

        /**
         * Get all calendars that are {@link Ext.calendar.model.CalendarBase#isEditable editable}.
         * @return {Ext.calendar.model.CalendarBase[]} The editable calendars.
         *
         * @private
         */
        getEditableCalendars: function() {
            var store = this.getStore(),
                ret;

            if (store) {
                ret = Ext.Array.filter(store.getRange(), function(cal) {
                    return cal.isEditable();
                });
            }

            return ret || [];
        },

        /**
         * Get an event record via element/DOM event.
         * @param {Ext.dom.Element/HTMLElement/Ext.event.Event} el The element target,
         * @return {Ext.calendar.model.EventBase} The event record.
         *
         * @private
         */
        getEvent: function(el) {
            var cls = this.$eventCls,
                id;

            if (el.isEvent) {
                el = el.target;
            }

            if (!Ext.fly(el).hasCls(cls)) {
                el = Ext.fly(el).up('.' + cls, this.element, true);
            }
            id = el.getAttribute('data-eventId');
            return this.getEventSource().getById(id);
        },

        /**
         * See {@link #getDaysSpanned}.
         * @param {Ext.calendar.model.EventBase} The event.
         * @return {Number} The number of days spanned.
         *
         * @private
         */
        getEventDaysSpanned: function(event)  {
            return this.getDaysSpanned(event.getStartDate(), event.getEndDate(), event.getAllDay());
        },

        /**
         * Get the palette for an event record.
         * @param {Ext.calendar.model.EventBase} event The event record.
         * @return {Ext.calendar.theme.Palette} The palette.
         *
         * @private
         */
        getEventPalette: function(event) {
            var color = event.getColor() || event.getCalendar().getBaseColor();
            return Ext.calendar.theme.Theme.getPalette(color);
        },

        /**
         * Get the current date. May be overridden for unit testing.
         * @return {Date} The current date.
         *
         * @private
         */
        getLocalNow: function() {
            return new Date();
        },

        /**
         * Get the value to use as the base for moving when using
         * {@link #moveNext} and {@link #movePrevious}.
         * @return {Date} The value.
         *
         * @private
         */
        getMoveBaseValue: function() {
            return this.getValue();
        },

        /**
         * Get the period to move when using
         * {@link #moveNext} and {@link #movePrevious}.
         * @return {Object} The period to move
         * @return {String} return.unit The units to move, see {@link Ext.Date}.
         * @return {Number} return.amount The number of units to move.
         *
         * @private
         */
        getMoveInteral: Ext.privateFn,

        /**
         * Get listeners to add to the event source.
         * @return {Object} A listeners config.
         *
         * @private
         */
        getSourceListeners: function() {
            return {
                scope: this,
                add: 'onSourceAdd',
                refresh: 'onSourceRefresh',
                remove: 'onSourceRemove',
                update: 'onSourceUpdate'
            };
        },

        /**
         * Get listeners to add to the calendar store..
         * @return {Object} A listeners config.
         *
         * @private
         */
        getStoreListeners: function() {
            return {
                scope: this,
                update: 'onStoreUpdate'
            };
        },

        /**
         * Get the current date in UTC.
         * @return {Date} The current UTC date.
         *
         * @private
         */
        getUtcNow: function() {
            return Ext.Date.utcToLocal(new Date());
        },

        /**
         * Handle drop on the view.
         * @param {Ext.calendar.model.EventBase} event The event.
         * @param {Ext.calendar.date.Range} newRange The new range.
         * @param {Function} [callback] A callback to execute.
         *
         * @private
         */
        handleChange: function(type, event, newRange, callback) {
            var me = this,
                o = {
                    event: event,
                    newRange: newRange.clone(),
                    validate: Ext.Promise.resolve(undefined)
                },
                fn = callback ? callback : Ext.emptyFn;

            me.fireEvent('validateevent' + type, me, o);

            o.validate.then(function() {
                fn(true);
                event.setRange(newRange);
                me.fireEvent('event' + type, me, {
                    event: event,
                    newRange: newRange.clone()
                });
            }, function() {
                fn(false);
            });
        },

        /**
         * Handle drag/resize start for an event.
         * @param {String} type The event type.
         * @param {Ext.calendar.model.EventBase} event The event.
         * @return {Boolean} `false` to veto the event.
         *
         * @private
         */
        handleChangeStart: function(type, event) {
            var ret = event.isEditable();
            if (ret) {
                ret = this.fireEvent('beforeevent' + type + 'start', this, {event: event});
            }
            return ret;
        },

        /**
         * Handle resizing of the main view element.
         *
         * @private
         */
        handleResize: Ext.privateFn,

        /**
         * Checks if the {@link #store} has editable calendars.
         * @return {Boolean} `true` if any calendars are editable.
         *
         * @private
         */
        hasEditableCalendars: function() {
            return this.getEditableCalendars().length > 0;
        },

        /**
         * Checks if an event is hidden, by virtue of the calendar being hidden.
         * @param {Ext.calendar.model.EventBase} event The event.
         * @return {Boolean} `true` if the event should be hidden.
         *
         * @private
         */
        isEventHidden: function(event) {
            return event.getCalendar().isHidden();
        },

        /**
         * Handle a swipe on the view body.
         * @param {Ext.event.Event} e The event.
         *
         * @private
         */
        onBodySwipe: function(e) {
            var me = this;

            if (e.direction === me.forwardDirection) {
                me.moveNext();
            } else if (e.direction === me.backwardDirection) {
                me.movePrevious();
            }
        },

        /**
         * Handle a tap on an event model.
         * @param {Ext.calendar.model.EventBase} event The event model.
         *
         * @private
         */
        onEventTap: function(event) {
            this.fireEvent('eventtap', this, {
                event: event
            });
            this.showEditForm(event);
        },

        /**
         * Handle create form being saved.
         * @param {Ext.calendar.form.Base} form The form.
         * @param {Object} data The data from the form.
         *
         * @private
         */
        onFormCreateSave: function(form, event, data) {
            event.setData(data);
            event.setCalendar(this.getCalendar(event.getCalendarId()));
            this.getEventSource().add(event);
            this.form = Ext.destroy(form);
        },

        /**
         * Handle edit form being saved.
         * @param {Ext.calendar.form.Base} form The form.
         * @param {Ext.calendar.model.EventBase} event The event being edited.
         * @param {Object} data The data from the form.
         *
         * @private
         */
        onFormEditSave: function(form, event, data) {
            var me = this,
                oldCalendar = event.getCalendar(),
                id;

            me.suspendEventRefresh();
            event.setData(data);
            id = event.getCalendarId();
            if (oldCalendar.id !== id) {
                event.setCalendar(me.getCalendar(id));
                me.getEventSource().move(event, oldCalendar);
            }
            
            me.resumeEventRefresh();
            me.refreshEvents();
            me.form = Ext.destroy(form);
        },

        onFormDrop: function(form, event) {
            this.getEventSource().remove(event);
            this.form = Ext.destroy(form);
        },

        /**
         * Handle the form being cancelled.
         * @param {Ext.calendar.form.Base} form The form.
         *
         * @private
         */
        onFormCancel: function(form) {
            this.form = Ext.destroy(form);
        },

        /**
         * Handle records being added to the source.
         * @param {Ext.calendar.store.EventSource} source The event source.
         * @param {Ext.calendar.model.EventBase[]} events The events.
         *
         * @private
         */
        onSourceAdd: function() {
            this.refreshEvents();
        },

        /**
         * @method
         * Handles a source being attached.
         *
         * @private
         */
        onSourceAttach: Ext.privateFn,

        /**
         * Handles a source being refreshed.
         * @param {Ext.calendar.store.EventSource} source The source.
         *
         * @private
         */
        onSourceRefresh: function() {
            this.refreshEvents();
        },

        /**
         * Handle records being removed from the source.
         * @param {Ext.calendar.store.EventSource} source The event source.
         * @param {Ext.calendar.model.EventBase[]} events The events.
         *
         * @private
         */
        onSourceRemove: function() {
            this.refreshEvents();
        },

        /**
         * Handles a record being updated in the source.
         * @param {Ext.calendar.store.EventSource} source The event source.
         * @param {Ext.calendar.model.EventBase} event The event.
         *
         * @private
         */
        onSourceUpdate: function() {
            this.refreshEvents();
        },

        /**
         * Handles an update on the calendar store.
         * @param {Ext.calendar.store.Calendars} store The store.
         * @param {Ext.calendar.model.CalendarBase} calendar The calendar.
         *
         * @private
         */
        onStoreUpdate: function() {
            this.refreshEvents();
        },

        /**
         * Do a full refresh of the view if not in the middle of configuration.
         *
         * @private
         */
        refresh: function() {
            if (!this.isConfiguring) {
                ++this.refreshCounter;
                this.doRefresh();
            }
        },

        /**
         * Do a full event refresh if not configuring and event refresh
         * is not suspended.
         *
         * @private
         */
        refreshEvents: function() {
            var me = this;

            if (!me.eventRefreshSuspend && !me.isConfiguring) {
                if (!me.refreshCounter) {
                    me.refresh();
                }
                me.doRefreshEvents();
            }
        },

        /**
         * @method
         * Refresh any attached {@link #header} object.
         *
         * @private
         */
        refreshHeaders: Ext.privateFn,

        /**
         * Resume the ability to refresh events on the view. The number of calls
         * to resume must match {@link #suspendEventRefresh}.
         *
         * @private
         */
        resumeEventRefresh: function() {
            --this.eventRefreshSuspend;
        },

        /**
         * Set the range on the event source if it exists.
         * @param {Date} start The start date.
         * @param {Date} end The end date.
         *
         * @private
         */
        setSourceRange: function(start, end) {
            var D = Ext.Date,
                eventSource = this.getEventSource(),
                cached;

            if (eventSource) {
                start = D.clone(start);
                start.setUTCHours(0);

                if (end.getUTCHours() !== 0) {
                    // Push to the next day, then round down
                    end = D.add(end, D.DAY, 1);
                    end.setUTCHours(0);
                }

                cached = eventSource.hasRangeCached(start, end);
                if (this.getControlStoreRange()) {
                    eventSource.setRange(start, end);
                }
                
                if (cached) {
                    this.refreshEvents();
                }
            }
        },

        /**
         * Sets the current config depending on whether or not
         * the view is in compact mode. Saves the current
         * non-compact state if being switched to compact mode.
         *
         * @private
         */
        setupCompactState: function() {
            var me = this,
                state = me.capturedState,
                C = Ext.Config,
                cfg = me.getCompactOptions(),
                key;

            if (!cfg) {
                return;
            }

            if (me.getCompact()) {
                state = {};
                for (key in cfg) {
                    state[key] = me[C.get(key).names.get]();
                }
                me.state = state;
                me.setConfig(cfg);
                // Capture
            } else if (!me.isConfiguring && state) {
                me.setConfig(state);
                delete me.state;
            }
        },

        /**
         * Suspend the ability to refresh events on the view. The number of calls
         * to suspend must match {@link #resumeEventRefresh}.
         *
         * @private
         */
        suspendEventRefresh: function() {
            ++this.eventRefreshSuspend;
        }
    }
});