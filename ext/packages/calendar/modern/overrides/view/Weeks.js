Ext.define('Ext.overrides.calendar.view.Weeks', {
    override: 'Ext.calendar.view.Weeks',

    constructor: function(config) {
        this.callParent([config]);
        this.element.on('resize', 'handleResize', this);
    },

    setRendered: function(rendered) {
        var result = this.callParent([rendered]);
        if (result && rendered) {
            this.refresh();
        }
    },

    destroy: function() {
        this.tip = Ext.destroy(this.tip);
        this.callParent();
    },

    privates: {
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
                me.tip = tip = new Ext.Panel({
                    renderTo: me.element,
                    cls: me.$overflowPopupCls,
                    minWidth: 200,
                    border: true
                });
                tip.element.setStyle('position', 'absolute');
            }

            tip.removeAll();
            events = me.createEvents(events, {
                cls: me.$staticEventCls
            });
            tip.add(events);
            tip.el.dom.setAttribute('data-date', Ext.Date.format(date, me.domFormat));
            tip.show();

            tip.element.alignTo(cell, 'tc-bc?', [0, -20]);
        }
    }
});