'use strict';

// now is always expressed from the nonce, the 0 of every measure of time

exports.seasons = ['aut', 'hibern', 'vern', 'aest']; // -umn

exports.ten = ['non', 'firs', 'sek', 'thir', 'four', 'fif', 'sik', 'sep', 'eigh', 'nin'];

exports.months = [ // 10
    'nonuary',
    'firstuary',
    'secondus',
    'trebeth',
    'fourtuary',
    'fiftuary',
    'sictober',
    'sepentus',
    'eightuary',
    'ninneth'
];

exports.twelve = [
    'mars', 'ven',
    'terra', 'aester',
    'wind', 'ether',
    'donner', 'blitzen',
    'fire', 'rain',
    'sol', 'luna'
];

exports.daynites = [ // 6 days, 6 nights per week
    'marsday', 'venite', // mars and venus
    'terraday', 'asternite', // earth and stars
    'windday', 'ethernite', // wind and aether (english / latin)
    'donnerday', 'blitzennite', // thunder and lightening (german)
    'fireday', 'rainnite', // fire and rain (english)
    'solday', 'lunnite' // sun and moon
];

exports.hours = [ // 14 hours
    'high dawn',
    'high elm',
    'high pine',
    'high non',
    'high spruce',
    'high cedar',
    'high dusk',
    'low dusk',
    'low ash',
    'low oak',
    'low non',
    'low birch',
    'low yew',
    'low dawn'
];

exports.moods = [ // 3
    'whimsy',
    'strange',
    'fey'
];

exports.state = state;
function state(miliseconds) {
    var seconds = miliseconds / 1000 >>> 0;

    // 49 seconds per minute
    var second = seconds % 49 >>> 0;
    var minutes = seconds / 49 >>> 0;

    // 49 minutes per hour
    var minute = minutes % 49 >>> 0;
    var hours = minutes / 49 >>> 0;

    // 14 hours per day, 7 per half day
    var hour = hours % 14 >>> 0;
    var days = hours / 14 >>> 0;
    var halfDays = hours / 7 >>> 0;

    // 6 days per week
    // 12 named half days per week
    var weekday = halfDays % 12 >>> 0;
    var weeks = halfDays / 12 >>> 0;

    // 10 days per month
    var monthday = days % 10 >>> 0;
    var months = days / 10 >>> 0;

    // 13 weeks per celestial mood
    var weekOfMood = weeks / 13 >>> 0;
    var mood = weekOfMood % 3 >>> 0;

    // 10 months per year
    var month = months % 10 >>> 0;

    // 4 seasons per year
    var season = days / 25 % 4 >>> 0;

    // 25 days per season
    var seasonday = days % 25 >>> 0;

    var year = days / 100 >>> 0;

    return {
        mood: mood,
        season: season,
        year: year,
        month: month,
        seasonday: seasonday,
        monthday: monthday,
        weekday: weekday,
        hour: hour,
        minute: minute,
        second: second
    };
}

exports.namedState = namedState;
function namedState(miliseconds) {
    var state = exports.state(miliseconds);
    return {
        mood: toTitleCase(exports.moods[state.mood]),
        season: toTitleCase(exports.seasons[state.season] + 'umn'),
        year: state.year,
        month: toTitleCase(exports.months[state.month]),
        seasonday: toTitleCase(namedNumber(state.seasonday)),
        monthday: toTitleCase(exports.ten[state.monthday]),
        weekday: toTitleCase(exports.daynites[state.weekday]),
        hour: toTitleCase(exports.hours[state.hour]),
        minute: (state.minute + 49).toString(7).slice(-2),
        second: (state.second + 49).toString(7).slice(-2)
    };
}

exports.namedNumber = namedNumber;
function namedNumber(number) {
    if (number === 0) {
        return 'non';
    }
    var name, outerName = '', order = 0;
    do {
        name = '';
        if (number % 1000 === 0) {
            name = '';
        } else if (number % 1000 < 10) {
            name = exports.ten[number % 10];
        } else if (number % 1000 < 100) {
            name = namedNumber(number / 10 % 10 >>> 0) + 'ty';
            if (number % 10) {
                name = name + ' ' + namedNumber(number % 10);
            } else {
                name = name;
            }
        } else {
            name = namedNumber(number / 100 % 10 >>> 0) + 'ter';
            if (number % 100) {
                name = name + ' ' + namedNumber(number % 100);
            } else {
                name = name;
            }
        }
        if (order) {
            outerName = (
                name ?
                    (
                        name === 'firs' ?
                        '' :
                        name + ' '
                    ) +
                    namedNumber(order) + 'tion'
                :
                    ''
            ) + (
                outerName !== '' ?
                ' ' + outerName :
                ''
            );
        } else {
            outerName = name;
        }
        number = number / 1000 >>> 0;
        order++;
    } while (number);
    return outerName;
}

function toTitleCase(name) {
    return name.split(/\s+/).map(function (name) {
        return name.slice(0, 1).toUpperCase() + name.slice(1);
    }).join(' ');
}

