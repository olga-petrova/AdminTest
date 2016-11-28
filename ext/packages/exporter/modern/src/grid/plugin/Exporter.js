/**
 * This plugin allows grid data export using various exporters. Each exporter should extend
 * the {@link Ext.exporter.Base Base} class.
 *
 * Two new methods are created on the grid panel by this plugin:
 *
 *  - saveDocumentAs(config): saves the document
 *  - getDocumentData(config): returns the document content
 *
 * The grid data is exported for all grid columns that have the flag
 * {@link Ext.grid.column.Column#ignoreExport ignoreExport} as false.
 *
 * A grid column may have an {Ext.exporter.file.Style exportStyle} defined which is used during
 * data export. If no `exportStyle` is defined for a column then column formatter is used if
 * defined.
 *
 * Example usage:
 *
 *      {
 *          xtype: 'grid',
 *          plugins: [{
 *              ptype: 'gridexporter'
 *          }],
 *          columns: [{
 *              dataIndex: 'value',
 *              text: 'Total',
 *              exportStyle: {
 *                  format: 'Currency',
 *                  alignment: {
 *                      horizontal: 'Right'
 *                  }
 *              }
 *          }]
 *      }
 *
 *      grid.saveDocumentAs({
 *          type: 'xlsx',
 *          title: 'My export',
 *          fileName: 'myExport.xlsx'
 *      });
 *
 */
Ext.define('Ext.grid.plugin.Exporter', {
    alias: [
        'plugin.gridexporter'
    ],

    extend: 'Ext.exporter.Plugin',

    /**
     * @event beforedocumentsave
     * Fires on the grid panel before a document is exported and saved.
     * @param {Ext.grid.Panel} grid Reference to the grid panel
     */
    /**
     * @event documentsave
     * Fires on the grid panel whenever a document is exported and saved.
     * @param {Ext.grid.Panel} grid Reference to the grid panel
     */
    /**
     * @event dataready
     * Fires on the grid panel when the {Ext.exporter.data.Table data object} is ready.
     * You could adjust styles or data before the document is generated and saved.
     * @param {Ext.grid.Panel} grid Reference to the grid panel
     */

    /**
     * Save the export file. This method is added to the grid panel as "saveDocumentAs".
     *
     * Pass in exporter specific configs to the config parameter.
     *
     * @method saveDocumentAs
     * @param {Ext.exporter.Base} config Config object used to initialize the proper exporter
     * @param {String} config.type Type of the exporter as defined in the exporter alias. Default is `excel`.
     * @param {String} [config.title] Title added to the export document
     * @param {String} [config.author] Who exported the document?
     * @param {String} [config.fileName] Name of the exported file, including the extension
     * @param {String} [config.charset] Exported file's charset
     *
     */

    /**
     * Fetch the export data. This method is added to the grid panel as "getDocumentData".
     *
     * Pass in exporter specific configs to the config parameter.
     *
     * @method getDocumentData
     * @param {Ext.exporter.Base} config Config object used to initialize the proper exporter
     * @param {String} [config.type] Type of the exporter as defined in the exporter alias. Default is `excel`.
     * @param {String} [config.title] Title added to the export document
     * @param {String} [config.author] Who exported the document?
     * @return {String}
     *
     */

    /**
     * @inheritdoc
     */
    prepareData: function(config){
        var me = this,
            grid = me.cmp,
            table = new Ext.exporter.data.Table(),
            headers, group;

        group = table.addGroup({
            text: ''
        });

        me.extractGroups(group, grid.getColumns());

        headers = me.getColumnHeaders(grid.getHeaderContainer().innerItems, config);

        table.addGroup(group);
        table.setColumns(headers);

        return table;
    },

    /**
     * Fetch all columns that will be exported
     * @param {Array} columns
     * @param {Object} config
     * @return {Array}
     *
     * @private
     */
    getColumnHeaders: function(columns, config){
        var cols = [],
            i, obj, col;

        for(i = 0; i < columns.length; i++){
            col = columns[i];

            obj = {
                text: col.getText(),
                width: col.getWidth()
            };

            if(col.isHeaderGroup){
                obj.columns = this.getColumnHeaders(col.innerItems, config);
                if(obj.columns.length === 0){
                    // all children columns are ignored for export so there's no need to export this grouped header
                    obj = null;
                }
            }else if(!col.getIgnoreExport()){
                obj.style = this.getExportStyle(col.getExportStyle(), config);
                obj.width = obj.width || col.getComputedWidth();
            }else{
                obj = null;
            }

            if(obj) {
                cols.push(obj);
            }
        }

        return cols;
    },

    /**
     * Generate the data that the exporter can consume
     *
     * @param group
     * @param columns
     * @return {Ext.exporter.data.Group}
     *
     * @private
     */
    extractGroups: function(group, columns){
        var store = this.cmp.getStore(),
            len = store.getCount(),
            lenCols = columns.length,
            i, j, record, row, col;

        // we could also export grouped stores
        for(i = 0; i < len; i++){
            record = store.getAt(i);
            row = group.addRow();

            for(j = 0; j < lenCols; j++){
                col = columns[j];
                // each column has a config 'ignoreExport' that can tell us to ignore the column on export
                if(!col.getIgnoreExport()) {
                    row.addCell({
                        value: record.get(col.getDataIndex())
                    });
                }
            }
        }

        return group;
    }

});
