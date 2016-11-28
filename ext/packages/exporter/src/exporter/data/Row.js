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

    destroy: function(){
        this.callParent();
        this.setCells(null);
    },

    applyCells: function(data, dataCollection){
        return this.checkCollection(data, dataCollection, 'Ext.exporter.data.Cell');
    },

    /**
     * Convenience method to add cells.
     * @param {Object/Array} config
     * @return {Ext.exporter.data.Cell/Ext.exporter.data.Cell[]}
     */
    addCell: function(config){
        if(!this.getCells()){
            this.setCells([]);
        }
        return this.getCells().add(config || {});
    },

    /**
     * Convenience method to fetch a cell by its id.
     * @param id
     * @return {Ext.exporter.data.Cell}
     */
    getCell: function(id){
        if(!this.getCells()){
            return null;
        }
        return this.getCells().get(id);
    }
    
});