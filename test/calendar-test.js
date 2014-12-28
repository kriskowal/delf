"use strict";

var measures = require('../measures');

var tests = [

    {
        name: 'nonce',
        now: 0,
        state: {
            mood: 'Whimsy',
            season: 'Autumn',
            year: 0,
            month: 'Nonuary',
            seasonday: 'Non',
            monthday: 'Non',
            weekday: 'Marsday',
            hour: 'High Dawn',
            minute: '00',
            second: '00'
        }
    },

    {
        name: 'seconds',
        now: 1000,
        state: {
            mood: 'Whimsy',
            season: 'Autumn',
            year: 0,
            month: 'Nonuary',
            seasonday: 'Non',
            monthday: 'Non',
            weekday: 'Marsday',
            hour: 'High Dawn',
            minute: '00',
            second: '01'
        }
    },

    {
        name: 'seven seconds',
        now: 1000 * 7,
        state: {
            mood: 'Whimsy',
            season: 'Autumn',
            year: 0,
            month: 'Nonuary',
            seasonday: 'Non',
            monthday: 'Non',
            weekday: 'Marsday',
            hour: 'High Dawn',
            minute: '00',
            second: '10' // changes
        }
    },

    {
        name: 'minute',
        now: 1000 * 7 * 7,
        state: {
            mood: 'Whimsy',
            season: 'Autumn',
            year: 0,
            month: 'Nonuary',
            seasonday: 'Non',
            monthday: 'Non',
            weekday: 'Marsday',
            hour: 'High Dawn',
            minute: '01', // changes
            second: '00'
        }
    },

    {
        name: 'seven minutes',
        now: 1000 * 7 * 7 * 7,
        state: {
            mood: 'Whimsy',
            season: 'Autumn',
            year: 0,
            month: 'Nonuary',
            seasonday: 'Non',
            monthday: 'Non',
            weekday: 'Marsday',
            hour: 'High Dawn',
            minute: '10', // changes
            second: '00'
        }
    },

    {
        name: 'hour',
        now: 1000 * 7 * 7 * 7 * 7,
        state: {
            mood: 'Whimsy',
            season: 'Autumn',
            year: 0,
            month: 'Nonuary',
            seasonday: 'Non',
            monthday: 'Non',
            weekday: 'Marsday',
            hour: 'High Elm', // changes
            minute: '00',
            second: '00'
        }
    },

    {
        name: 'night',
        now: 1000 * 7 * 7 * 7 * 7 * 7,
        state: {
            mood: 'Whimsy',
            season: 'Autumn',
            year: 0,
            month: 'Nonuary',
            seasonday: 'Non',
            monthday: 'Non',
            weekday: 'Venite', // changes
            hour: 'Low Dusk', // changes
            minute: '00',
            second: '00'
        }
    },

    {
        name: 'day',
        now: 1000 * 7 * 7 * 7 * 7 * 7 * 2,
        state: {
            mood: 'Whimsy',
            season: 'Autumn',
            year: 0,
            month: 'Nonuary',
            seasonday: 'Firs', // changes
            monthday: 'Firs', // changes
            weekday: 'Terraday', // changes
            hour: 'High Dawn',
            minute: '00',
            second: '00'
        }
    },

    {
        name: 'two days',
        now: 1000 * 7 * 7 * 7 * 7 * 7 * 2 * 2,
        state: {
            mood: 'Whimsy',
            season: 'Autumn',
            year: 0,
            month: 'Nonuary',
            seasonday: 'Sek', // changes
            monthday: 'Sek', // changes
            weekday: 'Windday', // changes
            hour: 'High Dawn',
            minute: '00',
            second: '00'
        }
    },

    {
        name: 'week',
        now: 1000 * 7 * 7 * 7 * 7 * 7 * 2 * 6,
        state: {
            mood: 'Whimsy',
            season: 'Autumn',
            year: 0,
            month: 'Nonuary',
            seasonday: 'Sik', // changes
            monthday: 'Sik', // changes
            weekday: 'Marsday',
            hour: 'High Dawn',
            minute: '00',
            second: '00'
        }
    },

    {
        name: 'month',
        now: 1000 * 7 * 7 * 7 * 7 * 7 * 2 * 10,
        state: {
            mood: 'Whimsy',
            season: 'Autumn',
            year: 0,
            month: 'Firstuary', // changes
            seasonday: 'Firsty', // changes
            monthday: 'Non',
            weekday: 'Fireday', // changes
            hour: 'High Dawn',
            minute: '00',
            second: '00'
        }
    },

    {
        name: 'two months',
        now: 1000 * 7 * 7 * 7 * 7 * 7 * 2 * 10 * 2,
        state: {
            mood: 'Whimsy',
            season: 'Autumn',
            year: 0,
            month: 'Secondus', // changes
            seasonday: 'Sekty', // changes
            monthday: 'Non',
            weekday: 'Windday', // changes
            hour: 'High Dawn',
            minute: '00',
            second: '00'
        }
    },

    {
        name: 'season',
        now: 1000 * 7 * 7 * 7 * 7 * 7 * 2 * 25,
        state: {
            mood: 'Whimsy',
            season: 'Hibernumn', // changes
            year: 0,
            month: 'Secondus', // changes
            seasonday: 'Non',
            monthday: 'Fif',
            weekday: 'Terraday', // changes
            hour: 'High Dawn',
            minute: '00',
            second: '00'
        }
    },

    {
        name: 'two seasons',
        now: 1000 * 7 * 7 * 7 * 7 * 7 * 2 * 25 * 2,
        state: {
            mood: 'Whimsy',
            season: 'Vernumn', // changes
            year: 0,
            month: 'Fiftuary', // changes
            seasonday: 'Non',
            monthday: 'Non',
            weekday: 'Windday', // changes
            hour: 'High Dawn',
            minute: '00',
            second: '00'
        }
    },

    {
        name: 'year',
        now: 1000 * 7 * 7 * 7 * 7 * 7 * 2 * 100,
        state: {
            mood: 'Strange', // changes
            season: 'Autumn',
            year: 1, // changes
            month: 'Nonuary',
            seasonday: 'Non',
            monthday: 'Non',
            weekday: 'Fireday', // changes
            hour: 'High Dawn',
            minute: '00',
            second: '00'
        }
    },

    {
        name: 'mood',
        now: 1000 * 7 * 7 * 7 * 7 * 7 * 2 * 6 * 13, // 13 weeks
        state: {
            mood: 'Strange', // changes
            season: 'Aestumn', // changes
            year: 0,
            seasonday: 'Thir', // changes
            month: 'Sepentus', // changes
            monthday: 'Oc', // changes
            weekday: 'Marsday',
            hour: 'High Dawn',
            minute: '00',
            second: '00'
        }
    },

];

tests.forEach(function (test) {
    it(test.name, function () {
        expect(measures.namedState(test.now)).toEqual(test.state);
    });
});

