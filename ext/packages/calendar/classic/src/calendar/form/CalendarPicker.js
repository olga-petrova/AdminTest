/**
 * A calendar picker component.
 */
Ext.define('Ext.calendar.form.CalendarPicker', {
    extend: 'Ext.form.field.ComboBox',
    xtype: 'calendar-calendar-picker',

    cls: Ext.baseCSSPrefix + 'calendar-picker-field',

    listConfig: {
        cls: Ext.baseCSSPrefix + 'calendar-picker-list',
        getInnerTpl: function(displayField) {
            return '<div class="' + Ext.baseCSSPrefix + 'calendar-picker-list-icon" style="background-color: {color};"></div>' +
                   '<div class="' + Ext.baseCSSPrefix + 'calendar-picker-list-text">{' + displayField + '}</div>';
        },

        prepareData: function(data, index, record) {
            return {
                id: record.id,
                title: record.getTitle(),
                color: record.getBaseColor()
            };
        }
    },

    afterRender: function() {
        this.callParent();
        this.updateValue();
    },

    onDestroy: function() {
        this.iconEl = null;
        this.callParent();
    },

    updateValue: function() {
        var me = this,
            el, record;

        me.callParent();

        record = me.valueCollection.first();

        if (me.rendered) {
            el = me.iconEl;
            if (!el) {
                me.iconEl = el = me.inputWrap.createChild({
                    cls: Ext.baseCSSPrefix + 'calendar-picker-field-icon'
                });
            }
            if (record) {
                el.setDisplayed(true);
                el.setStyle('background-color', record.getBaseColor());
            } else {
                el.setDisplayed(false);
            }
        }
    }
});