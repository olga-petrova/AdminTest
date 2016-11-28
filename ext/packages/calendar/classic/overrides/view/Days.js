Ext.define('Ext.overrides.calendar.view.Days', {
    override: 'Ext.calendar.view.Days',

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

    privates: {
        doRefresh: function() {
            this.callParent();
            this.updateLayout();
        }
    }
});