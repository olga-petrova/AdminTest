Ext.define('Ext.theme.material.dataview.NestedList', {
    override: 'Ext.dataview.NestedList',

    config: {
        backText: '',
        useTitleAsBackText: false,
        itemHeight: 48,
        backButton: {
            ui: 'back',
            iconCls: 'md-icon-arrow-back',
            hidden: true
        }
    }
});
