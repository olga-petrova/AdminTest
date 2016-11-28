describe('Ext.d3.Axis', function () {

    if (Ext.isIE8 || Ext.isIE9 || Ext.isIE10) {
        return;
    }

    function createSvg(config) {
        return new Ext.d3.svg.Svg(Ext.apply({
            renderTo: document.body,
            width: 500,
            height: 500
        }, config));
    }

    describe('axis', function () {
        it('should create a new d3.svg.axis, if one does not exist', function () {
            var component, haveSceneSize;

            runs(function () {
                component = createSvg({
                    listeners: {
                        sceneresize: function () {
                            haveSceneSize = true;
                        }
                    }
                });
            });
            waitsFor(function () {
                return haveSceneSize;
            });
            runs(function () {
                var scene = component.getScene();
                var rect = component.getSceneRect();
                var axis = new Ext.d3.Axis({
                    axis: {
                        ticks: 20,
                        orient: 'top'
                    },
                    parent: scene
                });

                var d3SvgAxis = axis.getAxis();
                var ticks = d3SvgAxis.ticks();
                var orient = d3SvgAxis.orient();

                expect(ticks[0]).toBe(20);
                expect(orient).toBe('top');

                Ext.destroy(component);
            });
        });
        it('should reconfigure existing d3.svg.axis', function () {
            var component, haveSceneSize;

            runs(function () {
                component = createSvg({
                    listeners: {
                        sceneresize: function () {
                            haveSceneSize = true;
                        }
                    }
                });
            });
            waitsFor(function () {
                return haveSceneSize;
            });
            runs(function () {
                var scene = component.getScene();
                var axis = new Ext.d3.Axis({
                    axis: {
                        ticks: 20,
                        orient: 'top'
                    },
                    parent: scene
                });
                var d3SvgAxis = axis.getAxis();

                axis.setAxis({
                    ticks: 40,
                    orient: 'bottom'
                });

                var d3SvgAxis2 = axis.getAxis();
                var ticks = d3SvgAxis2.ticks();
                var orient = d3SvgAxis2.orient();

                expect(d3SvgAxis).toEqual(d3SvgAxis2);
                expect(ticks[0]).toBe(40);
                expect(orient).toBe('bottom');

                Ext.destroy(component);
            });
        });
        it('should use provided d3.svg.axis', function () {
            var component, haveSceneSize;

            runs(function () {
                component = createSvg({
                    listeners: {
                        sceneresize: function () {
                            haveSceneSize = true;
                        }
                    }
                });
            });
            waitsFor(function () {
                return haveSceneSize;
            });
            runs(function () {
                var scene = component.getScene();
                var d3SvgAxis = d3.svg.axis().ticks(20).orient('top');
                var axis = new Ext.d3.Axis({
                    axis: d3SvgAxis,
                    parent: scene
                });
                var d3SvgAxis2 = axis.getAxis();
                var ticks = d3SvgAxis2.ticks();
                var orient = d3SvgAxis2.orient();

                expect(d3SvgAxis).toEqual(d3SvgAxis2);
                expect(ticks[0]).toBe(20);
                expect(orient).toBe('top');

                Ext.destroy(component);
            });
        });

    });

});
