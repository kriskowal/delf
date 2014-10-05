
var measures = require('../measures');

[
    { number: 0, name: 'non' },
    { number: 1, name: 'firs' },
    { number: 2, name: 'sek' },
    { number: 3, name: 'thir' },
    { number: 10, name: 'firsty' },
    { number: 11, name: 'firsty firs' },
    { number: 20, name: 'sekty' },
    { number: 21, name: 'sekty firs' },
    { number: 30, name: 'thirty' },
    { number: 100, name: 'firster' },
    { number: 200, name: 'sekter' },
    { number: 333, name: 'thirter thirty thir' },
    { number: 101, name: 'firster firs' },
    { number: 111, name: 'firster firsty firs' },
    { number: 1000, name: 'firstion' },
    { number: 2000, name: 'sek firstion' },
    { number: 3001, name: 'thir firstion firs' },
    { number: 30001, name: 'thirty firstion firs' },
    { number: 10000, name: 'firsty firstion' },
    { number: 100000, name: 'firster firstion' },
    { number: 1000000, name: 'sektion' },
    { number: 10000000, name: 'firsty sektion' },
    { number: 100000000, name: 'firster sektion' },
    { number: 1000000000, name: 'thirtion' },
    { number: 10000000000, name: 'firsty thirtion' },
    { number: 100000000000, name: 'firster thirtion' },
    { number: 1000000000000, name: 'fourtion' },
    { number: 1111111111111, name: 'fourtion firster firsty firs thirtion firster firsty firs sektion firster firsty firs firstion firster firsty firs' }
].forEach(function (test) {
    it(test.number, function () {
        expect(measures.namedNumber(test.number)).toBe(test.name);
    });
});

