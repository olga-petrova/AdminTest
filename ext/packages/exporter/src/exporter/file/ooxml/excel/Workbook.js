/**
 * @private
 */
Ext.define('Ext.exporter.file.ooxml.excel.Workbook', {
    extend: 'Ext.exporter.file.ooxml.Base',

    requires: [
        'Ext.exporter.file.ooxml.Relationships',
        'Ext.exporter.file.ooxml.excel.Worksheet',
        'Ext.exporter.file.ooxml.excel.Stylesheet',
        'Ext.exporter.file.ooxml.excel.SharedStrings'
    ],

    isWorkbook: true,
    currentIndex: 1,

    config: {

        relationships: {
            contentType: {
                contentType: 'application/vnd.openxmlformats-package.relationships+xml',
                partName: '/xl/_rels/workbook.xml.rels'
            },
            path: '/xl/_rels/workbook.xml.rels'
        },
        stylesheet: {},
        sharedStrings: {},
        sheets: []

    },

    contentType: {
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml',
        partName: '/xl/workbook.xml'
    },

    relationship: {
        schema: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument',
        target: 'xl/workbook.xml'
    },

    path: '/xl/workbook.xml',

    tpl: [
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
        '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" ',
        'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">',
        '<sheets>',
        '<tpl if="sheets"><tpl for="sheets.getRange()"><sheet name="{[values.getName()]}" sheetId="{[xindex]}" state="visible" r:id="{[values.getRelationship().getId()]}"/></tpl></tpl>',
        '</sheets>',
        '</workbook>'
    ],

    destroy: function(){
        var me = this;

        me.setRelationships(Ext.destroy(me.getRelationships()));
        me.setStylesheet(Ext.destroy(me.getStylesheet()));
        me.setSharedStrings(Ext.destroy(me.getSharedStrings()));
        me.callParent();
        me.setSheets(null);
    },

    collectFiles: function(files){
        var me = this,
            style = me.getStylesheet(),
            strings = me.getSharedStrings(),
            ws, i, length;

        files[me.getPath()] = me.render();
        files[style.getPath()] = style.render();
        files[strings.getPath()] = strings.render();

        ws = me.getSheets();
        length = ws.length;
        for(i = 0; i < length; i++){
            ws.getAt(i).collectFiles(files);
        }

        me.getRelationships().collectFiles(files);
    },

    /**
     * Convenience method to add worksheets.
     * @param {Object/Array} config
     * @return {Ext.exporter.file.ooxml.excel.Worksheet/Ext.exporter.file.ooxml.excel.Worksheet[]}
     */
    addWorksheet: function(config){
        var ws = Ext.Array.from(config),
            length = ws.length,
            i, w;

        for(i = 0; i < length; i++){
            w = ws[i];

            if(w && !w.isWorksheet){
                ws[i] = new Ext.exporter.file.ooxml.excel.Worksheet(w);
            }
        }

        return this.getSheets().add(ws);
    },

    /**
     * Convenience method to remove worksheets.
     * @param {Object/Array} config
     * @return {Ext.exporter.file.ooxml.excel.Worksheet/Ext.exporter.file.ooxml.excel.Worksheet[]}
     */
    removeWorksheet: function(config){
        return this.getSheets().remove(config);
    },

    /**
     * @return {Ext.exporter.file.ooxml.ContentType[]}
     */
    getContentTypes: function(){
        var me = this,
            types = [],
            ws, i, length;

        types.push(me.getContentType());
        types.push(me.getStylesheet().getContentType());
        types.push(me.getSharedStrings().getContentType());
        ws = me.getSheets();
        length = ws.length;
        for(i = 0; i < length; i++){
            types.push(ws.getAt(i).getContentType());
        }

        return types;
    },


    applyRelationships: function(data){
        if(!data || data.isRelationships){
            return data;
        }

        return new Ext.exporter.file.ooxml.Relationships(data);
    },

    applyStylesheet: function(data){
        if(!data || data.isStylesheet){
            return data;
        }

        return new Ext.exporter.file.ooxml.excel.Stylesheet();
    },

    updateStylesheet: function(data, oldData){
        var rels = this.getRelationships();

        if(oldData && rels){
            rels.removeRelationship(oldData.getRelationship());
        }
        if(data && rels){
            rels.addRelationship(data.getRelationship());
        }
    },

    applySharedStrings: function(data){
        if(!data || data.isSharedStrings){
            return data;
        }

        return new Ext.exporter.file.ooxml.excel.SharedStrings();
    },

    updateSharedStrings: function(data, oldData){
        var rels = this.getRelationships();

        if(oldData && rels){
            rels.removeRelationship(oldData.getRelationship());
        }
        if(data){
            rels.addRelationship(data.getRelationship());
        }
    },

    applySheets: function(data, dataCollection){
        return this.checkCollection(data, dataCollection, 'Ext.exporter.file.ooxml.excel.Sheet');
    },

    updateSheets: function(collection, oldCollection){
        var me = this;

        if(oldCollection){
            oldCollection.un({
                add: me.onSheetAdd,
                remove: me.onSheetRemove,
                scope: me
            });
        }
        if(collection){
            collection.on({
                add: me.onSheetAdd,
                remove: me.onSheetRemove,
                scope: me
            });
        }
    },

    onSheetAdd: function(collection, details){
        var rels = this.getRelationships(),
            length = details.items.length,
            i, item;

        for(i = 0; i < length; i++) {
            item = details.items[i];
            item.setIndex(this.currentIndex++);
            item.setWorkbook(this);
            rels.addRelationship(item.getRelationship());
        }
    },

    onSheetRemove: function(collection, details){
        var rels = this.getRelationships(),
            length = details.items.length,
            i, item;

        for(i = 0; i < length; i++) {
            item = details.items[i];
            rels.removeRelationship(item.getRelationship());
            Ext.destroy(item);
        }
    },


    /**
     * Convenience method to add a style.
     *
     * @param {Ext.exporter.file.Style} config
     * @return {Number} Index of the cell style
     */
    addStyle: function(config){
        return this.getStylesheet().addStyle(config);
    }

});