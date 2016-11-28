/** */
Ext.define('Ext.d3.hierarchy.TreeMap', {
    extend: 'Ext.d3.hierarchy.Hierarchy',
    xtype: 'd3-treemap',

    config: {
        componentCls: 'treemap',

        /**
         * @param {Boolean} [sticky=false]
         * Whether the 'treemap' layout is sticky or not.
         * Once set, cannot be changed. // TODO: recreate layout?
         * The expectation with treemap.sticky is that you use the same
         * root node as input to the layout but you change the value
         * function to alter how the child nodes are sized.
         * The reason for this constraint is that with a sticky layout,
         * the topology of the tree can't change — you must have the same
         * number of nodes in the same hierarchy. The only thing that
         * changes is the value.
         * [More info.](https://github.com/mbostock/d3/wiki/Treemap-Layout#sticky)
         */
        sticky: false,

        sorter: function () {
            // Have to do this for TreeMap because of the following issue:
            // https://sencha.jira.com/browse/EXTJS-21069
            return 0;
        },

        /**
         * @param {Object} parentTile Parent tile options.
         *
         * @param {Number} [parentTile.padding=4]
         * Determines the amount of extra space to reserve between
         * the parent and its children (uniform on all sides).
         * This setting affects the layout of the treemap.
         *
         * @param {Object} parentTile.label Parent tile label options.
         *
         * @param {Number} [parentTile.label.offset=[5, 2]]
         * The offset of the label from the top-left corner of the tile's rect.
         *
         * @param {Number[]} parentTile.label.clipSize
         * If the size of a parent node is smaller than this size, its label will be hidden.
         */
        parentTile: {
            padding: 4,
            label: {
                offset: [5, 2],
                clipSize: [110, 40]
            }
        },

        /**
         * @param {Object} leafTile Leaf tile options.
         *
         * @param {Number} [leafTile.padding=4]
         * The amount by which the node's computed width and height
         * will be rendered smaller to make space between nodes.
         * This setting affects the presentation rather than layout.
         *
         * @param {Object} leafTile.label Child tile label options.
         *
         * @param {Number} [parentTile.label.offset=[5, 1]]
         * The offset of the label from the top-left corner of the tile's rect.
         *
         */
        leafTile: {
            padding: 0
        },

        colorAxis: {
            scale: {
                type: 'category20c'
            },

            field: 'name',

            processor: function (axis, scale, node, field) {
                return node.isLeaf() ? 'none' : scale(node.data[field]);
            }
        },

        nodeTransform: function (selection) {
            // Because leaf tile padding simply subtracts that amount from leaf
            // nodes' width and height after the layout is done, all nodes have
            // to be translated by half the padding value to remain centered
            // in their parent.
            var leafTile = this.getLeafTile(),
                delta = leafTile.padding / 2;

            selection.attr('transform', function (node) {
                return 'translate(' + (node.x + delta) + ',' + (node.y + delta) + ')';
            });
        }

    },

    applyLayout: function () {
        var me = this,
            sticky = me.getSticky(),
            layout = d3.layout.treemap()
                .round(false)
                .sticky(sticky);

        return layout;
    },

    setLayoutSize: function (size) {
        this.callParent([size]);
    },

    /**
     * @private
     * A map of the {nodeId: Boolean} format,
     * where the Boolean value controls visibility of the label.
     */
    hiddenParentLabels: null,

    /**
     * @private
     * A map of the {nodeId: SVGRect} format,
     * where the SVGRect value is the bounding box of the label.
     */
    labelSizes: null,

    /**
     * SVGGraphicsElement.getBBox method measures elements regardless of visibility,
     * so in case of TreeMap, where we hide text that doesn't fit inside its rect,
     * that text is still measured. It could be sticking out of the visible content's
     * bounding box and make it appear as if the PanZoom interaction is behaving
     * incorrectly. So we override the superclass method to measure content in another
     * way.
     */
    getContentRect: function () {
        var sceneRect = this.getSceneRect(),
            contentRect = this.contentRect || (this.contentRect = {x: 0, y: 0});

        // The (x, y) in `contentRect` should be untranslated content position relative
        // to the scene's origin, which is expected to always be (0, 0) for TreeMap.
        // But the (x, y) in `sceneRect` are relative to component's origin:
        // (padding.left, padding.top).

        if (sceneRect) {
            contentRect.width = sceneRect.width;
            contentRect.height = sceneRect.height;
        }

        return sceneRect && contentRect;
    },


    onNodeSelect: function (node, el) {
        this.callParent(arguments);

        // Remove the fill given by the `colorAxis`, so that
        // the CSS style can be used to specify the color
        // of the selection.
        el.select('rect').style('fill', null);
    },

    onNodeDeselect: function (node, el) {
        var me = this,
            colorAxis = me.getColorAxis();

        me.callParent(arguments);

        // Restore the original color.
        // (see 'onNodeSelect' comments).
        el
            .select('rect')
            .style('fill', function (node) {
                return colorAxis.getColor(node);
            });
    },

    renderNodes: function (nodeElements) {
        var me = this,
            layout = me.getLayout(),
            store = me.getStore(),
            root = store && store.getRoot(),
            parentTile = me.getParentTile(),
            gap = parentTile.padding,
            parentLabel = parentTile.label,
            nodeTransform = me.getNodeTransform(),
            hiddenParentLabels = me.hiddenParentLabels = {},
            labelSizes = me.labelSizes = {};

        // To show parent node's label, we need to make space for it during layout by adding
        // extra top padding to the node. But during the layout, the size of the label
        // is not known. We can determine label visibility based on the size of the node,
        // but that alone is not enough, as long nodes can have even longer labels.
        // Clipping labels instead of hiding them is not possible, because overflow is not
        // supported in SVG 1.1, and lack of proper nested SVGs support in IE prevents us
        // from clipping via wrapping labels with 'svg' elements.

        // So knowing the size of the label is crucial.
        // Measuring can only be done after a node is rendered, so we do it this way:

        // 1) first layout pass with no padding
        // 2) render nodes
        // 3) measure labels
        // 4) second layout pass with padding
        // 5) adjust postion and size of nodes, and label visibility

        me.callParent([nodeElements]);

        layout.padding(function (node) {
            // This will be called for parent nodes only.
            // Leaf node label visibility is determined in `textVisibilityFn`.
            var padding = [gap, gap, gap, gap],
                size = labelSizes[node.id],
                clipSize = parentLabel.clipSize;

            padding[0] = parentLabel.offset[1] * 2;
            if (size.width < (node.dx - gap * 2) && size.height < (node.dy - gap * 2)
                && node.dx > clipSize[0] && node.dy > clipSize[1]) {
                padding[0] += size.height;
                hiddenParentLabels[node.id] = false;
            } else {
                hiddenParentLabels[node.id] = true;
            }

            return padding;
        });
        me.nodes = layout(root);
        layout.padding(null);

        nodeElements = nodeElements.data(me.nodes, me.getNodeKey());
        // 'enter' and 'exit' selections are empty at this point.

        nodeElements
            .transition()
            .call(nodeTransform.bind(me));

        nodeElements
            .select('rect')
            .call(me.nodeSizeFn.bind(me));

        nodeElements
            .select('text')
            .call(me.textVisibilityFn.bind(me))
            .each(function (node) {
                if (node.isLeaf()) {
                    this.setAttribute('x', node.dx / 2);
                    this.setAttribute('y', node.dy / 2);
                } else {
                    this.setAttribute('x', parentLabel.offset[0]);
                    this.setAttribute('y', parentLabel.offset[1]);
                }
            });
    },

    addNodes: function (selection) {
        var me = this,
            group = selection.append('g'),
            labelSizes = me.labelSizes,
            colorAxis = me.getColorAxis(),
            nodeText = me.getNodeText(),
            cls = me.defaultCls;

        group
            .attr('class', cls.node)
            .call(me.onNodesAdd.bind(me));

        group
            .append('rect')
            .style('fill', function (node) {
                return colorAxis.getColor(node);
            });

        group
            .append('text')
            // .style('font-size', function (node) {
            //    // this will cause a much slower rendering while scaling (e.g. zooming in/out with PanZoom)
            //     return (node.isLeaf() ? Math.max(Math.min(node.dx / 4, node.dy / 2, 30), 8) : 12) + 'px';
            // })
            .each(function (node) {
                var text = nodeText(me, node);

                this.textContent = text == null ? '' : text;
                this.setAttribute('class', cls.label);
                Ext.d3.Helpers.fakeDominantBaseline(this, node.isLeaf() ? 'central' : 'text-before-edge');
                labelSizes[node.id] = this.getBBox();
            });
    },

    updateNodes: function (selection) {
        var me = this,
            nodeText = me.getNodeText(),
            nodeClass = me.getNodeClass(),
            labelSizes = me.labelSizes;

        selection = selection
            .call(nodeClass.bind(me));

        selection
            .select('rect')
            .call(me.nodeSizeFn.bind(me));

        selection
            .select('text')
            .each(function (node) {
                var text = nodeText(me, node);

                this.textContent = text == null ? '' : text;
                labelSizes[node.id] = this.getBBox();
            });
    },

    /**
     * @private
     */
    nodeSizeFn: function (selection) {
        var leafTile = this.getLeafTile(),
            padding = leafTile.padding;

        selection
            .attr('width', function (node) {
                return Math.max(0, node.dx - padding);
            })
            .attr('height', function (node) {
                return Math.max(0, node.dy - padding);
            });
    },

    isLabelVisible: function (element, node) {
        var me = this,
            bbox = element.getBBox(),
            width = node.dx,
            height = node.dy,
            isLeaf = node.isLeaf(),
            parentTile = me.getParentTile(),
            hiddenParentLabels = me.hiddenParentLabels,
            parentLabelOffset = parentTile.label.offset,
            result;

        if (isLeaf) {
            // At least one pixel gap between the 'text' and 'rect' edges.
            width -= 2;
            height -= 2;
        } else {
            width -= parentLabelOffset[0] * 2;
            height -= parentLabelOffset[1] * 2;
        }

        if (isLeaf || !node.isExpanded()) {
            result = bbox.width < width && bbox.height < height;
        } else {
            result = !hiddenParentLabels[node.id];
        }

        return result;
    },

    /**
     * @private
     */
    textVisibilityFn: function (selection) {
        var me = this;

        selection.each(function (node) {
            var isVisible = me.isLabelVisible(this, node);

            this.setAttribute('visibility', isVisible ? 'visible' : 'hidden');
            this.setAttribute('fill-opacity', isVisible ? 1 : 0);
        });
    },

    destroy: function () {
        var me = this,
            colorAxis = me.getColorAxis();

        colorAxis.destroy();

        me.callParent();
    }

});
