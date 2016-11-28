Ext.define('Ext.chart.overrides.AbstractChart', {
    override: 'Ext.chart.AbstractChart',

    // In Modern toolkit, if chart element style has no z-index specified,
    // some chart surfaces with higher z-indexes (e.g. overlay)
    // may end up on top of modal dialogs shown over the chart.
    zIndex: 0,

    updateLegend: function (legend, oldLegend) {
        this.callParent([legend, oldLegend]);

        if (legend && legend.isDomLegend) {
            this.add(legend);
        }
    },

    onAdded: function (parent, instanced) {
        var legend = this.getLegend();

        this.callParent([parent, instanced]);

        if (legend && legend.isDomLegend) {
            parent.add(legend);
        }
    },

    onItemRemove: function (item, index, destroy) {
        var map = this.surfaceMap,
            type = item.type,
            items = map && map[type];

        this.callParent([item, index, destroy]);
        if (items) {
            Ext.Array.remove(items, item);
            if (items.length === 0) {
                delete map[type];
            }
        }
    },

    destroy: function () {
        var me = this;

        // TODO: Modern Component should have onDestroy method,
        // TODO: so we don't have to set these flags in subclasses.
        me.isDestroying = me.destroying = true;
        me.destroyChart();
        me.callParent();
    }

});
