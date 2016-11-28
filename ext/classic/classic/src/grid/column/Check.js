/**
 * A Column subclass which renders a checkbox in each column cell which toggles the truthiness of the associated data field on click.
 *
 * Example usage:
 *
 *     @example
 *     var store = Ext.create('Ext.data.Store', {
 *         fields: ['name', 'email', 'phone', 'active'],
 *         data: [
 *             { name: 'Lisa', email: 'lisa@simpsons.com', phone: '555-111-1224', active: true },
 *             { name: 'Bart', email: 'bart@simpsons.com', phone: '555-222-1234', active: true },
 *             { name: 'Homer', email: 'homer@simpsons.com', phone: '555-222-1244', active: false },
 *             { name: 'Marge', email: 'marge@simpsons.com', phone: '555-222-1254', active: true }
 *         ]
 *     });
 *
 *     Ext.create('Ext.grid.Panel', {
 *         title: 'Simpsons',
 *         height: 200,
 *         width: 400,
 *         renderTo: Ext.getBody(),
 *         store: store,
 *         columns: [
 *             { text: 'Name', dataIndex: 'name' },
 *             { text: 'Email', dataIndex: 'email', flex: 1 },
 *             { text: 'Phone', dataIndex: 'phone' },
 *             { xtype: 'checkcolumn', text: 'Active', dataIndex: 'active' }
 *         ]
 *     });
 *
 * The check column can be at any index in the columns array.
 */
Ext.define('Ext.grid.column.Check', {
    extend: 'Ext.grid.column.Column',
    alternateClassName: ['Ext.ux.CheckColumn', 'Ext.grid.column.CheckColumn'],
    alias: 'widget.checkcolumn',

    /**
     * @property {Boolean} isCheckColumn
     * `true` in this class to identify an object as an instantiated Check column, or subclass thereof.
     */
    isCheckColumn: true,

    config: {
        /**
         * @cfg {Boolean} [headerCheckbox=false]
         * Configure as `true` to display a checkbox below the header text.
         *
         * Clicking the checkbox will check/uncheck all records.
         */
        headerCheckbox: false
    },

    /**
     * @cfg
     * @hide
     * Overridden from base class. Must center to line up with editor.
     */
    align: 'center',

    /**
     * @cfg {String} [triggerEvent=click]
     * The mouse event which triggers the toggle of a single cell.
     */
    triggerEvent: 'click',

    ignoreExport: true,

    /**
     * @cfg {Boolean} [stopSelection=true]
     * Prevent grid selection upon mousedown.
     */
    stopSelection: true,

    /**
     * @private
     */
    headerCheckedCls: Ext.baseCSSPrefix + 'grid-hd-checker-on',

    /**
     * @private
     * The CSS class used to style and select the header checkbox.
     */
    headerCheckboxCls: Ext.baseCSSPrefix + 'column-header-checkbox',

    checkboxCls: Ext.baseCSSPrefix + 'grid-checkcolumn',

    checkboxCheckedCls: Ext.baseCSSPrefix + 'grid-checkcolumn-checked',

    innerCls: Ext.baseCSSPrefix + 'grid-checkcolumn-cell-inner',

    clickTargetName: 'el',

    defaultFilterType: 'boolean',

    /**
     * @event beforecheckchange
     * Fires when the UI requests a change of check status.
     * The change may be vetoed by returning `false` from a listener.
     * @param {Ext.grid.column.Check} this CheckColumn.
     * @param {Number} rowIndex The row index.
     * @param {Boolean} checked `true` if the box is to be checked.
     * @param {Ext.data.Model} The record to be updated.
     * @param {Ext.event.Event} e The underlying event which caused the check change.
     * @param {Ext.grid.CellContext} e.position A {@link Ext.grid.CellContext CellContext} object
     * containing all contextual information about where the event was triggered.
     */

    /**
     * @event checkchange
     * Fires when the UI has successfully changed the checked state of a row.
     * @param {Ext.grid.column.Check} this CheckColumn.
     * @param {Number} rowIndex The row index.
     * @param {Boolean} checked `true` if the box is now checked.
     * @param {Ext.data.Model} The record which was updated.
     * @param {Ext.event.Event} e The underlying event which caused the check change.
     * @param {Ext.grid.CellContext} e.position A {@link Ext.grid.CellContext CellContext} object
     */

    /**
     * @event beforeheadercheckchange
     * Fires when the header is clicked and before the mass check/uncheck takes place.
     * The change may be vetoed by returning `false` from a listener.
     * @param {Ext.grid.column.Check} this CheckColumn.
     * @param {Boolean} checked `true` if all boxes are to be checked.
     * @param {Ext.event.Event} e The underlying event which caused the check change.
     */

    /**
     * @event headercheckchange
     * Fires after the header is clicked and a mass check/uncheck operation has been completed.
     * @param {Ext.grid.column.Check} this CheckColumn.
     * @param {Boolean} checked `true` if all boxes are now checked.
     * @param {Ext.event.Event} e The underlying event which caused the check change.
     */

    constructor: function(config) {
        // This method may be invoked more than once in an event, so defer its actual invocation.
        // For example it's invoked in the renderer and updater and they may be called from a loop.
        this.updateHeaderState = Ext.Function.createAnimationFrame(config.updateHeaderState || this.updateHeaderState);

        this.scope = this;
        this.callParent(arguments);
    },

    afterComponentLayout: function() {
        var me = this;

        me.callParent(arguments);

        // Only do this once
        if (!me.storeListeners) {
            // Ensure initial rendered state is correct.
            // This will update the header state on the next animation frame
            // after all rows have been rendered.
            me.updateHeaderState();

            // We need to listen to data changed. This includes add and remove as well as reload.
            // We cannot rely on the renderer or updater to kick off an updateHeaderState call
            // because buffered rendering may mean that the UI does not process the entire dataset.
            me.storeListeners = me.getView().dataSource.on({
                datachanged: me.onDataChanged,
                scope: me,
                destroyable: true
            });
        }
    },

    onRemoved: function() {
        this.callParent(arguments);
        this.storeListeners = Ext.destroy(this.storeListeners);
    },

    onDataChanged: function(store, records) {
        // If any records are added or removed, we need up to date the header state.
        this.updateHeaderState();
    },

    updateHeaderCheckbox: function(headerCheckbox) {
        var cls = Ext.baseCSSPrefix + 'column-header-checkbox';
        if (headerCheckbox) {
            this.addCls(cls);

            // So that SPACE/ENTER does not sort, but routes to the checkbox
            this.sortable = false;
        } else {
            this.removeCls(cls);
        }

        // Keep the header checkbox up to date
        this.updateHeaderState();
    },

    /**
     * @private
     * Process and refire events routed from the GridView's processEvent method.
     */
    processEvent: function(type, view, cell, recordIndex, cellIndex, e, record, row) {
        var me = this,
            key = type === 'keydown' && e.getKey(),
            isClick = type === me.triggerEvent,
            disabled = me.disabled,
            ret,
            checked;

        // Flag event to tell SelectionModel not to process it.
        e.stopSelection = !key && me.stopSelection;

        if (!disabled && (isClick || (key === e.ENTER || key === e.SPACE))) {
            checked = !me.isRecordChecked(record);

            // Allow apps to hook beforecheckchange
            if (me.fireEvent('beforecheckchange', me, recordIndex, checked, record, e) !== false) {

                me.setRecordCheck(record, recordIndex, checked, cell, e);

                // Do not allow focus to follow from this mousedown unless the grid is already in actionable mode
                if (isClick && !view.actionableMode) {
                    e.preventDefault();
                }
                if (me.hasListeners.checkchange) {
                    me.fireEvent('checkchange', me, recordIndex, checked, record, e);
                }
            }
        } else {
            ret = me.callParent(arguments);
        }
        return ret;
    },

    onTitleElClick: function(e, t, sortOnClick) {
        var me = this;

        // Toggle if no text, or it's activated by SPACE key, or the click is on the checkbox element.
        if (!me.disabled && (e.keyCode || !me.text || (Ext.fly(e.target).hasCls(me.headerCheckboxCls)))) {
            me.toggleAll(e);
        } else {
            return me.callParent([e, t, sortOnClick]);
        }
    },

    toggleAll: function(e) {
        var me = this,
            view = me.getView(),
            store = view.getStore(),
            checked = !me.allChecked,
            position;

        if (me.fireEvent('beforeheadercheckchange', me, checked, e) !== false) {

            // Only create and maintain a CellContext if there are consumers
            // in the form of event listeners. The event is a click on a 
            // column header and will have no position property.
            if (me.hasListeners.checkchange || me.hasListeners.beforecheckchange) {
                position = e.position = new Ext.grid.CellContext(view);
            }
            store.each(function(record, recordIndex) {
                me.setRecordCheck(record, recordIndex, checked, view.getCell(record, me));
            });

            me.setHeaderStatus(checked, e);
            me.fireEvent('headercheckchange', me, checked, e);
        }
    },

    setHeaderStatus: function(checked, e) {
        var me = this;

        // Will fire initially due to allChecked being undefined and using !==
        if (me.allChecked !== checked) {
            me.allChecked = checked;
            me[checked ? 'addCls' : 'removeCls'](me.headerCheckedCls);
        }
    },

    updateHeaderState: function(e) {
        // This is called on a timer, so ignore if it fires after destruction
        if (!this.destroyed && this.headerCheckbox) {
            this.setHeaderStatus(this.areAllChecked(), e);
        }
    },

    /**
     * Enables this CheckColumn.
     */
    onEnable: function() {
        this.callParent(arguments);
        this._setDisabled(false);
    },

    /**
     * Disables this CheckColumn.
     */
    onDisable: function() {
        this._setDisabled(true);
    },

    // Don't want to conflict with the Component method
    _setDisabled: function(disabled) {
        var me = this,
            cls = me.disabledCls,
            items;

        items = me.up('tablepanel').el.select(me.getCellSelector());
        if (disabled) {
            items.addCls(cls);
        } else {
            items.removeCls(cls);
        }
    },

    // Note: class names are not placed on the prototype bc renderer scope
    // is not in the header.
    defaultRenderer : function(value, cellValues) {
        var me = this,
            cls = me.checkboxCls;

        if (me.disabled) {
            cellValues.tdCls += ' ' + me.disabledCls;
        }
        if (value) {
            cls += ' ' + me.checkboxCheckedCls;
        }

        // This will update the header state on the next animation frame
        // after all rows have been rendered.
        me.updateHeaderState();

        return '<span class="' + cls + '" role="button" tabIndex="0"></span>';
    },

    isRecordChecked: function (record) {
        var prop = this.property;
        if (prop) {
            return record[prop];
        }
        return record.get(this.dataIndex);
    },

    areAllChecked: function() {
        var me = this,
            store = me.getView().getStore(),
            records, len, i;
            
        if (!store.isBufferedStore && store.getCount() > 0) {
            records = store.getData().items;
            len = records.length;
            for (i = 0; i < len; ++i) {
                if (!me.isRecordChecked(records[i])) {
                    return false;
                }
            }
            return true;
        }
    },

    setRecordCheck: function (record, recordIndex, checked, cell) {
        var me = this,
            prop = me.property,
            result;

        // Only proceed if we NEED to change
        if (prop ? record[prop] : record.get(me.dataIndex) != checked) {
            if (prop) {
                record[prop] = checked;
                me.updater(cell, checked);
            } else {
                record.set(me.dataIndex, checked);
            }
        }
    },

    updater: function (cell, value) {
        var me = this;

        cell = Ext.fly(cell);
        cell[me.disabled ? 'addCls' : 'removeCls'](me.disabledCls);
        Ext.fly(cell.down(me.getView().innerSelector, true).firstChild)[value ? 'addCls' : 'removeCls'](Ext.baseCSSPrefix + 'grid-checkcolumn-checked');

        // This will update the header state on the next animation frame
        // after all rows have been updated.
        me.updateHeaderState();
    },

    privates: {
        /**
         * A method called by the render template to allow extra content after the header text.
         * Needs to be a seperate element to carry this. Cannot be a :after pseudo element
         * on one of the textual elements because we need to filter the click target to this
         * element for header checkbox clicking.
         * @private
         */
        afterText: function(out, values) {
            out.push('<span class="', this.headerCheckboxCls, '"></span>');
        }
    }
});
