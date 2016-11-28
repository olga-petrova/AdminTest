/**
 * Possible values for numFmtId:
 *
 * -  0 - General
 * -  1 - 0
 * -  2 - 0.00
 * -  3 - #,##0
 * -  4 - #,##0.00
 * -  9 - 0%
 * - 10 - 0.00%
 * - 11 - 0.00E+00
 * - 12 - # ?/?
 * - 13 - # ??/??
 * - 14 - mm-dd-yy
 * - 15 - d-mmm-yy
 * - 16 - d-mmm
 * - 17 - mmm-yy
 * - 18 - h:mm AM/PM
 * - 19 - h:mm:ss AM/PM
 * - 20 - h:mm
 * - 21 - h:mm:ss
 * - 22 - m/d/yy h:mm
 * - 37 - #,##0 ;(#,##0)
 * - 38 - #,##0 ;[Red](#,##0)
 * - 39 - #,##0.00;(#,##0.00)
 * - 40 - #,##0.00;[Red](#,##0.00)
 * - 45 - mm:ss
 * - 46 - [h]:mm:ss
 * - 47 - mmss.0
 * - 48 - ##0.0E+0
 * - 49 - @
 *
 *
 * If in your XF object you use one of the numFmtId listed above then there's no need to define a NumberFormat object.
 *
 *
 * @private
 */
Ext.define('Ext.exporter.file.ooxml.excel.NumberFormat', {
    extend: 'Ext.exporter.file.ooxml.Base',

    config: {
        isDate: false,
        numFmtId: null,
        formatCode: ''
    },

    tpl: [
        '<numFmt numFmtId="{numFmtId}" formatCode="{formatCode}"/>'
    ],

    spaceRe: /(,| )/g,

    getRenderData: function(){
        var data = this.callParent(),
            fmt = data.formatCode;

        fmt = (fmt && data.isDate) ? fmt.replace(this.spaceRe, '\\$1') : fmt;
        data.formatCode = fmt;

        return data;
    },

    applyFormatCode: function(value){
        return value ? Ext.util.Format.htmlEncode(value) : value;
    },

    getKey: function(){
        return this.getFormatCode();
    }
});