/**
 * This exporter produces Microsoft Excel 2007 xlsx files for the supplied data. The standard [ISO/IEC 29500-1:2012][1]
 * was used for this implementation.
 *
 * [1]: http://www.iso.org/iso/home/store/catalogue_ics/catalogue_detail_ics.htm?csnumber=61750
 */
Ext.define('Ext.exporter.excel.Xlsx', {
    extend: 'Ext.exporter.Base',

    // for backward compatibility
    alternateClassName: 'Ext.exporter.Excel',

    alias: [
        'exporter.excel07',
        'exporter.xlsx',
        // last version of excel supported will get this alias
        'exporter.excel'
    ],

    requires: [
        'Ext.exporter.file.ooxml.Excel'
    ],

    config: {
        /**
         * @cfg {Ext.exporter.file.excel.Style} defaultStyle
         *
         * Default style applied to all cells
         */
        defaultStyle: {
            alignment: {
                vertical: 'Top'
            },
            font: {
                fontName: 'Arial',
                family: 'Swiss',
                size: 11,
                color: '#000000'
            }
        },

        /**
         * @cfg {Ext.exporter.file.excel.Style} titleStyle
         *
         * Default style applied to the title
         */
        titleStyle: {
            alignment: {
                horizontal: 'Center',
                vertical: 'Center'
            },
            font: {
                fontName: 'Arial',
                family: 'Swiss',
                size: 18,
                color: '#1F497D'
            }
        },

        /**
         * @cfg {Ext.exporter.file.excel.Style} groupHeaderStyle
         *
         * Default style applied to the group headers
         */
        groupHeaderStyle: {
            borders: [{
                position: 'Bottom',
                lineStyle: 'Continuous',
                weight: 1,
                color: '#4F81BD'
            }]
        },

        /**
         * @cfg {Ext.exporter.file.excel.Style} groupFooterStyle
         *
         * Default style applied to the group footers
         */
        groupFooterStyle: {
            borders: [{
                position: 'Top',
                lineStyle: 'Continuous',
                weight: 1,
                color: '#4F81BD'
            }]
        },

        /**
         * @cfg {Ext.exporter.file.excel.Style} tableHeaderStyle
         *
         * Default style applied to the table headers
         */
        tableHeaderStyle: {
            alignment: {
                horizontal: 'Center',
                vertical: 'Center'
            },
            borders: [{
                position: 'Bottom',
                lineStyle: 'Continuous',
                weight: 1,
                color: '#4F81BD'
            }],
            font: {
                fontName: 'Arial',
                family: 'Swiss',
                size: 11,
                color: '#1F497D'
            }
        }
    },

    fileName: 'export.xlsx',

    destroy: function () {
        var me = this;

        me.excel = me.worksheet = Ext.destroy(me.excel, me.worksheet);

        me.callParent();
    },

    delayedSave: function(resolve){
        Ext.exporter.File.saveBinaryAs(this.getContent(), this.getFileName(), 'application/zip');
        resolve();
    },

    getContent: function() {
        var me = this,
            config = this.getConfig(),
            data = config.data,
            colMerge;

        me.excel = new Ext.exporter.file.ooxml.Excel({
            properties: {
                title: config.title,
                author: config.author
            }
        });

        me.worksheet = me.excel.addWorksheet({
            name: config.title
        });
        me.tableHeaderStyleId = me.excel.addCellStyle(config.tableHeaderStyle);

        colMerge = data ? data.getColumnCount() : 1;

        me.addTitle(config, colMerge);

        if(data) {
            me.buildHeader();
            me.buildRows(data.getGroups(), colMerge, 0);
        }

        me.columnStylesNormal = me.columnStylesNormalId = me.columnStylesFooter = me.columnStylesFooterId = null;

        return me.excel.render();
    },

    addTitle: function(config, colMerge){
        if(!Ext.isEmpty(config.title)) {
            this.worksheet.addRow({
                height: 22.5
            }).addCell({
                mergeAcross: colMerge - 1,
                value: config.title,
                styleId: this.excel.addCellStyle(config.titleStyle)
            });
        }
    },

    buildRows: function (groups, colMerge, level) {
        var me = this,
            showSummary = me.getShowSummary(),
            g, row, styleH, styleF, cells,
            i, j, k, gLen, sLen, cLen, oneLine;

        if (!groups) {
            return;
        }

        styleH = me.excel.addCellStyle(Ext.applyIf({
            alignment: {
                Indent: level > 0 ? level : 0
            }
        }, me.getGroupHeaderStyle()));

        styleF = me.excel.addCellStyle(Ext.applyIf({
            alignment: {
                Indent: level > 0 ? level : 0
            }
        }, me.columnStylesFooter[0]));

        gLen = groups.length;
        for (i = 0; i < gLen; i++) {
            g = groups.getAt(i).getConfig();

            // if the group has no subgroups and no rows then show only summaries
            oneLine = (!g.groups && !g.rows);

            if(showSummary !== false && !Ext.isEmpty(g.text) && !oneLine){
                me.worksheet.addRow({
                    styleId: styleH
                }).addCell({
                    mergeAcross: colMerge - 1,
                    value: g.text,
                    styleId: styleH
                });
            }

            me.buildRows(g.groups, colMerge, level + 1);
            me.buildGroupRows(g.rows);

            if( g.summaries && (showSummary || oneLine) ){
                sLen = g.summaries.length;
                for(k = 0; k < sLen; k++){
                    // that's the summary footer
                    row = me.worksheet.addRow();
                    cells = g.summaries.getAt(k).getCells();
                    cLen = cells.length;
                    for (j = 0; j < cLen; j++) {
                        row.addCell(cells.getAt(j).getConfig()).setStyleId( oneLine ? me.columnStylesNormalId[j] : (j === 0 ? styleF : me.columnStylesFooterId[j]) );
                    }
                }
            }

        }
    },

    buildGroupRows: function(rows){
        var row, cells, i, j, rLen, cLen, cell;

        if (!rows) {
            return;
        }

        rLen = rows.length;
        for (i = 0; i < rLen; i++) {
            row = this.worksheet.addRow();
            cells = rows.getAt(i).getCells();
            cLen = cells.length;
            for (j = 0; j < cLen; j++) {
                cell = cells.getAt(j).getConfig();
                // for some reason is not enough to style a column
                // and we need to style cells of that column too
                cell.styleId = this.columnStylesNormalId[j];
                row.addCell(cell);
            }
        }
    },

    buildHeader: function () {
        var me = this,
            ret = {},
            data = me.getData(),
            keys, row, i, j, len, lenCells, style, arr, fStyle, col, colCfg;

        me.buildHeaderRows(data.getColumns(), ret);

        keys = Ext.Object.getKeys(ret);
        len = keys.length;

        for(i = 0; i < len; i++){
            row = me.worksheet.addRow({
                height: 20.25,
                autoFitHeight: 1,
                styleId: me.tableHeaderStyleId
            });

            arr = ret[keys[i]];
            lenCells = arr.length;

            for(j = 0; j < lenCells; j++){
                row.addCell(arr[j]).setStyleId(me.tableHeaderStyleId);
            }

        }

        arr = data.getBottomColumns();
        lenCells = arr.length;
        me.columnStylesNormal = [];
        me.columnStylesNormalId = [];
        me.columnStylesFooter = [];
        me.columnStylesFooterId = [];
        fStyle = me.getGroupFooterStyle();

        for(j = 0; j < lenCells; j++){
            col = arr[j];
            colCfg = {
                style: col.getStyle(),
                width: col.getWidth()
            };


            style = Ext.applyIf({parentId: 0}, fStyle);
            style = Ext.merge(style, colCfg.style);
            me.columnStylesFooter.push(style);
            me.columnStylesFooterId.push(me.excel.addCellStyle(style));

            style = Ext.applyIf({parentId: 0}, colCfg.style);
            me.columnStylesNormal.push(style);
            colCfg.styleId = me.excel.addCellStyle(style);
            me.columnStylesNormalId.push(colCfg.styleId);

            colCfg.min = colCfg.max = j + 1;
            colCfg.style = null;
            if(colCfg.width){
                colCfg.width = colCfg.width / 10;
            }

            me.worksheet.addColumn(colCfg);
        }
    },

    buildHeaderRows: function (columns, result) {
        var col, cols, i, len, name;

        if (!columns) {
            return;
        }

        len = columns.length;
        for (i = 0; i < len; i++) {
            col = columns.getAt(i).getConfig();
            col.value = col.text;
            cols = col.columns;
            delete(col.columns);
            delete(col.table);

            name = 's' + col.level;
            result[name] = result[name] || [];
            result[name].push(col);

            this.buildHeaderRows(cols, result);
        }
    }


});