/**
 * @private
 */
Ext.define('Ext.d3.Axis', {

    requires: [
        'Ext.d3.Helpers'
    ],

    mixins: {
        observable: 'Ext.mixin.Observable',
        detached: 'Ext.d3.mixin.Detached'
    },

    config: {

        axis: {
            orient: 'top'
        },

        scale: {
            type: 'linear'
        },

        /**
         * @param {Object} title
         * @param {String} title.text Axis title text.
         * @param {String} [title.position='outside']
         * Controls the vertical placement of the axis title. Available options are:
         *
         *   - `'outside'`: axis title is placed on the tick side
         *   - `'inside'`: axis title is placed on the side with no ticks
         *
         * @param {String} [title.alignment='middle']
         * Controls the horizontal placement of the axis title. Available options are:
         *
         *   - `'middle'`, `'center'`: axis title is placed in the middle of the axis line
         *   - `'start'`, `'left'`: axis title is placed at the start of the axis line
         *   - `'end'`, `'right'`: axis title is placed at the end of the axis line
         *
         * @param {String} [title.padding='0.5em']
         * The gap between the title and axis labels.
         */
        title: null,

        parent: null
    },

    defaultCls: {
        self: Ext.baseCSSPrefix + 'd3-axis',
        title: Ext.baseCSSPrefix + 'd3-axis-title'
    },

    title: null,
    group: null,
    domain: null,

    constructor: function (config) {
        var me = this,
            id;

        config = config || {};

        if ('id' in config) {
            id = config.id;
        } else if ('id' in me.config) {
            id = me.config.id;
        } else {
            id = me.getId();
        }
        me.setId(id);

        me.mixins.detached.constructor.call(me, config);
        me.group = me.getDetached().append('g')
            .classed(me.defaultCls.self, true)
            .attr('id', me.getId());

        me.mixins.observable.constructor.call(me, config);
    },

    getGroup: function () {
        return this.group;
    },

    getBox: function () {
        return this.group.node().getBBox();
    },

    applyScale: function (scale, oldScale) {
        var axis = this.getAxis();

        if (scale) {
            if (!Ext.isFunction(scale)) {
                scale = Ext.d3.Helpers.makeScale(scale);
            }
            if (axis) {
                axis.scale(scale);
            }
        }
        return scale || oldScale;
    },

    applyAxis: function (axis, oldAxis) {
        var scale = this.getScale();

        if (axis) {
            if (!Ext.isFunction(axis)) { // if `axis` is not already a d3.svg.axis
                if (oldAxis) { // reconfigure
                    axis = Ext.d3.Helpers.configure(oldAxis, axis);
                } else { // create
                    axis = Ext.d3.Helpers.make('svg.axis', axis);
                }
            }
            if (scale) {
                axis.scale(scale);
            }
        }

        return axis || oldAxis;
    },

    updateParent: function (parent) {
        var me = this,
            axis = me.getAxis();

        if (parent) {
            // Move axis `group` from `detached` to `parent`.
            me.attach(parent, me.group);
            me.render();
        } else {
            me.detach(me.group);
        }

        return parent;
    },

    updateTitle: function (title) {
        var me = this;

        if (title) {
            if (me.title) {
                if (me.isDetached(me.title)) {
                    me.attach(me.group, me.title);
                }
            } else {
                me.title = me.group.append('text').classed(me.defaultCls.title, true);
            }
            me.title.text(title.text || '');
            me.title.attr(title.attr);
            me.positionTitle(title);
        } else {
            if (me.title) {
                me.detach(me.title);
            }
        }
    },

    getAxisLine: function () {
        var me = this,
            domain = me.domain;

        if (!domain) {
            domain = me.group.select('path.domain');
        }

        return domain.empty() ? null : (me.domain = domain);
    },

    getTicksBBox: function () {
        var me = this,
            group = me.group,
            groupNode, temp, tempNode,
            ticks, bbox;

        ticks = group.selectAll('.tick');

        if (ticks.size()) {
            temp = group.append('g');
            tempNode = temp.node();
            groupNode = group.node();

            ticks.each(function () {
                tempNode.appendChild(this);
            });
            bbox = tempNode.getBBox();

            ticks.each(function () {
                groupNode.appendChild(this);
            });
            temp.remove();
        }

        return bbox;
    },
    
    positionTitle: function (cfg) {
        var me = this,
            title = me.title,
            axis = me.getAxis(),
            line = me.getAxisLine(),
            orient = axis.orient(),
            isVertical = orient === 'left' || orient === 'right',
            Helpers = Ext.d3.Helpers,
            beforeEdge = 'text-before-edge',
            afterEdge = 'text-after-edge',
            alignment, position, padding,
            textAnchor, isOutside,
            lineBBox, ticksBBox,
            x = 0,
            y = 0;

        if (!(line && title )) {
            return;
        }

        cfg = cfg || me.getTitle();

        lineBBox = line.node().getBBox();
        ticksBBox = me.getTicksBBox();

        alignment = cfg.alignment || 'middle';
        position = cfg.position || 'outside';
        isOutside = position === 'outside';
        padding = cfg.padding || '0.5em';

        switch (alignment) {
            case 'start':
            case 'left':
                textAnchor = 'start';
                if (isVertical) {
                    y = lineBBox.y + lineBBox.height;
                } else {
                    x = lineBBox.x;
                }
                break;
            case 'end':
            case 'right':
                textAnchor = 'end';
                if (isVertical) {
                    y = lineBBox.y ;
                } else {
                    x = lineBBox.x + lineBBox.width;
                }
                break;
            case 'middle':
            case 'center':
                textAnchor = 'middle';
                if (isVertical) {
                    y = lineBBox.y + lineBBox.height / 2;
                } else {
                    x = lineBBox.x + lineBBox.width / 2;
                }
                break;
        }

        switch (orient) {
            case 'top':
                if (isOutside) {
                    title.attr('y', ticksBBox ? ticksBBox.y : 0);
                    padding = Helpers.unitMath(padding, '*', -1);
                }
                Helpers.setDominantBaseline(title.node(), isOutside ? afterEdge : beforeEdge);
                title
                    .attr('text-anchor', textAnchor)
                    .attr('x', x);
                break;
            case 'bottom':
                if (isOutside) {
                    title.attr('y', ticksBBox ? ticksBBox.y + ticksBBox.height : 0);
                } else {
                    padding = Helpers.unitMath(padding, '*', -1);
                }
                Helpers.setDominantBaseline(title.node(), isOutside ? beforeEdge : afterEdge);
                title
                    .attr('text-anchor', textAnchor)
                    .attr('x', x);
                break;
            case 'left':
                if (isOutside) {
                    x = ticksBBox ? ticksBBox.x : 0;
                    padding = Helpers.unitMath(padding, '*', -1);
                }
                Helpers.setDominantBaseline(title.node(), isOutside ? afterEdge : beforeEdge);
                title
                    .attr('text-anchor', textAnchor)
                    .attr('transform', 'translate(' + x + ',' + y + ')' + 'rotate(-90)');
                break;
            case 'right':
                if (isOutside) {
                    x = ticksBBox ? ticksBBox.x + ticksBBox.width: 0;
                } else {
                    padding = Helpers.unitMath(padding, '*', -1);
                }
                Helpers.setDominantBaseline(title.node(), isOutside ? beforeEdge : afterEdge);
                title
                    .attr('text-anchor', textAnchor)
                    .attr('transform', 'translate(' + x + ',' + y + ')' + 'rotate(-90)');
                break;
        }

        title.attr('dy', padding);
    },

    render: function (transition) {
        var me = this,
            axis = me.getAxis(),
            scale = me.getScale();

        if (!(scale.domain().length && scale.range().length)) {
            return;
        }

        if (transition) {
            transition.select('#' + me.getId()).call(axis);
        } else {
            me.group.call(axis);
        }
        me.positionTitle();
    },

    destroy: function () {
        this.mixins.detached.destroy.call(this);
    }

});