/**
 * This class provides theming functionality for events in the calendar.
 */
Ext.define('Ext.calendar.theme.Theme', {
    singleton: true,

    requires: ['Ext.calendar.theme.Color'],

    /**
     * @property {String[]} colors
     * The list of primary colors to use for events. These colors
     * will be used as defaults  if the event or owning calendar
     * does not specify a color.
     */
    colors: [
        'rgb(44,151,222)',
        'rgb(233,75,53)',
        'rgb(30,206,109)',
        'rgb(156,86,184)',
        'rgb(60,214,220)',
        'rgb(232,126,3)',
        'rgb(0,189,156)'
    ],

    /**
     * @property {String} lightColor
     * A complementary color to be used when the primary color is dark.
     */
    lightColor: 'rgb(238,238,238)',

    /**
     * @property {String} darkColor
     * A complementary color to be used when the primary color is light.
     */
    darkColor: 'rgb(34,34,34)',

    /**
     * Gererates a color palette from a base color. To be
     * overriden when providing custom implementations.
     * @param {Object} color The base color.
     * @param {Number} color.r The red component.
     * @param {Number} color.g The green component.
     * @param {Number} color.b The blue component.
     * @return {Ext.calendar.theme.Palette} The color palette.
     *
     * @protected
     */
    generatePalette: function(color) {
        var light = this.lightColor,
            dark = this.darkColor;

        return {
            primary: color.toString(),
            secondary: color.getBrightness() > 70 ? dark : light,
            border: color.createDarker(0.2).toString()
        }
    },

    /**
     * Get the base color for a calendar. If one has been previously generated, use
     * that, otherwise get the next available base color from the specified color sequence.
     * @param {Ext.data.Model} calendar The calendar.
     * @return {String} The color.
     */
    getBaseColor: function(calendar) {
        var me = this,
            map = me.idMap,
            colors = me.colors,
            id = calendar.id,
            color;

        color = map[id];
        if (!color) {
            color = colors[me.current % colors.length];
            map[id] = color;
            ++me.current;
        }
        return color;
    },

    /**
     * Gets a palette for a base color.
     * @param {String} color The base color.
     * @return {Ext.calendar.theme.Palette} The color palette.
     */
    getPalette: function(color) {
        var map = this.colorMap,
            palette = map[color],
            o;

        if (!palette) {
            o = Ext.calendar.theme.Color.fromString(color);
            map[color] = palette = this.generatePalette(o);
        }

        return palette;
    },

    privates: {
        /**
         * @property {Object} colorMap
         * A map of color strings to palettes.
         *
         * @private
         */
        colorMap: {},

        /**
         * @property {Object} idMap
         * A map of calendar id to color.
         *
         * @private
         */
        idMap: {},

        /**
         * @property {Number} current
         * The current index to pull the latest color from.
         *
         * @private
         */
        current: 0,

        /**
         * React to calendar id changing, update the internal map with
         * the new id.
         * @param {Object} newId The new id.
         * @param {Object} oldId The old id.
         *
         * @private
         */
        onIdChanged: function(newId, oldId) {
            var map = this.idMap,
                val = map[oldId];

            if (val) {
                delete map[oldId];
                map[newId] = val;
            }

        }
    }
});