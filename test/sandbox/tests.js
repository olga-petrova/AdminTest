describe('Expectations', function () {
    it('get/and', function () {
        ST.textField('textfield[name="user"]')
        .type('foobar')
        .get('id,value')
        .and(function () {
            expect(this.future.data.id).toBeDefined();
            expect(this.future.data.value).toBe('foobar');
        });
    });
});

describe('White Box With Sand Box', function () {
    it('execute', function () {
        ST.execute(function () {
            alert('I am over here in the browser!');
        });
    });
    
    it('execute with parameter and return', function () {
        ST.execute(function() {
            // IN BROWSER BEGIN
            return 'a value';
            // IN BROWSER END
        })
        .and(function () {
            expect(this.future.data.executeResult).toBe('a value');
        });
    });
    
    it('execute with an error', function () {
        ST.execute(function () {
            throw 'foobar';
        })
        .and(function () {
            expect(this.future.data.executeError).toBeTruthy();
        });
    });
});
