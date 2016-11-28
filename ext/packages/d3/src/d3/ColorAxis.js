/**
 * A class that maps data values to colors.
 */
Ext.define('Ext.d3.ColorAxis', {

    requires: [
        'Ext.d3.Helpers'
    ],

    mixins: {
        observable: 'Ext.mixin.Observable'
    },

    isColorAxis: true,

    config: {
        /**
         * @cfg {Function} scale
         * A D3 [scale](https://github.com/d3/d3/wiki/Scales) with a color range.
         */
        scale: {
            // Notes about config merging effects for scales.
            // For example, if default `scale` config for this class is:
            //
            //     scale: {
            //         type: 'linear',
            //         range: ['white', 'maroon']
            //     }
            //
            // and component's `colorAxis` config is
            //
            //    colorAxis: {
            //        scale: {
            //            type: 'category20'
            //        }
            //    }
            //
            // the `category20` scale will be created, defined by D3 as:
            //
            //     d3.scale.ordinal().range(d3_category20)
            //
            // but because the configs are merged, the ['white', 'maroon'] range will also apply
            // to the new `category20` scale, which defeats the purpose of using this scale.
            // So we only allow config merging for scales of the same type.
            merge: function (value, baseValue) {
                if (value && value.type && baseValue && baseValue.type === value.type) {
                    value = Ext.Object.merge(baseValue, value);
                }
                return value;
            },
            $value: {
                type: 'linear',
                range: ['white', 'maroon']
            }
        },

        /**
         * @cfg {String} field
         * The field that will be used to fetch the value,
         * when a {@link Ext.data.Model} instance is passed to the {@link #getColor} method.
         */
        field: null,

        /**
         * @cfg {Function} processor
         * Custom value processor.
         * @param {Ext.d3.ColorAxis} axis
         * @param {Function} scale
         * @param {Ext.data.Model/*} value
         * @param {String} field
         * @return {String} color
         */
        processor: null,

        minimum: null,
        maximum: null
    },
    
    constructor: function (config) {
        this.mixins.observable.constructor.call(this, config);
    },

    applyScale: function (scale, oldScale) {
        if (scale) {
            if (!Ext.isFunction(scale)) {
                scale = Ext.d3.Helpers.makeScale(scale);
            }
        }
        return scale || oldScale;
    },

    updateScale: function (scale) {
        this.scale = scale;
    },

    updateField: function (field) {
        this.field = field;
    },

    updateProcessor: function (processor) {
        this.processor = processor;
    },

    getColor: function (value) {
        var scale = this.scale,
            field = this.field,
            processor = this.processor,
            color;

        if (processor) {
            color = processor(this, scale, value, field);
        } else if (value && value.isModel && field) {
            color = scale(value.data[field]);
        } else {
            color = scale(value);
        }

        return color;
    },

    updateMinimum: function () {
        this.setDomain();
    },

    updateMaximum: function () {
        this.setDomain();
    },

    /**
     * @private
     * For quantitative scales only!
     */
    findDataDomain: function (models) {
        var field = this.field;

        if (field) {
            return [
                d3.min(models, function (model) { return model.data[field]; }),
                d3.max(models, function (model) { return model.data[field]; })
            ];
        }
    },

    /**
     * @private
     * For quantitative scales only!
     */
    setDomainFromData: function (models) {
        this.setDomain(this.findDataDomain(models));
    },

    /**
     * @private
     * For quantitative scales only!
     * Sets the domain of the {@link #scale} taking into account the
     * {@link #minimum} and {@link #maximum}. If no `domain` is given,
     * updates the current domain.
     * @param {Number[]} [domain]
     */
    setDomain: function (domain) {
        var me = this,
            scale = me.getScale(),
            range = scale.range(),
            rangeLength = range.length,
            minimum = me.getMinimum(),
            maximum = me.getMaximum(),
            step, start, end, i;

        if (scale) {
            if (!domain) {
                domain = scale.domain();
            }
            domain = domain.slice();
            // Domain is an array of two or more numbers.
            if (Ext.isNumber(minimum)) {
                domain[0] = minimum;
            }
            if (Ext.isNumber(maximum)) {
                domain[domain.length - 1] = maximum;
            }
            if (domain.length !== rangeLength) {
                // make polylinear color scale
                start = domain[0];
                end = domain[domain.length - 1];
                step = (end - start) / (rangeLength - 1);
                domain = [];
                for (i = 0; i < rangeLength - 1; i++) {
                    domain.push(start + i * step);
                }
                domain.push(end);
            }
            scale.domain(domain);

            me.fireEvent('scalechange', me, scale);
        }
    }

});