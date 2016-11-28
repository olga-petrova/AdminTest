/**
 * @private
 */
Ext.define('Ext.exporter.file.ooxml.Base', {
    extend: 'Ext.exporter.file.Base',

    requires: [
        'Ext.exporter.file.ooxml.Relationship',
        'Ext.exporter.file.ooxml.ContentType'
    ],

    config: {
        /**
         * @cfg {String}
         *
         * Full path of the file inside the zip package
         */
        path: '',

        relationship: null,

        contentType: null
    },

    destroy: function(){
        var me = this;

        me.setRelationship(Ext.destroy(me.getRelationship()));
        me.setContentType(Ext.destroy(me.getContentType()));
        me.callParent();
    },

    applyRelationship: function(data){
        if(!data || data.isRelationship){
            return data;
        }
        return new Ext.exporter.file.ooxml.Relationship(data);
    },

    applyContentType: function(data){
        if(!data || data.isContentType){
            return data;
        }
        return new Ext.exporter.file.ooxml.ContentType(data);
    },

    /**
     * Collect all files that are part of the final zip file
     * @param {Object} files Object key is the path to the file and object value is the content
     */
    collectFiles: Ext.emptyFn
});