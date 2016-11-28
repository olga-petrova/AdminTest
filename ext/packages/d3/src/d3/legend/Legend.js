/**
 * @private
 */
Ext.define('Ext.d3.legend.Legend', {

    mixins: {
        observable: 'Ext.mixin.Observable',
        detached: 'Ext.d3.mixin.Detached'
    },

    config: {
        /**
         * @cfg {String} [docked='bottom']
         * The position of the legend.
         * Possible values: 'bottom' (default), 'top', 'left', 'right'.
         */
        docked: 'bottom',

        padding: 30,

        hidden: false,

        component: null
    },

    defaultCls: {
        self: Ext.baseCSSPrefix + 'd3-legend',
        item: Ext.baseCSSPrefix + 'd3-legend-item',
        label: Ext.baseCSSPrefix + 'd3-legend-label'
    },

    constructor: function (config) {
        var me = this;

        me.mixins.detached.constructor.call(me, config);
        me.group = me.getDetached().append('g').classed(me.defaultCls.self, true);

        me.mixins.observable.constructor.call(me, config);
    },

    getGroup: function () {
        return this.group;
    },

    getBox: function () {
        var me = this,
            hidden = me.getHidden(),
            docked = me.getDocked(),
            padding = me.getPadding(),
            bbox = me.group.node().getBBox(),
            box = me.box || (me.box = {});

        if (hidden) {
            return {
                x: 0, y: 0, width: 0, height: 0
            };
        }

        // Can't use Ext.Object.chain on SVGRect types.
        box.x = bbox.x;
        box.y = bbox.y;
        box.width = bbox.width;
        box.height = bbox.height;

        switch (docked) {
            case 'right':
                box.x -= padding;
            case 'left':
                box.width += padding;
                break;
            case 'bottom':
                box.y -= padding;
            case 'top':
                box.height += padding;
                break;

        }

        return box;
    },

    updateHidden: function (hidden) {
        hidden ? this.hide() : this.show();
    },

    show: function () {
        var me = this;

        me.group.attr('display', 'inline');
        me.setHidden(false);
        me.fireEvent('show', me);
    },

    hide: function () {
        var me = this;

        me.group.attr('display', 'none');
        me.setHidden(true);
        me.fireEvent('hide', me);
    },

    updateComponent: function (component, oldComponent) {
        var me = this;

        if (oldComponent) {
            me.detach(me.group);
        }
        if (component) {
            me.attach(component.getScene(), me.group);
        }
    },

    destroy: function () {
        this.mixins.detached.destroy.call(this);
    }

});