/**
 * @class Ext.grid.plugin.RowExpander
 * @extends Ext.Component
 * Description
 */
Ext.define('Ext.grid.plugin.RowExpander', {
    extend: 'Ext.Component',

    requires: [
        'Ext.grid.cell.Expander'
    ],

    alias: 'plugin.gridrowexpander',

    config: {
        grid: null,
        column: {
            text: '',
            width: 50,
            cls: Ext.baseCSSPrefix + 'grid-row-expander-column',
            resizable: false,
            hideable: false,
            sortable: false,
            editable: false,
            ignore: true,
            ignoreExport: true,
            cell: {
                xtype: 'expandercell'
            }
        }
    },

    init: function (grid) {
        this.setGrid(grid);
    },

    updateGrid: function (grid, oldGrid) {
        var me = this;
        if (grid) {
            grid.addCls(Ext.baseCSSPrefix + 'has-row-expander-column');
            grid.insertColumn(0, me.getColumn());
            grid.updateTotalColumnWidth();

            grid.element.on('tap', 'onGridTap', this);
        }
    },

    onGridTap: function(event) {
        var el = event.getTarget(),
            cell = Ext.Component.fromElement(el), row;

        if (cell.isExpanderCell) {
            row = cell.getParent();
            row.toggleCollapsed();
        }
    }
});