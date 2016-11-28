Ext.define('Ext.overrides.scroll.DomScroller', {
    override: 'Ext.scroll.DomScroller',

    _scrollerCls: Ext.baseCSSPrefix +  'domscroller',

    updateElement: function (element, oldElement) {
        element.addCls(this._scrollerCls);

        this.callParent([ element, oldElement ]);
    },

    updateSize: function (size) {
        var element = this.component && this.component.innerElement;

        if (element) {
            this.positionDirty = true;
            
            if (size) {
                element.setWidth(size.x).setHeight(size.y);
            } else {
                element.setWidth(null).setHeight(null);
            }
        } else {
            this.callParent([size]);
        }
    }
});
