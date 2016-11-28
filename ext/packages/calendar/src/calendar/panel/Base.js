/**
 * A base class that composes a calendar view and a header.
 * 
 * @abstract
 */
Ext.define('Ext.calendar.panel.Base', {
    extend: 'Ext.calendar.panel.AbstractBase',

    config: {
        /**
         * @cfg {Object} dayHeader
         * A config for the day header. This can be configured directly on the panel,
         * the relevant configurations will be forwarded to the header.
         */
        dayHeader: null,

        /**
         * @cfg {Object} eventRelayers
         * A list of events to relay from the underlying view.
         * 
         * @private
         */
        eventRelayers: {
            view: {
                /**
                 * @inheritdoc Ext.calendar.view.Base#beforeeventadd
                 */
                beforeeventadd: true,

                /**
                 * @inheritdoc Ext.calendar.view.Base#beforeeventadd
                 */
                beforeeventedit: true,

                /**
                 * @inheritdoc Ext.calendar.view.Base#eventadd
                 */
                eventadd: true,

                /**
                 * @inheritdoc Ext.calendar.view.Base#eventedit
                 */
                eventedit: true,

                /**
                 * @inheritdoc Ext.calendar.view.Base#eventdrop
                 */
                eventdrop: true,

                /**
                * @inheritdoc Ext.calendar.view.Base#eventtap
                */
                eventtap: true,

                /**
                * @inheritdoc Ext.calendar.view.Base#validateeventadd
                */
                validateeventadd: true,

                /**
                * @inheritdoc Ext.calendar.view.Base#validateeventedit
                */
                validateeventedit: true,

                /**
                * @inheritdoc Ext.calendar.view.Base#validateeventdrop
                */
                validateeventdrop: true,

                /**
                 * @inheritdoc Ext.calendar.view.Base#valuechange
                 */
                valuechange: true
            }
        },

        /**
         * @cfg {Object} view
         * A config for the main calendar view. This can be configured directly on the panel,
         * the relevant configurations will be forwarded to the view.
         */
        view: null
    },

    platformConfig: {
        phone:  {
            compact: true
        }
    },

    // This must sit outside a config block because we need to
    // access the value before initConfig.
    /**
     * @cfg {Obhect} configExtractor
     * A set of configs for the composable pieces.
     * This serves 2 purposes:
     * - Pulls configs from the initial class config to
     * pass to the constructor for the relevant piece.
     * - Generates proxy getter/setter methods.
     *
     * @protected
     */
    configExtractor: {
        view: {
            /**
             * @inheritdoc Ext.calendar.view.Base#addForm
             */
            addForm: true,

            /**
             * @inheritdoc Ext.calendar.view.Base#compact
             */
            compact: true,

            /**
             * @inheritdoc Ext.calendar.view.Base#compactOptions
             */
            compactOptions: true,

            /**
             * @inheritdoc Ext.calendar.view.Base#controlStoreRange
             */
            controlStoreRange: true,

            /**
             * @inheritdoc Ext.calendar.view.Base#editForm
             */
            editForm: true,

            /**
             * @inheritdoc Ext.calendar.view.Base#eventDefaults
             */
            eventDefaults: true,

            /**
             * @inheritdoc Ext.calendar.view.Base#gestureNavigation
             */
            gestureNavigation: true,

            /**
             * @inheritdoc Ext.calendar.view.Base#store
             */
            store: true,

            /**
             * @inheritdoc Ext.calendar.view.Base#timezoneOffset
             */
            timezoneOffset: true,

            /**
             * @inheritdoc Ext.calendar.view.Base#value
             */
            value: true
        }
    },

    twoWayBindable: {
        value: 1
    },

    constructor: function(config) {
        var me = this,
            C = Ext.Config,
            extractor = me.configExtractor,
            extracted = {},
            cfg, key, item, val, extractedItem, proxyKey;

        config = Ext.apply({}, config);

        me.extracted = extracted;

        for (cfg in extractor) {
            item = extractor[cfg];
            extracted[cfg] = extractedItem = {};

            for (key in config) {
                if (key in item) {
                    proxyKey = item[key];
                    if (proxyKey === true) {
                        proxyKey = key;
                    }
                    extractedItem[proxyKey] = config[key];
                    delete config[key];
                }
            }

            me.setupProxy(item, C.get(cfg).names.get);
        }
        me.callParent([config]);

        me.initRelayers();
    },

    /**
     * @inheritdoc
     */
    onClassExtended: function(cls, data, hooks) {
        // We need to manually merge these because we can't have it in
        // the config block, we need to access it before initConfig.
        var extractor = data.configExtractor;
        if (extractor) {
            delete data.configExtractor;
            cls.prototype.configExtractor = Ext.merge({}, cls.prototype.configExtractor, extractor);
        }
    },

    /**
     * @inheritdoc Ext.calendar.view.Base#getDisplayRange
     */
    getDisplayRange: function() {
        return this.getView().getDisplayRange();
    },

    /**
     * @inheritdoc Ext.calendar.view.Base#getVisibleRange
     */
    getVisibleRange: function() {
        return this.getView().getVisibleRange();
    },

    /**
     * @inheritdoc Ext.calendar.view.Base#moveNext
     */
    moveNext: function() {
        this.getView().moveNext();
    },

    /**
     * @inheritdoc Ext.calendar.view.Base#movePrevious
     */
    movePrevious: function() {
        this.getView().movePrevious();
    },

    /**
     * @inheritdoc Ext.calendar.view.Base#navigate
     */
    navigate: function(amount, interval) {
        this.getView().navigate(amount, interval);
    },

    /**
     * @inheritdoc Ext.calendar.view.Base#showAddForm
     */
    showAddForm: function(data, options) {
        this.getView().showAddForm(data, options);
    },

    /**
     * @inheritdoc Ext.calendar.view.Base#showEditForm
     */
    showEditForm: function(event, options) {
        this.getView().showEditForm(event, options);
    },

    // Appliers/Updaters
    applyDayHeader: function(dayHeader) {
        if (dayHeader) {
            dayHeader = Ext.apply(this.extracted.dayHeader, dayHeader);
            dayHeader = Ext.create(dayHeader);
        }
        return dayHeader;
    },

    updateDayHeader: function(dayHeader, oldDayHeader) {
        if (oldDayHeader) {
            oldDayHeader.destroy();
        }
        if (dayHeader) {
            this.getView().setHeader(dayHeader);
        }
        this.callParent([dayHeader, oldDayHeader]);
    },

    applyView: function(view) {
        if (view) {
            view = Ext.create(Ext.apply(this.extracted.view, view));
        }
        return view;
    },

    updateView: function(view, oldView) {
        if (oldView) {
            oldView.destroy();
        }
        this.callParent([view, oldView]);
    },

    privates: {
        /**
         * Create a relayer function. 
         * @param {name} name The event name to fire.
         * @return {Function} A function that fires the relayed event.
         *
         * @private
         */
        createItemRelayer: function(name) {
            var me = this;
            return function(view, o) {
                return me.fireEvent(name, me, o);
            };
        },

        /**
         * Generates proxy getter/setter methods 
         * @param {Ext.Config} thisCfg The config to apply to this object.
         * @param {Ext.Config} targetCfg The config object for the target config.
         * @param {String} targetName The getter name for the item on this component.
         *
         * @private
         */
        generateProxyMethod: function(thisCfg, targetCfg, targetName) {
            var me = this,
                targetSetter = targetCfg.names.set,
                targetGetter = targetCfg.names.get,
                setter = thisCfg.names.set,
                getter = thisCfg.names.get;

            if (!me[setter]) {
                me[setter] = function(value) {
                    var o = me[targetName]();
                    if (o) {
                        o[targetSetter](value);
                    }
                };
            }

            if (!me[getter]) {
                me[getter] = function() {
                    var o = me[targetName]();
                    if (o) {
                        return o[targetGetter]();
                    }
                };
            }
        },

        /**
         * Initialize event relayers.
         *
         * @private
         */
        initRelayers: function() {
            var C = Ext.Config,
                relayers = this.getEventRelayers(),
                view = this.getView(),
                key, events, c, name, prefix;

            for (key in relayers) {
                events = relayers[key];
                c = this[C.get(key).names.get]();
                prefix = events.$prefix || '';
                for (name in events) {
                    c.on(name, this.createItemRelayer(prefix + name));
                }
            }
        },

        /**
         * Sets up proxy methods for a component.
         * @param {Object} configs The list of to setup for a component.
         * @param {String} targetName The getter name for the item on this component.
         *
         * @private
         */
        setupProxy: function(configs, targetName) {
            var me = this,
                C = Ext.Config,
                key, targetCfg, thisCfg, val;

            for (key in configs) {
                val = configs[key];
                thisCfg = C.get(key);
                if (val === true) {
                    targetCfg = thisCfg;
                } else {
                    targetCfg = C.get(val);
                }

                me.generateProxyMethod(thisCfg, targetCfg, targetName);
            }
        }
    }
});