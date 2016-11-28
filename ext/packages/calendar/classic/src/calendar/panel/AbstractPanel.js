/**
 * A base class for a calendar panel that allows switching between views.
 * 
 * @private
 */
Ext.define('Ext.calendar.panel.AbstractPanel', {
    extend: 'Ext.panel.Panel',

    requires: [
        'Ext.layout.container.Border',
        'Ext.button.Segmented',
        'Ext.toolbar.Toolbar'
    ],

    layout: 'border',

    initComponent: function() {
        var me = this,
            items = me.createItems(),
            // This relies on createItems
            defaultView = me.defaultView;

        me.switcher = new Ext.button.Segmented({
            value: defaultView,
            allowMultiple: false,
            items: me.getSwitcherItems(),
            listeners: {
                scope: me,
                change: 'onSwitcherChange'
            }
        });

        me.items = [{
            itemId: 'sideBar',
            ui: 'light',
            collapsible: true,
            region: 'west',
            title: me.sidebarTitle,
            minWidth: 150,
            bodyPadding: 10,
            items: me.createList(),
            hidden: me.getCompact()
        }, {
            xtype: 'panel',
            region: 'center',
            itemId: 'mainRegion',
            layout: 'card',
            items: items,
            tbar: [{
                xtype: 'button',
                text: me.createText,
                scope: me,
                handler: 'onAddTap'
            }, {
                xtype: 'button',
                text: me.todayText,
                margin: '0 10 0 0',
                scope: me,
                handler: 'onTodayTap'
            }, {
                xtype: 'segmentedbutton',
                allowToggle: false,
                items: [{
                    text: me.previousText,
                    scope: me,
                    handler: 'onPrevTap'
                }, {
                    text: me.nextText,
                    scope: me,
                    handler: 'onNextTap'
                }]
            }, {
                xtype: 'component',
                flex: 1
            }, {
                xtype: 'component',
                itemId: 'calTitle'
            }, {
                xtype: 'component',
                flex: 1
            }, me.switcher]
        }];

        me.callParent();
        me.setViewsValue(me.getValue());
        me.sideBar = me.down('#sideBar');
        me.calTitle = me.down('#calTitle');
        me.mainRegion = me.down('#mainRegion');
        me.calList = me.down('calendar-list');
        me.setView(this.mainRegion.child('#' + defaultView));
    },

    // Appliers/Updaters
    updateCompact: function(compact) {
        var sideBar = this.sideBar;

        if (sideBar && !this.isConfiguring) {
            sideBar.setVisible(!compact);
        }
    },

    // Overrides
    onDestroy: function() {
        var me = this;
        me.sideBar = me.calList = me.mainRegion = me.calTitle = me.switcher = null;
        me.callParent();
    },

    privates: {
        doSetView: function(view) {
            this.mainRegion.setActiveItem(view);
        },

        onSwitcherChange: function(btn, values) {
            this.setView(values[0], true);
        },

        setSwitcherValue: function(value) {
            var switcher = this.switcher;
            if (switcher) {
                switcher.setValue(value);
            }
        }
    }
});