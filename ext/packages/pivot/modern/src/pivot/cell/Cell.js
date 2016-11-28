/**
 * This class is used internally by the pivot grid component.
 * @private
 */
Ext.define('Ext.pivot.cell.Cell', {
    extend: 'Ext.grid.cell.Cell',
    xtype: 'pivotgridcell',

    groupHeaderCollapsedCls:    Ext.baseCSSPrefix + 'pivot-grid-group-header-collapsed',
    // outline view css classes
    outlineCellHiddenCls:       Ext.baseCSSPrefix + 'pivot-grid-outline-cell-hidden',
    outlineCellGroupExpandedCls:Ext.baseCSSPrefix + 'pivot-grid-outline-cell-previous-expanded',
    // compact view css classes
    compactGroupHeaderCls:      Ext.baseCSSPrefix + 'pivot-grid-group-header-compact',
    compactLayoutPadding:       25,

    groupCls:                   Ext.baseCSSPrefix + 'pivot-grid-group',
    groupHeaderCls:             Ext.baseCSSPrefix + 'pivot-grid-group-header',
    groupHeaderCollapsibleCls:  Ext.baseCSSPrefix + 'pivot-grid-group-header-collapsible',

    summaryDataCls:             Ext.baseCSSPrefix + 'pivot-summary-data',
    // summary rows styling
    summaryRowCls:              Ext.baseCSSPrefix + 'pivot-grid-group-total',
    grandSummaryRowCls:         Ext.baseCSSPrefix + 'pivot-grid-grand-total',

    encodeHtml: false,

    constructor: function(){
        var me = this,
            ret = me.callParent(arguments),
            model = me.getViewModel(),
            dataIndex = me.dataIndex,
            record = me.getRecord();

        if(model && dataIndex){
            model.set('column', me.parent.getGrid().getMatrix().modelInfo[dataIndex] || {});
            model.set('value', me.getValue());
            model.set('record', record ? record.data : {});
        }

        return ret;
    },

    handleEvent: function(type, e){
        var me = this,
            grid = me.parent.getGrid(),
            row = me.parent,
            record = me.getRecord(),
            params = {
                grid: grid
            },
            info, eventName, cls, cell, ret, colDef, leftKey, topKey,
            matrix, leftItem, topItem;

        if(!record){
            return;
        }

        if(row.element.hasCls(me.grandSummaryRowCls)){
            eventName = 'pivottotal';
        }else if(row.element.hasCls( me.summaryRowCls )){
            eventName = 'pivotgroup';
        }else if(row.element.hasCls( me.summaryDataCls )){
            eventName = 'pivotitem';
        }

        info = row.getRecordInfo(record);
        matrix = grid.getMatrix();
        leftKey = info.leftKey;
        leftItem = matrix.leftAxis.findTreeElement('key', leftKey);
        leftItem = leftItem ? leftItem.node : null;

        Ext.apply(params, {
            cell:       me,
            leftKey:    leftKey,
            leftItem:   leftItem
        });

        params.column = me.getColumn();

        if(!me.element.hasCls(me.groupHeaderCls)){
            eventName += 'cell';
            topKey = grid.getTopAxisKey(params.column);
            params.topKey = topKey;

            if(topKey){
                topItem = matrix.topAxis.findTreeElement('key', topKey);
                topItem = topItem ? topItem.node : null;

                if(topItem) {
                    Ext.apply(params, {
                        topItem: topItem,
                        dimensionId: topItem.dimensionId
                    });
                }
            }
        }

        ret = grid.fireEvent(eventName + type, params, e);

        if(ret !== false && type == 'tap' && me.element.hasCls(me.groupHeaderCollapsibleCls)){
            if(leftItem.expanded){
                leftItem.collapse();
            }else{
                leftItem.expand();
            }
        }
        return false;
    },

    updateRecord: function(record, oldRecord){
        var model = this.getViewModel();

        this.callParent([record, oldRecord]);

        if(model){
            model.set('value', this.getValue());
            model.set('record', record ? record.data : {});
        }
    }

});