/**
 * This is the class that takes care of pivot grid mouse events.
 *
 * @private
 *
 */
Ext.define('Ext.pivot.feature.PivotEvents',{
    alternateClassName: [
        'Mz.pivot.feature.PivotEvents'
    ],

    extend: 'Ext.grid.feature.Feature',
    
    alias: 'feature.pivotevents',

    requires: [
        'Ext.pivot.feature.PivotStore'
    ],

    eventPrefix:    'pivotcell',
    eventSelector:  '.' + Ext.baseCSSPrefix + 'grid-cell',

    // this cls is used to catch events on the summary data rows (not on the header)
    summaryDataCls:             Ext.baseCSSPrefix + 'pivot-summary-data',
    summaryDataSelector:        '.' + Ext.baseCSSPrefix + 'pivot-summary-data',
    cellSelector:               '.' + Ext.baseCSSPrefix + 'grid-cell',
    groupHeaderCls:             Ext.baseCSSPrefix + 'pivot-grid-group-header',
    groupHeaderCollapsibleCls:  Ext.baseCSSPrefix + 'pivot-grid-group-header-collapsible',

    // summary rows styling
    summaryRowCls:              Ext.baseCSSPrefix + 'pivot-grid-group-total',
    summaryRowSelector:         '.' + Ext.baseCSSPrefix + 'pivot-grid-group-total',
    grandSummaryRowCls:         Ext.baseCSSPrefix + 'pivot-grid-grand-total',
    grandSummaryRowSelector:    '.' + Ext.baseCSSPrefix + 'pivot-grid-grand-total',

    init: function(grid){
        var me = this;
        
        me.initEventsListeners();

        // if summaryRowCls or grandSummaryRowCls are changed then the selectors should match the new classes otherwise
        // events handling will have problems
        me.summaryRowSelector = '.' + me.summaryRowCls;
        me.grandSummaryRowSelector = '.' + me.grandSummaryRowCls;

        me.callParent(arguments);

    },
    
    destroy: function(){
        var me = this;
        
        me.destroyEventsListeners();
        
        Ext.destroy(me.dataSource);
        me.view = me.grid = me.gridMaster = me.matrix = me.dataSource = null;
        
        me.callParent(arguments);
    },

    initEventsListeners: function(){
        var me = this;
        
        me.eventsViewListeners = me.view.on(Ext.apply({
            scope:          me,
            destroyable:    true
        }, me.getViewListeners() || {}));

        me.gridListeners = me.grid.on(Ext.apply({
            scope:          me,
            destroyable:    true
        }, me.getGridListeners() || {}));
    },
    
    getViewListeners: function(){
        var me = this,
            listeners = {
                afterrender:    me.onViewAfterRender
            };
        
        listeners[me.eventPrefix + 'click'] = me.onCellEvent;
        listeners[me.eventPrefix + 'dblclick'] = me.onCellEvent;
        listeners[me.eventPrefix + 'contextmenu'] = me.onCellEvent;
        
        return listeners;
    },
    
    getGridListeners: Ext.emptyFn,

    destroyEventsListeners: function(){
        Ext.destroyMembers(this, 'eventsViewListeners', 'gridListeners');
        this.eventsViewListeners = this.gridListeners = null;
    },
    
    onViewAfterRender: function(){
        var me = this,
            lockPartner;
        
        me.gridMaster = me.view.up('pivotgrid');
        me.matrix = me.gridMaster.getMatrix();

        // Share the GroupStore between both sides of a locked grid
        lockPartner = me.lockingPartner;
        if (lockPartner && lockPartner.dataSource) {
            me.dataSource = lockPartner.dataSource;
        } else {
            me.dataSource = new Ext.pivot.feature.PivotStore({
                store:          me.grid.store,
                matrix:         me.matrix,
                grid:           me.gridMaster,
                clsGrandTotal:  me.gridMaster.clsGrandTotal,
                clsGroupTotal:  me.gridMaster.clsGroupTotal,
                summaryDataCls: me.summaryDataCls,
                rowCls:         me.rowCls
            });
        }
    },
    
    getRowId: function(record){
        return this.view.id + '-record-' + record.internalId;
    },

    getRecord: function(row){
        return this.view.getRecord(row);
    },
    
    onCellEvent: function(view, tdCell, e){
        var me = this,
            row = Ext.fly(tdCell).findParent(me.summaryDataSelector) || Ext.fly(tdCell).findParent(me.summaryRowSelector),
            record = me.getRecord(row),
            params = {
                grid:       me.gridMaster,
                view:       me.view,
                cellEl:     tdCell
            },
            colIndex, ret, eventName, column, colDef, leftKey, topKey,
            matrix, leftItem, topItem;
        
        if(!row || !record){
            return false;
        }

        matrix = me.gridMaster.getMatrix();
        leftKey = me.dataSource.storeInfo[record.internalId].leftKey;
        leftItem = matrix.leftAxis.findTreeElement('key', leftKey);
        leftItem = leftItem ? leftItem.node : null;
        row = Ext.fly(row);
        
        if(row.hasCls(me.grandSummaryRowCls)){
            // we are on the grand total row
            eventName = 'pivottotal';
        }else if(row.hasCls(me.summaryRowCls)){
            // we are on a group total row
            eventName = 'pivotgroup';
        }else if(row.hasCls(me.summaryDataCls)){
            // we are on a pivot item row
            eventName = 'pivotitem';
        }
        
        colIndex = Ext.getDom(tdCell).getAttribute('data-columnid');
        column = me.getColumnHeaderById(colIndex);
        
        Ext.apply(params, {
            columnId:   colIndex,
            column:     column,
            leftKey:    leftKey,
            leftItem:   leftItem
        });
        
        if(Ext.fly(tdCell).hasCls(me.groupHeaderCls)){
            // it's a header cell
        }else if(column){
            eventName += 'cell';
            colDef = me.getTopAxisGroupByDataIndex(column.dataIndex);
            if(colDef){
                topKey = colDef.col;
                topItem = matrix.topAxis.findTreeElement('key', topKey);

                Ext.apply(params, {
                    topKey:         topKey,
                    topItem:        topItem ? topItem.node : null,
                    dimensionId:    colDef.agg
                });
            }
        }
        
        ret = me.gridMaster.fireEvent(eventName + e.type, params, e);
        
        if(ret !== false && e.type == 'click' && Ext.fly(tdCell).hasCls(me.groupHeaderCollapsibleCls)){
            if(leftItem.expanded){
                leftItem.collapse();
                me.view.focusNode(leftItem.records.collapsed);
            }else{
                leftItem.expand();
                me.view.focusNode(leftItem.records.expanded);
            }
        }
        
        return false;
    },
    
    getColumnHeaderById: function(columnId){
        var columns = this.view.getGridColumns(),
            i;
        
        for(i = 0; i < columns.length; i++){
            if(columns[i].id === columnId){
                return columns[i];
            }
        }
    },
    
    getTopAxisGroupByDataIndex: function(dataIndex){
        var columns = this.gridMaster.matrix.getColumns(),
            i;
            
        for(i = 0; i < columns.length; i++){
            if(columns[i].name === dataIndex){
                return columns[i];
            }
        }
    }


});