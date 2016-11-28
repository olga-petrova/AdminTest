/**
 * @private
 */
Ext.define('Ext.pivot.plugin.rangeeditor.PanelController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.pivotrangeeditor',

    applySettings: function(){
        var form = this.getViewModel().get('form'),
            fn = Ext.bind(this.cancelSettings, this),
            updater;

        if(form && form.type && form.type.isModel){
            form.type = form.type.get('value');
        }

        updater = Ext.Factory.pivotupdate(form);
        updater.update().then(fn, fn);
    },

    cancelSettings: function(){
        var view = this.getView();
        view.fireEvent('close', view);
    }
});