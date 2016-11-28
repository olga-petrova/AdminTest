/**
 * A base class for a calendar panel that allows switching between views.
 * 
 * @private
 */
Ext.define('Ext.calendar.panel.AbstractPanel', {
    extend: 'Ext.Panel',

    requires: [
        'Ext.layout.HBox',
        'Ext.SegmentedButton',
        'Ext.Toolbar',
        'Ext.Sheet'
    ],

    layout: {
        type: 'hbox',
        align: 'stretch'
    },

    config: {
        switcherPosition: 'titlebar'
    },

    initialize: function() {
        var me = this,
            items = me.createItems(),
            // This depends on createItems
            defaultView = me.defaultView,
            titleBar = me.titleBar;

        me.createList();
        if (titleBar) {
            items = items.concat([titleBar]);
        }

        me.setItems([me.createSidebar(), {
            xtype: 'panel',
            itemId: 'mainRegion',
            flex: 1,
            layout: 'card',
            items: items
        }]);

        me.callParent();
        me.setViewsValue(me.getValue());
        me.sideBar = me.down('#sideBar');
        me.mainRegion = me.down('#mainRegion');
        if (me.titleBar) {
            me.calTitle = me.down('#calTitle');
        }
        me.setView(this.mainRegion.child('#' + defaultView));
    },

    // Appliers/Updaters
    updateCompact: function(compact) {
        var me = this,
            sideBar = me.sideBar,
            main = me.mainRegion,
            cfg;

        if (sideBar) {
            sideBar.setHidden(compact);
            if (!me.isConfiguring && !compact) {
                sideBar.add(me.calList);
            }
        }

        me.sheet = me.titleBar = Ext.destroy(me.titleBar, me.sheet);

        cfg = compact ? me.createCompactTitleBar() : me.createNormalTitleBar();
        cfg.itemId = 'titleBar';
        cfg.docked = 'top';
        if (main) {
            me.titleBar = me.add(cfg);
        } else {
            me.titleBar = cfg;
        }
        me.calTitle = me.down('#calTitle');
        me.refreshCalTitle();
    },

    updateSwitcherPosition: function(switcherPosition) {
        var me = this,
            compact;

        if (!me.isConfiguring) {
            compact = me.getCompact();
            if (switcherPosition === 'titlebar') {
                Ext.destroy(me.down('#switcherList'));
                if (!compact) {
                    me.down('#titleBar').add(me.createSwitcherButton());
                }
            } else {
                Ext.destroy(me.down('#switcherButton'));
                me.down('#sidebarItems').add(me.createSwitcherList());
            }
        }
    },

    // Overrides 
    destroy: function() {
        var me = this;
        me.sheet = me.sideBar = me.calList = me.mainRegion = 
            me.titleBar = me.calTitle = Ext.destroy(me.sheet);

        me.callParent();
    },

    privates: {
        createCompactTitleBar: function() {
            var me = this;

            return {
                xtype: 'toolbar',
                items: [{
                    xtype: 'button',
                    ui: 'flat',
                    iconCls: 'x-fa fa-bars',
                    scope: me,
                    handler: 'onMenuButtonTap'
                }, {
                    xtype: 'component',
                    flex: 1
                }, {
                    xtype: 'component',
                    itemId: 'calTitle',
                    listeners: {
                        element: 'element',
                        scope: me,
                        tap: 'onTodayTap'
                    }
                }, {
                    xtype: 'component',
                    flex: 1
                }, {
                    xtype: 'button',
                    iconCls: 'x-fa fa-plus',
                    ui: 'flat',
                    scope: me,
                    handler: 'onAddTap'
                }]
            };
        },

        createNormalTitleBar: function() {
            var me = this,
                items = [{
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
                }];

            if (me.getSwitcherPosition() === 'titlebar') {
                items.push(me.createSwitcherButton());
            }

            return {
                xtype: 'toolbar',
                items: items
            };
        },

        createSidebar: function() {
            var me = this,
                items;

            items = [me.calList];
            if (me.getSwitcherPosition() === 'sidebar') {
                items.push({
                    xtype: 'component',
                    flex: 1
                }, me.createSwitcherList());
            }

            return {
                xtype: 'panel',
                itemId: 'sideBar',
                ui: 'light',
                title: me.sidebarTitle,
                minWidth: 150,
                hidden: me.getCompact(),
                layout: 'vbox',
                items: [{
                    xtype: 'container',
                    margin: '0 0 10 0',
                    layout: {
                        type: 'hbox',
                        pack: 'center'
                    },
                    items: {
                        xtype: 'button',
                        cls: Ext.baseCSSPrefix + 'calendar-create-button',
                        ui: 'action',
                        text: me.createText,
                        scope: me,
                        handler: 'onAddTap'
                    }
                }, {
                    xtype: 'panel',
                    flex: 1,
                    layout: 'vbox',
                    itemId: 'sidebarItems',
                    cls: Ext.baseCSSPrefix + 'calendar-sidebar-wrap',
                    items: items
                }]
            };
        },

        createSwitcherButton: function() {
            return {
                xtype: 'segmentedbutton',
                itemId: 'switcherButton',
                allowMultiple: false,
                items: this.getSwitcherItems(),
                listeners: {
                    scope: this,
                    change: 'onSwitcherChange'
                }
            };
        },

        createSwitcherList: function() {
            return {
                xtype: 'list',
                itemId: 'switcherList',
                cls: Ext.baseCSSPrefix + 'selectfield-overlay ' + Ext.baseCSSPrefix + 'selectfield-overlay-left',
                itemTpl: '<span class="x-list-label">{text}</span>',
                store: {
                    autoDestroy: true,
                    fields: ['text', 'value'],
                    data: this.getSwitcherItems()
                },
                listeners: {
                    scope: this,
                    selectionchange: 'onListSelect'
                }
            };
        },

        doSetView: function(view) {
            this.mainRegion.setActiveItem(view);
        },

        findSwitcherRecord: function(switcher, value) {
            return switcher.getStore().findRecord('value', value);
        },

        onListSelect: function(list, selections) {
            var sheet = this.sheet;
            this.setView(selections[0].get('value'));
            if (sheet) {
                sheet.hide();
            }
        },

        onMenuButtonTap: function() {
            var me = this,
                sheet = me.sheet,
                view, switcher;

            if (!sheet) {
                me.sheet = sheet = new Ext.Sheet({
                    cls: Ext.baseCSSPrefix + 'calendar-panel-sheet',
                    centered: false,
                    enter: 'left',
                    exit: 'left',
                    hideOnMaskTap: true,
                    stretchY: true,
                    ui: 'light',
                    header: {
                        border: false,
                        title: me.sidebarTitle
                    },
                    layout: {
                        type: 'vbox',
                        align: 'stretch'
                    },
                    items: [me.calList, {
                        xtype: 'component',
                        flex: 1
                    }, me.createSwitcherList()]
                });
                view = this.activeView;
                if (view) {
                    view = view.getItemId();
                } else {
                    view = me.defaultView;
                }
                switcher = sheet.down('#switcherList');
                switcher.select(me.findSwitcherRecord(switcher, view));
            }
            sheet.show();
        },

        onSwitcherChange: function(btn, value) {
            var sheet = this.sheet;
            if (this.getCompact() && sheet) {
                sheet.hide();
            }
            this.setView(value, true);
        },

        setSwitcherListValue: function(list, value) {
            this.suspend = true;
            list.deselectAll();
            list.select(this.findSwitcherRecord(list, value));
            this.suspend = false;
        },

        setSwitcherValue: function(value) {
            var me = this,
                switcher, sheet;

            if (me.suspend) {
                return;
            }

            if (me.getCompact()) {
                sheet = me.sheet;
                if (sheet) {
                    switcher = sheet.down('#switcherList');
                    me.setSwitcherListValue(switcher, value);
                }
            } else {
                switcher = me.down('#switcherButton');
                if (switcher) {
                    switcher.setValue(value);
                } else {
                    switcher = me.down('#switcherList');
                    me.setSwitcherListValue(switcher, value);
                }
            }
        }
    }
});