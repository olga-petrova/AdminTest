Ext.define('Ext.theme.device.grid.Grid', {
    override: 'Ext.grid.Grid',
    platformConfig: {
        ios: {
            itemHeight: 60
        }
    }
});