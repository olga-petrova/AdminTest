/**
 * This class has methods for file manipulation.
 */
Ext.define('Ext.exporter.File', {
    singleton: true
}, /**
     * Save a file locally using the content and name provided.
     *
     * Browser	compatibility:
     *
     * - Firefox 20+: max file size 800 MiB
     * - Chrome: max file size 345 MiB
     * - Chrome for Android: max file size n/a
     * - IE 10+: max file size 600 MiB
     * - IE < 10: Files are saved as text/html and max file size n/a
     * - Opera 15+: max file size 345 MiB
     * - Opera < 15: max file size n/a
     * - Safari 6.1+: max file size n/a; Blobs may be opened instead of saved sometimes—you may have
     * to direct your Safari users to manually press ⌘+S to save the file after it is opened.
     * Using the application/octet-stream MIME type to force downloads can cause issues in Safari.
     * - Safari < 6: max file size n/a
     *
     * @method saveAs
     * @param {String} content File content
     * @param {String} filename Name of the file including the extension
     * @param {String} [charset="UTF-8"] File's charset
     */
function(File) {
    /* FileSaver.js
     *  A saveAs() & saveTextAs() FileSaver implementation.
     *  2014-06-24
     *
     *  Modify by Brian Chen
     *  Author: Eli Grey, http://eligrey.com
     *  License: X11/MIT
     *    See https://github.com/eligrey/FileSaver.js/blob/master/LICENSE.md
     */
    /*global self */
    /*jslint bitwise: true, indent: 4, laxbreak: true, laxcomma: true, smarttabs: true, plusplus: true */
    /*! @source http://purl.eligrey.com/github/FileSaver.js/blob/master/FileSaver.js */
    var navigator = window.navigator,
        saveAs = window.saveAs || // IE 10+ (native saveAs)
        (typeof navigator !== "undefined" && navigator.msSaveOrOpenBlob && navigator.msSaveOrOpenBlob.bind(navigator)) || // Everyone else
        (function(view) {
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
                can_use_save_link = !view.externalHost && "download" in save_link,
                click = function(node) {
                    var event = doc.createEvent("MouseEvents");
                    event.initMouseEvent("click", true, false, view, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                    node.dispatchEvent(event);
                },
                webkit_req_fs = view.webkitRequestFileSystem,
                req_fs = view.requestFileSystem || webkit_req_fs || view.mozRequestFileSystem,
                throw_outside = function(ex) {
                    (view.setImmediate || view.setTimeout)(function() {
                        throw ex;
                    }, 0);
                },
                force_saveable_type = "application/octet-stream",
                fs_min_size = 0,
                deletion_queue = [],
                process_deletion_queue = function() {
                    var i = deletion_queue.length;
                    while (i--) {
                        var file = deletion_queue[i];
                        if (typeof file === "string") {
                            // file is an object URL
                            get_URL().revokeObjectURL(file);
                        } else {
                            // file is a File
                            file.remove();
                        }
                    }
                    deletion_queue.length = 0;
                },
                // clear queue
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
                FileSaver = function(blob, name) {
                    // First try a.download, then web filesystem, then object URLs
                    var filesaver = this,
                        type = blob.type,
                        blob_changed = false,
                        object_url, target_view,
                        get_object_url = function() {
                            var object_url = get_URL().createObjectURL(blob);
                            deletion_queue.push(object_url);
                            return object_url;
                        },
                        dispatch_all = function() {
                            dispatch(filesaver, "writestart progress write writeend".split(" "));
                        },
                        // on any filesys errors revert to saving with object URLs
                        fs_error = function() {
                            // don't create more object URLs than needed
                            if (blob_changed || !object_url) {
                                object_url = get_object_url(blob);
                            }
                            if (target_view) {
                                target_view.location.href = object_url;
                            } else {
                                window.open(object_url, "_blank");
                            }
                            filesaver.readyState = filesaver.DONE;
                            dispatch_all();
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
                        object_url = get_object_url(blob);
                        save_link.href = object_url;
                        save_link.download = name;
                        click(save_link);
                        filesaver.readyState = filesaver.DONE;
                        dispatch_all();
                        return;
                    }
                    // Object and web filesystem URLs have a problem saving in Google Chrome when
                    // viewed in a tab, so I force save with application/octet-stream
                    // http://code.google.com/p/chromium/issues/detail?id=91158
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
                                                deletion_queue.push(file);
                                                filesaver.readyState = filesaver.DONE;
                                                dispatch(filesaver, "writeend", event);
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
                saveAs = function(blob, name) {
                    return new FileSaver(blob, name);
                };
            FS_proto.abort = function() {
                var filesaver = this;
                filesaver.readyState = filesaver.DONE;
                dispatch(filesaver, "abort");
            };
            FS_proto.readyState = FS_proto.INIT = 0;
            FS_proto.WRITING = 1;
            FS_proto.DONE = 2;
            FS_proto.error = FS_proto.onwritestart = FS_proto.onprogress = FS_proto.onwrite = FS_proto.onabort = FS_proto.onerror = FS_proto.onwriteend = null;
            view.addEventListener("unload", process_deletion_queue, false);
            saveAs.unload = function() {
                process_deletion_queue();
                view.removeEventListener("unload", process_deletion_queue, false);
            };
            return saveAs;
        }(typeof self !== "undefined" && self || typeof window !== "undefined" && window || this.content));
    // `self` is undefined in Firefox for Android content script context
    // while `this` is nsIContentFrameMessageManager
    // with an attribute `content` that corresponds to the window
    if (typeof module !== "undefined" && module !== null) {
        module.exports = saveAs;
    } else if ((typeof define !== "undefined" && define !== null) && (define.amd != null)) {
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
    File.saveAs = saveTextAs;
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
 *
 */
Ext.define('Ext.exporter.Base', {
    mixins: [
        'Ext.mixin.Factoryable'
    ],
    alias: 'exporter.base',
    requires: [
        'Ext.exporter.File'
    ],
    config: {
        /**
         * @cfg {Object} data (required)
         *
         * Data to be consumed by the exporter should look like this:
         *
         *      {
         *          columns: [{
         *              text: 'First column'
         *          },{
         *              text: 'Second column',
         *              columns: [{ // columns is optional
         *                  text: '2nd column 1'
         *              },{
         *                  text: '2nd column 2'
         *              }]
         *          }],
         *
         *          groups: [{
         *              // if the first level group is missing then the exported document will
         *              // only contain column headers and no data
         *
         *              text: '1st level group', // text is optional; hidden when missing.
         *              rows: [
         *                  [1.23, 4.65, 3.23],
         *                  [10.23, 7.45, 7.93]
         *              ],
         *              summary: [11.46, 14.10, 11.16] // summary is optional; hidden when missing.
         *
         *              groups: [{ // groups is optional; hidden when missing;
         *                  text: '2nd level group',
         *                  rows: [...],
         *                  summary: [...],
         *
         *                  groups: [...]
         *              }]
         *          }]
         *      }
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
        title: '',
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
    /**
     * Generates the file content.
     */
    getContent: Ext.identityFn,
    /**
     * Save the file on user's machine using the content generated by this exporter.
     */
    saveAs: function() {
        Ext.exporter.File.saveAs(this.getContent(), this.getFileName(), this.getCharset());
    },
    /**
     * Returns the number of columns available in the provided `columns` array.
     * It will parse the whole tree structure to count the bottom level columns too.
     *
     * @param columns
     * @returns {Number}
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
        if (Ext.isObject(data)) {
            data.columns = data.columns || [];
            this.fixColumns(data.columns, this.getColDepth(data.columns, -1));
        } else {
            data = {};
        }
        data.groups = data.groups || [];
        return data;
    },
    getColDepth: function(columns, level) {
        var m = 0;
        if (!columns) {
            return level;
        }
        for (var i = 0; i < columns.length; i++) {
            columns[i].level = level + 1;
            m = Math.max(m, this.getColDepth(columns[i].columns, level + 1));
        }
        return m;
    },
    fixColumns: function(columns, depth) {
        var col;
        if (!columns) {
            return;
        }
        for (var i = 0; i < columns.length; i++) {
            col = columns[i];
            if (!col.columns && depth > col.level) {
                col.columns = [];
                col.columns.push({
                    text: '',
                    level: col.level + 1
                });
            }
            this.fixColumns(col.columns, depth);
        }
    }
});

/**
 * This is the base class for a file object. This one should be extended
 * by classes that generate content based on templates.
 *
 */
Ext.define('Ext.exporter.file.Base', {
    requires: [
        'Ext.XTemplate',
        'Ext.util.Collection'
    ],
    config: {
        /**
         * @cfg {String} id
         *
         * Unique id for this object. Auto generated when missing.
         */
        id: ''
    },
    tpl: null,
    constructor: function(config) {
        var me = this;
        me.initConfig(config || {});
        return me.callParent(arguments);
    },
    applyId: function(data, id) {
        if (Ext.isEmpty(id)) {
            id = Ext.id();
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
     * @returns {*}
     */
    checkCollection: function(data, dataCollection, className) {
        if (!dataCollection) {
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
        return new Ext.util.Collection({
            decoder: this.getCollectionDecoder(className)
        });
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
            return Ext.create(className, config || {});
        };
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
        '<tpl for="tables">{[values.render()]}</tpl>',
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
        this.getTables().destroy();
        return this.callParent(arguments);
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
    },
    getRenderData: function() {
        return Ext.apply(this.callParent(arguments), {
            tables: this.getTables().getRange()
        });
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
        '<tpl for="columns">{[values.render()]}</tpl>',
        '<tpl if="this.exists(rows)">',
        '<tpl for="rows">{[values.render()]}</tpl>',
        '<tpl else>         <Row ss:AutoFitHeight="0"/>\n</tpl>',
        '       </Table>\n',
        {
            exists: function(value) {
                return !Ext.isEmpty(value);
            }
        }
    ],
    destroy: function() {
        this.getColumns().destroy();
        this.getRows().destroy();
        return this.callParent(arguments);
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
    },
    getRenderData: function() {
        return Ext.apply(this.callParent(arguments), {
            columns: this.getColumns().getRange(),
            rows: this.getRows().getRange()
        });
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
 *
 */
Ext.define('Ext.exporter.file.excel.Style', {
    extend: 'Ext.exporter.file.Base',
    config: {
        /**
         * @cfg {String} id
         * A unique name within this XML document that identifies this style. This string can be any valid
         * identifier and there is no notion of order. The special value of "Default" indicates that this style
         * represents the default formatting for this workbook.
         *
         */
        /**
         * @cfg {String} parentId
         *
         * Presence of this element indicates that this style should first inherit it's default formatting settings
         * from the specified parent style. Then, after the parent settings are inherited, we apply the settings in
         * this style as overrides. This attribute refers to a predefined style ID.
         *
         */
        parentId: null,
        /**
         * @cfg {String} name
         *
         * This property identifies this style as a named style that was created in Excel using the Style
         * command (Format menu). Duplicate names are illegal.
         *
         */
        name: null,
        /**
         * @cfg {Object} protection Defines the protection properties that should be used in cells referencing this style.
         * This element exists as a short-hand way to apply protection to an entire table, row, or column, by simply adding it to a style.
         *
         * Following keys are allowed on this object and are all optional:
         *
         * - **Protected** (Boolean): This attribute indicates whether or not this cell is protected. When the worksheet is
         * unprotected, cell-level protection has no effect. When a cell is protected, it will not allow the user to
         * enter information into it. Defaults to `true`.
         *
         * - **HideFormula** (Boolean): This attribute indicates whether or not this cell's formula should be hidden when
         * worksheet protection is enabled. Defaults to `false`.
         *
         */
        protection: null,
        /**
         * @cfg {Object} alignment
         *
         * Following keys are allowed on this object and are all optional:
         *
         * - **Horizontal** (String): specifies the left-to-right alignment of text within a cell. The Spreadsheet component
         * does not support `CenterAcrossSelection`, `Fill`, `Justify`, `Distributed`, and `JustifyDistributed`.
         * Possible values: `Automatic`, `Left`, `Center`, `Right`, `Fill`, `Justify`, `CenterAcrossSelection`, `Distributed`,
         * and `JustifyDistributed`. Default is `Automatic`.
         *
         * - **Indent** (Integer): specifies the number of indents. This attribute is not supported by the Spreadsheet component.
         * Defaults to `0`.
         *
         * - **ReadingOrder** (String): specifies the default right-to-left text entry mode for a cell. The Spreadsheet component
         * does not support `Context`. Possible values: `RightToLeft`, `LeftToRight`, and `Context`. Defaults to `Context`.
         *
         * - **Rotate** (Double): Specifies the rotation of the text within the cell. `90` is straight up, `0` is horizontal,
         * and `-90` is straight down. The Spreadsheet component does not support this attribute. Defaults to `0`.
         *
         * - **ShrinkToFit** (Boolean): `true` means that the text size should be shrunk so that all of the text fits within the cell.
         * `false` means that the font within the cell should behave normally. The Spreadsheet component does not support this attribute.
         * Defaults to `false`.
         *
         * - **Vertical** (String): specifies the top-to-bottom alignment of text within a cell. `Distributed` and
         * `JustifyDistributed` are only legitimate values when **VerticalText** is `1`. The Spreadsheet component does
         * not support `Justify`, `Distributed`, or `JustifyDistributed`. Possible values: `Automatic`, `Top`, `Bottom`,
         * `Center`, `Justify`, `Distributed`, and `JustifyDistributed`. Defaults to `Automatic`.
         *
         * - **VerticalText** (Boolean): `true` specifies whether the text is drawn "downwards", whereby each letter is drawn horizontally,
         * one above the other. The Spreadsheet component does not support this attribute. Defaults to `false`.
         *
         * - **WrapText** (Boolean): specifies whether the text in this cell should wrap at the cell boundary. `false` means that
         * text either spills or gets truncated at the cell boundary (depending on whether the adjacent cell(s) have content).
         * The Spreadsheet component does not support this attribute. Defaults to `false`.
         *
         */
        alignment: null,
        /**
         * @cfg {Object} font Defines the font attributes to use in this style. Each attribute that is specified is
         * considered an override from the default.
         *
         *
         * Following keys are allowed on this object:
         *
         * - **Bold** (Boolean): Specifies the bold state of the font. If the parent style has **Bold**: `true` and the child style wants
         * to override the setting, it must explicitly set the value to **Bold**: `false`. If this attribute is not specified
         * within an element, the default is assumed. Defaults to `false`.
         *
         * - **Color** (String): Specifies the color of the font. This value can be either a 6-hexadecimal digit number
         * in "#rrggbb" format or it can be any of the Internet Explorer named colors (including the named Windows colors).
         * This string can also be special value of `Automatic`. This string is case insensitive. If this attribute is not
         * specified within an element, the default is assumed. Defaults to `Automatic`.
         *
         * - **FontName** (String): Specifies the name of the font. This string is case insensitive. If this attribute is
         * not specified within an element, the default is assumed. Defaults to `Arial`.
         *
         * - **Italic** (Boolean): Similar to **Bold** in behavior, this attribute specifies the italic state of the font.
         * If this attribute is not specified within an element, the default is assumed. Defaults to `false`.
         *
         * - **Outline** (Boolean): Similar to **Bold** in behavior, this attribute specifies whether the font is rendered as an
         * outline. This property originates in Macintosh Office, and is not used on Windows. If this attribute is not
         * specified within an element, the default is assumed. The Spreadsheet component does not support this attribute.
         * Defaults to `false`.
         *
         * - **Shadow** (Boolean): Similar to **Bold** in behavior, this attribute specifies whether the font is shadowed.
         * This property originates in Macintosh Office, and is not used on Windows. If this attribute is not
         * specified within an element, the default is assumed. The Spreadsheet component does not support this attribute.
         * Defaults to `false`.
         *
         * - **Size** (Number): Specifies the size of the font in points. This value must be strictly greater than 0.
         * If this attribute is not specified within an element, the default is assumed. Defaults to `10`.
         *
         * - **StrikeThrough** (Boolean): Similar to **Bold** in behavior, this attribute specifies the strike-through state
         * of the font. If this attribute is not specified within an element, the default is assumed. The Spreadsheet
         * component does not support this attribute. Defaults to `false`.
         *
         * - **Underline** (String): Specifies the underline state of the font. If the parent style is something other than
         * None and a child style wants to override the value, it must explicitly reset the value. If this attribute is
         * not specified within an element, the default is assumed. Possible values: `None`, `Single`, `Double`,
         * `SingleAccounting`, and `DoubleAccounting`. Defaults to `None`.
         *
         * - **VerticalAlign** (String): This attribute specifies the subscript or superscript state of the font. If this
         * attribute is not specified within an element, the default is assumed. The Spreadsheet component does not
         * support this attribute. Possible values: `None`, `Subscript`, and `Superscript`. Defaults to `None`.
         *
         * - **CharSet** (Number): Win32-dependent character set value. Defaults to `0`.
         *
         * - **Family** (String): Win32-dependent font family. Possible values: `Automatic`, `Decorative`, `Modern`,
         * `Roman`, `Script`, and `Swiss`. Defaults to `Automatic`.
         *
         */
        font: null,
        /**
         * @cfg {Object} interior Defines the fill properties to use in this style. Each attribute that is specified is
         * considered an override from the default.
         *
         * Following keys are allowed on this object:
         *
         * - **Color** (String): Specifies the fill color of the cell. This value can be either a 6-hexadecimal digit
         * number in "#rrggbb" format or it can be any of the Internet Explorer named colors (including the named
         * Windows colors). This string can also be special value of `Automatic`. This string is case insensitive.
         * If **Pattern**: "Solid", this value is the fill color of the cell. Otherwise, the cell is filled with a blend of
         * **Color** and **PatternColor**, with the **Pattern** attribute choosing the appearance.
         *
         * - **Pattern** (String): Specifies the fill pattern in the cell. The fill pattern determines how to blend the
         * **Color** and **PatternColor** attributes to produce the cell's appearance. The Spreadsheet component does not
         * support this attribute. Possible values: `None`, `Solid`, `Gray75`, `Gray50`, `Gray25`, `Gray125`, `Gray0625`,
         * `HorzStripe`, `VertStripe`, `ReverseDiagStripe`, `DiagStripe`, `DiagCross`, `ThickDiagCross`,
         * `ThinHorzStripe`, `ThinVertStripe`, `ThinReverseDiagStripe`, `ThinDiagStripe`, `ThinHorzCross`, and
         * `ThinDiagCross`. Defaults to `None`.
         *
         * - **PatternColor** (String): Specifies the secondary fill color of the cell when **Pattern** does not equal `Solid`.
         * The Spreadsheet component does not support this attribute. Defaults to `Automatic`.
         *
         */
        interior: null,
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
        format: null,
        /**
         * @cfg {Object[]} borders
         *
         * Array of border objects. Following keys are allowed for border objects:
         *
         * - **Position** (String): Specifies which of the six possible borders this element represents. Duplicate
         * borders are not permitted and are considered invalid. The Spreadsheet component does not support
         * `DiagonalLeft` or `DiagonalRight`. Possible values: `Left`, `Top`, `Right`, `Bottom`, `DiagonalLeft`, and
         * `DiagonalRight`
         *
         * - **Color** (String): Specifies the color of this border. This value can be either a 6-hexadecimal digit
         * number in "#rrggbb" format or it can be any of the Microsoft® Internet Explorer named colors
         * (including the named Microsoft Windows® colors). This string can also be the special value of `Automatic`.
         * This string is case insensitive.
         *
         * - **LineStyle** (String): Specifies the appearance of this border. The Spreadsheet component does
         * not support `SlantDashDot` and `Double`. Possible values: `None`, `Continuous`, `Dash`, `Dot`, `DashDot`,
         * `DashDotDot`, `SlantDashDot`, and `Double`.
         *
         * - **Weight** (Number): Specifies the weight (or thickness) of this border. This measurement is specified in points,
         * and the following values map to Excel: `0`—Hairline, `1`—Thin, `2`—Medium, `3`—Thick.
         *
         */
        borders: null
    },
    statics: {
        // used to validate the provided values
        checks: {
            alignment: {
                Horizontal: [
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
                Indent: null,
                ReadingOrder: [
                    'LeftToRight',
                    'RightToLeft',
                    'Context'
                ],
                Rotate: null,
                ShrinkToFit: [
                    true,
                    false
                ],
                Vertical: [
                    'Automatic',
                    'Top',
                    'Bottom',
                    'Center',
                    'Justify',
                    'Distributed',
                    'JustifyDistributed'
                ],
                VerticalText: [
                    true,
                    false
                ],
                WrapText: [
                    true,
                    false
                ]
            },
            font: {
                Bold: [
                    true,
                    false
                ],
                CharSet: null,
                Color: null,
                FontName: null,
                // this means that all font names are allowed
                Family: [
                    'Automatic',
                    'Decorative',
                    'Modern',
                    'Roman',
                    'Script',
                    'Swiss'
                ],
                Italic: [
                    true,
                    false
                ],
                Outline: [
                    true,
                    false
                ],
                Shadow: [
                    true,
                    false
                ],
                Size: null,
                // all sizes allowed
                StrikeThrough: [
                    true,
                    false
                ],
                Underline: [
                    'None',
                    'Single',
                    'Double',
                    'SingleAccounting',
                    'DoubleAccounting'
                ],
                VerticalAlign: [
                    'None',
                    'Subscript',
                    'Superscript'
                ]
            },
            border: {
                Position: [
                    'Left',
                    'Top',
                    'Right',
                    'Bottom',
                    'DiagonalLeft',
                    'DiagonalRight'
                ],
                Color: null,
                LineStyle: [
                    'None',
                    'Continuous',
                    'Dash',
                    'Dot',
                    'DashDot',
                    'DashDotDot',
                    'SlantDashDot',
                    'Double'
                ],
                Weight: [
                    0,
                    1,
                    2,
                    3
                ]
            },
            interior: {
                Color: null,
                Pattern: [
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
                ],
                PatternColor: null
            },
            protection: {
                Protected: [
                    true,
                    false
                ],
                HideFormula: [
                    true,
                    false
                ]
            }
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
                    checks = this.owner.self.checks,
                    keys = Ext.Object.getKeys(obj || {}),
                    len = keys.length,
                    s = '',
                    i, arr, key;
                if (checks[checkName]) {
                    for (i = 0; i < len; i++) {
                        key = keys[i];
                        arr = checks[checkName][key];
                        // add the key/value pair if the provided value exists
                        if (Ext.isEmpty(arr) || Ext.Array.indexOf(arr, obj[key]) >= 0) {
                            s += Ext.String.format(template, key, Ext.isBoolean(obj[key]) ? Number(obj[key]) : obj[key]);
                        } else {
                            Ext.raise(Ext.String.format('Invalid key (%0) or value (%1) provided for Style!', key, obj[key]));
                        }
                    }
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
        '<tpl for="cells">{[values.render()]}</tpl>',
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
        this.getCells().destroy();
        return this.callParent(arguments);
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
    },
    getRenderData: function() {
        return Ext.apply(this.callParent(arguments), {
            cells: this.getCells().getRange()
        });
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
 *
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
        '                   <Data ss:Type="{dataType}">{[this.formatValue(values.value)]}</Data>\n',
        '               </Cell>\n',
        {
            exists: function(value) {
                return !Ext.isEmpty(value);
            },
            formatValue: function(value) {
                var format = Ext.util.Format;
                return (value instanceof Date ? Ext.Date.format(value, 'Y-m-d\\TH:i:s.u') : format.htmlEncode(format.htmlDecode(value)));
            }
        }
    ],
    render: function() {
        var me = this,
            v = me.getValue();
        // let's detect the data type
        if (v instanceof Date) {
            me.setDataType('DateTime');
        } else if (Ext.isNumeric(v)) {
            me.setDataType('Number');
        } else {
            me.setDataType('String');
        }
        return me.callParent(arguments);
    }
});

/**
 * This class generates an Excel XML workbook.
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
        '<tpl for="styles">{[values.render()]}</tpl>',
        '   </Styles>\n',
        '<tpl for="worksheets">{[values.render()]}</tpl>',
        '</Workbook>'
    ],
    destroy: function() {
        this.getStyles().destroy();
        this.getWorksheets().destroy();
        return this.callParent(arguments);
    },
    getRenderData: function() {
        return Ext.apply(this.callParent(arguments), {
            worksheets: this.getWorksheets().getRange(),
            styles: this.getStyles().getRange()
        });
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
 * This exporter produces XML Excel files for the supplied data.
 */
Ext.define('Ext.exporter.Excel', {
    extend: 'Ext.exporter.Base',
    alias: 'exporter.excel',
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
                Vertical: 'Top'
            },
            font: {
                FontName: 'Calibri',
                Family: 'Swiss',
                Size: 11,
                Color: '#000000'
            }
        },
        /**
         * @cfg {Ext.exporter.file.excel.Style} titleStyle
         *
         * Default style applied to the title
         */
        titleStyle: {
            name: 'Title',
            alignment: {
                Horizontal: 'Center',
                Vertical: 'Center'
            },
            font: {
                FontName: 'Cambria',
                Family: 'Swiss',
                Size: 18,
                Color: '#1F497D'
            }
        },
        /**
         * @cfg {Ext.exporter.file.excel.Style} groupHeaderStyle
         *
         * Default style applied to the group headers
         */
        groupHeaderStyle: {
            name: 'Group Header',
            borders: [
                {
                    Position: 'Bottom',
                    LineStyle: 'Continuous',
                    Weight: 1,
                    Color: '#4F81BD'
                }
            ]
        },
        /**
         * @cfg {Ext.exporter.file.excel.Style} groupFooterStyle
         *
         * Default style applied to the group footers
         */
        groupFooterStyle: {
            name: 'Total Footer',
            borders: [
                {
                    Position: 'Top',
                    LineStyle: 'Continuous',
                    Weight: 1,
                    Color: '#4F81BD'
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
            alignment: {
                Horizontal: 'Center',
                Vertical: 'Center'
            },
            borders: [
                {
                    Position: 'Bottom',
                    LineStyle: 'Continuous',
                    Weight: 1,
                    Color: '#4F81BD'
                }
            ],
            font: {
                FontName: 'Calibri',
                Family: 'Swiss',
                Size: 11,
                Color: '#1F497D'
            }
        }
    },
    fileName: 'export.xml',
    destroy: function() {
        Ext.destroyMembers(this, 'workbook', 'table');
        this.workbook = this.table = null;
        return this.callParent(arguments);
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
        me.workbook = Ext.create('Ext.exporter.file.excel.Workbook', {
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
        me.groupFooterStyleId = me.workbook.addStyle(config.groupFooterStyle).getId();
        colMerge = me.getColumnCount(data.columns);
        me.addTitle(config, colMerge);
        me.buildHeader();
        me.buildRows(colMerge);
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
    buildRows: function(colMerge) {
        var me = this,
            data = me.getData(),
            groups = Ext.isDefined(data.groups) ? data.groups : Ext.Array.from(data),
            row;
        me.buildSummaryRows(groups, colMerge, 1);
        if (me.getShowSummary() !== false && Ext.isDefined(data.groups) && data.summary && data.summary.length > 0) {
            row = me.table.addRow({
                styleId: me.groupFooterStyleId
            });
            for (var j = 0; j < data.summary.length; j++) {
                row.addCell({
                    value: data.summary[j]
                });
            }
        }
    },
    buildSummaryRows: function(groups, colMerge, level) {
        var me = this,
            showSummary = me.getShowSummary(),
            g, row, styleH, styleF;
        if (!groups) {
            return;
        }
        styleH = me.workbook.addStyle({
            parentId: me.groupHeaderStyleId,
            alignment: {
                Horizontal: 'Left',
                Indent: level - 1
            }
        });
        styleF = me.workbook.addStyle({
            parentId: me.groupFooterStyleId,
            alignment: {
                Horizontal: 'Left',
                Indent: level - 1
            }
        });
        for (var i = 0; i < groups.length; i++) {
            g = groups[i];
            if (showSummary !== false && !Ext.isEmpty(g.text)) {
                me.table.addRow({
                    styleId: me.groupHeaderStyleId
                }).addCell({
                    mergeAcross: colMerge - 1,
                    value: g.text,
                    styleId: styleH.getId()
                });
            }
            me.buildSummaryRows(g.groups, colMerge, level + 1);
            me.buildGroupRows(g.rows);
            if (showSummary !== false && g.summary && g.summary.length > 0) {
                // that's the summary footer
                row = me.table.addRow({
                    styleId: me.groupFooterStyleId
                });
                for (var j = 0; j < g.summary.length; j++) {
                    row.addCell({
                        value: g.summary[j],
                        styleId: (j === 0 ? styleF.getId() : null)
                    });
                }
            }
        }
    },
    buildGroupRows: function(lines) {
        var l, row, i, j;
        if (!lines) {
            return;
        }
        for (i = 0; i < lines.length; i++) {
            row = this.table.addRow();
            l = lines[i];
            for (j = 0; j < l.length; j++) {
                row.addCell({
                    value: l[j]
                });
            }
        }
    },
    buildHeader: function() {
        var me = this,
            ret = {},
            keys, row, i, j, len, lenCells;
        me.buildHeaderRows(me.getData().columns, ret);
        keys = Ext.Object.getKeys(ret);
        len = keys.length;
        for (i = 0; i < len; i++) {
            row = me.table.addRow({
                height: 20.25,
                autoFitHeight: 1,
                styleId: me.tableHeaderStyleId
            });
            lenCells = ret[keys[i]].length;
            for (j = 0; j < lenCells; j++) {
                row.addCell(ret[keys[i]][j]);
            }
        }
    },
    buildHeaderRows: function(columns, result) {
        var col, count, s;
        if (!columns) {
            return;
        }
        for (var i = 0; i < columns.length; i++) {
            col = columns[i];
            count = this.getColumnCount(col.columns);
            result['s' + col.level] = result['s' + col.level] || [];
            s = {
                value: this.sanitizeHtml(col.text)
            };
            if (count > 1) {
                Ext.apply(s, {
                    mergeAcross: count - 1
                });
            }
            result['s' + col.level].push(s);
            this.buildHeaderRows(col.columns, result);
        }
    },
    sanitizeHtml: function(value) {
        value = String(value).replace('<br>', " ");
        value = value.replace('<br/>', " ");
        // strip html tags
        return value.replace(/<\/?[^>]+>/gi, '');
    }
});

/**
 * This plugin allows grid data export using various exporters. Each exporter should extend
 * the {@link Ext.exporter.Base Base} class.
 *
 * Two new methods are created on the grid panel by this plugin:
 *
 *  - saveDocumentAs(config): saves the document
 *  - getDocumentData(config): returns the document content
 *
 *  The grid data is exported for all grid columns that have the flag {@link Ext.grid.column.Column#ignoreExport ignoreExport} as false.
 *  If columns have formatters then these are applied to the exported data.
 *
 * Example usage:
 *
 *      {
 *          xtype: 'grid',
 *          plugins: [{
 *              ptype: 'gridexporter'
 *          }]
 *      }
 *
 *      grid.saveDocumentAs({
 *          type: 'excel',
 *          title: 'My export',
 *          fileName: 'myExport.xml'
 *      });
 *
 */
Ext.define('Ext.grid.plugin.Exporter', {
    alias: [
        'plugin.gridexporter'
    ],
    extend: 'Ext.AbstractPlugin',
    requires: [
        'Ext.exporter.Excel'
    ],
    /**
     *  `"both"` (the default) - The plugin is added to both grids
     *  `"top"` - The plugin is added to the containing Panel
     *  `"locked"` - The plugin is added to the locked (left) grid
     *  `"normal"` - The plugin is added to the normal (right) grid
     *
     * @private
     */
    lockableScope: 'top',
    init: function(grid) {
        var me = this;
        grid.saveDocumentAs = Ext.bind(me.saveDocumentAs, me);
        grid.getDocumentData = Ext.bind(me.getDocumentData, me);
        me.grid = grid;
        return me.callParent(arguments);
    },
    destroy: function() {
        var me = this;
        me.grid.saveDocumentAs = me.grid.getDocumentData = me.grid = null;
        return me.callParent(arguments);
    },
    /**
     * Save the export file. This method is added to the grid panel as "saveDocumentAs".
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
     */
    saveDocumentAs: function(config) {
        var exporter;
        if (this.disabled) {
            return;
        }
        exporter = this.getExporter.apply(this, arguments);
        exporter.saveAs();
        Ext.destroy(exporter);
    },
    /**
     * Fetch the export data. This method is added to the grid panel as "getDocumentData".
     *
     * Pass in exporter specific configs to the config parameter.
     *
     * @param {Ext.exporter.Base} config Config object used to initialize the proper exporter
     * @param {String} [config.type] Type of the exporter as defined in the exporter alias. Default is `excel`.
     * @param {String} [config.title] Title added to the export document
     * @param {String} [config.author] Who exported the document?
     * @returns {String}
     *
     */
    getDocumentData: function(config) {
        var exporter, ret;
        if (this.disabled) {
            return;
        }
        exporter = this.getExporter.apply(this, arguments);
        ret = exporter.getContent();
        Ext.destroy(exporter);
        return ret;
    },
    /**
     * Builds the exporter object and returns it.
     *
     * @param {Object} config
     * @returns {Ext.exporter.Base}
     *
     * @private
     */
    getExporter: function(config) {
        return Ext.Factory.exporter(Ext.apply({
            type: 'excel',
            data: this.prepareData()
        }, config || {}));
    },
    /**
     * This method creates the data object that will be consumed by the exporter.
     * @returns {Object}
     *
     * @private
     */
    prepareData: function() {
        var me = this,
            grid = me.grid,
            headers, group;
        group = me.extractGroups(grid.getColumnManager().getColumns());
        if (grid.lockedGrid) {
            headers = Ext.Array.merge(me.getColumnHeaders(grid.lockedGrid.headerCt.items), me.getColumnHeaders(grid.normalGrid.headerCt.items));
        } else {
            headers = me.getColumnHeaders(grid.headerCt.items);
        }
        return {
            columns: headers,
            groups: [
                group
            ]
        };
    },
    /**
     * Fetch all columns that will be exported
     * @param columns
     * @returns {Array}
     *
     * @private
     */
    getColumnHeaders: function(columns) {
        var cols = [],
            i, obj, col;
        for (i = 0; i < columns.length; i++) {
            col = columns.get(i);
            // each column has a config 'ignoreExport' that can tell us to ignore the column on export
            if (!col.ignoreExport) {
                obj = {
                    text: col.text
                };
                if (col.isGroupHeader) {
                    obj.columns = this.getColumnHeaders(col.items);
                    if (obj.columns.length === 0) {
                        // all children columns are ignored for export so there's no need to export this grouped header
                        obj = null;
                    }
                }
                if (obj) {
                    cols.push(obj);
                }
            }
        }
        return cols;
    },
    /**
     * Generate the data that the exporter can consume
     *
     * @param columns
     * @returns {Object}
     *
     * @private
     */
    extractGroups: function(columns) {
        var store = this.grid.getStore(),
            len = store.getCount(),
            lenCols = columns.length,
            group = {
                rows: []
            },
            i, j, record, row, col, useRenderer, v;
        // we could also export grouped stores
        for (i = 0; i < len; i++) {
            record = store.getAt(i);
            row = [];
            for (j = 0; j < lenCols; j++) {
                col = columns[j];
                // each column has a config 'ignoreExport' that can tell us to ignore the column on export
                if (!col.ignoreExport) {
                    useRenderer = !Ext.isEmpty(col.initialConfig.formatter) && Ext.isEmpty(col.formatter);
                    v = record.get(col.dataIndex) || '';
                    row.push(useRenderer ? col.renderer(v) : v);
                }
            }
            group.rows.push(row);
        }
        return group;
    }
});

