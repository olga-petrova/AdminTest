/**
 * A mixin for Components that need to interact with the keyboard.
 * @private
 */
Ext.define('Ext.util.KeyboardInteractive', {
    extend: 'Ext.Mixin',
    
    mixinConfig: {
        id: 'keyboardinteractive'
    },
    
    config: {
        /**
         * @cfg {Object} keyMap An object containing handlers for keydown events, keyed
         * by a string which describes the key. This may be a letter, or a textual key
         * name as documented at {@link Ext.event.Event}. This may be preceded by
         * key modifiers such as `CTRL+`, `ALT+` or `SHIFT+`.
         *
         * The handlers may be in a ViewController.
         *
         * Key modifer keys can be specified by prepending the modifier
         * name to the key name separated by `+`
         *
         * Valid modifier names are:
         *
         * - Command (or Cmd for short)
         * - Control (or Ctrl for short)
         * - CommandOrControl (or CmdOrCtrl for short)
         * - Alt
         * - Shift
         *
         * The method names are interpreted in the same way that event
         * listener names are interpreted.
         *
         * For example:
         *
         *      Ext.define('MyChartPanel', {
         *          extend: 'Ext.panel.Panel',
         *
         *          controller: 'mycontrollertype',
         *
         *          // Map keys to methods.
         *          keyMap: {
         *              // These go to a controller.
         *              ENTER: 'onEnterKey',
         *              "ALT+PRINT_SCREEN": 'doScreenshot',
         *
         *              // CMD on OSX, CTRL on Linux/Windows.
         *              "CMDORCTRL+C": 'doCopy',
         *              
         *              // This one is handled by a class method.
         *              ESC: {
         *                  handler: 'destroy',
         *                  scope: 'this'
         *              }
         *          }
         *      });
         * 
         * @cfg {String} [keyMap.scope] The default scope to apply to key handlers
         * which are specified as strings with no scope. This is processed the same way as
         * scope of {@link #cfg-listeners}. It defaults to this
         * Component's ViewController, but using `'this'` means
         * that an instance method will be used.
         * @cfg {String} [keyMap.event=keydown] The name of the event to listen to.
         * @cfg {String} [keyMap.target] By default the listener is added to this
         * Component's encapsulating element. The `target` may be the name of a
         * property to add the listener to (eg: `'inputEl'`), or `'this'` to add the listener
         * directly to this Component.
         * @cfg {String} [keyMap.processEvent] A method name through which to process a
         * custom event signature to return an event object. This may be used if the
         * event listened to does not return a key event as the first argument.
         *
         */
        keyMap: {
            $value: null,
            lazy: true,
            options: {
                target: 1,
                event: 1,
                disabled: 1
            },
            merge: function (value, baseValue, cls, mixin) {
                // Allow nulling out parent class config
                if (value === null) {
                    return value;
                }
                
                var ret = baseValue ? Ext.Object.chain(baseValue) : {},
                    key, ucKey, v, vs;
                
                for (key in value) {
                    if (key === 'scope') {
                        // Scope gets copied into the individual entries so skip
                        continue;
                    }

                    v = value[key];
                    ucKey = key.toUpperCase();
                    if (mixin) {
                        if (ucKey in ret) {
                            // Entries from mixins should be skipped if the target
                            // already has that key.
                            continue;
                        }
                    }

                    // Options are copied in directly
                    if (this.options[key]) {
                        ret[key] = v;
                    }
                    
                    // For non-options, we promote to an object so we can always
                    // store the scope.
                    else {
                        if (typeof v === 'string' || typeof v === 'function') {
                            v = {
                                handler: v
                            };
                        } else {
                            v = Ext.clone(v);
                            v.handler = v.handler || v.fn;
                        }
                    
                        vs = v.scope || value.scope || 'self';
                        
                        v.scope = (vs === 'controller') ? 'self.controller' : vs;
                        ret[ucKey] = v;
                    }
                }
                return ret;
            }
        }
    },

    options: {
        scope: 1,
        target: 1,
        event: 1,
        disabled: 1
    },

    initKeyMap: function(eventSource) {
        var me = this,
            keyMap, target, event, listeners, handler;
        
        // Avoid unnecessary loops
        me.$initKeyMap = true;
        keyMap = me.getKeyMap();
        delete me.$initKeyMap;

        if (keyMap) {
            target = keyMap.target;
            event = keyMap.event || 'keydown';

            // Allow eg
            // keyMap: {
            //     target: 'this'
            //     event: 'cellclick,
            //     processEvent: function(this, td, cellIndex, record, tr, rowIndex, e) {
            //         return e;
            //     }
            // }
            if (target) {
                if (target === 'this') {
                    eventSource = me;
                } else {
                    eventSource = me[keyMap.target];
                    if (typeof eventSource === 'function') {
                        eventSource = eventSource.call(me);
                    }
                }
            }

            // In the majority of cases, the keyMap config will be processed
            // at the component creation time, but the focusEl is only going to be
            // available after rendering. Make sure we attach the keydown listener
            // when that happens.
            // The loop is just to check that the keyMap object is not empty.
            for (handler in keyMap) {
                listeners = {
                    scope: me,
                    destroyable: true
                };
                if (me.eventListener) {
                    me.eventListener.destroy();
                }
                listeners[event] = me.handleEvent;
                me.eventListener = eventSource.on(listeners);
                break;
            }
        }
    },

    applyKeyMap: function(keyMap) {
        var me = this,
            defaultScope = keyMap.scope || 'controller',
            key, mapping;

        if (keyMap) {
            for (key in keyMap) {
                mapping = keyMap[key];

                // Skip scope, target and event.
                if (key in me.options) {
                    continue;
                }
                key = key.toUpperCase();

                //<debug>
                // Only do validation at init time in debug mode.
                // Map eg 'DELETE' -> 46, and if no match, parse the key.
                // Only parse keys such as 'Ctrl+A' or 'alt+print_screen'.
                // Handle 'processEvent' as a handler so they can scope it.
                if (key !== 'PROCESSEVENT') {
                    var keySpec = key.split('+'),
                        valid = true;

                    // Check for leading keyFlags CTRL/ALT/
                    for (var i = 0; valid && i < keySpec.length - 1; i++) {
                        valid = valid || Ext.event.Event.keyFlags[keySpec[i]];
                    }
                    if (!valid || !Ext.event.Event[keySpec[i]]) {
                        Ext.raise('Invalid kepMap key specification "' + key + '"');
                    }
                }
                //</debug>

                if (typeof mapping === 'string' || typeof mapping === 'function') {
                    mapping = {
                        handler: mapping,
                        scope: defaultScope
                    };
                } else {
                    mapping = {
                        handler: mapping.handler || mapping.fn,
                        scope: mapping.scope || defaultScope
                    };
                }

                // So we end up with an object like this:
                // "ALT+PRINT_SCREEN": {
                //     handler: 'doSummat',
                //     scope: 'this'
                // }
                // Key names are reconstructed from event signature at event time.
                // TODO: then how to handle "Ctrl+alt+a" and "alt+ctrl+a"?
                // that would mean parsing them at init time and standardising them :(
                keyMap[key] = mapping;
            }
        }
        return keyMap;
    },

    updateKeyMap: function(keyMap) {
        var me = this;

        // It is possible that key bindings were configured after
        // the component was rendered (and initKeyMap called),
        // so make sure that we have the keydown handler attached.
        if (me.rendered && !me.destroyed && !me.destroying && !me.$initKeyMap) {
            me.initKeyMap(me.el);
        }
    },
    
    enableKeyMap: function() {
        var keyMap = this.getKeyMap();
        
        if (keyMap) {
            keyMap.disabled = false;
        }
    },
    
    disableKeyMap: function() {
        var keyMap = this.getKeyMap();
        
        if (keyMap) {
            keyMap.disabled = true;
        }
    },

    handleEvent: function(e) {
        var me = this,
            browserEvent = e.browserEvent,
            keyMap = me.getKeyMap(),
            processEvent = keyMap.PROCESSEVENT,
            keyMap, key, mapping, keySpec, i;
        
        if (!keyMap || keyMap.disabled) {
            return;
        }

        // Feed the event arguments through the processEvent mapping, resolving it
        // in the same way as key handlers.
        if (processEvent) {
            e = Ext.callback(processEvent.handler, processEvent.scope, arguments, me, me);
        }

        for (key in keyMap) {
            // Skip scope, target, event and processEvent.
            if (key in me.options || key === 'PROCESSEVENT') {
                continue;
            }

            mapping = keyMap[key];
            
            if (!mapping.keyCode) {
                
                // ['CTRL', 'ALT', 'SHIFT', 'PRINT_SCREEN']
                keySpec = key.split('+');

                // Set the ctrlKey, altKey, shiftKey flags
                for (i = 0; i < keySpec.length - 1; i++) {
                    mapping[Ext.event.Event.keyFlags[keySpec[i]]] = true;
                }
                
                // Set the keyCode from the 'PRINT_SCREEN' key name.
                mapping.keyCode = Ext.event.Event[keySpec[i]];
            }

            // If the key code and the modifier flags match, call the handler
            // Cast the mapping's flag because they will be undefined if not true.
            // Case metaKey because it's undefined on some platforms.
            if (e.keyCode === mapping.keyCode &&
                    browserEvent.ctrlKey            === Boolean(mapping.ctrlKey)  &&
                    browserEvent.altKey             === Boolean(mapping.altKey)   &&
                    browserEvent.shiftKey           === Boolean(mapping.shiftKey) &&
                    Boolean(browserEvent.metaKey)   === Boolean(mapping.metaKey)) {
                return Ext.callback(mapping.handler, mapping.scope, [e, me], me, me); // It's all about me!
            }
        }
    }
});
