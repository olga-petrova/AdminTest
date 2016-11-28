Ext.define('Ext.theme.device.TitleBar', {
    override: 'Ext.TitleBar',

    platformConfig: {
        material: {
            titleAlign: 'left'
        },
        ios: {
            maxButtonWidth: '80%'
        }
    }
});
