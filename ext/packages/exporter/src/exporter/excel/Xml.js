/**
 * This exporter produces Microsoft Excel 2003 XML files for the supplied data. It was implemented according to
 * [this][1] documentation.
 *
 * [1]: https://msdn.microsoft.com/en-us/Library/aa140066(v=office.10).aspx
 */
Ext.define('Ext.exporter.excel.Xml', {
    extend: 'Ext.exporter.Base',

    alias:  'exporter.excel03',

    requires: [
        'Ext.exporter.file.excel.Workbook'
    ],

    config: {
        /**
         * @cfg {Number} windowHeight
         *
         * Excel window height
         */
        windowHeight: 9000,

        /**
         * @cfg {Number} windowWidth
         *
         * Excel window width
         */
        windowWidth: 50000,

        /**
         * @cfg {Boolean} protectStructure
         *
         * Protect structure
         */
        protectStructure: false,

        /**
         * @cfg {Boolean} protectWindows
         *
         * Protect windows
         */
        protectWindows: false,

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
                fontName: 'Calibri',
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
            name: 'Title',
            parentId: 'Default',
            alignment: {
                horizontal: 'Center',
                vertical: 'Center'
            },
            font: {
                fontName: 'Cambria',
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
            name: 'Group Header',
            parentId: 'Default',
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
            name: 'Heading 1',
            parentId: 'Default',
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
                fontName: 'Calibri',
                family: 'Swiss',
                size: 11,
                color: '#1F497D'
            }
        }
    },

    fileName: 'export.xml',

    destroy: function(){
        var me = this;

        me.workbook = me.table = me.columnStylesFooter = me.columnStylesNormal = Ext.destroy(me.workbook);

        return me.callParent(arguments);
    },

    applyDefaultStyle: function(newValue){
        // the default style should always have the id Default and name Normal
        return Ext.applyIf({
            id: 'Default',
            name: 'Normal'
        }, newValue || {});
    },

    getContent: function(){
        var me = this,
            config = this.getConfig(),
            data = config.data,
            colMerge;

        me.workbook = new Ext.exporter.file.excel.Workbook({
            title:              config.title,
            author:             config.author,
            windowHeight:       config.windowHeight,
            windowWidth:        config.windowWidth,
            protectStructure:   config.protectStructure,
            protectWindows:     config.protectWindows
        });
        me.table = me.workbook.addWorksheet({
            name: config.title
        }).addTable();

        me.workbook.addStyle(config.defaultStyle);
        me.tableHeaderStyleId = me.workbook.addStyle(config.tableHeaderStyle).getId();
        me.groupHeaderStyleId = me.workbook.addStyle(config.groupHeaderStyle).getId();

        colMerge = data ? data.getColumnCount() : 1;

        me.addTitle(config, colMerge);

        if(data) {
            me.buildHeader();
            me.buildRows(data.getGroups(), colMerge, 0);
        }

        return me.workbook.render();
    },

    addTitle: function(config, colMerge){
        if(!Ext.isEmpty(config.title)) {
            this.table.addRow({
                autoFitHeight: 1,
                height: 22.5,
                styleId: this.workbook.addStyle(config.titleStyle).getId()
            }).addCell({
                mergeAcross: colMerge - 1,
                value: config.title
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

        styleH = me.workbook.addStyle({
            parentId: me.groupHeaderStyleId,
            alignment: {
                Indent: level > 0 ? level - 1 : 0
            }
        }).getId();

        styleF = me.workbook.addStyle({
            parentId: me.columnStylesFooter[0],
            alignment: {
                Indent: level > 0 ? level - 1 : 0
            }
        }).getId();

        gLen = groups.length;
        for (i = 0; i < gLen; i++) {
            g = groups.getAt(i).getConfig();

            // if the group has no subgroups and no rows then show only summaries
            oneLine = (!g.groups && !g.rows);


            if(showSummary !== false && !Ext.isEmpty(g.text) && !oneLine){
                me.table.addRow().addCell({
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
                    row = me.table.addRow();
                    cells = g.summaries.getAt(k).getCells();
                    cLen = cells.length;
                    for (j = 0; j < cLen; j++) {
                        row.addCell(cells.getAt(j).getConfig()).setStyleId( oneLine ? me.columnStylesNormal[j] : (j === 0 ? styleF : me.columnStylesFooter[j]) );
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
            row = this.table.addRow();
            cells = rows.getAt(i).getCells();
            cLen = cells.length;
            for (j = 0; j < cLen; j++) {
                cell = cells.getAt(j).getConfig();
                cell.styleId = this.columnStylesNormal[j];
                row.addCell(cell);
            }
        }
    },

    buildHeader: function () {
        var me = this,
            ret = {},
            data = me.getData(),
            keys, row, i, j, len, lenCells, style, arr, fStyle;

        me.buildHeaderRows(data.getColumns(), ret);

        keys = Ext.Object.getKeys(ret);
        len = keys.length;

        for(i = 0; i < len; i++){
            row = me.table.addRow({
                height: 20.25,
                autoFitHeight: 1
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
        me.columnStylesFooter = [];
        fStyle = me.getGroupFooterStyle();

        for(j = 0; j < lenCells; j++){
            style = Ext.applyIf({parentId: 'Default'}, fStyle);
            style = Ext.merge(style, arr[j].getStyle());
            style.id = null;
            me.columnStylesFooter.push(me.workbook.addStyle(style).getId());

            style = Ext.merge({parentId: 'Default'}, arr[j].getStyle());
            me.columnStylesNormal.push(me.workbook.addStyle(style).getId());
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
