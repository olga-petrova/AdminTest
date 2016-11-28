/**
 * @private
 */
Ext.define('Ext.pivot.plugin.configurator.Form', {
    extend: 'Ext.form.Panel',

    requires: [
        'Ext.pivot.plugin.configurator.store.Select',
        'Ext.pivot.plugin.configurator.FormController',
        'Ext.form.FieldSet',
        'Ext.field.Toggle',
        'Ext.field.Select',
        'Ext.field.Radio',
        'Ext.field.Text',
        'Ext.field.Hidden',
        'Ext.layout.VBox',
        'Ext.layout.HBox',
        'Ext.TitleBar'
    ],

    xtype: 'pivotconfigform',
    controller: 'pivotconfigform',
    viewModel: {
        stores: {
            sFormatters: {
                type: 'pivotselect'
            },
            sAggregators: {
                type: 'pivotselect'
            },
            sSorters: {
                type: 'pivotselect'
            },
            sFilters: {
                type: 'pivotselect'
            },
            sOperators: {
                type: 'pivotselect'
            },
            sTopOrder: {
                type: 'pivotselect'
            },
            sTopType: {
                type: 'pivotselect'
            },
            sDimensions: {
                type: 'pivotselect'
            },
            sAlign: {
                type: 'pivotselect'
            }
        }
    },

    eventedConfig: {
        fieldItem: null,
        title: null
    },

    listeners: {
        fielditemchange: 'onFieldItemChanged'
    },

    defaults: {
        labelAlign: 'top'
    },

    showAnimation: {
        type: 'slideIn',
        duration: 250,
        easing: 'ease-out',
        direction: 'left'
    },

    /**
     * @cfg
     * @inheritdoc
     */
    hideAnimation: {
        type: 'slideOut',
        duration: 250,
        easing: 'ease-in',
        direction: 'right'
    },

    okText:                     'Ok',
    cancelText:                 'Cancel',
    formatText:                 'Format as',
    summarizeByText:            'Summarize by',
    customNameText:             'Custom name',
    sourceNameText:             'The source name for this field is "{form.dataIndex}"',
    sortText:                   'Sort',
    filterText:                 'Filter',
    sortResultsText:            'Sort results',
    alignText:                  'Align',
    alignLeftText:              'Left',
    alignCenterText:            'Center',
    alignRightText:             'Right',

    caseSensitiveText:          'Case sensitive',
    valueText:                  'Value',
    fromText:                   'From',
    toText:                     'To',
    labelFilterText:            'Show items for which the label',
    valueFilterText:            'Show items for which',
    top10FilterText:            'Show',

    sortAscText:                'Sort A to Z',
    sortDescText:               'Sort Z to A',
    sortClearText:              'Disable sorting',
    clearFilterText:            'Disable filtering',
    labelFiltersText:           'Label filters',
    valueFiltersText:           'Value filters',
    top10FiltersText:           'Top 10 filters',

    equalsLText:                'equals',
    doesNotEqualLText:          'does not equal',
    beginsWithLText:            'begins with',
    doesNotBeginWithLText:      'does not begin with',
    endsWithLText:              'ends with',
    doesNotEndWithLText:        'does not end with',
    containsLText:              'contains',
    doesNotContainLText:        'does not contain',
    greaterThanLText:           'is greater than',
    greaterThanOrEqualToLText:  'is greater than or equal to',
    lessThanLText:              'is less than',
    lessThanOrEqualToLText:     'is less than or equal to',
    betweenLText:               'is between',
    notBetweenLText:            'is not between',
    topOrderTopText:            'Top',
    topOrderBottomText:         'Bottom',
    topTypeItemsText:           'Items',
    topTypePercentText:         'Percent',
    topTypeSumText:             'Sum',

    updateFieldItem: function(item){
        var me = this,
            items, field;

        me.removeAll(true, true);
        if(!item){
            return;
        }

        field = item.getField();
        items = [{
            xtype:      'titlebar',
            docked:     'top',
            bind: {
                title: '{form.header}'
            },
            items: [{
                text:   me.cancelText,
                align:  'left',
                ui:     'back',
                handler:'cancelSettings'
            },{
                text:   me.okText,
                align:  'right',
                ui:     'action',
                handler:'applySettings'
            }]
        },{
            xtype:      'fieldset',
            margin:     0,
            bind: {
                instructions: me.sourceNameText
            },
            items: [{
                label:      me.customNameText,
                labelAlign: 'top',
                xtype:      'textfield',
                bind:       '{form.header}'
            }]
        }];

        if(field.isAggregate){
            items.push({
                label:          me.alignText,
                xtype:          'selectfield',
                autoSelect:     false,
                useClearIcon:   true,
                bind: {
                    store:      '{sAlign}',
                    value:      '{form.align}'
                }
            },{
                label:          me.formatText,
                xtype:          'selectfield',
                autoSelect:     false,
                useClearIcon:   true,
                bind: {
                    store:      '{sFormatters}',
                    value:      '{form.formatter}'
                }
            },{
                label:          me.summarizeByText,
                xtype:          'selectfield',
                autoSelect:     false,
                useClearIcon:   true,
                bind: {
                    store:      '{sAggregators}',
                    value:      '{form.aggregator}'
                }
            });
        }else{
            items.push({
                label:          me.sortText,
                labelAlign:     'top',
                xtype:          'selectfield',
                autoSelect:     false,
                useClearIcon:   true,
                bind: {
                    store:      '{sSorters}',
                    value:      '{form.direction}'
                }
            },{
                label:          me.filterText,
                labelAlign:     'top',
                xtype:          'selectfield',
                autoSelect:     false,
                useClearIcon:   true,
                bind: {
                    store:      '{sFilters}',
                    value:      '{form.filter.type}'
                },
                listeners: {
                    change: 'onChangeFilterType'
                }
            },{
                itemId:         'commonFilters',
                xtype:          'fieldset',
                margin:         0,
                hidden:         true,
                title:          me.labelFilterText,
                defaults: {
                    labelAlign: 'top'
                },
                items: [{
                    role:           'dimensions',
                    xtype:          'selectfield',
                    autoSelect:     false,
                    bind: {
                        store:      '{sDimensions}',
                        value:      '{form.filter.dimensionId}'
                    }
                },{
                    xtype:          'selectfield',
                    autoSelect:     false,
                    bind: {
                        store:      '{sOperators}',
                        value:      '{form.filter.operator}'
                    },
                    listeners: {
                        change:     'onChangeFilterOperator'
                    }
                },{
                    role:           'operator',
                    xtype:          'textfield',
                    placeHolder:    me.valueText,
                    bind:           '{form.filter.value}'
                },{
                    role:           'between',
                    xtype:          'textfield',
                    placeHolder:    me.fromText,
                    hidden:         true,
                    bind:           '{form.filter.from}'
                },{
                    role:           'between',
                    xtype:          'textfield',
                    placeHolder:    me.toText,
                    hidden:         true,
                    bind:           '{form.filter.to}'
                },{
                    xtype:          'togglefield',
                    label:          me.caseSensitiveText,
                    name:           'fCaseSensitive',
                    bind:           '{form.filter.caseSensitive}'
                }]
            },{
                itemId:         'top10Filters',
                xtype:          'fieldset',
                margin:         0,
                hidden:         true,
                title:          me.top10FilterText,
                defaults: {
                    labelAlign: 'top'
                },
                items: [{
                    xtype:          'selectfield',
                    autoSelect:     false,
                    bind: {
                        store:      '{sTopOrder}',
                        value:      '{form.filter.topOrder}'
                    }
                },{
                    xtype:          'textfield',
                    placeHolder:    me.valueText,
                    bind:           '{form.filter.value}'
                },{
                    xtype:          'selectfield',
                    autoSelect:     false,
                    bind: {
                        store:      '{sTopType}',
                        value:      '{form.filter.topType}'
                    }
                },{
                    xtype:          'selectfield',
                    autoSelect:     false,
                    bind: {
                        store:      '{sDimensions}',
                        value:      '{form.filter.dimensionId}'
                    }
                },{
                    xtype:          'togglefield',
                    label:          me.sortResultsText,
                    bind:           '{form.filter.topSort}'
                }]
            });
        }

        me.add(items);
    }

});