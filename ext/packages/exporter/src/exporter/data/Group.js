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

    destroy: function(){
        var me = this;

        me.callParent();
        me.setRows(null);
        me.setSummaries(null);
        me.setGroups(null);
    },

    applyRows: function(data, dataCollection){
        return this.checkCollection(data, dataCollection, 'Ext.exporter.data.Row');
    },

    /**
     * Convenience method to add rows.
     * @param {Object/Array} config
     * @return {Ext.exporter.data.Row/Ext.exporter.data.Row[]}
     */
    addRow: function(config){
        if(!this.getRows()){
            this.setRows([]);
        }
        return this.getRows().add(config || {});
    },

    /**
     * Convenience method to fetch a row by its id.
     * @param id
     * @return {Ext.exporter.data.Row}
     */
    getRow: function(id){
        if(!this.getRows()){
            return null;
        }
        return this.getRows().get(id);
    },

    applyGroups: function(data, dataCollection){
        return this.checkCollection(data, dataCollection, 'Ext.exporter.data.Group');
    },

    /**
     * Convenience method to add groups.
     * @param {Object/Array} config
     * @return {Ext.exporter.data.Group/Ext.exporter.data.Group[]}
     */
    addGroup: function(config){
        if(!this.getGroups()){
            this.setGroups([]);
        }
        return this.getGroups().add(config || {});
    },

    /**
     * Convenience method to fetch a group by its id.
     * @param id
     * @return {Ext.exporter.data.Group}
     */
    getGroup: function(id){
        var groups = this.getGroups();

        if(!groups){
            return null;
        }
        return groups.get(id);
    },

    applySummaries: function(data, dataCollection){
        return this.checkCollection(data, dataCollection, 'Ext.exporter.data.Row');
    },

    applySummary: function(value){
        if(value) {
            this.addSummary(value);
        }
        return null;
    },

    /**
     * Convenience method to add summary rows.
     * @param {Object/Array} config
     * @return {Ext.exporter.data.Row/Ext.exporter.data.Row[]}
     */
    addSummary: function(config){
        if(!this.getSummaries()){
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
    getSummary: function(id){
        var col = this.getSummaries();

        return col ? col.get(id) : null;
    }
});