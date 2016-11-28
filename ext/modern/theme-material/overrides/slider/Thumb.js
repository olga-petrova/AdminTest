Ext.define('Ext.theme.material.slider.Thumb', {
    override: 'Ext.slider.Thumb',

    getTemplate: function() {
        return [{
            tag: 'div',
            className: Ext.baseCSSPrefix + 'thumb-inner',
            reference: 'innerElement'
        }];
    }

});