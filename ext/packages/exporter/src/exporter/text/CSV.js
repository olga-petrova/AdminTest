/**
 * This exporter produces CSV (comma separated values) files for the supplied data.
 */
Ext.define('Ext.exporter.text.CSV', {
    extend: 'Ext.exporter.Base',

    alias: 'exporter.csv',

    requires: [
        'Ext.util.CSV'
    ],

    fileName: 'export.csv',

    getHelper: function(){
        return Ext.util.CSV;
    },

    getContent: function(){
        var me = this,
            result = [],
            data = me.getData();

        if(data) {
            me.buildHeader(result);
            me.buildRows(data.getGroups(), result, data.getColumnCount());
            me.columnStyles = Ext.destroy(me.columnStyles);
        }

        return me.getHelper().encode(result);
    },

    buildHeader: function(result){
        var me = this,
            ret = {},
            data = me.getData(),
            arr, lenCells, i, style;

        me.buildHeaderRows(data.getColumns(), ret);
        result.push.apply(result, Ext.Object.getValues(ret));

        arr = data.getBottomColumns();
        lenCells = arr.length;
        me.columnStyles = [];

        for(i = 0; i < lenCells; i++){
            style = arr[i].getStyle() || {};
            if(!style.id){
                style.id = 'c' + i;
            }
            style.name = '.' + style.id;
            me.columnStyles.push(new Ext.exporter.file.Style(style));
        }
    },

    buildHeaderRows: function (columns, result) {
        var col, i, len, name, mAcross, mDown, j, level;

        if (!columns) {
            return;
        }

        len = columns.length;
        for (i = 0; i < len; i++) {
            col = columns.getAt(i);
            mAcross = col.getMergeAcross();
            mDown = col.getMergeDown();
            level = col.getLevel();

            name = 's' + level;
            result[name] = result[name] || [];
            result[name].push(col.getText());

            for(j = 1; j <= mAcross; j++){
                result[name].push('');
            }
            for(j = 1; j <= mDown; j++){
                name = 's' + (level + j);
                result[name] = result[name] || [];
                result[name].push('');
            }

            this.buildHeaderRows(col.getColumns(), result);
        }
    },

    buildRows: function(groups, result, length){
        var showSummary = this.getShowSummary(),
            g, i, row, gLen, j, rLen, k, cLen, r, cells, oneLine, cell, style;

        if(!groups){
            return;
        }

        gLen = groups.length;
        for(i = 0; i < gLen; i++){
            g = groups.getAt(i).getConfig();

            // if the group has no subgroups and no rows then show only summaries
            oneLine = (!g.groups && !g.rows);

            if(!Ext.isEmpty(g.text) && !oneLine) {
                row = [];
                row.length = length;
                row[g.level || 0] = g.text;
                result.push(row);
            }

            this.buildRows(g.groups, result, length);

            if(g.rows) {
                rLen = g.rows.length;
                for(j = 0; j < rLen; j++){
                    row = [];
                    r = g.rows.getAt(j);
                    cells = r.getCells();
                    cLen = cells.length;
                    for(k = 0; k < cLen; k++){
                        cell = cells.getAt(k).getConfig();
                        style = this.columnStyles[k];
                        cell = style ? style.getFormattedValue(cell.value) : cell.value;
                        row.push(cell);
                    }
                    result.push(row);
                }
            }

            if( g.summaries && (showSummary || oneLine) ){
                rLen = g.summaries.length;

                for(j = 0; j < rLen; j++){
                    row = [];
                    r = g.summaries.getAt(j);
                    cells = r.getCells();
                    cLen = cells.length;
                    for(k = 0; k < cLen; k++){
                        cell = cells.getAt(k).getConfig();
                        style = this.columnStyles[k];
                        cell = style ? style.getFormattedValue(cell.value) : cell.value;
                        row.push(cell);
                    }
                    result.push(row);
                }
            }

        }
    }

});