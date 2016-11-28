/**
 * A Cell subclass which renders a checkbox in each column cell which toggles the truthiness of the associated data field on click..
 */
Ext.define('Ext.grid.cell.Check', {
    extend: 'Ext.grid.cell.Cell',
    xtype: 'checkcell',

    /**
     * @cfg {String} [disabledCls="x-item-disabled"] The CSS class to add to the component when it is disabled
     * @accessor
     */
    disabledCls: Ext.baseCSSPrefix + 'item-disabled',
    
    cellCheckedCls: Ext.baseCSSPrefix + 'checkcell-checked',
        
    config: {
        /**
         * @cfg {Boolean} disabled
         * Whether or not this component is disabled
         */
        disabled: null
    },

    element: {
        reference: 'element',
        cls: Ext.baseCSSPrefix + 'grid-cell ' + Ext.baseCSSPrefix + 'grid-checkcell',
        listeners: {
            tap: 'onTap',
            scope: 'this'
        },
        children: [{
            reference: 'innerElement',
            cls: Ext.baseCSSPrefix + 'grid-cell-inner',
            children: [{
                reference: 'checkboxEl',
                cls: Ext.baseCSSPrefix + 'checkcell-checkbox'
            }]
        }]
    },

    updateValue: function(value) {
        var column = this.getColumn();

        value = Boolean(value);
        this.el.toggleCls(this.cellCheckedCls, value);

        // Keep column header state up to date.
        if (value) {
            column.updateHeaderState();
        } else {
            column.setHeaderStatus(value);
        }
    },

    updateColumn: function(column, olcColumn) {
        this.callParent([column, olcColumn]);
        if (column) {
            this.setDisabled(column.getDisabled());
        }
    },

    applyDisabled: function(disabled) {
        return Boolean(disabled);
    },

    updateDisabled: function(disabled) {
        this.element.toggleCls(this.disabledCls, disabled);
    },

    /**
     * Disables this CheckCell
     */
    disable: function() {
       this.setDisabled(true);
    },

    /**
     * Enables this CheckCell
     */
    enable: function() {
        this.setDisabled(false);
    },

    onTap: function(e) {
        var me = this,
            record = me.getRecord(),
            column = me.getColumn(),
            recordIndex = column.up('grid').getStore().indexOf(record),
            dataIndex = me.dataIndex,
            checked;

        if (record) {
            checked = !column.isRecordChecked(record);
            if (column.getDisabled()) {
                return;
            }

            if (column.fireEvent('beforecheckchange', column, recordIndex, checked, record, e) !== false) {
                if (me.getColumn().getStopSelection()) {
                    e.stopSelection = true;
                }

                if (record && dataIndex) {
                    column.setRecordCheck(record, checked);
                }
                if (column.hasListeners.checkchange) {
                    column.fireEvent('checkchange', column, recordIndex, checked, record, e);
                }
            }
        }
    }
});
