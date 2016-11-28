/**
 * This class is used for creating a configurator field component.
 *
 * @private
 */
Ext.define('Ext.pivot.plugin.configurator.Column',{
    extend: 'Ext.dataview.component.ListItem',

    requires: [
        'Ext.pivot.plugin.configurator.Field'
    ],

    alias: 'widget.pivotconfigfield',

    userCls:            Ext.baseCSSPrefix + 'pivot-grid-config-column',
    filteredCls:        Ext.baseCSSPrefix + 'pivot-grid-config-column-filter',
    ascSortIconCls:     Ext.baseCSSPrefix + 'pivot-grid-config-column-btn-sort-asc',
    descSortIconCls:    Ext.baseCSSPrefix + 'pivot-grid-config-column-btn-sort-desc',

    config: {
        deleteCmp: {
            xtype: 'component',
            baseCls: Ext.baseCSSPrefix + 'pivot-grid-config-column-btn',
            cls: Ext.baseCSSPrefix + 'pivot-grid-config-column-btn-delete',
            docked: 'right',
            hidden: true
        },

        moveCmp: {
            xtype: 'component',
            baseCls: Ext.baseCSSPrefix + 'pivot-grid-config-column-btn',
            cls: Ext.baseCSSPrefix + 'pivot-grid-config-column-btn-move',
            docked: 'left'
        },

        sortCmp: {
            xtype: 'component',
            baseCls: Ext.baseCSSPrefix + 'pivot-grid-config-column-btn',
            docked: 'right',
            hidden: true
        }
    },

    applyDeleteCmp: function(cmp) {
        if (cmp && !cmp.isComponent) {
            cmp = Ext.factory(cmp, Ext.Component, this.getDeleteCmp());
        }
        return cmp;
    },

    updateDeleteCmp: function(cmp, oldCmp) {
        if (cmp) {
            this.add(cmp);
        }
        Ext.destroy(oldCmp);
    },

    applyMoveCmp: function(cmp) {
        if (cmp && !cmp.isComponent) {
            cmp = Ext.factory(cmp, Ext.Component, this.getMoveCmp());
        }
        return cmp;
    },

    updateMoveCmp: function(cmp, oldCmp) {
        if (cmp) {
            this.add(cmp);
        }
        Ext.destroy(oldCmp);
    },

    applySortCmp: function(cmp) {
        if (cmp && !cmp.isComponent) {
            cmp = Ext.factory(cmp, Ext.Component, this.getSortCmp());
        }
        return cmp;
    },

    updateSortCmp: function(cmp, oldCmp) {
        if (cmp) {
            this.add(cmp);
        }
        Ext.destroy(oldCmp);
    },

    getField: function(){
        return this.getRecord().get('field');
    },

    updateRecord: function(record, oldRecord){
        var me = this,
            body = me.getBody(),
            settings;

        this.callParent([record, oldRecord]);

        if(!record){
            return;
        }

        if(oldRecord){
            settings = oldRecord.get('field').getSettings();
            me.resetStyle(body, settings.getStyle());
            me.removeCls(settings.getCls());
        }

        settings = record.get('field').getSettings();

        // The custom settings style we add to the text component.
        // All button icons are in fact fonts so changing the font style in the list item
        // would affect all buttons not only the text component
        body.setStyle(settings.getStyle());
        // The custom settings cls we add to the entire component
        // With classes you can control better what components to change
        me.addCls(settings.getCls());

        me.refreshData();
    },

    refreshData: function(){
        var me = this,
            dCmp = me.getDeleteCmp(),
            record = me.getRecord(),
            field = record.get('field'),
            settings = field.getSettings(),
            dataView = me.dataview || me.getDataview(),
            fieldType = dataView.getFieldType(),
            isFixed;

        if(fieldType !== 'all') {
            isFixed = settings.isFixed(dataView);
            dCmp.setHidden(isFixed);
        }
        record.set('text', field.getFieldText());

        me.updateSortCmpCls();
        me.updateFilterCls();
    },

    updateFilterCls: function(){
        var me = this,
            dataView = me.dataview || me.getDataview(),
            fieldType = dataView.getFieldType();

        if(fieldType !== 'all') {
            if (me.getField().getFilter()) {
                me.addCls(me.filteredCls);
            } else {
                me.removeCls(me.filteredCls);
            }
        }
    },

    updateSortCmpCls: function(){
        var me = this,
            dataView = me.dataview || me.getDataview(),
            fieldType = dataView.getFieldType(),
            field = me.getField(),
            sCmp = me.getSortCmp();

        if(fieldType === 'leftAxis' || fieldType === 'topAxis'){
            sCmp.show();
            sCmp.setUserCls('');
            if(field.getSortable()){
                if(field.getDirection() === 'ASC'){
                    sCmp.setUserCls(me.ascSortIconCls);
                }else{
                    sCmp.setUserCls(me.descSortIconCls);
                }
            }
        }else{
            sCmp.hide();
        }
    },

    resetStyle: function(cmp, oldStyle){
        var style = {},
            keys = Ext.Object.getAllKeys(oldStyle),
            len = keys.length,
            i;

        for(i = 0; i < len; i++){
            style[keys[i]] = null;
        }
        cmp.setStyle(style);
    },

    onApplyFilterSettings: function(win, filter){
        this.getField().setFilter(filter);
        this.updateFilterCls();
        this.applyChanges();
    },

    onRemoveFilter: function(){
        this.getField().setFilter(null);
        this.updateFilterCls();
        this.applyChanges();
    },

    /**
     * This is used for firing the 'configchange' event
     *
     */
    applyChanges: function(){
        var dataView = this.dataview || this.getDataView();

        if(dataView) {
            dataView.applyChanges();
        }
    }
});