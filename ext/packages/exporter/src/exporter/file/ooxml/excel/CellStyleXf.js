/**
 * @private
 */
Ext.define('Ext.exporter.file.ooxml.excel.CellStyleXf', {
    extend: 'Ext.exporter.file.ooxml.Base',

    requires: [
        'Ext.exporter.file.ooxml.excel.CellAlignment'
    ],

    config: {
        numFmtId: 0,
        fontId: 0,
        fillId: 0,
        borderId: 0,
        alignment: null
    },

    tpl: [
        '<xf numFmtId="{numFmtId}" fontId="{fontId}" fillId="{fillId}" borderId="{borderId}" <tpl if="fontId"> applyFont="1"</tpl><tpl if="alignment"> applyAlignment="1"</tpl>>',
        '<tpl if="alignment">{[values.alignment.render()]}</tpl>',
        '</xf>'
    ],

    applyAlignment: function(align){
        if(align && !align.isCellAlignment){
            return new Ext.exporter.file.ooxml.excel.CellAlignment(align);
        }
        return align;
    }
});