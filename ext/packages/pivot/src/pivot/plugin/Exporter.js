/**
 * This plugin allows pivot grid data export using various exporters. Each exporter should extend
 * the {@link Ext.exporter.Base Base} class.
 *
 * Two new methods are created on the pivot grid by this plugin:
 *
 *  - saveDocumentAs(config): saves the document
 *  - getDocumentData(config): returns the document content
 *
 * Example usage:
 *
 *
 *      {
 *          xtype: 'pivotgrid',
 *          plugins: [{
 *              ptype: 'pivotexporter'
 *          }]
 *      }
 *
 *      pivot.saveDocumentAs({
 *          type: 'xlsx',
 *          title: 'My export',
 *          fileName: 'myExport.xlsx'
 *      });
 *
 *
 * When the exported data needs to be formatted then the {@link Ext.pivot.dimension.Item#exportStyle exportStyle}
 * can be used on either left axis or aggregate dimensions.
 *
 *      {
 *          xtype: 'pivotgrid',
 *
 *          aggregate: [{
 *              dataIndex:  'value',
 *              header:     'Total',
 *              aggregator: 'sum',
 *              exportStyle: {
 *                  format: 'Currency',
 *                  alignment: {
 *                      horizontal: 'Right'
 *                  }
 *              }
 *          }],
 *
 *          leftAxis: [{
 *              dataIndex:  'date',
 *              header:     'Transaction date',
 *              exportStyle: {
 *                  format: 'Short Date',
 *                  alignment: {
 *                      horizontal: 'Right'
 *                  }
 *              }
 *          },{
 *              dataIndex:  'company',
 *              header:     'Company',
 *              sortable:   false
 *          }]
 *          // ...
 *      }
 *
 */
Ext.define('Ext.pivot.plugin.Exporter', {
    alternateClassName: [
        'Mz.pivot.plugin.ExcelExport'
    ],

    alias: [
        'plugin.pivotexporter',
        'plugin.mzexcelexport'
    ],

    extend: 'Ext.exporter.Plugin',

    /**
     * @event beforedocumentsave
     * Fires on the pivot grid before a document is exported and saved.
     * @param {Ext.pivot.Grid} pivotGrid Reference to the pivot grid
     */
    /**
     * @event documentsave
     * Fires on the pivot grid whenever a document is exported and saved.
     * @param {Ext.pivot.Grid} pivotGrid Reference to the pivot grid
     */
    /**
     * @event dataready
     * Fires on the pivot grid when the {Ext.exporter.data.Table data object} is ready.
     * You could adjust styles or data before the document is generated and saved.
     * @param {Ext.pivot.Grid} pivotGrid Reference to the pivot grid
     */

    /**
     *  `"both"` (the default) - The plugin is added to both grids
     *  `"top"` - The plugin is added to the containing Panel
     *  `"locked"` - The plugin is added to the locked (left) grid
     *  `"normal"` - The plugin is added to the normal (right) grid
     *
     * @private
     */
    lockableScope:  'top',

    init: function (cmp) {
        var me = this;

        //<debug>
        // this plugin is available only for the pivot grid
        if (!cmp.isPivotGrid) {
            Ext.raise('This plugin is only compatible with Ext.pivot.Grid');
        }
        //</debug>

        return me.callParent([cmp]);
    },

    /**
     * @inheritdoc
     */
    prepareData: function(config){
        var me = this,
            table = new Ext.exporter.data.Table(),
            matrix, group, columns, headers, total, i, j, dLen, tLen, dataIndexes, row;

        me.matrix = matrix = me.cmp.getMatrix();
        me.onlyExpandedNodes = (config && config.onlyExpandedNodes);

        if(!me.onlyExpandedNodes){
            me.setColumnsExpanded(matrix.topAxis.getTree(), true);
        }

        columns = Ext.clone(matrix.getColumnHeaders());
        headers = me.getColumnHeaders(columns, config);
        dataIndexes = me.getDataIndexColumns(columns);

        if(!me.onlyExpandedNodes){
            me.setColumnsExpanded(matrix.topAxis.getTree());
        }

        group = table.addGroup({
            text: ''
        });
        me.extractGroups(group, matrix.leftAxis.getTree(), dataIndexes);

        tLen = matrix.totals.length;
        dLen = dataIndexes.length;

        for(i = 0; i < tLen; i++){
            total = matrix.totals[i];

            row = group.addSummary();
            row.addCell({
                value: total.title
            });

            for(j = 1; j < dLen; j++){
                row.addCell({
                    value: me.getRecordValue(total.record, dataIndexes[j])
                });
            }
        }

        me.matrix = me.onlyExpandedNodes = null;

        table.addGroup(group);
        table.setColumns(headers);

        return table;
    },

    /**
     * If we have to export everything then expand all top axis tree nodes temporarily
     *
     * @param items
     * @param expanded
     *
     * @private
     */
    setColumnsExpanded: function(items, expanded){
        for(var i = 0; i < items.length; i++){
            if(Ext.isDefined(expanded)){
                items[i].backupExpanded = items[i].expanded;
                items[i].expanded = expanded;
            }else{
                items[i].expanded = items[i].backupExpanded;
                items[i].backupExpanded = null;
            }

            if(items[i].children){
                this.setColumnsExpanded(items[i].children, expanded);
            }
        }
    },

    /**
     * Returns an array of column headers to be used in the export file
     *
     * @param {Array} columns
     * @param {Object} config
     *
     * @return {Array}
     *
     * @private
     */
    getColumnHeaders: function(columns, config){
        var cols = [],
            length = columns.length,
            i, obj, col, doExtract;

        for(i = 0; i < length; i++){
            col = columns[i];

            doExtract = this.onlyExpandedNodes ? ( !col.group || col.group.expanded || (!col.group.expanded && col.subTotal) ) : true;

            if(doExtract){
                obj = {
                    text: (col.subTotal && col.group.expanded ? col.group.getTextTotal() : col.text)
                };

                if(col.columns){
                    obj.columns = this.getColumnHeaders(col.columns, config);
                }else{
                    obj.width = col.dimension ? col.dimension.getWidth() : col.width || 100;
                    obj.style = col.dimension ? this.getExportStyle(col.dimension.getExportStyle(), config) : null;
                }
                cols.push(obj);
            }
        }

        return cols;
    },

    getRecordValue: function(record, obj){
        var data = record.data;

        return (Ext.isEmpty(data[obj.dataIndex]) || (this.matrix.showZeroAsBlank && data[obj.dataIndex] === 0) ) ? '' : data[obj.dataIndex];
    },

    /**
     * Find all columns that have a dataIndex
     *
     * @param columns
     *
     * @returns {Array}
     *
     * @private
     */
    getDataIndexColumns: function(columns){
        var cols = [], i, col, doExtract;

        for(i = 0; i < columns.length; i++){
            col = columns[i];
            doExtract = this.onlyExpandedNodes ? ( !col.group || col.group.expanded || (!col.group.expanded && col.subTotal) ) : true;

            if(doExtract) {

                if (col.dataIndex) {
                    cols.push({
                        dataIndex: col.dataIndex,
                        agg: col.dimension ? col.dimension.getId() : null
                    });
                } else if (col.columns) {
                    cols = Ext.Array.merge(cols, this.getDataIndexColumns(col.columns));
                }
            }
        }

        return cols;
    },

    /**
     * Extract data from left axis groups.
     *
     * @param group
     * @param items
     * @param columns
     *
     * @returns {Object}
     *
     * @private
     */
    extractGroups: function(group, items, columns){
        var i, j, iLen, cLen, doExtract, item, row, subGroup, record;

        iLen = items.length;
        for(i = 0; i < iLen; i++){
            item = items[i];

            if(item.record){
                row = group.addRow();
                for(j = 0; j < columns.length; j++){
                    row.addCell({
                        value: this.getRecordValue(item.record, columns[j])
                    });
                }
            }else if(item.children){
                subGroup = group.addGroup({
                    text: item.name
                });
                doExtract = this.onlyExpandedNodes ? item.expanded : true;

                if(doExtract) {
                    this.extractGroups(subGroup, item.children, columns);
                }

                row = subGroup.addSummary();
                row.addCell({
                    value: (doExtract ? item.getTextTotal() : item.value)
                });

                record = (item.expanded ? item.records.expanded : item.records.collapsed);
                cLen = columns.length;
                for(j = 1; j < cLen; j++){
                    row.addCell({
                        value: this.getRecordValue(record, columns[j])
                    });
                }

                group.addGroup(subGroup);
            }
        }

        return group;
    }


});