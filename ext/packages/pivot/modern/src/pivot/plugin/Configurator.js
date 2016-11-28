/**
 * This plugin allows the end user to configure the pivot component.
 *
 * It adds the following methods to the pivot grid:
 * - showConfigurator: which when called will show the configurator panel
 * - hideConfigurator: which when called will hide the configurator panel
 *
 * The configurator panel will be shown when the end-user does a `longpress` or a `swipe` event
 * on the column headers.
 */
Ext.define('Ext.pivot.plugin.Configurator', {
    extend: 'Ext.AbstractPlugin',

    requires: [
        'Ext.util.Collection',
        'Ext.pivot.plugin.configurator.Panel'
    ],

    alias: 'plugin.pivotconfigurator',

    /**
     * Fired on the pivot component before a configurator field is moved.
     *
     * Return false if you don't want to move that field.
     *
     * @event beforemoveconfigfield
     * @param {Ext.pivot.plugin.configurator.Panel} panel Configurator panel
     * @param {Object} config
     * @param {Ext.pivot.plugin.configurator.Container} config.fromContainer Source container to move from
     * @param {Ext.pivot.plugin.configurator.Container} config.toContainer Destination container to move to
     * @param {Ext.pivot.plugin.configurator.Field} config.field Field configuration
     */

    /**
     * Fired on the pivot component before the field settings container is shown.
     *
     * Return false if you don't want to show the field settings container.
     *
     * @event beforeshowconfigfieldsettings
     * @param {Ext.pivot.plugin.configurator.Panel} panel Configurator panel
     * @param {Object} config
     * @param {Ext.form.Panel} config.container Form panel container where you can inject
     * additional fields
     * @param {Object} config.settings Settings that will be loaded into the form
     */

    /**
     * Fired on the pivot component after the configurator field settings container is shown.
     *
     * @event showconfigfieldsettings
     * @param {Ext.pivot.plugin.configurator.Panel} panel Configurator panel
     * @param {Object} config
     * @param {Ext.form.Panel} config.container Form panel container where you can inject
     * additional fields
     * @param {Object} config.settings Settings that were loaded into the form
     */

    /**
     * Fired on the pivot component before settings are applied to the configurator field.
     *
     * Return false if you don't want to apply the settings to the field.
     *
     * @event beforeapplyconfigfieldsettings
     * @param {Ext.pivot.plugin.configurator.Panel} panel Configurator panel
     * @param {Object} config
     * @param {Ext.form.Panel} config.container Form panel container that contains all field settings
     * @param {Object} config.settings Settings that will be loaded into the form
     */

    /**
     * Fired on the pivot component after settings are applied to the configurator field.
     *
     * @event applyconfigfieldsettings
     * @param {Ext.pivot.plugin.configurator.Panel} panel Configurator panel
     * @param {Object} config
     * @param {Ext.form.Panel} config.container Form panel container that contains all field settings
     * @param {Object} config.settings Settings that were loaded into the form
     */

    /**
     * Fired on the pivot component before the new configuration is applied.
     *
     * Return false if you don't want to apply the new configuration to the pivot grid.
     *
     * @event beforeconfigchange
     * @param {Ext.pivot.plugin.configurator.Panel} panel Configurator panel
     * @param {Object} config Config object used to reconfigure the pivot
     */

    /**
     * Fired on the pivot component when the configuration changes.
     *
     * @event configchange
     * @param {Ext.pivot.plugin.configurator.Panel} panel Configurator panel
     * @param {Object} config Config object used to reconfigure the pivot
     */

    /**
     * Fired on the pivot component when the configurator panel is visible
     *
     * @event showconfigpanel
     * @param {Ext.pivot.plugin.configurator.Panel} panel Configurator panel
     */

    /**
     * Fired on the pivot component when the configurator panel is disabled
     *
     * @event hideconfigpanel
     * @param {Ext.pivot.plugin.configurator.Panel} panel Configurator panel
     */


    config: {
        /**
         * @cfg {Ext.pivot.plugin.configurator.Field[]} fields
         *
         * This is the array of fields you want to be used in the configurator.
         *
         * If no fields are defined then all fields are fetched from the store model if
         * a {@link Ext.pivot.matrix.Local Local} matrix is used.
         *
         * The fields are indexed by the dataIndex supplied to them which means that you can't have two fields
         * sharing the same dataIndex. If you want to define two fields that share the same dataIndex then
         * it's best to use a unique dataIndex for the 2nd field and define a grouperFn on it.
         *
         * The dimensions that are configured on the pivot component but do not exist in this fields collection
         * will be added here with a set of default settings.
         */
        fields:         [],
        /**
         * @cfg {Number} width
         *
         * The width of the configurator panel.
         */
        width: 400,
        /**
         * @cfg {Object} panel
         *
         * Configuration object used to instantiate the configurator panel.
         */
        panel: {
            xtype: 'pivotconfigpanel',
            docked: 'right'
        },
        /**
         * @cfg {Object} panelWrapper
         *
         * Configuration object used to wrap the configurator panel when needed.
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
        grid:           null,
        /**
         * Reference to the configurator panel.
         * @private
         */
        view: null
    },

    platformConfig: {
        desktop: {
            panelWrap: false
        }
    },

    init: function(grid) {
        this.setGrid(grid);
    },

    /**
     * @private
     * AbstractComponent calls destroy on all its plugins at destroy time.
     */
    destroy: function() {
        this.setConfig({
            grid: null,
            view: null,
            panel: null
        });
        this.callParent();
    },

    /**
     * Enable the plugin to show the configurator panel.
     */
    enable: function() {
        this.disabled = false;
        this.showConfigurator();
    },

    /**
     * Disable the plugin to hide the configurator panel.
     */
    disable: function() {
        this.disabled = true;
        this.hideConfigurator();
    },

    //applyView: function(view) {
    //    if (view && !view.isComponent) {
    //        view = Ext.factory(view, Ext.pivot.plugin.configurator.Panel);
    //    }
    //
    //    return view;
    //},

    updateView: function(view, oldView){
        var me = this,
            panel;

        Ext.destroy(oldView, me.panelListeners);

        if(view){
            panel = view.isXType('pivotconfigpanel') ? view : view.down('pivotconfigpanel');

            if(panel) {
                me.panelListeners = panel.on({
                    close: 'hideConfigurator',
                    scope: me
                });

                panel.setConfig({
                    pivot: me.getGrid(),
                    fields: me.getFields()
                });
            }
            //<debug>
            else{
                Ext.raise('Wrong panel configuration! No "pivotconfigpanel" component available.');
            }
            //</debug>

        }
    },

    updateGrid: function(grid, oldGrid){
        var me = this;

        Ext.destroy(me.gridListeners);

        if(oldGrid){
            oldGrid.showConfigurator = oldGrid.hideConfigurator = null;
        }

        if(grid){
            //<debug>
            // this plugin is only available for the pivot components
            if (!grid.isPivotGrid) {
                Ext.raise('This plugin is only compatible with pivot grid');
            }
            //</debug>
            grid.showConfigurator = Ext.bind(me.showConfigurator, me);
            grid.hideConfigurator = Ext.bind(me.hideConfigurator, me);

            if(grid.initialized){
                me.onGridInitialized();
            }else {
                grid.on({
                    initialize: 'onGridInitialized',
                    single: true,
                    scope: me
                });
            }
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

    /**
     * @private
     */
    onGridInitialized: function(){
        var me = this,
            grid = me.getGrid(),
            fields = me.getFields(),
            matrix = grid.getMatrix(),
            store, newFields, field, name, length, i, dim;

        // extract fields from the existing pivot configuration
        newFields = Ext.Array.merge(matrix.leftAxis.dimensions.getRange(), matrix.topAxis.dimensions.getRange(), matrix.aggregate.getRange());
        length = newFields.length;

        for (i = 0; i < length; i++) {
            dim = newFields[i].getInitialConfig();
            delete(dim.matrix);
            field = fields.byDataIndex.get(dim.dataIndex);
            if(!field) {
                fields.add(dim);
            }else{
                field.setConfig(dim);
            }
        }

        if(fields.length === 0) {
            // if no fields were provided then try to extract them from the matrix store
            store = me.getCmp().getStore();
            newFields = store ? store.model.getFields() : [];
            length = newFields.length;

            for (i = 0; i < length; i++) {
                name = newFields[i].getName();

                if (!fields.byDataIndex.get(name)) {
                    fields.add({
                        header: Ext.String.capitalize(name),
                        dataIndex: name
                    });
                }
            }
        }

        me.isReady = true;
        me.doneSetup = false;

        me.gridListeners = grid.getHeaderContainer().renderElement.on({
            longpress: 'showConfigurator',
            scope: this
        });
    },

    /**
     * @private
     */
    hideConfigurator: function() {
        var grid = this.getGrid(),
            view;

        this.setup();
        view = this.getView();

        view.translate(this.getWidth(), 0, {duration: 100});
        view.getTranslatable().on('animationend', function() {
            view.hide(null);
            grid.fireEvent('hideconfigpanel', view);
        }, this, {single: true});
    },

    /**
     * @private
     */
    showConfigurator: function() {
        var me = this,
            view;

        me.setup();
        view = me.getView();

        view.setWidth(me.getWidth());
        view.show();
        view.translate(0, 0, {duration: 100});
        this.getGrid().fireEvent('showconfigpanel', view);
    },

    getFields: function(){
        var ret = this._fields;

        if(!ret){
            ret = new Ext.util.Collection({
                extraKeys: {
                    byDataIndex: 'dataIndex'
                },
                decoder: function(field){
                    return (field && field.isField) ? field : new Ext.pivot.plugin.configurator.Field(field || {});
                }
            });
            this.setFields(ret);
        }

        return ret;
    },

    applyFields: function(fields, fieldsCollection){
        if(fields == null || (fields && fields.isCollection)){
            return fields;
        }

        if(fields){
            if(!fieldsCollection){
                fieldsCollection = this.getFields();
            }

            fieldsCollection.splice(0, fieldsCollection.length, fields);
        }

        return fieldsCollection;
    },

    privates: {
        setup: function () {
            var me = this,
                view, panel;

            if (me.doneSetup || !me.isReady) {
                return;
            }
            me.doneSetup = true;

            if(me.getPanelWrap()){
                view = me.getPanelWrapper();
                if(!view.items){
                    panel = me.getPanel();
                    panel.docked = null;
                    view.items = [panel];
                }
            }else{
                view = me.getPanel();
            }

            me.setView(me.getGrid().add(view));
        }
    }


});