/**
 * @private
 */
Ext.define('Ext.exporter.file.ooxml.excel.Stylesheet', {
    extend: 'Ext.exporter.file.ooxml.Base',

    requires: [
        'Ext.exporter.file.Style',
        'Ext.exporter.file.ooxml.excel.Font',
        'Ext.exporter.file.ooxml.excel.NumberFormat',
        'Ext.exporter.file.ooxml.excel.Fill',
        'Ext.exporter.file.ooxml.excel.Border',
        'Ext.exporter.file.ooxml.excel.CellXf'
    ],

    isStylesheet: true,

    config: {
        fonts: [{
            fontName: 'Arial',
            size: 10,
            family: 2
        }],
        numberFormats: null,
        fills: [{
            patternType: 'none'
        }],
        borders: [{
            left: {},
            top: {},
            right: {},
            bottom: {}
        }],
        cellStyleXfs: [{}],
        cellXfs: [{}]
    },

    contentType: {
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml',
        partName: '/xl/styles.xml'
    },

    relationship: {
        schema: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles',
        target: 'styles.xml'
    },

    path: '/xl/styles.xml',

    tpl: [
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
        '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">',
        '<tpl if="numberFormats"><numFmts count="{numberFormats.length}"><tpl for="numberFormats.getRange()">{[values.render()]}</tpl></numFmts></tpl>',
        '<tpl if="fonts"><fonts count="{fonts.length}"><tpl for="fonts.getRange()">{[values.render()]}</tpl></fonts></tpl>',
        '<tpl if="fills"><fills count="{fills.length}"><tpl for="fills.getRange()">{[values.render()]}</tpl></fills></tpl>',
        '<tpl if="borders"><borders count="{borders.length}"><tpl for="borders.getRange()">{[values.render()]}</tpl></borders></tpl>',
        '<tpl if="cellStyleXfs"><cellStyleXfs count="{cellStyleXfs.length}"><tpl for="cellStyleXfs.getRange()">{[values.render()]}</tpl></cellStyleXfs></tpl>',
        '<tpl if="cellXfs"><cellXfs count="{cellXfs.length}"><tpl for="cellXfs.getRange()">{[values.render()]}</tpl></cellXfs></tpl>',
        '</styleSheet>'
    ],

    lastNumberFormatId: 164,

    datePatterns: {
        'General Date': '[$-F800]dddd, mmmm dd, yyyy',
        'Long Date': '[$-F800]dddd, mmmm dd, yyyy',
        'Medium Date': 'mm/dd/yy;@',
        'Short Date': 'm/d/yy;@',
        'Long Time': 'h:mm:ss;@',
        'Medium Time': '[$-409]h:mm AM/PM;@',
        'Short Time': 'h:mm;@'
    },
    numberPatterns: {
        'General Number': 1,
        'Fixed': 2,
        'Standard': 2,
        'Percent': 10,
        'Scientific': 11,
        'Currency': '"$"#,##0.00',
        'Euro Currency': '"€"#,##0.00'
    },
    booleanPatterns: {
        'Yes/No': '"Yes";-;"No"',
        'True/False': '"True";-;"False"',
        'On/Off': '"On";-;"Off"'
    },

    destroy: function(){
        var me = this;

        me.callParent();
        me.setFonts(null);
        me.setNumberFormats(null);
        me.setFills(null);
        me.setBorders(null);
        me.setCellXfs(null);
    },

    applyFonts: function(data, dataCollection){
        return this.checkCollection(data, dataCollection, 'Ext.exporter.file.ooxml.excel.Font');
    },
    applyNumberFormats: function(data, dataCollection){
        return this.checkCollection(data, dataCollection, 'Ext.exporter.file.ooxml.excel.NumberFormat');
    },
    applyFills: function(data, dataCollection){
        return this.checkCollection(data, dataCollection, 'Ext.exporter.file.ooxml.excel.Fill');
    },
    applyBorders: function(data, dataCollection){
        return this.checkCollection(data, dataCollection, 'Ext.exporter.file.ooxml.excel.Border');
    },
    applyCellXfs: function(data, dataCollection){
        return this.checkCollection(data, dataCollection, 'Ext.exporter.file.ooxml.excel.CellXf');
    },
    applyCellStyleXfs: function(data, dataCollection){
        return this.checkCollection(data, dataCollection, 'Ext.exporter.file.ooxml.excel.CellStyleXf');
    },

    addFont: function(config){
        var col = this.getFonts(),
            ret;

        if(!col){
            this.setFonts([]);
            col = this.getFonts();
        }
        ret = col.add(config);
        return col.indexOf(ret);
    },

    addNumberFormat: function(config){
        var col = this.getNumberFormats(),
            ret, temp;

        if(!col){
            this.setNumberFormats([]);
            col = this.getNumberFormats();
        }
        temp = new Ext.exporter.file.ooxml.excel.NumberFormat(config);
        ret = col.get(temp.getKey());

        if(!ret){
            ret = temp;
            col.add(ret);
            ret.setNumFmtId(this.lastNumberFormatId++);
        }

        return ret.getNumFmtId();
    },

    addFill: function(config){
        var col = this.getFills(),
            ret;

        if(!col){
            this.setFills([]);
            col = this.getFills();
        }
        ret = col.add(config);
        return col.indexOf(ret);
    },

    addBorder: function(config){
        var col = this.getBorders(),
            ret;

        if(!col){
            this.setBorders([]);
            col = this.getBorders();
        }
        ret = col.add(config);
        return col.indexOf(ret);
    },

    addCellXf: function(config){
        var col = this.getCellXfs(),
            ret;

        if(!col){
            this.setCellXfs([]);
            col = this.getCellXfs();
        }
        ret = col.add(config);
        return col.indexOf(ret);
    },

    addCellStyleXf: function(config){
        var col = this.getCellStyleXfs(),
            ret;

        if(!col){
            this.setCellStyleXfs([]);
            col = this.getCellStyleXfs();
        }
        ret = col.add(config);
        return col.indexOf(ret);
    },

    getStyleParams: function(style){
        var me = this,
            s = new Ext.exporter.file.Style(style),
            cfg = s.getConfig(),
            numFmtId = 0,
            fontId = 0,
            fillId = 0,
            borderId = 0,
            xfId = 0;

        cfg.parentId = style ? style.parentId : null;
        if(cfg.font){
            fontId = me.addFont(cfg.font);
        }

        if(cfg.format){
            numFmtId = me.getNumberFormatId(cfg.format);
        }

        if(cfg.interior){
            fillId = me.addFill(cfg.interior);
        }

        if(cfg.borders){
            borderId = me.getBorderId(cfg.borders);
        }

        if(cfg.parentId){
            xfId = cfg.parentId;
        }

        return {
            numFmtId: numFmtId,
            fontId: fontId,
            fillId: fillId,
            borderId: borderId,
            xfId: xfId,
            alignment: cfg.alignment || null
        };
    },

    /**
     * Convenience method to add a new style. The returned index may be used as `styleId` in a Row or Cell.
     *
     * @param {Ext.exporter.file.Style} style
     * @return The index of the newly added {Ext.exporter.file.ooxml.excel.CellStyleXf} object
     */
    addStyle: function (style) {
        return this.addCellStyleXf(this.getStyleParams(style));
    },

    /**
     * Add a cell specific style.
     *
     * @param {Ext.exporter.file.Style} style
     * @return The index of the newly added {Ext.exporter.file.ooxml.excel.CellXf} object
     */
    addCellStyle: function (style) {
        return this.addCellXf(this.getStyleParams(style));
    },

    getNumberFormatId: function(f){
        var me = this,
            isDate = !!me.datePatterns[f],
            id, code;

        if(f === 'General'){
            return 0;
        }

        code = me.datePatterns[f] || me.booleanPatterns[f] || me.numberPatterns[f];

        if(Ext.isNumeric(code)){
            id = code;
        }else if(!code){
            code = f;
        }

        return id || me.addNumberFormat({
                isDate: isDate,
                formatCode: code
            });
    },

    getBorderId: function(borders){
        var cfg = {},
            len = borders.length,
            i, b, key;

        for(i = 0; i < len; i++){
            b = borders[i];
            key = Ext.util.Format.lowercase(b.position);
            delete(b.position);
            cfg[key] = b;
        }

        return this.addBorder(cfg);
    }

});