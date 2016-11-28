Ext.define('Ext.overrides.calendar.view.Days', {
    override: 'Ext.calendar.view.Days',

    constructor: function(config) {
        this.callParent([config]);
        this.element.on('resize', 'handleResize', this);
    },

    setRendered: function(rendered) {
        var result = this.callParent([rendered]);
        if (result && rendered) {
            this.refresh();
        }
    }
});