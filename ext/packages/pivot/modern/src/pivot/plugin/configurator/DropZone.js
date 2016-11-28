/**
 * @private
 */
Ext.define('Ext.pivot.plugin.configurator.DropZone', {
    extend: 'Ext.drag.Target',

    groups: 'pivotfields',

    leftIndicatorCls: Ext.baseCSSPrefix + 'pivot-grid-left-indicator',
    rightIndicatorCls: Ext.baseCSSPrefix + 'pivot-grid-right-indicator',
    listItemSelector: '.' + Ext.baseCSSPrefix + 'list-item',
    listSelector: '.' + Ext.baseCSSPrefix + 'list',

    constructor: function(list){
        this.list = list;
        this.callParent([{
            element: list.getScrollable().getElement()
        }]);
    },

    getLeftIndicator: function() {
        if (!this.leftIndicator) {
            this.self.prototype.leftIndicator = Ext.getBody().createChild({
                cls: this.leftIndicatorCls,
                html: "&#160;"
            });
            this.self.prototype.indicatorWidth = this.leftIndicator.dom.offsetWidth;
            this.self.prototype.indicatorOffset = Math.round(this.indicatorWidth / 2);
        }
        return this.leftIndicator;
    },

    getRightIndicator: function() {
        if (!this.rightIndicator) {
            this.self.prototype.rightIndicator = Ext.getBody().createChild({
                cls: this.rightIndicatorCls,
                html: "&#160;"
            });
        }
        return this.rightIndicator;
    },

    accepts: function(info){
        var record = info.data.record;

        if(!record){
            return true;
        }

        return record.get('field').getSettings().isAllowed(this.list);
    },

    onDragEnter: function(info){
        info.setData('targetList', this.list);
    },

    onDragMove: function(info){
        if(info.valid) {
            this.positionIndicator(info);
        }else{
            this.hideIndicators();
        }
    },

    onDragLeave: function(info){
        info.setData('targetList', null);
        this.hideIndicators();
    },

    onDrop: function(info){
        var data = info.data,
            panel = this.list.up('pivotconfigpanel');

        this.hideIndicators();

        if(!panel){
            return;
        }

        panel.dragDropField(data.sourceList, data.targetList, data.record, data.position);
    },

    positionIndicator: function(info){
        var me = this,
            pos = -1,
            leftIndicator = me.getLeftIndicator(),
            rightIndicator = me.getRightIndicator(),
            indWidth = me.indicatorWidth,
            indOffset = me.indicatorOffset,
            el, item, leftXY, rightXY, minX, maxX, minY, maxY,
            leftAnchor, rightAnchor;

        el = info.getCursorElement(me.listItemSelector);
        if(el){
            item = el.component;
            leftAnchor = 'tl';
            rightAnchor = 'tr';
            pos = item.$dataIndex;
        }else{
            leftAnchor = 'bl';
            rightAnchor = 'br';
            pos = me.list.getViewItems().length;
            item = me.list.getItemAt(pos - 1);

            if(item){
                el = item.element;
            }else{
                el = info.getCursorElement(me.listSelector);
            }

        }

        leftXY = leftIndicator.getAlignToXY(el, leftAnchor);
        rightXY = rightIndicator.getAlignToXY(el, rightAnchor);

        leftXY[0] -= 1;
        rightXY[0] -= indWidth;
        if(leftAnchor === 'tl') {
            leftXY[1] -= indWidth;
            rightXY[1] -= indWidth;
        }

        minX = minY = - indOffset;

        minX += el.getX();
        maxX =  minX + el.getWidth();
        minY += el.getY();
        maxY = minY + el.getHeight();

        leftXY[0] = Ext.Number.constrain(leftXY[0], minX, maxX);
        rightXY[0] = Ext.Number.constrain(rightXY[0], minX, maxX);
        leftXY[1] = Ext.Number.constrain(leftXY[1], minY, maxY);
        rightXY[1] = Ext.Number.constrain(rightXY[1], minY, maxY);

        leftIndicator.show();
        rightIndicator.show();
        leftIndicator.setXY(leftXY);
        rightIndicator.setXY(rightXY);

        info.setData('position', pos);
    },

    hideIndicators: function(){
        this.getLeftIndicator().hide();
        this.getRightIndicator().hide();
    }


});