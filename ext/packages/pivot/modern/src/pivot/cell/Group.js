/**
 * This class is used internally by the pivot grid component.
 * @private
 */
Ext.define('Ext.pivot.cell.Group', {
    extend: 'Ext.pivot.cell.Cell',
    xtype: 'pivotgridgroupcell',

    config: {
        innerGroupStyle: null,
        innerGroupCls: null,
        userGroupStyle: null,
        userGroupCls: null
    },

    element: {
        reference: 'element',
        cls: Ext.baseCSSPrefix + 'grid-cell',
        children: [{
            reference: 'innerElement',
            cls: Ext.baseCSSPrefix + 'grid-cell-inner ',
            children: [{
                reference: 'groupElement',
                cls: Ext.baseCSSPrefix + 'pivot-grid-group-title'
            }]
        }]
    },

    updateInnerGroupStyle: function(cellStyle) {
        this.groupElement.applyStyles(cellStyle);
    },

    updateInnerGroupCls: function(cls, oldCls){
        this.groupElement.replaceCls(oldCls, cls);
    },

    updateUserGroupStyle: function(cellStyle) {
        this.groupElement.applyStyles(cellStyle);
    },

    updateUserGroupCls: function(cls, oldCls){
        this.groupElement.replaceCls(oldCls, cls);
    },

    updateRawValue: function (rawValue) {
        var dom = this.groupElement.dom;

        if (this.getEncodeHtml()) {
            dom.textContent = rawValue;
        } else {
            dom.innerHTML = rawValue;
        }
    },

    updateRecord: function (record, oldRecord) {
        var me = this,
            info = me.parent.getRecordInfo(),
            dataIndex = me.dataIndex;

        if (info && dataIndex) {
            info = info.rendererParams[dataIndex];
            if(info && me[info.fn]) {
                me[info.fn](info, me.parent.getGrid());
            }
        }

        me.callParent(arguments);
    },

    groupOutlineRenderer: function(config, grid){
        var me = this,
            cellCls = '';

        if(grid.getMatrix().viewLayoutType == 'compact') {
            // the grand total uses this renderer in compact view and margins need to be reset
            me.setInnerGroupStyle((grid.isRTL() ? 'margin-right: ' : 'margin-left: ') + '0px;');
        }

        if(config.colspan > 0){
            cellCls += me.groupHeaderCls;
            if(!config.subtotalRow){
                cellCls += ' ' + me.groupHeaderCollapsibleCls;
                if(!config.group.expanded){
                    cellCls += ' ' + me.groupHeaderCollapsedCls;
                }
                if(config.previousExpanded){
                    cellCls += ' ' + me.outlineCellGroupExpandedCls;
                }
            }

            me.setCellCls(cellCls);
            me.setInnerGroupCls( me.groupCls );
            return;
        }

        me.setCellCls( me.outlineCellHiddenCls );
    },

    recordOutlineRenderer: function(config, grid){
        var me = this;

        if(config.hidden){
            me.setCellCls( me.outlineCellHiddenCls );
            return;
        }

        me.setCellCls( me.groupHeaderCls );
    },

    groupCompactRenderer: function(config, grid){
        var me = this,
            cellCls = '';

        me.setInnerGroupStyle( (grid.isRTL() ? 'margin-right: ' : 'margin-left: ') + (me.compactLayoutPadding * config.group.level) + 'px;' );

        cellCls += me.groupHeaderCls + ' ' + me.compactGroupHeaderCls;
        if(!config.subtotalRow){
            cellCls += ' ' + me.groupHeaderCollapsibleCls;
            if(!config.group.expanded){
                cellCls += ' ' + me.groupHeaderCollapsedCls;
            }
            if(config.previousExpanded){
                cellCls += ' ' + me.outlineCellGroupExpandedCls;
            }
        }

        me.setCellCls(cellCls);
        me.setInnerGroupCls( me.groupCls );
    },

    recordCompactRenderer: function(config, grid){
        var me = this,
            cellCls = [];

        me.setInnerGroupStyle( (grid.isRTL() ? 'margin-right: ' : 'margin-left: ') + (me.compactLayoutPadding * config.group.level) + 'px;' );
        me.setCellCls( me.groupHeaderCls + ' ' + me.compactGroupHeaderCls );
    }

});