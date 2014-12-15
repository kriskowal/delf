module.exports = (function() {
  /*
   * Generated by PEG.js 0.7.0.
   *
   * http://pegjs.majda.cz/
   */

  function peg$subclass(child, parent) {
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
  }

  function SyntaxError(expected, found, offset, line, column) {
    function buildMessage(expected, found) {
      function stringEscape(s) {
        function hex(ch) { return ch.charCodeAt(0).toString(16).toUpperCase(); }

        return s
          .replace(/\\/g,   '\\\\')
          .replace(/"/g,    '\\"')
          .replace(/\x08/g, '\\b')
          .replace(/\t/g,   '\\t')
          .replace(/\n/g,   '\\n')
          .replace(/\f/g,   '\\f')
          .replace(/\r/g,   '\\r')
          .replace(/[\x00-\x07\x0B\x0E\x0F]/g, function(ch) { return '\\x0' + hex(ch); })
          .replace(/[\x10-\x1F\x80-\xFF]/g,    function(ch) { return '\\x'  + hex(ch); })
          .replace(/[\u0180-\u0FFF]/g,         function(ch) { return '\\u0' + hex(ch); })
          .replace(/[\u1080-\uFFFF]/g,         function(ch) { return '\\u'  + hex(ch); });
      }

      var expectedDesc, foundDesc;

      switch (expected.length) {
        case 0:
          expectedDesc = "end of input";
          break;

        case 1:
          expectedDesc = expected[0];
          break;

        default:
          expectedDesc = expected.slice(0, -1).join(", ")
            + " or "
            + expected[expected.length - 1];
      }

      foundDesc = found ? "\"" + stringEscape(found) + "\"" : "end of input";

      return "Expected " + expectedDesc + " but " + foundDesc + " found.";
    }

    this.expected = expected;
    this.found    = found;
    this.offset   = offset;
    this.line     = line;
    this.column   = column;

    this.name     = "SyntaxError";
    this.message  = buildMessage(expected, found);
  }

  peg$subclass(SyntaxError, Error);

  function parse(input) {
    var options = arguments.length > 1 ? arguments[1] : {},

        peg$startRuleFunctions = { dice: peg$parsedice },
        peg$startRuleFunction  = peg$parsedice,

        peg$c0 = null,
        peg$c1 = "d6",
        peg$c2 = "\"d6\"",
        peg$c3 = "+",
        peg$c4 = "\"+\"",
        peg$c5 = function(count, tail) {
                tail.unshift({sides: 6, count: count, min: 1});
                return tail;
            },
        peg$c6 = function(count) {
                return [{sides: 6, count: count, min: 1}];
            },
        peg$c7 = "c",
        peg$c8 = "\"c\"",
        peg$c9 = function(count, tail) {
                tail.unshift({sides: 2, count: count, min: 0});
                return tail;
            },
        peg$c10 = function(count) {
                return [{sides: 2, count: count, min: 0}];
            },
        peg$c11 = function(count) {
                return [{type: 0, count: count}];
            },
        peg$c12 = [],
        peg$c13 = function() {
                return [];
            },
        peg$c14 = function(characters) {
                return +characters;
            },
        peg$c15 = /^[0-9]/,
        peg$c16 = "[0-9]",
        peg$c17 = /^[1-9]/,
        peg$c18 = "[1-9]",
        peg$c19 = " ",
        peg$c20 = "\" \"",

        peg$currPos          = 0,
        peg$reportedPos      = 0,
        peg$cachedPos        = 0,
        peg$cachedPosDetails = { line: 1, column: 1, seenCR: false },
        peg$maxFailPos       = 0,
        peg$maxFailExpected  = [],
        peg$silentFails      = 0,

        peg$result;

    if ("startRule" in options) {
      if (!(options.startRule in peg$startRuleFunctions)) {
        throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
      }

      peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
    }

    function text() {
      return input.substring(peg$reportedPos, peg$currPos);
    }

    function offset() {
      return peg$reportedPos;
    }

    function line() {
      return peg$computePosDetails(peg$reportedPos).line;
    }

    function column() {
      return peg$computePosDetails(peg$reportedPos).column;
    }

    function peg$computePosDetails(pos) {
      function advance(details, startPos, endPos) {
        var p, ch;

        for (p = startPos; p < endPos; p++) {
          ch = input.charAt(p);
          if (ch === "\n") {
            if (!details.seenCR) { details.line++; }
            details.column = 1;
            details.seenCR = false;
          } else if (ch === "\r" || ch === "\u2028" || ch === "\u2029") {
            details.line++;
            details.column = 1;
            details.seenCR = true;
          } else {
            details.column++;
            details.seenCR = false;
          }
        }
      }

      if (peg$cachedPos !== pos) {
        if (peg$cachedPos > pos) {
          peg$cachedPos = 0;
          peg$cachedPosDetails = { line: 1, column: 1, seenCR: false };
        }
        advance(peg$cachedPosDetails, peg$cachedPos, pos);
        peg$cachedPos = pos;
      }

      return peg$cachedPosDetails;
    }

    function peg$fail(expected) {
      if (peg$currPos < peg$maxFailPos) { return; }

      if (peg$currPos > peg$maxFailPos) {
        peg$maxFailPos = peg$currPos;
        peg$maxFailExpected = [];
      }

      peg$maxFailExpected.push(expected);
    }

    function peg$cleanupExpected(expected) {
      var i = 0;

      expected.sort();

      while (i < expected.length) {
        if (expected[i - 1] === expected[i]) {
          expected.splice(i, 1);
        } else {
          i++;
        }
      }
    }

    function peg$parsedice() {
      var s0, s1, s2, s3, s4, s5, s6;

      s0 = peg$currPos;
      s1 = peg$parsecount();
      if (s1 !== null) {
        if (input.substr(peg$currPos, 2) === peg$c1) {
          s2 = peg$c1;
          peg$currPos += 2;
        } else {
          s2 = null;
          if (peg$silentFails === 0) { peg$fail(peg$c2); }
        }
        if (s2 !== null) {
          s3 = peg$parse_();
          if (s3 !== null) {
            if (input.charCodeAt(peg$currPos) === 43) {
              s4 = peg$c3;
              peg$currPos++;
            } else {
              s4 = null;
              if (peg$silentFails === 0) { peg$fail(peg$c4); }
            }
            if (s4 !== null) {
              s5 = peg$parse_();
              if (s5 !== null) {
                s6 = peg$parsecoins();
                if (s6 !== null) {
                  peg$reportedPos = s0;
                  s1 = peg$c5(s1, s6);
                  if (s1 === null) {
                    peg$currPos = s0;
                    s0 = s1;
                  } else {
                    s0 = s1;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }
      if (s0 === null) {
        s0 = peg$currPos;
        s1 = peg$parsecount();
        if (s1 !== null) {
          if (input.substr(peg$currPos, 2) === peg$c1) {
            s2 = peg$c1;
            peg$currPos += 2;
          } else {
            s2 = null;
            if (peg$silentFails === 0) { peg$fail(peg$c2); }
          }
          if (s2 !== null) {
            peg$reportedPos = s0;
            s1 = peg$c6(s1);
            if (s1 === null) {
              peg$currPos = s0;
              s0 = s1;
            } else {
              s0 = s1;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
        if (s0 === null) {
          s0 = peg$parsecoins();
        }
      }

      return s0;
    }

    function peg$parsecoins() {
      var s0, s1, s2, s3, s4, s5, s6;

      s0 = peg$currPos;
      s1 = peg$parsecount();
      if (s1 !== null) {
        if (input.charCodeAt(peg$currPos) === 99) {
          s2 = peg$c7;
          peg$currPos++;
        } else {
          s2 = null;
          if (peg$silentFails === 0) { peg$fail(peg$c8); }
        }
        if (s2 !== null) {
          s3 = peg$parse_();
          if (s3 !== null) {
            if (input.charCodeAt(peg$currPos) === 43) {
              s4 = peg$c3;
              peg$currPos++;
            } else {
              s4 = null;
              if (peg$silentFails === 0) { peg$fail(peg$c4); }
            }
            if (s4 !== null) {
              s5 = peg$parse_();
              if (s5 !== null) {
                s6 = peg$parseconstant();
                if (s6 !== null) {
                  peg$reportedPos = s0;
                  s1 = peg$c9(s1, s6);
                  if (s1 === null) {
                    peg$currPos = s0;
                    s0 = s1;
                  } else {
                    s0 = s1;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }
      if (s0 === null) {
        s0 = peg$currPos;
        s1 = peg$parsecount();
        if (s1 !== null) {
          if (input.charCodeAt(peg$currPos) === 99) {
            s2 = peg$c7;
            peg$currPos++;
          } else {
            s2 = null;
            if (peg$silentFails === 0) { peg$fail(peg$c8); }
          }
          if (s2 !== null) {
            peg$reportedPos = s0;
            s1 = peg$c10(s1);
            if (s1 === null) {
              peg$currPos = s0;
              s0 = s1;
            } else {
              s0 = s1;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
        if (s0 === null) {
          s0 = peg$parseconstant();
        }
      }

      return s0;
    }

    function peg$parseconstant() {
      var s0, s1;

      s0 = peg$currPos;
      s1 = peg$parsecount();
      if (s1 !== null) {
        peg$reportedPos = s0;
        s1 = peg$c11(s1);
      }
      if (s1 === null) {
        peg$currPos = s0;
        s0 = s1;
      } else {
        s0 = s1;
      }
      if (s0 === null) {
        s0 = peg$currPos;
        s1 = [];
        if (s1 !== null) {
          peg$reportedPos = s0;
          s1 = peg$c13();
        }
        if (s1 === null) {
          peg$currPos = s0;
          s0 = s1;
        } else {
          s0 = s1;
        }
      }

      return s0;
    }

    function peg$parsecount() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = peg$currPos;
      s2 = peg$parsecountCharacters();
      if (s2 !== null) {
        s2 = input.substring(s1, peg$currPos);
      }
      s1 = s2;
      if (s1 !== null) {
        peg$reportedPos = s0;
        s1 = peg$c14(s1);
      }
      if (s1 === null) {
        peg$currPos = s0;
        s0 = s1;
      } else {
        s0 = s1;
      }

      return s0;
    }

    function peg$parsecountCharacters() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = peg$parsedigit19();
      if (s1 !== null) {
        s2 = peg$parsedigits();
        if (s2 !== null) {
          s1 = [s1, s2];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }
      if (s0 === null) {
        s0 = peg$parsedigit();
      }

      return s0;
    }

    function peg$parsedigits() {
      var s0, s1;

      s0 = [];
      s1 = peg$parsedigit();
      if (s1 !== null) {
        while (s1 !== null) {
          s0.push(s1);
          s1 = peg$parsedigit();
        }
      } else {
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsedigit() {
      var s0;

      if (peg$c15.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c16); }
      }

      return s0;
    }

    function peg$parsedigit19() {
      var s0;

      if (peg$c17.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c18); }
      }

      return s0;
    }

    function peg$parse_() {
      var s0, s1;

      s0 = [];
      if (input.charCodeAt(peg$currPos) === 32) {
        s1 = peg$c19;
        peg$currPos++;
      } else {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c20); }
      }
      while (s1 !== null) {
        s0.push(s1);
        if (input.charCodeAt(peg$currPos) === 32) {
          s1 = peg$c19;
          peg$currPos++;
        } else {
          s1 = null;
          if (peg$silentFails === 0) { peg$fail(peg$c20); }
        }
      }

      return s0;
    }

    peg$result = peg$startRuleFunction();

    if (peg$result !== null && peg$currPos === input.length) {
      return peg$result;
    } else {
      peg$cleanupExpected(peg$maxFailExpected);
      peg$reportedPos = Math.max(peg$currPos, peg$maxFailPos);

      throw new SyntaxError(
        peg$maxFailExpected,
        peg$reportedPos < input.length ? input.charAt(peg$reportedPos) : null,
        peg$reportedPos,
        peg$computePosDetails(peg$reportedPos).line,
        peg$computePosDetails(peg$reportedPos).column
      );
    }
  }

  return {
    SyntaxError: SyntaxError,
    parse:       parse
  };
})();
