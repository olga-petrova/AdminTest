Ext.define('Ext.overrides.grid.column.Column', {
    override: 'Ext.grid.column.Column',

    updateSortIndicator: function (direction) {
        var me = this,
            oldDirection = me._sortDirection,
            sortedCls = me.getSortedCls();

        if (oldDirection) {
            me.element.removeCls(sortedCls + '-' + oldDirection.toLowerCase());
        }

        if (direction) {
            me.element.addCls(sortedCls + '-' + direction.toLowerCase());
        }
        me._sortDirection = direction;
    }
});