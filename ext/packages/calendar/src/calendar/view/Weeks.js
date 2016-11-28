/** 
 * This view shows a series of weeks. The view shows a summary of 
 * the events that occur on each day. The view starts based on the {@link #value}
 * and the amount of days shown is configured by the {@link visibleDays} and 
 * {@link #visibleWeeks} configurations.
 */
Ext.define('Ext.calendar.view.Weeks', {
    extend: 'Ext.calendar.view.Base',
    xtype: 'calendar-weeksview',

    requires: [
        'Ext.calendar.view.WeeksRenderer',
        'Ext.calendar.date.Range'
    ],

    uses: [
        'Ext.calendar.dd.WeeksSource',
        'Ext.calendar.dd.WeeksTarget'
    ],

    isWeeksView: true,

    baseCls: Ext.baseCSSPrefix + 'calendar-weeks',

    config: {
        /**
         * @cfg {Boolean} addOnSelect
         * `true` to show the {@link #addForm} when a selection is made on the body.
         */
        addOnSelect: true,

        /**
         * @cfg {Boolean} allowSelection
         * `true` to allow days to be selected via the UI.
         */
        allowSelection: true,

        /**
         * @inheritdoc
         */
        compactOptions: {
            overflowText: '+{0}',
            showOverflow: 'top'
        },

        //<locale>
        /**
         * @cfg {String} dayFormat
         * The format for displaying the day in the cell.
         * See {@link Ext.Date} for options.
         */
        dayFormat: 'j',
        //</locale>

        //<locale>

        /**
         * @cfg {Boolean} draggable
         * `true` to allows events to be dragged from this view.
         */
        draggable: true,

        /**
         * @cfg {Boolean} droppable
         * `true` to allows events to be dropped on this view.
         */
        droppable: true,
        
        /**
         * @cfg {Number} firstDayOfWeek
         * The day on which the calendar week begins. `0` (Sunday) through `6` (Saturday).
         * Defaults to {@link Ext.Date#firstDayOfWeek}
         */
        firstDayOfWeek: undefined,

        //<locale>
        /**
         * @cfg {String} overflowText
         * Text to show when events overflow on a particular today to allow the user to view
         * the rest. This string is evaluated as a formatted string where the argument is
         * the number of overflowing events. Depends the {@link showOverflow}.
         */
        overflowText: '+{0} more',
        //</locale>

        /**
         * @cfg {String} showOverflow
         * Show an overflow label that will display an overlay when
         * there are too many events to render in the view. Valid
         * configurations are:
         * - `top`
         * - `bottom`
         *
         * Pass `null` or `''` to not show overflow.
         */
        showOverflow: 'bottom',

        /**
         * @cfg {Date} [value=new Date()]
         * The start of the date range to show. The visible range of the view will begin
         * at the {@link #firstDayOfWeek} immediately preceding this value, or the value if
         * it is the {@link #firstDayOfWeek}. For example, using the following configuration:
         *
         *      {
         *          firstDayOfWeek: 0, // Sunday
         *          value: new Date(2010, 2, 3) // Wed, 3 March 2010
         *      }
         *
         * The visible range would begin on Sun 28th Feb.
         */
        value: undefined,

        /**
         * @cfg {Number} visibleDays
         * The number of days to show in a week, starting from the {@link #firstDayOfWeek}.
         * For example, to show the view with days `Mon - Fri`, use:
         *
         *      {
         *          visibleDays: 5,
         *          firstDayOfWeek: 1 // Monday
         *      }
         */
        visibleDays: 7,

        /**
         * @cfg {Number} [visibleWeeks=2]
         * The number of weeks to show in this view.
         */
        visibleWeeks: 2,

        /**
         * @cfg {Number[]} weekendDays
         * The days of the week that are the weekend. `0` (Sunday) through `6` (Saturday).
         * Defaults to {@link Ext.Date#weekendDays}.
         */
        weekendDays: undefined
    },

    /**
     * @event beforeeventdragstart
     * Fired before an event drag begins. Depends on the {@link #draggable} config.
     * @param {Ext.calendar.view.Weeks} this This view.
     * @param {Object} context The context.
     * @param {Ext.calendar.model.EventBase} context.event The event model.
     *
     * Return `false` to cancel the drag.
     */
    
    /**
     * @event eventdrop
     * Fired when an event drop is complete.
     * Depends on the {@link #droppable} config.
     * @param {Ext.calendar.view.Weeks} this The view.
     * @param {Object} context The context.
     * @param {Ext.calendar.model.EventBase} context.event The event model.
     * @param {Ext.calendar.date.Range} context.newRange The new date range.
     */
    
    /**
     * @event validateeventdrop
     * Fired when an event is dropped on this view, allows the drop
     * to be validated. Depends on the {@link #droppable} config.
     * @param {Ext.calendar.view.Weeks} this The view.
     * @param {Object} context The context.
     * @param {Ext.calendar.model.EventBase} context.event The event model.
     * @param {Ext.calendar.date.Range} context.newRange The new date range.
     * @param {Ext.Promise} context.validate A promise that allows validation to occur.
     * The default behavior is for no validation to take place. To achieve asynchronous
     * validation, the promise on the context object must be replaced:
     *
     *     {
     *         listeners: {
     *             validateeventdrop: function(view, context) {
     *                 context.validate = context.then(function() {
     *                     return Ext.Ajax.request({
     *                         url: '/checkDrop'
     *                     }).then(function(response) {
     *                         if (response.responseText === 'ok') {
     *                             return Promise.resolve();
     *                         } else {
     *                             return Promise.reject();
     *                         }
     *                     });
     *                 });
     *             }
     *         }
     *     }
     */

    constructor: function(config) {
        var me = this;
        
        me.callParent([config]);

        me.el.on('tap', 'handleEventTap', me, {
            delegate: '.' + me.$eventCls
        });

        me.cellTable.on('click', 'onOverflowClick', me, {
            delegate: '.' + me.$overflowCls
        });

        me.recalculate();
        me.refreshHeaders();
    },

    /**
     * @inheritdoc
     */
    getDisplayRange: function() {
        var me = this,
            D = Ext.Date,
            range;

        if (me.isConfiguring) {
            me.recalculate();
        }
        range = me.active[me.displayRangeProp];

        return new Ext.calendar.date.Range(D.clone(range[0]), D.clone(range[1]));
    },

    /**
     * @inheritdoc
     */
    getVisibleRange: function() {
        var D = Ext.Date,
            range;

        if (this.isConfiguring) {
            this.recalculate();
        }
        range = this.active.visibleRange;

        return new Ext.calendar.date.Range(D.clone(range[0]), D.clone(range[1]));
    },

    // Appliers/Updaters
    updateAllowSelection: function(allowSelection) {
        var me = this;

        me.selectionListeners = Ext.destroy(me.selectionListeners);
        if (allowSelection) {
            me.el.on({
                destroyable: true,
                scope: me,
                touchstart: 'onTouchStart',
                touchmove: 'onTouchMove',
                touchend: 'onTouchEnd'
            });
        }
    },

    updateDayFormat: function(dayFormat) {
        if (!this.isConfiguring) {
            this.refresh();
        }
    },

    updateDaysInWeek: function() {
        this.refresh();
    },

    applyDraggable: function(draggable) {
        if (draggable) {
            draggable = new Ext.calendar.dd.WeeksSource(draggable);
        }
        return draggable;
    },

    updateDraggable: function(draggable, oldDraggable) {
        var me = this;

        if (oldDraggable) {
            oldDraggable.destroy();
        }

        if (draggable) {
            draggable.setView(this);
        }
    },

    applyDroppable: function(droppable) {
        if (droppable) {
            droppable = new Ext.calendar.dd.WeeksTarget();
        }
        return droppable;
    },

    updateDroppable: function(droppable, oldDroppable) {
        if (oldDroppable) {
            oldDroppable.destroy();
        }

        if (droppable) {
            droppable.setView(this);
        }
    },

    applyFirstDayOfWeek: function(firstDayOfWeek) {
        if (typeof firstDayOfWeek !== 'number') {
            firstDayOfWeek = Ext.Date.firstDayOfWeek;
        }
        return firstDayOfWeek;
    },

    updateFirstDayOfWeek: function(firstDayOfWeek) {
        var me = this;

        if (!me.isConfiguring) {
            me.recalculate();
            me.refreshHeaders();
            me.refresh();
        }
    },

    updateShowOverflow: function(showOverflow, oldShowOverflow) {
        var base = Ext.baseCSSPrefix + 'calendar-weeks-with-overflow-',
            el = this.element;

        if (oldShowOverflow) {
            el.removeCls(base + oldShowOverflow);
        }

        if (showOverflow) {
            el.addCls(base + showOverflow);
        }

        if (!this.isConfiguring) {
            this.refresh();
        }
    },

    updateTimezoneOffset: function() {
        if (!this.isConfiguring) {
            this.recalculate();
        }
    },

    updateValue: function(value, oldValue) {
        var me = this;
        if (!me.isConfiguring) {
            me.recalculate();
            me.refreshHeaders();
            me.refresh();
        }
        me.callParent([value, oldValue]);
    },

    updateVisibleDays: function() {
        var me = this;

        if (!me.isConfiguring) {
            me.recalculate();
            me.refreshHeaders();
            me.refresh();
        }
    },

    updateVisibleWeeks: function(visibleWeeks) {
        var me = this,
            table = me.cellTable;

        me.suspendEventRefresh();
        me.recalculate();
        me.resumeEventRefresh();
        table.removeChild(table.dom.firstChild);
        table.createChild({
            tag: 'tbody',
            children: me.generateCells(me.active.requiredWeeks, true)
        });
        me.cells = me.queryCells();

        if (!me.isConfiguring) {
            me.refresh();
        }
    },

    applyWeekendDays: function(weekendDays) {
        return weekendDays || Ext.Date.weekendDays;
    },

    updateWeekendDays: function(weekendDays) {
        this.weekendDayMap = Ext.Array.toMap(weekendDays);
        this.refresh();
    },

    // Overrides
    getElementConfig: function() {
        var me = this,
            result = me.callParent(),
            i;

        result.children = [{
            tag: 'table',
            reference: 'cellTable',
            cls: me.$tableCls + ' ' + Ext.baseCSSPrefix + 'calendar-weeks-week-rows',
            children: [{
                tag: 'tbody'
            }]
        }];

        return result;
    },

    destroy: function() {
        var me = this;

        // Clean up selection listeners
        me.setAllowSelection(false);
        me.setDraggable(null);
        me.setDroppable(null);

        me.cells = null;

        me.callParent();
    },

    privates: {
        /**
         * @property {Object} active
         * Contains information about the active month.
         *
         * @property {Number} active.year
         * The year.
         *
         * @property {Number} active.month
         * The month number (0 based).
         *
         * @property {Number} active.firstDay
         * The day of the week of the first in the month.
         *
         * @property {Number} active.daysInMonth
         * The number of days in the current month.
         *
         * @property {Number} active.weeks
         * The number of weeks required to display the full month. Ignores
         * {@link #fixedWeeks}.
         *
         * @property {Number[]} active.monthRange
         * The first/last days of the active month.
         *
         * @property {Number[]} active.visibleRange
         * The first/last visible days of the active month.
         * 
         *
         * @private
         */
        active: null,

        displayRangeProp: 'visibleRange',

        domFormat: 'Y-m-d',

        /**
         * @property {Date} maxDayMonth
         * The first day of a month with 31 days.
         *
         * @private
         */
        maxDayMonth: new Date(2000, 0, 1),

        /**
         * @property {Date} sundayDay
         * A date where the month starts on a Sunday. Used to generate day names.
         *
         * @private
         */
        sundayDay: new Date(2000, 9, 1),

        startMarginName: 'left',

        /**
         * @property {Boolean} trackRanges
         * `true` to track the date ranges in the view to add past/future date classes.
         */
        trackRanges: false,

        $rowCls: Ext.baseCSSPrefix + 'calendar-weeks-row',
        $cellCls: Ext.baseCSSPrefix + 'calendar-weeks-cell',
        $weekendCls: Ext.baseCSSPrefix + 'calendar-weeks-weekend-cell',
        $outsideCls: Ext.baseCSSPrefix + 'calendar-weeks-outside-cell',
        $pastCls: Ext.baseCSSPrefix + 'calendar-weeks-past-cell',
        $futureCls: Ext.baseCSSPrefix + 'calendar-weeks-future-cell',
        $todayCls: Ext.baseCSSPrefix + 'calendar-weeks-today-cell',
        $selectionCls: Ext.baseCSSPrefix + 'calendar-weeks-selection',
        $dayTextCls: Ext.baseCSSPrefix + 'calendar-weeks-day-text',
        $hiddenCellCls: Ext.baseCSSPrefix + 'calendar-weeks-hidden-cell',
        $cellInnerCls: Ext.baseCSSPrefix + 'calendar-weeks-cell-inner',
        $overflowCls: Ext.baseCSSPrefix + 'calendar-weeks-overflow',
        $cellOverflowCls: Ext.baseCSSPrefix + 'calendar-weeks-overflow-cell',
        $overflowPopupCls: Ext.baseCSSPrefix + 'calendar-weeks-overflow-popup',

        /**
         * Clear any selected cells.
         *
         * @private
         */
        clearSelected: function() {
            var cells = this.cells,
                len = cells.length,
                i;

            for (i = 0; i < len; ++i) {
                Ext.fly(cells[i]).removeCls(this.$selectionCls);
            }
        },

        /**
         * Construct events for the view.
         *
         * @private
         */
        constructEvents: function() {
            var me = this,
                D = Ext.Date,
                daysInWeek = Ext.Date.DAYS_IN_WEEK,
                events = me.getEventSource().getRange(),
                len = events.length,
                visibleDays = me.getVisibleDays(),
                visibleWeeks = me.active.requiredWeeks,
                current = D.clone(me.active.visibleRange[0]),
                eventHeight = me.getEventStyle().fullHeight,
                maxEvents = Math.floor(me.getDaySizes().heightForEvents / eventHeight),
                overflow = me.getShowOverflow() === 'bottom',
                weeks = [],
                i, j, week, frag, event;

            me.weeks = weeks;
            frag = document.createDocumentFragment();

            for (i = 0; i < visibleWeeks; ++i) {
                week = new Ext.calendar.view.WeeksRenderer({
                    view: me,
                    start: current,
                    days: visibleDays,
                    index: i,
                    overflow: overflow,
                    maxEvents: maxEvents
                });

                for (j = 0; j < len; ++j) {
                    event = events[j];
                    if (!me.isEventHidden(event)) {
                        week.addIf(event);
                    }
                }

                if (week.hasEvents()) {
                    week.calculate();
                }
                me.processWeek(week, frag);

                weeks.push(week);
                current = D.add(current, D.DAY, daysInWeek);
            }

            me.element.appendChild(frag);
        },

        /**
         * @inheritdoc
         */
        createEvent: function(event, cfg, dummy) {
            var span = event ? event.isSpan() : true;
            cfg = Ext.apply({
                mode: span ? 'weekspan' : 'weekinline'
            }, cfg);
            return this.callParent([event, cfg, dummy]);
        },

        /**
         * Do range recalculation.
         * @return {Object} The active ranges
         * @return {Date[]} return.visibleRange The visible range for the view.
         * @return {Date[]} return.activeRange The active range for the view.
         * @return {Number} return.requiredWeeks The number of weeks in the view.
         *
         * @private
         */
        doRecalculate: function() {
            var me = this,
                D = Ext.Date,
                v = me.getValue(),
                value = me.toUtcOffset(v.getFullYear(), v.getMonth(), v.getDate(), 0),
                daysInWeek = D.DAYS_IN_WEEK,
                visibleRange = [],
                // The number of days before the value date to reach the previous firstDayOfWeek
                startOffset = (value.getDay() + daysInWeek - me.getFirstDayOfWeek()) % daysInWeek,
                visibleWeeks = me.getVisibleWeeks();

            visibleRange[0] = D.subtract(value, D.DAY, startOffset);
            visibleRange[1] = D.add(visibleRange[0], D.DAY, visibleWeeks * daysInWeek - (daysInWeek - me.getVisibleDays()));

            return {
                visibleRange: visibleRange,
                activeRange: [visibleRange[0], D.subtract(visibleRange[1], D.DAY, 1)],
                requiredWeeks: visibleWeeks
            };
        },

        /**
         * @inheritdoc
         */
        doRefresh: function() {
            var me = this,
                D = Ext.Date,
                active = me.active,
                dayFormat = me.getDayFormat(),
                weekendDayMap = me.weekendDayMap,
                now = D.clearTime(me.getLocalNow()),
                current = Ext.Date.clone(active.visibleRange[0]),
                classes = [],
                trackRanges = me.trackRanges,
                visibleDays = me.getVisibleDays(),
                daysInWeek = Ext.Date.DAYS_IN_WEEK,
                y = now.getFullYear(),
                m = now.getMonth(),
                d = now.getDate(),
                cells, len, i, cell, firstDate , lastDate;

            if (trackRanges) {
                firstDate = active.monthRange[0];
                lastDate = active.monthRange[1];
            }

            cells = me.cells;
            for (i = 0, len = cells.length; i < len; ++i) {
                cell = cells[i];
                classes.length = 0;

                classes.push(me.$cellCls);

                if (weekendDayMap[current.getDay()]) {
                    classes.push(me.$weekendCls);
                }

                if (trackRanges) {
                    if (current < firstDate) {
                        classes.push(me.$pastCls, me.$outsideCls);
                    } else if (current > lastDate) {
                        classes.push(me.$futureCls, me.$outsideCls);
                    }
                }

                if (current.getFullYear() === y && current.getMonth() === m && current.getDate() === d) {
                    classes.push(me.$todayCls);
                }

                if (i % daysInWeek >= visibleDays) {
                    classes.push(me.$hiddenCellCls);
                }

                cell.className = classes.join(' ');

                cell.setAttribute('data-date', D.format(current, me.domFormat));
                cell.firstChild.firstChild.innerHTML = D.format(current, dayFormat);

                current = D.add(current, D.DAY, 1);
            }

            me.refreshEvents();
        },

        /**
         * @inheritdoc
         */
        doRefreshEvents: function() {
            var me = this,
                source = me.getEventSource();

            me.clearEvents();
            me.hideOverflowPopup();
            if (source && source.getCount()) {
                me.constructEvents();
            }
        },

        /**
         * Find the index of a cell via position.
         * @param {Number[]} sizes The sizes of each cell in the row/column.
         * @param {Number} offset The offset from the start edge.
         * @return {Number} The index.
         *
         * @private
         */
        findIndex: function(sizes, offset) {
            var i = 0,
                len = sizes.length;

            while (i < len) {
                offset -= sizes[i];
                if (offset <= 0) {
                    break;
                }
                ++i;
            }
            return i;
        },

        /**
         * Generate the cells for the view.
         * @param {Number} numRows The number of rows.
         * @param {Boolean} [setHeights=false] `true` to set the percentage heights on the rows.
         * @return {Object[]} An array of row DOM configs.
         *
         * @private
         */
        generateCells: function(numRows, setHeights) {
            var me = this,
                daysInWeek = Ext.Date.DAYS_IN_WEEK,
                rows = [],
                i, j, cells, style;

            if (setHeights) {
                style = {
                    height: (100 / numRows) + '%'
                };
            }

            for (i = 0; i < numRows; ++i) {
                cells = [];

                for (j = 0; j < daysInWeek; ++j) {
                    cells.push({
                        tag: 'td',
                        'data-index': j,
                        cls: me.$cellCls,
                        children: [{
                            cls: me.$cellInnerCls,
                            children: [{
                                tag: 'span',
                                cls: me.$dayTextCls
                            }, {
                                cls: me.$overflowCls
                            }]
                        }]
                    });
                }

                rows.push({
                    tag: 'tr',
                    cls: me.$rowCls,
                    'data-week': i,
                    children: cells,
                    style: style
                });
            }
            return rows;
        },

        /**
         * Get a cell by date.
         * @param {Date} date The date.
         * @return {HTMLElement} The cell, `null` if not found.
         *
         * @private
         */
        getCell: function(date) {
            var ret = null,
                cells = this.cells,
                len = cells.length,
                i, cell;

            if (Ext.isDate(date)) {
                date = Ext.Date.format(date, this.domFormat);
            }

            for (i = 0; i < len; ++i) {
                cell = cells[i];
                if (cell.getAttribute('data-date') === date) {
                    ret = cell;
                    break;
                }
            }
            return ret;
        },

        /**
         * Get a cell by page position.
         * @param {Number} pageX The page x position.
         * @param {Number} pageY The page y position.
         * @return {HTMLElement} The cell.
         *
         * @private
         */
        getCellByPosition: function(pageX, pageY) {
            var me = this,
                daySize, containerXY,
                cellIdx, rowIdx;

            daySize = me.getDaySizes();
            containerXY = me.element.getXY();
            
            // We can't use division here because of the way the table distributes dimensions.
            // We can end up having some cells being 1px larger than others.
            cellIdx = me.findIndex(daySize.widths, pageX - containerXY[0]);
            rowIdx = me.findIndex(daySize.heights, pageY - containerXY[1]);

            return me.cells[rowIdx * Ext.Date.DAYS_IN_WEEK + cellIdx];
        },

        /**
         * Get a cell from a DOM event.
         * @param {Ext.event.Event} e The event.
         * @param {Boolean} [inferFromWidget=false] `true` to find the cell if the event
         * occurred on an event widget,
         * @return {HTMLElement} The cell.
         *
         * @private
         */
        getCellFromEvent: function(e, inferFromWidget) {
            var ret = null,
                xy;

            ret = e.getTarget('.' + this.$cellCls, this.element);

            // Didn't hit a cell, probably over an event
            if (!ret && inferFromWidget) {
                xy = e.getXY();
                ret = this.getCellByPosition(xy[0], xy[1]);
            }

            return ret;
        },

        /**
         * Get the date from a cell.
         * @param {HTMLElement} cell The cell.
         * @return {Date} The date.
         *
         * @private
         */
        getDateFromCell: function(cell) {
            return Ext.Date.parse(cell.getAttribute('data-date'), this.domFormat);
        },

        /**
         * Calculate the width/height of each day cell. This is cached and
         * should be invalidated on resize. The reason we need to do this is
         * that the table layout algorithm may assign some rows/cells to be 1px
         * larger than others to achieve full width, so dividing can give slightly
         * inaccurate results.
         * @return {Object} Day size info.
         * @return {Number[]} return.widths The widths for a row of cells.
         * @return {Number[]} return.heights The heights for a column of cells.
         * @return {Number} return.headerHeight The height of the day number header in the cell.
         * @return {heightForEvents} The available height for displaying events in a cell.
         *
         * @private
         */
        getDaySizes: function() {
            var me = this,
                daySizes = me.daySizes,
                cells = me.cells,
                visibleDays = me.getVisibleDays(),
                smallest = Number.MAX_VALUE,
                cell, headerHeight, fly, widths, heights, i, h;

            if (!me.daySizes) {
                cell = cells[0];

                fly = Ext.fly(cell.firstChild);
                headerHeight = fly.getPadding('tb') + Ext.fly(cell.firstChild.firstChild).getHeight();

                widths = [];
                heights = [];
                for (i = 0; i < visibleDays; ++i) {
                    fly = Ext.fly(cells[i]);
                    widths.push(fly.getWidth());
                    h = fly.getHeight();
                    heights.push(h);
                    if (h < smallest) {
                        smallest = h;
                    }
                }

                me.daySizes = daySizes = {
                    widths: widths,
                    heights: heights,
                    headerHeight: headerHeight,
                    heightForEvents: Math.max(0, smallest - headerHeight)
                };
            }

            return daySizes;
        },

        /**
         * Get styles regarding events. Creates a fake event and measures pieces of the
         * componentry.
         * @return {Object} Size info.
         * @return {Object} return.margin The margins for the event.
         * @return {Number} return.height The height of the event.
         * @return {Number} return.fullHeight The height + margins.
         *
         * @private
         */
        getEventStyle: function() {
            var me = this,
                eventStyle = me.eventStyle,
                fakeEvent, el, margin, height;

            if (!eventStyle) {
                fakeEvent = me.createEvent(null, null, true);
                el = fakeEvent.element;
                el.dom.style.visibility = 'none';
                me.element.appendChild(el);

                height = el.getHeight();
                margin = el.getMargin();

                margin.height = margin.top + margin.bottom;
                margin.width = margin.left + margin.right;

                me.eventStyle = eventStyle = {
                    margin: margin,
                    height: height,
                    fullHeight: height + margin.height
                };
                fakeEvent.destroy();

            }
            return eventStyle;
        },

        /**
         * Gets an event widget via an element/DOM event.
         * @param {HTMLElement/Ext.event.Event} el The element/event.
         * @return {Ext.calendar.EventBase} The widget.
         *
         * @private
         */
        getEventWidget: function(el) {
            var cls = this.$eventCls,
                id;

            if (el.isEvent) {
                el = el.target;
            }

            if (!Ext.fly(el).hasCls(cls)) {
                el = Ext.fly(el).up('.' + cls, this.element, true);
            }
            id = el.getAttribute('data-componentid');
            return this.eventMap[id];
        },

        /**
         * @inheritdoc
         */
        getMoveBaseValue: function() {
            return this.active.visibleRange[0];
        },

        /**
         * @inheritdoc
         */
        getMoveInterval: function() {
            var D = Ext.Date;
            return {
                unit: D.DAY,
                amount: D.DAYS_IN_WEEK * this.getVisibleWeeks()
            };
        },

        /**
         * Handle taps on event widgets in the view.
         * @param {Ext.event.Event} e The event.
         *
         * @private
         */
        handleEventTap: function(e) {
            var event = this.getEvent(e);
            this.onEventTap(event);
        },

        /**
         * @inheritdoc
         */
        handleResize: function() {
            var me = this;
            me.callParent();
            me.daySizes = null;
            me.hideOverflowPopup();
            me.refreshEvents();
        },

        /**
         * Hide the overflow popup.
         *
         * @private
         */
        hideOverflowPopup: Ext.privateFn,

        /**
         * Handle click on the "show more" overflow element.
         * @param {Ext.event.Event} e The DOM event.
         *
         * @private
         */
        onOverflowClick: function(e) {
            var me = this,
                cell = me.getCellFromEvent(e),
                date = me.getDateFromCell(cell),
                week = parseInt(cell.parentNode.getAttribute('data-week'), 10),
                index = parseInt(cell.getAttribute('data-index'), 10);

            me.showOverflowPopup(me.weeks[week].overflows[index], date, cell);
        },

        /**
         * @inheritdoc
         */
        onSourceAttach: function() {
            this.recalculate();
        },

        /**
         * Handle touchend on the view.
         * @param {Ext.event.Event} event The event.
         *
         * @private
         */
        onTouchEnd: function() {
            var me = this,
                D = Ext.Date,
                cells = me.cells,
                start, end, temp, event, allDay;

            if (me.isSelecting) {
                start = me.selectedStartIndex;
                end = me.selectedEndIndex;

                if (start === end) {
                    start = end = me.getDateFromCell(cells[start]);
                    me.fireEvent('select', me, start);
                } else {
                    if (start > end) {
                        temp = end;
                        end = start;
                        start = temp;
                    }
                    start = me.getDateFromCell(cells[start]);
                    end = me.getDateFromCell(cells[end]);
                    me.fireEvent('selectrange', me, [start, end]);
                }

                if (me.getAddOnSelect() && me.hasEditableCalendars()) {
                    allDay = start !== end;
                    end =  D.localToUtc(end);
                    // getDateFromCell gives us a local date.
                    event = me.createModel({
                        allDay: allDay,
                        startDate: D.localToUtc(start),
                        endDate: allDay ? D.add(end, D.DAY, 1) : end
                    });
                    me.showAddForm(event, {
                        scope: me,
                        onSave: me.clearSelected,
                        onCancel: me.clearSelected
                    });
                }

                me.isSelecting = false;
            }
        },

        /**
         * Handle touchmove on the view.
         * @param {Ext.event.Event} event The event.
         *
         * @private
         */
        onTouchMove: function(e) {
            var me = this,
                start = me.selectedStartIndex,
                cells = me.cells,
                len = cells.length,
                end, current, i, cell, swap;

            if (me.isSelecting) {
                cell = me.getCellFromEvent(e, true);

                current = Ext.Array.indexOf(cells, cell);

                if (current > start) {
                end = current;
                } else if (current < start) {
                    end = start;
                    start = current;
                    swap = true;
                } else {
                    end = start;
                }

                me.selectedEndIndex = swap ? start : end;

                for (i = 0; i < len; ++i) {
                    Ext.fly(cells[i]).toggleCls(me.$selectionCls, i >= start && i <= end);
                }
            }
        },

        /**
         * Handle touchstart on the view.
         * @param {Ext.event.Event} event The event.
         *
         * @private
         */
        onTouchStart: function(e, t) {
            var me = this,
                el = me.element,
                cell;

            if (e.pointerType === e.PointerType.TOUCH || e.getTarget('.' + me.$overflowCls, el) || e.getTarget('.' + me.$overflowPopupCls, el)) {
                return;
            }

            me.hideOverflowPopup();

            cell = me.getCellFromEvent(e);

            if (cell) {
                me.isSelecting = true;
                me.selectedStartIndex = me.selectedEndIndex = Ext.Array.indexOf(me.cells, cell);
                Ext.fly(cell).addCls(me.$selectionCls);
            }
        },

        /**
         * Sets the position in the DOM for an event widget.
         * @param {Ext.dom.Element} el The element.
         * @param {Object} item The event meta object with position info.
         *
         * @private
         */
        positionEvent: function(el, item) {
            var me = this,
                daySizes = me.getDaySizes(),
                eventStyle = me.getEventStyle(),
                margin = eventStyle.margin,
                widths = daySizes.widths,
                start = item.start,
                idx = item.localIdx,
                weekIdx = item.weekIdx,
                headerOffset;

            headerOffset = daySizes.headerHeight + eventStyle.height * idx + (idx + 1) * margin.height;

            el.setTop(me.positionSum(0, weekIdx, daySizes.heights) + headerOffset);
            el.setLeft(me.positionSum(0, start, widths) + margin[me.startMarginName]);
            el.setWidth(me.positionSum(start, item.len, widths) - margin.width);
        },

        /**
         * Calculates the position based on a set of sizes.
         * See {@link #getDaySizes} on why we can't just use multiplication.
         * @param {Number} start The start index.
         * @param {Number} len The number of cells to span.
         * @param {Number[]} sizes The cell sizes.
         * @return {Number} The sum for the specified range.
         *
         * @private
         */
        positionSum: function(start, len, sizes) {
            var sum = 0,
                end = start + len,
                i;

            for (i = start; i < end; ++i) {
                sum += sizes[i];
            }

            return sum;
        },

        /**
         * Position events for a week.
         * @param {Ext.calendar.view.WeekRenderer} week The week.
         * @param {DocumentFragment} frag A fragment to append events to.
         *
         * @private
         */
        processWeek: function(week, frag) {
            var me = this,
                rows = week.rows,
                days = week.days,
                overflows = week.overflows,
                cellOffset = week.index * Ext.Date.DAYS_IN_WEEK,
                showOverflow = me.getShowOverflow(),
                cells = me.cells,
                overflowCls = me.$cellOverflowCls,
                overflowText = me.getOverflowText(),
                overflow, row, i, rowLen, j, item, 
                widget, el, cell, len;

            if (rows) {
                for (i = 0, len = rows.length; i < len; ++i) {
                    row = week.compress(i);
                    for (j = 0, rowLen = row.length; j < rowLen; ++j) {
                        item = row[j];
                        if (!item.isEmpty) {
                            widget = me.createEvent(item.event);
                            el = widget.element;
                            el.dom.style.margin = '0';
                            frag.appendChild(el.dom);
                            me.positionEvent(el, item);
                        }
                    }
                }
            }

            for (i = 0; i < days; ++i) {
                cell = cells[cellOffset + i];
                overflow = overflows && overflows[i];
                if (overflow && showOverflow) {
                    Ext.fly(cell).addCls(overflowCls);
                    cell.firstChild.lastChild.innerHTML = Ext.String.format(overflowText, overflow.length);
                } else {
                    Ext.fly(cell).removeCls(overflowCls);
                }
            }
        },

        /**
         * Gets all day cells.
         * @return {HTMLElement[]} The day cells.
         *
         * @private
         */
        queryCells: function() {
            return this.element.query('.' + this.$cellCls);
        },

        /**
         * @inheritdoc
         */
        recalculate: function() {
            var active = this.doRecalculate(),
                visibleRange;

            this.active = active
            visibleRange = active.visibleRange;
            
            this.setSourceRange(visibleRange[0], visibleRange[1]);
        },

        /**
         * @inheritdoc
         */
        refreshHeaders: function() {
            var header = this.getHeader(),
                active = this.active;

            if (header) {
                header.setVisibleDays(this.getVisibleDays());
                if (active) {
                    header.setValue(active.visibleRange[0]);
                }
            }
        },

        /**
         * Select a date range of cells.
         * @param {Date} from The start date.
         * @param {Date} to The end date.
         *
         * @private
         */
        selectRange: function(from, to) {
            var me = this,
                D = Ext.Date,
                range = me.active.activeRange,
                cells = me.cells,
                len = cells.length,
                highlight = false,
                i, cell;

            if (from < range[0]) {
                from = range[0];
            }

            if (to > range[1]) {
                to = range[1];
            }

            from = me.getCell(D.clearTime(from, true));
            to = me.getCell(D.clearTime(to, true));

            if (from && to) {
                for (i = 0; i < len; ++i) {
                    cell = cells[i];

                    if (cell === from) {
                        highlight = true;
                    }

                    Ext.fly(cell).toggleCls(me.$selectionCls, highlight);

                    if (cell === to) {
                        highlight = false;
                    }
                }
            }
        },

        /**
         * Show the overflow popup
         *
         * @private
         */
        showOverflowPopup: Ext.privateFn
    }
});