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

    destroy: function(){
        this.callParent();
        this.setColumns(null);
        this.setGroups(null);
    },

    applyColumns: function(data, dataCollection){
        return this.checkCollection(data, dataCollection, 'Ext.exporter.data.Column');
    },

    updateColumns: function(collection, oldCollection){
        var me = this;

        if(oldCollection){
            oldCollection.un({
                add: me.onColumnAdd,
                remove: me.onColumnRemove,
                scope: me
            });
            Ext.destroy(oldCollection.items, oldCollection);
        }
        if(collection){
            collection.on({
                add: me.onColumnAdd,
                remove: me.onColumnRemove,
                scope: me
            });
            me.onColumnAdd(collection, {items: collection.getRange()});
            me.syncColumns();
        }
    },

    syncColumns: function(){
        var cols = this.getColumns(),
            depth = this.getColDepth(cols, -1),
            result = {},
            i, j, length, len, keys, arr, prevCol, index;

        if(!cols){
            return;
        }
        length = cols.length;
        for(i = 0; i < length; i++){
            cols.getAt(i).sync(depth);
        }
        this.getColumnLevels(cols, depth, result);
        keys = Ext.Object.getKeys(result);
        length = keys.length;

        for(i = 0; i < length; i++){
            arr = result[keys[i]];
            len = arr.length;
            for(j = 0; j < len; j++){
                if(j === 0){
                    index = 1;
                }else if(arr[j - 1]) {
                    prevCol = arr[j - 1].getConfig();
                    index += (prevCol.mergeAcross ? prevCol.mergeAcross + 1 : 1);
                }else{
                    index++;
                }
                if(arr[j]){
                    arr[j].setIndex(index);
                }
            }
        }
    },

    getLeveledColumns: function(){
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
    getBottomColumns: function(){
        var result = this.getLeveledColumns(),
            keys, len;

        keys = Ext.Object.getKeys(result);
        len = keys.length;

        return len ? result[keys[keys.length - 1]] : [];
    },

    getColumnLevels: function(columns, depth, result, topDown){
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

            if(!cols) {
                for (j = level + 1; j <= depth; j++) {
                    name = 's' + j;
                    result[name] = result[name] || [];
                    result[name].push(topDown ? col : null);
                }
            }else{
                this.getColumnLevels(cols, depth, result, topDown);
            }
        }
    },

    onColumnAdd: function(collection, details){
        var items = details.items,
            length = items.length,
            i, item;

        for(i = 0; i < length; i++) {
            item = items[i];
            item.setTable(this);
            item.setLevel(0);
        }
        this.syncColumns();
    },

    onColumnRemove: function(collection, details){
        Ext.destroy(details.items);
        this.syncColumns();
    },

    getColumnCount: function(){
        var cols = this.getColumns(),
            s = 0,
            i, length;

        if(cols) {
            length = cols.length;
            for (i = 0; i < length; i++) {
                s += cols.getAt(i).getColumnCount();
            }
        }
        return s;
    },

    getColDepth: function(columns, level){
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
    addColumn: function(config){
        if(!this.getColumns()){
            this.setColumns([]);
        }
        return this.getColumns().add(config || {});
    },

    /**
     * Convenience method to fetch a column by its id.
     * @param id
     * @return {Ext.exporter.data.Column}
     */
    getColumn: function(id){
        var cols = this.getColumns();

        if(!cols){
            return null;
        }
        return cols.get(id);
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
    }
});