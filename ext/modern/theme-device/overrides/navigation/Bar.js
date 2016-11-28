Ext.define('Ext.theme.device.navigation.Bar', {
    override: 'Ext.navigation.Bar',

    platformConfig: {
        material: {
            defaultBackButtonText: '',
            useTitleForBackButtonText: false,
            backButton: {
                align: 'left',
                ui: 'back',
                hidden: true,
                iconCls: 'md-icon-arrow-back'
            }
        }
    }
});
