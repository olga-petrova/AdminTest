
describe('mpa navigation', function () {
    it('navigates from one site to another', function () {
        var go = function (url) {
            ST.navigate(url);
            ST.wait(300);
        }

        go('http://www.google.com/');
    }, 30*60);
});
