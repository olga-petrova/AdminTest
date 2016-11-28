Ext.define('Ext.overrides.exporter.util.Format', {
    override: 'Ext.util.Format',
    /**
     * Transform an integer into a string in hexadecimal.
     *
     * @param {Number} dec The number to convert.
     * @param {Number} bytes The number of bytes to generate.
     * @return {String} The result.
     */
    decToHex: function(dec, bytes) {
        var hex = '',
            i;
        // this method uses code from https://github.com/Stuk/jszip
        for (i = 0; i < bytes; i++) {
            hex += String.fromCharCode(dec & 255);
            dec = dec >>> 8;
        }
        return hex;
    }
});

/**
 * Base class for data object.
 */
Ext.define('Ext.exporter.data.Base', {
    requires: [
        'Ext.util.Collection'
    ],
    config: {
        /**
         * @cfg {String} idPrefix
         *
         * Prefix to use when generating the id.
         *
         * @private
         */
        idPrefix: 'id',
        /**
         * @cfg {String} id
         *
         * Unique id for this object. Auto generated when missing.
         */
        id: null
    },
    // keep references to internal collections to easily destroy them
    internalCols: null,
    constructor: function(config) {
        var me = this;
        me.internalCols = [];
        me.initConfig(config);
        if (!me.getId()) {
            me.setId('');
        }
        return me.callParent([
            config
        ]);
    },
    destroy: function() {
        var cols = this.internalCols,
            len = cols.length,
            i, col;
        for (i = 0; i < len; i++) {
            col = cols[i];
            Ext.destroy(col.items, col);
        }
        cols.length = 0;
        this.internalCols = null;
        this.callParent();
    },
    applyId: function(data, id) {
        if (Ext.isEmpty(id)) {
            id = Ext.id(null, this.getIdPrefix());
        }
        if (!Ext.isEmpty(data)) {
            id = data;
        }
        return id;
    },
    /**
     * This method could be used in config appliers that need to initialize a
     * Collection that has items of type className.
     *
     * @param data
     * @param dataCollection
     * @param className
     * @return {Ext.util.Collection}
     */
    checkCollection: function(data, dataCollection, className) {
        if (data && !dataCollection) {
            dataCollection = this.constructCollection(className);
        }
        if (data) {
            dataCollection.add(data);
        }
        return dataCollection;
    },
    /**
     * Create a new Collection with a decoder for the specified className.
     *
     * @param className
     * @returns {Ext.util.Collection}
     *
     * @private
     */
    constructCollection: function(className) {
        var col = new Ext.util.Collection({
                decoder: this.getCollectionDecoder(className),
                keyFn: this.getCollectionItemKey
            });
        this.internalCols.push(col);
        return col;
    },
    /**
     * Builds a Collection decoder for the specified className.
     *
     * @param className
     * @returns {Function}
     *
     * @private
     */
    getCollectionDecoder: function(className) {
        return function(config) {
            return (config && config.isInstance) ? config : Ext.create(className, config || {});
        };
    },
    /**
     * Returns a collection item key
     *
     * @param item
     * @return {String}
     *
     * @private
     */
    getCollectionItemKey: function(item) {
        return item.getKey ? item.getKey() : item.getId();
    }
});

/**
 * This class implements a table column definition
 */
Ext.define('Ext.exporter.data.Column', {
    extend: 'Ext.exporter.data.Base',
    config: {
        /**
         * @cfg {Ext.exporter.data.Table} table
         *
         * Reference to the parent table object
         *
         * @private
         */
        table: null,
        /**
         * @cfg {String} text
         *
         * Column's text header
         *
         */
        text: null,
        /**
         * @cfg {Ext.exporter.file.Style} style
         *
         * Column's style. Use this to add special formatting to the exported document.
         *
         */
        style: null,
        /**
         * @cfg {Number} width
         *
         * Column's width
         *
         */
        width: null,
        /**
         * @cfg {Number} mergeAcross
         *
         * Specifies how many cells need to be merged from the current position to the right
         *
         * @readOnly
         */
        mergeAcross: null,
        /**
         * @cfg {Number} mergeDown
         *
         * Specifies how many cells need to be merged from the current position to the bottom
         *
         * @readOnly
         */
        mergeDown: null,
        /**
         * @cfg {Number} level
         *
         * Column's level
         *
         * @readOnly
         */
        level: 0,
        /**
         * @cfg {Number} index
         *
         * Column's index
         *
         * @readOnly
         */
        index: null,
        /**
         * @cfg {Ext.exporter.data.Column[]} columns
         *
         * Collection of children columns
         *
         */
        columns: null
    },
    destroy: function() {
        this.setTable(null);
        this.callParent();
        this.setColumns(null);
    },
    updateTable: function(table) {
        var cols = this.getColumns(),
            i, length;
        if (cols) {
            length = cols.length;
            for (i = 0; i < length; i++) {
                cols.getAt(i).setTable(table);
            }
        }
    },
    applyColumns: function(data, dataCollection) {
        return this.checkCollection(data, dataCollection, 'Ext.exporter.data.Column');
    },
    updateColumns: function(collection, oldCollection) {
        var me = this;
        if (oldCollection) {
            oldCollection.un({
                add: me.onColumnAdd,
                remove: me.onColumnRemove,
                scope: me
            });
            Ext.destroy(oldCollection.items, oldCollection);
        }
        if (collection) {
            collection.on({
                add: me.onColumnAdd,
                remove: me.onColumnRemove,
                scope: me
            });
            me.onColumnAdd(collection, {
                items: collection.getRange()
            });
        }
    },
    sync: function(depth) {
        var me = this,
            count = me.getColumnCount() - 1,
            cols = me.getColumns(),
            i, length, down;
        if (cols) {
            length = cols.length;
            for (i = 0; i < length; i++) {
                cols.getAt(i).sync(depth);
            }
            me.setMergeDown(null);
        } else {
            down = depth - this.getLevel();
            me.setMergeDown(down > 0 ? down : null);
        }
        me.setMergeAcross(count > 0 ? count : null);
    },
    onColumnAdd: function(collection, details) {
        var items = details.items,
            length = items.length,
            level = this.getLevel(),
            table = this.getTable(),
            i, item;
        for (i = 0; i < length; i++) {
            item = items[i];
            item.setLevel(level + 1);
            item.setTable(table);
        }
        if (table) {
            table.syncColumns();
        }
    },
    onColumnRemove: function(collection, details) {
        var table = this.getTable();
        Ext.destroy(details.items);
        if (table) {
            table.syncColumns();
        }
    },
    getColumnCount: function(columns) {
        var s = 0,
            cols;
        if (!columns) {
            columns = this.getColumns();
            if (!columns) {
                return 1;
            }
        }
        for (var i = 0; i < columns.length; i++) {
            cols = columns.getAt(i).getColumns();
            if (!cols) {
                s += 1;
            } else {
                s += this.getColumnCount(cols);
            }
        }
        return s;
    },
    /**
     * Convenience method to add columns.
     * @param {Object/Array} config
     * @return {Ext.exporter.data.Column/Ext.exporter.data.Column[]}
     */
    addColumn: function(config) {
        if (!this.getColumns()) {
            this.setColumns([]);
        }
        return this.getColumns().add(config || {});
    },
    /**
     * Convenience method to fetch a column by its id.
     * @param id
     * @return {Ext.exporter.data.Column}
     */
    getColumn: function(id) {
        return this.getColumns().get(id);
    }
});

/**
 * This class implements a table cell definition
 */
Ext.define('Ext.exporter.data.Cell', {
    extend: 'Ext.exporter.data.Base',
    config: {
        /**
         * @cfg {Number/String/Date} value
         *
         * Cell's value
         *
         */
        value: null
    }
});

/**
 * This class implements a table row definition.
 */
Ext.define('Ext.exporter.data.Row', {
    extend: 'Ext.exporter.data.Base',
    requires: [
        'Ext.exporter.data.Cell'
    ],
    config: {
        /**
         * @cfg {Ext.exporter.data.Cell[]} cells
         *
         * Row's cells
         */
        cells: null
    },
    destroy: function() {
        this.callParent();
        this.setCells(null);
    },
    applyCells: function(data, dataCollection) {
        return this.checkCollection(data, dataCollection, 'Ext.exporter.data.Cell');
    },
    /**
     * Convenience method to add cells.
     * @param {Object/Array} config
     * @return {Ext.exporter.data.Cell/Ext.exporter.data.Cell[]}
     */
    addCell: function(config) {
        if (!this.getCells()) {
            this.setCells([]);
        }
        return this.getCells().add(config || {});
    },
    /**
     * Convenience method to fetch a cell by its id.
     * @param id
     * @return {Ext.exporter.data.Cell}
     */
    getCell: function(id) {
        if (!this.getCells()) {
            return null;
        }
        return this.getCells().get(id);
    }
});

/**
 * This class implements a table group definition.
 */
Ext.define('Ext.exporter.data.Group', {
    extend: 'Ext.exporter.data.Base',
    requires: [
        'Ext.exporter.data.Row'
    ],
    config: {
        /**
         * @cfg {String} text
         *
         * Group's header
         *
         */
        text: null,
        /**
         * @cfg {Ext.exporter.data.Row[]} rows
         *
         * Group's rows
         *
         */
        rows: null,
        /**
         * @cfg {Ext.exporter.data.Row[]} summaries
         *
         * Group's summaries
         *
         */
        summaries: null,
        /**
         * @cfg {Ext.exporter.data.Row} summary
         *
         * Define a single summary row. Kept for compatibility.
         * @private
         */
        summary: null,
        /**
         * @cfg {Ext.exporter.data.Group[]} groups
         *
         * Collection of sub-groups belonging to this group.
         *
         */
        groups: null
    },
    destroy: function() {
        var me = this;
        me.callParent();
        me.setRows(null);
        me.setSummaries(null);
        me.setGroups(null);
    },
    applyRows: function(data, dataCollection) {
        return this.checkCollection(data, dataCollection, 'Ext.exporter.data.Row');
    },
    /**
     * Convenience method to add rows.
     * @param {Object/Array} config
     * @return {Ext.exporter.data.Row/Ext.exporter.data.Row[]}
     */
    addRow: function(config) {
        if (!this.getRows()) {
            this.setRows([]);
        }
        return this.getRows().add(config || {});
    },
    /**
     * Convenience method to fetch a row by its id.
     * @param id
     * @return {Ext.exporter.data.Row}
     */
    getRow: function(id) {
        if (!this.getRows()) {
            return null;
        }
        return this.getRows().get(id);
    },
    applyGroups: function(data, dataCollection) {
        return this.checkCollection(data, dataCollection, 'Ext.exporter.data.Group');
    },
    /**
     * Convenience method to add groups.
     * @param {Object/Array} config
     * @return {Ext.exporter.data.Group/Ext.exporter.data.Group[]}
     */
    addGroup: function(config) {
        if (!this.getGroups()) {
            this.setGroups([]);
        }
        return this.getGroups().add(config || {});
    },
    /**
     * Convenience method to fetch a group by its id.
     * @param id
     * @return {Ext.exporter.data.Group}
     */
    getGroup: function(id) {
        var groups = this.getGroups();
        if (!groups) {
            return null;
        }
        return groups.get(id);
    },
    applySummaries: function(data, dataCollection) {
        return this.checkCollection(data, dataCollection, 'Ext.exporter.data.Row');
    },
    applySummary: function(value) {
        if (value) {
            this.addSummary(value);
        }
        return null;
    },
    /**
     * Convenience method to add summary rows.
     * @param {Object/Array} config
     * @return {Ext.exporter.data.Row/Ext.exporter.data.Row[]}
     */
    addSummary: function(config) {
        if (!this.getSummaries()) {
            this.setSummaries([]);
        }
        return this.getSummaries().add(config || {});
    },
    /**
     * Convenience method to fetch a summary row by its id.
     * @method getSummary
     * @param id Id of the summary row
     * @return {Ext.exporter.data.Row}
     */
    getSummary: function(id) {
        var col = this.getSummaries();
        return col ? col.get(id) : null;
    }
});

/**
 * This class implements the data structure required by an exporter.
 */
Ext.define('Ext.exporter.data.Table', {
    extend: 'Ext.exporter.data.Base',
    requires: [
        'Ext.exporter.data.Column',
        'Ext.exporter.data.Group'
    ],
    isDataTable: true,
    config: {
        /**
         * @cfg {Ext.exporter.data.Column[]} columns
         *
         * Collection of columns that need to be exported.
         *
         */
        columns: null,
        /**
         * @cfg {Ext.exporter.data.Group[]} groups
         *
         * Collection of groups that need to be exported.
         *
         */
        groups: null
    },
    destroy: function() {
        this.callParent();
        this.setColumns(null);
        this.setGroups(null);
    },
    applyColumns: function(data, dataCollection) {
        return this.checkCollection(data, dataCollection, 'Ext.exporter.data.Column');
    },
    updateColumns: function(collection, oldCollection) {
        var me = this;
        if (oldCollection) {
            oldCollection.un({
                add: me.onColumnAdd,
                remove: me.onColumnRemove,
                scope: me
            });
            Ext.destroy(oldCollection.items, oldCollection);
        }
        if (collection) {
            collection.on({
                add: me.onColumnAdd,
                remove: me.onColumnRemove,
                scope: me
            });
            me.onColumnAdd(collection, {
                items: collection.getRange()
            });
            me.syncColumns();
        }
    },
    syncColumns: function() {
        var cols = this.getColumns(),
            depth = this.getColDepth(cols, -1),
            result = {},
            i, j, length, len, keys, arr, prevCol, index;
        if (!cols) {
            return;
        }
        length = cols.length;
        for (i = 0; i < length; i++) {
            cols.getAt(i).sync(depth);
        }
        this.getColumnLevels(cols, depth, result);
        keys = Ext.Object.getKeys(result);
        length = keys.length;
        for (i = 0; i < length; i++) {
            arr = result[keys[i]];
            len = arr.length;
            for (j = 0; j < len; j++) {
                if (j === 0) {
                    index = 1;
                } else if (arr[j - 1]) {
                    prevCol = arr[j - 1].getConfig();
                    index += (prevCol.mergeAcross ? prevCol.mergeAcross + 1 : 1);
                } else {
                    index++;
                }
                if (arr[j]) {
                    arr[j].setIndex(index);
                }
            }
        }
    },
    getLeveledColumns: function() {
        var cols = this.getColumns(),
            depth = this.getColDepth(cols, -1),
            result = {};
        this.getColumnLevels(cols, depth, result, true);
        return result;
    },
    /**
     * Fetch all bottom columns from the `columns` hierarchy.
     *
     * @return {Ext.exporter.data.Column[]}
     */
    getBottomColumns: function() {
        var result = this.getLeveledColumns(),
            keys, len;
        keys = Ext.Object.getKeys(result);
        len = keys.length;
        return len ? result[keys[keys.length - 1]] : [];
    },
    getColumnLevels: function(columns, depth, result, topDown) {
        var col, i, j, len, name, level, cols;
        if (!columns) {
            return;
        }
        len = columns.length;
        for (i = 0; i < len; i++) {
            col = columns.getAt(i);
            level = col.getLevel();
            cols = col.getColumns();
            name = 's' + level;
            result[name] = result[name] || [];
            result[name].push(col);
            if (!cols) {
                for (j = level + 1; j <= depth; j++) {
                    name = 's' + j;
                    result[name] = result[name] || [];
                    result[name].push(topDown ? col : null);
                }
            } else {
                this.getColumnLevels(cols, depth, result, topDown);
            }
        }
    },
    onColumnAdd: function(collection, details) {
        var items = details.items,
            length = items.length,
            i, item;
        for (i = 0; i < length; i++) {
            item = items[i];
            item.setTable(this);
            item.setLevel(0);
        }
        this.syncColumns();
    },
    onColumnRemove: function(collection, details) {
        Ext.destroy(details.items);
        this.syncColumns();
    },
    getColumnCount: function() {
        var cols = this.getColumns(),
            s = 0,
            i, length;
        if (cols) {
            length = cols.length;
            for (i = 0; i < length; i++) {
                s += cols.getAt(i).getColumnCount();
            }
        }
        return s;
    },
    getColDepth: function(columns, level) {
        var m = 0;
        if (!columns) {
            return level;
        }
        for (var i = 0; i < columns.length; i++) {
            m = Math.max(m, this.getColDepth(columns.getAt(i).getColumns(), level + 1));
        }
        return m;
    },
    /**
     * Convenience method to add columns.
     * @param {Object/Array} config
     * @return {Ext.exporter.data.Column/Ext.exporter.data.Column[]}
     */
    addColumn: function(config) {
        if (!this.getColumns()) {
            this.setColumns([]);
        }
        return this.getColumns().add(config || {});
    },
    /**
     * Convenience method to fetch a column by its id.
     * @param id
     * @return {Ext.exporter.data.Column}
     */
    getColumn: function(id) {
        var cols = this.getColumns();
        if (!cols) {
            return null;
        }
        return cols.get(id);
    },
    applyGroups: function(data, dataCollection) {
        return this.checkCollection(data, dataCollection, 'Ext.exporter.data.Group');
    },
    /**
     * Convenience method to add groups.
     * @param {Object/Array} config
     * @return {Ext.exporter.data.Group/Ext.exporter.data.Group[]}
     */
    addGroup: function(config) {
        if (!this.getGroups()) {
            this.setGroups([]);
        }
        return this.getGroups().add(config || {});
    },
    /**
     * Convenience method to fetch a group by its id.
     * @param id
     * @return {Ext.exporter.data.Group}
     */
    getGroup: function(id) {
        var groups = this.getGroups();
        if (!groups) {
            return null;
        }
        return groups.get(id);
    }
});

/**
 * This is the base class for a file object. This one should be extended
 * by classes that generate content based on templates.
 */
Ext.define('Ext.exporter.file.Base', {
    extend: 'Ext.exporter.data.Base',
    requires: [
        'Ext.XTemplate'
    ],
    tpl: null,
    destroy: function() {
        this.tpl = null;
        this.callParent();
    },
    /**
     * Renders the content according to the template provided to the class
     *
     * @returns {String}
     */
    render: function() {
        return this.tpl ? Ext.XTemplate.getTpl(this, 'tpl').apply(this.getRenderData()) : '';
    },
    /**
     * Return the data used when rendering the template
     *
     * @returns {Object}
     */
    getRenderData: function() {
        return this.getConfig();
    }
});

/**
 * This class is a generic implementation of a Style. This should be extended to provide Style implementations
 * for different use cases. Check out {@link Ext.exporter.file.excel.Style} and {@link Ext.exporter.file.html.Style}.
 */
Ext.define('Ext.exporter.file.Style', {
    extend: 'Ext.exporter.file.Base',
    config: {
        /**
         * @cfg {String} id
         * A unique name within the document that identifies this style.
         *
         */
        /**
         * @cfg {String} [name]
         *
         * This property identifies this style as a named style.
         *
         */
        name: null,
        /**
         * @cfg {Object} [alignment]
         *
         * Following keys are allowed on this object and are all optional:
         *
         * @cfg {String} alignment.horizontal
         * Specifies the left-to-right alignment of text within a cell. Possible values: `Left`, `Center`, `Right`,
         * `Justify` and `Automatic`.
         *
         * @cfg {Number} alignment.indent
         * Specifies the number of indents.
         *
         * @cfg {String} alignment.readingOrder
         * Specifies the default right-to-left text entry mode for a cell. Possible values: `LeftToRight`,
         * `RightToLeft` and `Context`.
         *
         * @cfg {Number} alignment.rotate
         * Specifies the rotation of the text within the cell.
         *
         * @cfg {String} alignment.vertical
         * Specifies the top-to-bottom alignment of text within a cell. Possible values: `Top`, `Bottom`,
         * `Center` and `Automatic`.
         *
         */
        alignment: null,
        /**
         * @cfg {Object} [font]
         * Defines the font attributes to use in this style.
         *
         *
         * Following keys are allowed on this object:
         *
         * @cfg {Boolean} font.bold
         * Specifies the bold state of the font.
         *
         * @cfg {String} font.color
         * Specifies the color of the font. This value should be a 6-hexadecimal digit number in "#rrggbb" format.
         *
         * @cfg {String} font.fontName
         * Specifies the name of the font.
         *
         * @cfg {Boolean} font.italic
         * Similar to `font.bold` in behavior, this attribute specifies the italic state of the font.
         *
         * @cfg {Number} font.size
         * Specifies the size of the font.
         *
         * @cfg {Boolean} font.strikeThrough
         * Similar to `font.bold` in behavior, this attribute specifies the strike-through state
         * of the font.
         *
         * @cfg {String} font.underline
         * Specifies the underline state of the font. Possible values: `None` and `Single`.
         *
         * @cfg {String} font.family
         * Font family name.
         *
         */
        font: null,
        /**
         * @cfg {Object} [interior]
         * Defines the fill properties to use in this style. Each attribute that is specified is
         * considered an override from the default.
         *
         * Following keys are allowed on this object:
         *
         * @cfg {String} interior.color
         * Specifies the fill color of the cell. This value should be a 6-hexadecimal digit number in "#rrggbb" format.
         *
         * @cfg {String} interior.pattern
         * Specifies the fill pattern in the cell. Possible values: `None`, `Solid`.
         *
         */
        interior: null,
        /**
         * @cfg {String} [format]
         *
         * This can be one of the following values:
         * `General`, `General Number`, `General Date`, `Long Date`, `Medium Date`, `Short Date`, `Long Time`, `Medium Time`,
         * `Short Time`, `Currency`, `Euro Currency`, `Fixed`, `Standard`, `Percent`, `Scientific`, `Yes/No`,
         * `True/False`, or `On/Off`.
         *
         * `Currency` is the currency format with two decimal places.
         *
         * `Euro Currency` is the same as `Currency` using the Euro currency symbol instead.
         *
         */
        format: null,
        /**
         * @cfg {Object[]} [borders]
         *
         * Array of border objects. Following keys are allowed for border objects:
         *
         * @cfg {String} borders.position
         * Specifies which of the possible borders this element represents. Duplicate
         * borders are not permitted and are considered invalid. Possible values: `Left`, `Top`, `Right`, `Bottom`.
         *
         * @cfg {String} borders.color
         * Specifies the color of this border. This value should be a 6-hexadecimal digit number in "#rrggbb" format.
         *
         * @cfg {String} borders.lineStyle
         * Specifies the appearance of this border. Possible values: `None`, `Continuous`, `Dash` and `Dot`.
         *
         * @cfg {Number} borders.weight
         * Specifies the weight (or thickness) of this border.
         *
         */
        borders: null,
        // used to validate the provided values for Style configs
        checks: {
            alignment: {
                horizontal: [
                    'Automatic',
                    'Left',
                    'Center',
                    'Right',
                    'Justify'
                ],
                readingOrder: [
                    'LeftToRight',
                    'RightToLeft',
                    'Context'
                ],
                vertical: [
                    'Automatic',
                    'Top',
                    'Bottom',
                    'Center'
                ]
            },
            font: {
                bold: [
                    true,
                    false
                ],
                italic: [
                    true,
                    false
                ],
                strikeThrough: [
                    true,
                    false
                ],
                underline: [
                    'None',
                    'Single'
                ]
            },
            border: {
                position: [
                    'Left',
                    'Top',
                    'Right',
                    'Bottom'
                ],
                lineStyle: [
                    'None',
                    'Continuous',
                    'Dash',
                    'Dot'
                ]
            },
            interior: {
                pattern: [
                    'None',
                    'Solid'
                ]
            }
        }
    },
    datePatterns: {
        'General Date': 'Y-m-d H:i:s',
        'Long Date': 'l, F d, Y',
        'Medium Date': 'Y-m-d',
        'Short Date': 'n/j/Y',
        'Long Time': 'g:i:s A',
        'Medium Time': 'H:i:s',
        'Short Time': 'g:i A'
    },
    numberPatterns: {
        'General Number': '0',
        'Fixed': '0.00',
        'Standard': '0.00'
    },
    booleanPatterns: {
        'Yes/No': [
            'Yes',
            'No'
        ],
        'True/False': [
            'True',
            'False'
        ],
        'On/Off': [
            'On',
            'Off'
        ]
    },
    constructor: function(config) {
        this.callParent([
            this.uncapitalizeKeys(config)
        ]);
    },
    /**
     * Parse object keys and uncapitalize them. This is useful to keep compatibility with prior versions.
     *
     * @param config
     * @return {Object}
     *
     * @private
     */
    uncapitalizeKeys: function(config) {
        var ret = config,
            keys, len, i, key, v;
        if (Ext.isObject(config)) {
            ret = {};
            keys = Ext.Object.getAllKeys(config);
            len = keys.length;
            for (i = 0; i < len; i++) {
                key = keys[i];
                ret[Ext.String.uncapitalize(key)] = this.uncapitalizeKeys(config[key]);
            }
        } else if (Ext.isArray(config)) {
            ret = [];
            len = config.length;
            for (i = 0; i < len; i++) {
                ret.push(this.uncapitalizeKeys(config[i]));
            }
        }
        return ret;
    },
    destroy: function() {
        var me = this;
        me.setAlignment(null);
        me.setFont(null);
        me.setInterior(null);
        me.setBorders(null);
        me.setChecks(null);
        me.callParent();
    },
    updateAlignment: function(data) {
        this.checkAttribute(data, 'alignment');
    },
    updateFont: function(data) {
        this.checkAttribute(data, 'font');
    },
    updateInterior: function(data) {
        this.checkAttribute(data, 'interior');
    },
    applyBorders: function(borders, oldBolders) {
        if (!borders) {
            return borders;
        }
        borders = Ext.Array.from(borders);
        if (Ext.Array.unique(Ext.Array.pluck(borders, 'position')).length != borders.length) {
            Ext.raise('Invalid border positions supplied');
        }
        return borders;
    },
    updateBorders: function(data) {
        this.checkAttribute(data, 'border');
    },
    checkAttribute: function(data, checkName) {
        var checks = this.getChecks(),
            values, keys, len, i, j, arr, key, obj, lenV, valid;
        if (!data || !checks || !checks[checkName]) {
            return;
        }
        values = Ext.Array.from(data);
        lenV = values.length;
        for (i = 0; i < lenV; i++) {
            obj = values[i];
            keys = Ext.Object.getKeys(obj || {});
            len = keys.length;
            for (j = 0; j < len; j++) {
                key = keys[j];
                if (arr = checks[checkName][key] && obj[key]) {
                    valid = (Ext.isArray(arr) ? Ext.Array.indexOf(arr, obj[key]) : arr === obj[key]);
                    if (!valid) {
                        delete (obj[key]);
                        Ext.raise(Ext.String.format('Invalid key (%0) or value (%1) provided for Style!', key, obj[key]));
                    }
                }
            }
        }
    },
    /**
     * Returns the specified value formatted according to the format of this style.
     * @param v
     */
    getFormattedValue: function(v) {
        var me = this,
            f = me.getFormat(),
            ret = v,
            fmt = Ext.util.Format;
        if (!f || f === 'General' || Ext.isEmpty(v)) {
            return ret;
        }
        if (f === 'Currency') {
            return fmt.currency(v);
        } else if (f === 'Euro Currency') {
            return fmt.currency(v, '€');
        } else if (f === 'Percent') {
            return fmt.number(v * 100, '0.00') + '%';
        } else if (f === 'Scientific') {
            return Number(v).toExponential();
        } else if (me.datePatterns[f]) {
            return fmt.date(v, me.datePatterns[f]);
        } else if (me.numberPatterns[f]) {
            return fmt.number(v, me.numberPatterns[f]);
        } else if (me.booleanPatterns[f]) {
            return v ? me.booleanPatterns[f][0] : me.booleanPatterns[f][1];
        } else if (Ext.isFunction(f)) {
            return f(v);
        }
        return fmt.number(v, f);
    }
});

/**
 * This class has methods for file manipulation.
 */
Ext.define('Ext.exporter.File', {
    singleton: true,
    /**
     * @property {String} url
     *
     * Default url to use for server file downloading.
     */
    url: null,
    /**
     * @property {Boolean} forceDownload
     *
     * Set to `true` to always download files from the server instead of saving
     * files using browser features.
     */
    forceDownload: false,
    /**
     * Save a binary file locally using either [Blob][1] or server side script.
     *
     * [1]: https://developer.mozilla.org/en/docs/Web/API/Blob
     *
     * Browser compatibility when using [Blob][1]:
     *
     * - Firefox 20+: max blob size 800 MB
     * - Chrome: max blob size 500 MB
     * - Chrome for Android: max blob size 500 MB
     * - Edge: max blob size n/a
     * - IE 10+: max blob size 600 MB
     * - Opera 15+: max blob size 500 MB
     *
     * For all other browsers it falls back to server side script.
     *
     * @param {String} content File content
     * @param {String} filename Name of the file including the extension
     * @param {String} [mimeType='application/octet-stream'] Mime type of the file
     */
    saveBinaryAs: function(content, filename, mimeType) {
        var me = this,
            pt = Ext.platformTags,
            force = me.forceDownload || pt.phone || pt.tablet,
            saveAs = me.downloadBinaryAs;
        if (!force && !Ext.isSafari && me.saveBlobAs) {
            saveAs = me.saveBlobAs;
        }
        // The method saveBlobAs exists only if the browser supports Blob
        saveAs.call(me, content, filename, mimeType);
    },
    /**
     * Save a binary file using a server side script. The file content, file name and mime-type are uploaded
     * to the server side script and a download is forced from the server.
     *
     * This method can be used when the browser doesn't support [Blobs][1].
     *
     * [1]: https://developer.mozilla.org/en/docs/Web/API/Blob
     *
     * @param {String} content File content
     * @param {String} filename Name of the file including the extension
     * @param {String} [mimeType='application/octet-stream'] Mime type of the file
     */
    downloadBinaryAs: function(content, filename, mimeType) {
        var inputs, markup;
        if (!this.url) {
            Ext.raise('Cannot download file since no URL was defined!');
            return;
        }
        inputs = [
            {
                tag: 'input',
                type: 'hidden',
                name: 'content',
                value: Ext.util.Base64.encode(content)
            },
            {
                tag: 'input',
                type: 'hidden',
                name: 'filename',
                value: filename
            },
            {
                tag: 'input',
                type: 'hidden',
                name: 'mime',
                value: mimeType || 'application/octet-stream'
            }
        ];
        markup = Ext.dom.Helper.markup({
            tag: 'html',
            children: [
                {
                    tag: 'head'
                },
                {
                    tag: 'body',
                    children: [
                        {
                            tag: 'form',
                            method: 'POST',
                            action: this.url,
                            children: inputs
                        },
                        {
                            tag: 'script',
                            type: 'text/javascript',
                            children: 'document.getElementsByTagName("form")[0].submit();'
                        }
                    ]
                }
            ]
        });
        window.open('', 'FileDownload_' + Date.now()).document.write(markup);
    }
}, /**
     * Save a text file locally using the content and name provided.
     *
     * Browser	compatibility:
     *
     * - Firefox 20+: max blob size 800 MB
     * - Chrome: max blob size 500 MB
     * - Chrome for Android: max blob size 500 MB
     * - Edge: max blob size n/a
     * - IE 10+: max blob size 600 MB
     * - IE < 10: Files are saved as text/html and max file size n/a
     * - Opera 15+: max blob size 500 MB
     * - Opera < 15: max blob size n/a
     * - Safari 6.1+: max blob size n/a; Blobs may be opened instead of saved sometimes—you may have
     * to direct your Safari users to manually press ⌘+S to save the file after it is opened.
     * Using the application/octet-stream MIME type to force downloads can cause issues in Safari.
     * - Safari < 6: max blob size n/a
     *
     * **Note:** For IE < 10, available file extensions are ".htm/.html/.txt", any other text based file will
     * be appended with ".txt" file extension automatically. For example, "test.csv" will be saved as "test_csv.txt".
     *
     * @method saveAs
     * @param {String} content File content
     * @param {String} filename Name of the file including the extension
     * @param {String} [charset='UTF-8'] File's charset
     */
/**
     * Save a binary file locally using [Blobs][1].
     *
     * Browser compatibility:
     *
     * - Firefox 20+: max blob size 800 MB
     * - Chrome: max blob size 500 MB
     * - Chrome for Android: max blob size 500 MB
     * - Edge: max blob size n/a
     * - IE 10+: max blob size 600 MB
     * - Opera 15+: max blob size 500 MB
     *
     * [1]: https://developer.mozilla.org/en/docs/Web/API/Blob
     *
     * @method saveBlobAs
     * @param {String} content File content
     * @param {String} filename Name of the file including the extension
     * @param {String} [mimeType='application/octet-stream'] Mime type of the file
     * @private
     */
function(File) {
    /* FileSaver.js
     *  A saveAs() & saveTextAs() FileSaver implementation.
     * 1.1.20160328
     *
     *  Modify by Brian Chen
     * By Eli Grey, http://eligrey.com
     * License: MIT
     *   See https://github.com/eligrey/FileSaver.js/blob/master/LICENSE.md
     */
    /*global self */
    /*jslint bitwise: true, indent: 4, laxbreak: true, laxcomma: true, smarttabs: true, plusplus: true */
    /*! @source http://purl.eligrey.com/github/FileSaver.js/blob/master/FileSaver.js */
    var navigator = window.navigator,
        saveAs = window.saveAs || (function(view) {
            "use strict";
            // IE <10 is explicitly unsupported
            if (typeof navigator !== "undefined" && /MSIE [1-9]\./.test(navigator.userAgent)) {
                return;
            }
            var doc = view.document,
                // only get URL when necessary in case Blob.js hasn't overridden it yet
                get_URL = function() {
                    return view.URL || view.webkitURL || view;
                },
                save_link = doc.createElementNS("http://www.w3.org/1999/xhtml", "a"),
                can_use_save_link = "download" in save_link,
                click = function(node) {
                    var event = new MouseEvent("click");
                    node.dispatchEvent(event);
                },
                is_safari = /Version\/[\d\.]+.*Safari/.test(navigator.userAgent),
                webkit_req_fs = view.webkitRequestFileSystem,
                req_fs = view.requestFileSystem || webkit_req_fs || view.mozRequestFileSystem,
                throw_outside = function(ex) {
                    (view.setImmediate || view.setTimeout)(function() {
                        throw ex;
                    }, 0);
                },
                force_saveable_type = "application/octet-stream",
                fs_min_size = 0,
                // the Blob API is fundamentally broken as there is no "downloadfinished" event to subscribe to
                arbitrary_revoke_timeout = 1000 * 40,
                // in ms
                revoke = function(file) {
                    var revoker = function() {
                            if (typeof file === "string") {
                                // file is an object URL
                                get_URL().revokeObjectURL(file);
                            } else {
                                // file is a File
                                file.remove();
                            }
                        };
                    /* // Take note W3C:
                     var
                     uri = typeof file === "string" ? file : file.toURL()
                     , revoker = function(evt) {
                     // idealy DownloadFinishedEvent.data would be the URL requested
                     if (evt.data === uri) {
                     if (typeof file === "string") { // file is an object URL
                     get_URL().revokeObjectURL(file);
                     } else { // file is a File
                     file.remove();
                     }
                     }
                     }
                     ;
                     view.addEventListener("downloadfinished", revoker);
                     */
                    setTimeout(revoker, arbitrary_revoke_timeout);
                },
                dispatch = function(filesaver, event_types, event) {
                    event_types = [].concat(event_types);
                    var i = event_types.length;
                    while (i--) {
                        var listener = filesaver["on" + event_types[i]];
                        if (typeof listener === "function") {
                            try {
                                listener.call(filesaver, event || filesaver);
                            } catch (ex) {
                                throw_outside(ex);
                            }
                        }
                    }
                },
                auto_bom = function(blob) {
                    // prepend BOM for UTF-8 XML and text/* types (including HTML)
                    if (/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
                        return new Blob([
                            "\ufeff",
                            blob
                        ], {
                            type: blob.type
                        });
                    }
                    return blob;
                },
                FileSaver = function(blob, name, no_auto_bom) {
                    if (!no_auto_bom) {
                        blob = auto_bom(blob);
                    }
                    // First try a.download, then web filesystem, then object URLs
                    var filesaver = this,
                        type = blob.type,
                        blob_changed = false,
                        object_url, target_view,
                        dispatch_all = function() {
                            dispatch(filesaver, "writestart progress write writeend".split(" "));
                        },
                        // on any filesys errors revert to saving with object URLs
                        fs_error = function() {
                            if (target_view && is_safari && typeof FileReader !== "undefined") {
                                // Safari doesn't allow downloading of blob urls
                                var reader = new FileReader();
                                reader.onloadend = function() {
                                    var base64Data = reader.result;
                                    target_view.location.href = "data:attachment/file" + base64Data.slice(base64Data.search(/[,;]/));
                                    filesaver.readyState = filesaver.DONE;
                                    dispatch_all();
                                };
                                reader.readAsDataURL(blob);
                                filesaver.readyState = filesaver.INIT;
                                return;
                            }
                            // don't create more object URLs than needed
                            if (blob_changed || !object_url) {
                                object_url = get_URL().createObjectURL(blob);
                            }
                            if (target_view) {
                                target_view.location.href = object_url;
                            } else {
                                var new_tab = view.open(object_url, "_blank");
                                if (new_tab === undefined && is_safari) {
                                    //Apple do not allow window.open, see http://bit.ly/1kZffRI
                                    view.location.href = object_url;
                                }
                            }
                            filesaver.readyState = filesaver.DONE;
                            dispatch_all();
                            revoke(object_url);
                        },
                        abortable = function(func) {
                            return function() {
                                if (filesaver.readyState !== filesaver.DONE) {
                                    return func.apply(this, arguments);
                                }
                            };
                        },
                        create_if_not_found = {
                            create: true,
                            exclusive: false
                        },
                        slice;
                    filesaver.readyState = filesaver.INIT;
                    if (!name) {
                        name = "download";
                    }
                    if (can_use_save_link) {
                        object_url = get_URL().createObjectURL(blob);
                        setTimeout(function() {
                            save_link.href = object_url;
                            save_link.download = name;
                            click(save_link);
                            dispatch_all();
                            revoke(object_url);
                            filesaver.readyState = filesaver.DONE;
                        });
                        return;
                    }
                    // Object and web filesystem URLs have a problem saving in Google Chrome when
                    // viewed in a tab, so I force save with application/octet-stream
                    // http://code.google.com/p/chromium/issues/detail?id=91158
                    // Update: Google errantly closed 91158, I submitted it again:
                    // https://code.google.com/p/chromium/issues/detail?id=389642
                    if (view.chrome && type && type !== force_saveable_type) {
                        slice = blob.slice || blob.webkitSlice;
                        blob = slice.call(blob, 0, blob.size, force_saveable_type);
                        blob_changed = true;
                    }
                    // Since I can't be sure that the guessed media type will trigger a download
                    // in WebKit, I append .download to the filename.
                    // https://bugs.webkit.org/show_bug.cgi?id=65440
                    if (webkit_req_fs && name !== "download") {
                        name += ".download";
                    }
                    if (type === force_saveable_type || webkit_req_fs) {
                        target_view = view;
                    }
                    if (!req_fs) {
                        fs_error();
                        return;
                    }
                    fs_min_size += blob.size;
                    req_fs(view.TEMPORARY, fs_min_size, abortable(function(fs) {
                        fs.root.getDirectory("saved", create_if_not_found, abortable(function(dir) {
                            var save = function() {
                                    dir.getFile(name, create_if_not_found, abortable(function(file) {
                                        file.createWriter(abortable(function(writer) {
                                            writer.onwriteend = function(event) {
                                                target_view.location.href = file.toURL();
                                                filesaver.readyState = filesaver.DONE;
                                                dispatch(filesaver, "writeend", event);
                                                revoke(file);
                                            };
                                            writer.onerror = function() {
                                                var error = writer.error;
                                                if (error.code !== error.ABORT_ERR) {
                                                    fs_error();
                                                }
                                            };
                                            "writestart progress write abort".split(" ").forEach(function(event) {
                                                writer["on" + event] = filesaver["on" + event];
                                            });
                                            writer.write(blob);
                                            filesaver.abort = function() {
                                                writer.abort();
                                                filesaver.readyState = filesaver.DONE;
                                            };
                                            filesaver.readyState = filesaver.WRITING;
                                        }), fs_error);
                                    }), fs_error);
                                };
                            dir.getFile(name, {
                                create: false
                            }, abortable(function(file) {
                                // delete file if it already exists
                                file.remove();
                                save();
                            }), abortable(function(ex) {
                                if (ex.code === ex.NOT_FOUND_ERR) {
                                    save();
                                } else {
                                    fs_error();
                                }
                            }));
                        }), fs_error);
                    }), fs_error);
                },
                FS_proto = FileSaver.prototype,
                saveAs = function(blob, name, no_auto_bom) {
                    return new FileSaver(blob, name, no_auto_bom);
                };
            // IE 10+ (native saveAs)
            if (typeof navigator !== "undefined" && navigator.msSaveOrOpenBlob) {
                return function(blob, name, no_auto_bom) {
                    if (!no_auto_bom) {
                        blob = auto_bom(blob);
                    }
                    return navigator.msSaveOrOpenBlob(blob, name || "download");
                };
            }
            FS_proto.abort = function() {
                var filesaver = this;
                filesaver.readyState = filesaver.DONE;
                dispatch(filesaver, "abort");
            };
            FS_proto.readyState = FS_proto.INIT = 0;
            FS_proto.WRITING = 1;
            FS_proto.DONE = 2;
            FS_proto.error = FS_proto.onwritestart = FS_proto.onprogress = FS_proto.onwrite = FS_proto.onabort = FS_proto.onerror = FS_proto.onwriteend = null;
            return saveAs;
        }(typeof self !== "undefined" && self || typeof window !== "undefined" && window || this.content));
    // `self` is undefined in Firefox for Android content script context
    // while `this` is nsIContentFrameMessageManager
    // with an attribute `content` that corresponds to the window
    if (typeof module !== "undefined" && module.exports) {
        module.exports.saveAs = saveAs;
    } else if ((typeof define !== "undefined" && define !== null) && (define.amd !== null)) {
        define([], function() {
            return saveAs;
        });
    }
    var saveTextAs = window.saveTextAs || (function(textContent, fileName, charset) {
            fileName = fileName || 'download.txt';
            charset = charset || 'utf-8';
            textContent = (textContent || '').replace(/\r?\n/g, "\r\n");
            if (saveAs && Blob) {
                var blob = new Blob([
                        textContent
                    ], {
                        type: "text/plain;charset=" + charset
                    });
                saveAs(blob, fileName);
                return true;
            } else {
                //IE9-
                var saveTxtWindow = window.frames.saveTxtWindow;
                if (!saveTxtWindow) {
                    saveTxtWindow = document.createElement('iframe');
                    saveTxtWindow.id = 'saveTxtWindow';
                    saveTxtWindow.style.display = 'none';
                    document.body.insertBefore(saveTxtWindow, null);
                    saveTxtWindow = window.frames.saveTxtWindow;
                    if (!saveTxtWindow) {
                        saveTxtWindow = window.open('', '_temp', 'width=100,height=100');
                        if (!saveTxtWindow) {
                            window.alert('Sorry, download file could not be created.');
                            return false;
                        }
                    }
                }
                var doc = saveTxtWindow.document;
                doc.open('text/html', 'replace');
                doc.charset = charset;
                if (Ext.String.endsWith(fileName, '.htm', true) || Ext.String.endsWith(fileName, '.html', true)) {
                    doc.close();
                    doc.body.innerHTML = '\r\n' + textContent + '\r\n';
                } else {
                    if (!Ext.String.endsWith(fileName, '.txt', true))  {
                        fileName += '.txt';
                    }
                    
                    doc.write(textContent);
                    doc.close();
                }
                var retValue = doc.execCommand('SaveAs', null, fileName);
                saveTxtWindow.close();
                return retValue;
            }
        });
    File.saveAs = function(content, filename, charset) {
        if (this.forceDownload) {
            this.downloadBinaryAs(content, filename, 'text/plain');
        } else {
            saveTextAs(content, filename, charset);
        }
    };
    if (saveAs && Blob) {
        File.saveBlobAs = function(textContent, fileName, mimeType) {
            var uint8 = new Uint8Array(textContent.length),
                len = uint8.length,
                bType = {
                    type: mimeType || 'application/octet-stream'
                },
                blob, i;
            for (i = 0; i < len; i++) {
                uint8[i] = textContent.charCodeAt(i);
            }
            blob = new Blob([
                uint8
            ], bType);
            saveAs(blob, fileName);
        };
    }
});

/**
 * This is the base class for an exporter. This class is supposed to be extended to allow
 * data export to various formats.
 *
 * The purpose is to have more exporters that can take the same {@link #data data set} and export it to different
 * formats.
 *
 * Exporters are used by {@link Ext.grid.plugin.Exporter grid Exporter plugin} and {@link Ext.pivot.plugin.Exporter pivot Exporter plugin}
 * but could also be used individually when needed.
 */
Ext.define('Ext.exporter.Base', {
    mixins: [
        'Ext.mixin.Factoryable'
    ],
    alias: 'exporter.base',
    requires: [
        'Ext.exporter.data.Table',
        'Ext.exporter.file.Style',
        'Ext.exporter.File',
        'Ext.Promise'
    ],
    config: {
        /**
         * @cfg {Ext.exporter.data.Table} data (required)
         *
         * Data to be consumed by the exporter.
         *
         */
        data: null,
        /**
         * @cfg {Boolean} [showSummary=true]
         *
         * Should group summaries be shown? The data this exporter can consume
         * may contain group summaries.
         */
        showSummary: true,
        /**
         * @cfg {String} [title=""]
         *
         * Title displayed above the table. Hidden when empty
         */
        title: null,
        /**
         * @cfg {String} [author="Sencha"]
         *
         * The author that generated the file.
         */
        author: 'Sencha',
        /**
         * @cfg {String} [fileName="export.txt"]
         *
         * Name of the saved file
         */
        fileName: 'export.txt',
        /**
         * @cfg {String} [charset="UTF-8"]
         *
         * File's charset
         */
        charset: 'UTF-8'
    },
    constructor: function(config) {
        this.initConfig(config || {});
        return this.callParent(arguments);
    },
    destroy: function() {
        this.setData(Ext.destroy(this.getData()));
        this.callParent();
    },
    /**
     * @method
     * Generates the file content.
     */
    getContent: Ext.identityFn,
    /**
     * Save the file on user's machine using the content generated by this exporter.
     *
     * @return {Ext.Promise}
     */
    saveAs: function() {
        var me = this;
        return new Ext.Promise(function(resolve, reject) {
            Ext.asap(me.delayedSave, me, [
                resolve,
                reject
            ]);
        });
    },
    delayedSave: function(resolve) {
        Ext.exporter.File.saveAs(this.getContent(), this.getFileName(), this.getCharset());
        resolve();
    },
    /**
     * Returns the number of columns available in the provided `columns` array.
     * It will parse the whole tree structure to count the bottom level columns too.
     *
     * @param columns
     * @return {Number}
     */
    getColumnCount: function(columns) {
        var s = 0;
        if (!columns) {
            return s;
        }
        for (var i = 0; i < columns.length; i++) {
            if (!columns[i].columns) {
                s += 1;
            } else {
                s += this.getColumnCount(columns[i].columns);
            }
        }
        return s;
    },
    applyData: function(data) {
        if (!data || data.isDataTable) {
            return data;
        }
        return new Ext.exporter.data.Table(data);
    }
});

/**
 * @private
 */
Ext.define('Ext.exporter.file.ooxml.Relationship', {
    extend: 'Ext.exporter.file.Base',
    isRelationship: true,
    config: {
        idPrefix: 'rId',
        schema: '',
        target: ''
    },
    tpl: [
        '<Relationship Id="{id}" Type="{schema}" Target="{target}"/>'
    ]
});

/**
 * @private
 */
Ext.define('Ext.exporter.file.ooxml.ContentType', {
    extend: 'Ext.exporter.file.Base',
    isContentType: true,
    config: {
        tag: 'Override',
        partName: '',
        contentType: '',
        extension: ''
    },
    tpl: [
        '<{tag}',
        '<tpl if="extension"> Extension="{extension}"</tpl>',
        '<tpl if="partName"> PartName="{partName}"</tpl>',
        '<tpl if="contentType"> ContentType="{contentType}"</tpl>',
        '/>'
    ]
});

/**
 * @private
 */
Ext.define('Ext.exporter.file.ooxml.Base', {
    extend: 'Ext.exporter.file.Base',
    requires: [
        'Ext.exporter.file.ooxml.Relationship',
        'Ext.exporter.file.ooxml.ContentType'
    ],
    config: {
        /**
         * @cfg {String}
         *
         * Full path of the file inside the zip package
         */
        path: '',
        relationship: null,
        contentType: null
    },
    destroy: function() {
        var me = this;
        me.setRelationship(Ext.destroy(me.getRelationship()));
        me.setContentType(Ext.destroy(me.getContentType()));
        me.callParent();
    },
    applyRelationship: function(data) {
        if (!data || data.isRelationship) {
            return data;
        }
        return new Ext.exporter.file.ooxml.Relationship(data);
    },
    applyContentType: function(data) {
        if (!data || data.isContentType) {
            return data;
        }
        return new Ext.exporter.file.ooxml.ContentType(data);
    },
    /**
     * Collect all files that are part of the final zip file
     * @param {Object} files Object key is the path to the file and object value is the content
     */
    collectFiles: Ext.emptyFn
});

/**
 * Implementation of a file stored inside a zip archive
 *
 * @private
 */
Ext.define('Ext.exporter.file.zip.File', {
    extend: 'Ext.Base',
    requires: [
        'Ext.overrides.exporter.util.Format'
    ],
    config: {
        path: '',
        data: null,
        dateTime: null,
        folder: false
    },
    constructor: function(config) {
        var me = this;
        me.initConfig(config);
        if (!me.getDateTime()) {
            me.setDateTime(new Date());
        }
        return me.callParent([
            config
        ]);
    },
    getId: function() {
        return this.getPath();
    },
    crc32: function(input, crc) {
        var table = this.self.crcTable,
            x = 0,
            y = 0,
            b = 0,
            isArray;
        // this method uses code from https://github.com/Stuk/jszip
        if (typeof input === "undefined" || !input.length) {
            return 0;
        }
        isArray = (typeof input !== "string");
        if (typeof (crc) == "undefined") {
            crc = 0;
        }
        crc = crc ^ (-1);
        for (var i = 0,
            iTop = input.length; i < iTop; i++) {
            b = isArray ? input[i] : input.charCodeAt(i);
            y = (crc ^ b) & 255;
            x = table[y];
            crc = (crc >>> 8) ^ x;
        }
        return crc ^ (-1);
    },
    getHeader: function(offset) {
        var data = this.getData(),
            path = this.getPath(),
            utfName = Ext.util.Base64._utf8_encode(path),
            useUTF8 = utfName !== path,
            dateTime = this.getDateTime(),
            extraFields = '',
            unicodePathExtraField = '',
            decToHex = Ext.util.Format.decToHex,
            header = '',
            dosTime, dosDate, fileHeader, dirHeader;
        // this method uses code from https://github.com/Stuk/jszip
        dosTime = dateTime.getHours();
        dosTime = dosTime << 6;
        dosTime = dosTime | dateTime.getMinutes();
        dosTime = dosTime << 5;
        dosTime = dosTime | dateTime.getSeconds() / 2;
        dosDate = dateTime.getFullYear() - 1980;
        dosDate = dosDate << 4;
        dosDate = dosDate | (dateTime.getMonth() + 1);
        dosDate = dosDate << 5;
        dosDate = dosDate | dateTime.getDate();
        if (useUTF8) {
            unicodePathExtraField = // Version
            decToHex(1, 1) + // NameCRC32
            decToHex(this.crc32(utfName), 4) + // UnicodeName
            utfName;
            extraFields += // Info-ZIP Unicode Path Extra Field
            "up" + // size
            decToHex(unicodePathExtraField.length, 2) + // content
            unicodePathExtraField;
        }
        // version needed to extract
        header += "\n\x00";
        // general purpose bit flag
        // set bit 11 if utf8
        header += useUTF8 ? "\x00\b" : "\x00\x00";
        // compression method
        header += "\x00\x00";
        // last mod file time
        header += decToHex(dosTime, 2);
        // last mod file date
        header += decToHex(dosDate, 2);
        // crc-32
        header += decToHex(data ? this.crc32(data) : 0, 4);
        // compressed size
        header += decToHex(data ? data.length : 0, 4);
        // uncompressed size
        header += decToHex(data ? data.length : 0, 4);
        // file name length
        header += decToHex(utfName.length, 2);
        // extra field length
        header += decToHex(extraFields.length, 2);
        fileHeader = "PK\x03\x04" + header + utfName + extraFields;
        dirHeader = // central file header
        "PK\x01\x02" + // version made by (00: DOS)
        "\x14\x00" + // file header (common to file and central directory)
        header + // file comment length
        "\x00\x00" + // disk number start
        "\x00\x00" + // internal file attributes TODO
        "\x00\x00" + // external file attributes
        (this.getFolder() === true ? "\x10\x00\x00\x00" : "\x00\x00\x00\x00") + // relative offset of local header
        decToHex(offset, 4) + // file name
        utfName + // extra field
        extraFields;
        return {
            fileHeader: fileHeader,
            dirHeader: dirHeader,
            data: data || ''
        };
    }
}, function(File) {
    var c,
        table = [];
    for (var n = 0; n < 256; n++) {
        c = n;
        for (var k = 0; k < 8; k++) {
            c = ((c & 1) ? (3.988292384E9 ^ (c >>> 1)) : (c >>> 1));
        }
        table[n] = c;
    }
    File.crcTable = table;
});

/**
 * Implementation of a folder stored inside a zip archive
 *
 * @private
 */
Ext.define('Ext.exporter.file.zip.Folder', {
    extend: 'Ext.exporter.file.zip.File',
    folder: true
});

/**
 * This class allows creation of zip files without any compression
 *
 * @private
 */
Ext.define('Ext.exporter.file.zip.Archive', {
    extend: 'Ext.exporter.file.Base',
    requires: [
        'Ext.exporter.file.zip.Folder'
    ],
    config: {
        folders: [],
        files: []
    },
    destroy: function() {
        this.callParent();
        this.setFolders(null);
        this.setFiles(null);
    },
    applyFolders: function(data, dataCollection) {
        return this.checkCollection(data, dataCollection, 'Ext.exporter.file.zip.Folder');
    },
    applyFiles: function(data, dataCollection) {
        return this.checkCollection(data, dataCollection, 'Ext.exporter.file.zip.File');
    },
    updateFiles: function(collection, oldCollection) {
        var me = this;
        if (oldCollection) {
            oldCollection.un({
                add: me.onFileAdd,
                remove: me.onFileRemove,
                scope: me
            });
        }
        if (collection) {
            collection.on({
                add: me.onFileAdd,
                remove: me.onFileRemove,
                scope: me
            });
            me.onFileAdd(collection, {
                items: collection.getRange()
            });
        }
    },
    onFileAdd: function(collection, details) {
        var folders = this.getFolders(),
            items = details.items,
            length = items.length,
            i, item, folder;
        for (i = 0; i < length; i++) {
            item = items[i];
            folder = this.getParentFolder(item.getPath());
            if (folder) {
                folders.add({
                    path: folder
                });
            }
        }
    },
    onFileRemove: function(collection, details) {
        Ext.destroy(details.items);
    },
    getParentFolder: function(path) {
        var lastSlash;
        if (path.slice(-1) == '/') {
            path = path.substring(0, path.length - 1);
        }
        lastSlash = path.lastIndexOf('/');
        return (lastSlash > 0) ? path.substring(0, lastSlash + 1) : "";
    },
    addFile: function(config) {
        return this.getFiles().add(config || {});
    },
    removeFile: function(config) {
        return this.getFiles().remove(config);
    },
    getContent: function() {
        var fileData = '',
            dirData = '',
            localDirLength = 0,
            centralDirLength = 0,
            decToHex = Ext.util.Format.decToHex,
            files = Ext.Array.merge(this.getFolders().getRange(), this.getFiles().getRange()),
            len = files.length,
            dirEnd, i, file, header;
        // this method uses code from https://github.com/Stuk/jszip
        for (i = 0; i < len; i++) {
            file = files[i];
            header = file.getHeader(localDirLength);
            localDirLength += header.fileHeader.length + header.data.length;
            centralDirLength += header.dirHeader.length;
            fileData += header.fileHeader + header.data;
            dirData += header.dirHeader;
        }
        dirEnd = // central directory end
        "PK\x05\x06" + // number of this disk
        "\x00\x00" + // number of the disk with the start of the central directory
        "\x00\x00" + // total number of entries in the central directory on this disk
        decToHex(len, 2) + // total number of entries in the central directory
        decToHex(len, 2) + // size of the central directory   4 bytes
        decToHex(centralDirLength, 4) + // offset of start of central directory with respect to the starting disk number
        decToHex(localDirLength, 4) + // .ZIP file comment length
        "\x00\x00";
        fileData += dirData + dirEnd;
        return fileData;
    }
});

/**
 * @private
 */
Ext.define('Ext.exporter.file.ooxml.Relationships', {
    extend: 'Ext.exporter.file.ooxml.Base',
    isRelationships: true,
    config: {
        relationships: []
    },
    contentType: {
        contentType: 'application/vnd.openxmlformats-package.relationships+xml',
        partName: '/_rels/.rels'
    },
    tpl: [
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">',
        '<tpl if="relationships"><tpl for="relationships.getRange()">{[values.render()]}</tpl></tpl>',
        '</Relationships>'
    ],
    destroy: function() {
        this.callParent();
        this.setRelationships(null);
    },
    collectFiles: function(files) {
        if (this.getRelationships().length) {
            files[this.getPath()] = this.render();
        }
    },
    applyRelationships: function(data, dataCollection) {
        return this.checkCollection(data, dataCollection, 'Ext.exporter.file.ooxml.Relationship');
    },
    /**
     * Convenience method to add relationships.
     * @param {Object/Array} config
     * @return {Ext.exporter.file.ooxml.Relationship/Ext.exporter.file.ooxml.Relationship[]}
     */
    addRelationship: function(config) {
        return this.getRelationships().add(config || {});
    },
    removeRelationship: function(config) {
        return this.getRelationships().remove(config);
    }
});

/**
 * @private
 */
Ext.define('Ext.exporter.file.ooxml.excel.Sheet', {
    extend: 'Ext.exporter.file.ooxml.Base',
    config: {
        index: 1,
        name: null,
        folder: 'sheet',
        fileName: 'sheet',
        relationships: {
            contentType: {
                contentType: 'application/vnd.openxmlformats-package.relationships+xml'
            }
        },
        /**
         * @cfg {Ext.exporter.file.ooxml.excel.Workbook} workbook
         *
         * Reference to the parent workbook.
         */
        workbook: null
    },
    contentType: {},
    relationship: {},
    destroy: function() {
        var me = this;
        me.setRelationships(Ext.destroy(me.getRelationships()));
        me.setWorkbook(null);
        me.callParent();
    },
    collectFiles: function(files) {
        var me = this,
            path = me.getFolder() + '/',
            name = me.getFileName() + me.getIndex() + '.xml',
            rels = me.getRelationships();
        me.getRelationship().setTarget(path + name);
        me.setPath('/xl/' + path + name);
        me.getContentType().setPartName('/xl/' + path + name);
        rels.getContentType().setPartName('/xl/' + path + '_rels/' + name + '.rels');
        rels.setPath('/xl/' + path + '_rels/' + name + '.rels');
        me.getRelationships().collectFiles(files);
        files[me.getPath()] = me.render();
    },
    applyRelationships: function(data) {
        if (!data || data.isRelationships) {
            return data;
        }
        return new Ext.exporter.file.ooxml.Relationships(data);
    }
});

/**
 * @private
 */
Ext.define('Ext.exporter.file.ooxml.excel.Column', {
    extend: 'Ext.exporter.file.ooxml.Base',
    config: {
        min: 1,
        max: 1,
        width: 10,
        autoFitWidth: false,
        hidden: false,
        styleId: null
    },
    tpl: [
        '<col ',
        'min="{min}" ',
        'max="{max}" ',
        'width="{width}"',
        '<tpl if="styleId"> style="{styleId}"</tpl>',
        '<tpl if="hidden"> hidden="1"</tpl>',
        '<tpl if="autoFitWidth"> bestFit="1"</tpl>',
        '<tpl if="width != 10"> customWidth="1"</tpl>',
        '/>'
    ]
});

/**
 * @private
 */
Ext.define('Ext.exporter.file.ooxml.excel.Cell', {
    extend: 'Ext.exporter.file.Base',
    isCell: true,
    config: {
        /**
         * @cfg {Ext.exporter.file.ooxml.excel.Row} row
         *
         * Reference to the parent row
         */
        row: null,
        /**
         * @cfg {String} dataType (required)
         *
         * The cell's data type. Possible values:
         *
         * - `b` (Boolean) Cell containing a boolean.
         * - `d` (Date) Cell contains a date in the ISO 8601 format.
         * - `e` (Error) Cell containing an error.
         * - `inlineStr` (InlineString) Cell containing an (inline) rich string, i.e., one not in the shared
         * string table. If this cell type is used, then the cell value is in the `is` element rather than the `v`
         * element in the cell (`c` element).
         * - `n` (Number) Cell containing a number.
         * - `s` (SharedString) Cell containing a shared string.
         * - `str` (String) Cell containing a formula string.
         */
        dataType: 's',
        /**
         * @cfg {Boolean} [showPhonetic]
         *
         * `true` if the cell should show phonetic.
         */
        showPhonetic: null,
        /**
         * @cfg {Number} index
         *
         * Specifies the column index of this cell within the containing row. If this tag is not specified, the first
         * instance of a Cell element within a row has an assumed Index="1".
         *
         */
        index: null,
        /**
         * @cfg {String} styleId
         *
         * The index of this cell's style. Style records are stored in the Styles Part.
         */
        styleId: null,
        /**
         * @cfg {Number} mergeAcross
         *
         * Number of cells to merge to the right side of this cell
         */
        mergeAcross: null,
        /**
         * @cfg {Number} mergeDown
         *
         * Number of cells to merge below this cell
         */
        mergeDown: null,
        /**
         * @cfg {Number/Date/String} value (required)
         *
         * Value assigned to this cell
         */
        value: ''
    },
    isMergedCell: false,
    tpl: [
        '<c r="{cellNotation}" t="{dataType}"',
        '<tpl if="showPhonetic"> ph="1"</tpl>',
        '<tpl if="styleId"> s="{styleId}"</tpl>',
        '><v>{value}</v></c>'
    ],
    destroy: function() {
        this.setRow(null);
        this.callParent();
    },
    getRenderData: function() {
        var me = this;
        return Ext.apply(me.callParent(arguments), {
            cellNotation: me.getNotation(me.getIndex()) + me.getRow().getIndex()
        });
    },
    applyValue: function(v) {
        var dt;
        if (typeof v === 'boolean') {
            dt = 'b';
        } else if (typeof v === 'number') {
            dt = 'n';
        } else if (v instanceof Date) {
            dt = 'd';
            v = Ext.Date.format(v, 'Y-m-d\\TH:i:s.u');
        } else if (v === '') {
            dt = 'inlineStr';
            // values in xml tags should be utf8 encoded
            v = Ext.util.Base64._utf8_encode(v);
        } else {
            dt = 's';
            v = Ext.util.Format.stripTags(v);
        }
        this.setDataType(dt);
        return v;
    },
    updateRow: function(row) {
        if (this.getDataType() === 's' && row) {
            this._value = row.getWorksheet().getWorkbook().getSharedStrings().addString(this.getValue());
        }
    },
    updateMergeAcross: function(v) {
        this.isMergedCell = (v || this.getMergeDown());
    },
    updateMergeDown: function(v) {
        this.isMergedCell = (v || this.getMergeAcross());
    },
    getMergedCellRef: function() {
        var me = this,
            currIndex = me.getIndex(),
            rowIndex = me.getRow().getIndex(),
            mAcross = me.getMergeAcross(),
            mDown = me.getMergeDown(),
            s = me.getNotation(currIndex) + rowIndex + ':';
        if (mAcross) {
            currIndex += mAcross;
        }
        if (mDown) {
            rowIndex += mDown;
        }
        s += me.getNotation(currIndex) + rowIndex;
        return s;
    },
    /**
     * Formats a number to the A1 style
     *
     * @param index
     * @return {string}
     */
    getNotation: function(index) {
        var code = 65,
            length = 26,
            getChar = String.fromCharCode,
            r, n;
        if (index <= 0) {
            index = 1;
        }
        n = Math.floor(index / length);
        r = index % length;
        if (n === 0 || index === length) {
            return getChar(code + index - 1);
        } else if (n < length) {
            return getChar(code + n - 1) + getChar(code + r - 1);
        } else {
            return this.getNotation(n) + getChar(code + r - 1);
        }
    }
});

/**
 * @private
 */
Ext.define('Ext.exporter.file.ooxml.excel.Row', {
    extend: 'Ext.exporter.file.Base',
    requires: [
        'Ext.exporter.file.ooxml.excel.Cell'
    ],
    config: {
        /**
         * @cfg {Boolean} [collapsed]
         *
         * `true` if the rows 1 level of outlining deeper than the current row are in the collapsed outline state.
         * It means that the rows which are 1 outline level deeper (numerically higher value) than the current
         * row are currently hidden due to a collapsed outline state.
         *
         * It is possible for collapsed to be false and yet still have the rows in question hidden. This can
         * be achieved by having a lower outline level collapsed, thus hiding all the child rows.
         */
        collapsed: null,
        /**
         * @cfg {Boolean} [hidden=false]
         *
         * `true` if the row is hidden, e.g., due to a collapsed outline or by manually selecting and hiding a row.
         */
        hidden: null,
        /**
         * @cfg {Number} [height]
         *
         * Row height measured in point size. There is no margin padding on row height.
         */
        height: null,
        /**
         * @cfg {Number} [outlineLevel]
         *
         * Outlining level of the row, when outlining is on.
         */
        outlineLevel: null,
        /**
         * @cfg {Boolean} [showPhonetic]
         *
         * `true` if the row should show phonetic.
         */
        showPhonetic: null,
        /**
         * @cfg {String} index
         *
         * Row index. Indicates to which row in the sheet this row definition corresponds.
         */
        index: null,
        /**
         * @cfg {String} [styleId]
         *
         * Index to style record for the row (only applied if {@link #customFormat} attribute is `true`)
         */
        styleId: null,
        /**
         * @cfg {Ext.exporter.file.ooxml.excel.Worksheet} worksheet
         *
         * Reference to the parent worksheet
         */
        worksheet: null,
        /**
         * @cfg {Ext.exporter.file.ooxml.excel.Cell[]} cells
         *
         * Collection of cells available on this row.
         */
        cells: []
    },
    tpl: [
        '<row',
        '<tpl if="index"> r="{index}"</tpl>',
        '<tpl if="collapsed"> collapsed="{collapsed}"</tpl>',
        '<tpl if="hidden"> hidden="1"</tpl>',
        '<tpl if="height"> ht="{height}" customHeight="1"</tpl>',
        '<tpl if="outlineLevel"> outlineLevel="{outlineLevel}"</tpl>',
        '<tpl if="styleId"> s="{styleId}" customFormat="1"</tpl>',
        '>',
        '<tpl if="cells"><tpl for="cells.getRange()">{[values.render()]}</tpl></tpl>',
        '</row>'
    ],
    destroy: function() {
        this.setWorksheet(null);
        this.callParent();
        this.setCells(null);
    },
    applyCells: function(data, dataCollection) {
        return this.checkCollection(data, dataCollection, 'Ext.exporter.file.ooxml.excel.Cell');
    },
    updateCells: function(collection, oldCollection) {
        var me = this;
        if (oldCollection) {
            collection.un({
                add: me.onCellAdd,
                remove: me.onCellRemove,
                scope: me
            });
        }
        if (collection) {
            collection.on({
                add: me.onCellAdd,
                remove: me.onCellRemove,
                scope: me
            });
            me.onCellAdd(collection, {
                items: collection.getRange()
            });
        }
    },
    onCellAdd: function(collection, details) {
        var items = details.items,
            length = items.length,
            i, item;
        for (i = 0; i < length; i++) {
            item = items[i];
            item.setRow(this);
        }
        this.updateCellIndexes();
    },
    onCellRemove: function(collection, details) {
        Ext.destroy(details.items);
        this.updateCellIndexes();
    },
    updateCellIndexes: function() {
        var cells = this.getCells(),
            i, len, cell;
        if (!cells) {
            return;
        }
        len = cells.length;
        for (i = 0; i < len; i++) {
            cell = cells.getAt(i);
            if (!cell.getIndex()) {
                cell.setIndex(i + 1);
            }
        }
    },
    /**
     * Convenience method to add cells.
     * @param {Object/Array} config
     * @return {Ext.exporter.file.ooxml.excel.Cell/Ext.exporter.file.ooxml.excel.Cell[]}
     */
    addCell: function(config) {
        return this.getCells().add(config);
    },
    /**
     * Convenience method to fetch a cell by its id.
     * @param id
     * @return {Ext.exporter.file.ooxml.excel.Cell}
     */
    getCell: function(id) {
        return this.getCells().get(id);
    }
});

/**
 * @private
 */
Ext.define('Ext.exporter.file.ooxml.excel.Worksheet', {
    extend: 'Ext.exporter.file.ooxml.excel.Sheet',
    requires: [
        'Ext.exporter.file.ooxml.excel.Column',
        'Ext.exporter.file.ooxml.excel.Row'
    ],
    isWorksheet: true,
    config: {
        columns: null,
        rows: [],
        drawings: null,
        tables: null,
        mergeCells: null
    },
    //comments: null,
    //pivotTables: null,
    //tableSingleCell: null
    folder: 'worksheets',
    fileName: 'sheet',
    contentType: {
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml'
    },
    relationship: {
        schema: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet'
    },
    tpl: [
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
        '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" ',
        'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">',
        '<tpl if="columns">',
        '<cols>',
        '<tpl for="columns.getRange()">{[values.render()]}</tpl>',
        '</cols>',
        '</tpl>',
        '<sheetData>',
        '<tpl if="rows"><tpl for="rows.getRange()">{[values.render()]}</tpl></tpl>',
        '</sheetData>',
        '<tpl if="rows">',
        '<mergeCells>',
        '<tpl for="rows.getRange()">',
        '<tpl for="_cells.items">',
        '<tpl if="isMergedCell"><mergeCell ref="{[values.getMergedCellRef()]}"/></tpl>',
        '</tpl>',
        '</tpl>',
        '</mergeCells>',
        '</tpl>',
        '</worksheet>'
    ],
    destroy: function() {
        var me = this;
        me.callParent();
        me.setRows(null);
        me.setTables(null);
        me.setDrawings(null);
    },
    applyColumns: function(data, dataCollection) {
        return this.checkCollection(data, dataCollection, 'Ext.exporter.file.ooxml.excel.Column');
    },
    applyRows: function(data, dataCollection) {
        return this.checkCollection(data, dataCollection, 'Ext.exporter.file.ooxml.excel.Row');
    },
    updateRows: function(collection, oldCollection) {
        var me = this;
        if (oldCollection) {
            oldCollection.un({
                add: me.onRowAdd,
                remove: me.onRowRemove,
                scope: me
            });
        }
        if (collection) {
            collection.on({
                add: me.onRowAdd,
                remove: me.onRowRemove,
                scope: me
            });
            me.onRowAdd(collection, {
                items: collection.getRange()
            });
        }
    },
    onRowAdd: function(collection, details) {
        var items = details.items,
            length = items.length,
            i, item;
        for (i = 0; i < length; i++) {
            item = items[i];
            item.setWorksheet(this);
        }
        this.updateRowIndexes();
    },
    onRowRemove: function(collection, details) {
        Ext.destroy(details.items);
    },
    updateRowIndexes: function() {
        var rows = this.getRows(),
            i, len, row;
        if (!rows) {
            return;
        }
        len = rows.length;
        for (i = 0; i < len; i++) {
            row = rows.getAt(i);
            if (!row.getIndex()) {
                row.setIndex(i + 1);
            }
        }
    },
    updateDrawings: function(data) {
        var rels = this.getRelationships();
        if (oldData && rels) {
            rels.removeRelationship(oldData.getRelationship());
        }
        if (data && rels) {
            rels.addRelationship(data.getRelationship());
        }
    },
    updateTables: function(data) {
        var rels = this.getRelationships();
        if (oldData && rels) {
            rels.removeRelationship(oldData.getRelationship());
        }
        if (data && rels) {
            rels.addRelationship(data.getRelationship());
        }
    },
    /**
     * Convenience method to add column infos.
     * @param {Object/Array} config
     * @return {Ext.exporter.file.ooxml.excel.Column/Ext.exporter.file.ooxml.excel.Column[]}
     */
    addColumn: function(config) {
        if (!this.getColumns()) {
            this.setColumns([]);
        }
        return this.getColumns().add(config || {});
    },
    /**
     * Convenience method to add rows.
     * @param {Object/Array} config
     * @return {Ext.exporter.file.ooxml.excel.Row/Ext.exporter.file.ooxml.excel.Row[]}
     */
    addRow: function(config) {
        return this.getRows().add(config || {});
    },
    /**
     * Convenience method to fetch a row by its id.
     * @param id
     * @return {Ext.exporter.file.ooxml.excel.Row}
     */
    getRow: function(id) {
        return this.getRows().get(id);
    }
});

/**
 * @private
 */
Ext.define('Ext.exporter.file.ooxml.excel.Font', {
    extend: 'Ext.exporter.file.ooxml.Base',
    config: {
        size: 10,
        fontName: '',
        family: null,
        // 1: Roman, 2: Swiss, 3: Modern, 4: Script, 5: Decorative
        charset: null,
        bold: false,
        italic: false,
        underline: false,
        outline: false,
        strikeThrough: false,
        color: null,
        // rgb color
        verticalAlign: null
    },
    // `baseline`, `superscript`, `subscript`
    mappings: {
        family: {
            Automatic: 0,
            Roman: 1,
            Swiss: 2,
            Modern: 3,
            Script: 4,
            Decorative: 5
        }
    },
    tpl: [
        '<font>',
        '<tpl if="size"><sz val="{size}"/></tpl>',
        '<tpl if="fontName"><name val="{fontName}"/></tpl>',
        '<tpl if="family"><family val="{family}"/></tpl>',
        '<tpl if="charset"><charset val="{charset}"/></tpl>',
        '<tpl if="bold"><b/></tpl>',
        '<tpl if="italic"><i/></tpl>',
        '<tpl if="underline"><u/></tpl>',
        '<tpl if="outline"><outline/></tpl>',
        '<tpl if="strikeThrough"><strike/></tpl>',
        '<tpl if="color"><color rgb="{color}"/></tpl>',
        '<tpl if="verticalAlign"><vertAlign val="{verticalAlign}"/></tpl>',
        '</font>'
    ],
    constructor: function(config) {
        var cfg = {},
            keys = Ext.Object.getKeys(config || {}),
            len = keys.length,
            i;
        if (config) {
            for (i = 0; i < len; i++) {
                cfg[Ext.String.uncapitalize(keys[i])] = config[keys[i]];
            }
        }
        this.callParent([
            cfg
        ]);
    },
    applyFamily: function(value) {
        if (typeof value === 'string') {
            return this.mappings.family[value];
        }
        return value;
    },
    applyBold: function(value) {
        return !!value;
    },
    applyItalic: function(value) {
        return !!value;
    },
    applyStrikeThrough: function(value) {
        return !!value;
    },
    applyUnderline: function(value) {
        return !!value;
    },
    applyOutline: function(value) {
        return !!value;
    },
    applyColor: function(value) {
        var v;
        if (!value) {
            return value;
        }
        v = String(value);
        return v.indexOf('#') >= 0 ? v.replace('#', '') : v;
    },
    applyVerticalAlign: function(value) {
        return Ext.util.Format.lowercase(value);
    }
});

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
    getRenderData: function() {
        var data = this.callParent(),
            fmt = data.formatCode;
        fmt = (fmt && data.isDate) ? fmt.replace(this.spaceRe, '\\$1') : fmt;
        data.formatCode = fmt;
        return data;
    },
    applyFormatCode: function(value) {
        return value ? Ext.util.Format.htmlEncode(value) : value;
    },
    getKey: function() {
        return this.getFormatCode();
    }
});

/**
 * @private
 */
Ext.define('Ext.exporter.file.ooxml.excel.Fill', {
    extend: 'Ext.exporter.file.ooxml.Base',
    requires: [
        'Ext.util.Format'
    ],
    config: {
        /**
         * Possible values:
         * - none
         * - solid
         * - mediumGray
         * - darkGray
         * - lightGray
         * - darkHorizontal
         * - darkVertical
         * - darkDown
         * - darkUp
         * - darkGrid
         * - darkTrellis
         * - lightHorizontal
         * - lightVertical
         * - lightDown
         * - lightUp
         * - lightGrid
         * - lightTrellis
         * - gray125
         * - gray0625
         */
        patternType: 'none',
        fgColor: null,
        bgColor: null
    },
    tpl: [
        '<fill>',
        '<patternFill patternType="{patternType}">',
        '<tpl if="fgColor"><fgColor rgb="{fgColor}"></fgColor></tpl>',
        '<tpl if="bgColor"><bgColor rgb="{bgColor}"></bgColor></tpl>',
        '</patternFill>',
        '</fill>'
    ],
    constructor: function(config) {
        var cfg = {};
        if (config) {
            cfg.id = config.id;
            cfg.bgColor = config.Color || null;
            cfg.patternType = config.Pattern || null;
        }
        this.callParent([
            cfg
        ]);
    },
    formatColor: function(value) {
        var v;
        if (!value) {
            return value;
        }
        v = String(value);
        return v.indexOf('#') >= 0 ? v.replace('#', '') : v;
    },
    applyFgColor: function(value) {
        return this.formatColor(value);
    },
    applyBgColor: function(value) {
        return this.formatColor(value);
    },
    applyPatternType: function(value) {
        var possible = [
                'none',
                'solid',
                'mediumGray',
                'darkGray',
                'lightGray',
                'darkHorizontal',
                'darkVertical',
                'darkDown',
                'darkUp',
                'darkGrid',
                'darkTrellis',
                'lightHorizontal',
                'lightVertical',
                'lightDown',
                'lightUp',
                'lightGrid',
                'lightTrellis',
                'gray125',
                'gray0625'
            ],
            v = Ext.util.Format.uncapitalize(value);
        return Ext.Array.indexOf(possible, v) >= 0 ? v : 'none';
    }
});

/**
 * @private
 */
Ext.define('Ext.exporter.file.ooxml.excel.BorderPr', {
    extend: 'Ext.exporter.file.ooxml.Base',
    isBorderPr: true,
    config: {
        tag: 'left',
        color: null,
        /**
         * Possible values:
         * - none
         * - thin
         * - medium
         * - dashed
         * - dotted
         * - thick
         * - double
         * - hair
         * - mediumDashed
         * - dashDot
         * - mediumDashDot
         * - dashDotDot
         * - mediumDashDotDot
         * - slantDashDot
         */
        lineStyle: 'none'
    },
    mappings: {
        lineStyle: {
            'None': 'none',
            'Continuous': 'thin',
            'Dash': 'dashed',
            'Dot': 'dotted',
            'DashDot': 'dashDot',
            'DashDotDot': 'dashDotDot',
            'SlantDashDot': 'slantDashDot',
            'Double': 'double'
        }
    },
    tpl: [
        '<{tag} style="{lineStyle}">',
        '<tpl if="color"><color rgb="{color}"/></tpl>',
        '</{tag}>'
    ],
    applyColor: function(value) {
        var v;
        if (!value) {
            return value;
        }
        v = String(value);
        return v.indexOf('#') >= 0 ? v.replace('#', '') : v;
    },
    applyLineStyle: function(value) {
        var possible = [
                'none',
                'thin',
                'medium',
                'dashed',
                'dotted',
                'thick',
                'double',
                'hair',
                'mediumDashed',
                'dashDot',
                'mediumDashDot',
                'dashDotDot',
                'mediumDashDotDot',
                'slantDashDot'
            ];
        return Ext.Array.indexOf(possible, value) >= 0 ? value : (this.mappings.lineStyle[value] || 'none');
    }
});

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
    applyLeft: function(border) {
        if (border && !border.isBorderPr) {
            return new Ext.exporter.file.ooxml.excel.BorderPr(border);
        }
        return border;
    },
    applyTop: function(border) {
        if (border && !border.isBorderPr) {
            return new Ext.exporter.file.ooxml.excel.BorderPr(border);
        }
        return border;
    },
    applyRight: function(border) {
        if (border && !border.isBorderPr) {
            return new Ext.exporter.file.ooxml.excel.BorderPr(border);
        }
        return border;
    },
    applyBottom: function(border) {
        if (border && !border.isBorderPr) {
            return new Ext.exporter.file.ooxml.excel.BorderPr(border);
        }
        return border;
    },
    updateLeft: function(border) {
        if (border) {
            border.setTag('left');
        }
    },
    updateTop: function(border) {
        if (border) {
            border.setTag('top');
        }
    },
    updateRight: function(border) {
        if (border) {
            border.setTag('right');
        }
    },
    updateBottom: function(border) {
        if (border) {
            border.setTag('bottom');
        }
    }
});

/**
 * @private
 */
Ext.define('Ext.exporter.file.ooxml.excel.CellAlignment', {
    extend: 'Ext.exporter.file.ooxml.Base',
    isCellAlignment: true,
    config: {
        /**
         * Possible values:
         * - general
         * - left
         * - center
         * - right
         * - fill
         * - justify
         * - centerContinuous
         * - distributed
         */
        horizontal: 'general',
        /**
         * Possible values:
         * - top
         * - center
         * - bottom
         * - justify
         * - distributed
         */
        vertical: 'top',
        rotate: null,
        wrapText: false,
        indent: null,
        relativeIndent: null,
        justifyLastLine: false,
        shrinkToFit: false,
        /**
         * An integer value indicating whether the reading order (bidirectionality) of the cell is left- to-right, right-to-left, or context dependent.
         *
         * 0 - Context Dependent - reading order is determined by scanning the text for the first non-whitespace character: if it is a strong right-to-left character, the reading order is right-to-left; otherwise, the reading order left-to-right.
         * 1 - Left-to-Right- reading order is left-to-right in the cell, as in English.
         * 2 - Right-to-Left - reading order is right-to-left in the cell, as in Hebrew.
         *
         * The possible values for this attribute are defined by the W3C XML Schema unsignedInt datatype.
         */
        readingOrder: null
    },
    mappings: {
        horizontal: {
            Automatic: 'general',
            CenterAcrossSelection: 'centerContinuous',
            JustifyDistributed: 'distributed'
        },
        vertical: {
            Automatic: 'top',
            JustifyDistributed: 'distributed'
        },
        readingOrder: {
            Context: 0,
            LeftToRight: 1,
            RightToLeft: 2
        }
    },
    tpl: [
        '<alignment',
        '<tpl if="horizontal"> horizontal="{horizontal}"</tpl>',
        '<tpl if="vertical"> vertical="{vertical}"</tpl>',
        '<tpl if="rotate"> textRotation="{rotate}"</tpl>',
        '<tpl if="wrapText"> wrapText="{wrapText}"</tpl>',
        '<tpl if="indent"> indent="{indent}"</tpl>',
        '<tpl if="relativeIndent"> relativeIndent="{relativeIndent}"</tpl>',
        '<tpl if="justifyLastLine"> justifyLastLine="{justifyLastLine}"</tpl>',
        '<tpl if="shrinkToFit"> shrinkToFit="{shrinkToFit}"</tpl>',
        '<tpl if="readingOrder"> readingOrder="{readingOrder}"</tpl>',
        '/>'
    ],
    constructor: function(config) {
        var cfg = {},
            keys = Ext.Object.getKeys(config || {}),
            len = keys.length,
            i;
        if (config) {
            for (i = 0; i < len; i++) {
                cfg[Ext.String.uncapitalize(keys[i])] = config[keys[i]];
            }
        }
        this.callParent([
            cfg
        ]);
    },
    applyHorizontal: function(value) {
        var possible = [
                'general',
                'left',
                'center',
                'right',
                'fill',
                'justify',
                'centerContinuous',
                'distributed'
            ],
            v = Ext.util.Format.uncapitalize(value);
        return Ext.Array.indexOf(possible, v) >= 0 ? v : (this.mappings.horizontal[value] || 'general');
    },
    applyVertical: function(value) {
        var possible = [
                'top',
                'center',
                'bottom',
                'justify',
                'distributed'
            ],
            v = Ext.util.Format.uncapitalize(value);
        return Ext.Array.indexOf(possible, v) >= 0 ? v : (this.mappings.vertical[value] || 'top');
    },
    applyReadingOrder: function(value) {
        if (typeof value === 'string') {
            return this.mappings.readingOrder[value] || 0;
        }
        return value;
    }
});

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
    applyAlignment: function(align) {
        if (align && !align.isCellAlignment) {
            return new Ext.exporter.file.ooxml.excel.CellAlignment(align);
        }
        return align;
    }
});

/**
 * @private
 */
Ext.define('Ext.exporter.file.ooxml.excel.CellXf', {
    extend: 'Ext.exporter.file.ooxml.excel.CellStyleXf',
    config: {
        xfId: 0
    },
    tpl: [
        '<xf numFmtId="{numFmtId}" fontId="{fontId}" fillId="{fillId}" borderId="{borderId}" xfId="{xfId}"',
        '<tpl if="numFmtId"> applyNumberFormat="1"</tpl>',
        '<tpl if="fillId"> applyFill="1"</tpl>',
        '<tpl if="borderId"> applyBorder="1"</tpl>',
        '<tpl if="fontId"> applyFont="1"</tpl>',
        '<tpl if="alignment"> applyAlignment="1"</tpl>>',
        '<tpl if="alignment">{[values.alignment.render()]}</tpl>',
        '</xf>'
    ]
});

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
        fonts: [
            {
                fontName: 'Arial',
                size: 10,
                family: 2
            }
        ],
        numberFormats: null,
        fills: [
            {
                patternType: 'none'
            }
        ],
        borders: [
            {
                left: {},
                top: {},
                right: {},
                bottom: {}
            }
        ],
        cellStyleXfs: [
            {}
        ],
        cellXfs: [
            {}
        ]
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
    destroy: function() {
        var me = this;
        me.callParent();
        me.setFonts(null);
        me.setNumberFormats(null);
        me.setFills(null);
        me.setBorders(null);
        me.setCellXfs(null);
    },
    applyFonts: function(data, dataCollection) {
        return this.checkCollection(data, dataCollection, 'Ext.exporter.file.ooxml.excel.Font');
    },
    applyNumberFormats: function(data, dataCollection) {
        return this.checkCollection(data, dataCollection, 'Ext.exporter.file.ooxml.excel.NumberFormat');
    },
    applyFills: function(data, dataCollection) {
        return this.checkCollection(data, dataCollection, 'Ext.exporter.file.ooxml.excel.Fill');
    },
    applyBorders: function(data, dataCollection) {
        return this.checkCollection(data, dataCollection, 'Ext.exporter.file.ooxml.excel.Border');
    },
    applyCellXfs: function(data, dataCollection) {
        return this.checkCollection(data, dataCollection, 'Ext.exporter.file.ooxml.excel.CellXf');
    },
    applyCellStyleXfs: function(data, dataCollection) {
        return this.checkCollection(data, dataCollection, 'Ext.exporter.file.ooxml.excel.CellStyleXf');
    },
    addFont: function(config) {
        var col = this.getFonts(),
            ret;
        if (!col) {
            this.setFonts([]);
            col = this.getFonts();
        }
        ret = col.add(config);
        return col.indexOf(ret);
    },
    addNumberFormat: function(config) {
        var col = this.getNumberFormats(),
            ret, temp;
        if (!col) {
            this.setNumberFormats([]);
            col = this.getNumberFormats();
        }
        temp = new Ext.exporter.file.ooxml.excel.NumberFormat(config);
        ret = col.get(temp.getKey());
        if (!ret) {
            ret = temp;
            col.add(ret);
            ret.setNumFmtId(this.lastNumberFormatId++);
        }
        return ret.getNumFmtId();
    },
    addFill: function(config) {
        var col = this.getFills(),
            ret;
        if (!col) {
            this.setFills([]);
            col = this.getFills();
        }
        ret = col.add(config);
        return col.indexOf(ret);
    },
    addBorder: function(config) {
        var col = this.getBorders(),
            ret;
        if (!col) {
            this.setBorders([]);
            col = this.getBorders();
        }
        ret = col.add(config);
        return col.indexOf(ret);
    },
    addCellXf: function(config) {
        var col = this.getCellXfs(),
            ret;
        if (!col) {
            this.setCellXfs([]);
            col = this.getCellXfs();
        }
        ret = col.add(config);
        return col.indexOf(ret);
    },
    addCellStyleXf: function(config) {
        var col = this.getCellStyleXfs(),
            ret;
        if (!col) {
            this.setCellStyleXfs([]);
            col = this.getCellStyleXfs();
        }
        ret = col.add(config);
        return col.indexOf(ret);
    },
    getStyleParams: function(style) {
        var me = this,
            s = new Ext.exporter.file.Style(style),
            cfg = s.getConfig(),
            numFmtId = 0,
            fontId = 0,
            fillId = 0,
            borderId = 0,
            xfId = 0;
        cfg.parentId = style ? style.parentId : null;
        if (cfg.font) {
            fontId = me.addFont(cfg.font);
        }
        if (cfg.format) {
            numFmtId = me.getNumberFormatId(cfg.format);
        }
        if (cfg.interior) {
            fillId = me.addFill(cfg.interior);
        }
        if (cfg.borders) {
            borderId = me.getBorderId(cfg.borders);
        }
        if (cfg.parentId) {
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
    addStyle: function(style) {
        return this.addCellStyleXf(this.getStyleParams(style));
    },
    /**
     * Add a cell specific style.
     *
     * @param {Ext.exporter.file.Style} style
     * @return The index of the newly added {Ext.exporter.file.ooxml.excel.CellXf} object
     */
    addCellStyle: function(style) {
        return this.addCellXf(this.getStyleParams(style));
    },
    getNumberFormatId: function(f) {
        var me = this,
            isDate = !!me.datePatterns[f],
            id, code;
        if (f === 'General') {
            return 0;
        }
        code = me.datePatterns[f] || me.booleanPatterns[f] || me.numberPatterns[f];
        if (Ext.isNumeric(code)) {
            id = code;
        } else if (!code) {
            code = f;
        }
        return id || me.addNumberFormat({
            isDate: isDate,
            formatCode: code
        });
    },
    getBorderId: function(borders) {
        var cfg = {},
            len = borders.length,
            i, b, key;
        for (i = 0; i < len; i++) {
            b = borders[i];
            key = Ext.util.Format.lowercase(b.position);
            delete (b.position);
            cfg[key] = b;
        }
        return this.addBorder(cfg);
    }
});

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
            utf8: function(v) {
                return Ext.util.Base64._utf8_encode(v);
            }
        }
    ],
    destroy: function() {
        this.setStrings(null);
        this.callParent();
    },
    addString: function(value) {
        var v = Ext.util.Format.htmlEncode(value),
            s = this.getStrings(),
            index = Ext.Array.indexOf(s, v);
        if (index < 0) {
            s.push(v);
            index = s.length - 1;
        }
        return index;
    }
});

/**
 * @private
 */
Ext.define('Ext.exporter.file.ooxml.excel.Workbook', {
    extend: 'Ext.exporter.file.ooxml.Base',
    requires: [
        'Ext.exporter.file.ooxml.Relationships',
        'Ext.exporter.file.ooxml.excel.Worksheet',
        'Ext.exporter.file.ooxml.excel.Stylesheet',
        'Ext.exporter.file.ooxml.excel.SharedStrings'
    ],
    isWorkbook: true,
    currentIndex: 1,
    config: {
        relationships: {
            contentType: {
                contentType: 'application/vnd.openxmlformats-package.relationships+xml',
                partName: '/xl/_rels/workbook.xml.rels'
            },
            path: '/xl/_rels/workbook.xml.rels'
        },
        stylesheet: {},
        sharedStrings: {},
        sheets: []
    },
    contentType: {
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml',
        partName: '/xl/workbook.xml'
    },
    relationship: {
        schema: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument',
        target: 'xl/workbook.xml'
    },
    path: '/xl/workbook.xml',
    tpl: [
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
        '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" ',
        'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">',
        '<sheets>',
        '<tpl if="sheets"><tpl for="sheets.getRange()"><sheet name="{[values.getName()]}" sheetId="{[xindex]}" state="visible" r:id="{[values.getRelationship().getId()]}"/></tpl></tpl>',
        '</sheets>',
        '</workbook>'
    ],
    destroy: function() {
        var me = this;
        me.setRelationships(Ext.destroy(me.getRelationships()));
        me.setStylesheet(Ext.destroy(me.getStylesheet()));
        me.setSharedStrings(Ext.destroy(me.getSharedStrings()));
        me.callParent();
        me.setSheets(null);
    },
    collectFiles: function(files) {
        var me = this,
            style = me.getStylesheet(),
            strings = me.getSharedStrings(),
            ws, i, length;
        files[me.getPath()] = me.render();
        files[style.getPath()] = style.render();
        files[strings.getPath()] = strings.render();
        ws = me.getSheets();
        length = ws.length;
        for (i = 0; i < length; i++) {
            ws.getAt(i).collectFiles(files);
        }
        me.getRelationships().collectFiles(files);
    },
    /**
     * Convenience method to add worksheets.
     * @param {Object/Array} config
     * @return {Ext.exporter.file.ooxml.excel.Worksheet/Ext.exporter.file.ooxml.excel.Worksheet[]}
     */
    addWorksheet: function(config) {
        var ws = Ext.Array.from(config),
            length = ws.length,
            i, w;
        for (i = 0; i < length; i++) {
            w = ws[i];
            if (w && !w.isWorksheet) {
                ws[i] = new Ext.exporter.file.ooxml.excel.Worksheet(w);
            }
        }
        return this.getSheets().add(ws);
    },
    /**
     * Convenience method to remove worksheets.
     * @param {Object/Array} config
     * @return {Ext.exporter.file.ooxml.excel.Worksheet/Ext.exporter.file.ooxml.excel.Worksheet[]}
     */
    removeWorksheet: function(config) {
        return this.getSheets().remove(config);
    },
    /**
     * @return {Ext.exporter.file.ooxml.ContentType[]}
     */
    getContentTypes: function() {
        var me = this,
            types = [],
            ws, i, length;
        types.push(me.getContentType());
        types.push(me.getStylesheet().getContentType());
        types.push(me.getSharedStrings().getContentType());
        ws = me.getSheets();
        length = ws.length;
        for (i = 0; i < length; i++) {
            types.push(ws.getAt(i).getContentType());
        }
        return types;
    },
    applyRelationships: function(data) {
        if (!data || data.isRelationships) {
            return data;
        }
        return new Ext.exporter.file.ooxml.Relationships(data);
    },
    applyStylesheet: function(data) {
        if (!data || data.isStylesheet) {
            return data;
        }
        return new Ext.exporter.file.ooxml.excel.Stylesheet();
    },
    updateStylesheet: function(data, oldData) {
        var rels = this.getRelationships();
        if (oldData && rels) {
            rels.removeRelationship(oldData.getRelationship());
        }
        if (data && rels) {
            rels.addRelationship(data.getRelationship());
        }
    },
    applySharedStrings: function(data) {
        if (!data || data.isSharedStrings) {
            return data;
        }
        return new Ext.exporter.file.ooxml.excel.SharedStrings();
    },
    updateSharedStrings: function(data, oldData) {
        var rels = this.getRelationships();
        if (oldData && rels) {
            rels.removeRelationship(oldData.getRelationship());
        }
        if (data) {
            rels.addRelationship(data.getRelationship());
        }
    },
    applySheets: function(data, dataCollection) {
        return this.checkCollection(data, dataCollection, 'Ext.exporter.file.ooxml.excel.Sheet');
    },
    updateSheets: function(collection, oldCollection) {
        var me = this;
        if (oldCollection) {
            oldCollection.un({
                add: me.onSheetAdd,
                remove: me.onSheetRemove,
                scope: me
            });
        }
        if (collection) {
            collection.on({
                add: me.onSheetAdd,
                remove: me.onSheetRemove,
                scope: me
            });
        }
    },
    onSheetAdd: function(collection, details) {
        var rels = this.getRelationships(),
            length = details.items.length,
            i, item;
        for (i = 0; i < length; i++) {
            item = details.items[i];
            item.setIndex(this.currentIndex++);
            item.setWorkbook(this);
            rels.addRelationship(item.getRelationship());
        }
    },
    onSheetRemove: function(collection, details) {
        var rels = this.getRelationships(),
            length = details.items.length,
            i, item;
        for (i = 0; i < length; i++) {
            item = details.items[i];
            rels.removeRelationship(item.getRelationship());
            Ext.destroy(item);
        }
    },
    /**
     * Convenience method to add a style.
     *
     * @param {Ext.exporter.file.Style} config
     * @return {Number} Index of the cell style
     */
    addStyle: function(config) {
        return this.getStylesheet().addStyle(config);
    }
});

/**
 * @private
 */
Ext.define('Ext.exporter.file.ooxml.ContentTypes', {
    extend: 'Ext.exporter.file.ooxml.Base',
    requires: [
        'Ext.exporter.file.ooxml.ContentType'
    ],
    isContentTypes: true,
    config: {
        contentTypes: [
            {
                tag: 'Default',
                contentType: 'application/vnd.openxmlformats-package.relationships+xml',
                extension: 'rels'
            },
            {
                tag: 'Default',
                contentType: 'application/xml',
                extension: 'xml'
            }
        ]
    },
    tpl: [
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">',
        '<tpl if="contentTypes"><tpl for="contentTypes.getRange()">{[values.render()]}</tpl></tpl>',
        '</Types>'
    ],
    path: '/[Content_Types].xml',
    destroy: function() {
        this.callParent();
        this.setContentTypes(null);
    },
    applyContentTypes: function(data, dataCollection) {
        return this.checkCollection(data, dataCollection, 'Ext.exporter.file.ooxml.ContentType');
    },
    addContentType: function(config) {
        return this.getContentTypes().add(config || {});
    }
});

/**
 * @private
 */
Ext.define('Ext.exporter.file.ooxml.CoreProperties', {
    extend: 'Ext.exporter.file.ooxml.Base',
    isCoreProperties: true,
    config: {
        /**
         * @cfg {String} [title="Workbook"]
         *
         * The name given to the resource.
         */
        title: "Workbook",
        /**
         * @cfg {String} [author="Sencha"]
         *
         * An entity primarily responsible for making the content of the resource.
         */
        author: 'Sencha',
        /**
         * @cfg {String} [subject=""]
         *
         * The topic of the content of the resource.
         */
        subject: ''
    },
    contentType: {
        contentType: 'application/vnd.openxmlformats-package.core-properties+xml',
        partName: '/docProps/core.xml'
    },
    relationship: {
        schema: 'http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties',
        target: 'docProps/core.xml'
    },
    path: '/docProps/core.xml',
    tpl: [
        '<coreProperties xmlns="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" ',
        'xmlns:dcterms="http://purl.org/dc/terms/" ',
        'xmlns:dc="http://purl.org/dc/elements/1.1/" ',
        'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">',
        '   <dc:creator>{author}</dc:creator>',
        '   <dc:title>{title}</dc:title>',
        '   <dc:subject>{subject}</dc:subject>',
        '</coreProperties>'
    ]
});

/**
 * An Office Open XML SpreasheetML implementation according to the [ISO/IEC 29500-1:2012][1].
 *
 * [1]: http://www.iso.org/iso/home/store/catalogue_ics/catalogue_detail_ics.htm?csnumber=61750
 *
 * Only a small subset of that standard is implemented.
 *
 * @private
 */
Ext.define('Ext.exporter.file.ooxml.Excel', {
    extend: 'Ext.exporter.file.ooxml.Base',
    requires: [
        'Ext.exporter.file.zip.Archive',
        'Ext.exporter.file.ooxml.excel.Workbook',
        'Ext.exporter.file.ooxml.Relationships',
        'Ext.exporter.file.ooxml.ContentTypes',
        'Ext.exporter.file.ooxml.CoreProperties'
    ],
    config: {
        relationships: {
            path: '/_rels/.rels'
        },
        /**
         * @cfg {Ext.exporter.file.ooxml.CoreProperties} [properties]
         *
         * Core properties of the Excel file
         */
        properties: null,
        workbook: {}
    },
    tpl: [],
    constructor: function(config) {
        var ret = this.callParent([
                config
            ]);
        if (!this.getWorkbook()) {
            this.setWorkbook({});
        }
        return ret;
    },
    destroy: function() {
        var me = this;
        me.setWorkbook(Ext.destroy(me.getWorkbook()));
        me.setProperties(Ext.destroy(me.getProperties()));
        me.setRelationships(Ext.destroy(me.getRelationships()));
        me.callParent();
    },
    render: function() {
        var files = {},
            paths, path, content, i, len, zip;
        this.collectFiles(files);
        // zip all files and return the zip content
        paths = Ext.Object.getKeys(files);
        len = paths.length;
        if (!len) {
            return;
        }
        zip = new Ext.exporter.file.zip.Archive();
        for (i = 0; i < len; i++) {
            path = paths[i];
            content = files[path];
            path = path.substr(1);
            if (path.indexOf('.xml') !== -1 || path.indexOf('.rel') !== -1) {
                zip.addFile({
                    path: path,
                    data: content
                });
            }
        }
        content = zip.getContent();
        zip = Ext.destroy(zip);
        return content;
    },
    collectFiles: function(files) {
        var contentTypes = new Ext.exporter.file.ooxml.ContentTypes(),
            wb = this.getWorkbook(),
            props = this.getProperties();
        wb.collectFiles(files);
        if (props) {
            contentTypes.addContentType(props.getContentType());
            files[props.getPath()] = props.render();
        }
        contentTypes.addContentType(wb.getContentTypes());
        files[contentTypes.getPath()] = contentTypes.render();
        Ext.destroy(contentTypes);
        this.getRelationships().collectFiles(files);
    },
    applyProperties: function(data) {
        if (!data || data.isCoreProperties) {
            return data;
        }
        return new Ext.exporter.file.ooxml.CoreProperties(data);
    },
    updateProperties: function(data, oldData) {
        var rels = this.getRelationships();
        if (oldData) {
            rels.removeRelationship(oldData.getRelationship());
        }
        if (data) {
            rels.addRelationship(data.getRelationship());
        }
    },
    applyRelationships: function(data) {
        if (!data || data.isRelationships) {
            return data;
        }
        return new Ext.exporter.file.ooxml.Relationships(data);
    },
    applyWorkbook: function(data) {
        if (!data || data.isWorkbook) {
            return data;
        }
        return new Ext.exporter.file.ooxml.excel.Workbook(data);
    },
    updateWorkbook: function(data, oldData) {
        var rels = this.getRelationships();
        if (oldData) {
            rels.removeRelationship(oldData.getRelationship());
        }
        if (data) {
            rels.addRelationship(data.getRelationship());
        }
    },
    /**
     * Convenience method to add worksheets.
     *
     * @param {Object/Array} config
     * @return {Ext.exporter.file.ooxml.excel.Worksheet/Ext.exporter.file.ooxml.excel.Worksheet[]}
     */
    addWorksheet: function(config) {
        return this.getWorkbook().addWorksheet(config);
    },
    /**
     * Convenience method to add a style.
     *
     * @param {Ext.exporter.file.Style} config
     * @return {Number} Index of the cell style
     */
    addStyle: function(config) {
        return this.getWorkbook().getStylesheet().addStyle(config);
    },
    /**
     * Convenience method to add a style.
     *
     * @param {Ext.exporter.file.Style} config
     * @return {Number} Index of the cell style
     */
    addCellStyle: function(config) {
        return this.getWorkbook().getStylesheet().addCellStyle(config);
    }
});

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
            borders: [
                {
                    position: 'Bottom',
                    lineStyle: 'Continuous',
                    weight: 1,
                    color: '#4F81BD'
                }
            ]
        },
        /**
         * @cfg {Ext.exporter.file.excel.Style} groupFooterStyle
         *
         * Default style applied to the group footers
         */
        groupFooterStyle: {
            borders: [
                {
                    position: 'Top',
                    lineStyle: 'Continuous',
                    weight: 1,
                    color: '#4F81BD'
                }
            ]
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
            borders: [
                {
                    position: 'Bottom',
                    lineStyle: 'Continuous',
                    weight: 1,
                    color: '#4F81BD'
                }
            ],
            font: {
                fontName: 'Arial',
                family: 'Swiss',
                size: 11,
                color: '#1F497D'
            }
        }
    },
    fileName: 'export.xlsx',
    destroy: function() {
        var me = this;
        me.excel = me.worksheet = Ext.destroy(me.excel, me.worksheet);
        me.callParent();
    },
    delayedSave: function(resolve) {
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
        if (data) {
            me.buildHeader();
            me.buildRows(data.getGroups(), colMerge, 0);
        }
        me.columnStylesNormal = me.columnStylesNormalId = me.columnStylesFooter = me.columnStylesFooterId = null;
        return me.excel.render();
    },
    addTitle: function(config, colMerge) {
        if (!Ext.isEmpty(config.title)) {
            this.worksheet.addRow({
                height: 22.5
            }).addCell({
                mergeAcross: colMerge - 1,
                value: config.title,
                styleId: this.excel.addCellStyle(config.titleStyle)
            });
        }
    },
    buildRows: function(groups, colMerge, level) {
        var me = this,
            showSummary = me.getShowSummary(),
            g, row, styleH, styleF, cells, i, j, k, gLen, sLen, cLen, oneLine;
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
            if (showSummary !== false && !Ext.isEmpty(g.text) && !oneLine) {
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
            if (g.summaries && (showSummary || oneLine)) {
                sLen = g.summaries.length;
                for (k = 0; k < sLen; k++) {
                    // that's the summary footer
                    row = me.worksheet.addRow();
                    cells = g.summaries.getAt(k).getCells();
                    cLen = cells.length;
                    for (j = 0; j < cLen; j++) {
                        row.addCell(cells.getAt(j).getConfig()).setStyleId(oneLine ? me.columnStylesNormalId[j] : (j === 0 ? styleF : me.columnStylesFooterId[j]));
                    }
                }
            }
        }
    },
    buildGroupRows: function(rows) {
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
    buildHeader: function() {
        var me = this,
            ret = {},
            data = me.getData(),
            keys, row, i, j, len, lenCells, style, arr, fStyle, col, colCfg;
        me.buildHeaderRows(data.getColumns(), ret);
        keys = Ext.Object.getKeys(ret);
        len = keys.length;
        for (i = 0; i < len; i++) {
            row = me.worksheet.addRow({
                height: 20.25,
                autoFitHeight: 1,
                styleId: me.tableHeaderStyleId
            });
            arr = ret[keys[i]];
            lenCells = arr.length;
            for (j = 0; j < lenCells; j++) {
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
        for (j = 0; j < lenCells; j++) {
            col = arr[j];
            colCfg = {
                style: col.getStyle(),
                width: col.getWidth()
            };
            style = Ext.applyIf({
                parentId: 0
            }, fStyle);
            style = Ext.merge(style, colCfg.style);
            me.columnStylesFooter.push(style);
            me.columnStylesFooterId.push(me.excel.addCellStyle(style));
            style = Ext.applyIf({
                parentId: 0
            }, colCfg.style);
            me.columnStylesNormal.push(style);
            colCfg.styleId = me.excel.addCellStyle(style);
            me.columnStylesNormalId.push(colCfg.styleId);
            colCfg.min = colCfg.max = j + 1;
            colCfg.style = null;
            if (colCfg.width) {
                colCfg.width = colCfg.width / 10;
            }
            me.worksheet.addColumn(colCfg);
        }
    },
    buildHeaderRows: function(columns, result) {
        var col, cols, i, len, name;
        if (!columns) {
            return;
        }
        len = columns.length;
        for (i = 0; i < len; i++) {
            col = columns.getAt(i).getConfig();
            col.value = col.text;
            cols = col.columns;
            delete (col.columns);
            delete (col.table);
            name = 's' + col.level;
            result[name] = result[name] || [];
            result[name].push(col);
            this.buildHeaderRows(cols, result);
        }
    }
});

/**
 * This is the base class for an exporter plugin. It is extended by the exporter plugins
 * for grid panel and pivot grid.
 *
 * This could be used to create a plugin that allows a component to export tabular data.
 *
 * @private
 */
Ext.define('Ext.exporter.Plugin', {
    extend: 'Ext.AbstractPlugin',
    alias: [
        'plugin.exporterplugin'
    ],
    requires: [
        'Ext.Promise',
        'Ext.exporter.data.Table',
        'Ext.exporter.Excel'
    ],
    /**
     * @event beforedocumentsave
     * Fires on the component before a document is exported and saved.
     * @param {Ext.Component} component Reference to the component that uses this plugin
     */
    /**
     * @event documentsave
     * Fires on the component whenever a document is exported and saved.
     * @param {Ext.Component} component Reference to the component that uses this plugin
     */
    /**
     * @event dataready
     * Fires on the component when the {Ext.exporter.data.Table data object} is ready.
     * You could adjust styles or data before the document is generated and saved.
     * @param {Ext.Component} component Reference to the component that uses this plugin
     * @param {Object} config Config object passed to the saveDocumentAs method
     */
    /**
     * Plugin initialization
     *
     * @param cmp
     * @return {Ext.exporter.Plugin}
     * @private
     */
    init: function(cmp) {
        var me = this;
        cmp.saveDocumentAs = Ext.bind(me.saveDocumentAs, me);
        cmp.getDocumentData = Ext.bind(me.getDocumentData, me);
        me.cmp = cmp;
        return me.callParent([
            cmp
        ]);
    },
    destroy: function() {
        var me = this;
        me.cmp.saveDocumentAs = me.cmp.getDocumentData = me.cmp = null;
        me.callParent();
    },
    /**
     * Save the export file. This method is added to the component as "saveDocumentAs".
     *
     * Pass in exporter specific configs to the config parameter.
     *
     * @param {Ext.exporter.Base} config Config object used to initialize the proper exporter
     * @param {String} config.type Type of the exporter as defined in the exporter alias. Default is `excel`.
     * @param {String} [config.title] Title added to the export document
     * @param {String} [config.author] Who exported the document?
     * @param {String} [config.fileName] Name of the exported file, including the extension
     * @param {String} [config.charset] Exported file's charset
     *
     * @return {Ext.Promise}
     *
     */
    saveDocumentAs: function(config) {
        var me = this;
        me.cmp.fireEvent('beforedocumentsave', me.cmp);
        return new Ext.Promise(function(resolve, reject) {
            Ext.asap(me.delayedSave, me, [
                config,
                resolve,
                reject
            ]);
        });
    },
    /**
     * Delayed function that exports the document
     *
     * @param config
     * @param resolve
     * @param reject
     *
     * @private
     */
    delayedSave: function(config, resolve, reject) {
        var me = this,
            cmp = me.cmp,
            exporter;
        // the plugin might be disabled or the component is already destroyed
        if (me.disabled || !cmp) {
            reject();
            return;
        }
        exporter = me.getExporter(config);
        cmp.fireEvent('dataready', cmp, exporter.getData());
        exporter.saveAs().then(function() {
            Ext.destroy(exporter);
            // since this call is async the cmp might have been destroyed already.
            if (!cmp) {
                reject();
                return;
            }
            cmp.fireEvent('documentsave', cmp);
            resolve(config);
        });
    },
    /**
     * Fetch the export data. This method is added to the component as "getDocumentData".
     *
     * Pass in exporter specific configs to the config parameter.
     *
     * @param {Ext.exporter.Base} config Config object used to initialize the proper exporter
     * @param {String} [config.type] Type of the exporter as defined in the exporter alias. Default is `excel`.
     * @param {String} [config.title] Title added to the export document
     * @param {String} [config.author] Who exported the document?
     * @return {String}
     *
     */
    getDocumentData: function(config) {
        var exporter, ret;
        if (this.disabled) {
            return;
        }
        exporter = this.getExporter(config);
        ret = exporter.getContent();
        Ext.destroy(exporter);
        return ret;
    },
    /**
     * Builds the exporter object and returns it.
     *
     * @param {Object} config
     * @return {Ext.exporter.Base}
     *
     * @private
     */
    getExporter: function(config) {
        var cfg = Ext.apply({
                type: 'excel'
            }, config);
        cfg.data = this.prepareData(config);
        return Ext.Factory.exporter(cfg);
    },
    /**
     *
     * @param {Object/Array} style
     * @param {Object} config Configuration passed to saveDocumentAs and getDocumentData methods
     * @return {Object}
     */
    getExportStyle: function(style, config) {
        var type = (config && config.type),
            types, def, index;
        if (Ext.isArray(style)) {
            types = Ext.Array.pluck(style, 'type');
            index = Ext.Array.indexOf(types, undefined);
            if (index >= 0) {
                // we found a default style which means that all others are exceptions
                def = style[index];
            }
            index = Ext.Array.indexOf(types, type);
            return index >= 0 ? style[index] : def;
        } else {
            return style;
        }
    },
    /**
     * This method creates the data object that will be consumed by the exporter.
     * @param {Object} config The config object passed to the getDocumentData and saveDocumentAs methods
     * @return {Ext.exporter.data.Table}
     *
     * @private
     */
    prepareData: Ext.emptyFn
});

/**
 * This class is used to create an xml Excel Worksheet
 */
Ext.define('Ext.exporter.file.excel.Worksheet', {
    extend: 'Ext.exporter.file.Base',
    config: {
        /**
         * @cfg {String} name (required)
         *
         * This value must be unique within the list of sheet names in the workbook. Sheet names must conform to
         * the legal names of Excel sheets and, thus, cannot contain /, \, ?, *, [, ] and are limited to 31 chars.
         */
        name: 'Sheet',
        /**
         * @cfg {Boolean} protection
         *
         * This attribute indicates whether or not the worksheet is protected. When the worksheet is
         * not protected, cell-level protection has no effect.
         */
        protection: null,
        /**
         * @cfg {Boolean} rightToLeft
         *
         * If this attribute is `true`, the window displays from right to left, but if this element is not
         * specified (or `false`), the window displays from left to right. The Spreadsheet component does not
         * support this attribute.
         */
        rightToLeft: null,
        /**
         * @cfg {Boolean} [showGridLines=true]
         *
         * Should grid lines be visible in this spreadsheet?
         */
        showGridLines: true,
        /**
         * @cfg {Ext.exporter.file.excel.Table[]} tables
         *
         * Collection of tables available in this worksheet
         */
        tables: []
    },
    /**
     * @method getTables
     * @return {Ext.util.Collection}
     *
     * Returns the collection of tables available in this worksheet
     */
    tpl: [
        '   <Worksheet ss:Name="{name:htmlEncode}"',
        '<tpl if="this.exists(protection)"> ss:Protected="{protection:this.toNumber}"</tpl>',
        '<tpl if="this.exists(rightToLeft)"> ss:RightToLeft="{rightToLeft:this.toNumber}"</tpl>',
        '>\n',
        '<tpl if="tables"><tpl for="tables.getRange()">{[values.render()]}</tpl></tpl>',
        '       <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">\n',
        '          <PageSetup>\n',
        '              <Layout x:CenterHorizontal="1" x:Orientation="Portrait" />\n',
        '              <Header x:Margin="0.3" />\n',
        '              <Footer x:Margin="0.3" x:Data="Page &amp;P of &amp;N" />\n',
        '              <PageMargins x:Bottom="0.75" x:Left="0.7" x:Right="0.7" x:Top="0.75" />\n',
        '          </PageSetup>\n',
        '          <FitToPage />\n',
        '          <Print>\n',
        '              <PrintErrors>Blank</PrintErrors>\n',
        '              <FitWidth>1</FitWidth>\n',
        '              <FitHeight>32767</FitHeight>\n',
        '              <ValidPrinterInfo />\n',
        '              <VerticalResolution>600</VerticalResolution>\n',
        '          </Print>\n',
        '          <Selected />\n',
        '<tpl if="!showGridLines">',
        '          <DoNotDisplayGridlines />\n',
        '</tpl>',
        '          <ProtectObjects>False</ProtectObjects>\n',
        '          <ProtectScenarios>False</ProtectScenarios>\n',
        '      </WorksheetOptions>\n',
        '   </Worksheet>\n',
        {
            exists: function(value) {
                return !Ext.isEmpty(value);
            },
            toNumber: function(value) {
                return Number(Boolean(value));
            }
        }
    ],
    destroy: function() {
        this.callParent();
        this.setTables(null);
    },
    applyTables: function(data, dataCollection) {
        return this.checkCollection(data, dataCollection, 'Ext.exporter.file.excel.Table');
    },
    /**
     * Convenience method to add tables. You can also use workbook.getTables().add(config).
     * @param {Object/Array} config
     * @return {Ext.exporter.file.excel.Table/Ext.exporter.file.excel.Table[]}
     */
    addTable: function(config) {
        return this.getTables().add(config || {});
    },
    /**
     * Convenience method to fetch a table by its id.
     * @param id
     * @return {Ext.exporter.file.excel.Table}
     */
    getTable: function(id) {
        return this.getTables().get(id);
    },
    applyName: function(value) {
        // Excel limits the worksheet name to 31 chars
        return Ext.String.ellipsis(String(value), 31);
    }
});

/**
 * This class is used to create an xml Excel Table
 */
Ext.define('Ext.exporter.file.excel.Table', {
    extend: 'Ext.exporter.file.Base',
    config: {
        /**
         * This attribute specifies the total number of columns in this table. If specified, this attribute
         * must be in sync with the table. Columns indices in the table should begin at 1 and go to
         * ExpandedColumnCount. If this value is out-of-sync with the table, the specified XML Spreadsheet
         * document is invalid.
         *
         * @private
         */
        expandedColumnCount: null,
        /**
         * Specifies the total number of rows in this table without regard for sparseness. This attribute defines
         * the overall size of the table, if the specified rows and columns were expanded to full size.
         * If specified, this attribute must be in sync with the table. Row indices in the table should begin
         * at 1 and go to ExpandedRowCount. If this value is out-of-sync with the table, the specified XML
         * Spreadsheet document is invalid.
         *
         * @private
         */
        expandedRowCount: null,
        /**
         * WebCalc will set x:FullColumns to 1 when the data in the table represents full columns of data.
         * Excel will save x:FullColumns to 1 if the Table extends the full height. This attribute is ignored
         * on file load, but on XML Spreadsheet paste it is taken to indicate that the source clip has full columns.
         *
         * @private
         */
        fullColumns: 1,
        /**
         * WebCalc will set x:FullRows to 1 when the data in the table represents full rows of data. Excel will
         * save x:FullRows to 1 if the Table extends the full width. This attribute is ignored on file load, but on
         * XML Spreadsheet paste it is taken to indicate that the source clip has full rows.
         *
         * @private
         */
        fullRows: 1,
        /**
         * @cfg {Number} [defaultColumnWidth=48]
         *
         * Specifies the default width of columns in this table. This attribute is specified in points.
         */
        defaultColumnWidth: 48,
        /**
         * @cfg {Number} [defaultRowHeight=12.75]
         *
         * Specifies the default height of rows in this table. This attribute is specified in points.
         */
        defaultRowHeight: 12.75,
        /**
         * @cfg {String} styleId
         *
         * Excel style attached to this table
         */
        styleId: null,
        /**
         * @cfg {Number} [leftCell=1]
         *
         * Specifies the column index that this table should be placed at. This value must be greater than zero.
         */
        leftCell: 1,
        /**
         * @cfg {Number} [topCell=1]
         *
         * Specifies the row index that this table should be placed at. This value must be greater than zero.
         */
        topCell: 1,
        /**
         * @cfg {Ext.exporter.file.excel.Column[]} columns
         *
         * Collection of column definitions available on this table
         */
        columns: [],
        /**
         * @cfg {Ext.exporter.file.excel.Row[]} rows
         *
         * Collection of row definitions available on this table
         */
        rows: []
    },
    /**
     * @method getColumns
     * @return {Ext.util.Collection}
     *
     * Returns the collection of columns available in this table
     */
    /**
     * @method getRows
     * @return {Ext.util.Collection}
     *
     * Returns the collection of rows available in this table
     */
    tpl: [
        '       <Table x:FullColumns="{fullColumns}" x:FullRows="{fullRows}"',
        '<tpl if="this.exists(expandedRowCount)"> ss:ExpandedRowCount="{expandedRowCount}"</tpl>',
        '<tpl if="this.exists(expandedColumnCount)"> ss:ExpandedColumnCount="{expandedColumnCount}"</tpl>',
        '<tpl if="this.exists(defaultRowHeight)"> ss:DefaultRowHeight="{defaultRowHeight}"</tpl>',
        '<tpl if="this.exists(defaultColumnWidth)"> ss:DefaultColumnWidth="{defaultColumnWidth}"</tpl>',
        '<tpl if="this.exists(leftCell)"> ss:LeftCell="{leftCell}"</tpl>',
        '<tpl if="this.exists(topCell)"> ss:TopCell="{topCell}"</tpl>',
        '<tpl if="this.exists(styleId)"> ss:StyleID="{styleId}"</tpl>',
        '>\n',
        '<tpl if="columns"><tpl for="columns.getRange()">{[values.render()]}</tpl></tpl>',
        '<tpl if="rows">',
        '<tpl for="rows.getRange()">{[values.render()]}</tpl>',
        '<tpl else>         <Row ss:AutoFitHeight="0"/>\n</tpl>',
        '       </Table>\n',
        {
            exists: function(value) {
                return !Ext.isEmpty(value);
            }
        }
    ],
    destroy: function() {
        this.callParent();
        this.setColumns(null);
        this.setRows(null);
    },
    applyColumns: function(data, dataCollection) {
        return this.checkCollection(data, dataCollection, 'Ext.exporter.file.excel.Column');
    },
    applyRows: function(data, dataCollection) {
        return this.checkCollection(data, dataCollection, 'Ext.exporter.file.excel.Row');
    },
    /**
     * Convenience method to add columns. You can also use workbook.getColumns().add(config).
     * @param {Object/Array} config
     * @return {Ext.exporter.file.excel.Column/Ext.exporter.file.excel.Column[]}
     */
    addColumn: function(config) {
        return this.getColumns().add(config || {});
    },
    /**
     * Convenience method to fetch a column by its id.
     * @param id
     * @return {Ext.exporter.file.excel.Column}
     */
    getColumn: function(id) {
        return this.getColumns().get(id);
    },
    /**
     * Convenience method to add rows. You can also use workbook.getRows().add(config).
     * @param {Object/Array} config
     * @return {Ext.exporter.file.excel.Row/Ext.exporter.file.excel.Row[]}
     */
    addRow: function(config) {
        return this.getRows().add(config || {});
    },
    /**
     * Convenience method to fetch a row by its id.
     * @param id
     * @return {Ext.exporter.file.excel.Row}
     */
    getRow: function(id) {
        return this.getRows().get(id);
    }
});

/**
 * This class defines a single style in the current workbook. This element is optional,
 * but is required to perform any custom formatting.
 *
 *
 * A style can be either standalone or based on one other style (this is called the parent style), in which case,
 * all base properties are first inherited from the parent, then the properties in the style are treated as overrides.
 * Parent styles must be specified before they are first referenced.
 */
Ext.define('Ext.exporter.file.excel.Style', {
    extend: 'Ext.exporter.file.Style',
    config: {
        /**
         * @cfg {String} id
         * A unique name within this XML document that identifies this style. This string can be any valid
         * identifier and there is no notion of order. The special value of "Default" indicates that this style
         * represents the default formatting for this workbook.
         *
         */
        /**
         * @cfg {String} [parentId]
         *
         * Presence of this element indicates that this style should first inherit it's default formatting settings
         * from the specified parent style. Then, after the parent settings are inherited, we apply the settings in
         * this style as overrides. This attribute refers to a predefined style ID.
         *
         */
        parentId: null,
        /**
         * @cfg {String} [name]
         *
         * This property identifies this style as a named style that was created in Excel using the Style
         * command (Format menu). Duplicate names are illegal.
         *
         */
        /**
         * @cfg {Object} [protection]
         *
         * Defines the protection properties that should be used in cells referencing this style.
         * This element exists as a short-hand way to apply protection to an entire table, row, or column, by simply adding it to a style.
         *
         * Following keys are allowed on this object and are all optional:
         *
         * @cfg {Boolean} protection.protected
         * This attribute indicates whether or not this cell is protected. When the worksheet is
         * unprotected, cell-level protection has no effect. When a cell is protected, it will not allow the user to
         * enter information into it. Defaults to `true`.
         *
         * @cfg {Boolean} protection.hideFormula
         * This attribute indicates whether or not this cell's formula should be hidden when
         * worksheet protection is enabled. Defaults to `false`.
         *
         */
        protection: null
    },
    /**
         * @cfg {Object} [alignment]
         *
         * Following keys are allowed on this object and are all optional:
         *
         * @cfg {String} alignment.horizontal
         * Specifies the left-to-right alignment of text within a cell. The Spreadsheet component
         * does not support `CenterAcrossSelection`, `Fill`, `Justify`, `Distributed`, and `JustifyDistributed`.
         * Possible values: `Automatic`, `Left`, `Center`, `Right`, `Fill`, `Justify`, `CenterAcrossSelection`, `Distributed`,
         * and `JustifyDistributed`. Default is `Automatic`.
         *
         * @cfg {Number} alignment.indent
         * Specifies the number of indents. This attribute is not supported by the Spreadsheet component.
         * Defaults to `0`.
         *
         * @cfg {String} alignment.readingOrder
         * Specifies the default right-to-left text entry mode for a cell. The Spreadsheet component
         * does not support `Context`. Possible values: `RightToLeft`, `LeftToRight`, and `Context`. Defaults to `Context`.
         *
         * @cfg {Number} alignment.rotate
         * Specifies the rotation of the text within the cell. `90` is straight up, `0` is horizontal,
         * and `-90` is straight down. The Spreadsheet component does not support this attribute. Defaults to `0`.
         *
         * @cfg {Boolean} alignment.shrinkToFit
         * `true` means that the text size should be shrunk so that all of the text fits within the cell.
         * `false` means that the font within the cell should behave normally. The Spreadsheet component does not support this attribute.
         * Defaults to `false`.
         *
         * @cfg {String} alignment.vertical
         * Specifies the top-to-bottom alignment of text within a cell. `Distributed` and
         * `JustifyDistributed` are only legitimate values when **VerticalText** is `1`. The Spreadsheet component does
         * not support `Justify`, `Distributed`, or `JustifyDistributed`. Possible values: `Automatic`, `Top`, `Bottom`,
         * `Center`, `Justify`, `Distributed`, and `JustifyDistributed`. Defaults to `Automatic`.
         *
         * @cfg {Boolean} alignment.verticalText
         * `true` specifies whether the text is drawn "downwards", whereby each letter is drawn horizontally,
         * one above the other. The Spreadsheet component does not support this attribute. Defaults to `false`.
         *
         * @cfg {Boolean} alignment.wrapText
         * Specifies whether the text in this cell should wrap at the cell boundary. `false` means that
         * text either spills or gets truncated at the cell boundary (depending on whether the adjacent cell(s) have content).
         * The Spreadsheet component does not support this attribute. Defaults to `false`.
         *
         */
    /**
         * @cfg {Object} [font]
         * Defines the font attributes to use in this style. Each attribute that is specified is
         * considered an override from the default.
         *
         *
         * Following keys are allowed on this object:
         *
         * @cfg {Boolean} font.bold
         * Specifies the bold state of the font. If the parent style has **Bold**: `true` and the child style wants
         * to override the setting, it must explicitly set the value to **Bold**: `false`. If this attribute is not specified
         * within an element, the default is assumed. Defaults to `false`.
         *
         * @cfg {String} font.color
         * Specifies the color of the font. This value can be either a 6-hexadecimal digit number
         * in "#rrggbb" format or it can be any of the Internet Explorer named colors (including the named Windows colors).
         * This string can also be special value of `Automatic`. This string is case insensitive. If this attribute is not
         * specified within an element, the default is assumed. Defaults to `Automatic`.
         *
         * @cfg {String} font.fontName
         * Specifies the name of the font. This string is case insensitive. If this attribute is
         * not specified within an element, the default is assumed. Defaults to `Arial`.
         *
         * @cfg {Boolean} font.italic
         * Similar to `font.bold` in behavior, this attribute specifies the italic state of the font.
         * If this attribute is not specified within an element, the default is assumed. Defaults to `false`.
         *
         * @cfg {Boolean} font.outline
         * Similar to `font.bold` in behavior, this attribute specifies whether the font is rendered as an
         * outline. This property originates in Macintosh Office, and is not used on Windows. If this attribute is not
         * specified within an element, the default is assumed. The Spreadsheet component does not support this attribute.
         * Defaults to `false`.
         *
         * @cfg {Boolean} font.shadow
         * Similar to `font.bold` in behavior, this attribute specifies whether the font is shadowed.
         * This property originates in Macintosh Office, and is not used on Windows. If this attribute is not
         * specified within an element, the default is assumed. The Spreadsheet component does not support this attribute.
         * Defaults to `false`.
         *
         * @cfg {Number} font.size
         * Specifies the size of the font in points. This value must be strictly greater than 0.
         * If this attribute is not specified within an element, the default is assumed. Defaults to `10`.
         *
         * @cfg {Boolean} font.strikeThrough
         * Similar to `font.bold` in behavior, this attribute specifies the strike-through state
         * of the font. If this attribute is not specified within an element, the default is assumed. The Spreadsheet
         * component does not support this attribute. Defaults to `false`.
         *
         * @cfg {String} font.underline
         * Specifies the underline state of the font. If the parent style is something other than
         * None and a child style wants to override the value, it must explicitly reset the value. If this attribute is
         * not specified within an element, the default is assumed. Possible values: `None`, `Single`, `Double`,
         * `SingleAccounting`, and `DoubleAccounting`. Defaults to `None`.
         *
         * @cfg {String} font.verticalAlign
         * This attribute specifies the subscript or superscript state of the font. If this
         * attribute is not specified within an element, the default is assumed. The Spreadsheet component does not
         * support this attribute. Possible values: `None`, `Subscript`, and `Superscript`. Defaults to `None`.
         *
         * @cfg {Number} font.charSet
         * Win32-dependent character set value. Defaults to `0`.
         *
         * @cfg {String} font.family
         * Win32-dependent font family. Possible values: `Automatic`, `Decorative`, `Modern`,
         * `Roman`, `Script`, and `Swiss`. Defaults to `Automatic`.
         *
         */
    /**
         * @cfg {Object} interior Defines the fill properties to use in this style. Each attribute that is specified is
         * considered an override from the default.
         *
         * Following keys are allowed on this object:
         *
         * @cfg {String} interior.color
         * Specifies the fill color of the cell. This value can be either a 6-hexadecimal digit
         * number in "#rrggbb" format or it can be any of the Internet Explorer named colors (including the named
         * Windows colors). This string can also be special value of `Automatic`. This string is case insensitive.
         * If `interior.pattern`: "Solid", this value is the fill color of the cell. Otherwise, the cell is filled with a blend of
         * `interior.color` and `interior.patternColor`, with the `interior.pattern` attribute choosing the appearance.
         *
         * @cfg {String} interior.pattern
         * Specifies the fill pattern in the cell. The fill pattern determines how to blend the
         * `interior.color` and `interior.patternColor` attributes to produce the cell's appearance. The Spreadsheet component does not
         * support this attribute. Possible values: `None`, `Solid`, `Gray75`, `Gray50`, `Gray25`, `Gray125`, `Gray0625`,
         * `HorzStripe`, `VertStripe`, `ReverseDiagStripe`, `DiagStripe`, `DiagCross`, `ThickDiagCross`,
         * `ThinHorzStripe`, `ThinVertStripe`, `ThinReverseDiagStripe`, `ThinDiagStripe`, `ThinHorzCross`, and
         * `ThinDiagCross`. Defaults to `None`.
         *
         * @cfg {String} interior.patternColor
         * Specifies the secondary fill color of the cell when `interior.pattern` does not equal `Solid`.
         * The Spreadsheet component does not support this attribute. Defaults to `Automatic`.
         *
         */
    /**
         * @cfg {String} format
         *
         * A number format code in the Excel number format syntax. This can also be one of the following values:
         * `General`, `General Number`, `General Date`, `Long Date`, `Medium Date`, `Short Date`, `Long Time`, `Medium Time`,
         * `Short Time`, `Currency`, `Euro Currency`, `Fixed`, `Standard`, `Percent`, `Scientific`, `Yes/No`,
         * `True/False`, or `On/Off`. All special values are the same as the HTML number formats, with the exception
         * of `Currency` and `Euro Currency`.
         *
         * `Currency` is the currency format with two decimal places and red text with parenthesis for negative values.
         *
         * `Euro Currency` is the same as `Currency` using the Euro currency symbol instead.
         *
         */
    /**
         * @cfg {Object[]} borders
         *
         * Array of border objects. Following keys are allowed for border objects:
         *
         * @cfg {String} borders.position
         * Specifies which of the six possible borders this element represents. Duplicate
         * borders are not permitted and are considered invalid. The Spreadsheet component does not support
         * `DiagonalLeft` or `DiagonalRight`. Possible values: `Left`, `Top`, `Right`, `Bottom`, `DiagonalLeft`, and
         * `DiagonalRight`
         *
         * @cfg {String} borders.color
         * Specifies the color of this border. This value can be either a 6-hexadecimal digit
         * number in "#rrggbb" format or it can be any of the Microsoft® Internet Explorer named colors
         * (including the named Microsoft Windows® colors). This string can also be the special value of `Automatic`.
         * This string is case insensitive.
         *
         * @cfg {String} borders.lineStyle
         * Specifies the appearance of this border. The Spreadsheet component does
         * not support `SlantDashDot` and `Double`. Possible values: `None`, `Continuous`, `Dash`, `Dot`, `DashDot`,
         * `DashDotDot`, `SlantDashDot`, and `Double`.
         *
         * @cfg {Number} borders.weight
         * Specifies the weight (or thickness) of this border. This measurement is specified in points,
         * and the following values map to Excel: `0`—Hairline, `1`—Thin, `2`—Medium, `3`—Thick.
         *
         */
    checks: {
        alignment: {
            horizontal: [
                'Automatic',
                'Left',
                'Center',
                'Right',
                'Fill',
                'Justify',
                'CenterAcrossSelection',
                'Distributed',
                'JustifyDistributed'
            ],
            //ReadingOrder: ['LeftToRight', 'RightToLeft', 'Context'],
            shrinkToFit: [
                true,
                false
            ],
            vertical: [
                'Automatic',
                'Top',
                'Bottom',
                'Center',
                'Justify',
                'Distributed',
                'JustifyDistributed'
            ],
            verticalText: [
                true,
                false
            ],
            wrapText: [
                true,
                false
            ]
        },
        font: {
            family: [
                'Automatic',
                'Decorative',
                'Modern',
                'Roman',
                'Script',
                'Swiss'
            ],
            outline: [
                true,
                false
            ],
            shadow: [
                true,
                false
            ],
            underline: [
                'None',
                'Single',
                'Double',
                'SingleAccounting',
                'DoubleAccounting'
            ],
            verticalAlign: [
                'None',
                'Subscript',
                'Superscript'
            ]
        },
        border: {
            position: [
                'Left',
                'Top',
                'Right',
                'Bottom',
                'DiagonalLeft',
                'DiagonalRight'
            ],
            lineStyle: [
                'None',
                'Continuous',
                'Dash',
                'Dot',
                'DashDot',
                'DashDotDot',
                'SlantDashDot',
                'Double'
            ],
            weight: [
                0,
                1,
                2,
                3
            ]
        },
        interior: {
            pattern: [
                'None',
                'Solid',
                'Gray75',
                'Gray50',
                'Gray25',
                'Gray125',
                'Gray0625',
                'HorzStripe',
                'VertStripe',
                'ReverseDiagStripe',
                'DiagStripe',
                'DiagCross',
                'ThickDiagCross',
                'ThinHorzStripe',
                'ThinVertStripe',
                'ThinReverseDiagStripe',
                'ThinDiagStripe',
                'ThinHorzCross',
                'ThinDiagCross'
            ]
        },
        protection: {
            "protected": [
                true,
                false
            ],
            hideFormula: [
                true,
                false
            ]
        }
    },
    tpl: [
        '       <Style ss:ID="{id}"',
        '<tpl if="this.exists(parentId)"> ss:Parent="{parentId}"</tpl>',
        '<tpl if="this.exists(name)"> ss:Name="{name}"</tpl>',
        '>\n',
        '<tpl if="this.exists(alignment)">           <Alignment{[this.getAttributes(values.alignment, "alignment")]}/>\n</tpl>',
        '<tpl if="this.exists(borders)">',
        '           <Borders>\n',
        '<tpl for="borders">               <Border{[this.getAttributes(values, "border")]}/>\n</tpl>',
        '           </Borders>\n',
        '</tpl>',
        '<tpl if="this.exists(font)">           <Font{[this.getAttributes(values.font, "font")]}/>\n</tpl>',
        '<tpl if="this.exists(interior)">           <Interior{[this.getAttributes(values.interior, "interior")]}/>\n</tpl>',
        '<tpl if="this.exists(format)">           <NumberFormat ss:Format="{format}"/>\n</tpl>',
        '<tpl if="this.exists(protection)">           <Protection{[this.getAttributes(values.protection, "protection")]}/>\n</tpl>',
        '       </Style>\n',
        {
            exists: function(value) {
                return !Ext.isEmpty(value);
            },
            getAttributes: function(obj, checkName) {
                var template = ' ss:{0}="{1}"',
                    keys = Ext.Object.getKeys(obj || {}),
                    len = keys.length,
                    s = '',
                    i, key;
                for (i = 0; i < len; i++) {
                    key = keys[i];
                    s += Ext.String.format(template, Ext.String.capitalize(key), Ext.isBoolean(obj[key]) ? Number(obj[key]) : obj[key]);
                }
                return s;
            }
        }
    ]
});

/**
 * This class is used to create an xml Excel Row
 */
Ext.define('Ext.exporter.file.excel.Row', {
    extend: 'Ext.exporter.file.Base',
    config: {
        /**
         * @cfg {Boolean} [autoFitHeight=false]
         *
         * Set this to 1 if you want to auto fit its height
         */
        autoFitHeight: false,
        /**
         * @cfg {String} caption
         *
         * Specifies the caption that should appear when the Component's custom row and column headers are showing.
         */
        caption: null,
        /**
         * @cfg {Ext.exporter.file.excel.Cell[]} cells
         *
         * Collection of cells available on this row.
         */
        cells: [],
        /**
         * @cfg {Number} height
         *
         * Row's height in the Excel table
         */
        height: null,
        /**
         * @cfg {String} index
         *
         * Index of this row in the Excel table
         */
        index: null,
        /**
         * @cfg {Number} span
         *
         * Specifies the number of adjacent rows with the same formatting as this row. When a Span attribute
         * is used, the spanned row elements are not written out.
         *
         * As mentioned in the index config, rows must not overlap. Doing so results in an XML Spreadsheet document
         * that is invalid. Care must be taken with this attribute to ensure that the span does not include another
         * row index that is specified.
         *
         * Unlike columns, rows with the Span attribute must be empty. A row that contains a Span attribute and
         * one or more Cell elements is considered invalid. The Span attribute for rows is a short-hand method
         * for setting formatting properties for multiple, empty rows.
         *
         */
        span: null,
        /**
         * @cfg {String} styleId
         *
         * Excel style attached to this row
         */
        styleId: null
    },
    /**
     * @method getCells
     * @return {Ext.util.Collection}
     *
     * Returns the collection of cells available in this row
     */
    tpl: [
        '           <Row',
        '<tpl if="this.exists(index)"> ss:Index="{index}"</tpl>',
        '<tpl if="this.exists(caption)"> c:Caption="{caption}"</tpl>',
        '<tpl if="this.exists(autoFitHeight)"> ss:AutoFitHeight="{autoFitHeight:this.toNumber}"</tpl>',
        '<tpl if="this.exists(span)"> ss:Span="{span}"</tpl>',
        '<tpl if="this.exists(height)"> ss:Height="{height}"</tpl>',
        '<tpl if="this.exists(styleId)"> ss:StyleID="{styleId}"</tpl>',
        '>\n',
        '<tpl if="cells"><tpl for="cells.getRange()">{[values.render()]}</tpl></tpl>',
        '           </Row>\n',
        {
            exists: function(value) {
                return !Ext.isEmpty(value);
            },
            toNumber: function(value) {
                return Number(Boolean(value));
            }
        }
    ],
    destroy: function() {
        this.callParent();
        this.setCells(null);
    },
    applyCells: function(data, dataCollection) {
        return this.checkCollection(data, dataCollection, 'Ext.exporter.file.excel.Cell');
    },
    /**
     * Convenience method to add cells. You can also use workbook.getCells().add(config).
     * @param {Object/Array} config
     * @return {Ext.exporter.file.excel.Cell/Ext.exporter.file.excel.Cell[]}
     */
    addCell: function(config) {
        return this.getCells().add(config || {});
    },
    /**
     * Convenience method to fetch a cell by its id.
     * @param id
     * @return {Ext.exporter.file.excel.Cell}
     */
    getCell: function(id) {
        return this.getCells().get(id);
    }
});

/**
 * This class is used to create an xml Excel Column.
 *
 * Columns are usually created when you want to add a special style to them.
 */
Ext.define('Ext.exporter.file.excel.Column', {
    extend: 'Ext.exporter.file.Base',
    config: {
        /**
         * @cfg {Boolean} [autoFitWidth=false]
         *
         * Use 1 if you want this column to auto fit its width.
         * Textual values do not autofit.
         */
        autoFitWidth: false,
        /**
         * @cfg {String} caption
         *
         * Specifies the caption that should appear when the Component's custom row and column headers are showing.
         */
        caption: null,
        /**
         * @cfg {Boolean} hidden
         *
         * `true` specifies that this column is hidden. `false` (or omitted) specifies that this column is shown.
         */
        hidden: null,
        /**
         * @cfg {Number} index
         *
         * Index of this column in the Excel table.
         *
         * If this tag is not specified, the first instance has an assumed Index="1". Each additional Column element
         * has an assumed Index that is one higher.
         *
         * Indices must appear in strictly increasing order. Failure to do so will result in an XML Spreadsheet
         * document that is invalid. Indices do not need to be sequential, however. Omitted indices are formatted
         * with the default style's format.
         *
         * Indices must not overlap. If duplicates exist, the behavior is unspecified and the XML Spreadsheet
         * document is considered invalid. An easy way to create overlap is through careless use of the Span attribute.
         */
        index: null,
        /**
         * @cfg {Number} span
         *
         * Specifies the number of adjacent columns with the same formatting as this column. When a Span attribute
         * is used, the spanned column elements are not written out.
         *
         * As mentioned in the index config, columns must not overlap. Doing so results in an XML Spreadsheet document
         * that is invalid. Care must be taken with this attribute to ensure that the span does not include another
         * column index that is specified.
         */
        span: null,
        /**
         * @cfg {String} styleId
         *
         * Excel style attached to this column
         */
        styleId: null,
        /**
         * @cfg {Number} width
         *
         * Specifies the width of a column in points. This value must be greater than or equal to 0.
         */
        width: null
    },
    tpl: [
        '<Column',
        '<tpl if="this.exists(index)"> ss:Index="{index}"</tpl>',
        '<tpl if="this.exists(caption)"> c:Caption="{caption}"</tpl>',
        '<tpl if="this.exists(styleId)"> ss:StyleID="{styleId}"</tpl>',
        '<tpl if="this.exists(hidden)"> ss:Hidden="{hidden}"</tpl>',
        '<tpl if="this.exists(span)"> ss:Span="{span}"</tpl>',
        '<tpl if="this.exists(width)"> ss:Width="{width}"</tpl>',
        '<tpl if="this.exists(autoFitWidth)"> ss:AutoFitWidth="{autoFitWidth:this.toNumber}"</tpl>',
        '/>\n',
        {
            exists: function(value) {
                return !Ext.isEmpty(value);
            },
            toNumber: function(value) {
                return Number(Boolean(value));
            }
        }
    ]
});

/**
 * This class is used to create an xml Excel Cell.
 *
 * The data type of the cell value is automatically determined.
 */
Ext.define('Ext.exporter.file.excel.Cell', {
    extend: 'Ext.exporter.file.Base',
    config: {
        /**
         * @cfg {String} dataType (required)
         *
         * Excel data type for the cell value
         */
        dataType: 'String',
        /**
         * @cfg {String} formula
         *
         * Specifies the formula stored in this cell. All formulas are persisted in R1C1 notation because they are
         * significantly easier to parse and generate than A1-style formulas. The formula is calculated upon reload
         * unless calculation is set to manual. Recalculation of the formula overrides the value in this cell's Value config.
         *
         * Examples:
         *
         * - "=SUM(R1C1:R2C2)": sums up values from Row1/Column1 to Row2/Column2
         * - "=SUM(R[-2]C:R[-1]C[1])": sums up values from 2 rows above the current row and current column to
         * values from 1 row above the current row and 1 column after the current column
         * - "=SUM(R[-1]C,R[-1]C[1])": sums up values from cell positioned one row above current row and current column,
         * and the cell positioned one row above current row and next column
         *
         * Check Excel for more formulas.
         */
        formula: null,
        /**
         * @cfg {Number} index
         *
         * Specifies the column index of this cell within the containing row. If this tag is not specified, the first
         * instance of a Cell element within a row has an assumed Index="1". Each additional Cell element has an assumed
         * Index that is one higher.
         *
         * Indices must appear in strictly increasing order. Failure to do so will result in an XML Spreadsheet
         * document that is invalid. Indices do not need to be sequential, however. Omitted indices are formatted with
         * either the default format, the column's format, or the table's format (depending on what has been specified).
         *
         * Indices must not overlap. If duplicates exist, the behavior is unspecified and the XML Spreadsheet document
         * is considered invalid. If the previous cell is a merged cell and no index is specified on this cell, its
         * start index is assumed to be the first cell after the merge.
         */
        index: null,
        /**
         * @cfg {String} styleId
         *
         * Excel style attached to this cell
         */
        styleId: null,
        /**
         * @cfg {Number} mergeAcross
         *
         * Number of cells to merge to the right side of this cell
         */
        mergeAcross: null,
        /**
         * @cfg {Number} mergeDown
         *
         * Number of cells to merge below this cell
         */
        mergeDown: null,
        /**
         * @cfg {Number/Date/String} value (required)
         *
         * Value assigned to this cell
         */
        value: ''
    },
    tpl: [
        '               <Cell',
        '<tpl if="this.exists(index)"> ss:Index="{index}"</tpl>',
        '<tpl if="this.exists(styleId)"> ss:StyleID="{styleId}"</tpl>',
        '<tpl if="this.exists(mergeAcross)"> ss:MergeAcross="{mergeAcross}"</tpl>',
        '<tpl if="this.exists(mergeDown)"> ss:MergeDown="{mergeDown}"</tpl>',
        '<tpl if="this.exists(formula)"> ss:Formula="{formula}"</tpl>',
        '>\n',
        '                   <Data ss:Type="{dataType}">{value}</Data>\n',
        '               </Cell>\n',
        {
            exists: function(value) {
                return !Ext.isEmpty(value);
            }
        }
    ],
    applyValue: function(v) {
        var dt = 'String',
            format = Ext.util.Format;
        // let's detect the data type
        if (v instanceof Date) {
            dt = 'DateTime';
            v = Ext.Date.format(v, 'Y-m-d\\TH:i:s.u');
        } else if (Ext.isNumeric(v)) {
            dt = 'Number';
        } else {
            // cannot use here stripTags
            // this value goes into an xml tag and we need to force html encoding
            // for chars like &><
            v = format.htmlEncode(format.htmlDecode(v));
        }
        this.setDataType(dt);
        return v;
    }
});

/**
 * This class generates an Excel 2003 XML workbook.
 *
 * The workbook is the top level object of an xml Excel file.
 * It should have at least one Worksheet before rendering.
 *
 * This is how an xml Excel file looks like:
 *
 *  - Workbook
 *      - Style[]
 *      - Worksheet[]
 *          - Table[]
 *              - Column[]
 *              - Row[]
 *                  - Cell[]
 *
 *
 * Check Microsoft's website for more info about Excel XML:
 * https://msdn.microsoft.com/en-us/Library/aa140066(v=office.10).aspx
 *
 *
 * Here is an example of how to create an Excel XML document:
 *
 *      var workbook = Ext.create('Ext.exporter.file.excel.Workbook', {
 *              title:  'My document',
 *              author: 'John Doe'
 *          }),
 *          table = workbook.addWorksheet({
 *              name:   'Sheet 1'
 *          }).addTable();
 *
 *      // add formatting to the first two columns of the spreadsheet
 *      table.addColumn({
 *          width:  120,
 *          styleId: workbook.addStyle({
 *              format: 'Long Time'
 *          }).getId()
 *      });
 *      table.addColumn({
 *          width:  100,
 *          styleId: workbook.addStyle({
 *              format: 'Currency'
 *          }).getId()
 *      });
 *
 *      // add rows and cells with data
 *      table.addRow().addCell([{
 *          value: 'Date'
 *      },{
 *          value: 'Value'
 *      }]);
 *      table.addRow().addCell([{
 *          value: new Date('06/17/2015')
 *      },{
 *          value: 15
 *      }]);
 *      table.addRow().addCell([{
 *          value: new Date('06/18/2015')
 *      },{
 *          value: 30
 *      }]);
 *
 *      //add a formula on the 4th row which sums up the previous 2 rows
 *      table.addRow().addCell({
 *          index: 2,
 *          formula: '=SUM(R[-2]C:R[-1]C)'
 *      });
 *
 *      // save the document in the browser
 *      Ext.exporter.File.saveAs(workbook.render(), 'document.xml', 'UTF-8');
 *
 */
Ext.define('Ext.exporter.file.excel.Workbook', {
    extend: 'Ext.exporter.file.Base',
    requires: [
        'Ext.exporter.file.excel.Worksheet',
        'Ext.exporter.file.excel.Table',
        'Ext.exporter.file.excel.Style',
        'Ext.exporter.file.excel.Row',
        'Ext.exporter.file.excel.Column',
        'Ext.exporter.file.excel.Cell'
    ],
    config: {
        /**
         * @cfg {String} [title="Workbook"]
         *
         * The title of the workbook
         */
        title: "Workbook",
        /**
         * @cfg {String} [author="Sencha"]
         *
         * The author of the generated Excel file
         */
        author: 'Sencha',
        /**
         * @cfg {Number} [windowHeight=9000]
         *
         * Excel window height
         */
        windowHeight: 9000,
        /**
         * @cfg {Number} [windowWidth=50000]
         *
         * Excel window width
         */
        windowWidth: 50000,
        /**
         * @cfg {Boolean} [protectStructure=false]
         *
         * Protect structure
         */
        protectStructure: false,
        /**
         * @cfg {Boolean} [protectWindows=false]
         *
         * Protect windows
         */
        protectWindows: false,
        /**
         * @cfg {Ext.exporter.file.excel.Style[]} styles
         *
         * Collection of styles available in this workbook
         */
        styles: [],
        /**
         * @cfg {Ext.exporter.file.excel.Worksheet[]} worksheets
         *
         * Collection of worksheets available in this workbook
         */
        worksheets: []
    },
    /**
     * @method getStyles
     * @returns {Ext.util.Collection}
     *
     * Returns the collection of styles available in this workbook
     */
    /**
     * @method getWorksheets
     * @returns {Ext.util.Collection}
     *
     * Returns the collection of worksheets available in this workbook
     */
    tpl: [
        '<?xml version="1.0" encoding="utf-8"?>\n',
        '<?mso-application progid="Excel.Sheet"?>\n',
        '<Workbook ',
        'xmlns="urn:schemas-microsoft-com:office:spreadsheet" ',
        'xmlns:o="urn:schemas-microsoft-com:office:office" ',
        'xmlns:x="urn:schemas-microsoft-com:office:excel" ',
        'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" ',
        'xmlns:html="http://www.w3.org/TR/REC-html40">\n',
        '   <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">\n',
        '       <Title>{title:htmlEncode}</Title>\n',
        '       <Author>{author:htmlEncode}</Author>\n',
        '       <Created>{createdAt}</Created>\n',
        '   </DocumentProperties>\n',
        '   <ExcelWorkbook xmlns="urn:schemas-microsoft-com:office:excel">\n',
        '       <WindowHeight>{windowHeight}</WindowHeight>\n',
        '       <WindowWidth>{windowWidth}</WindowWidth>\n',
        '       <ProtectStructure>{protectStructure}</ProtectStructure>\n',
        '       <ProtectWindows>{protectWindows}</ProtectWindows>\n',
        '   </ExcelWorkbook>\n',
        '   <Styles>\n',
        '<tpl if="styles"><tpl for="styles.getRange()">{[values.render()]}</tpl></tpl>',
        '   </Styles>\n',
        '<tpl if="worksheets"><tpl for="worksheets.getRange()">{[values.render()]}</tpl></tpl>',
        '</Workbook>'
    ],
    destroy: function() {
        this.callParent();
        this.setStyles(null);
        this.setWorksheets(null);
    },
    applyStyles: function(data, dataCollection) {
        return this.checkCollection(data, dataCollection, 'Ext.exporter.file.excel.Style');
    },
    applyWorksheets: function(data, dataCollection) {
        return this.checkCollection(data, dataCollection, 'Ext.exporter.file.excel.Worksheet');
    },
    /**
     * Convenience method to add styles. You can also use workbook.getStyles().add(config).
     * @param {Object/Array} config
     * @returns {Ext.exporter.file.excel.Style/Ext.exporter.file.excel.Style[]}
     */
    addStyle: function(config) {
        return this.getStyles().add(config || {});
    },
    /**
     * Convenience method to fetch a style by its id.
     * @param id
     * @returns {Ext.exporter.file.excel.Style}
     */
    getStyle: function(id) {
        return this.getStyles().get(id);
    },
    /**
     * Convenience method to add worksheets. You can also use workbook.getWorksheets().add(config).
     * @param {Object/Array} config
     * @returns {Ext.exporter.file.excel.Worksheet/Ext.exporter.file.excel.Worksheet[]}
     */
    addWorksheet: function(config) {
        return this.getWorksheets().add(config || {});
    },
    /**
     * Convenience method to fetch a worksheet by its id.
     * @param id
     * @returns {Ext.exporter.file.excel.Worksheet}
     */
    getWorksheet: function(id) {
        return this.getWorksheets().get(id);
    }
});

/**
 * This exporter produces Microsoft Excel 2003 XML files for the supplied data. It was implemented according to
 * [this][1] documentation.
 *
 * [1]: https://msdn.microsoft.com/en-us/Library/aa140066(v=office.10).aspx
 */
Ext.define('Ext.exporter.excel.Xml', {
    extend: 'Ext.exporter.Base',
    alias: 'exporter.excel03',
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
            borders: [
                {
                    position: 'Bottom',
                    lineStyle: 'Continuous',
                    weight: 1,
                    color: '#4F81BD'
                }
            ]
        },
        /**
         * @cfg {Ext.exporter.file.excel.Style} groupFooterStyle
         *
         * Default style applied to the group footers
         */
        groupFooterStyle: {
            borders: [
                {
                    position: 'Top',
                    lineStyle: 'Continuous',
                    weight: 1,
                    color: '#4F81BD'
                }
            ]
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
            borders: [
                {
                    position: 'Bottom',
                    lineStyle: 'Continuous',
                    weight: 1,
                    color: '#4F81BD'
                }
            ],
            font: {
                fontName: 'Calibri',
                family: 'Swiss',
                size: 11,
                color: '#1F497D'
            }
        }
    },
    fileName: 'export.xml',
    destroy: function() {
        var me = this;
        me.workbook = me.table = me.columnStylesFooter = me.columnStylesNormal = Ext.destroy(me.workbook);
        return me.callParent(arguments);
    },
    applyDefaultStyle: function(newValue) {
        // the default style should always have the id Default and name Normal
        return Ext.applyIf({
            id: 'Default',
            name: 'Normal'
        }, newValue || {});
    },
    getContent: function() {
        var me = this,
            config = this.getConfig(),
            data = config.data,
            colMerge;
        me.workbook = new Ext.exporter.file.excel.Workbook({
            title: config.title,
            author: config.author,
            windowHeight: config.windowHeight,
            windowWidth: config.windowWidth,
            protectStructure: config.protectStructure,
            protectWindows: config.protectWindows
        });
        me.table = me.workbook.addWorksheet({
            name: config.title
        }).addTable();
        me.workbook.addStyle(config.defaultStyle);
        me.tableHeaderStyleId = me.workbook.addStyle(config.tableHeaderStyle).getId();
        me.groupHeaderStyleId = me.workbook.addStyle(config.groupHeaderStyle).getId();
        colMerge = data ? data.getColumnCount() : 1;
        me.addTitle(config, colMerge);
        if (data) {
            me.buildHeader();
            me.buildRows(data.getGroups(), colMerge, 0);
        }
        return me.workbook.render();
    },
    addTitle: function(config, colMerge) {
        if (!Ext.isEmpty(config.title)) {
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
    buildRows: function(groups, colMerge, level) {
        var me = this,
            showSummary = me.getShowSummary(),
            g, row, styleH, styleF, cells, i, j, k, gLen, sLen, cLen, oneLine;
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
            if (showSummary !== false && !Ext.isEmpty(g.text) && !oneLine) {
                me.table.addRow().addCell({
                    mergeAcross: colMerge - 1,
                    value: g.text,
                    styleId: styleH
                });
            }
            me.buildRows(g.groups, colMerge, level + 1);
            me.buildGroupRows(g.rows);
            if (g.summaries && (showSummary || oneLine)) {
                sLen = g.summaries.length;
                for (k = 0; k < sLen; k++) {
                    // that's the summary footer
                    row = me.table.addRow();
                    cells = g.summaries.getAt(k).getCells();
                    cLen = cells.length;
                    for (j = 0; j < cLen; j++) {
                        row.addCell(cells.getAt(j).getConfig()).setStyleId(oneLine ? me.columnStylesNormal[j] : (j === 0 ? styleF : me.columnStylesFooter[j]));
                    }
                }
            }
        }
    },
    buildGroupRows: function(rows) {
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
    buildHeader: function() {
        var me = this,
            ret = {},
            data = me.getData(),
            keys, row, i, j, len, lenCells, style, arr, fStyle;
        me.buildHeaderRows(data.getColumns(), ret);
        keys = Ext.Object.getKeys(ret);
        len = keys.length;
        for (i = 0; i < len; i++) {
            row = me.table.addRow({
                height: 20.25,
                autoFitHeight: 1
            });
            arr = ret[keys[i]];
            lenCells = arr.length;
            for (j = 0; j < lenCells; j++) {
                row.addCell(arr[j]).setStyleId(me.tableHeaderStyleId);
            }
        }
        arr = data.getBottomColumns();
        lenCells = arr.length;
        me.columnStylesNormal = [];
        me.columnStylesFooter = [];
        fStyle = me.getGroupFooterStyle();
        for (j = 0; j < lenCells; j++) {
            style = Ext.applyIf({
                parentId: 'Default'
            }, fStyle);
            style = Ext.merge(style, arr[j].getStyle());
            style.id = null;
            me.columnStylesFooter.push(me.workbook.addStyle(style).getId());
            style = Ext.merge({
                parentId: 'Default'
            }, arr[j].getStyle());
            me.columnStylesNormal.push(me.workbook.addStyle(style).getId());
        }
    },
    buildHeaderRows: function(columns, result) {
        var col, cols, i, len, name;
        if (!columns) {
            return;
        }
        len = columns.length;
        for (i = 0; i < len; i++) {
            col = columns.getAt(i).getConfig();
            col.value = col.text;
            cols = col.columns;
            delete (col.columns);
            delete (col.table);
            name = 's' + col.level;
            result[name] = result[name] || [];
            result[name].push(col);
            this.buildHeaderRows(cols, result);
        }
    }
});

/**
 * @private
 */
Ext.define('Ext.exporter.file.html.Style', {
    extend: 'Ext.exporter.file.Style',
    mappings: {
        readingOrder: {
            LeftToRight: 'ltr',
            RightToLeft: 'rtl',
            Context: 'initial',
            Automatic: 'initial'
        },
        horizontal: {
            Automatic: 'initial',
            Left: 'left',
            Center: 'center',
            Right: 'right',
            Justify: 'justify'
        },
        vertical: {
            Top: 'top',
            Bottom: 'bottom',
            Center: 'middle',
            Automatic: 'baseline'
        },
        lineStyle: {
            None: 'none',
            Continuous: 'solid',
            Dash: 'dashed',
            Dot: 'dotted'
        }
    },
    render: function() {
        var cfg = this.getConfig(),
            map = this.mappings,
            s = '',
            align = cfg.alignment,
            font = cfg.font,
            borders = cfg.borders,
            interior = cfg.interior,
            i, length, name, border;
        if (align) {
            if (align.horizontal) {
                s += 'text-align: ' + map.horizontal[align.horizontal] + ';\n';
            }
            if (align.readingOrder) {
                s += 'direction: ' + map.readingOrder[align.readingOrder] + ';\n';
            }
            if (align.vertical) {
                s += 'vertical-align: ' + map.vertical[align.vertical] + ';\n';
            }
            if (align.indent) {
                s += 'padding-left: ' + align.indent + 'px;\n';
            }
        }
        if (font) {
            if (font.size) {
                s += 'font-size: ' + font.size + 'px;\n';
            }
            if (font.bold) {
                s += 'font-weight: bold;\n';
            }
            if (font.italic) {
                s += 'font-style: italic;\n';
            }
            if (font.strikeThrough) {
                s += 'text-decoration: line-through;\n';
            }
            if (font.underline === 'Single') {
                s += 'text-decoration: underline;\n';
            }
            if (font.color) {
                s += 'color: ' + font.color + ';\n';
            }
        }
        if (interior && interior.color) {
            s += 'background-color: ' + interior.color + ';\n';
        }
        if (borders) {
            length = borders.length;
            for (i = 0; i < length; i++) {
                border = borders[i];
                name = 'border-' + border.position.toLowerCase();
                s += name + '-width: ' + (border.weight || 0) + 'px;\n';
                s += name + '-style: ' + (map.lineStyle[border.lineStyle] || 'initial') + ';\n';
                s += name + '-color: ' + (border.color || 'initial') + ';\n';
            }
        }
        return cfg.name + '{\n' + s + '}\n';
    }
});

/**
 * @private
 */
Ext.define('Ext.exporter.file.html.Doc', {
    extend: 'Ext.exporter.file.Base',
    requires: [
        'Ext.exporter.file.html.Style'
    ],
    config: {
        /**
         * @cfg {String} [title="Title"]
         *
         * The title of the html document
         */
        title: "Title",
        /**
         * @cfg {String} [author="Sencha"]
         *
         * The author of the generated html file
         */
        author: 'Sencha',
        /**
         * @cfg {String} [charset="UTF-8"]
         *
         * Html document charset
         */
        charset: 'UTF-8',
        /**
         * @cfg {Ext.exporter.file.html.Style[]} styles
         *
         * Collection of styles available in this workbook
         */
        styles: [],
        /**
         * @cfg {Object} table
         */
        table: null
    },
    destroy: function() {
        this.callParent();
        this.setStyles(null);
        this.setTable(null);
    },
    applyStyles: function(data, dataCollection) {
        return this.checkCollection(data, dataCollection, 'Ext.exporter.file.html.Style');
    },
    /**
     * Convenience method to add styles.
     * @param {Object/Array} config
     * @returns {Ext.exporter.file.html.Style/Ext.exporter.file.html.Style[]}
     */
    addStyle: function(config) {
        return this.getStyles().add(config || {});
    },
    /**
     * Convenience method to fetch a style by its id.
     * @param id
     * @returns {Ext.exporter.file.html.Style}
     */
    getStyle: function(id) {
        return this.getStyles().get(id);
    }
});

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
    getHelper: function() {
        return Ext.util.CSV;
    },
    getContent: function() {
        var me = this,
            result = [],
            data = me.getData();
        if (data) {
            me.buildHeader(result);
            me.buildRows(data.getGroups(), result, data.getColumnCount());
            me.columnStyles = Ext.destroy(me.columnStyles);
        }
        return me.getHelper().encode(result);
    },
    buildHeader: function(result) {
        var me = this,
            ret = {},
            data = me.getData(),
            arr, lenCells, i, style;
        me.buildHeaderRows(data.getColumns(), ret);
        result.push.apply(result, Ext.Object.getValues(ret));
        arr = data.getBottomColumns();
        lenCells = arr.length;
        me.columnStyles = [];
        for (i = 0; i < lenCells; i++) {
            style = arr[i].getStyle() || {};
            if (!style.id) {
                style.id = 'c' + i;
            }
            style.name = '.' + style.id;
            me.columnStyles.push(new Ext.exporter.file.Style(style));
        }
    },
    buildHeaderRows: function(columns, result) {
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
            for (j = 1; j <= mAcross; j++) {
                result[name].push('');
            }
            for (j = 1; j <= mDown; j++) {
                name = 's' + (level + j);
                result[name] = result[name] || [];
                result[name].push('');
            }
            this.buildHeaderRows(col.getColumns(), result);
        }
    },
    buildRows: function(groups, result, length) {
        var showSummary = this.getShowSummary(),
            g, i, row, gLen, j, rLen, k, cLen, r, cells, oneLine, cell, style;
        if (!groups) {
            return;
        }
        gLen = groups.length;
        for (i = 0; i < gLen; i++) {
            g = groups.getAt(i).getConfig();
            // if the group has no subgroups and no rows then show only summaries
            oneLine = (!g.groups && !g.rows);
            if (!Ext.isEmpty(g.text) && !oneLine) {
                row = [];
                row.length = length;
                row[g.level || 0] = g.text;
                result.push(row);
            }
            this.buildRows(g.groups, result, length);
            if (g.rows) {
                rLen = g.rows.length;
                for (j = 0; j < rLen; j++) {
                    row = [];
                    r = g.rows.getAt(j);
                    cells = r.getCells();
                    cLen = cells.length;
                    for (k = 0; k < cLen; k++) {
                        cell = cells.getAt(k).getConfig();
                        style = this.columnStyles[k];
                        cell = style ? style.getFormattedValue(cell.value) : cell.value;
                        row.push(cell);
                    }
                    result.push(row);
                }
            }
            if (g.summaries && (showSummary || oneLine)) {
                rLen = g.summaries.length;
                for (j = 0; j < rLen; j++) {
                    row = [];
                    r = g.summaries.getAt(j);
                    cells = r.getCells();
                    cLen = cells.length;
                    for (k = 0; k < cLen; k++) {
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

/**
 * This exporter produces HTML files for the supplied data.
 */
Ext.define('Ext.exporter.text.Html', {
    extend: 'Ext.exporter.Base',
    alias: 'exporter.html',
    requires: [
        'Ext.exporter.file.html.Doc'
    ],
    config: {
        tpl: [
            '<!DOCTYPE html>\n',
            '<html>\n',
            '   <head>\n',
            '       <meta charset="{charset}">\n',
            '       <title>{title}</title>\n',
            '       <style>\n',
            '       table { border-collapse: collapse; border-spacing: 0; }\n',
            '<tpl if="styles"><tpl for="styles.getRange()">{[values.render()]}</tpl></tpl>',
            '       </style>\n',
            '   </head>\n',
            '   <body>\n',
            '       <h1>{title}</h1>\n',
            '       <table>\n',
            '           <thead>\n',
            '<tpl for="table.columns">',
            '               <tr>\n',
            '<tpl for=".">',
            '                   <th<tpl if="width"> width="{width}"</tpl><tpl if="mergeAcross"> colSpan="{mergeAcross}"</tpl><tpl if="mergeDown"> rowSpan="{mergeDown}"</tpl>>{text}</th>\n',
            '</tpl>',
            '               </tr>\n',
            '</tpl>',
            '           </thead>\n',
            '           <tbody>\n',
            '<tpl for="table.rows">',
            '               <tr<tpl if="cls"> class="{cls}"</tpl>>\n',
            '<tpl for="cells">',
            '                   <td<tpl if="cls"> class="{cls}"</tpl><tpl if="mergeAcross"> colSpan="{mergeAcross}"</tpl><tpl if="mergeDown"> rowSpan="{mergeDown}"</tpl>>{value}</td>\n',
            '</tpl>',
            '               </tr>\n',
            '</tpl>',
            '           </tbody>\n',
            '           <tfoot>\n',
            '               <tr>\n',
            '                   <th<tpl if="table.columnsCount"> colSpan="{table.columnsCount}"</tpl>>&nbsp;</th>\n',
            '               </tr>\n',
            '           </tfoot>\n',
            '       </table>\n',
            '   </body>\n',
            '</html>'
        ],
        /**
         * @cfg {Ext.exporter.file.html.Style} defaultStyle
         *
         * Default style applied to all cells
         */
        defaultStyle: {
            name: 'table tbody td, table thead th',
            alignment: {
                vertical: 'Top'
            },
            font: {
                fontName: 'Arial',
                size: 12,
                color: '#000000'
            },
            borders: [
                {
                    position: 'Left',
                    lineStyle: 'Continuous',
                    weight: 1,
                    color: '#4F81BD'
                },
                {
                    position: 'Right',
                    lineStyle: 'Continuous',
                    weight: 1,
                    color: '#4F81BD'
                }
            ]
        },
        /**
         * @cfg {Ext.exporter.file.html.Style} titleStyle
         *
         * Default style applied to the title
         */
        titleStyle: {
            name: 'h1',
            font: {
                fontName: 'Arial',
                size: 18,
                color: '#1F497D'
            }
        },
        /**
         * @cfg {Ext.exporter.file.html.Style} groupHeaderStyle
         *
         * Default style applied to the group headers
         */
        groupHeaderStyle: {
            name: '.groupHeader td',
            borders: [
                {
                    position: 'Top',
                    lineStyle: 'Continuous',
                    weight: 1,
                    color: '#4F81BD'
                },
                {
                    position: 'Bottom',
                    lineStyle: 'Continuous',
                    weight: 1,
                    color: '#4F81BD'
                }
            ]
        },
        /**
         * @cfg {Ext.exporter.file.html.Style} groupFooterStyle
         *
         * Default style applied to the group footers
         */
        groupFooterStyle: {
            name: '.groupFooter td',
            borders: [
                {
                    position: 'Bottom',
                    lineStyle: 'Continuous',
                    weight: 1,
                    color: '#4F81BD'
                }
            ]
        },
        /**
         * @cfg {Ext.exporter.file.html.Style} tableHeaderStyle
         *
         * Default style applied to the table headers
         */
        tableHeaderStyle: {
            name: 'table thead th',
            alignment: {
                horizontal: 'Center',
                vertical: 'Center'
            },
            borders: [
                {
                    position: 'Top',
                    lineStyle: 'Continuous',
                    weight: 1,
                    color: '#4F81BD'
                },
                {
                    position: 'Bottom',
                    lineStyle: 'Continuous',
                    weight: 1,
                    color: '#4F81BD'
                }
            ],
            font: {
                fontName: 'Arial',
                size: 12,
                color: '#1F497D'
            }
        },
        /**
         * @cfg {Ext.exporter.file.html.Style} tableFooterStyle
         *
         * Default style applied to the table footer
         */
        tableFooterStyle: {
            name: 'table tfoot th',
            borders: [
                {
                    position: 'Top',
                    lineStyle: 'Continuous',
                    weight: 1,
                    color: '#4F81BD'
                }
            ]
        }
    },
    fileName: 'export.html',
    getContent: function() {
        var me = this,
            config = me.getConfig(),
            data = config.data,
            table = {
                columnsCount: 0,
                columns: [],
                rows: []
            },
            colMerge, html;
        me.doc = new Ext.exporter.file.html.Doc({
            title: config.title,
            author: config.author,
            tpl: config.tpl,
            styles: [
                config.defaultStyle,
                config.titleStyle,
                config.groupHeaderStyle,
                config.groupFooterStyle,
                config.tableHeaderStyle,
                config.tableFooterStyle
            ]
        });
        if (data) {
            colMerge = data.getColumnCount();
            Ext.apply(table, {
                columnsCount: data.getColumnCount(),
                columns: me.buildHeader(),
                rows: me.buildRows(data.getGroups(), colMerge, 0)
            });
        }
        me.doc.setTable(table);
        html = me.doc.render();
        me.doc = me.columnStyles = Ext.destroy(me.doc);
        return html;
    },
    buildRows: function(groups, colMerge, level) {
        var me = this,
            showSummary = me.getShowSummary(),
            result = [],
            g, row, i, j, k, gLen, rLen, cLen, cell, r, cells, oneLine, style;
        if (groups) {
            me.doc.addStyle({
                name: '.levelHeader' + level,
                alignment: {
                    Horizontal: 'Left',
                    Indent: (level > 0 ? level - 1 : 0) * 5
                }
            });
            me.doc.addStyle({
                name: '.levelFooter' + level,
                alignment: {
                    Horizontal: 'Left',
                    Indent: (level > 0 ? level - 1 : 0) * 5
                }
            });
            gLen = groups.length;
            for (i = 0; i < gLen; i++) {
                g = groups.getAt(i).getConfig();
                // if the group has no subgroups and no rows then show only summaries
                oneLine = (!g.groups && !g.rows);
                if (!Ext.isEmpty(g.text) && !oneLine) {
                    result.push({
                        cls: 'groupHeader',
                        cells: [
                            {
                                value: g.text,
                                mergeAcross: colMerge,
                                cls: 'levelHeader' + level
                            }
                        ]
                    });
                }
                result = Ext.Array.merge(result, me.buildRows(g.groups, colMerge, level + 1));
                if (g.rows) {
                    rLen = g.rows.length;
                    for (j = 0; j < rLen; j++) {
                        row = [];
                        r = g.rows.getAt(j);
                        cells = r.getCells();
                        cLen = cells.length;
                        for (k = 0; k < cLen; k++) {
                            cell = cells.getAt(k).getConfig();
                            style = me.columnStyles[k];
                            if (style) {
                                cell.cls = style.getId();
                                cell.value = style.getFormattedValue(cell.value);
                            }
                            row.push(cell);
                        }
                        result.push({
                            cells: row
                        });
                    }
                }
                if (g.summaries && (showSummary || oneLine)) {
                    rLen = g.summaries.length;
                    for (j = 0; j < rLen; j++) {
                        row = [];
                        r = g.summaries.getAt(j);
                        cells = r.getCells();
                        cLen = cells.length;
                        for (k = 0; k < cLen; k++) {
                            cell = cells.getAt(k).getConfig();
                            style = me.columnStyles[k];
                            cell.cls = (k === 0 ? 'levelFooter' + level : '');
                            if (style) {
                                cell.cls += ' ' + style.getId();
                                cell.value = style.getFormattedValue(cell.value);
                            }
                            row.push(cell);
                        }
                        result.push({
                            cls: 'groupFooter' + (oneLine ? ' groupHeader' : ''),
                            cells: row
                        });
                    }
                }
            }
        }
        return result;
    },
    buildHeader: function() {
        var me = this,
            ret = {},
            data = me.getData(),
            arr, lenCells, i, style;
        me.buildHeaderRows(data.getColumns(), ret);
        arr = data.getBottomColumns();
        lenCells = arr.length;
        me.columnStyles = [];
        for (i = 0; i < lenCells; i++) {
            style = arr[i].getStyle() || {};
            if (!style.id) {
                style.id = Ext.id();
            }
            style.name = '.' + style.id;
            me.columnStyles.push(me.doc.addStyle(style));
        }
        return Ext.Object.getValues(ret);
    },
    buildHeaderRows: function(columns, result) {
        var col, i, len, name, s;
        if (!columns) {
            return;
        }
        len = columns.length;
        for (i = 0; i < len; i++) {
            col = columns.getAt(i).getConfig();
            name = 's' + col.level;
            result[name] = result[name] || [];
            if (col.mergeAcross) {
                col.mergeAcross++;
            }
            if (col.mergeDown) {
                col.mergeDown++;
            }
            result[name].push(col);
            this.buildHeaderRows(col.columns, result);
        }
    }
});

/**
 * This exporter produces TSV (tab separated values) files for the supplied data.
 */
Ext.define('Ext.exporter.text.TSV', {
    extend: 'Ext.exporter.text.CSV',
    alias: 'exporter.tsv',
    requires: [
        'Ext.util.TSV'
    ],
    getHelper: function() {
        return Ext.util.TSV;
    }
});

