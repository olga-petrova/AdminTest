Ext.define('Ext.d3.legend.Color', {
    extend: 'Ext.d3.legend.Legend',

    config: {
        axis: null,

        items: {
            count: 5,
            slice: null,
            reverse: false,
            text: null,
            size: {
                x: 30,
                y: 30
            }
        }
    },

    getScale: function () {
        return this.getAxis().getScale();
    },
    
    updateAxis: function (axis, oldAxis) {
        var me = this;

        if (oldAxis) {
            oldAxis.un('scalechange', me.onScaleChange, me);
        }
        if (axis) {
            axis.on('scalechange', me.onScaleChange, me);
        }
    },

    onScaleChange: function (axis, scale) {
        this.updateItems(this.getItems());
    },

    updateItems: function (items) {
        var me = this,
            scale = me.getScale(),
            itemSelection = me.getRenderedItems(),
            ticks, updateSelection;

        if (items.count > 0) {
            ticks = scale.ticks(items.count);
            if (items.slice) {
                ticks = ticks.slice.apply(ticks, items.slice);
            }
            if (items.reverse) {
                ticks = ticks.reverse();
            }
        }

        updateSelection = itemSelection.data(ticks);

        me.onAddItems(updateSelection.enter());
        me.onUpdateItems(updateSelection);
        me.onRemoveItems(updateSelection.exit());
    },

    getRenderedItems: function () {
        return this.group.selectAll('.' + this.defaultCls.item);
    },

    onAddItems: function (selection) {
        var me = this;

        selection = selection.append('g').classed(me.defaultCls.item, true);
        selection.append('rect');
        selection.append('text');
        me.onUpdateItems(selection);
    },

    onUpdateItems: function (selection) {
        var me = this,
            items = me.getItems(),
            docked = me.getDocked(),
            scale = me.getScale(),
            blocks, labels;

        blocks = selection.select('rect')
            .attr('width', items.size.x)
            .attr('height', items.size.y)
            .style('fill', scale);

        labels = selection.select('text')
            .each(function () {
                Ext.d3.Helpers.setDominantBaseline(this, 'middle');
            })
            .attr('text-anchor', 'middle')
            .text(String);

        switch (docked) {
            case 'left':
            case 'right':
                blocks.attr('transform', function (data, index) {
                    return 'translate(0,' + index * items.size.y + ')';
                });
                labels
                    .attr('x', items.size.x + 10)
                    .attr('y', function (data, index) {
                        return (index + 0.5) * items.size.y;
                    })
                    .attr('dx', 10);
                break;
            case 'top':
            case 'bottom':
                blocks.attr('transform', function (data, index) {
                    return 'translate(' + index * items.size.x + ',0)';
                });
                labels
                    .attr('x', function (data, index) {
                        return (index + 0.5) * items.size.x;
                    })
                    .attr('y', items.size.y)
                    .attr('dy', '1em');
                break;
        }

        // scene.append('text')
        //     .attr('class', 'label')
        //     .attr('x', rect.width + 20)
        //     .attr('y', 10)
        //     .attr('dy', '.35em')
        //     .text('Count');
    },

    onRemoveItems: function (selection) {
        selection.remove();
    }

});