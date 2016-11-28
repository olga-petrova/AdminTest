/** */
Ext.define('Ext.tip.ToolTip', {
    extend: 'Ext.Panel',

    floated: true,
    
    ui: 'tooltip',

    hidden: true,

    shadow: true,

    border: true,

    anchor: false,

    config: {
        /**
         * @cfg {Ext.dom.Element} target The element who's mouseover event should trigger showing this ToolTip.
         */
        target: null,
        
        /**
         * @cfg {Boolean} [anchorToTarget=true] By default, the {@link #align} config aligns to the {@link #target}.
         *
         * Configure this as `false` if an anchor is required, but positioning is still relative to the pointer position on show..
         */
        anchorToTarget: true,

        /**
         * @cfg {String} [delegate] A selector which identifies child elements of the target which trigger showing this ToolTip.
         * The {@link #currentTarget} property is set to the triggering element.
         */
        delegate: null,

        /**
         * @cfg {String} [alignDelegate] A selector which identifies child elements of the  {@link #currentTarget} to
         * align to upon show.
         */
        alignDelegate: null,

        /**
         * @cfg {String} [align=l-r?] A string which specifies how this ToolTip is to align with regard to its
         * {@link #currentTarget} by means of identifying the point of the tooltip to join to the point of the target.
         *
         * By default, the tooltip shows at {@link #mouseOffset} pixels from the triggering pointer event.
         * Using this config anchors the ToolTip to its target instead.
         *
         * <pre>
         * Value  Description
         * -----  -----------------------------
         * tl     The top left corner (default)
         * t      The center of the top edge
         * tr     The top right corner
         * l      The center of the left edge
         * c      In the center of the element
         * r      The center of the right edge
         * bl     The bottom left corner
         * b      The center of the bottom edge
         * br     The bottom right corner
         * </pre>
         */
        align: 'l-r?',

        /**
         * @cfg {Boolean} [autoHide=true]
         * True to automatically hide the tooltip after the
         * mouse exits the target element or after the `{@link #dismissDelay}`
         * has expired if set.  If `{@link #closable} = true`
         * a close tool button will be rendered into the tooltip header.
         */
        autoHide: true,

        /**
         * @cfg {Boollean} [showOnTap=false]
         * On touch platforms, if {@link #showOnTap} is `true`, a tap on the target shows the tip.
         * In this case any {@link #showDelay} is ignored.
         *
         * This is useful for adding tips on elements which do not have tap listeners. It would
         * not be appropriate for a ToolTip on a {@link Ext.Button Button}.
         */
        showOnTap: null,

        /**
         * @cfg {Number} [showDelay=500]
         * Delay in milliseconds before the tooltip displays after the mouse enters the target element.
         *
         * On touch platforms, if {@link #showOnTap} is `true`, a tap on the target shows the tip,
         * and this timer is ignored - the tip is shown immediately.
         */
        showDelay: 500,

        /**
         * @cfg {Number} [hideDelay=300]
         * Delay in milliseconds after the mouse exits the target element but before the tooltip actually hides.
         * Set to 0 for the tooltip to hide immediately.
         */
        hideDelay: 300,

        /**
         * @cfg {Number} [dismissDelay=5000]
         * Delay in milliseconds before the tooltip automatically hides. To disable automatic hiding, set
         * dismissDelay = 0.
         */
        dismissDelay: 5000,

        /**
         * @cfg {Number[]} [mouseOffset=[15,18]]
         * An XY offset from the triggering pointer event position where the tooltip should be shown unless
         * aligned to the target element.
         */
        mouseOffset: [15, 18],

        /**
         * @cfg {Boolean} [trackMouse=false]
         * True to have the tooltip follow the mouse as it moves over the target element.
         *
         * Only effective on platforms with pointing devices, this does not address touch events.
         */
        trackMouse: false,

        /**
         * @cfg {Number} [quickShowInterval=250]
         * If a show is triggered within this number of milliseconds of this ToolTip being hidden, it shows
         * immediately regardless of the delay. If rapicly moving from target to target, this
         * ensure that each separate target does not get its own delay.
         */
        quickShowInterval: 250,

        /**
         * @cfg {Boolean} [allowOver=false]
         * Set to `true` to allow mouse exiting the target, but moving into the ToolTip to keep
         * the ToolTip visible. This may be useful for interactive tips.
         *
         * While the mouse is over the tip, the {@link dismissDelay dismiss timer} is inactive, so the tip
         * will not {@link #autoHide}.
         * 
         * On touch platforms, a touch on the tooltip is the equivalent, and this cancels the
         * dismiss timer so that a tap outside is then necessary to hide the tip.
         *
         * This is incompatible with the {@link #cfg-trackMouse} config.
         */
        allowOver: null
    },

    constructor: function(config) {
        var me = this;

        me.callParent([config]);

        /**
         * @property {Ext.dom.Fly} currentTarget
         * Only attached to a DOM element  when this ToolTip is active. The current target.
         * This is usually the {@link #cfg-target}, but if the {@link #cfg-delegate} option is used,
         * it may be a child element of the main target.
         */
        me.currentTarget = new Ext.dom.Fly();
    },

    applyAllowOver: function(allowOver) {
        var me = this;

        Ext.destroy(me.overListeners);

        // Use the mouseleave and mouseenter events because we do not need delegation
        if (allowOver) {
            me.overListeners = me.el.on({
                mouseenter: 'onTipOver',
                mouseleave: 'onTipOut',
                scope: me,
                destroyable: true
            });
        }

        return allowOver;
    },

    applyTarget: function(target) {
        return Ext.get(target.el || target);
    },

    applyAnchor: function(anchor) {
        var me = this,
            align;

        // Allow string anchor config to drive the alignment.
        if (typeof anchor === 'string') {
            align = me.anchorMap[anchor];
            if (align) {
                // In case the align config has not been processed yet, ensure we
                // have imported any configured value because we want a string
                // anchor property to override it.
                me.getAlign();

                me.setAlign(align);
                anchor = true;
            }
        }
        
        // If no anchor wanted, then align to triggering pointer event, not target
        if (!anchor) {
            me.setAnchorToTarget(anchor);
        }

        return anchor;
    },

    updateTarget: function(target, oldTarget) {
        var me = this,
            listeners;

        if (me.targetListeners) {
            me.targetListeners.destroy();
        }
        if (target) {
            listeners = {
                mouseover: 'onTargetOver',
                mouseout: 'onTargetOut',
                mousemove: 'onMouseMove',
                scope: me,
                destroyable: true
            };

            if (Ext.supports.Touch && me.getShowOnTap()) {
                listeners.tap = 'onTargetTap';
            }
            me.targetListeners = target.on(listeners);
        }
    },

    updateTrackMouse: function(trackMouse) {
        // If tracking mouse, allow mouse to enter the tooltip without triggering dismiss
        if (!this.getAnchor()) {
            this.setAllowOver(trackMouse);
        }
    },

    updateDisabled: function(disabled, oldDisabled) {
        this.callParent([disabled, oldDisabled]);
        if (disabled) {
            this.clearTimers();
            this.hide();
        }
    },
    
    updateShowOnTap: function(showOnTap) {
        if (Ext.supports.Touch && this.targetListeners) {
            this.getTarget()[showOnTap ? 'on' : 'un']('tap', 'onTargetTap', this);
        }
    },

    showBy: function(target, alignment, passedOptions) {
        var me = this,
            alignDelegate = me.getAlignDelegate(),
            currentTarget = me.currentTarget;

        // If we are trackMouse: true, we will be asked to show by a pointer event
        if (target.isEvent) {
            me.alignToEvent(target);
        }
        else {
            if (target.isElement) {
                currentTarget.attach(target.dom);
            } else if (target.nodeType) {
                currentTarget.attach(target);
            }
            me.callParent([alignDelegate ? target.child(alignDelegate, true) : target, alignment || me.getAlign(), passedOptions]);
        }
    },
    
    onViewportResize: function() {
        if (this.isVisible()) {
            this.showByTarget(this.currentTarget);
        }
    },

    show: function() {
        var me = this,
            dismissDelay = me.getDismissDelay();

        // A programmatic show should align to the target
        if (!me.currentTarget.dom) {
            return me.showByTarget(me.getTarget());
        }
        me.callParent();
        me.clearTimer('show');
        if (dismissDelay && me.getAutoHide()) {
            me.dismissTimer = Ext.defer(me.hide, dismissDelay, me);
        }
        me.toFront();
        Ext.getDoc().on('mousedown', me.onDocMouseDown, me);
    },

    hide: function() {
        var me = this;

        me.clearTimer('dismiss');
        me.callParent();
        me.lastHidden = new Date();
        me.currentTarget.detach();
        Ext.getDoc().un('mousedown', me.onDocMouseDown, me);
    },

    destroy: function() {
        this.callParent();
        this.clearTimers();
    },

    privates: {
        anchorMap: {
        // String anchor definitions to alignment specs.
            top: 't-b?',
            left: 'l-r?',
            right: 'r-l?',
            bottom: 'b-t?'
        },

        onDocMouseDown: function(e) {
            var me = this,
                delegate = me.getDelegate();

            if (e.within(me.el.dom)) {
                // A real touch event inside the tip is the equivalent of
                // mousing over the tip to keep it visible, so cancel the
                // dismiss timer.
                if (e.pointerType !== 'mouse' && me.getAllowOver()) {
                    me.clearTimer('dismiss');
                }
            }
            // Only respond to the mousedown if it's not on this tip, and it's not on a target.
            // If it's on a target, onTargetTap will handle it.
            else if (!me.getClosable()) {
                if (e.within(me.getTarget()) && (!delegate || e.getTarget(delegate))) {
                    me.delayHide();
                } else {
                    me.disable();
                    me.enableTimer = Ext.defer(me.enable, 100, me);
                }
            }
        },

        getConstrainRegion: function() {
            return this.callParent().adjust(5, -5, -5, 5);
        },

        onTargetOver: function(e) {
            var me = this,
                myTarget = me.getTarget(),
                delegate = me.getDelegate(),
                currentTarget = me.currentTarget,
                newTarget,
                myListeners = me.hasListeners;

            if (me.getDisabled()) {
                return;
            }

            if (delegate) {
                // Moving inside a delegate
                if (currentTarget.contains(e.target)) {
                    return;
                }
                newTarget = e.getTarget(delegate);
                // Move inside a delegate with no currentTarget
                if (newTarget && newTarget.contains(e.relatedTarget)) {
                    return;
                }
            }
            // Moved from outside the target
            else if (!myTarget.contains(e.relatedTarget)) {
                newTarget = myTarget.dom;
            }
            // Moving inside the target
            else {
                return;
            }

            // If pointer entered the target or a delegate child, then show.
            if (newTarget) {
                // If users need to see show events on target change, we must hide.
                if ((myListeners.beforeshow || myListeners.show) && me.isVisible()) {
                    me.hide();
                }

                me.pointerEvent = e;
                currentTarget.attach(newTarget);
                me.handleTargetOver();
            }
            // If over a non-delegate child, behave as in target out
            else if (currentTarget.dom) {
                me.handleTargetOut();
            }
        },

        handleTargetOver: function() {
            // Separated from onTargetOver so that subclasses can handle target over in any way.
            this.delayShow(this.currentTarget);
        },

        onTargetTap: function(e) {
            // On hybrid mouse/touch systems, we want to show the tip on touch, but
            // we don't want to show it if this is coming from a click event, because
            // the mouse is already hovered.
            if (e.pointerType !== 'mouse') {
                this.onTargetOver(e);
            }
        },

        onTargetOut: function(e) {
            // We have exited the current target
            if (this.currentTarget.dom && !this.currentTarget.contains(e.relatedTarget)) {
                this.handleTargetOut();
            }
        },

        handleTargetOut: function() {
            // Separated from onTargetOut so that subclasses can handle target out in any way.
            var me = this;

            if (me.showTimer) {
                me.clearTimer('show');
            }
            if (me.isVisible() && me.getAutoHide()) {
                me.delayHide();
            }
        },

        onTipOver: function() {
            this.clearTimer('hide');
            this.clearTimer('dismiss');
        },

        onTipOut: function() {
            this.handleTargetOut();
        },

        onMouseMove: function(e) {
            var me = this,
                dismissDelay = me.getDismissDelay();

            // Always update pointerEvent, so that if there's a delayed show
            // scheduled, it gets the latest pointer to align to.
            me.pointerEvent = e;
            if (me.isVisible() && me.currentTarget.contains(e.target)) {
                // If they move the mouse, restart the dismiss delay
                if (dismissDelay && me.getAutoHide() !== false) {
                    me.clearTimer('dismiss');
                    me.dismissTimer = Ext.defer(me.hide, dismissDelay, me);
                }

                if (me.getTrackMouse())  {
                    me.alignToEvent(e);
                }
             }
        },

        delayShow: function(target) {
            var me = this;

            me.clearTimer('hide');
            if (me.getHidden() && !me.showTimer) {
                // Allow rapid movement from delegate to delegte to show immediately
                if (me.getDelegate() && Ext.Date.getElapsed(me.lastHidden) < me.getQuickShowInterval()) {
                    me.showByTarget(target);
                } else {
                    // If a tap event triggered, do not wait. Show immediately.
                    me.showTimer = Ext.defer(me.showByTarget, me.pointerEvent.pointerType !== 'mouse' ? 0 : me.getShowDelay(), me, [target]);
                }
            }
            else if (!me.getHidden() && me.getAutoHide() !== false) {
                me.showByTarget(target);
            }
        },

        showByTarget: function(target) {
            var me = this;

            // Show by the correct thing.
            // If trackMouse, or we are not anchored to the target, then it's the current pointer event.
            // Otherwise it's either the current target, or the alignDelegate within that.
            me.showBy(me.getAnchorToTarget() && !me.getTrackMouse() ? target : me.pointerEvent, me.getAlign(), {overlap: me.getTrackMouse() && !me.getAnchor()});
        },

        delayHide: function() {
            var me = this;

            if (!me.isHidden() && !me.hideTimer) {
                me.clearTimer('dismiss');
                me.hideTimer = Ext.defer(me.hide, me.getHideDelay(), me);
            }
        },

        alignToEvent: function(event) {
            var me = this,
                options = {
                    // Allow the "exclusion area", the zone of mouseOffset
                    // created as a Region around the mouse to overlap
                    // the tip position.
                    overlap: me.getTrackMouse() && !me.getAnchor()
                },
                align,
                mouseOffset = me.getMouseOffset(),
                target = event.getPoint().adjust(-mouseOffset[1], mouseOffset[0], mouseOffset[1], -mouseOffset[0]);

            // The anchor must point to the mouse
            if (me.getAnchor()) {
                align = me.getAlign();
            }
            else {
                if (mouseOffset[0] > 0) {
                    if (mouseOffset[1] > 0) {
                        align = 'tl-br?';
                    } else {
                        align = 'bl-tr?';
                    }
                } else {
                    if (mouseOffset[1] > 0) {
                        align = 'tr-bl?';
                    } else {
                        align = 'br-tl?';
                    }
                }
            }

            if (me.isVisible()) {
                me.alignTo(target, align, options);
            } else {
                me.showBy(target, align, options);
            }
        },

        _timerNames: {},

        clearTimer: function (name) {
            var me = this,
                names = me._timerNames,
                propName = names[name] || (names[name] = name + 'Timer'),
                timer = me[propName];

            if (timer) {
                clearTimeout(timer);
                me[propName] = null;
            }
        },

        /**
         * @private
         */
        clearTimers: function() {
            var me = this;
            me.clearTimer('show');
            me.clearTimer('dismiss');
            me.clearTimer('hide');
            me.clearTimer('enable');
        },

        clipTo: function(clippingEl, sides) {
        // Override because we also need to clip the anchor
            var clippingRegion;

            // Allow a Region to be passed
            if (clippingEl.isRegion) {
                clippingRegion = clippingEl;
            } else {
                clippingRegion = (clippingEl.isComponent ? clippingEl.el : Ext.fly(clippingEl)).getConstrainRegion();
            }

            this.callParent([clippingRegion, sides]);

            // Clip the anchor to the same bounds
            this.tipElement.clipTo(clippingRegion, sides);
        }
    }
});
