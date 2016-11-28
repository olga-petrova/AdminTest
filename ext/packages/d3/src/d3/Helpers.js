/**
 * @private
 */
Ext.define('Ext.d3.Helpers', {
    singleton: true,

    makeScale: function (config) {
        //<debug>
        if (!config.type) {
            Ext.raise('The type of scale is not specified.');
        }
        //</debug>
        if (config.type === 'time') {
            // Time scale lives in the `time` namespace, not `scale` as with other scales.
            return this.make('time.scale', config);
        }
        return this.make('scale', config);
    },

    isOrdinalScale: function (scale) {
        // There are no properties on D3 scales that tell the scale's type,
        // so we have to check if the scale has certain method(s).
        return typeof scale.rangePoints === 'function';
    },

    make: function (what, config) {
        // At the time of this writing, only a single D3 entity has the `type` method
        // (d3.svg.symbol). In this case one can use the `$type` key instead of `type`
        // to specify the type of entity to be made.
        var parts = what.split('.'),
            type = parts.length < 2 && (config.$type || config.type),
            thing;

        // fetch
        if (type) {
            thing = d3[what][type];
        } else {
            thing = d3;
            while (parts.length) {
                thing = thing[parts.shift()];
            }
        }

        thing = thing(); // create
        thing = this.configure(thing, config, type);

        return thing;
    },

    /**
     * @param {Function} thing
     * @param {Object} config
     * @param {String/Object} skip The properties in `config` that should be skipped.
     * @return {Function} Configured `thing`.
     */
    configure: function (thing, config, skip) {

        // axis.ticks(20).orient('top')    <-> configure(axis, {ticks: 20, orient: 'top'})
        // scale.domain([0, 20])           <-> configure(scale, {domain: [0, 20]})
        // axis.ticks(d3.time.minutes, 15) <-> configure(axis, {$ticks: [d3.time.minutes, 15]})

        var key, apply;

        for (key in config) {
            apply = key.charAt(0) === '$';
            if (apply) {
                key = key.substr(1);
            }
            if ( ( !skip || skip && (key !== skip || !(key in skip)) ) && thing[key] ) {
                if (apply) {
                    thing[key].apply(thing, config[key]);
                    apply = false;
                } else {
                    thing[key](config[key]);
                }

            }
        }
        return thing;
    },

    setDominantBaseline: function (element, baseline) {
        element.setAttribute('dominant-baseline', baseline);
        this.fakeDominantBaseline(element, baseline);
        if (Ext.isSafari && baseline === 'text-after-edge') {
            // dominant-baseline: text-after-edge doesn't work properly in Safari
            element.setAttribute('baseline-shift', 'super');
        }
    },

    noDominantBaseline: function () {
        // 'dominant-baseline' and 'alignment-baseline' don't work in IE and Edge.
        return Ext.isIE || Ext.isEdge;
    },

    fakeDominantBaselineMap: {
        'alphabetic': '0em',
        'ideographic': '-.24em',
        'hanging': '.72em',
        'mathematical': '.46em',
        'middle': '.22em',
        'central': '.33em',
        'text-after-edge': '-.26em',
        'text-before-edge': '.91em'
    },

    fakeDominantBaseline: function (element, baseline, force) {
        if (force || this.noDominantBaseline()) {
            var dy = this.fakeDominantBaselineMap[baseline];
            dy && element.setAttribute('dy', dy);
        }
    },

    fakeDominantBaselines: function (config) {
        var map = this.fakeDominantBaselineMap,
            selector, baseline, dy, nodeList, i, ln;

        // `config` is a map of the {selector: baseline} format.
        // Alternatively, the method takes two arguments: selector and baseline.

        if (this.noDominantBaseline()) {
            if (arguments.length > 1) {
                selector = arguments[0];
                baseline = arguments[1];
                nodeList = document.querySelectorAll(selector);
                dy = map[baseline];
                if (dy) {
                    for (i = 0, ln = nodeList.length; i < ln; i++) {
                        nodeList[i].setAttribute('dy', dy);
                    }
                }
            } else {
                for (selector in config) {
                    baseline = config[selector];
                    dy = map[baseline];
                    if (dy) {
                        nodeList = document.querySelectorAll(selector);
                        for (i = 0, ln = nodeList.length; i < ln; i++) {
                            nodeList[i].setAttribute('dy', dy);
                        }
                    }
                }
            }
        }
    },

    unitMath: function (string, operation, number) {
        var value = parseFloat(string),
            unit = string.substr(value.toString().length);

        switch (operation) {
            case '*':
                value *= number;
                break;
            case '+':
                value += number;
                break;
            case '/':
                value /= number;
                break;
            case '-':
                value -= number;
                break;
        }

        return value.toString() + unit;
    },

    getLinkId: function (link) {
        var pos = link.search('#'), // e.g. url(#path)
            id = link.substr(pos, link.length - pos - 1);

        return id;
    },

    alignRect: function (x, y, inner, outer, selection) {
        var tx, ty, translation;

        if (outer && inner) {
            switch (x) {
                case 'center':
                    tx = outer.width / 2 - (inner.x + inner.width / 2);
                    break;
                case 'left':
                    tx = -inner.x;
                    break;
                case 'right':
                    tx = outer.width - (inner.x + inner.width);
                    break;
                default:
                    Ext.raise('Invalid value. Valid `x` values are: center, left, right.');
            }
            switch (y) {
                case 'center':
                    ty = outer.height / 2 - (inner.y + inner.height / 2);
                    break;
                case 'top':
                    ty = -inner.y;
                    break;
                case 'bottom':
                    ty = outer.height - (inner.y + inner.height);
                    break;
                default:
                    Ext.raise('Invalid value. Valid `y` values are: center, top, bottom.');
            }
        }

        if (Ext.isNumber(tx) && Ext.isNumber(ty)) {
            tx += outer.x;
            ty += outer.y;
            translation = [tx, ty];
            selection.attr('transform', 'translate(' + translation + ')');
        }
    }

});