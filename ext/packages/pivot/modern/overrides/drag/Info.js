Ext.define('Ext.overrides.drag.Info', {
    override: 'Ext.drag.Info',

     /**.
     * Find the element that matches the cursor position and selector.
     *
     * @param {String} selector The simple selector to test. See {@link Ext.dom.Query} for information about simple selectors.
     * @param {Number/String/HTMLElement/Ext.dom.Element} [limit]
     * The max depth to search as a number or an element that causes the upward
     * traversal to stop and is **not** considered for inclusion as the result.
     * (defaults to 50 || document.documentElement)
     * @param {Boolean} [returnDom=false] True to return the DOM node instead of Ext.dom.Element
     * @return {Ext.dom.Element/HTMLElement} The matching DOM node (or HTMLElement if
     * _returnDom_ is _true_).  Or null if no match was found.
     */
    getCursorElement: function(selector, limit, returnDom){
         var pos = this.cursor.current,
             elPoint = Ext.drag.Manager.elementFromPoint(pos.x, pos.y);

         return Ext.fly(elPoint).up(selector, limit, returnDom);
    }

});