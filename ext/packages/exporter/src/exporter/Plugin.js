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
    init: function (cmp) {
        var me = this;

        cmp.saveDocumentAs = Ext.bind(me.saveDocumentAs, me);
        cmp.getDocumentData = Ext.bind(me.getDocumentData, me);
        me.cmp = cmp;

        return me.callParent([cmp]);
    },

    destroy: function(){
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
    saveDocumentAs: function(config){
        var me = this;

        me.cmp.fireEvent('beforedocumentsave', me.cmp);

        return new Ext.Promise(function (resolve, reject) {
            Ext.asap(me.delayedSave, me, [config, resolve, reject]);
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
    delayedSave: function(config, resolve, reject){
        var me = this,
            cmp = me.cmp,
            exporter;

        // the plugin might be disabled or the component is already destroyed
        if(me.disabled || !cmp){
            reject();
            return;
        }

        exporter = me.getExporter(config);
        cmp.fireEvent('dataready', cmp, exporter.getData());

        exporter.saveAs().then(function(){
            Ext.destroy(exporter);
            // since this call is async the cmp might have been destroyed already.
            if(!cmp){
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
    getDocumentData: function(config){
        var exporter, ret;

        if(this.disabled){
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
    getExporter: function(config){
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
    getExportStyle: function(style, config){
        var type = (config && config.type),
            types, def, index;

        if(Ext.isArray(style)) {
            types = Ext.Array.pluck(style, 'type');
            index = Ext.Array.indexOf(types, undefined);
            if (index >= 0) {
                // we found a default style which means that all others are exceptions
                def = style[index];
            }

            index = Ext.Array.indexOf(types, type);
            return index >= 0 ? style[index] : def;
        }else{
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