/**
 * @private
 */
Ext.define('Ext.exporter.file.ooxml.Relationship', {
    extend: 'Ext.exporter.file.Base',

    isRelationship: true,

    config: {
        idPrefix: 'rId',

        schema: '',

        target: ''
    },

    tpl: [
        '<Relationship Id="{id}" Type="{schema}" Target="{target}"/>'
    ]
});