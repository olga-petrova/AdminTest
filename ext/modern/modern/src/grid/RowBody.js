Ext.define('Ext.grid.RowBody', {
    extend: 'Ext.Component',
    xtype: 'rowbody',

    config: {
        baseCls: Ext.baseCSSPrefix + 'grid-rowbody',
        widget: null
    },

    applyWidget: function (widget) {
        var row = this.parent;
        if (widget) {
            widget = Ext.apply({
                parent: row
            }, widget);
            widget = Ext.widget(widget);
        }
        return widget;
    },

    updateWidget: function (widget, oldWidget) {
        if (oldWidget) {
            oldWidget.destroy();
        }

        if (widget) {
            this.element.appendChild(widget.element);
        }
    },

    updateRecord: function (record, oldRecord) {
        var tpl = this.getTpl();

        if (tpl) {
            this.callParent([record, oldRecord]);
        }
    },

    destroy: function () {
        this.setWidget(null);
        this.callParent();
    }
});
