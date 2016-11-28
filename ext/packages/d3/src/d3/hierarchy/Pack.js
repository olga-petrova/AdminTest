/**
 * The Pack component uses D3's
 * [Pack Layout](https://github.com/mbostock/d3/wiki/Pack-Layout)
 * to visualize hierarchical data as a enclosure diagram.
 * The size of each leaf node’s circle reveals a quantitative dimension
 * of each data point. The enclosing circles show the approximate cumulative size
 * of each subtree.
 *
 * The pack layout populates the following attributes on each node:
 * - `parent` - the parent node, or null for the root.
 * - `children` - the array of child nodes, or null for leaf nodes.
 * - `value` - the node value, as returned by the value accessor.
 * - `depth` - the depth of the node, starting at 0 for the root.
 * - `x` - the computed x-coordinate of the node position.
 * - `y` - the computed y-coordinate of the node position.
 * - `r` - the computed node radius.
 */
Ext.define('Ext.d3.hierarchy.Pack', {
    extend: 'Ext.d3.hierarchy.Hierarchy',
    xtype: 'd3-pack',

    config: {
        componentCls: 'pack',

        /**
         * The padding of a node's text inside its container.
         * @cfg {Array} textPadding
         */
        textPadding: [3, 3],

        /**
         * By default, the area occupied by the node depends on the number
         * of children the node has, but cannot be zero, so that leaf
         * nodes are still visible.
         */
        nodeValue: function (node) {
            return node.childNodes.length + 1;
        }
    },

    applyLayout: function () {
        return d3.layout.pack();
    },

    onNodeSelect: function (node, el) {
        this.callParent(arguments);

        // Remove the fill given by the `colorAxis`, so that
        // the CSS style can be used to specify the color
        // of the selection.
        el.select('circle').style('fill', null);
    },

    onNodeDeselect: function (node, el) {
        var me = this,
            colorAxis = me.getColorAxis();

        me.callParent(arguments);

        // Restore the original color.
        // (see 'onNodeSelect' comments).
        el
            .select('circle')
            .style('fill', function (node) {
                return colorAxis.getColor(node);
            });
    },

    updateColorAxis: function (colorAxis) {
        var me = this;

        if (!me.isConfiguring) {
            me.getRenderedNodes()
                .select('circle')
                .style('fill', function (node) {
                    return colorAxis.getColor(node);
                });
        }
    },

    /**
     * @private
     */
    textVisibilityFn: function (selection) {
        // Text padding value is treated as pixels, even if it isn't.
        var textPadding = this.getTextPadding(),
            dx = parseFloat(textPadding[0]) * 2,
            dy = parseFloat(textPadding[1]) * 2;

        selection
            .attr('visibility', function (node) {
                // The 'text' attribute must be hidden via the 'visibility' attribute,
                // in addition to setting its 'fill-opacity' to 0, as otherwise
                // it will protrude outside from its 'circle', and may interfere with
                // click and other events on adjacent node elements.
                var bbox = this.getBBox(), // 'this' is SVG 'text' element
                    width = node.r - dx,
                    height = node.r - dy;

                return (bbox.width > width || bbox.height > height) ? 'hidden' : 'visible';
            })
            .attr('fill-opacity', function (node) {
                var bbox = this.getBBox(),
                    width = node.r - dx,
                    height = node.r - dy;

                return (bbox.width > width || bbox.height > height) ? 0 : 1;
            });
    },

    addNodes: function (selection) {
        var me = this,
            group = selection.append('g'),
            colorAxis = me.getColorAxis(),
            nodeText = me.getNodeText(),
            nodeTransform = me.getNodeTransform(),
            labels;

        group
            .attr('class', me.defaultCls.node)
            .call(me.onNodesAdd.bind(me))
            .call(nodeTransform.bind(me));

        group
            .append('circle')
            .attr('r', function (node) {
                return node.r;
            })
            .style('fill', function (node) {
                return colorAxis.getColor(node);
            });

        labels = group
            .append('text')
            .attr('class', me.defaultCls.label)
            .text(function (node) {
                return nodeText(me, node);
            })
            .call(me.textVisibilityFn.bind(me));

        if (Ext.d3.Helpers.noDominantBaseline()) {
            labels.each(function () {
                Ext.d3.Helpers.fakeDominantBaseline(this, 'central', true);
            });
        }
    },

    updateNodes: function (selection) {
        var me = this,
            nodeClass = me.getNodeClass(),
            nodeTransform = me.getNodeTransform();

        selection
            .call(nodeClass.bind(me))
            .transition()
            .call(nodeTransform.bind(me));

        selection
            .select('circle')
            .transition()
            .attr('r', function (node) {
                return node.r;
            });

        selection
            .selectAll('text')
            .transition()
            .call(me.textVisibilityFn.bind(me));

    }

});
