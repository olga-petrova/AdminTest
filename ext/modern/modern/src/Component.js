/**
 * Most of the visual classes you interact with are Components. Every Component is a
 * subclass of Ext.Component, which means they can all:
 *
 * * Render themselves onto the page using a template
 * * Show and hide themselves at any time
 * * Center themselves within their parent container
 * * Enable and disable themselves
 *
 * They can also do a few more advanced things:
 *
 * * Float above other components (windows, message boxes and overlays)
 * * Change size and position on the screen with animation
 * * Dock other Components inside themselves (useful for toolbars)
 * * Align to other components, allow themselves to be dragged around, make their content scrollable & more
 *
 * ## Available Components
 *
 * There are many components.  They are separated into 4 main groups:
 *
 * ### Navigation components
 * * {@link Ext.Toolbar}
 * * {@link Ext.Button}
 * * {@link Ext.TitleBar}
 * * {@link Ext.SegmentedButton}
 * * {@link Ext.Title}
 * * {@link Ext.Spacer}
 *
 * ### Store-bound components
 * * {@link Ext.dataview.DataView}
 * * {@link Ext.Carousel}
 * * {@link Ext.List}
 * * {@link Ext.NestedList}
 *
 * ### Form components
 * * {@link Ext.form.Panel}
 * * {@link Ext.form.FieldSet}
 * * {@link Ext.field.Checkbox}
 * * {@link Ext.field.Hidden}
 * * {@link Ext.field.Slider}
 * * {@link Ext.field.Text}
 * * {@link Ext.picker.Picker}
 * * {@link Ext.picker.Date}
 *
 * ### General components
 * * {@link Ext.Panel}
 * * {@link Ext.tab.Panel}
 * * {@link Ext.Viewport Ext.Viewport}
 * * {@link Ext.Img}
 * * {@link Ext.Map}
 * * {@link Ext.Audio}
 * * {@link Ext.Video}
 * * {@link Ext.Sheet}
 * * {@link Ext.ActionSheet}
 * * {@link Ext.MessageBox}
 *
 *
 * ## Instantiating Components
 *
 * Components are created the same way as all other classes - using Ext.create. Here's how we can
 * create a Text field:
 *
 *     var panel = Ext.create('Ext.Panel', {
 *         html: 'This is my panel'
 *     });
 *
 * This will create a {@link Ext.Panel Panel} instance, configured with some basic HTML content. A Panel is just a
 * simple Component that can render HTML and also contain other items. In this case we've created a Panel instance but
 * it won't show up on the screen yet because items are not rendered immediately after being instantiated. This allows
 * us to create some components and move them around before rendering and laying them out, which is a good deal faster
 * than moving them after rendering.
 *
 * To show this panel on the screen now we can simply add it to the global Viewport:
 *
 *     Ext.Viewport.add(panel);
 *
 * Panels are also Containers, which means they can contain other Components, arranged by a layout. Let's revisit the
 * above example now, this time creating a panel with two child Components and a hbox layout:
 *
 *     @example
 *     var panel = Ext.create('Ext.Panel', {
 *         layout: 'hbox',
 *
 *         items: [
 *             {
 *                 xtype: 'panel',
 *                 flex: 1,
 *                 html: 'Left Panel, 1/3rd of total size',
 *                  style: 'background-color: #5E99CC;'
 *             },
 *             {
 *                 xtype: 'panel',
 *                 flex: 2,
 *                 html: 'Right Panel, 2/3rds of total size',
 *                  style: 'background-color: #759E60;'
 *             }
 *         ]
 *     });
 *
 *     Ext.Viewport.add(panel);
 *
 * This time we created 3 Panels - the first one is created just as before but the inner two are declared inline using
 * an xtype. Xtype is a convenient way of creating Components without having to go through the process of using
 * Ext.create and specifying the full class name, instead you can just provide the xtype for the class inside an object
 * and the framework will create the components for you.
 *
 * We also specified a layout for the top level panel - in this case hbox, which splits the horizontal width of the
 * parent panel based on the 'flex' of each child. For example, if the parent Panel above is 300px wide then the first
 * child will be flexed to 100px wide and the second to 200px because the first one was given `flex: 1` and the second
 * `flex: 2`.
 *
 * ## Using xtype
 *
 * xtype is an easy way to create Components without using the full class name. This is especially useful when creating
 * a {@link Ext.Container Container} that contains child Components. An xtype is simply a shorthand way of specifying a
 * Component - for example you can use `xtype: 'panel'` instead of typing out Ext.panel.Panel.
 *
 * Sample usage:
 *
 *     @example miniphone
 *     Ext.create('Ext.Container', {
 *         fullscreen: true,
 *         layout: 'fit',
 *
 *         items: [
 *             {
 *                 xtype: 'panel',
 *                 html: 'This panel is created by xtype'
 *             },
 *             {
 *                 xtype: 'toolbar',
 *                 title: 'So is the toolbar',
 *                 docked: 'top'
 *             }
 *         ]
 *     });
 *
 *
 * ### Common xtypes
 *
 * <pre>
 xtype                   Class
 -----------------       ---------------------
 actionsheet             Ext.ActionSheet
 audio                   Ext.Audio
 button                  Ext.Button
 image                   Ext.Img
 label                   Ext.Label
 loadmask                Ext.LoadMask
 map                     Ext.Map
 panel                   Ext.Panel
 segmentedbutton         Ext.SegmentedButton
 sheet                   Ext.Sheet
 spacer                  Ext.Spacer
 titlebar                Ext.TitleBar
 toolbar                 Ext.Toolbar
 video                   Ext.Video
 carousel                Ext.carousel.Carousel
 navigationview          Ext.navigation.View
 datepicker              Ext.picker.Date
 picker                  Ext.picker.Picker
 slider                  Ext.slider.Slider
 thumb                   Ext.slider.Thumb
 tabpanel                Ext.tab.Panel
 viewport                Ext.viewport.Default

 DataView Components
 ---------------------------------------------
 dataview                Ext.dataview.DataView
 list                    Ext.dataview.List
 nestedlist              Ext.dataview.NestedList

 Form Components
 ---------------------------------------------
 checkboxfield           Ext.field.Checkbox
 datepickerfield         Ext.field.DatePicker
 emailfield              Ext.field.Email
 hiddenfield             Ext.field.Hidden
 numberfield             Ext.field.Number
 passwordfield           Ext.field.Password
 radiofield              Ext.field.Radio
 searchfield             Ext.field.Search
 selectfield             Ext.field.Select
 sliderfield             Ext.field.Slider
 spinnerfield            Ext.field.Spinner
 textfield               Ext.field.Text
 textareafield           Ext.field.TextArea
 togglefield             Ext.field.Toggle
 urlfield                Ext.field.Url
 fieldset                Ext.form.FieldSet
 formpanel               Ext.form.Panel
 * </pre>
 *
 * ## Configuring Components
 *
 * Whenever you create a new Component you can pass in configuration options. All of the configurations for a given
 * Component are listed in the "Config options" section of its class docs page. You can pass in any number of
 * configuration options when you instantiate the Component, and modify any of them at any point later. For example, we
 * can easily modify the {@link Ext.Panel#html html content} of a Panel after creating it:
 *
 *     @example miniphone
 *     // we can configure the HTML when we instantiate the Component
 *     var panel = Ext.create('Ext.Panel', {
 *         fullscreen: true,
 *         html: 'This is a Panel'
 *     });
 *
 *     // we can update the HTML later using the setHtml method:
 *     panel.setHtml('Some new HTML');
 *
 *     // we can retrieve the current HTML using the getHtml method:
 *     Ext.Msg.alert(panel.getHtml()); // displays "Some new HTML"
 *
 * Every config has a getter method and a setter method - these are automatically generated and always follow the same
 * pattern. For example, a config called `html` will receive `getHtml` and `setHtml` methods, a config called `defaultType`
 * will receive `getDefaultType` and `setDefaultType` methods, and so on.
 */
Ext.define('Ext.Component', {
    extend: 'Ext.Widget',

    alternateClassName: 'Ext.lib.Component',

    requires: [
        'Ext.ComponentManager',
        'Ext.ComponentQuery',
        'Ext.XTemplate',
        'Ext.scroll.Scroller',
        'Ext.behavior.Draggable'
    ],

    /**
     * @cfg {String} xtype
     * The `xtype` configuration option can be used to optimize Component creation and rendering. It serves as a
     * shortcut to the full component name. For example, the component `Ext.button.Button` has an xtype of `button`.
     *
     * You can define your own xtype on a custom {@link Ext.Component component} by specifying the
     * {@link Ext.Class#alias alias} config option with a prefix of `widget`. For example:
     *
     *     Ext.define('PressMeButton', {
     *         extend: 'Ext.button.Button',
     *         alias: 'widget.pressmebutton',
     *         text: 'Press Me'
     *     });
     *
     * Any Component can be created implicitly as an object config with an xtype specified, allowing it to be
     * declared and passed into the rendering pipeline without actually being instantiated as an object. Not only is
     * rendering deferred, but the actual creation of the object itself is also deferred, saving memory and resources
     * until they are actually needed. In complex, nested layouts containing many Components, this can make a
     * noticeable improvement in performance.
     *
     *     // Explicit creation of contained Components:
     *     var panel = new Ext.Panel({
     *        // ...
     *        items: [
     *           Ext.create('Ext.button.Button', {
     *              text: 'OK'
     *           })
     *        ]
     *     });
     *
     *     // Implicit creation using xtype:
     *     var panel = new Ext.Panel({
     *        // ...
     *        items: [{
     *           xtype: 'button',
     *           text: 'OK'
     *        }]
     *     });
     *
     * In the first example, the button will always be created immediately during the panel's initialization. With
     * many added Components, this approach could potentially slow the rendering of the page. In the second example,
     * the button will not be created or rendered until the panel is actually displayed in the browser. If the panel
     * is never displayed (for example, if it is a tab that remains hidden) then the button will never be created and
     * will never consume any resources whatsoever.
     */
    xtype: 'component',

    cachedConfig: {
        /**
         * @cfg {String/String[]} cls The CSS class to add to this component's element, in
         * addition to the {@link #baseCls}. In many cases, this property will be specified
         * by the derived component class. See {@link #userCls} for adding additional CSS
         * classes to component instances (such as items in a {@link Ext.Container}).
         * @accessor
         */
        cls: null,

        /**
         * @cfg {String} [floatingCls="x-floating"] The CSS class to add to this component when it is positioned.
         * @private
         * @readonly
         * @accessor
         */
        floatingCls: Ext.baseCSSPrefix + 'floating',

        /**
         * @cfg {String} [hiddenCls="x-item-hidden"] The CSS class to add to the component when it is hidden
         * @accessor
         */
        hiddenCls: Ext.baseCSSPrefix + 'item-hidden',

        /**
         * @private
         * @cfg {String} [centeredCls="x-centered"] The CSS class to add to the component when it is {@link #floated} and {@link #centered}.
         * @accessor
         */
        centeredCls: Ext.baseCSSPrefix + 'centered',

        /**
         * @cfg {Number/String} margin The margin to use on this Component. Can be specified as a number (in which case
         * all edges get the same margin) or a CSS string like '5 10 10 10'
         * @accessor
         */
        margin: null,

        /**
         * @cfg {Number/String} padding The padding to use on this Component. Can be specified as a number (in which
         * case all edges get the same padding) or a CSS string like '5 10 10 10'
         * @accessor
         */
        padding: null,

        /**
         * @cfg {Boolean} border Enables or disables bordering on this component.
         * The following values are accepted:
         *
         * - `null` or `true (default): Do nothing and allow the border to be specified by the theme.
         * - `false`: suppress the default border provided by the theme.
         *
         * Please note that enabling bordering via this config will not add a `border-color`
         * or `border-style` CSS property to the component; you provide the `border-color`
         * and `border-style` via CSS rule or {@link #style} configuration
         * (if not already provide by the theme).
         *
         * ## Using {@link #style}:
         *
         *     Ext.Viewport.add({
         *         centered: true,
         *         width: 100,
         *         height: 100,
         *
         *         style: 'border: 1px solid blue;'
         *         // ...
         *     });
         *
         * ## Using CSS:
         *
         *     Ext.Viewport.add({
         *         centered: true,
         *         width: 100,
         *         height: 100,
         *
         *         cls: 'my-component'
         *         // ...
         *     });
         *
         * And your CSS file:
         *
         *     .my-component {
         *         border: 1px solid red;
         *     }
         *
         * @accessor
         */
        border: null,

        /**
         * @cfg {String} [styleHtmlCls="x-html"]
         * The class that is added to the content target when you set `styleHtmlContent` to `true`.
         * @accessor
         */
        styleHtmlCls: Ext.baseCSSPrefix + 'html',

        /**
         * @cfg {Boolean} [styleHtmlContent=false]
         * `true` to automatically style the HTML inside the content target of this component (body for panels).
         * @accessor
         */
        styleHtmlContent: null
    },

    eventedConfig: {
        /**
         * @cfg {Number/String} left
         * The absolute left position of this Component; must be a valid CSS length value, e.g: `300`, `100px`, `30%`, etc.
         * Explicitly setting this value will make this Component become 'positioned', which means it will no
         * longer participate in the layout of the Container that it resides in.
         * @accessor
         * @evented
         */
        left: null,

        /**
         * @cfg {Number/String} top
         * The absolute top position of this Component; must be a valid CSS length value, e.g: `300`, `100px`, `30%`, etc.
         * Explicitly setting this value will make this Component become 'positioned', which means it will no
         * longer participate in the layout of the Container that it resides in.
         * @accessor
         * @evented
         */
        top: null,

        /**
         * @cfg {Number/String} right
         * The absolute right position of this Component; must be a valid CSS length value, e.g: `300`, `100px`, `30%`, etc.
         * Explicitly setting this value will make this Component become 'positioned', which means it will no
         * longer participate in the layout of the Container that it resides in.
         * @accessor
         * @evented
         */
        right: null,

        /**
         * @cfg {Number/String} bottom
         * The absolute bottom position of this Component; must be a valid CSS length value, e.g: `300`, `100px`, `30%`, etc.
         * Explicitly setting this value will make this Component become 'positioned', which means it will no
         * longer participate in the layout of the Container that it resides in.
         * @accessor
         * @evented
         */
        bottom: null,

        /**
         * @cfg {Number/String} minWidth
         * The minimum width of this Component; must be a valid CSS length value, e.g: `300`, `100px`, `30%`, etc.
         * If set to `auto`, it will set the width to `null` meaning it will have its own natural size.
         * @accessor
         * @evented
         */
        minWidth: null,

        /**
         * @cfg {Number/String} minHeight
         * The minimum height of this Component; must be a valid CSS length value, e.g: `300`, `100px`, `30%`, etc.
         * If set to `auto`, it will set the width to `null` meaning it will have its own natural size.
         * @accessor
         * @evented
         */
        minHeight: null,

        /**
         * @cfg {Number/String} maxWidth
         * The maximum width of this Component; must be a valid CSS length value, e.g: `300`, `100px`, `30%`, etc.
         * If set to `auto`, it will set the width to `null` meaning it will have its own natural size.
         * Note that this config will not apply if the Component is 'positioned' (absolutely positioned or centered)
         * @accessor
         * @evented
         */
        maxWidth: null,

        /**
         * @cfg {Number/String} maxHeight
         * The maximum height of this Component; must be a valid CSS length value, e.g: `300`, `100px`, `30%`, etc.
         * If set to `auto`, it will set the width to `null` meaning it will have its own natural size.
         * Note that this config will not apply if the Component is 'positioned' (absolutely positioned or centered)
         * @accessor
         * @evented
         */
        maxHeight: null,

        /**
         * @cfg {Boolean/String/Object} scrollable
         * Configuration options to make this Component scrollable. Acceptable values are:
         *
         * - `true` to enable auto scrolling.
         * - `false` (or `null`) to disable scrolling - this is the default.
         * - `x` or `horizontal` to enable horizontal scrolling only
         * - `y` or `vertical` to enable vertical scrolling only
         *
         * Also accepts a configuration object for a `{@link Ext.scroll.Scroller}` if
         * if advanced configuration is needed.
         *
         * The getter for this config returns the {@link Ext.scroll.Scroller Scroller}
         * instance.  You can use the Scroller API to read or manipulate the scroll position:
         *
         *     // scrolls the component to 5 on the x axis and 10 on the y axis
         *     component.getScrollable().scrollTo(5, 10);
         *
         * @accessor
         * @evented
         */
        scrollable: null,

        /**
         * @cfg {String} docked
         * The dock position of this component in its container. Can be `left`, `top`, `right` or `bottom`.
         *
         * __Notes__
         *
         * You must use a HTML5 doctype for {@link #docked} `bottom` to work. To do this, simply add the following code to the HTML file:
         *
         *     <!doctype html>
         *
         * So your index.html file should look a little like this:
         *
         *     <!doctype html>
         *     <html>
         *         <head>
         *             <title>MY application title</title>
         *             ...
         *
         * @accessor
         * @evented
         */
        docked: null,

        /**
         * @cfg {Boolean} [centered=false]
         * Configure this as `true` to have this Component centered within its Container.
         * Setting this value to `true` will make this Component become 'positioned', which means it will no
         * longer participate in the layout of the Container that it resides in.
         * @accessor
         * @evented
         */
        centered: null,

        /**
         * @cfg {Boolean} [hidden]
         * Whether or not this Component is hidden (its CSS `display` property is set to `none`).
         *
         * Defaults to `true` for {@link #floated} Components.
         * @accessor
         * @evented
         */
        hidden: null,

        /**
         * @cfg {Boolean} [disabled]
         * Whether or not this component is disabled
         * @accessor
         * @evented
         */
        disabled: null
    },

    config: {
        /**
         * @cfg {String/Ext.Element/HTMLElement} html Optional HTML content to render inside this Component, or a reference
         * to an existing element on the page.
         * @accessor
         */
        html: null,

        /**
         * @cfg {Object} [draggable] Configuration options to make this Component draggable
         * @accessor
         */
        draggable: null,

        /**
         * @cfg {Ext.Element} [renderTo] Optional element to render this Component to. Usually this is not needed because
         * a Component is normally full screen or automatically rendered inside another {@link Ext.Container Container}
         * @accessor
         */
        renderTo: null,

        /**
         * @cfg {Number} [zIndex] The z-index to give this Component when it is rendered.
         *
         * Not valid for {@link #cfg-floated} Components. The Z ordering of {@link #cfg-floated}
         * Components is managed by ordering of the DOM elements.
         * @accessor
         */
        zIndex: null,

        /**
         * @cfg {String/String[]/Ext.Template/Ext.XTemplate[]} tpl
         * A {@link String}, {@link Ext.Template}, {@link Ext.XTemplate} or an {@link Array} of strings to form an {@link Ext.XTemplate}.
         * Used in conjunction with the {@link #data} and {@link #tplWriteMode} configurations.
         *
         * __Note__
         * The {@link #data} configuration _must_ be set for any content to be shown in the component when using this configuration.
         * @accessor
         */
        tpl: null,

        /**
         * @cfg {String/Mixed} enterAnimation
         * Animation effect to apply when the Component is being shown.  Typically you want to use an
         * inbound animation type such as 'fadeIn' or 'slideIn'.
         * @deprecated 2.0.0 Please use {@link #showAnimation} instead.
         * @accessor
         */
        enterAnimation: null,

        /**
         * @cfg {String/Mixed} exitAnimation
         * Animation effect to apply when the Component is being hidden.
         * @deprecated 2.0.0 Please use {@link #hideAnimation} instead.  Typically you want to use an
         * outbound animation type such as 'fadeOut' or 'slideOut'.
         * @accessor
         */
        exitAnimation: null,

        /**
         * @cfg {String/Mixed} showAnimation
         * Animation effect to apply when the Component is being shown.  Typically you want to use an
         * inbound animation type such as 'fadeIn' or 'slideIn'. For more animations, check the {@link Ext.fx.Animation#type} config.
         * @accessor
         */
        showAnimation: null,

        /**
         * @cfg {String/Mixed} hideAnimation
         * Animation effect to apply when the Component is being hidden.  Typically you want to use an
         * outbound animation type such as 'fadeOut' or 'slideOut'. For more animations, check the {@link Ext.fx.Animation#type} config.
         * @accessor
         */
        hideAnimation: null,

        /**
         * @cfg {String} tplWriteMode The Ext.(X)Template method to use when
         * updating the content area of the Component.
         * Valid modes are:
         *
         * - append
         * - insertAfter
         * - insertBefore
         * - insertFirst
         * - overwrite
         * @accessor
         */
        tplWriteMode: 'overwrite',

        /**
         * @cfg {Object} data
         * The initial set of data to apply to the `{@link #tpl}` to
         * update the content area of the Component.
         * @accessor
         */
        data: null,

        /**
         * @cfg {String} [disabledCls="x-item-disabled"] The CSS class to add to the component when it is disabled
         * @accessor
         */
        disabledCls: Ext.baseCSSPrefix + 'item-disabled',

        /**
         * @cfg {Ext.Element/HTMLElement/String} contentEl The configured element will automatically be
         * added as the content of this component. When you pass a string, we expect it to be an element id.
         * If the content element is hidden, we will automatically show it.
         * @accessor
         */
        contentEl: null,

        /**
         * @cfg {Ext.data.Model} record A model instance which updates the Component's html based on it's tpl. Similar to the data
         * configuration, but tied to to a record to make allow dynamic updates.  This must be a model
         * instance and not a configuration of one.
         * @accessor
         */
        record: null,

        /**
         * @cfg {Object/Array} plugins
         * @accessor
         * An object or array of objects that will provide custom functionality for this component.  The only
         * requirement for a valid plugin is that it contain an init method that accepts a reference of type Ext.Component.
         *
         * When a component is created, if any plugins are available, the component will call the init method on each
         * plugin, passing a reference to itself.  Each plugin can then call methods or respond to events on the
         * component as needed to provide its functionality.
         *
         * For examples of plugins, see Ext.plugin.PullRefresh and Ext.plugin.ListPaging
         *
         * ## Example code
         *
         * A plugin by alias:
         *
         *     Ext.create('Ext.dataview.List', {
         *         config: {
         *             plugins: 'listpaging',
         *             itemTpl: '<div class="item">{title}</div>',
         *             store: 'Items'
         *         }
         *     });
         *
         * Multiple plugins by alias:
         *
         *     Ext.create('Ext.dataview.List', {
         *         config: {
         *             plugins: ['listpaging', 'pullrefresh'],
         *             itemTpl: '<div class="item">{title}</div>',
         *             store: 'Items'
         *         }
         *     });
         *
         * Single plugin by class name with config options:
         *
         *     Ext.create('Ext.dataview.List', {
         *         config: {
         *             plugins: {
         *                 xclass: 'Ext.plugin.ListPaging', // Reference plugin by class
         *                 autoPaging: true
         *             },
         *
         *             itemTpl: '<div class="item">{title}</div>',
         *             store: 'Items'
         *         }
         *     });
         *
         * Multiple plugins by class name with config options:
         *
         *     Ext.create('Ext.dataview.List', {
         *         config: {
         *             plugins: [
         *                 {
         *                     xclass: 'Ext.plugin.PullRefresh',
         *                     pullRefreshText: 'Pull to refresh...'
         *                 },
         *                 {
         *                     xclass: 'Ext.plugin.ListPaging',
         *                     autoPaging: true
         *                 }
         *             ],
         *
         *             itemTpl: '<div class="item">{title}</div>',
         *             store: 'Items'
         *         }
         *     });
         *
         */
        plugins: null,

        /**
         * @private
         */
        useBodyElement: null,

        /**
         * @cfg {String/Object} tooltip
         * The tooltip for this component - can be a string to be used as innerHTML
         * (html tags are accepted) or {@link Ext.tip.ToolTip} config object
         */
        tooltip: null,

        /**
         * @cfg {Boolean} [axisLock] If `true`, then, when {@link #showBy} or {@link #alignTo} fallback on
         * constraint violation only takes place along the major align axis.
         *
         * That is, if alignment `"l-r"` is being used, and `axisLock: true` is used, then if constraints
         * fail, only fallback to `"r-l"` is considered.
         */
        axisLock: null,

        /**
         * @cfg {Boolean} modal `true` to make this Componenrt modal. This will create a mask underneath the Component
         * that covers its parent and does not allow the user to interact with any other Components until this
         * Component is dismissed.
         * @accessor
         */
        modal: null,

        /**
         * @cfg {Boolean} hideOnMaskTap When using a {@link #modal} Component, setting this to `true` will hide the modal
         * mask and the Container when the mask is tapped on.
         * @accessor
         */
        hideOnMaskTap: null
    },

    /**
     * @event beforeshow
     * Fires before the Component is shown. Show may be vetoed by returning `false` from a handler.
     * @param {Ext.Component} this The component instance
     */

    /**
     * @event show
     * Fires whenever the Component is shown
     * @param {Ext.Component} this The component instance
     */

    /**
     * @event beforehide
     * Fires before the Component is hidden. Hide may be vetoed by returning `false` from a handler.
     * @param {Ext.Component} this The component instance
     */

    /**
     * @event hide
     * Fires whenever the Component is hidden
     * @param {Ext.Component} this The component instance
     */

    /**
     * @event fullscreen
     * Fires whenever a Component with the fullscreen config is instantiated
     * @param {Ext.Component} this The component instance
     */

    /**
     * @event floatingchange
     * Fires whenever there is a change in the positioned status of a component
     * @param {Ext.Component} this The component instance
     * @param {Boolean} positioned The component's new positioned state. This becomes
     * `true` is a component is positioned using the {@link #cfg-top}, {@link #cfg-right},
     * {@link #cfg-bottom} or {@link #cfg-left} configs.
     * @deprecated 6.1.0 Use {@link #positionedchange} instead
     */
    /**
     * @event positionedchange
     * Fires whenever there is a change in the positioned status of a component
     * @param {Ext.Component} this The component instance
     * @param {Boolean} positioned The component's new positioned state. This becomes
     * `true` is a component is positioned using the {@link #cfg-top}, {@link #cfg-right},
     * {@link #cfg-bottom} or {@link #cfg-left} configs.
     */

    /**
     * @event destroy
     * Fires when the component is destroyed
     */

    /**
     * @event beforeorientationchange
     * Fires before orientation changes.
     * @removed 2.0.0 This event is now only available `onBefore` the Viewport's {@link Ext.Viewport#orientationchange}
     */

    /**
     * @event orientationchange
     * Fires when orientation changes.
     * @removed 2.0.0 This event is now only available on the Viewport's {@link Ext.Viewport#orientationchange}
     */

    /**
     * @event initialize
     * Fires when the component has been initialized
     * @param {Ext.Component} this The component instance
     */

    /**
     * @event painted
     * @inheritdoc Ext.dom.Element#painted
     * @param {Ext.Element} element The component's outer element (this.element)
     */

    /**
     * @event erased
     * Fires when the component is no longer displayed in the DOM.  Listening to this event will
     * degrade performance not recommend for general use.
     * @param {Ext.Component} this The component instance
     */

    /**
     * @event resize
     * @inheritdoc Ext.dom.Element#resize
     * @param {Ext.Element} element The component's outer element (this.element)
     */

    /**
     * @event added
     * Fires after a Component had been added to a Container.
     * @param {Ext.Component} this
     * @param {Ext.Container} container Parent Container
     * @param {Number} index The index of the item within the Container.
     */

    /**
     * @event removed
     * Fires when a component is removed from a Container
     * @param {Ext.Component} this
     * @param {Ext.Container} container Container which holds the component
     * @param {Number} index The index of the item that was removed.
     */

    /**
     * @event moved
     * Fires when a component si moved within its Container.
     * @param {Ext.Component} this
     * @param {Ext.Container} container Container which holds the component
     * @param {Number} toIndex The new index of the item.
     * @param {Number} fromIndex The old index of the item.
     */
    
    /**
     * @inheritdoc
     */
    defaultBindProperty: 'html',

    /**
     * @private
     */
    isComponent: true,

    /**
     * @private
     */
    positioned: false,

    /**
     * @private
     */
    rendered: false,

    /**
     * @private
     */
    activeAnimation: null,

    /**
     * @readonly
     * @private
     */
    dockPositions: {
        top: true,
        right: true,
        bottom: true,
        left: true
    },

    innerElement: null,

    element: {
        reference: 'element',
        classList: ['x-unsized']
    },

    widthLayoutSized: false,

    heightLayoutSized: false,

    layoutStretched: false,

    sizeState: false,

    sizeFlags: 0x0,

    LAYOUT_WIDTH: 0x1,

    LAYOUT_HEIGHT: 0x2,

    LAYOUT_BOTH: 0x3,

    LAYOUT_STRETCHED: 0x4,

    _scrollableCfg: {
        x: {
            x: true,
            y: false
        },
        y: {
            x: false,
            y: true
        },
        horizontal: {
            x: true,
            y: false
        },
        vertical: {
            x: false,
            y: true
        },
        both: {
            x: true,
            y: true
        },
        'true': {
            x: true,
            y: true
        }
    },

    statics: {
        /**
         * Find the Widget or Component to which the given Element belongs.
         *
         * @param {Ext.dom.Element/HTMLElement} el The element from which to start to find an owning Component.
         * @param {Ext.dom.Element/HTMLElement} [limit] The element at which to stop upward searching for an
         * owning Component, or the number of Components to traverse before giving up.
         * Defaults to the document's HTML element.
         * @param {String} [selector] An optional {@link Ext.ComponentQuery} selector to filter the target.
         * @return {Ext.Component/null} Component, or null
         *
         * @since 6.0.1
         */
        fromElement: function(el, limit, selector) {
            return Ext.ComponentManager.fromElement(el, limit, selector);
        }
    },

    initialConfig: null,
    $initParent: null,

    /**
     * Creates new Component.
     * @param {Object} config The standard configuration object.
     */
    constructor: function(config) {
        var me = this,
            plugins = config && config.plugins,
            responsive = 'responsive',
            i, p;

        me.onInitializedListeners = [];

        if (config) {
            me.initialConfig = config;
            // We need to copy this over here and not rely on initConfig to do so since
            // configs (esp cached configs like "ui") can be set() prior to copying of
            // such properties.
            me.$initParent = config.$initParent;
        }

        // The Responsive plugin must be created before initConfig runs in order to
        // process the initial responsiveConfig block. The simplest and safest solution
        // is to accelerate the creation of this plugin here and leave the timing as it
        // has always been for other plugins.
        if (plugins) {
            plugins = Ext.Array.from(plugins);

            for (i = plugins.length; i-- > 0; ) {
                p = plugins[i];

                if (p === responsive || p.type === responsive) {
                    me.initialConfig = config = Ext.apply({}, config);
                    config.plugins = plugins = plugins.slice(0);

                    // Put the instance in the plugins array so it will be included in
                    // the applyPlugins loop for normal processing of plugins.
                    plugins[i] = me.createPlugin(p);

                    config = me.initialConfig;
                    break;
                }
            }
        }

        me.callParent([ config ]);

        me.refreshSizeState = me.doRefreshSizeState;
        me.refreshPositioned = me.doRefreshPositioned;

        if (me.refreshSizeStateOnInitialized) {
            me.refreshSizeState();
        }

        if (me.refreshPositionedOnInitialized) {
            me.refreshPositioned();
        }

        me.initialize();

        me.triggerInitialized();

        /**
         * Force the component to take up 100% width and height available, by adding it
         * to {@link Ext.Viewport}.
         * @cfg {Boolean} fullscreen
         */
        if (me.fullscreen) {
            me.fireEvent('fullscreen', me);
        }

        me.fireEvent('initialize', me);
    },

    /**
     * Center this *{@link #cfg-floated}* Component in its parent.
     * @return {Ext.Component} this
     */
    center: function() {
        var me = this,
            parentBox, parent, xy;

        if (me.el.isVisible()) {
            parent = me.getParent();
            parent = parent ? parent.element : Ext.getBody();
            parentBox = parent.getConstrainRegion();
            xy = [(parentBox.getWidth() - me.el.getWidth()) / 2, (parentBox.getHeight() - me.el.getHeight()) / 2];

            me.setX(xy[0]);
            me.setY(xy[1]);
        } else {
            me.needsCenter = true;
        }
        return me;
    },

    /**
     * Returns the stack of floated components in which this Component resides.
     * This Component and all siblings at this level are returned.
     * @param {String/Function} selector A {@link #Ext.CommponentQuery ComponentQuery} selector, or
     * a selection function which returns `true` to select a component.
     */
    getFloatedStack: function(selector) {
        var me = this,
            floatedEls,
            result = [],
            parentWrap = me.floatParentNode,
            parent, len, i, comp;

        if (parentWrap) {
            parent = Ext.Component.fromElement(parentWrap);
            
            // Get the .x-floated elements, or .x-float-wrap elements which wrap floateds which have children.
            floatedEls = Ext.supports.Selectors2
                    ? parentWrap.query(':scope>' + me.floatedSelector + ',:scope>.' + me.floatWrapCls)
                    : Ext.getBody().query('#' +  parentWrap.id + '>' + me.floatedSelector + ',#' + parentWrap.id + '>.' + me.floatWrapCls);

            for (i = 0, len = floatedEls.length; i < len; i++) {
                comp = Ext.Component.fromElement(floatedEls[i]);
                if (comp !== parent && (!selector || (typeof selector === 'string' ? comp.is(selector) : comp(selector)))) {
                    result.unshift(comp);
                }
            }
        }
        return result;
    },

    beforeInitConfig: function (config) {
        this.beforeInitialize.apply(this, arguments);
    },

    /**
     * @method
     * @private
     */
    beforeInitialize: Ext.emptyFn,

    /**
     * @method
     * Allows addition of behavior to the rendering phase.
     * @protected
     * @template
     */
    initialize: Ext.emptyFn,

    /**
     * Invoked when a scroll is initiated on this component via its {@link #scrollable scroller}.
     * @method onScrollStart
     * @param {Number} x The current x position
     * @param {Number} y The current y position
     * @template
     * @protected
     */

    /**
     * Invoked when this component is scrolled via its {@link #scrollable scroller}.
     * @method onScrollMove
     * @param {Number} x The current x position
     * @param {Number} y The current y position
     * @template
     * @protected
     */

    /**
     * Invoked when a scroll operation is completed via this component's {@link #scrollable scroller}.
     * @method onScrollEnd
     * @param {Number} x The current x position
     * @param {Number} y The current y position
     * @template
     * @protected
     */

    /**
     * @private
     */
    triggerInitialized: function() {
        var listeners = this.onInitializedListeners,
            ln = listeners.length,
            listener, fn, scope, args, i;

        if (!this.initialized) {
            this.initialized = true;

            if (ln > 0) {
                for (i = 0; i < ln; i++) {
                    listener = listeners[i];
                    fn = listener.fn;
                    scope = listener.scope;
                    args = listener.args;

                    if (typeof fn == 'string') {
                        scope[fn].apply(scope, args);
                    }
                    else {
                        fn.apply(scope, args);
                    }
                }

                listeners.length = 0;
            }
        }
    },

    /**
     * @private
     */
    onInitialized: function(fn, scope, args) {
        var listeners = this.onInitializedListeners;

        if (!scope) {
            scope = this;
        }

        if (this.initialized) {
            if (typeof fn == 'string') {
                scope[fn].apply(scope, args);
            }
            else {
                fn.apply(scope, args);
            }
        }
        else {
            listeners.push({
                fn: fn,
                scope: scope,
                args: args
            });
        }
    },

    initElement: function() {
        var me = this;

        me.callParent();

        if (!me.innerElement) {
            me.innerElement = me.element;
        }

        if (!me.bodyElement) {
            me.bodyElement = me.innerElement;
        }
    },

    applyPlugins: function(plugins) {
        var me = this,
            config, ln, i, plugin;

        if (!plugins) {
            return plugins;
        }

        plugins = [].concat(plugins);

        for (i = 0, ln = plugins.length; i < ln; i++) {
            plugins[i] = me.createPlugin(plugins[i]);
        }

        return plugins;
    },

    createPlugin: function (config) {
        if (typeof config === 'string') {
            config = {
                type: config
            };
        }

        var ret = config;

        if (!config.isInstance) {
            // The owner may be needed by plugin's initConfig so provide it:
            config.cmp = this;

            ret = Ext.factory(config, null, null, 'plugin');

            // Cleanup the user's config object:
            delete config.cmp;
        }

        if (ret.setCmp) {
            ret.setCmp(this);
        }

        return ret;
    },

    updatePlugins: function(newPlugins, oldPlugins) {
        var ln, i;

        if (newPlugins) {
            for (i = 0, ln = newPlugins.length; i < ln; i++) {
                newPlugins[i].init(this);
            }
        }

        if (oldPlugins) {
            for (i = 0, ln = oldPlugins.length; i < ln; i++) {
                Ext.destroy(oldPlugins[i]);
            }
        }
    },

    applyScrollable: function(scrollable, oldScrollable) {
        var me = this,
            scrollableCfg;

        if (scrollable) {
            if (scrollable === true || typeof scrollable === 'string') {
                scrollableCfg = me._scrollableCfg[scrollable];

                //<debug>
                if (!scrollableCfg) {
                    Ext.raise("'" + scrollable + "'is not a valid value for 'scrollable'");
                }
                //</debug>

                scrollable = scrollableCfg;
            }

            if (oldScrollable) {
                oldScrollable.setConfig(scrollable);
                scrollable = oldScrollable;
            } else {
                scrollable = Ext.scroll.Scroller.create(scrollable);
                scrollable.component = me;

                me.setUseBodyElement(true);
                scrollable.setElement(me.bodyElement);
            }
        }

        return scrollable;
    },

    updateRenderTo: function(newContainer) {
        this.renderTo(newContainer);
    },

    updateBorder: function(border) {
        this.element.setStyle('border-width', border ? '' : '0');
    },

    updatePadding: function(padding) {
       this.innerElement.setPadding(padding);
    },

    updateMargin: function(margin) {
        this.element.setMargin(margin);
    },

    /**
     * Adds a CSS class (or classes) to this Component's rendered element.
     * @param {String} cls The CSS class to add.
     * @param {String} [prefix=""] Optional prefix to add to each class.
     * @param {String} [suffix=""] Optional suffix to add to each class.
     */
    addCls: function(cls, prefix, suffix) {
        var oldCls = this.getCls(),
            newCls = (oldCls) ? oldCls.slice() : [],
            ln, i, cachedCls;

        prefix = prefix || '';
        suffix = suffix || '';

        if (typeof cls == "string") {
            cls = [cls];
        }

        ln = cls.length;

        //check if there is currently nothing in the array and we don't need to add a prefix or a suffix.
        //if true, we can just set the newCls value to the cls property, because that is what the value will be
        //if false, we need to loop through each and add them to the newCls array
        if (!newCls.length && prefix === '' && suffix === '') {
            newCls = cls;
        } else {
            for (i = 0; i < ln; i++) {
                cachedCls = prefix + cls[i] + suffix;
                if (newCls.indexOf(cachedCls) == -1) {
                    newCls.push(cachedCls);
                }
            }
        }

        this.setCls(newCls);
    },

    /**
     * Removes the given CSS class(es) from this Component's rendered element.
     * @param {String} cls The class(es) to remove.
     * @param {String} [prefix=""] Optional prefix to prepend before each class.
     * @param {String} [suffix=""] Optional suffix to append to each class.
     */
    removeCls: function(cls, prefix, suffix) {
        var oldCls = this.getCls(),
            newCls = (oldCls) ? oldCls.slice() : [],
            ln, i;

        prefix = prefix || '';
        suffix = suffix || '';

        if (typeof cls == "string") {
            newCls = Ext.Array.remove(newCls, prefix + cls + suffix);
        } else {
            ln = cls.length;
            for (i = 0; i < ln; i++) {
                newCls = Ext.Array.remove(newCls, prefix + cls[i] + suffix);
            }
        }

        this.setCls(newCls);
    },

    /**
     * Replaces specified classes with the newly specified classes.
     * It uses the {@link #addCls} and {@link #removeCls} methods, so if the class(es) you are removing don't exist, it will
     * still add the new classes.
     * @param {String} oldCls The class(es) to remove.
     * @param {String} newCls The class(es) to add.
     * @param {String} [prefix=""] Optional prefix to prepend before each class.
     * @param {String} [suffix=""] Optional suffix to append to each class.
     */
    replaceCls: function(oldCls, newCls, prefix, suffix) {
        // We could have just called {@link #removeCls} and {@link #addCls}, but that would mean {@link #updateCls}
        // would get called twice, which would have performance implications because it will update the dom.

        var cls = this.getCls(),
            array = (cls) ? cls.slice() : [],
            ln, i, cachedCls;

        prefix = prefix || '';
        suffix = suffix || '';

        //remove all oldCls
        if (typeof oldCls == "string") {
            array = Ext.Array.remove(array, prefix + oldCls + suffix);
        } else if (oldCls) {
            ln = oldCls.length;
            for (i = 0; i < ln; i++) {
                array = Ext.Array.remove(array, prefix + oldCls[i] + suffix);
            }
        }

        //add all newCls
        if (typeof newCls == "string") {
            array.push(prefix + newCls + suffix);
        } else if (newCls) {
            ln = newCls.length;

            //check if there is currently nothing in the array and we don't need to add a prefix or a suffix.
            //if true, we can just set the array value to the newCls property, because that is what the value will be
            //if false, we need to loop through each and add them to the array
            if (!array.length && prefix === '' && suffix === '') {
                array = newCls;
            } else {
                for (i = 0; i < ln; i++) {
                    cachedCls = prefix + newCls[i] + suffix;
                    if (array.indexOf(cachedCls) == -1) {
                        array.push(cachedCls);
                    }
                }
            }
        }

        this.setCls(array);
    },

    /**
     * Add or removes a class based on if the class is already added to the Component.
     *
     * @param {String} className The class to toggle.
     * @param {Boolean} [state] If specified as `true`, causes the class to be added. If specified as `false`, causes
     * the class to be removed.
     * @chainable
     */
    toggleCls: function(className, /* private */ state) {
        var oldCls = this.getCls(),
            newCls = oldCls ? oldCls.slice() : [];

        if (typeof state !== 'boolean') {
            state = newCls.indexOf(className) === -1;
        }

        if (state) {
            Ext.Array.include(newCls, className);
        } else {
            Ext.Array.remove(newCls, className);
        }

        this.setCls(newCls);

        return this;
    },

    /**
     * @private
     * Checks if the `cls` is a string. If it is, changed it into an array.
     * @param {String/Array} cls
     * @return {Array/null}
     */
    applyCls: function(cls) {
        if (typeof cls == "string") {
            cls = [cls];
        }

        //reset it back to null if there is nothing.
        if (!cls || !cls.length) {
            cls = null;
        }

        return cls;
    },

    /**
     * @private
     * All cls methods directly report to the {@link #cls} configuration, so anytime it changes, {@link #updateCls} will be called
     */
    updateCls: function (newCls, oldCls) {
        var el = this.element;

        if (el && ((newCls && !oldCls) || (!newCls && oldCls) || newCls.length != oldCls.length || Ext.Array.difference(newCls,
            oldCls).length > 0)) {
            el.replaceCls(oldCls, newCls);
        }
    },

    /**
     * Updates the {@link #styleHtmlCls} configuration
     */
    updateStyleHtmlCls: function(newHtmlCls, oldHtmlCls) {
        var innerHtmlElement = this.innerHtmlElement,
            innerElement = this.innerElement;

        if (this.getStyleHtmlContent() && oldHtmlCls) {
            if (innerHtmlElement) {
                innerHtmlElement.replaceCls(oldHtmlCls, newHtmlCls);
            } else {
                innerElement.replaceCls(oldHtmlCls, newHtmlCls);
            }
        }
    },

    applyStyleHtmlContent: function(config) {
        return Boolean(config);
    },

    updateStyleHtmlContent: function(styleHtmlContent) {
        var htmlCls = this.getStyleHtmlCls(),
            innerElement = this.innerElement,
            innerHtmlElement = this.innerHtmlElement;

        if (styleHtmlContent) {
            if (innerHtmlElement) {
                innerHtmlElement.addCls(htmlCls);
            } else {
                innerElement.addCls(htmlCls);
            }
        } else {
            if (innerHtmlElement) {
                innerHtmlElement.removeCls(htmlCls);
            } else {
                innerElement.addCls(htmlCls);
            }
        }
    },

    applyContentEl: function(contentEl) {
        if (contentEl) {
            return Ext.get(contentEl);
        }
    },

    updateContentEl: function(newContentEl, oldContentEl) {
        if (oldContentEl) {
            oldContentEl.hide();
            Ext.getBody().append(oldContentEl);
        }

        if (newContentEl) {
            this.setHtml(newContentEl.dom);
            newContentEl.show();
        }
    },

    updateUseBodyElement: function(useBodyElement) {
        if (useBodyElement) {
            this.link('bodyElement', this.innerElement.wrap({
                cls: 'x-body'
            }));
        }
    },

    /**
     * @private
     * @return {Boolean}
     */
    isCentered: function() {
        return Boolean(this.getCentered());
    },

    isPositioned: function() {
        return this.positioned;
    },

    isDocked: function() {
        return Boolean(this.getDocked());
    },

    applyTop: function(top) {
        return this.filterLengthValue(top);
    },

    applyRight: function(right) {
        return this.filterLengthValue(right);
    },

    applyBottom: function(bottom) {
        return this.filterLengthValue(bottom);
    },

    applyLeft: function(left) {
        return this.filterLengthValue(left);
    },

    applyMinWidth: function(width) {
        return this.filterLengthValue(width);
    },

    applyMinHeight: function(height) {
        return this.filterLengthValue(height);
    },

    applyMaxWidth: function(width) {
        return this.filterLengthValue(width);
    },

    applyMaxHeight: function(height) {
        return this.filterLengthValue(height);
    },

    updateTop: function(top) {
        this.element.setTop(top);
        this.refreshPositioned();
    },

    updateRight: function(right) {
        this.element.setRight(right);
        this.refreshPositioned();
    },

    updateBottom: function(bottom) {
        this.element.setBottom(bottom);
        this.refreshPositioned();
    },

    updateLeft: function(left) {
        this.element.setLeft(left);
        this.refreshPositioned();
    },

    updateWidth: function(width) {
        this.element.setWidth(width);
        this.refreshSizeState();
    },

    updateHeight: function(height) {
        this.element.setHeight(height);
        this.refreshSizeState();
    },

    updateFlex: Ext.emptyFn,

    refreshSizeState: function() {
        this.refreshSizeStateOnInitialized = true;
    },

    doRefreshSizeState: function() {
        var hasWidth = this.getWidth() !== null || this.widthLayoutSized || (this.getLeft() !== null && this.getRight() !== null),
            hasHeight = this.getHeight() !== null || this.heightLayoutSized || (this.getTop() !== null && this.getBottom() !== null),
            stretched = this.layoutStretched || this.hasCSSMinHeight || (!hasHeight && this.getMinHeight() !== null),
            state = hasWidth && hasHeight,
            flags = (hasWidth && this.LAYOUT_WIDTH) | (hasHeight && this.LAYOUT_HEIGHT) | (stretched && this.LAYOUT_STRETCHED);

        if (!state && stretched) {
            state = null;
        }

        this.setSizeState(state);
        this.setSizeFlags(flags);

        // Inform the Widget class.
        this.callParent();
    },

    setLayoutSizeFlags: function(flags) {
        this.layoutStretched = !!(flags & this.LAYOUT_STRETCHED);
        this.widthLayoutSized = !!(flags & this.LAYOUT_WIDTH);
        this.heightLayoutSized = !!(flags & this.LAYOUT_HEIGHT);

        this.refreshSizeState();
    },

    setSizeFlags: function(flags) {
        var me = this,
            el = me.element,
            hasWidth, hasHeight, stretched;

        if (flags !== this.sizeFlags) {
            me.sizeFlags = flags;

            hasWidth = !!(flags & this.LAYOUT_WIDTH);
            hasHeight = !!(flags & this.LAYOUT_HEIGHT);
            stretched = !!(flags & this.LAYOUT_STRETCHED);


            el.toggleCls(Ext.baseCSSPrefix + 'has-width', hasWidth && !stretched && !hasHeight);
            el.toggleCls(Ext.baseCSSPrefix + 'has-height', hasHeight && !stretched && !hasWidth);

            if (me.initialized) {
                me.fireEvent('sizeflagschange', me, flags);
            }
        }
    },

    getSizeFlags: function() {
        if (!this.initialized) {
            this.doRefreshSizeState();
        }

        return this.sizeFlags;
    },

    setSizeState: function(state) {
        if (state !== this.sizeState) {
            this.sizeState = state;

            this.element.setSizeState(state);

            if (this.initialized) {
                this.fireEvent('sizestatechange', this, state);
            }
        }
    },

    getSizeState: function() {
        if (!this.initialized) {
            this.doRefreshSizeState();
        }

        return this.sizeState;
    },


    updateMinWidth: function(width) {
        this.element.setMinWidth(width);
    },

    updateMinHeight: function(height) {
        this.element.setMinHeight(height);
        this.refreshSizeState();
    },

    updateMaxWidth: function(width) {
        this.element.setMaxWidth(width);
    },

    updateMaxHeight: function(height) {
        this.element.setMaxHeight(height);
    },

    /**
     * @private
     * @param {Boolean} centered
     * @return {Boolean}
     */
    applyCentered: function(centered) {
         var me = this,
             doCenter = me.getLeft() === null && me.getRight() === null && me.getTop() === null && me.getBottom() === null;

        // We can only center if the CSS top/right/bottom/left properties are not being used.
        if (doCenter) {
            return !!centered;
        }
    },

    updateCentered: function(centered) {
        var me = this;

        if (me.isFloated()) {
            if (centered) {
                me.center();
                if (!me.centerResizeListener) {
                    me.centerResizeListener = me.floatParentNode.on({
                        resize: me.center,
                        scope: me,
                        destroyable: true
                    });
                }
            } else {
                me.centerResizeListener = Ext.destroy(me.centerResizeListener);
            }
        } else {
            me.el.toggleCls(me.getFloatingCls(), centered);
            if (centered) {
                me.refreshInnerState = Ext.emptyFn;

                if (me.isPositioned()) {
                    me.resetPositioned();
                }

                if (me.isDocked()) {
                    me.setDocked(false);
                }

                me.setIsInner(false);
                delete me.refreshInnerState;
            } else {
                me.refreshInnerState();
            }
        }
    },

    applyDocked: function(docked) {
        if (!docked) {
            return null;
        }

        //<debug>
        if (!/^(top|right|bottom|left)$/.test(docked)) {
            Ext.Logger.error("Invalid docking position of '" + docked.position + "', must be either 'top', 'right', 'bottom', " +
                "'left' or `null` (for no docking)", this);
            return;
        }
        //</debug>

        this.refreshInnerState = Ext.emptyFn;

        if (this.isPositioned()) {
            this.resetPositioned();
        }

        if (this.isCentered()) {
            this.setCentered(false);
        }

        this.setIsInner(false);

        delete this.refreshInnerState;

        return docked;
    },

    updateDocked: function(docked, oldDocked) {
        this.fireEvent('afterdockedchange', this, docked, oldDocked);
        if (!docked) {
            this.refreshInnerState();
        }
    },

    /**
     * Resets {@link #top}, {@link #right}, {@link #bottom} and {@link #left} configurations to `null`, which
     * will cause this component to stop being 'positioned' and to take its place in its owning container's
     * layout.
     */
    resetPositioned: function() {
        this.setTop(null);
        this.setRight(null);
        this.setBottom(null);
        this.setLeft(null);
    },

    refreshPositioned: function() {
        this.refreshPositionedOnInitialized = true;
    },

    doRefreshPositioned: function() {
        var me = this,
            positioned = true,
            floatingCls = this.getFloatingCls();

        if (me.isFloated() || (me.getTop() === null && me.getBottom() === null &&
            me.getRight() === null && me.getLeft() === null)) {
            positioned = false;
        } else {
            me.refreshSizeState();
        }

        if (positioned !== this.positioned) {
            me.positioned = positioned;

            if (positioned) {
                me.refreshInnerState = Ext.emptyFn;

                if (me.isCentered()) {
                    me.setCentered(false);
                }

                if (me.isDocked()) {
                    me.setDocked(false);
                }

                me.setIsInner(false);

                delete me.refreshInnerState;
            }

            me.element.toggleCls(floatingCls, positioned);

            if (me.initialized) {
                me.fireEvent('floatingchange', me, positioned);
                me.fireEvent('positionedchange', me, positioned);
            }

            if (!positioned) {
                me.refreshInnerState();
            }
        }
    },

    /**
     * Updates the floatingCls if the component is currently positioned
     * @private
     */
    updateFloatingCls: function(newFloatingCls, oldFloatingCls) {
        if (this.isPositioned()) {
            this.replaceCls(oldFloatingCls, newFloatingCls);
        }
    },

    applyDisabled: function(disabled) {
        return Boolean(disabled);
    },

    updateDisabled: function(disabled) {
        this.element.toggleCls(this.getDisabledCls(), disabled);
    },

    updateDisabledCls: function(newDisabledCls, oldDisabledCls) {
        if (this.isDisabled()) {
            this.element.replaceCls(oldDisabledCls, newDisabledCls);
        }
    },

    /**
     * Disables this Component
     */
    disable: function() {
       this.setDisabled(true);
    },

    /**
     * Enables this Component
     */
    enable: function() {
        this.setDisabled(false);
    },

    /**
     * Returns `true` if this Component is currently disabled.
     * @return {Boolean} `true` if currently disabled.
     */
    isDisabled: function() {
        return this.getDisabled();
    },

    applyZIndex: function(zIndex) {
        if (!zIndex && zIndex !== 0) {
            zIndex = null;
        }

        if (zIndex !== null) {
            zIndex = Number(zIndex);

            if (isNaN(zIndex)) {
                zIndex = null;
            }
        }

        return zIndex;
    },

    updateZIndex: function(zIndex) {
        var element = this.element,
            modal = !this.isFloated() && this.getModal(),
            domStyle;

        if (element && !element.destroyed) {
            domStyle = element.dom.style;
            if (zIndex !== null) {
                domStyle.setProperty('z-index', zIndex, 'important');
            }
            else {
                domStyle.removeProperty('z-index');
            }
        }
        if (modal) {
            modal.setZIndex(zIndex - 1);
        }
    },

    getInnerHtmlElement: function() {
        var innerHtmlElement = this.innerHtmlElement,
            styleHtmlCls;

        if (!innerHtmlElement || !innerHtmlElement.dom || !innerHtmlElement.dom.parentNode) {
            this.innerHtmlElement = innerHtmlElement = Ext.Element.create({ cls: 'x-innerhtml' });

            if (this.getStyleHtmlContent()) {
                styleHtmlCls = this.getStyleHtmlCls();
                this.innerHtmlElement.addCls(styleHtmlCls);
                this.innerElement.removeCls(styleHtmlCls);
            }
            this.innerElement.appendChild(innerHtmlElement);
        }

        return innerHtmlElement;
    },

    updateHtml: function(html) {
        if (!this.destroyed) {
            var innerHtmlElement = this.getInnerHtmlElement();

            if (Ext.isElement(html)){
                innerHtmlElement.setHtml('');
                innerHtmlElement.append(html);
            } else {
                innerHtmlElement.setHtml(html);
            }
        }
    },

    applyHidden: function(hidden) {
        return !!hidden;
    },

    updateHidden: function(hidden) {
        var me = this,
            element = me.renderElement,
            modal = me.getModal();

        if (modal) {
            if (me.isFloated()) {

                if (hidden) {
                    // Hiding a modal must move the modal back to below the next
                    // highest visible modal
                    modal = me.getFloatedStack('{getModal()}{isVisible()}')[0];
                    if (modal) {
                        modal.showModalMask();
                    } else {
                        me.hideModalMask();
                    }
                } else {
                    me.showModalMask();
                }
            } else {
                modal.setZIndex(me.getZIndex() - 1);
                if (modal.getHidden() !== hidden) {
                    modal.setHidden(hidden);
                }
            }
        }

        if (element && !element.destroyed) {
            if (hidden) {
                element.hide();
            } else {
                element.show();
            }
            element.toggleCls(me.getHiddenCls(), hidden);

            // Updating to hidden during config should not fire events
            if (!me.isConfiguring) {
                me.fireEvent(hidden ? 'hide' : 'show', me);
                me[hidden ? 'afterHide' : 'afterShow'](me);
            }
        }
    },

    updateHiddenCls: function(newHiddenCls, oldHiddenCls) {
        if (this.isHidden()) {
            this.element.replaceCls(oldHiddenCls, newHiddenCls);
        }
    },

    /**
     * Returns `true` if this Component is currently hidden.
     * @param {Boolean} [deep=false] `true` to check if this component
     * is hidden because a parent container is hidden.
     * @return {Boolean} `true` if currently hidden.
     */
    isHidden: function(deep) {
        var hidden = !!this.getHidden(),
            owner;

        if (!hidden && deep) {
            owner = this.getRefOwner();
            while (owner) {
                hidden = !!owner.getHidden();
                if (hidden) {
                    break;
                }
                owner = owner.getRefOwner();
            }
        }
        return hidden;
    },

    /**
     * Returns `true` if this Component is currently visible.
     * @param {Boolean} [deep=false] `true` to check if this component
     * is visible and all parents are also visible.
     * @return {Boolean} `true` if currently visible.
     */
    isVisible: function(deep) {
        return !this.isHidden(deep);
    },

    /**
     * Hides this Component optionally using an animation.
     * @param {Object/Boolean} [animation] You can specify an animation here or a bool to use the {@link #hideAnimation} config.
     * @return {Ext.Component}
     * @chainable
     */
    hide: function(animation) {
        var me = this,
            activeAnim = me.activeAnimation,
            modal;

        // Allow veto of hide.
        if (me.hasListeners.beforeshow && me.fireEvent('beforehide', me) === false) {
            return;
        }

        me.setCurrentAlignmentInfo(null);
        if (activeAnim) {
            activeAnim.on({
                animationend: function(){
                    me.hide(animation);
                },
                single: true
            });
            return me;
        }

        if (!me.getHidden()) {
            if (animation === undefined || (animation && animation.isComponent)) {
                animation = me.getHideAnimation();
            }
            if (animation) {
                if (animation === true) {
                    animation = 'fadeOut';
                }
                me.on({
                    beforehiddenchange: 'animateFn',
                    scope: this,
                    single: true,
                    args: [animation]
                });
            }
            me.setHidden(true);
        }

        // Hide the owned modal mask which positioned Components use to
        // implement modality.
        // Floated Components share a single modal mask that is owned by
        // their floatParent.
        if (!me.isFloated()) {
            modal = me.getModal();
            if (modal) {
                modal.setHidden(true);
            }
        }

        return me;
    },

    /**
     * Shows this component optionally using an animation.
     * @param {Object/Boolean} [animation] You can specify an animation here or a bool to use the {@link #showAnimation} config.
     * @return {Ext.Component}
     * @chainable
     */
    show: function(animation) {
        var me = this,
            hidden = me.getHidden(),
            floated = me.isFloated(),
            modal;

        // Allow veto of show.
        if (me.hasListeners.beforeshow && me.fireEvent('beforeshow', me) === false) {
            return;
        }

        me.beforeShow();

        if (me.activeAnimation) {
            me.activeAnimation.on({
                animationend: function(){
                    me.show(animation);
                },
                scope: me,
                single: true
            });
            return me;
        }

        if (hidden || hidden === null) {
            if (animation === true) {
                animation = 'fadeIn';
            }
            else if (animation === undefined || (animation && animation.isComponent)) {
                animation = me.getShowAnimation();
            }

            if (animation) {
                me.beforeShowAnimation();
                me.on({
                    beforehiddenchange: 'animateFn',
                    scope: me,
                    single: true,
                    args: [animation]
                });
            }

            me.setHidden(false);

            if (!animation && me.isFloated() && me.isCentered()) {
                me.renderElement.show();
                me.center();
            }
        }

        // Show the owned modal mask which positioned Components use to
        // implement modality.
        // Floated Components share a single modal mask that is owned by
        // their floatParent.
        if (!floated) {
            modal = me.getModal();
            if (modal) {
                modal.setHidden(false);
            }
        }

        return me;
    },

    beforeShowAnimation: function() {
        var me = this,
            element = me.element;

        if (element) {
            me.renderElement.show();
            element.removeCls(me.getHiddenCls());
            if (me.isFloated() && me.isCentered()) {
                me.center();
            }
        }
    },

    onAnimationStart: function(animation, data) {
        var me = this,
            fromTransform = data.from.transform,
            toTransform = data.to.transform;

        // If the animation is not controlling the position, we have to fix the position so that the before
        // and after position is our current position.
        if (me.isFloated() && fromTransform && toTransform && !(fromTransform.translateX | toTransform.translateX | fromTransform.translateY | toTransform.translateY)) {
            fromTransform.translateX = toTransform.translateX = me.getX();
            fromTransform.translateY = toTransform.translateY = me.getY();
        }
    },

    animateFn: function(animation, component, newState, oldState, controller) {
        var me = this;

        if (animation && (!newState || (newState && me.isPainted()))) {
            animation = me.activeAnimation = new Ext.fx.Animation(animation);
            animation.setElement(component.element);
            animation.on({
                animationstart: me.onAnimationStart,
                scope: me,
                single: true
            });

            if (!Ext.isEmpty(newState)) {
                animation.setOnEnd(function() {
                    me.activeAnimation = null;
                    controller.resume();

                    if (me.isFloated()) {
                        me.syncXYPosition();
                    }
                });

                controller.pause();
            }

            Ext.Animator.run(animation);
        }
    },

    /**
     * @private
     */
    setVisibility: function(isVisible) {
        this.renderElement.setVisible(isVisible);
    },

    /**
     * @private
     */
    isRendered: function() {
        return this.rendered;
    },

    /**
     * @private
     */
    isPainted: function() {
        return this.renderElement.isPainted();
    },

    /**
     * @private
     */
    applyTpl: function(config) {
        return (Ext.isObject(config) && config.isTemplate) ? config : new Ext.XTemplate(config);
    },

    applyData: function(data) {
        if (Ext.isObject(data)) {
            return Ext.apply({}, data);
        } else if (!data) {
            data = {};
        }

        return data;
    },

    /**
     * @private
     */
    updateData: function(newData) {
        var me = this;
        if (newData) {
            var tpl = me.getTpl(),
                tplWriteMode = me.getTplWriteMode();

            if (tpl) {
                tpl[tplWriteMode](me.getInnerHtmlElement(), newData);
            }

            /**
             * @event updatedata
             * Fires whenever the data of the component is updated
             * @param {Ext.Component} this The component instance
             * @param {Object} newData The new data
             */
            this.fireEvent('updatedata', me, newData);
        }
    },

    applyRecord: function(config) {
        if (config && Ext.isObject(config) && config.isModel) {
            return config;
        }
        return  null;
    },

    updateRecord: function(newRecord, oldRecord) {
        var me = this;

        if (oldRecord) {
            oldRecord.unjoin(me);
        }

        if (!newRecord) {
            me.updateData('');
        }
        else {
            newRecord.join(me);
            me.updateData(newRecord.getData(true));
        }
    },

    /**
     * @private
     * Used to handle joining of a record to a tpl
     */
    afterEdit: function() {
        this.updateRecord(this.getRecord());
    },

    /**
     * @private
     * Used to handle joining of a record to a tpl
     */
    afterErase: function() {
        this.setRecord(null);
    },

    /**
     * Returns this Component's xtype hierarchy as a slash-delimited string. For a list of all
     * available xtypes, see the {@link Ext.Component} header.
     *
     * __Note:__ If using your own subclasses, be aware that a Component must register its own xtype
     * to participate in determination of inherited xtypes.
     *
     * Example usage:
     *
     *     var t = new Ext.field.Text();
     *     alert(t.getXTypes());  // alerts 'component/field/textfield'
     *
     * @return {String} The xtype hierarchy string.
     */
    getXTypes: function() {
        return this.xtypesChain.join('/');
    },

    getDraggableBehavior: function() {
        var behavior = this.draggableBehavior;

        if (!behavior) {
            behavior = this.draggableBehavior = new Ext.behavior.Draggable(this);
        }

        return behavior;
    },

    applyDraggable: function(config) {
        this.getDraggableBehavior().setConfig(config);
    },

    getDraggable: function() {
        return this.getDraggableBehavior().getDraggable();
    },

    translateAxis: function(axis, value, animation) {
        var x, y;

        if (axis === 'x') {
            x = value;
        }
        else {
            y = value;
        }

        return this.translate(x, y, animation);
    },

    /**
     * Shows this component by another component. If you specify no alignment, it will automatically
     * position this component relative to the reference component.
     *
     * For example, say we are aligning a Panel next to a Button, the alignment string would look like this:
     *
     *     [panel-vertical (t/b/c)][panel-horizontal (l/r/c)]-[button-vertical (t/b/c)][button-horizontal (l/r/c)]
     *
     * where t = top, b = bottom, c = center, l = left, r = right.
     *
     * ## Examples
     *
     *  - `tl-tr` means top-left corner of the Panel to the top-right corner of the Button
     *  - `tc-bc` means top-center of the Panel to the bottom-center of the Button
     *
     * You can put a '?' at the end of the alignment string to constrain the positioned element to the
     * {@link Ext.Viewport Viewport}
     *
     *     // show `panel` by `button` using the default positioning (auto fit)
     *     panel.showBy(button);
     *
     *     // align the top left corner of `panel` with the top right corner of `button` (constrained to viewport)
     *     panel.showBy(button, "tl-tr?");
     *
     *     // align the bottom right corner of `panel` with the center left edge of `button` (not constrained by viewport)
     *     panel.showBy(button, "br-cl");
     *
     * @param {Ext.Component} component The target component to show this component by.
     * @param {String} alignment (optional) The specific alignment.
     * @param {Object} [options] An object containing options for the {@link Ext.util.Region#alignTo} method.
     */
    showBy: function(component, alignment, options) {
        var me = this,
            viewport = Ext.Viewport;

        // We may be called while visible, just for repositioning.
        if (!me.isVisible()) {
            me.setVisibility(false);

            if (viewport) {
                if (me.getParent() !== viewport) {
                    viewport.add(me);
                }
                me.on({
                    hide: 'onShowByErased',
                    destroy: 'onShowByErased',
                    single: true,
                    scope: me
                });
                viewport.on('resize', 'onViewportResize', me, { args: [component, alignment, options] });
            }

            me.show();
            me.setVisibility(true);
        }

        me.alignTo(component, alignment, options);
    },

    onAdded: function(parent, instanced) {
        var me = this,
            modal;

        me.callParent([parent, instanced]);

        if (!me.isFloated()) {
            modal = me.getModal();
            if (modal) {
                parent.insertBefore(modal, me);
                modal.setZIndex(me.getZIndex() - 1);
            }
        }
    },

    onViewportResize: function(component, alignment, options) {
        this.alignTo(component, alignment, options);
    },

    /**
     * @private
     * @param {Ext.Component} component
     */
    onShowByErased: function() {
        Ext.Viewport.un('resize', 'onViewportResize', this);
    },

    applyTooltip: function(tooltip) {
        var result;

        if (tooltip) {
            result = {
                target: this.el,
                trackMouse: true,
                anchor: false
            };

            if (typeof tooltip === 'string') {
                result.html = tooltip;
            } else {
                Ext.apply(result, tooltip);
            }
        }

        return result;
    },

    updateTooltip: function(tooltip, oldTooltip) {
        Ext.destroy(oldTooltip);
        if (tooltip) {
            tooltip = new Ext.tip.ToolTip(tooltip);
        }
        return tooltip;
    },

    applyModal: function(modal, currentModal) {
        if (this.isFloated()) {
            return !!modal;
        }

        var isVisible = true;

        if (modal === false) {
            modal = true;
            isVisible = false;
        }

        currentModal = Ext.factory(modal, Ext.Mask, typeof currentModal === 'boolean' ? null : currentModal);

        if (currentModal) {
            currentModal.setVisibility(isVisible);
        }

        return currentModal;
    },

    updateModal: function(modal) {
        var me = this,
            parent = me.getParent(),
            positionEl = (me.floatWrap || me.element).dom,
            topModal;

        if (me.isFloated()) {
            if (modal) {
                if (me.isVisible() && !positionEl.nextSibling) {
                    me.showModalMask();
                }
            } else {
                topModal = me.getFloatedStack('{getModal()}{isVisible()}')[0];
                
                if (topModal) {
                    topModal.showModalMask();
                }

                // Modal mask must now drop to below the next modal
                // below us, or hide.
                else {
                    me.hideModalMask();
                }
            }
        } else {
            if (parent) {
                if (modal) {
                    parent.insertBefore(modal, me);
                    modal.setZIndex(me.getZIndex() - 1);
                }
                else {
                    parent.remove(modal);
                }
            }
        }
    },

    updateHideOnMaskTap : function(hide) {
        if (!this.isFloated()) {
            var mask = this.getModal();

            if (mask) {
                mask[hide ? 'on' : 'un'].call(mask, 'tap', 'hide', this);
            }
        }
    },

    /**
     * Destroys this Component. If it is currently added to a Container it will first be removed from that Container.
     * All Ext.Element references are also deleted and the Component is de-registered from Ext.ComponentManager
     */
    destroy: function() {
        var me = this;

        // isDestroying added for compat reasons
        me.isDestroying = me.destroying = true;

        if (me.hasListeners.destroy) {
            me.fireEvent('destroy', me);
        }

        Ext.destroy(
            me.getModal(),
            me.getPlugins(),
            me.innerHtmlElement,
            me.scrollerElement,
            me.getScrollable()
        );
        
        me.setRecord(null);
        me.callParent();

        // Ensure mask is cleaned up and focus is taken care of(!)
        me.setHidden(true);

        // isDestroying added for compat reasons
        me.isDestroying = me.destroying = false;
    },

    privates: {
        doAddListener: function(name, fn, scope, options, order, caller, manager) {
            if (name == 'painted' || name == 'resize') {
                this.element.doAddListener(name, fn, scope || this, options, order);
            }

            this.callParent([name, fn, scope, options, order, caller, manager]);
        },

        doRemoveListener: function(name, fn, scope) {
            if (name == 'painted' || name == 'resize') {
                this.element.doRemoveListener(name, fn, scope);
            }

            this.callParent([name, fn, scope]);
        }
    },
    
    deprecated: {
        "6.1.0": {
            methods: {
                /**
                 * @method resetFloating
                 * @inheritdoc Ext.Component#resetPositioned
                 * @deprecated 6.1 Use {@link #resetPositioned} instead.
                 */
                resetFloating: 'resetPositioned'
            }
        }
    }
}, function() {
    //<debug>
    if (!document.querySelector('meta[name=viewport]')) {
        Ext.log.warn('Ext JS requires a viewport meta tag in order to function correctly on mobile devices.  Please add the following tag to the <head> of your html page: \n <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">');
    }
    //</debug>
});
