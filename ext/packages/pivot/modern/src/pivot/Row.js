/**
 * This class is used internally by the pivot grid component.
 * @private
 */
Ext.define('Ext.pivot.Row', {
    extend: 'Ext.grid.Row',
    xtype: 'pivotgridrow',

    requires: [
        'Ext.pivot.cell.Group'
    ],

    config: {
        recordInfo: null,
        rowCls: null
    },

    initialize: function(){
        var model = this.getViewModel();

        if(model){
            model.set('columns', this.getGrid().getMatrix().modelInfo);
        }

        return this.callParent(arguments);
    },

    destroy: function(){
        this.setRecordInfo(null);
        this.callParent();
    },

    updateRowCls: function (newCls, oldCls) {
        this.element.replaceCls(oldCls, newCls);
    },

    updateRecord: function(record, oldRecord){
        var me = this,
            info = me.getGrid().getRecordInfo(record);

        me.setRecordInfo(info);

        if(info){
            me.setRowCls(info.rowClasses);
        }
        me.callParent([record, oldRecord]);
    }
});
