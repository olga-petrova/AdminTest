Ext.define('Ext.theme.device.MessageBox', {
    override: 'Ext.MessageBox',

    platformConfig: {
        material: {
            buttonToolbar: {
                layout: {
                    pack: 'end'
                }
            }
        }
    }
});
