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
    alias: [
        'plugin.pivotrangeeditor'
    ],

    extend: 'Ext.AbstractPlugin',

    requires: [
        'Ext.pivot.plugin.rangeeditor.Panel',
        'Ext.Sheet',
        'Ext.layout.Fit',
        'Ext.pivot.update.Increment',
        'Ext.pivot.update.Overwrite',
        'Ext.pivot.update.Percentage',
        'Ext.pivot.update.Uniform'
    ],


    config: {
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
         * @cfg {Number} width
         *
         * Width of the viewer's window.
         */
        width: 400,
        /**
         * @cfg {Object} panel
         *
         * Configuration object used to instantiate the range editor panel.
         */
        panel: {
            xtype: 'pivotrangeeditor'
        },
        /**
         * @cfg {Object} panelWrapper
         *
         * Configuration object used to wrap the range editor panel when needed.
         */
        panelWrapper: {
            xtype: 'sheet',
            right: 0,
            stretchY: true,
            layout: 'fit',
            hideOnMaskTap: true,
            enter: 'right',
            exit: 'right',
            style: {
                padding: 0
            }
        },
        /**
         * @cfg {Boolean} panelWrap
         *
         * Enable or disable the configurator panel wrapper.
         */
        panelWrap: true,
        /**
         * @private
         */
        grid: null,
        /**
         * @private
         */
        view: null
    },

    init: function(grid){
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

        this.setGrid(grid);
        return this.callParent([grid]);
    },

    destroy: function(){
        this.setConfig({
            grid: null,
            view: null,
            panel: null
        });
        this.callParent();
    },

    updateGrid: function(grid, oldGrid){
        var me = this;

        Ext.destroy(me.gridListeners);

        if(grid){
            me.gridListeners = grid.on({
                pivotitemcelldoubletap:     'showPanel',
                pivotgroupcelldoubletap:    'showPanel',
                pivottotalcelldoubletap:    'showPanel',
                scope:                      me,
                destroyable:                true
            });
            me.doneSetup = false;
        }
    },

    updateView: function(view, oldView){
        var me = this,
            panel;

        Ext.destroy(oldView, me.viewListeners);
        if(view){
            panel = view.isXType('pivotrangeeditor') ? view : view.down('pivotrangeeditor');
            if(panel) {
                panel.getViewModel().getStore('sTypes').loadData(this.getUpdaters());
                me.getGrid().relayEvents(panel, ['beforeupdate', 'update'], 'pivot');
                me.viewListeners = panel.on({
                    close: 'hidePanel',
                    scope: me,
                    destroyable: true
                });
            }
            //<debug>
            else{
                Ext.raise('No pivot range editor view available');
            }
            //</debug>
        }
    },

    getWidth: function(){
        var grid = this.getGrid(),
            viewport = Ext.Viewport,
            maxWidth = 100;

        if(grid && grid.element){
            maxWidth = grid.element.getWidth();
        }
        if(viewport){
            maxWidth = Math.min(maxWidth, viewport.element.getHeight(), viewport.element.getWidth());
        }

        return Ext.Number.constrain(this._width, 100, maxWidth);
    },

    showPanel: function(params, e, eOpts){
        var me = this,
            matrix = me.getGrid().getMatrix(),
            view, panel, vm, result, col, dataIndex;

        // do nothing if the plugin is disabled
        if(me.disabled) {
            return;
        }

        if(params.topKey) {
            result = matrix.results.get(params.leftKey, params.topKey);

            me.setup();
            view = me.getView();
            view.setWidth(me.getWidth());
            panel = view.down('pivotrangeeditor');

            if (panel && result) {
                vm = panel.getViewModel();

                col = params.column;
                dataIndex = col.dimension.getDataIndex();

                vm.set('form', {
                    leftKey:    params.leftKey,
                    topKey:     params.topKey,
                    dataIndex:  dataIndex,
                    //field:      col.dimension.header || col.text || dataIndex,
                    value:      result.getValue(col.dimension.getId()),
                    type:       me.getDefaultUpdater(),
                    matrix:     matrix
                });

                view.show();
            }else{
                view.hide();
            }
        }
    },

    hidePanel: function(){
        this.getView().hide();
    },

    setup: function(){
        var me = this,
            view;

        if(me.doneSetup){
            return;
        }

        if(me.getPanelWrap()){
            view = me.getPanelWrapper();
            if(!view.items){
                view.items = [me.getPanel()];
            }
        }else{
            view = me.getPanel();
        }

        me.setView(me.getGrid().add(view));
        me.doneSetup = true;
    }

});