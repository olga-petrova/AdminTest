Ext.define('Ext.theme.device.dataview.NestedList', {
    override: 'Ext.dataview.NestedList',

    platformConfig: {
        material: {
            backText: '',
            useTitleAsBackText: false,
            itemHeight: 48,
            backButton: {
                ui: 'back',
                iconCls: 'md-icon-arrow-back',
                hidden: true
            }
        },
        ios: {
            itemHeight: 43,
            useTitleAsBackText: true,
            updateTitleText: false
        }
    }
});
