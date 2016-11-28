/**
 * A Column subclass which renders a checkbox in each column cell which toggles the truthiness of the associated data field on click.
 */
Ext.define('Ext.grid.column.Check', {
    extend: 'Ext.grid.column.Column',

    requires: [
        'Ext.util.Format',
        'Ext.grid.cell.Number'
    ],

    xtype: 'checkcolumn',
    
    allCheckedCls: Ext.baseCSSPrefix + 'checkcolumn-allchecked',

    /**
     * @event beforecheckchange
     * Fires when the UI requests a change of check status.
     * The change may be vetoed by returning `false` from a listener.
     * @param {Ext.grid.column.Check} this CheckColumn.
     * @param {Number} rowIndex The row index.
     * @param {Boolean} checked `true` if the box is to be checked.
     * @param {Ext.data.Model} The record to be updated.
     * @param {Ext.event.Event} e The underlying event which caused the check change.
     * @param {Ext.grid.CellContext} e.position A {@link Ext.grid.CellContext CellContext} object
     * containing all contextual information about where the event was triggered.
     */

    /**
     * @event checkchange
     * Fires when the UI has successfully changed the checked state of a row.
     * @param {Ext.grid.column.Check} this CheckColumn.
     * @param {Number} rowIndex The row index.
     * @param {Boolean} checked `true` if the box is now checked.
     * @param {Ext.data.Model} The record which was updated.
     * @param {Ext.event.Event} e The underlying event which caused the check change.
     * @param {Ext.grid.CellContext} e.position A {@link Ext.grid.CellContext CellContext} object
     */

    config: {
        /**
         * @cfg {String} align
         * @hide
         */

        /**
         * @cfg {Boolean} [stopSelection=true]
         * Prevent grid selection upon tap.
         */
        stopSelection: true,

        /**
         * @cfg {Boolean} [headerCheckbox=false]
         * Configure as `true` to display a checkbox below the header text.
         *
         * Clicking the checkbox will check/uncheck all records.
         */
        headerCheckbox: null
    },

    align: 'center',
    ignoreExport: true,

    cell: {
        xtype: 'checkcell'
    },

    getElementConfig: function () {
        var result = this.callParent();

        /* Base class returns this:
        {
            reference: 'element',
            children: [{
                reference: 'trigger',
                className: 'x-grid-column-trigger'
            }, {
                reference: 'resizer',
                className: 'x-grid-column-resizer'
            }, {
                reference: 'titleEl',
                className: Ext.baseCSSPrefix + 'innerhtml',
                children: [{
                    reference: 'innerHtmlElement',
                    className: Ext.baseCSSPrefix + 'column-title' 
               }]
            }]
        }
        */
       
       result.children[2].children.push({
            reference: 'checkboxEl',
            className: Ext.baseCSSPrefix + 'checkcolumn-checkbox'
       });
       return result;
    },

    onPainted: function() {
        this.callParent();

        // Ensure initial state is correct.
        this.updateHeaderState();
    },

    onColumnTap: function (e) {
        if (e.target === this.checkboxEl.dom) {
            this.toggleAll(e);
        }
        this.callParent([e]);
    },

    toggleAll: function(e) {
        var me = this,
            store = me.grid.getStore(),
            checked = !me.allChecked;

        if (me.fireEvent('beforeheadercheckchange', me, checked, e) !== false) {

            store.each(function(record) {
                me.setRecordCheck(record, checked);
            });

            me.setHeaderStatus(checked, e);
            me.fireEvent('headercheckchange', me, checked, e);
        }
    },

    setRecordCheck: function (record, checked) {
        var me = this,
            dataIndex = me.getDataIndex();

        // Only proceed if we NEED to change
        if (record.get(dataIndex) != checked) {
            record.set(dataIndex, checked);
        }

        // Must clear the "all checked" status in the column header
        if (checked) {
            me.updateHeaderState();
        } else {
            me.setHeaderStatus(checked);
        }
    },

    areAllChecked: function() {
        var me = this,
            store = me.grid.getStore(),
            records, len, i;

        if (!store.isBufferedStore && store.getCount() > 0) {
            records = store.getData().items;
            len = records.length;
            for (i = 0; i < len; ++i) {
                if (!me.isRecordChecked(records[i])) {
                    return false;
                }
            }
            return true;
        }
    },

    isRecordChecked: function (record) {
        return record.get(this.getDataIndex());
    },

    updateHeaderState: function() {
        // This is called on a timer, so ignore if it fires after destruction
        if (!this.destroyed && this.getHeaderCheckbox()) {
            this.setHeaderStatus(this.areAllChecked());
        }
    },

    setHeaderStatus: function(checked) {
        var me = this;

        // Will fire initially due to allChecked being undefined and using !==
        if (me.allChecked !== checked) {
            me.allChecked = checked;
            me.el.toggleCls(me.allCheckedCls, checked);
        }
    },

    updateDisabled: function(disabled, oldDisabled) {
        var me = this,
            rows,
            len, i;

        me.callParent([disabled, oldDisabled]);

        if (me.grid) {
            rows = me.grid.getViewItems();
            len = rows.length, i;
            for (i = 0; i < len; i++) {
                rows[i].getCellByColumn(me).setDisabled(disabled);
            }
        }
    },

    updateHeaderCheckbox: function(headerCheckbox) {
        this.el.toggleCls(Ext.baseCSSPrefix + 'check-column', headerCheckbox);
        this.setSortable(!headerCheckbox);

        // May be caled in initialization before we are added to a grid.
        if (this.grid) {

            // Keep the header checkbox up to date
            this.updateHeaderState();
        }
    }
});