/**
 * @private
 */
Ext.define('Ext.exporter.file.ooxml.excel.Worksheet', {
    extend: 'Ext.exporter.file.ooxml.excel.Sheet',

    requires: [
        'Ext.exporter.file.ooxml.excel.Column',
        'Ext.exporter.file.ooxml.excel.Row'
    ],

    isWorksheet: true,

    config: {
        columns: null,
        rows: [],
        drawings: null,
        tables: null,
        mergeCells: null

        //comments: null,
        //pivotTables: null,
        //tableSingleCell: null
    },

    folder: 'worksheets',
    fileName: 'sheet',

    contentType: {
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml'
    },

    relationship: {
        schema: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet'
    },

    tpl: [
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
        '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" ',
        'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">',
        '<tpl if="columns">',
        '<cols>',
        '<tpl for="columns.getRange()">{[values.render()]}</tpl>',
        '</cols>',
        '</tpl>',
        '<sheetData>',
        '<tpl if="rows"><tpl for="rows.getRange()">{[values.render()]}</tpl></tpl>',
        '</sheetData>',
        '<tpl if="rows">',
        '<mergeCells>',
            '<tpl for="rows.getRange()">',
                '<tpl for="_cells.items">',
                '<tpl if="isMergedCell"><mergeCell ref="{[values.getMergedCellRef()]}"/></tpl>',
                '</tpl>',
            '</tpl>',
        '</mergeCells>',
        '</tpl>',
        '</worksheet>'
    ],

    destroy: function(){
        var me = this;

        me.callParent();
        me.setRows(null);
        me.setTables(null);
        me.setDrawings(null);
    },

    applyColumns: function(data, dataCollection){
        return this.checkCollection(data, dataCollection, 'Ext.exporter.file.ooxml.excel.Column');
    },

    applyRows: function(data, dataCollection){
        return this.checkCollection(data, dataCollection, 'Ext.exporter.file.ooxml.excel.Row');
    },

    updateRows: function(collection, oldCollection){
        var me = this;

        if(oldCollection){
            oldCollection.un({
                add: me.onRowAdd,
                remove: me.onRowRemove,
                scope: me
            });
        }
        if(collection){
            collection.on({
                add: me.onRowAdd,
                remove: me.onRowRemove,
                scope: me
            });
            me.onRowAdd(collection, {items: collection.getRange()});
        }
    },

    onRowAdd: function(collection, details){
        var items = details.items,
            length = items.length,
            i, item;

        for(i = 0; i < length; i++) {
            item = items[i];
            item.setWorksheet(this);
        }
        this.updateRowIndexes();
    },

    onRowRemove: function(collection, details){
        Ext.destroy(details.items);
    },

    updateRowIndexes: function(){
        var rows = this.getRows(),
            i, len, row;

        if(!rows){
            return;
        }
        len = rows.length;
        for(i = 0; i < len; i++){
            row = rows.getAt(i);
            if(!row.getIndex()) {
                row.setIndex(i + 1);
            }
        }
    },

    updateDrawings: function(data){
        var rels = this.getRelationships();

        if(oldData && rels){
            rels.removeRelationship(oldData.getRelationship());
        }
        if(data && rels){
            rels.addRelationship(data.getRelationship());
        }
    },

    updateTables: function(data){
        var rels = this.getRelationships();

        if(oldData && rels){
            rels.removeRelationship(oldData.getRelationship());
        }
        if(data && rels){
            rels.addRelationship(data.getRelationship());
        }
    },

    /**
     * Convenience method to add column infos.
     * @param {Object/Array} config
     * @return {Ext.exporter.file.ooxml.excel.Column/Ext.exporter.file.ooxml.excel.Column[]}
     */
    addColumn: function(config){
        if(!this.getColumns()){
            this.setColumns([]);
        }
        return this.getColumns().add(config || {});
    },

    /**
     * Convenience method to add rows.
     * @param {Object/Array} config
     * @return {Ext.exporter.file.ooxml.excel.Row/Ext.exporter.file.ooxml.excel.Row[]}
     */
    addRow: function(config){
        return this.getRows().add(config || {});
    },

    /**
     * Convenience method to fetch a row by its id.
     * @param id
     * @return {Ext.exporter.file.ooxml.excel.Row}
     */
    getRow: function(id){
        return this.getRows().get(id);
    }


});