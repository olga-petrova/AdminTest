/** */
Ext.define('Ext.d3.hierarchy.partition.Sunburst', {
    extend: 'Ext.d3.hierarchy.partition.Partition',
    xtype: 'd3-sunburst',

    config: {
        componentCls: 'sunburst',

        /**
         * The padding of a node's text inside its container.
         * @cfg {Array} textPadding
         */
        textPadding: [5, '0.35em'],

        /**
         * The radius of the dot in the center of the sunburst that represents the parent node
         * of the currently visible node hierarchy and allows to zoom one level up by clicking
         * or tapping it.
         * @cfg {Number} [zoomParentDotRadius=30]
         */
        zoomParentDotRadius: 30,

        /**
         * The transition that happens when a node is zoomed
         * (see {@link #zoomInNode} for details):
         *
         * * `true` - for default transition
         * * `false` - no transition
         * * Object - user-defined transition is merged with default
         *
         * @cfg {Object/Boolean} [nodeZoomTransition=true]
         */
        nodeZoomTransition: true,

        /**
         * The transition that happens when a node is selected:
         *
         * * `true` - for default transition
         * * `false` - no transition
         * * Object - user-defined transition is merged with default
         *
         * @cfg {Object/Boolean} [nodeSelectTransition=true]
         */
        nodeSelectTransition: true
    },

    setupScene: function (scene) {
        this.callParent([scene]);
        this.setupScales();
        this.setupArcGenerator();
    },

    scaleDefaults: {
        x: {
            domain: [0, 1],
            range: [0, 2 * Math.PI]
        },
        y: {
            domain: [0, 1]
        }
    },

    transitionDefaults: {
        nodeZoom: {
            name: 'zoom',
            duration: 1000,
            ease: 'cubic-in-out'
        },
        nodeSelect: {
            name: 'select',
            duration: 150,
            ease: 'cubic-in-out',
            sourceScale: 1,
            targetScale: 1.07
        }
    },

    applyNodeZoomTransition: function (transition) {
        return this.transitionApplier(transition, 'nodeZoom');
    },

    applyNodeSelectTransition: function (transition) {
        return this.transitionApplier(transition, 'nodeSelect');
    },

    setupScales: function () {
        var d = this.scaleDefaults;
        // Node's x & dx properties will represent the angle.
        // Node's y & dy properties will represent the area
        // divided by π (since circle area = πr²).
        this.xScale = d3.scale.linear()
            .domain(d.x.domain.slice())
            .range(d.x.range.slice());

        this.yScale = d3.scale.sqrt()
            .domain(d.y.domain.slice());
    },

    /**
     * [Arc generator](https://github.com/mbostock/d3/wiki/SVG-Shapes#arc)
     * for sunburst slices.
     * @private
     * @property {Function} arc
     */
    arc: null,

    setupArcGenerator: function () {
        var me = this,
            x = me.xScale,
            y = me.yScale;

        me.arc = d3.svg.arc()
            .startAngle(function (node) {
                return Math.max(0, Math.min(2 * Math.PI, x(node.x)));
            })
            .endAngle(function (node) {
                return Math.max(0, Math.min(2 * Math.PI, x(node.x + node.dx)));
            })
            .innerRadius(function (node) {
                return Math.max(0, y(node.y));
            })
            .outerRadius(function (node) {
                return Math.max(0, y(node.y + node.dy));
            });
    },

    arcTween: function (node, index, value) {
        var me = this,
            interpolator = d3.interpolate({
                x: node.x0,
                y: node.y0,
                dx: node.dx0,
                dy: node.dy0
            }, {
                x: node.x,
                y: node.y,
                dx: node.dx,
                dy: node.dy
            });

        return function (t) {
            var value = interpolator(t);
            return me.arc(value);
        };
    },

    /**
     * @protected
     * Override parent method to neither set the layout size,
     * nor perform layout on scene resize.
     * The default layout size of 1x1 is used at all times.
     * Only the output range of scales changes.
     */
    onSceneResize: function (scene, rect) {
        var me = this,
            nodesGroup = me.nodesGroup,
            centerX = .5 * rect.width,
            centerY = .5 * rect.height,
            radius = Math.min(centerX, centerY);

        nodesGroup.attr('transform', 'translate(' + centerX + ',' + centerY + ')');

        me.setRadius(radius);
    },

    radius: null,
    minRadius: 1,

    setRadius: function (radius) {
        var me = this;

        radius = Math.max(me.minRadius, radius);
        me.radius = radius;
        me.yScale.range([0, radius]);

        me.renderScene();
    },

    /**
     * Zooms in the `node`, so that the sunburst only shows the node itself and its children.
     * To zoom in instantly, even when the {@link #nodeZoomTransition} config is truthy,
     * set the `transition` parameter to `true`.
     * @param {Ext.data.TreeModel} node
     * @param {Boolean} [instantly]
     */
    zoomInNode: function (node, instantly) {
        var me = this,
            scene = me.getScene(),
            transitionCfg = me.getNodeZoomTransition(),
            parentRadius = me.getZoomParentDotRadius(),
            radius = me.radius,
            xScale = me.xScale,
            yScale = me.yScale,
            arc = me.arc,
            transition,
            nodes;

        if (!(me.hasFirstRender && me.size && node && node.isNode)) {
            return;
        }

        if (transitionCfg) {
            transition = scene
                .transition(transitionCfg.name)
                .duration(instantly ? 0 : transitionCfg.duration)
                .ease(transitionCfg.ease);
        } else {
            transition = scene.transition().duration(0);
        }

        nodes = transition.tween('scale', function () {
                // Default xScale and yScale domain is [0, 1].
                // Default xScale range is [0, 2π].
                // By reducing the xScale's domain to the span of selected slice,
                // we make it occupy the whole pie angle.
                // Similarly, by reducing the yScale's domain to an interval
                // past slice's radius, we make that slice and its children
                // occupy the whole pie radius.
                // By making the yScale's range start with a non-zero value,
                // we make a hole in the current subtree that now occupies
                // the whole pie. Inside that hole the parent node (that now
                // falls out of yScale's range) is going to be visible
                // and available for selection to go one level up.
                var xDomain = d3.interpolate(xScale.domain(), [node.x, node.x + node.dx]),
                    yDomain = d3.interpolate(yScale.domain(), [node.y, 1]),
                    yRange = d3.interpolate(yScale.range(), [node.y ? parentRadius : 0, radius]);

                return function (t) {
                    xScale.domain(xDomain(t));
                    yScale.domain(yDomain(t)).range(yRange(t));
                };
            })
            .selectAll('.' + me.defaultCls.node);

        nodes.selectAll('path')
            .attrTween('d', function (node) {
                return function (t) {
                    // Layout stays exactly the same, but scales
                    // change slightly on every frame.
                    return arc(node);
                };
            });

        nodes.selectAll('text')
            .call(me.positionTextFn.bind(me))
            .call(me.textVisibilityFn.bind(me));

        if (instantly) {
            me.xScale.domain([node.x, node.x + node.dx]);
            me.yScale.domain([node.y, 1]).range([node.y ? parentRadius : 0, radius]);
        }
    },

    onNodeSelect: function (node, el) {
        this.callParent(arguments);

        // Remove the fill given by the `colorAxis`, so that
        // the CSS style can be used to specify the color
        // of the selection.
        el.select('path').style('fill', null);
        // Bring selected element to front.
        el.each(function () {
            this.parentNode.appendChild(this);
        });
        this.nodeSelectTransitionFn(node, el);
    },

    /**
     * @private
     */
    nodeSelectTransitionFn: function (node, el) {
        var transitionCfg = this.getNodeSelectTransition();

        if (!transitionCfg) {
            return;
        }

        var duration = transitionCfg.duration,
            targetScale = transitionCfg.targetScale,
            sourceScale = transitionCfg.sourceScale;

        el
            .transition(transitionCfg.name)
            .duration(duration)
            .ease(transitionCfg.ease)
            .attr('transform', 'scale(' + targetScale +  ',' + targetScale + ')')
            .transition()
            .duration(duration)
            .attr('transform', 'scale(' + sourceScale +  ',' + sourceScale + ')');
    },

    onNodeDeselect: function (node, el) {
        var me = this,
            colorAxis = me.getColorAxis();

        me.callParent(arguments);

        // Restore the original color.
        // (see 'onNodeSelect' comments).
        el
            .select('path')
            .style('fill', function (node) {
                return colorAxis.getColor(node);
            });
    },

    /**
     * @private
     * Checks if a bounding box (e.g. of a text) fits inside a slice.
     * The bounding box is assumed to be centered in the middle of the slice
     * angularly, with the width of the box in the direction of the radius,
     * and left edge 'px' pixels from inner radius (r1).
     * @param {Object} bbox
     * @param {Number} bbox.width
     * @param {Number} bbox.height
     * @param {Number} a1 Start angle in the [0, 2 * Math.PI] interval.
     * @param {Number} a2 End angle in the [0, 2 * Math.PI] interval.
     * @param {Number} r1 Inner radius.
     * @param {Number} r2 Outer radius.
     * @param {Number} px X-padding.
     * @param {Number} py Y-padding.
     * @returns {Boolean}
     */
    isBBoxInSlice: function (bbox, a1, a2, r1, r2, px, py) {
        var a = Math.abs(a2 - a1),
            width = Math.abs(r2 - r1) - px * 2,
            height = a < Math.PI
                ? 2 * (r1 + px) * Math.tan(0.5 * a) - py * 2
                : 0.5 * r2, // for very big angles text is never too tall,
                            // so there must be some other limit
            isWider = bbox.width > width,
            isTaller = bbox.height > height;

        return !(isWider || isTaller);
    },

    oldVal: true,

    /**
     * @private
     */
    textVisibilityFn: function (selection) {
        var me = this,
            x = me.xScale,
            y = me.yScale,
            textPadding = me.getTextPadding(),
            px = parseFloat(textPadding[0]),
            py = parseFloat(textPadding[1]),
            isTween = selection instanceof d3.transition,
            method = isTween ? 'attrTween' : 'attr',
            visibilityFn, fillOpacityFn;

        function isHidden(el, node) {
            if (me.isDestroyed) {
                console.log('component is destroyed, shouldn\'t have executed this')
            }
            var bbox = el.getBBox(), // SVG 'text' element
                a1 = x(node.x),
                a2 = x(node.x + node.dx),
                r1 = y(node.y),
                r2 = y(node.y + node.dy),
                isBBoxInSlice = me.isBBoxInSlice(bbox, a1, a2, r1, r2, px, py),
                xDomain = x.domain(),
                yDomain = y.domain(),
                isOutOfX = xDomain[0] > node.x || xDomain[1] < (node.x + node.dx),
                isOutOfY = yDomain[0] > node.y || yDomain[1] < (node.y + node.dy);

            return !isBBoxInSlice || isOutOfX || isOutOfY;
        }

        function getVisibility(el, node) {
            return isHidden(el, node) ? 'hidden' : 'visible';
        }

        function getFillOpacity(el, node) {
            return isHidden(el, node) ? 0 : 1;
        }

        if (isTween) {
            visibilityFn = function (node) {
                var el = this;
                return function () {
                    return getVisibility(el, node);
                };
            };
            fillOpacityFn = function (node) {
                var el = this;
                return function () {
                    return getFillOpacity(el, node);
                };
            };
        } else {
            visibilityFn = function (node) {
                return getVisibility(this, node);
            };
            fillOpacityFn = function (node) {
                return getFillOpacity(this, node);
            };
        }

        // The 'text' attribute must be hidden via the 'visibility' attribute,
        // in addition to setting its 'fill-opacity' to 0, as otherwise
        // it will protrude outside from its container, and may interfere with
        // click and other events on adjacent node elements.
        selection
            [method]('visibility', visibilityFn)
            [method]('fill-opacity', fillOpacityFn);
    },

    /**
     * @private
     * @param {d3.selection} selection 'text' elements.
     */
    positionTextFn: function (selection) {
        var x = this.xScale,
            y = this.yScale,
            halfPi = Math.PI / 2,
            degree = 180 / Math.PI,
            isTween = selection instanceof d3.transition,
            method = isTween ? 'attrTween' : 'attr',
            xFn, transformFn;

        function getX(node) {
            return y(node.y);
        }
        function getTransform(node) {
            return !node.isRoot() ? ('rotate(' + (x(node.x + node.dx / 2) - halfPi) * degree + ')') : '';
        }

        if (isTween) {
            xFn = function (node) {
                return function () {
                    return getX(node);
                };
            };
            transformFn = function (node) {
                return function () {
                    return getTransform(node);
                };
            };
        } else {
            xFn = function (node) {
                return getX(node);
            };
            transformFn = function (node) {
                return getTransform(node);
            };
        }

        selection
            [method]('x', xFn)
            [method]('transform', transformFn);
    },

    /**
     * @private
     * @param selection Selection of 'g' (node) elements.
     */
    saveNodeLayout: function (selection) {
        selection.each(function (node) {
            // Remember initial layout.
            // This will be used to transition the node from old to new layout.
            node.x0 = node.x;
            node.y0 = node.y;
            node.dx0 = node.dx;
            node.dy0 = node.dy;
        });
    },

    addNodes: function (selection) {
        var me = this,
            group = selection.append('g'),
            textPadding = me.getTextPadding(),
            colorAxis = me.getColorAxis(),
            nodeText = me.getNodeText();

        group
            .attr('class', me.defaultCls.node)
            .call(me.saveNodeLayout.bind(me))
            .call(me.onNodesAdd.bind(me));

        group
            .append('path')
            .attr('d', me.arc)
            .style('fill', function (node) {
                return colorAxis.getColor(node);
            });

        group
            .append('text')
            .attr('class', me.defaultCls.label)
            .attr('dx', textPadding[0])
            .attr('dy', textPadding[1])
            .text(function (node) {
                return nodeText(me, node);
            })
            .call(me.positionTextFn.bind(me))
            .call(me.textVisibilityFn.bind(me));

    },

    updateNodes: function (selection) {
        var me = this;

        selection
            .selectAll('path')
            .attr('d', me.arc);

        selection
            .selectAll('text')
            .call(me.positionTextFn.bind(me))
            .call(me.textVisibilityFn.bind(me));
    },

    updateColorAxis: function (colorAxis) {
        var me = this;

        if (!me.isConfiguring) {
            me.getRenderedNodes()
                .select('path')
                .style('fill', function (node) {
                    return colorAxis.getColor(node);
                });
        }
    }

});
