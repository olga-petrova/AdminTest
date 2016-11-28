/**
 * This updater increments all records found on the {@link Ext.pivot.result.Base matrix result}
 * using the specified value.
 *
 * Let's say that the result object contains the following records (each record is a
 * {@link Ext.data.Model model instance} in fact but we use json representation for this example):
 *
 *      [
 *          { product: 'Phone', country: 'USA', order: 100 },
 *          { product: 'Tablet', country: 'USA', order: 200 }
 *      ]
 *
 * And we want to increment all orders by a fixed value of 50. This is how the updater config looks like:
 *
 *      {
 *          type: 'increment',
 *          leftKey: resultLeftKey,
 *          topKey: resultTopKey,
 *          matrix: matrix,
 *          dataIndex: 'order',
 *          value: 50
 *      }
 *
 * And this is how the records look after the update:
 *
 *      [
 *          { product: 'Phone', country: 'USA', order: 150 },
 *          { product: 'Tablet', country: 'USA', order: 250 }
 *      ]
 *
 */
Ext.define('Ext.pivot.update.Increment', {
    extend: 'Ext.pivot.update.Base',

    alias: 'pivotupdate.increment',

    onUpdate: function(result, resolve, reject){
        var dataIndex = this.getDataIndex(),
            value = parseFloat(this.getValue()),
            records = result.records,
            len, i;

        if(records) {
            len = records.length;

            for (i = 0; i < len; i++) {
                records[i].set(dataIndex, records[i].get(dataIndex) + value);
            }
        }

        this.callParent([result, resolve, reject]);
    }
});