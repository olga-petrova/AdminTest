/**
 * This is the base class for a file object. This one should be extended
 * by classes that generate content based on templates.
 */
Ext.define('Ext.exporter.file.Base', {
    extend: 'Ext.exporter.data.Base',

    requires: [
        'Ext.XTemplate'
    ],

    tpl: null,

    destroy: function(){
        this.tpl = null;
        this.callParent();
    },

    /**
     * Renders the content according to the template provided to the class
     *
     * @returns {String}
     */
    render: function(){
        return this.tpl ? Ext.XTemplate.getTpl(this, 'tpl').apply(this.getRenderData()) : '';
    },

    /**
     * Return the data used when rendering the template
     *
     * @returns {Object}
     */
    getRenderData: function(){
        return this.getConfig();
    }
});