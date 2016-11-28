Ext.define('Ext.theme.device.dataview.List', {
    override: 'Ext.dataview.List',

    platformConfig: {
        material: {
            itemHeight: 48
        },
        ios: {
            itemHeight: 43
        }
    }
});