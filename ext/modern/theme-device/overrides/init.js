// We use this override to force this file to be loaded before any other classes get
// processed, this allows us to adjust platform tags prior to any platformConfig processing.
// @override Ext.env.Ready

Ext.namespace('Ext.theme.is')['theme-device'] = true;
Ext.theme.name = 'theme-device';

// Create defaults for manifest properties
Ext.manifest.material = Ext.manifest.material || {};
Ext.manifest.material.toolbar = Ext.manifest.material.toolbar || {};


// Need to add platformTags prior to ready
// Material will be used on any device that is not ios.
// to use material on iOS the user should specify a deviceTheme of material in the app.json
if (Ext.platformTags.material == undefined) {
    Ext.platformTags.material = !Ext.platformTags.ios || Ext.manifest.material.ios;
}

if (Ext.platformTags.android && Ext.platformTags.chrome) {
    var color = Ext.manifest.material.toolbar.color,
        toolbarIsDynamic = Ext.manifest.material.toolbar.dynamic,
        head = document.head, meta;

    if (toolbarIsDynamic && Ext.supports.CSSVariables) {
        color = getComputedStyle(document.body).getPropertyValue('--primary-color-md');
        color = color.replace(/ /g, '').replace(/^#(?:\\3)?/, '#');
    }

    if (color) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'theme-color');
        meta.setAttribute('content', color);
        head.appendChild(meta);
    }
}

Ext.onReady(function () {
    var cls = Ext.platformTags.material ? 'x-md' : 'x-iost';
    document.body.classList.add(cls);
});
