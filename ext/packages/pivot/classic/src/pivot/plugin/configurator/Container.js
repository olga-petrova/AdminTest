/**
 *
 * This is a container that holds {Ext.pivot.plugin.configurator.Column fields}.
 *
 *
 */
Ext.define('Ext.pivot.plugin.configurator.Container', {
    extend: 'Ext.panel.Panel',

    requires: [
        'Ext.pivot.plugin.configurator.Column'
    ],

    mixins: [
        'Ext.util.FocusableContainer'
    ],

    alias: 'widget.pivotconfigcontainer',
    
    childEls:                   ['innerCt', 'targetEl'],
    handleSorting:              false,
    handleFiltering:            false,
    position:                   'top',
    border:                     false,
    enableFocusableContainer:   true,
    isConfiguratorContainer:    true,

    cls:                        Ext.baseCSSPrefix + 'pivot-grid-config-container-body',
    dockedTopRightCls:          Ext.baseCSSPrefix + 'pivot-grid-config-container-body-tr',
    dockedBottomLeftCls:        Ext.baseCSSPrefix + 'pivot-grid-config-container-body-bl',
    hintTextCls:                Ext.baseCSSPrefix + 'pivot-grid-config-container-hint',

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
        dragDropText:   '&nbsp;'
    },

    initComponent: function(){
        var me = this;

        if(me.position == 'top' || me.position == 'bottom'){
            Ext.apply(me, {
                style:          'overflow:hidden',
                layout:         'column',
                height:         'auto'
            });
        }else{
            Ext.apply(me, {
                layout: {
                    type: 'vbox',
                    align:  'stretch'
                }
            });
        }

        if(me.position == 'top' || me.position == 'right') {
            me.cls += ' ' + me.dockedTopRightCls;
        }else{
            me.cls += ' ' + me.dockedBottomLeftCls;
        }

        me.callParent(arguments);
    },

    destroy: function(){
        var me = this;
        
        Ext.destroyMembers(me, 'relayers', 'targetEl');
        me.relayers = me.targetEl = null;

        me.callParent();
    },
    
    /**
     * This is used for firing the 'configchange' event
     *
     */
    applyChanges: function(field, force){
        if(this.getFieldType() != 'all' || force === true) {
            this.fireEvent('configchange', field || this);
        }
    },

    /**
     * This is used for adding a new config field to this container.
     *
     * @private
     */
    addField: function(config, pos, notify){
        var me = this,
            cfg = {xtype: 'pivotconfigfield'},
            newCol;

        Ext.apply(cfg, {
            field:          config,
            header:         config.getHeader()
        });

        if(pos != -1){
            newCol = me.insert(pos, cfg);
        }else{
            newCol = me.add(cfg);
        }

        if(notify === true){
            me.applyChanges(newCol);
        }
    },

    onAdd: function(column){
        this.hideGroupByText();

        column.setFieldType(this.getFieldType());
        this.callParent(arguments);
    },

    onRemove: function(){
        if(this.items.getCount() == 0){
            this.showGroupByText();
        }
    },

    /**
     * This is used for moving a field inside this container.
     *
     * @private
     */
    moveField: function(from, to, position){
        var me = this;

        if(Ext.isString(from)){
            from = me.items.getByKey(from);
        }
        if(Ext.isString(to)){
            to = me.items.getByKey(to);
        }

        if(from != to) {
            me['move' + Ext.String.capitalize(position)](from, to);
            me.applyChanges(from);
        }
    },

    /**
     * This is used to remove a field inside this container and apply changes
     *
     * @param {Ext.pivot.plugin.configurator.Column} field
     *
     * @private
     */
    removeField: function(field){
        this.remove(field);
        this.applyChanges();
    },

    /**
     * The container has an info text displayed inside. This function makes it visible.
     *
     * @private
     */
    showGroupByText: function(){
        var me = this;

        if(me.targetEl){
            me.targetEl.setHtml('<div class="' + me.hintTextCls + '">' + me.getDragDropText() + '</div>');
        }else{
            me.targetEl = me.innerCt.createChild();
        }
    },
    
    /**
     * The container has an info text displayed inside. This function hides it.
     *
     * @private
     */
    hideGroupByText: function(){
        if(this.targetEl){
            this.targetEl.setHtml('');
        }
    }
    
    
});