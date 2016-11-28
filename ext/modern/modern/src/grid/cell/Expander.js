Ext.define('Ext.grid.cell.Expander', {
    extend: 'Ext.grid.cell.Base',
    xtype: 'expandercell',

    element: {
        reference: 'element',
        cls: Ext.baseCSSPrefix + 'grid-expander-cell'
    },

    isExpanderCell: true
});
