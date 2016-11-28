Ext.define('Ext.theme.material.field.Text', {
    override: 'Ext.field.Text',

    config: {
        useLabelAsPlaceHolder: null
    },

    updateLabel: function (newLabel, oldLabel) {
        this.callParent(arguments);

        if (this.getUseLabelAsPlaceHolder()) {
            this.setPlaceHolder(newLabel);
        }
    },

    updatePlaceHolder: function (newPlaceHolder) {
        var labelAsPlaceHolder = this.getUseLabelAsPlaceHolder(),
            label = this.getLabel();

        //<debug>
        if (labelAsPlaceHolder && newPlaceHolder !== label) {
            Ext.Logger.warn("PlaceHolder should not be set when using 'labelAsPlaceHolder'", this);
        }
        //</debug>

        this.callParent(arguments);
    },

    updateUseLabelAsPlaceHolder: function (value) {
        this.toggleCls(Ext.baseCSSPrefix + 'field-placeholder-label', !!value);
    }
});