/**
 * @private
 */
Ext.define('Ext.exporter.file.ooxml.excel.Row', {
    extend: 'Ext.exporter.file.Base',

    requires: [
        'Ext.exporter.file.ooxml.excel.Cell'
    ],

    config: {
        /**
         * @cfg {Boolean} [collapsed]
         *
         * `true` if the rows 1 level of outlining deeper than the current row are in the collapsed outline state.
         * It means that the rows which are 1 outline level deeper (numerically higher value) than the current
         * row are currently hidden due to a collapsed outline state.
         *
         * It is possible for collapsed to be false and yet still have the rows in question hidden. This can
         * be achieved by having a lower outline level collapsed, thus hiding all the child rows.
         */
        collapsed: null,
        /**
         * @cfg {Boolean} [hidden=false]
         *
         * `true` if the row is hidden, e.g., due to a collapsed outline or by manually selecting and hiding a row.
         */
        hidden: null,
        /**
         * @cfg {Number} [height]
         *
         * Row height measured in point size. There is no margin padding on row height.
         */
        height: null,
        /**
         * @cfg {Number} [outlineLevel]
         *
         * Outlining level of the row, when outlining is on.
         */
        outlineLevel: null,
        /**
         * @cfg {Boolean} [showPhonetic]
         *
         * `true` if the row should show phonetic.
         */
        showPhonetic: null,
        /**
         * @cfg {String} index
         *
         * Row index. Indicates to which row in the sheet this row definition corresponds.
         */
        index: null,
        /**
         * @cfg {String} [styleId]
         *
         * Index to style record for the row (only applied if {@link #customFormat} attribute is `true`)
         */
        styleId: null,
        /**
         * @cfg {Ext.exporter.file.ooxml.excel.Worksheet} worksheet
         *
         * Reference to the parent worksheet
         */
        worksheet: null,
        /**
         * @cfg {Ext.exporter.file.ooxml.excel.Cell[]} cells
         *
         * Collection of cells available on this row.
         */
        cells: []
    },

    tpl: [
        '<row',
        '<tpl if="index"> r="{index}"</tpl>',
        '<tpl if="collapsed"> collapsed="{collapsed}"</tpl>',
        '<tpl if="hidden"> hidden="1"</tpl>',
        '<tpl if="height"> ht="{height}" customHeight="1"</tpl>',
        '<tpl if="outlineLevel"> outlineLevel="{outlineLevel}"</tpl>',
        '<tpl if="styleId"> s="{styleId}" customFormat="1"</tpl>',
        '>',
        '<tpl if="cells"><tpl for="cells.getRange()">{[values.render()]}</tpl></tpl>',
        '</row>'
    ],

    destroy: function(){
        this.setWorksheet(null);
        this.callParent();
        this.setCells(null);
    },

    applyCells: function(data, dataCollection){
        return this.checkCollection(data, dataCollection, 'Ext.exporter.file.ooxml.excel.Cell');
    },

    updateCells: function(collection, oldCollection){
        var me = this;

        if(oldCollection){
            collection.un({
                add: me.onCellAdd,
                remove: me.onCellRemove,
                scope: me
            });
        }
        if(collection){
            collection.on({
                add: me.onCellAdd,
                remove: me.onCellRemove,
                scope: me
            });
            me.onCellAdd(collection, {items: collection.getRange()});
        }
    },

    onCellAdd: function(collection, details){
        var items = details.items,
            length = items.length,
            i, item;

        for(i = 0; i < length; i++) {
            item = items[i];
            item.setRow(this);
        }
        this.updateCellIndexes();
    },

    onCellRemove: function(collection, details){
        Ext.destroy(details.items);
        this.updateCellIndexes();
    },

    updateCellIndexes: function(){
        var cells = this.getCells(),
            i, len, cell;

        if(!cells){
            return;
        }
        len = cells.length;
        for(i = 0; i < len; i++){
            cell = cells.getAt(i);
            if(!cell.getIndex()) {
                cell.setIndex(i + 1);
            }
        }
    },

    /**
     * Convenience method to add cells.
     * @param {Object/Array} config
     * @return {Ext.exporter.file.ooxml.excel.Cell/Ext.exporter.file.ooxml.excel.Cell[]}
     */
    addCell: function(config){
        return this.getCells().add(config);
    },

    /**
     * Convenience method to fetch a cell by its id.
     * @param id
     * @return {Ext.exporter.file.ooxml.excel.Cell}
     */
    getCell: function(id){
        return this.getCells().get(id);
    }

});