/**
 * This is a container that holds {Ext.pivot.plugin.configurator.Column fields}.
 *
 * @private
 */
Ext.define('Ext.pivot.plugin.configurator.Container', {
    extend: 'Ext.dataview.List',

    alias: 'widget.pivotconfigcontainer',

    requires: [
        'Ext.pivot.plugin.configurator.Column',
        'Ext.pivot.plugin.configurator.DragZone',
        'Ext.pivot.plugin.configurator.DropZone'
    ],

    handleSorting:              false,
    handleFiltering:            false,
    isConfiguratorContainer:    true,
    useSimpleItems:             false,
    disableSelection:           true,
    defaultType:                'pivotconfigfield',
    deferEmptyText:             false,

    touchAction: {
        panX: false,
        pinchZoom: false,
        doubleTapZoom: false
    },

    store: {
        type: 'array',
        fields: [
            {name: 'text', type: 'string'},
            {name: 'field', type: 'auto'}
        ]
    },

    items: [{
        docked:     'top',
        xtype:      'titlebar',
        titleAlign: 'left'
    }],

    config: {
        /**
         * Possible values:
         *
         * - `all` = the container is the "all fields" area;
         * - `aggregate` = the container is the "values" area;
         * - `leftAxis` = the container is the "row values" area;
         * - `topAxis` = the container is the "column values" area;
         *
         * @private
         */
        fieldType:      'all',
        title:          null
    },

    initialize: function() {
        var me = this;

        me.callParent();
        me.dragZone = new Ext.pivot.plugin.configurator.DragZone(me);
        me.dropZone = new Ext.pivot.plugin.configurator.DropZone(me);

        if (me.getFieldType() !== 'all') {
            me.container.element.on({
                delegate: '.' + Ext.baseCSSPrefix + 'pivot-grid-config-column-btn',
                tap: 'handleColumnBtnTap',
                scope: me
            });

            me.container.element.on({
                delegate: '.' + Ext.baseCSSPrefix + 'list-item-body',
                tap: 'handleColumnTap',
                scope: me
            });
        }
    },

    destroy: function(){
        Ext.destroyMembers(this, 'storeListeners', 'dragZone', 'dropZone');
        this.callParent();
    },

    updateTitle: function(title){
        var titleBar = this.down('titlebar');

        if(titleBar){
            titleBar.setTitle(title);
        }
    },

    updateFieldType: function(type){
        if(type !== 'all'){
            this.setUserCls(Ext.baseCSSPrefix + 'pivot-grid-config-container');
        }
    },

    updateStore: function(store){
        var me = this;

        Ext.destroy(me.storeListeners);
        if(store){
            me.storeListeners = store.on({
                datachanged: me.applyChanges,
                scope: me
            });
        }
    },

    /**
     * This is used for firing the 'configchange' event
     *
     */
    applyChanges: function(){
        if(this.getFieldType() !== 'all') {
            this.fireEvent('configchange', this);
        }
    },

    /**
     * This is used for adding a new config field to this container.
     *
     * @private
     */
    addField: function(config, pos){
        var me = this,
            store = me.getStore(),
            fieldType = me.getFieldType(),
            cfg = {};

        config.isAggregate = (fieldType === 'aggregate');
        Ext.apply(cfg, {
            field:      config,
            text:       config.getFieldText()
        });

        if(pos >= 0){
            store.insert(pos, cfg);
        }else{
            store.add(cfg);
        }
    },

    removeField: function(record){
        this.getStore().remove(record);
        record.set('field', null);
    },

    moveField: function(record, pos){
        var store = this.getStore(),
            index = store.indexOf(record);

        if(pos === -1 && index === store.getCount() - 1){
            // nothing to do here;
            // the record is already on the last position in the store
            return;
        }

        store.remove(record);
        if(pos >= 0){
            store.insert(pos, record);
        }else{
            store.add(record);
        }
    },

    handleColumnBtnTap: function(e){
        var me = this,
            target = Ext.fly(e.currentTarget),
            item = target.up('.' + me.getBaseCls() + '-item').component,
            record = me.getStore().getAt(item.$dataIndex);

        if(!record){
            return;
        }

        if(target.hasCls(Ext.baseCSSPrefix + 'pivot-grid-config-column-btn-delete')){
            me.removeField(record);
            return;
        }

        if(target.hasCls(Ext.baseCSSPrefix + 'pivot-grid-config-column-btn-tools')){
            me.fireEvent('toolsbtnpressed', me, item);
            return;
        }

    },

    handleColumnTap: function(e){
        var me = this,
            target = Ext.fly(e.currentTarget),
            item = target.up('.' + me.getBaseCls() + '-item').component,
            record = me.getStore().getAt(item.$dataIndex);

        if(!record){
            return;
        }
        me.fireEvent('toolsbtnpressed', me, item);
    }

});