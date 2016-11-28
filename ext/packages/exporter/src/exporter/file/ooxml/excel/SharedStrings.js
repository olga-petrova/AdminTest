/**
 * @private
 */
Ext.define('Ext.exporter.file.ooxml.excel.SharedStrings', {
    extend: 'Ext.exporter.file.ooxml.Base',

    isSharedStrings: true,

    config: {
        strings: []
    },

    contentType: {
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml',
        partName: '/xl/sharedStrings.xml'
    },

    relationship: {
        schema: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings',
        target: 'sharedStrings.xml'
    },

    path: '/xl/sharedStrings.xml',

    tpl: [
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
        '<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">',
        '<tpl for="strings"><si><t>{.:this.utf8}</t></si></tpl>',
        '</sst>',
        {
            utf8: function(v){
                return Ext.util.Base64._utf8_encode(v);
            }
        }
    ],

    destroy: function(){
        this.setStrings(null);
        this.callParent();
    },

    addString: function(value){
        var v = Ext.util.Format.htmlEncode(value),
            s = this.getStrings(),
            index = Ext.Array.indexOf(s, v);

        if(index < 0){
            s.push(v);
            index = s.length - 1;
        }

        return index;
    }
});