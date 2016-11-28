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

    constructor: function(config){
        var me = this;

        me.internalCols = [];
        me.initConfig(config);

        if(!me.getId()){
            me.setId('');
        }
        return me.callParent([config]);
    },

    destroy: function(){
        var cols = this.internalCols,
            len = cols.length,
            i, col;

        for(i = 0; i < len; i++){
            col = cols[i];
            Ext.destroy(col.items, col);
        }
        cols.length = 0;
        this.internalCols = null;

        this.callParent();
    },

    applyId: function(data, id){
        if(Ext.isEmpty(id)){
            id = Ext.id(null, this.getIdPrefix());
        }
        if(!Ext.isEmpty(data)){
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
    checkCollection: function(data, dataCollection, className){
        if(data && !dataCollection){
            dataCollection = this.constructCollection(className);
        }

        if(data){
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
    constructCollection: function(className){
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
    getCollectionDecoder: function(className){
        return function(config){
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
    getCollectionItemKey: function(item){
        return item.getKey ? item.getKey() : item.getId();
    }
});