/**
 * This class implements the config panel. It is used internally by the configurator plugin.
 *
 * @private
 */
Ext.define('Ext.pivot.plugin.configurator.Panel', {
    extend: 'Ext.Container',

    requires: [
        'Ext.pivot.plugin.configurator.Container',
        'Ext.pivot.plugin.configurator.DragZone',
        'Ext.pivot.plugin.configurator.DropZone',
        'Ext.pivot.plugin.configurator.PanelController',
        'Ext.pivot.plugin.configurator.Form',
        'Ext.layout.HBox',
        'Ext.layout.VBox',
        'Ext.layout.Card',
        'Ext.TitleBar',
        'Ext.Promise'
    ],

    alias: 'widget.pivotconfigpanel',
    controller: 'pivotconfigpanel',

    cls: Ext.baseCSSPrefix + 'pivot-grid-config-panel',
    translatable: {
        translationMethod: 'csstransform'
    },

    panelTitle:             'Configuration',
    /**
     * @cfg {String} panelAllFieldsText Text displayed in the container reserved for all available fields
     * when docked to top or bottom.
     */
    panelAllFieldsText:     'Drop Unused Fields Here',
    /**
     * @cfg {String} panelAllFieldsTitle Text displayed in the container reserved for all available fields
     * when docked to left or right.
     */
    panelAllFieldsTitle:    'All fields',

    /**
     * @cfg {String} panelTopFieldsText Text displayed in the container reserved for all top axis fields
     * when docked to top or bottom.
     */
    panelTopFieldsText:     'Drop Column Fields Here',
    /**
     * @cfg {String} panelTopFieldsTitle Text displayed in the container reserved for all top axis fields
     * when docked to left or right.
     */
    panelTopFieldsTitle:    'Column labels',

    /**
     * @cfg {String} panelLeftFieldsText Text displayed in the container reserved for all left axis fields
     * when docked to top or bottom.
     */
    panelLeftFieldsText:    'Drop Row Fields Here',
    /**
     * @cfg {String} panelLeftFieldsTitle Text displayed in the container reserved for all left axis fields
     * when docked to left or right.
     */
    panelLeftFieldsTitle:   'Row labels',

    /**
     * @cfg {String} panelAggFieldsText Text displayed in the container reserved for all aggregate fields
     * when docked to top or bottom.
     */
    panelAggFieldsText:     'Drop Agg Fields Here',
    /**
     * @cfg {String} panelAggFieldsTitle Text displayed in the container reserved for all aggregate fields
     * when docked to left or right.
     */
    panelAggFieldsTitle:    'Values',
    cancelText:             'Cancel',
    okText:                 'Done',

    eventedConfig: {
        pivot:          null,
        fields:         null
    },

    listeners: {
        pivotchange: 'onPivotChanged',
        fieldschange: 'onFieldsChanged'
    },

    layout: 'card',

    initialize: function(){
        this.setup();
        return this.callParent();
    },

    /**
     * This function either moves or copies the dragged field from one container to another.
     *
     * @param {Ext.pivot.plugin.configurator.Container/Ext.pivot.plugin.configurator.Column} toTarget
     * @param {Ext.data.Model} record
     * @param {String} pos Position: `after` or `before`
     *
     * @private
     */
    dragDropField: function(fromContainer, toContainer, record, newPos){
        var me = this,
            pivot = me.getPivot(),
            field = record.get('field'),
            fromFieldType = fromContainer.getFieldType(),
            toFieldType = toContainer.getFieldType(),
            controller = me.getController(),
            topAxisCt = controller.getTopAxisContainer(),
            leftAxisCt = controller.getLeftAxisContainer(),
            item;

        if(pivot.fireEvent('beforemoveconfigfield', this, {
                fromContainer:  fromContainer,
                toContainer:    toContainer,
                field:          field
            }) !== false){

            if(fromContainer != toContainer){
                /*
                 The "All fields" container contains all fields defined on the plugin (or on the store model)
                 + all fields defined on the matrix configuration (leftAxis, topAxis, aggregate).

                 There are more scenarios here:
                 1. fromContainer is "All fields" and toContainer is "Row labels"/"Column labels"
                 We check if there is already an instance of this field there
                 - if there is then don't copy it there
                 - if there is not then maybe is on the other axis in which case we move that instance
                 to the toContainer

                 2. fromContainer is "All fields" and toContainer is "Values"
                 Just make a copy of the field in toContainer

                 3. fromContainer is not "All fields" and toContainer is not "All fields"
                 Just move the field to toContainer

                 4. fromContainer is not "All fields" and toContainer is "All fields"
                 Just delete the field from fromContainer since it's already existing in "All fields"
                 */

                if(fromFieldType === 'all' && (toFieldType === 'leftAxis' || toFieldType === 'topAxis')){
                    // scenario 1
                    item = me.findFieldInContainer(field, toContainer);
                    if(item){
                        // we found an instance so don't do anything
                        return;
                    }
                    if(toFieldType == 'leftAxis'){
                        item = me.findFieldInContainer(field, topAxisCt);
                        if(item){
                            // move the field from "Column labels" to "Row labels"
                            topAxisCt.removeField(item);
                            toContainer.addField(field, newPos);
                            return;
                        }
                    }else{
                        item = me.findFieldInContainer(field, leftAxisCt);
                        if(item){
                            // move the field from "Row labels" to "Column labels"
                            leftAxisCt.removeField(item);
                            toContainer.addField(field, newPos);
                            return;
                        }
                    }
                    toContainer.addField(field.clone(), newPos, true);
                }else if(fromFieldType == 'all' && toFieldType == 'aggregate'){
                    // scenario 2
                    toContainer.addField(field.clone(), newPos, true);
                }else if(fromFieldType != 'all' && toFieldType != 'all'){
                    // scenario 3
                    fromContainer.removeField(record);
                    toContainer.addField(field, newPos);
                }else{
                    // scenario 4
                    fromContainer.removeField(record);
                }
            }else{
                toContainer.moveField(record, newPos);
            }
        }

    },

    /**
     *
     * @param {Ext.pivot.plugin.configurator.Field} field
     * @param {Ext.pivot.plugin.configurator.Container} container
     * @return {Ext.data.Model}
     *
     * @private
     */
    findFieldInContainer: function(field, container){
        var store = container.getStore(),
            length = store.getCount(),
            i, item;

        for(i = 0; i < length; i++){
            item = store.getAt(i);
            if(item.get('field').getDataIndex() == field.getDataIndex()){
                return item;
            }
        }
    },

    setup: function(){
        var me = this,
            listeners = {
                configchange:       'onConfigChanged',
                toolsbtnpressed:    'showCard'
            };

        me.add([{
            itemId: 'main',
            xtype: 'container',
            layout: {
                type: 'hbox',
                align: 'stretch'
            },

            defaults: {
                flex: 1
            },

            items: [{
                xtype:      'titlebar',
                docked:     'top',
                title:      me.panelTitle,
                items: [{
                    text:   me.cancelText,
                    align:  'left',
                    ui:     'back',
                    handler:'cancelConfiguration'
                },{
                    text:   me.okText,
                    align:  'right',
                    ui:     'action',
                    handler:'applyConfiguration'
                }]
            },{
                reference:  'fieldsCt',
                xtype:      'pivotconfigcontainer',
                title:      me.panelAllFieldsTitle,
                emptyText:  me.panelAllFieldsText,
                fieldType:  'all',
                listeners:  listeners
            },{
                xtype: 'container',
                layout: {
                    type: 'vbox',
                    align: 'stretch'
                },
                defaults: {
                    xtype:      'pivotconfigcontainer',
                    flex: 1
                },
                items: [{
                    reference:  'fieldsAggCt',
                    title:      me.panelAggFieldsTitle,
                    emptyText:  me.panelAggFieldsText,
                    fieldType:  'aggregate',
                    listeners:  listeners
                },{
                    reference:  'fieldsLeftCt',
                    title:      me.panelLeftFieldsTitle,
                    emptyText:  me.panelLeftFieldsText,
                    fieldType:  'leftAxis',
                    listeners:  listeners
                },{
                    reference:  'fieldsTopCt',
                    title:      me.panelTopFieldsTitle,
                    emptyText:  me.panelTopFieldsText,
                    fieldType:  'topAxis',
                    listeners:  listeners
                }]
            }]

        },{
            itemId: 'field',
            xtype: 'pivotconfigform',
            listeners: {
                close: 'backToMainView',
                beforeapplyconfigfieldsettings: 'onBeforeApplyConfigFieldSettings',
                applyconfigfieldsettings: 'onApplyConfigFieldSettings'
            }
        }]);
    }

});