/**
 * @private
 */
Ext.define('Ext.exporter.file.ooxml.excel.Border', {
    extend: 'Ext.exporter.file.ooxml.Base',

    requires: [
        'Ext.exporter.file.ooxml.excel.BorderPr'
    ],

    config: {
        left: null,
        right: null,
        top: null,
        bottom: null
    },

    tpl: [
        '<border>',
        '<tpl if="left">{[values.left.render()]}</tpl>',
        '<tpl if="right">{[values.right.render()]}</tpl>',
        '<tpl if="top">{[values.top.render()]}</tpl>',
        '<tpl if="bottom">{[values.bottom.render()]}</tpl>',
        '</border>'
    ],

    applyLeft: function(border){
        if(border && !border.isBorderPr){
            return new Ext.exporter.file.ooxml.excel.BorderPr(border);
        }
        return border;
    },

    applyTop: function(border){
        if(border && !border.isBorderPr){
            return new Ext.exporter.file.ooxml.excel.BorderPr(border);
        }
        return border;
    },

    applyRight: function(border){
        if(border && !border.isBorderPr){
            return new Ext.exporter.file.ooxml.excel.BorderPr(border);
        }
        return border;
    },

    applyBottom: function(border){
        if(border && !border.isBorderPr){
            return new Ext.exporter.file.ooxml.excel.BorderPr(border);
        }
        return border;
    },

    updateLeft: function(border){
        if(border){
            border.setTag('left');
        }
    },

    updateTop: function(border){
        if(border){
            border.setTag('top');
        }
    },

    updateRight: function(border){
        if(border){
            border.setTag('right');
        }
    },

    updateBottom: function(border){
        if(border){
            border.setTag('bottom');
        }
    }

});