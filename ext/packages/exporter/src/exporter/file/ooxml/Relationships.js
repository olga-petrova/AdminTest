/**
 * @private
 */
Ext.define('Ext.exporter.file.ooxml.Relationships', {
    extend: 'Ext.exporter.file.ooxml.Base',

    isRelationships: true,

    config: {
        relationships: []
    },

    contentType: {
        contentType: 'application/vnd.openxmlformats-package.relationships+xml',
        partName: '/_rels/.rels'
    },

    tpl: [
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">',
        '<tpl if="relationships"><tpl for="relationships.getRange()">{[values.render()]}</tpl></tpl>',
        '</Relationships>'
    ],

    destroy: function(){
        this.callParent();
        this.setRelationships(null);
    },

    collectFiles: function(files){
        if(this.getRelationships().length){
            files[this.getPath()] = this.render();
        }
    },

    applyRelationships: function(data, dataCollection){
        return this.checkCollection(data, dataCollection, 'Ext.exporter.file.ooxml.Relationship');
    },

    /**
     * Convenience method to add relationships.
     * @param {Object/Array} config
     * @return {Ext.exporter.file.ooxml.Relationship/Ext.exporter.file.ooxml.Relationship[]}
     */
    addRelationship: function(config){
        return this.getRelationships().add(config || {});
    },
    removeRelationship: function(config){
        return this.getRelationships().remove(config);
    }

});