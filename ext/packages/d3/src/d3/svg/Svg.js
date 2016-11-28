/**
 * The base class of every SVG D3 Component that can also be used standalone.
 * For example:
 *
 *     @example
 *     Ext.create({
 *         renderTo: document.body,
 *
 *         width: 300,
 *         height: 300,
 *
 *         xtype: 'd3',
 *
 *         listeners: {
 *             scenesetup: function (component, scene) {
 *                 var data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
 *                     colors = d3.scale.category20(),
 *                     twoPi = 2 * Math.PI,
 *                     gap = twoPi / data.length,
 *                     r = 100;
 *
 *                 scene.append('g')
 *                     .attr('transform', 'translate(150,150)')
 *                     .selectAll('circle')
 *                     .data(data)
 *                     .enter()
 *                     .append('circle')
 *                     .attr('fill', function (d) {
 *                         return colors(d);
 *                     })
 *                     .attr('stroke', 'black')
 *                     .attr('stroke-width', 3)
 *                     .attr('r', function (d) {
 *                         return d * 3;
 *                     })
 *                     .attr('cx', function (d, i) {
 *                         return r * Math.cos(gap * i);
 *                     })
 *                     .attr('cy', function (d, i) {
 *                         return r * Math.sin(gap * i);
 *                     });
 *             }
 *         }
 *     });
 *
 */
Ext.define('Ext.d3.svg.Svg', {
    extend: 'Ext.d3.Component',
    xtype: ['d3-svg', 'd3'],

    isSvg: true,

    config: {
        /**
         * The padding of the scene.
         * See {@link Ext.util.Format#parseBox} for syntax details,
         * if using a string for this config.
         * @cfg {Object/String/Number} [padding=0]
         * @cfg {Number} padding.top
         * @cfg {Number} padding.right
         * @cfg {Number} padding.bottom
         * @cfg {Number} padding.left
         */
        padding: {
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
        },

        /**
         * If the scene elements that go outside the scene and into the padding area
         * should be clipped.
         * Note: stock D3 components are not designed to work with this config set to `true`.
         * @cfg {Boolean} [clipScene=false]
         */
        clipScene: false
    },

    defaultCls: {
        wrapper: Ext.baseCSSPrefix + 'd3-wrapper',
        scene: Ext.baseCSSPrefix + 'd3-scene'
    },

    /**
     * @private
     * See {@link #getDefs}.
     */
    defs: null,
    /**
     * @private
     * The padding and clipping is applied to the scene's wrapper element,
     * not to the scene itself. See {@link #getWrapper}.
     */
    wrapper: null,
    wrapperClipRect: null,
    wrapperClipId: 'wrapper-clip',

    /**
     * @private
     * See {@link #getScene}.
     */
    scene: null,
    sceneRect: null, // object with scene's position and dimensions: x, y, width, height

    /**
     * @private
     * See {@link #getSvg}.
     */
    svg: null,

    onClassExtended: function (subClass, data) {
        Ext.apply(data.defaultCls, subClass.superclass.defaultCls);
    },

    applyPadding: function (padding, oldPadding) {
        var result;

        if (!Ext.isObject(padding)) {
            result =  Ext.util.Format.parseBox(padding);
        } else if (!oldPadding) {
            result = padding;
        } else {
            result = Ext.apply(oldPadding, padding);
        }

        return result;
    },

    getSvg: function () {
        // Spec: https://www.w3.org/TR/SVG/struct.html
        // Note: foreignObject is not supported in IE11 and below (can't use HTML elements inside SVG).
        return this.svg || (this.svg = d3.select(this.element.dom).append('svg').attr('version', '1.1'));
    },

    /**
     * @private
     * Calculates and sets scene size and position based on the given `size` object
     * and the {@link #padding} config.
     * @param {Object} size
     * @param {Number} size.width
     * @param {Number} size.height
     */
    resizeHandler: function (size) {
        var me = this,
            svg = me.getSvg(),
            paddingCfg = me.getPadding(),
            wrapper = me.getWrapper(),
            wrapperClipRect = me.getWrapperClipRect(),
            scene = me.getScene(),
            width = size && size.width,
            height = size && size.height,
            rect;

        if (!(width && height)) {
            return;
        }

        svg
            .attr('width', width)
            .attr('height', height);

        rect = me.sceneRect || (me.sceneRect = {});
        rect.x = paddingCfg.left;
        rect.y = paddingCfg.top;
        rect.width = width - paddingCfg.left - paddingCfg.right;
        rect.height = height - paddingCfg.top - paddingCfg.bottom;

        wrapper
            .attr('transform', 'translate(' + rect.x + ',' + rect.y + ')');

        wrapperClipRect
            .attr('width', rect.width)
            .attr('height', rect.height);

        me.onSceneResize(scene, rect);
        me.fireEvent('sceneresize', me, scene, rect);
    },

    updatePadding: function () {
        var me = this;

        if (!me.isConfiguring) {
            me.resizeHandler(me.getSize());
        }
    },

    /**
     * @event sceneresize
     * Fires after scene size has changed.
     * Notes: the scene is a 'g' element, so it cannot actually have a size.
     * The size reported is the size the drawing is supposed to fit in.
     * @param {Ext.d3.svg.Svg} component
     * @param {d3.selection} scene
     * @param {Object} size An object with `width` and `height` properties.
     */

    getSceneRect: function () {
        return this.sceneRect;
    },

    getContentRect: function () {
        // Note that `getBBox` will also measure invisible elements in the scene.
        return this.scene && this.scene.node().getBBox();
    },

    getViewportRect: function () {
        return this.sceneRect;
    },

    alignContent: function (x, y) {
        // This method doesn't account for content scaling.
        var me = this,
            sceneRect = me.getSceneRect(),
            contentRect = me.getContentRect(),
            tx, ty, translation;

        if (sceneRect && contentRect) {
            switch (x) {
                case 'center':
                    tx = sceneRect.width / 2 - (contentRect.x + contentRect.width / 2);
                    break;
                case 'left':
                    tx = -contentRect.x;
                    break;
                case 'right':
                    tx = sceneRect.width - (contentRect.x + contentRect.width);
                    break;
                default:
                    Ext.raise('Invalid value. Valid `x` values are: center, left, right.');
            }
            switch (y) {
                case 'center':
                    ty = sceneRect.height / 2 - (contentRect.y + contentRect.height / 2);
                    break;
                case 'top':
                    ty = -contentRect.y;
                    break;
                case 'bottom':
                    ty = sceneRect.height - (contentRect.y + contentRect.height);
                    break;
                default:
                    Ext.raise('Invalid value. Valid `y` values are: center, top, bottom.');
            }
        }

        if (Ext.isNumber(tx) && Ext.isNumber(ty)) {
            translation = [tx, ty];
            me.scene.attr('transform', 'translate(' + translation + ')');
            me.panZoom && me.panZoom.setPanZoomSilently(translation);
        }
    },

    /**
     * @protected
     * This method is called after the scene gets its position and size.
     * It's a good place to recalculate layout(s) and re-render the scene.
     * @param {d3.selection} scene
     * @param {Object} rect
     * @param {Number} rect.x
     * @param {Number} rect.y
     * @param {Number} rect.width
     * @param {Number} rect.height
     */
    onSceneResize: Ext.emptyFn,

    /**
     * Whether or not the component got its first size.
     * Can be used in the `sceneresize` event handler to do user-defined setup on first
     * resize, for example:
     *
     *     listeners: {
     *         sceneresize: function (component, scene, rect) {
     *             if (!component.size) {
     *                 // set things up
     *             } else {
     *                 // handle resize
     *             }
     *         }
     *     }
     *
     * @cfg {Object} size
     * @accessor
     */

    /**
     * Get the scene element as a D3 selection.
     * If the scene doesn't exist, it will be created.
     * @return {d3.selection}
     */
    getScene: function () {
        var me = this,
            padding = me.getWrapper(),
            scene = me.scene;

        if (!scene) {
            me.scene = scene = padding.append('g').classed(me.defaultCls.scene, true);

            me.setupScene(scene);
            me.fireEvent('scenesetup', me, scene);
        }

        return scene;
    },

    showScene: function () {
        this.scene && this.scene.attr('display', 'inline');
    },

    hideScene: function () {
        this.scene && this.scene.attr('display', 'none');
    },

    /**
     * @protected
     * Called once when the scene (main group) is created.
     * @param {d3.selection} scene The scene as a D3 selection.
     */
    setupScene: Ext.emptyFn,

    onPanZoom: function (interaction, scaling, translation) {
        // The order of transformations matters here.
        this.scene.attr('transform',
            'translate(' + translation + ')scale(' + scaling + ')');
    },

    /**
     * @event scenesetup
     * Fires once after the scene has been created.
     * Note that at this time the component doesn't have a size yet.
     * @param {Ext.d3.svg.Svg} component
     * @param {d3.selection} scene
     */

    getWrapper: function () {
        var me = this,
            padding = me.wrapper;

        if (!padding) {
            padding = me.wrapper = me.getSvg().append('g').classed(me.defaultCls.wrapper, true);
        }

        return padding;
    },

    getWrapperClipRect: function () {
        var me = this,
            rect = me.wrapperClipRect;

        if (!rect) {
            rect = me.wrapperClipRect = me.getDefs()
                .append('clipPath').attr('id', me.wrapperClipId)
                .append('rect').attr('fill', 'white');
        }

        return rect;
    },

    updateClipScene: function (clipScene) {
        this.getWrapper().attr('clip-path', clipScene ? 'url(#' + this.wrapperClipId + ')' : '');
    },

    /**
     * SVG ['defs'](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/defs) element
     * as a D3 selection.
     * @return {d3.selection}
     */
    getDefs: function () {
        var defs = this.defs;

        if (!defs) {
            defs = this.defs = this.getSvg().append('defs');
        }

        return defs;
    },

    destroy: function () {
        this.getSvg().remove();
        this.callParent();
    }

});
