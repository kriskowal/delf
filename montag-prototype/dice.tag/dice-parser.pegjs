
dice
    = count:count "d6" _ "+" _ tail:coins {
        tail.unshift({sides: 6, count: count, min: 1});
        return tail;
    }
    / count:count "d6" {
        return [{sides: 6, count: count, min: 1}];
    }
    / coins

coins
    = count:count "c" _ "+" _ tail:constant {
        tail.unshift({sides: 2, count: count, min: 0});
        return tail;
    }
    / count:count "c" {
        return [{sides: 2, count: count, min: 0}];
    }
    / constant

constant
    = count:count {
        return [{type: 0, count: count}];
    }
    / {
        return [];
    }

count
    = characters:$(countCharacters) {
        return +characters;
    }

countCharacters
    = digit19 digits
    / digit

digits
    = digit+

digit
    = [0-9]

digit19
    = [1-9]

_ = " "*

