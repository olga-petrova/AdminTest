/**
 * @private
 */
Ext.define('Ext.d3.Title', {

    mixins: {
        detached: 'Ext.d3.mixin.Detached'
    },

    config: {
        /**
         * @cfg {String} [docked='top']
         * The position of the title.
         * Possible values: 'bottom' (default), 'top', 'left', 'right'.
         */
        docked: 'top',

        padding: 30,

        gap: 0,

        title: {
            text: 'ExtJS is the best javascript framework',
            attributes: {

            }
        },

        subtitle: {
            text: 'Everybody knows that',
            attributes: {

            }
        },

        hidden: false,

        component: null
    },

    defaultCls: {
        self: Ext.baseCSSPrefix + 'd3-title',
        title: Ext.baseCSSPrefix + 'd3-title-title',
        subtitle: Ext.baseCSSPrefix + 'd3-title-subtitle'
    },

    constructor: function (config) {
        var me = this;

        me.mixins.detached.constructor.call(me, config);
        me.group = me.getDetached().append('g').classed(me.defaultCls.self, true);
        me.title = me.group.append('text');
        me.subtitle = me.group.append('text');

        me.initConfig(config);
    },

    getGroup: function () {
        return this.group;
    },
    
    applyPadding: function (padding) {
        if (padding) {
            if (Ext.isArray(padding)) {
                padding = padding.slice(2);
            } else {
                padding = [padding, padding];
            }
        } else {
            padding = [0, 0];
        }
        return padding;
    },
    
    updatePadding: function () {
    },

    getBox: function () {
        var me = this,
            docked = me.getDocked(),
            padding = me.getPadding(),
            bbox = me.group.node().getBBox(),
            box = me.box || (me.box = {});

        // Can't use Ext.Object.chain on SVGRect types.
        box.x = bbox.x;
        box.y = bbox.y;
        box.width = bbox.width;
        box.height = bbox.height;

        switch (docked) {
            case 'left':
            case 'right':
                box.x -= padding[0];
                box.width += padding[1];
                break;
            case 'top':
            case 'bottom':
                box.y -= padding[0];
                box.height += padding[1];
                break;
        }

        return box;
    },

    updateTitle: function (title) {
        if (title) {
            this.title.text(title.text);
            this.render();
        }
    },

    updateSubtitle: function (subtitle) {
        if (subtitle) {
            this.subtitle.text(subtitle.text);
            this.render();
        }
    },

    render: function () {
        var me = this,
            titleBBox = me.title.node().getBBox(),
            subtitleBBox = me.subtitle.node().getBBox(),
            translation;

        translation = [
            (titleBBox.width - subtitleBBox.width) / 2,
            titleBBox.y + titleBBox.height
        ];

        me.subtitle.attr('transform', 'translate(' + translation + ')');
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