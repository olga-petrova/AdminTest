/**
 * This class extends the dimension item to be able to provide additional settings in the configurator plugin.
 */
Ext.define('Ext.pivot.plugin.configurator.Field', {
    extend: 'Ext.pivot.dimension.Item',

    requires: [
        'Ext.pivot.plugin.configurator.FieldSettings'
    ],

    config: {
        /**
         * @cfg {Ext.pivot.plugin.configurator.FieldSettings} settings
         *
         * Define special restrictions or configurations for this field.
         */
        settings: {}
    },

    isField: true,

    clone: function(){
        return new Ext.pivot.plugin.configurator.Field(Ext.applyIf({id: Ext.id()}, this.getInitialConfig()));
    },

    serialize: function(){
        var cfg = this.callParent(arguments);

        return Ext.apply(cfg, {
            settings: cfg.settings.getConfig()
        });
    },

    applyAggregator: function(agg, oldAgg){
        var obj = this.getSettings(),
            fns = obj.getAggregators();

        if(fns.length == 0) {
            Ext.Array.remove(obj.getDrop(), 'aggregate');
        }else{
            if(Ext.Array.indexOf(fns, agg) < 0){
                agg = fns[0];
            }
        }

        return this.callParent(arguments);
    },

    getSettings: function(){
        var ret = this.settings;

        if(!ret){
            ret = new Ext.pivot.plugin.configurator.FieldSettings({});
            this.setSettings(ret);
        }

        return ret;
    },

    applySettings: function(settings, obj){

        if(settings == null || (settings && settings.isFieldSettings)){
            return settings;
        }

        if(settings){
            if(!obj){
                obj = this.getSettings();
            }

            obj.setConfig(settings);
        }

        if(obj){
            this.setAggregator(this.getAggregator());
        }

        return obj;
    },

    getFieldText: function(){
        var header = this.getHeader();

        if(this.isAggregate){
            header += ' (' + this.getAggText() + ')';
        }

        return header;
    },

    getAggText: function(fn){
        var Agg = Ext.pivot.Aggregators,
            f = fn || this.getAggregator();

        if(Ext.isFunction(f)){
            return Agg.customText;
        }

        return Agg[f + 'Text'] || Agg.customText;
    }
});