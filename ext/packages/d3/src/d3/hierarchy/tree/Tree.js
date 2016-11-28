/**
 * Abstract class for D3 components
 * with the [Tree layout](https://github.com/mbostock/d3/wiki/Tree-Layout).
 */
Ext.define('Ext.d3.hierarchy.tree.Tree', {
    extend: 'Ext.d3.hierarchy.Hierarchy',

    config: {
        treeCls: 'tree',

        /**
         * A [diagonal](https://github.com/mbostock/d3/wiki/SVG-Shapes#diagonal)
         * path data generator for tree links.
         * @cfg {Function} diagonal
         */
        diagonal: null,

        nodeTransform: null,

        /**
         * @private
         * Specifies a fixed distance between the parent and child nodes.
         * By default, the distance is `tree depth / (number of tree levels - 1)`.
         * @cfg {Number} [depth=0]
         */
        depth: 0,

        nodeRadius: 5,

        nodeTransition: true,

        nodeSelectTransition: true,

        /**
         * [Fixed size](https://github.com/mbostock/d3/wiki/Tree-Layout#nodeSize),
         * of each node as a two-element array of numbers representing x and y.
         * @cfg {Number[]} nodeSize
         */
        nodeSize: null,

        noSizeLayout: false,

        renderLinks: true
    },

    transitionDefaults: {
        node: {
            name: 'node',
            duration: 150
        },
        nodeSelect: {
            name: 'select',
            duration: 150,
            sourceScale: 1,
            targetScale: 1.5
        }
    },

    updateTreeCls: function (treeCls, oldTreeCls) {
        var baseCls = this.getBaseCls(),
            el = this.element;

        if (treeCls && Ext.isString(treeCls)) {
            el.addCls(treeCls, baseCls);
            if (oldTreeCls) {
                el.removeCls(oldTreeCls, baseCls);
            }
        }
    },

    applyNodeTransition: function (transition) {
        return this.transitionApplier(transition, 'node');
    },

    applyNodeSelectTransition: function (transition) {
        return this.transitionApplier(transition, 'nodeSelect');
    },

    applyLayout: function () {
        return d3.layout.tree();
    },

    updateNodeSize: function (nodeSize) {
        var layout = this.getLayout();

        layout.nodeSize(nodeSize);
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

    onNodeSelect: function (node, el) {
        this.callParent(arguments);
        this.nodeSelectTransitionFn(node, el);
    },

    /**
     * @private
     */
    nodeSelectTransitionFn: function (node, el) {
        var cfg = this.getNodeSelectTransition();

        if (!cfg) {
            return;
        }

        var duration = cfg.duration,
            targetScale = cfg.targetScale,
            scale = cfg.sourceScale;

        el
            .select('g')
            .transition(cfg.name)
            .duration(duration)
            .attr('transform', 'scale(' + targetScale +  ',' + targetScale + ')')
            .transition()
            .duration(duration)
            .attr('transform', 'scale(' + scale +  ',' + scale + ')');
    }

});