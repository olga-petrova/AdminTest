/**
 * This class remodels the grid store when required.
 *
 * @private
 */
Ext.define('Ext.pivot.feature.PivotStore', {

    config: {
        store:          null,
        grid:           null,
        matrix:         null,
        clsGrandTotal:  '',
        clsGroupTotal:  '',
        summaryDataCls: '',
        rowCls:         ''
    },

    constructor: function(config) {
        this.initConfig(config);
        return this.callParent(arguments);
    },
    
    destroy: function(){
        var me = this;

        Ext.destroy(me.storeListeners, me.matrixListeners);

        me.setConfig({
            store:  null,
            matrix: null,
            grid:   null
        });
        me.storeInfo = me.storeListeners = null;
        
        me.callParent(arguments);
    },
    
    updateStore: function(store) {
        var me = this;

        Ext.destroy(me.storeListeners);
        if (store) {
            me.storeListeners = store.on({
                // this event is fired by the pivot grid for private use
                pivotstoreremodel:  me.processStore,
                scope:              me,
                destroyable:        true
            });
        }
    },

    updateMatrix: function(matrix){
        var me = this;

        Ext.destroy(me.matrixListeners);
        if (matrix) {
            me.matrixListeners = matrix.on({
                // this event is fired by the pivot grid for private use
                groupexpand:    me.onGroupExpand,
                groupcollapse:  me.onGroupCollapse,
                scope:          me,
                destroyable:    true
            });
        }
    },
    
    processStore: function(){
        var me = this,
            store = me.getStore(),
            matrix = me.getMatrix(),
            records = [],
            isClassic = Ext.toolkit == 'classic',
            items, length, i, group, fields;

        if(!matrix || !store){
            return;
        }

        fields = matrix.getColumns();

        store.model.replaceFields(fields, true);
        store.removeAll(true);

        me.storeInfo = {};

        if(matrix.rowGrandTotalsPosition == 'first'){
            records.push.apply(records, me.processGrandTotal() || []);
        }

        items = matrix.leftAxis.getTree();
        length = items.length;

        for(i = 0; i < length; i++){
            group = items[i];
            records.push.apply(records, me.processGroup({
                    group:              group,
                    previousExpanded:   (i > 0 ? items[i-1].expanded : false)
                }) || []);
        }

        if(matrix.rowGrandTotalsPosition == 'last'){
            records.push.apply(records, me.processGrandTotal() || []);
        }

        store.loadData(records);
        if(!isClassic) {
            store.fireEvent('load', store);
        }
    },
    
    processGroup: function(config){
        var me = this,
            fn = me['processGroup' + Ext.String.capitalize(me.getMatrix().viewLayoutType)];
        
        if(!Ext.isFunction(fn)){
            // specified view type doesn't exist so let's use the outline view
            fn = me.processGroupOutline;
        }

        return fn.call(me, config);
    },
    
    processGrandTotal: function(){
        var me = this,
            found = false,
            matrix = me.getMatrix(),
            group = {
                key:    matrix.grandTotalKey
            },
            records = [];
            
        Ext.Array.forEach(matrix.totals || [], function(total){
            var record = total.record,
                i = matrix.leftAxis.dimensions.getCount();
            
            if(!(record instanceof Ext.data.Model)){
                return;
            }
            
            me.storeInfo[record.internalId] = {
                leftKey:            group.key,
                rowStyle:           '',
                rowClasses:         [me.getClsGrandTotal(), me.getSummaryDataCls()],
                rendererParams:     {}
            };

            matrix.leftAxis.dimensions.each(function(column, index){
                var key;
                
                if(matrix.viewLayoutType == 'compact' || index === 0){
                    if(matrix.viewLayoutType == 'compact'){
                        key = matrix.compactViewKey;
                        i = 1;
                    }else{
                        key = column.getId();
                    }
                    record.set(key, total.title);
                    record.commit(false, [key]);
                    me.storeInfo[record.internalId].rendererParams[key] = {
                        fn:                 'groupOutlineRenderer',
                        group:              group, 
                        colspan:            i, 
                        hidden:             false, 
                        subtotalRow:        true
                    }; 
                    found = true;
                }else{
                    me.storeInfo[record.internalId].rendererParams[column.getId()] = {
                        fn:                 'groupOutlineRenderer',
                        group:              group, 
                        colspan:            0, 
                        hidden:             found, 
                        subtotalRow:        true
                    }; 
                    i--;
                }
            });

            // for all top axis columns use a new renderer
            me.storeInfo[record.internalId].rendererParams['topaxis'] = {
                fn: 'topAxisRenderer'
            };

            records.push(record);
        });

        return records;
    },
    
// Outline view functions    

    processGroupOutline: function(config){
        var me = this,
            group = config['group'],
            results = [];
        
        if(group.record){
            me.processRecordOutline({
                results:            results,
                group:              group
            });
        }else{
            me.processGroupOutlineWithChildren({
                results:            results,
                group:              group,
                previousExpanded:   config.previousExpanded
            });
        }
        
        return results;
    },

    processGroupOutlineWithChildren: function(config){
        var me = this,
            matrix = me.getMatrix(),
            group = config['group'],
            previousExpanded = config['previousExpanded'],
            hasSummaryData, record, i;
            
        hasSummaryData = (!group.expanded || (group.expanded && matrix.rowSubTotalsPosition == 'first'));
        record = group.expanded ? group.records.expanded : group.records.collapsed;
        
        me.processGroupHeaderRecordOutline({
            results:            config.results,
            group:              group, 
            record:             record, 
            previousExpanded:   previousExpanded,
            hasSummaryData:     hasSummaryData
        });

        if(group.expanded){
            if(group.children){
                for(i = 0; i < group.children.length; i++){
                    if(group.children[i]['children']){
                        me.processGroupOutlineWithChildren({
                            results:    config.results,
                            group:      group.children[i]
                        });
                    }else{
                        me.processRecordOutline({
                            results:    config.results,
                            group:      group.children[i]
                        });
                    }
                }
            }
            if(matrix.rowSubTotalsPosition == 'last'){
                record = group.records.footer;
                me.processGroupHeaderRecordOutline({
                    results:            config.results,
                    group:              group, 
                    record:             record, 
                    previousExpanded:   previousExpanded, 
                    subtotalRow:        true,
                    hasSummaryData:     true
                });
            }
        }
    },
    
    processGroupHeaderRecordOutline: function(config){
        var me = this,
            matrix = me.getMatrix(),
            group = config['group'], 
            record = config['record'], 
            previousExpanded = config['previousExpanded'], 
            subtotalRow = config['subtotalRow'],
            hasSummaryData = config['hasSummaryData'],
            i = matrix.leftAxis.dimensions.getCount(),
            found = false;
            
        me.storeInfo[record.internalId] = {
            leftKey:            group.key,
            rowStyle:           '',
            rowClasses:         [me.getClsGroupTotal(), hasSummaryData ? me.getSummaryDataCls() : ''],
            rendererParams:     {}
        };

        matrix.leftAxis.dimensions.each(function(column, index){
            if(column.getId() == group.dimension.getId()){
                me.storeInfo[record.internalId].rendererParams[column.getId()] = {
                    fn:                 'groupOutlineRenderer',
                    group:              group, 
                    colspan:            i, 
                    hidden:             false, 
                    previousExpanded:   previousExpanded, 
                    subtotalRow:        subtotalRow
                };
                found = true;
            }else{
                me.storeInfo[record.internalId].rendererParams[column.getId()] = {
                    fn:                 'groupOutlineRenderer',
                    group:              group, 
                    colspan:            0, 
                    hidden:             found, 
                    previousExpanded:   previousExpanded, 
                    subtotalRow:        subtotalRow
                };
                i--;
            }
        });
        
        // for all top axis columns use a new renderer
        me.storeInfo[record.internalId].rendererParams['topaxis'] = {
            fn: (hasSummaryData ? 'topAxisRenderer' : 'topAxisNoRenderer')
        };
        
        config.results.push(record);
    },

    processRecordOutline: function(config){
        var me = this,
            group = config['group'], 
            found = false,
            record = group.record;

        me.storeInfo[record.internalId] = {
            leftKey:            group.key,
            rowStyle:           '',
            rowClasses:         [me.getSummaryDataCls()],
            rendererParams: {}
        };

        me.getMatrix().leftAxis.dimensions.each(function(column, index){
            if(column.getId() == group.dimension.getId()){
                found = true;
            }

            me.storeInfo[record.internalId].rendererParams[column.getId()] = {
                fn:                 'recordOutlineRenderer',
                group:              group, 
                hidden:             !found
            };
        });
        
        // for all top axis columns use a new renderer
        me.storeInfo[record.internalId].rendererParams['topaxis'] = {
            fn: 'topAxisRenderer'
        };

        config.results.push(record);
    },
    
    
// Compact view functions
    
    processGroupCompact: function(config){
        var me = this,
            group = config['group'], 
            previousExpanded = config['previousExpanded'],
            results = [];
        
        if(group.record){
            me.processRecordCompact({
                results:            results,
                group:              group
            });
        }else{
            me.processGroupCompactWithChildren({
                results:            results,
                group:              group, 
                previousExpanded:   previousExpanded
            });
        }
        
        return results;
    },

    processGroupCompactWithChildren: function(config){
        var me = this,
            matrix = me.getMatrix(),
            group = config['group'], 
            previousExpanded = config['previousExpanded'],
            hasSummaryData, i;
            
        hasSummaryData = (!group.expanded || (group.expanded && matrix.rowSubTotalsPosition == 'first'));

        me.processGroupHeaderRecordCompact({
            results:            config.results,
            group:              group, 
            record:             group.expanded ? group.records.expanded : group.records.collapsed,
            previousExpanded:   previousExpanded,
            hasSummaryData:     hasSummaryData
        });

        if(group.expanded){
            if(group.children){
                for(i = 0; i < group.children.length; i++){
                    if(group.children[i]['children']){
                        me.processGroupCompactWithChildren({
                            results:    config.results,
                            group:      group.children[i]
                        });
                    }else{
                        me.processRecordCompact({
                            results:    config.results,
                            group:      group.children[i]
                        });
                    }
                }
            }
            if(matrix.rowSubTotalsPosition == 'last'){
                me.processGroupHeaderRecordCompact({
                    results:            config.results,
                    group:              group, 
                    record:             group.records.footer,
                    previousExpanded:   previousExpanded, 
                    subtotalRow:        true,
                    hasSummaryData:     true
                });
            }
        }
    },
    
    processGroupHeaderRecordCompact: function(config){
        var me = this,
            matrix = me.getMatrix(),
            group = config['group'], 
            record = config['record'], 
            previousExpanded = config['previousExpanded'], 
            subtotalRow = config['subtotalRow'],
            hasSummaryData = config['hasSummaryData'];
            
        me.storeInfo[record.internalId] = {
            leftKey:            group.key,
            rowStyle:           '',
            rowClasses:         [me.getClsGroupTotal(), hasSummaryData ? me.getSummaryDataCls() : ''],
            rendererParams:     {}
        };

        me.storeInfo[record.internalId].rendererParams[matrix.compactViewKey] = {
            fn:                 'groupCompactRenderer',
            group:              group, 
            colspan:            0, 
            previousExpanded:   previousExpanded, 
            subtotalRow:        subtotalRow
        }; 
        
        // for all top axis columns use a new renderer
        me.storeInfo[record.internalId].rendererParams['topaxis'] = {
            fn: (hasSummaryData ? 'topAxisRenderer' : 'topAxisNoRenderer')
        };

        config.results.push(record);
    },

    processRecordCompact: function(config){
        var me = this,
            group = config['group'], 
            record = group.record;
            
        me.storeInfo[record.internalId] = {
            leftKey:            group.key,
            rowStyle:           '',
            rowClasses:         [me.getSummaryDataCls()],
            rendererParams:     {}
        };
        
        me.storeInfo[record.internalId].rendererParams[me.getMatrix().compactViewKey] = {
            fn:         'recordCompactRenderer',
            group:      group
        }; 
        
        // for all top axis columns use a new renderer
        me.storeInfo[record.internalId].rendererParams['topaxis'] = {
            fn: 'topAxisRenderer'
        };

        config.results.push(record);
    },
    
    doExpandCollapse: function(key, oldRecord){
        var me = this,
            gridMaster = me.getGrid(),
            group;

        group = me.getMatrix().leftAxis.findTreeElement('key', key);
        if(!group){
            return;
        }

        me.doExpandCollapseInternal(group.node, oldRecord);

        gridMaster.fireEvent((group.node.expanded ? 'pivotgroupexpand' : 'pivotgroupcollapse'), gridMaster, 'row', group.node);
    },

    doExpandCollapseInternal: function(group, oldRecord){
        var me = this,
            store = me.getStore(),
            isClassic = Ext.toolkit == 'classic',
            items, oldItems, startIdx, len;

        group.expanded = !group.expanded;

        oldItems = me.processGroup({
            group:              group,
            previousExpanded:   false
        });
        
        group.expanded = !group.expanded;
        
        items = me.processGroup({
            group:              group,
            previousExpanded:   false
        });


        if(items.length && (startIdx = store.indexOf(oldRecord)) !== -1){
            if(isClassic) {
                store.suspendEvents();
            }

            if(group.expanded){
                store.remove(store.getAt(startIdx));
                store.insert(startIdx, items);

                oldItems = [oldRecord];
            }else{
                len = oldItems.length;
                oldItems = store.getRange(startIdx, startIdx + len - 1);

                store.remove(oldItems);
                store.insert(startIdx, items);

            }

            me.removeStoreInfoData(oldItems);

            if(isClassic) {
                store.resumeEvents();
                // the replace event is better than remove and inserts
                store.fireEvent('replace', store, startIdx, oldItems, items);
            }
        }

    },
    
    removeStoreInfoData: function(records){
        Ext.Array.each(records, function(record){
            if(this.storeInfo[record.internalId]){
                delete this.storeInfo[record.internalId];
            }
        }, this);
    },

    onGroupExpand: function(matrix, type, item){
        if(type == 'row') {
            if(item) {
                this.doExpandCollapseInternal(item, item.records.collapsed);
            }else{
                this.processStore();
            }
        }
    },

    onGroupCollapse: function(matrix, type, item){
        if(type == 'row') {
            if(item) {
                this.doExpandCollapseInternal(item, item.records.expanded);
            }else{
                this.processStore();
            }
        }
    }
});