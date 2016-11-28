/**
 * This updater evenly distributes the value across all records found on the {@link Ext.pivot.result.Base matrix result}.
 *
 * Let's say that the result object contains the following records (each record is a
 * {@link Ext.data.Model model instance} in fact but we use json representation for this example):
 *
 *      [
 *          { product: 'Phone', country: 'USA', order: 100 },
 *          { product: 'Tablet', country: 'USA', order: 200 }
 *      ]
 *
 * And we want to evenly distribute the value 300 to all orders. This is how the updater config looks like:
 *
 *      {
 *          type: 'uniform',
 *          leftKey: resultLeftKey,
 *          topKey: resultTopKey,
 *          matrix: matrix,
 *          dataIndex: 'order',
 *          value: 300
 *      }
 *
 * And this is how the records look after the update:
 *
 *      [
 *          { product: 'Phone', country: 'USA', order: 150 },
 *          { product: 'Tablet', country: 'USA', order: 150 }
 *      ]
 *
 */
Ext.define('Ext.pivot.update.Uniform', {
    extend: 'Ext.pivot.update.Base',

    alias: 'pivotupdate.uniform',

    onUpdate: function(result, resolve, reject){
        var dataIndex = this.getDataIndex(),
            records = result.records,
            len, i, avg;

        if(records) {
            len = records.length;
            if (len > 0) {
                avg = (parseFloat(this.getValue()) / len);

                for (i = 0; i < len; i++) {
                    records[i].set(dataIndex, avg);
                }
            }
        }

        this.callParent([result, resolve, reject]);
    }
});