/**
 *
 * This plugin allows the user to modify records behind a pivot cell.
 *
 * The user has to double click that cell to open the range editor window.
 *
 * The following types of range editing are available:
 *
 * - `percentage`: the user fills in a percentage that is applied to each record.
 * - `increment`:  the user fills in a value that is added to each record.
 * - `overwrite`:  the new value filled in by the user overwrites each record.
 * - `uniform`:  replace sum of values with a provided value using uniform distribution
 *
 * More pivot updater types can be defined by extending {@link Ext.pivot.update.Base this class}.
 *
 * @note Only works when using a {@link Ext.pivot.matrix.Local Local matrix} on a pivot grid.
 */
Ext.define('Ext.pivot.plugin.RangeEditor', {
    alternateClassName: [
        'Mz.pivot.plugin.RangeEditor'
    ],

    alias: [
        'plugin.pivotrangeeditor',
        'plugin.mzrangeeditor'
    ],

    extend: 'Ext.AbstractPlugin',

    requires: [
        'Ext.pivot.Grid',
        'Ext.pivot.update.Increment',
        'Ext.pivot.update.Overwrite',
        'Ext.pivot.update.Percentage',
        'Ext.pivot.update.Uniform',
        'Ext.window.Window',
        'Ext.form.field.Hidden',
        'Ext.form.field.Text',
        'Ext.form.field.Number',
        'Ext.form.field.ComboBox',
        'Ext.form.field.Display',
        'Ext.form.Panel',
        'Ext.button.Button',
        'Ext.layout.container.Fit',
        'Ext.data.ArrayStore'
    ],

    /**
     * @cfg {Number} width Width of the viewer's window.
     */
    width:        null,
    /**
     * @cfg {Number} height Height of the viewer's window.
     */
    height:        null,
    /**
     * @cfg {String} textWindowTitle Range editor window title
     */
    textWindowTitle:    'Range editor',
    /**
     * @cfg {String} textFieldValue Range editor field Value label
     */
    textFieldValue:     'Value',
    /**
     * @cfg {String} textFieldEdit Range editor field Edit label
     */
    textFieldEdit:      'Field',
    /**
     * @cfg {String} textFieldType Range editor field Type label
     */
    textFieldType:      'Type',
    /**
     * @cfg {String} textButtonOk Range editor window Ok button text
     */
    textButtonOk:       'Ok',
    /**
     * @cfg {String} textButtonCancel Range editor window Cancel button text
     */
    textButtonCancel:   'Cancel',
    /**
     * @cfg {Function} onBeforeRecordsUpdate
     *
     * Provide a function to handle the records update.
     *
     * This one will be fired before updating the records. Return false if you want to stop the process.
     *
     * The function receives the following arguments: pivot, colDefinition, records, newValue, oldValue.
     */
    onBeforeRecordsUpdate: Ext.emptyFn,

    /**
     * @cfg {Function} onAfterRecordsUpdate
     *
     * Provide a function to handle the records update.
     *
     * This one will be fired after all records were updated. "sync" could be called on the store inside this function.
	 *
     * The function receives the following arguments: pivot, colDefinition, records, newValue, oldValue.
     */
    onAfterRecordsUpdate: Ext.emptyFn,
    /**
     * @cfg {Object} scope
     *
     * Scope to run the functions `onBeforeRecordsUpdate` and `onAfterRecordsUpdate`.
     */
    scope: null,

    /**
     * @cfg {Array} updaters
     *
     * Define here the updaters available for the user.
     */
    updaters: [
        ['percentage', 'Percentage'],
        ['increment', 'Increment'],
        ['overwrite', 'Overwrite'],
        ['uniform', 'Uniform']
    ],

    /**
     * @cfg {String} defaultUpdater
     *
     * Define which updater is selected by default.
     */
    defaultUpdater: 'uniform',
	
    /**
     *  `"both"` (the default) - The plugin is added to both grids
     *  `"top"` - The plugin is added to the containing Panel
     *  `"locked"` - The plugin is added to the locked (left) grid
     *  `"normal"` - The plugin is added to the normal (right) grid
     *
     * @private
     */
    lockableScope:  'top',

    init: function(grid){
        var me = this;

        /**
         * Fires on the pivot grid before updating all result records.
         *
         * @event pivotbeforeupdate
         * @param {Ext.pivot.update.Base} updater Reference to the updater object
         */

        /**
         * Fires on the pivot grid after updating all result records.
         *
         * @event pivotupdate
         * @param {Ext.pivot.update.Base} updater Reference to the updater object
         */

        //<debug>
        // this plugin is available only for the pivot grid
        if (!grid.isPivotGrid) {
            Ext.raise('This plugin is only compatible with Ext.pivot.Grid');
        }
        //</debug>

        me.pivot = grid;
        me.pivotListeners = me.pivot.on({
            pivotitemcelldblclick:      me.runPlugin,
            pivotgroupcelldblclick:     me.runPlugin,
            pivottotalcelldblclick:     me.runPlugin,
            scope:                      me,
            destroyable:                true
        });
        
        me.callParent(arguments);        
    },
    
    destroy: function(){
        var me = this;

        Ext.destroyMembers(me, 'view', 'pivotListeners');

        me.pivot = me.view = me.pivotListeners = null;
        me.cleanUp();

        me.callParent(arguments);
    },
    
    runPlugin: function(params, e, eOpts){
        var me = this,
            matrix = me.pivot.getMatrix(),
            dataIndex, result, col;

        // do nothing if the plugin is disabled
        if(me.disabled) {
            return;
        }

        if(params.topKey){
            me.initEditorWindow();
            
		    result = matrix.results.get(params.leftKey, params.topKey);
		    if(result){
                // to keep compatibility with prior versions of this plugin
                me.currentCol = col = params.column;
                me.currentRecords = result.records || [];
                dataIndex = col.dimension.getId();
                me.currentValue = result.getValue(dataIndex);

                me.view.down('form').getForm().setValues({
                    leftKey:    params.leftKey,
                    topKey:     params.topKey,
                    dataIndex:  col.dimension.dataIndex,
                    field:      col.dimension.header || col.text || col.dimension.dataIndex,
                    value:      result.getValue(dataIndex),
                    type:       me.defaultUpdater
                });
		        me.view.show();
            }
        }
    },

    updateRecords: function(){
        var me = this,
            view = me.view,
            values = view.down('form').getValues(),
            fn = Ext.bind(me.cleanUp, me),
            updater;

        values.matrix = me.pivot.getMatrix();
        updater = Ext.Factory.pivotupdate(values);
        updater.on({
            beforeupdate: me.onBeforeUpdate,
            update: me.onUpdate,
            scope: me
        });
        updater.update().then(fn, fn);
    },

    cleanUp: function(){
        this.currentCol = this.currentRecords = this.currentValue = null;
    },

    onBeforeUpdate: function(updater){
        var me = this,
            pivot = me.pivot;

        if(Ext.callback(me.onBeforeRecordsUpdate, me.scope || 'self.controller', [pivot, me.currentCol, me.currentRecords, updater.getValue(), me.currentValue], 0, pivot) === false){
            return false;
        }

        if(pivot.fireEvent('pivotbeforeupdate', updater) === false){
            return false;
        }

        me.view.getEl().mask();
    },

    onUpdate: function(updater){
        var me = this,
            pivot = me.pivot,
            view = me.view;

        Ext.callback(me.onAfterRecordsUpdate, me.scope || 'self.controller', [pivot, me.currentCol, me.currentRecords, updater.getValue(), me.currentValue], 0, pivot);
        pivot.fireEvent('pivotupdate', updater);
        Ext.destroy(updater);
        view.getEl().unmask();
        view.close();
    },
	
    initEditorWindow: function(){
        var me = this;
        
        if(!me.view){
            // create the editor window
            me.view = Ext.create('Ext.window.Window', {
                title:          me.textWindowTitle,
                width:          me.width,
                height:         me.height,
                layout:         'fit',
                modal:          true,
                closeAction:    'hide',
                items: [{
                    xtype:      'form',
                    padding:    5,
                    border:     false,
                    defaults: {
                        anchor:     '100%'
                    },
                    items: [{
                        fieldLabel:     me.textFieldEdit,
                        xtype:          'displayfield',
                        name:           'field'
                    },{
                        fieldLabel:     me.textFieldType,
                        xtype:          'combo',
                        name:           'type',
                        queryMode:      'local',
                        valueField:     'id',
                        displayField:   'text',
                        editable:       false,
                        store:          me.updaters
                    },{
                        fieldLabel:     me.textFieldValue,
                        xtype:          'numberfield',
                        name:           'value'
                    },{
                        xtype:          'hidden',
                        name:           'leftKey'
                    },{
                        xtype:          'hidden',
                        name:           'topKey'
                    },{
                        xtype:          'hidden',
                        name:           'dataIndex'
                    }]
                }],
                buttons: [{
                    text:       me.textButtonOk,
                    handler:    me.updateRecords,
                    scope:      me
                },{
                    text:       me.textButtonCancel,
                    handler:    function(){
                        this.view.close();
                    },
                    scope:      me
                }]
            });
        }
    }
    
});