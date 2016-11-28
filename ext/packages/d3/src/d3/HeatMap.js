Ext.define('Ext.d3.HeatMap', {
    extend: 'Ext.d3.svg.Svg',
    xtype: 'd3-heatmap',

    requires: [
        'Ext.d3.DataAxis',
        'Ext.d3.ColorAxis',
        'Ext.d3.legend.Color',
        'Ext.d3.Title',
        'Ext.d3.Helpers'
    ],

    config: {

        componentCls: 'heatmap',

        xAxis: {
            axis: {
                orient: 'bottom'
            },
            scale: {
                type: 'linear'
            }
        },

        yAxis: {
            axis: {
                orient: 'left'
            },
            scale: {
                type: 'linear'
            }
        },

        colorAxis: {},

        legend: {},

        tiles: {
            cls: '',
            attr: {
                
            }
        }

        // title: {}
    },

    data: null, // store data items
    tiles: null,
    tilesGroup: null,

    tilesRect: null,
    legendRect: null,
    titleRect: null,

    defaultCls: {
        tiles: Ext.baseCSSPrefix + 'd3-tiles',
        tile: Ext.baseCSSPrefix + 'd3-tile',
        label: Ext.baseCSSPrefix + 'd3-tile-label'
    },

    applyXAxis: function (xAxis, oldXAxis) {
        if (xAxis) {
            xAxis = new Ext.d3.DataAxis(xAxis);
            xAxis.setParent(this.getScene());
        }
        return xAxis || oldXAxis;
    },

    updateXAxis: function () {
        var me = this;

        if (!me.isConfiguring) {
            me.processData();
            me.renderScene();
        }
    },

    applyYAxis: function (yAxis, oldYAxis) {
        if (yAxis) {
            yAxis = new Ext.d3.DataAxis(yAxis);
            yAxis.setParent(this.getScene());
        }
        return yAxis || oldYAxis;
    },

    updateYAxis: function () {
        var me = this;

        if (!me.isConfiguring) {
            me.processData();
            me.renderScene();
        }
    },

    applyLegend: function (legend, oldLegend) {
        var me = this;

        if (legend) {
            legend.axis = me.getColorAxis();
            legend = new Ext.d3.legend.Color(legend);
            legend.setComponent(me);
        }
        return legend || oldLegend;
    },

    updateLegend: function (legend, oldLegend) {
        var me = this,
            events = {
                show: 'onLegendVisibility',
                hide: 'onLegendVisibility',
                scope: me
            };

        if (oldLegend) {
            oldLegend.un(events);
        }

        if (legend) {
            legend.on(events);
        }

        if (!me.isConfiguring) {
            me.performLayout();
        }
    },

    onLegendVisibility: function () {
        this.performLayout();
    },

    applyTitle: function (title, oldTitle) {
        if (title) {
            title = new Ext.d3.Title(title);
            title.setComponent(this);
        }
        return title || oldTitle;
    },

    applyColorAxis: function (colorAxis, oldColorAxis) {
        if (colorAxis) {
            colorAxis = new Ext.d3.ColorAxis(colorAxis);
        }
        return colorAxis || oldColorAxis;
    },
    
    updateColorAxis: function () {
        var me = this;

        if (!me.isConfiguring) {
            me.processData();
            me.renderScene();
        }
    },

    processData: function (store) {
        store = store || this.getStore();

        if (!store) {
            return;
        }

        var me = this,
            items = me.data = store.getData().items,

            xAxis = me.getXAxis(),
            yAxis = me.getYAxis(),
            colorAxis = me.getColorAxis(),

            xScale = xAxis.getScale(),
            yScale = yAxis.getScale(),

            xCategories, yCategories,

            xField = xAxis.getField(),
            yField = yAxis.getField(),

            xStep = xAxis.getStep(),
            yStep = yAxis.getStep(),

            xDomain, yDomain;

        // If an axis is using a time scale, the date format parser
        // should be specified in the store, e.g.:
        // fields: [
        //     {name: 'xField', type: 'date', dateFormat: 'Y-m-d'},
        //     ...
        // And Ext.Date.parse function will be used to parse date strings.
        // In pure D3, one typically creates a d3.time.format('%Y-%m-%d').parse
        // parser and calls it on every item's date string in a loop.
        // Here, date fields should already be Date objects.
        // Same goes for other field types, in pure D3 it's common to coerce
        // strings to numbers, e.g. `data.count = +data.count`.
        // Here, we assume all of this has been taken care of by the store.

        xDomain = d3.extent(items, function (item) { return item.data[xField]; });
        yDomain = d3.extent(items, function (item) { return item.data[yField]; });

        if (Ext.d3.Helpers.isOrdinalScale(xScale)) {
            // When an ordinal scale is used, it is assumed that the order
            // of data in the store is linear.
            // E.g. the store for the sales by employee by day heatmap
            // has all records listed for the first employee,
            // then all records for the second employee, and so on.
            // The days in the employee records are expected to be
            // ordered as well.
            // For example:
            // { employee: 'John', day: 1, sales: 5 },
            // { employee: 'John', day: 2, sales: 7 },
            // { employee: 'Jane', day: 1, sales: 4 },
            // { employee: 'Jane', day: 2, sales: 8 }

            xCategories = items.map(function (item) {
                return item.data[xField];
            }).filter(function (element, index, array) {
                // keep first or not equal previous
                // return !index || element != array[index - 1];
                // Quadratic time, but preserves order of items in both cases:
                // Case 1: 5 5 5 4 4 4 3 3 3
                // Case 2: 5 4 3 5 4 3 5 4 3
                // Both will result in the following sequence: 5 4 3.
                // Quadratic time should be acceptable as ordinal scales are not
                // expected to be used with large datasets.
                return array.indexOf(element) === index;
            });
            xScale.domain(xCategories);
        } else {
            // Coerce domain values to a number (they may be Date objects).

            // The assumption in HeatMap component is that the data values starts at
            // startValue and ends at endValue - step. So, for example, if one wants
            // to map hours along the xAxis, the data values would range from 0 to 23,
            // and one would set step to 1. If one wants to map every other hour. // TODO: finish comment
            xScale.domain([+xDomain[0], +xDomain[1] + xStep]);
        }

        if (Ext.d3.Helpers.isOrdinalScale(yScale)) {
            yCategories = items.map(function (item) {
                return item.data[yField];
            }).filter(function (element, index, array) {
                return array.indexOf(element) === index;
            });
            yScale.domain(yCategories);
        } else {
            yScale.domain([+yDomain[0], +yDomain[1] + yStep]);
        }

        colorAxis.setDomainFromData(items);
    },

    isDataProcessed: false,

    processDataChange: function (store) {
        var me = this;

        me.processData(store);
        me.isDataProcessed = true;

        if (!me.isConfiguring) {
            me.performLayout();
        }
    },

    onSceneResize: function (scene, rect) {
        var me = this;

        me.callParent([scene, rect]);
        if (!me.isDataProcessed) {
            me.processData();
        }
        me.performLayout(rect);
    },

    performLayout: function (rect) {
        var me = this;

        rect = rect || me.getSceneRect();

        if (!rect) {
            return;
        }

        me.showScene();

        var legend = me.getLegend(),
            legendBox = legend.getBox(),
            legendDocked = legend.getDocked(),

        // title = me.getTitle(),
        // titleBox = title.getBox(),
        // titleDocked = title.getDocked(),

            xAxis = me.getXAxis(),
            yAxis = me.getYAxis(),

            xAxisGroup = xAxis.getGroup(),
            yAxisGroup = yAxis.getGroup(),

            xD3Axis = xAxis.getAxis(),
            yD3Axis = yAxis.getAxis(),

            xScale = xAxis.getScale(),
            yScale = yAxis.getScale(),

            tilesRect, legendRect, titleRect,
            shrinkRect;

        shrinkRect = {
            x: 0,
            y: 0,
            width: rect.width,
            height: rect.height
        };

        me.titleRect = titleRect = Ext.Object.chain(shrinkRect);

        // switch (titleDocked) {
        //     case 'right':
        //         break;
        //     case 'left':
        //         break;
        //
        //     case 'bottom':
        //         titleRect.y = shrinkRect.height - titleBox.height;
        //         titleRect.height = titleBox.height;
        //         shrinkRect.height -= titleBox.height;
        //         break;
        //     case 'top':
        //         titleRect.height = titleBox.height;
        //         shrinkRect.y += titleBox.height;
        //         shrinkRect.height -= titleBox.height;
        //         break;
        // }

        me.tilesRect = tilesRect = Ext.Object.chain(shrinkRect);
        me.legendRect = legendRect = Ext.Object.chain(shrinkRect);

        switch (legendDocked) {
            case 'right':
                tilesRect.width -= legendBox.width;
                legendRect.width = legendBox.width;

                legendRect.x = rect.width - legendBox.width;
                break;
            case 'left':
                tilesRect.width -= legendBox.width;
                legendRect.width = legendBox.width;

                tilesRect.x += legendBox.width;
                break;

            case 'bottom':
                tilesRect.height -= legendBox.height;
                legendRect.height = legendBox.height;

                legendRect.y = rect.height - legendBox.height;
                break;
            case 'top':
                tilesRect.height -= legendBox.height;
                legendRect.height = legendBox.height;

                tilesRect.y += legendBox.height;
                break;
        }

        if (Ext.d3.Helpers.isOrdinalScale(xScale)) {
            xScale.rangeBands([tilesRect.x, tilesRect.x + tilesRect.width]);
        } else {
            xScale.range([tilesRect.x, tilesRect.x + tilesRect.width]);
        }

        if (Ext.d3.Helpers.isOrdinalScale(yScale)) {
            yScale.rangeBands([tilesRect.y + tilesRect.height, tilesRect.y]);
        } else {
            yScale.range([tilesRect.y + tilesRect.height, tilesRect.y]);
        }

        // xScale.range([tilesRect.x, tilesRect.x + tilesRect.width]);
        // yScale.range([tilesRect.y + tilesRect.height, tilesRect.y]);

        xAxisGroup.attr('transform', 'translate(0,' + (xD3Axis.orient() === 'top' ? tilesRect.y : (tilesRect.y + tilesRect.height)) + ')');
        yAxisGroup.attr('transform', 'translate(' + (yD3Axis.orient() === 'left' ? tilesRect.x : (tilesRect.x + tilesRect.width)) + ',0)');

        Ext.d3.Helpers.alignRect('center', 'center', legendBox, legendRect, legend.getGroup());

        me.renderScene();
    },

    setupScene: function (scene) {
        var me = this;

        me.callParent([scene]);
        me.tilesGroup = scene.append('g').classed(me.defaultCls.tiles, true);
        // To avoid seeing heatmap components immidiately,
        // the scene is hidden until the first layout.
        me.hideScene();
    },

    getRenderedTiles: function () {
        return this.tilesGroup.selectAll('.' + this.defaultCls.tile);
    },

    renderScene: function (data) {
        var me = this,

            xAxis = me.getXAxis(),
            yAxis = me.getYAxis(),

            tiles;

        data = data || me.data || me.getStore().getData().items;

        tiles = me.getRenderedTiles().data(data);

        me.onAddTiles(tiles.enter());
        me.onUpdateTiles(tiles);
        me.onRemoveTiles(tiles.exit());

        xAxis.render();
        yAxis.render();
    },

    onAddTiles: function (selection) {
        var me = this,
            tiles = me.getTiles(),
            groups, rects, labels;

        if (selection.empty()) {
            return;
        }

        groups = selection.append('g').classed(me.defaultCls.tile, true);
        rects = groups.append('rect');

        if (tiles) {
            rects.attr(tiles.attr);
            groups.classed(tiles.cls, !!tiles.cls);
            if (tiles.labels) {
                labels = groups.append('text');
                labels.classed(tiles.labels.cls, !!tiles.labels.cls);

                if (Ext.d3.Helpers.noDominantBaseline()) {
                    labels.each(function () {
                        Ext.d3.Helpers.fakeDominantBaseline(this, 'central', true);
                    });
                }
            }
        }
    },

    onUpdateTiles: function (selection) {
        var me = this,
            xAxis = me.getXAxis(),
            yAxis = me.getYAxis(),
            colorAxis = me.getColorAxis(),

            xScale = xAxis.getScale(),
            yScale = yAxis.getScale(),
            colorScale = colorAxis.getScale(),

            isOrdinalX = Ext.d3.Helpers.isOrdinalScale(xScale),
            isOrdinalY = Ext.d3.Helpers.isOrdinalScale(yScale),

            xBand = isOrdinalX ? xScale.rangeBand() : 0,
            yBand = isOrdinalY ? yScale.rangeBand() : 0,

            xField = xAxis.getField(),
            yField = yAxis.getField(),
            colorField = colorAxis.getField(),

            xStep = xAxis.getStep(),
            yStep = yAxis.getStep();

        selection.select('rect')
            .attr('x', function (item) {
                return xScale(item.data[xField]);
            })
            .attr('y', function (item) {
                var value = item.data[yField];
                if (!isOrdinalY) {
                    value += yStep;
                }
                return yScale(value);
            })
            .attr('width', xBand || xScale(xStep) - xScale(0))
            .attr('height',  yBand || yScale(0) - yScale(yStep))
            .style('fill', function (item) {
                return colorScale(item.data[colorField]);
            });

        selection.select('text')
            .attr('x', function (item) {
                var value = item.data[xField];
                if (!isOrdinalX) {
                    // `value` may be a Date object, so coerce it to number
                    value = +value + xStep / 2;
                }
                value = xScale(value);
                if (isOrdinalX) {
                    value += xBand / 2;
                }
                return value;
            })
            .attr('y', function (item) {
                var value = item.data[yField];
                if (!isOrdinalY) {
                    value = +value + yStep / 2;
                }
                value = yScale(value);
                if (isOrdinalY) {
                    value += yBand / 2;
                }
                return value;
            })
            .text(function (item) {
                return item.data[colorField];
            });
    },

    onRemoveTiles: function (selection) {
        selection.remove();
    },

    destroy: function () {
        var me = this,
            xAxis = me.getXAxis(),
            yAxis = me.getYAxis(),
            colorAxis = me.getColorAxis(),
            legend = me.getLegend();

        xAxis.destroy();
        yAxis.destroy();
        colorAxis.destroy();
        legend.destroy();

        me.callParent();
    }

});