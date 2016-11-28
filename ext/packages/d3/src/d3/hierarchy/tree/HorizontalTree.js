Ext.define('Ext.d3.hierarchy.tree.HorizontalTree', {
    extend: 'Ext.d3.hierarchy.tree.Tree',

    xtype: [
        'd3-tree',
        'd3-horizontal-tree'
    ],

    config: {
        componentCls: 'horizontal-tree',

        diagonal: undefined,

        nodeTransform: function (selection) {
            selection.attr('transform', function (node) {
                return 'translate(' + node.y + ',' + node.x + ')';
            });
        }
    },

    applyDiagonal: function (diagonal, oldDiagonal) {
        if (!Ext.isFunction(diagonal)) {
            if (oldDiagonal) {
                diagonal = oldDiagonal;
            } else {
                // A D3 entity cannot be a default config, nor can it be on the prototype
                // of a class, because then it is accessed at Ext.define time, which is
                // likely to cause loading errors.
                diagonal = d3.svg.diagonal().projection(function (node) {
                    return [node.y, node.x];
                });
            }
        }
        return diagonal;
    },

    onSceneResize: function (scene, rect) {
        var me = this,
            layout = me.getLayout();

        if (layout.nodeSize()) {
            if (!me.size) {
                this.performLayout();
                // This is first resize, so the scene is empty prior to `performLayout` call.
                this.alignContent('left', 'center');
            }
        } else {
            // No need to set layout size and perform layout on resize, if the node size
            // is fixed, as layout.size and layout.nodeSize are mutually exclusive.
            this.callParent(arguments);
        }
    },

    setLayoutSize: function (size) {
        // For trees the first entry in the `size` array represents the tree's breadth,
        // and the second one - depth.
        var _ = size[0];
        size[0] = size[1];
        size[1] = _;

        this.callParent([size]);
    },

    addNodes: function (selection) {
        var me = this,
            group = selection.append('g'),
            colorAxis = me.getColorAxis(),
            nodeText = me.getNodeText(),
            nodeRadius = me.getNodeRadius(),
            nodeTransform = me.getNodeTransform(),
            nodeTransition = me.getNodeTransition(),
            labels;

        // If we select a node, the highlight transition kicks off in 'onNodeSelect'.
        // But this can trigger a layout change, if selected node has children and
        // starts to expand, which triggers another transition that cancels the
        // highlight transition.
        //
        // So we need two groups:
        // 1) the outer one will have a translation transition applied to it
        //    on layout change;
        // 2) and the inner one will have a scale transition applied to it on
        //    selection highlight.

        group
            .attr('class', me.defaultCls.node)
            .call(me.onNodesAdd.bind(me))
            .call(nodeTransform.bind(me));

        group
            .append('circle')
            .attr('class', 'circle')
            .style('fill', function (node) {
                return colorAxis.getColor(node);
            })
            .call(function (selection) {
                if (nodeTransition) {
                    selection
                        .attr('r', 0)
                        .transition(nodeTransition.name)
                        .duration(nodeTransition.duration)
                        .attr('r', nodeRadius);
                } else {
                    selection
                        .attr('r', nodeRadius)
                }
            });

        labels = group
            .append('text')
            .text(function (node) {
                return nodeText(me, node);
            })
            .attr('class', me.defaultCls.label)
            .each(function (node) {
                var isLeaf = node.isLeaf();

                // Note that we can't use node.children here to determine
                // whether the node has children or not, because the
                // default accessor returns node.childNodes (that are saved
                // as node.children) only when the node is expanded.
                this.setAttribute('x', isLeaf ? 10 : -10);
                this.setAttribute('text-anchor', isLeaf ? 'start' : 'end');
            })
            .call(function (selection) {
                if (nodeTransition) {
                    selection
                        .style('fill-opacity', 0)
                        .transition(nodeTransition.name)
                        .duration(nodeTransition.duration)
                        .style('fill-opacity', 1)
                } else {
                    selection
                        .style('fill-opacity', 1);
                }
            });

        if (Ext.d3.Helpers.noDominantBaseline()) {
            labels.each(function () {
                Ext.d3.Helpers.fakeDominantBaseline(this, 'central', true);
            });
        }
    },

    updateNodes: function (selection) {
        var me = this,
            nodeTransform = me.getNodeTransform(),
            nodeClass = me.getNodeClass();

        selection
            .call(nodeClass.bind(me))
            .transition()
            .call(nodeTransform.bind(me));
    },

    addLinks: function (selection) {
        selection
            .append('path')
            .classed(this.defaultCls.link, true)
            .attr('d', this.getDiagonal());
    },

    updateLinks: function (selection) {
        selection
            .transition()
            .attr('d', this.getDiagonal());
    }

});