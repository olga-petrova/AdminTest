/**
 * @private
 */
Ext.define('Ext.exporter.file.ooxml.excel.Sheet', {
    extend: 'Ext.exporter.file.ooxml.Base',

    config: {
        index: 1,
        name: null,
        folder: 'sheet',
        fileName: 'sheet',

        relationships: {
            contentType: {
                contentType: 'application/vnd.openxmlformats-package.relationships+xml'
            }
        },

        /**
         * @cfg {Ext.exporter.file.ooxml.excel.Workbook} workbook
         *
         * Reference to the parent workbook.
         */
        workbook: null
    },

    contentType: {},

    relationship: {},

    destroy: function(){
        var me = this;

        me.setRelationships(Ext.destroy(me.getRelationships()));
        me.setWorkbook(null);
        me.callParent();
    },

    collectFiles: function(files){
        var me = this,
            path = me.getFolder() + '/',
            name = me.getFileName() + me.getIndex() + '.xml',
            rels = me.getRelationships();

        me.getRelationship().setTarget(path + name);
        me.setPath('/xl/' + path + name);
        me.getContentType().setPartName('/xl/' + path + name);
        rels.getContentType().setPartName('/xl/' + path + '_rels/' + name + '.rels');
        rels.setPath('/xl/' + path + '_rels/' + name + '.rels');

        me.getRelationships().collectFiles(files);
        files[me.getPath()] = me.render();
    },

    applyRelationships: function(data){
        if(!data || data.isRelationships){
            return data;
        }

        return new Ext.exporter.file.ooxml.Relationships(data);
    }


});