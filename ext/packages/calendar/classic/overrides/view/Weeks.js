Ext.define('Ext.overrides.calendar.view.Weeks', {
    override: 'Ext.calendar.view.Weeks',

    requires: [
        'Ext.calendar.form.Edit',
        'Ext.calendar.form.Add'
    ],

    constructor: function(config) {
        this.callParent([config]);
        this.initialized = true;
    },

    render: function(container, position) {
        var me = this;

        me.callParent([container, position]);
        if (me.initialized && !me.getRefOwner()) {
            me.refresh();
        }
    },

    afterComponentLayout: function(width, height, oldWidth, oldHeight) {
        this.callParent([width, height, oldWidth, oldHeight]);
        this.handleResize();
    },

    destroy: function() {
        this.tip = Ext.destroy(this.tip);
        this.callParent();
    },

    privates: {
        doRefresh: function() {
            this.callParent();
            this.updateLayout();
        },
        
        hideOverflowPopup: function() {
            var tip = this.tip;
            if (tip) {
                tip.hide();
                tip.removeAll();
            }
        },

        showOverflowPopup: function(events, date, cell) {
            var me = this,
                tip = me.tip;

            if (!tip) {
                me.tip = tip = new Ext.panel.Panel({
                    renderTo: me.element,
                    constrain: true,
                    border: true,
                    header: false,
                    cls: me.$overflowPopupCls,
                    minWidth: 200,
                    floating: true
                });
            }

            tip.suspendLayouts();
            tip.removeAll();
            events = me.createEvents(events, {
                cls: me.$staticEventCls
            });
            tip.add(events);
            tip.el.dom.setAttribute('data-date', Ext.Date.format(date, me.domFormat));

            tip.resumeLayouts(true);
            tip.show();

            tip.alignTo(cell, 'tc-bc?', [0, -20]);
        }
    }
});