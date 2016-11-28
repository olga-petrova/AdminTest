/**
 * Abstract class for D3 components
 * with the [Partition layout](https://github.com/mbostock/d3/wiki/Partition-Layout).
 */
Ext.define('Ext.d3.hierarchy.partition.Partition', {
    extend: 'Ext.d3.hierarchy.Hierarchy',
    xtype: 'd3-partition',

    config: {
        partitionCls: 'partition'
    },

    updatePartitionCls: function (partitionCls, oldPartitionCls) {
        var baseCls = this.getBaseCls(),
            el = this.element;

        if (partitionCls && Ext.isString(partitionCls)) {
            el.addCls(partitionCls, baseCls);
            if (oldPartitionCls) {
                el.removeCls(oldPartitionCls, baseCls);
            }
        }
    },

    applyLayout: function () {
        return d3.layout.partition();
    },

    performLayout: function () {
        this.resetZoom(true);
        this.callParent();
    },

    resetZoom: function (instantly) {
        var me = this,
            store = me.getStore(),
            root = store && store.getRoot();

        me.zoomInNode(root, instantly);
    }

});