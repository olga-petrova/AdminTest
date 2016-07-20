/**
 * Inserts an extra row in the end of the exported table
 * with a message in the trial version of the Exporter 
 */
Ext.define('Ext.overrides.exporter.ExcelTrial', {
    override: 'Ext.exporter.Excel',
    
    addTitle: function(config, colMerge) {
        this.table.addRow({
            autoFitHeight: 1,
            height: 22.5,
            styleId: this.workbook.addStyle(Ext.applyIf({
                // we need an unique style for the trial otherwise the file will have style conflicts
                // with the one from the title
                id: 'trial-title',
                name: 'Trial Title'
            }, config.titleStyle)).getId()
        }).addCell({
            mergeAcross: colMerge - 1,
            value: 'Produced by Ext JS Trial'
        });
        
        this.callParent(arguments);
    }
});
