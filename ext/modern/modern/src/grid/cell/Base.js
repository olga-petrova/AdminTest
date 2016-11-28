/**
 * This is the base class for {@link Ext.grid.Grid grid} cells.
 *
 * {@link Ext.grid.Row Rows} create cells based on the {@link Ext.grid.column.Column#cell}
 * config. Application code would rarely create cells directly.
 */
Ext.define('Ext.grid.cell.Base', {
    extend: 'Ext.Widget',

    cachedConfig: {
        /**
         * @cfg {"left"/"center"/"right"} align
         * The value for the `text-align` of the cell content.
         */
        align: null,

        /**
         * @cfg {String} cls
         * An arbitrary CSS class to add to the cell's outermost element.
         */
        cls: null,

        /**
         * @cfg {Boolean} hidden
         * The hidden state of this cell (propagated from the column's hidden state).
         * @private
         */
        hidden: false,

        /**
         * @cfg {String} innerCls
         * An arbitrary CSS class to add to the cell's inner element (the element that
         * typically contains the cell's text).
         */
        innerCls: null,

        /**
         * @cfg {String/Object} innerStyle
         * Additional CSS styles that will be rendered into the cell's inner element (the element
         * that typically contains the cell's text).
         *
         * You can pass either a string syntax:
         *
         *     innerStyle: 'background:red'
         *
         * Or by using an object:
         *
         *     innerStyle: {
         *         background: 'red'
         *     }
         *
         * When using the object syntax, you can define CSS Properties by using a string:
         *
         *     innerStyle: {
         *         'border-left': '1px solid red'
         *     }
         *
         * Although the object syntax is much easier to read, we suggest you to use the
         * string syntax for better performance.
         */
        innerStyle: null,

        /**
         * @cfg {String} cellCls
         *
         * @protected
         */
        cellCls: null
    },

    config: {
        /**
         * @cfg {Ext.grid.column.Column} column
         * The grid column that created this cell.
         * @readonly
         */
        column: null,

        /**
         * @cfg {Ext.data.Model} record
         * The currently associated record.
         * @readonly
         */
        record: null,

        /**
         * @cfg {Mixed} value
         * The value of the {@link Ext.grid.column.Column#dataIndex dataIndex} field of
         * the associated record. Application code should not need to set this value.
         */
        value: null
    },

    element: {
        reference: 'element',
        cls: Ext.baseCSSPrefix + 'grid-cell',
        children: [{
            reference: 'innerElement',
            cls: Ext.baseCSSPrefix + 'grid-cell-inner'
        }]
    },

    defaultBindProperty: 'value',

    hiddenCls: Ext.baseCSSPrefix + 'grid-cell-hidden',

    getComputedWidth: function() {
        return this.getHidden() ? 0 : this.getWidth();
    },

    updateAlign: function(align, oldAlign) {
        var prefix  = Ext.baseCSSPrefix + 'grid-cell-align-';

        this.element.replaceCls(prefix + oldAlign, prefix + align);
    },

    updateCls: function(cls, oldCls) {
        this.element.replaceCls(oldCls, cls);
    },

    updateCellCls: function(cls, oldCls) {
        this.element.replaceCls(oldCls, cls);
    },

    updateInnerCls: function(cellCls, oldCellCls) {
        if (cellCls || oldCellCls) {
            this.innerElement.replaceCls(oldCellCls, cellCls);
        }
    },

    updateInnerStyle: function(style){
        this.innerElement.applyStyles(style);
    },

    updateColumn: function(column) {
        this.dataIndex = column ? column.getDataIndex() : null;
    },

    applyHidden: function(hidden) {
        return Boolean(hidden);
    },

    updateHidden: function(hidden) {
        this.element.toggleCls(this.hiddenCls, hidden);
    },

    updateRecord: function(record) {
        var dataIndex = this.dataIndex;

        if (record) {
            if (dataIndex) {
                this.setValue(record.get(dataIndex));
            } else {
                this.setValue();
            }
        }
    },

    destroy: function() {
        this.setColumn(null);
        this.setRecord(null);
        this.callParent();
    }
});
