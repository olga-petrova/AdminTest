/**
 * @private
 * Classic.
 */
Ext.define('Ext.d3.ComponentBase', {
    extend: 'Ext.Widget',

    privates: {
        doAddListener: function(name, fn, scope, options, order, caller, manager) {
            if (name == 'painted' || name == 'resize') {
                this.element.doAddListener(name, fn, scope || this, options, order);
            }

            this.callParent([name, fn, scope, options, order, caller, manager]);
        },

        doRemoveListener: function(name, fn, scope) {
            if (name == 'painted' || name == 'resize') {
                this.element.doRemoveListener(name, fn, scope);
            }

            this.callParent([name, fn, scope]);
        }
    },

    destroy: function () {
        var me = this;

        if (me.hasListeners.destroy) {
            // This is consistent with Modern Component - `destroy` event is fired
            // _before_ component is destroyed, but not with Classic Component, where
            // the `destroy` event is fired _after_ component is destroyed.
            me.fireEvent('destroy', me);
        }

        me.callParent();
    }

});