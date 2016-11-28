/**
 * Abstract class for D3 Components: {@link Ext.d3.canvas.Canvas} and {@link Ext.d3.svg.Svg}.
 *
 * Notes:
 *
 * Unlike the Charts package with its Draw layer, the D3 package does not provide
 * an abstraction layer and the user is expected to deal with the SVG and Canvas
 * directly.
 *
 * D3 package supports IE starting from version 9, as neither Canvas nor SVG
 * are supported by prior IE versions.
 */
Ext.define('Ext.d3.Component', {
    extend: 'Ext.d3.ComponentBase',

    requires: [
        'Ext.d3.lib.d3'
    ],

    config: {
        /**
         * The store with data to render.
         * @cfg {Ext.data.Store} store
         */
        store: null,

        /**
         * @inheritdoc
         */
        baseCls: Ext.baseCSSPrefix + 'd3',

        /**
         * The CSS class used by a subclass of the D3 Component.
         * Normally, the lowercased name of a subclass.
         * @cfg {String} componentCls
         */
        componentCls: '',

        interactions: []
    },

    /**
     * @private
     * Some configs in the D3 package are saved as properties on the class instance for faster access.
     * Prefixed properties are not used, as prefix can in theory change.
     * `$configPrefixed: false` is not used, as there's really no need to change the default for all configs.
     * All instance properties that are accessed bypassing getters/setters are listed on the prototype
     * to keep things explicit.
     */

    defaultBindProperty: 'store',

    isInitializing: true,

    resizeDelay: 250, // in milliseconds
    resizeTimerId: 0,
    size: null, // cached size

    d3Components: null,

    constructor: function (config) {
        var me = this;

        me.d3Components = {};

        me.callParent(arguments);

        me.isInitializing = false;

        me.on('resize', 'onElementResize', me);
    },

    destroy: function () {
        var me = this;

        me.un('resize', 'onElementResize', me);
        me.setInteractions();
        me.callParent();
    },

    updateComponentCls: function (componentCls, oldComponentCls) {
        var baseCls = this.getBaseCls(),
            el = this.element;

        if (componentCls && Ext.isString(componentCls)) {
            el.addCls(componentCls, baseCls);
            if (oldComponentCls) {
                el.removeCls(oldComponentCls, baseCls);
            }
        }
    },

    register: function (component) {
        var map = this.d3Components,
            id = component.getId();

        //<debug>
        if (id === undefined) {
            Ext.raise('Attempting to register a component with no ID.');
        }
        if (id in map) {
            Ext.raise('Component with ID "' + id + '" is already registered.');
        }
        //</debug>

        map[id] = component;
    },

    unregister: function (component) {
        var map = this.d3Components,
            id = component.getId();

        delete map[id];
    },

    applyInteractions: function (interactions, oldInteractions) {
        if (!oldInteractions) {
            oldInteractions = [];
            oldInteractions.map = {};
        }

        var me = this,
            result = [],
            oldMap = oldInteractions.map,
            i, ln, interaction, id;

        result.map = {};
        interactions = Ext.Array.from(interactions, true); // `true` to clone
        for (i = 0, ln = interactions.length; i < ln; i++) {
            interaction = interactions[i];
            if (!interaction) {
                continue;
            }
            if (interaction.isInteraction) {
                id = interaction.getId();
            } else {
                id = interaction.id;
                interaction.element = me.element;
            }
            // Create a new interaction by alias or reconfigure the old one.
            interaction = Ext.factory(interaction, null, oldMap[id], 'd3.interaction');
            if (interaction) {
                interaction.setComponent(me);
                me.addInteraction(interaction);
                result.push(interaction);
                result.map[interaction.getId()] = interaction;
            }
        }

        // Destroy old interactions that were not reused.
        for (i in oldMap) {
            if (!result.map[i]) {
                interaction = oldMap[i];
                me.removeInteraction(interaction);
                interaction.destroy();
            }
        }
        return result;
    },

    /**
     * @protected
     * If `panzoom` interaction has been added, save a reference to it on component instance
     * for quick access.
     */
    panZoom: null,

    /**
     * @protected
     * When {@link Ext.d3.interaction.PanZoom `panzoom`} interaction is added to the component,
     * this method is used as a listener for the interaction's `panzoom` event.
     * This method should be implemented by subclasses what wish to be affected by the interaction.
     * @param {Ext.d3.interaction.PanZoom} interaction
     * @param {Number[]} scaling
     * @param {Number[]} translation
     */
    onPanZoom: Ext.emptyFn,
    /**
     * @protected
     * Returns the bounding box of the content before transformations.
     * This method should be implemented by subclasses that wish to support constrained panning
     * via {@link Ext.d3.interaction.PanZoom `panzoom`} interaction.
     * @return {Object} rect
     * @return {Number} rect.x
     * @return {Number} rect.y
     * @return {Number} rect.width
     * @return {Number} rect.height
     */
    getContentRect: Ext.emptyFn,
    /**
     * @protected
     * Returns the position and size of the viewport in component's coordinates.
     * This method should be implemented by subclasses that wish to support constrained panning
     * via {@link Ext.d3.interaction.PanZoom `panzoom`} interaction.
     * @return {Object} rect
     * @return {Number} rect.x
     * @return {Number} rect.y
     * @return {Number} rect.width
     * @return {Number} rect.height
     */
    getViewportRect: Ext.emptyFn,

    addInteraction: function (interaction) {
        var me = this;

        if (interaction.isPanZoom) {
            interaction.setContentRect(me.getContentRect.bind(me));
            interaction.setViewportRect(me.getViewportRect.bind(me));
            me.panZoom = interaction;
            interaction.on('panzoom', me.onPanZoom, me);
        }
    },

    removeInteraction: function (interaction) {
        if (interaction.isPanZoom) {
            interaction.setContentRect(null);
            interaction.setViewportRect(null);
            this.panZoom = null;
            interaction.un('panzoom', this.onPanZoom, this);
        }
    },

    applyStore: function (store) {
        return store && Ext.StoreManager.lookup(store);
    },

    updateStore: function (store, oldStore) {
        var me = this,
            storeEvents = {
                datachanged: 'onDataChange',
                update: 'onDataUpdate',
                load: 'onDataLoad',
                scope: me,
                order: 'after'
            };

        if (oldStore) {
            oldStore.un(storeEvents);
            if (oldStore.getAutoDestroy()) {
                oldStore.destroy();
            }
        }
        if (store) {
            store.on(storeEvents);
        }
    },

    onDataChange: function (store) {
        var me = this;

        if (me.isInitializing) {
            return;
        }

        me.processDataChange(store);
    },

    onDataUpdate: function (store, record, operation, modifiedFieldNames, details) {
        var me = this;

        if (me.isInitializing) {
            return;
        }

        me.processDataUpdate(store, record, operation, modifiedFieldNames, details);
    },

    onDataLoad: function (store, records, successful, operation) {
        this.processDataLoad(store, records, successful, operation);
    },

    processDataChange: Ext.emptyFn,
    processDataUpdate: Ext.emptyFn,
    processDataLoad: Ext.emptyFn,

    onElementResize: function (element, size) {
        this.handleResize(size);
    },

    handleResize: function (size, instantly) {
        var me = this,
            el = me.element;

        if (!(el && (size = size || el.getSize()) && size.width && size.height)) {
            return;
        }

        clearTimeout(me.resizeTimerId);

        if (!instantly) {
            me.resizeTimerId = Ext.defer(me.handleResize, me.resizeDelay, me, [size, true]);
            return;
        } else {
            me.resizeTimerId = 0;
        }

        me.resizeHandler(size);

        if (me.panZoom && me.panZoom.updateIndicator) {
            me.panZoom.updateIndicator();
        }

        me.size = size;
    },

    resizeHandler: Ext.emptyFn

});
