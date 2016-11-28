/**
 * Date utility methods.
 */
Ext.define('Ext.calendar.date.Util', {
    singleton: true,

    /**
     * Clear the time portion of a date as UTC.
     * @param {Date} d The date.
     * @param {Boolean} [clone=false] `true` to create a copy of the passed date
     * and not modify it directly.
     * @return {Date} The date. This will be the original date instance if
     * `clone` was not set.
     */
    clearTimeUtc: function(d, clone) {
        if (clone) {
            d = Ext.Date.clone(d);
        }

        d.setUTCHours(0);
        d.setUTCMinutes(0);
        d.setUTCSeconds(0);
        d.setUTCMilliseconds(0);

        return d;
    }
});