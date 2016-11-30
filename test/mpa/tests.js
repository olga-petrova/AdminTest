
describe('mpa navigation', function () {
    it('navigates from one site to another', function () {
        var go = function (url) {
            ST.navigate(url);
            ST.wait(300);
        }

        go('http://www.saucelabs.com/');
        go('http://www.bryntum.com/');
        go('http://www.speedment.com/');
        go('http://www.cnxcorp.com/');
    });
});
