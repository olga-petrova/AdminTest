describe('Ext.d3.svg.Svg', function () {

    if (Ext.isIE8 || Ext.isIE9 || Ext.isIE10) {
        return;
    }

    function createSvg(config) {
        return new Ext.d3.svg.Svg(Ext.apply({
            renderTo: document.body,
            width: 200,
            height: 200
        }, config));
    }

    describe('resizeHandler', function () {
        it('should set proper size of the SVG element', function () {
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
                var svg = component.getSvg();
                var size = component.getSize();
                expect(parseInt(svg.attr('width'), 10)).toBe(size.width);
                expect(parseInt(svg.attr('height'), 10)).toBe(size.height);
                Ext.destroy(component);
            });
        });
    });

    describe('resizeScene', function () {
        it('should translate the scener wrapper by the amount of left/top padding', function () {
            // setting width/height of the wrapper has no practical effect
            // that's what the clipRect is for
            var component, haveSceneSize;

            runs(function () {
                component = createSvg({
                    padding: {
                        left: 100,
                        top: 50
                    },
                    listeners: {
                        sceneresize: function () {
                            // incidentally check that resizeScene method fires 'sceneresize'
                            haveSceneSize = true;
                        }
                    }
                });
            });
            waitsFor(function () {
                return haveSceneSize;
            });
            runs(function () {
                var wrapper = component.getWrapper();
                var p = component.getPadding();
                var translate = d3.transform(wrapper.attr('transform')).translate;

                expect(translate[0]).toBe(p.left);
                expect(translate[1]).toBe(p.top);

                Ext.destroy(component);
            });
        });
        it('should set proper size of the clip rect', function () {
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
                var clipRect = component.getWrapperClipRect();
                var size = component.getSize();
                var p = component.getPadding();
                expect(parseInt(clipRect.attr('width'), 10)).toBe(size.width - p.left - p.right);
                expect(parseInt(clipRect.attr('height'), 10)).toBe(size.height - p.top - p.bottom);
                Ext.destroy(component);
            });
        });
    });

});