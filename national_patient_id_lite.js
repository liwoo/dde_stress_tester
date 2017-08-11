/**
 * Created by chimwemwe on 9/17/15.
 */

"use strict"

var NationalPatientIDLite = function () {

    var base_map = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'C', 'D', 'E', 'F', 'G',
        'H', 'J', 'K', 'L', 'M', 'N', 'P', 'R', 'T', 'U', 'V', 'W', 'X', 'Y'];

    var reverse_map = {
        '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5,
        '6': 6, '7': 7, '8': 8, '9': 9,
        'A': 10, 'C': 11, 'D': 12, 'E': 13, 'F': 14, 'G': 15,
        'H': 16, 'J': 17, 'K': 18, 'L': 19, 'M': 20, 'N': 21,
        'P': 22, 'R': 23, 'T': 24, 'U': 25, 'V': 26, 'W': 27,
        'X': 28, 'Y': 29
    };

    var gBase = 30;

    function checkDigit(num) {

        var number = String(num);

        var tokens = number.split("");

        var parity = tokens.length % 2;

        var sum = 0;

        for (var i = 0; i < tokens.length; i++) {

            var digit = parseInt(tokens[i]);

            if ((i % 2) == parity) {

                digit = digit * 2;

            }

            if (digit > 9) {

                digit -= 9;

            }

            sum += digit;

        }

        var checkDig = 0;

        while ((sum + checkDig) % 10 != 0) {

            checkDig++;

        }

        return checkDig;

    }

    function toDecimal(num, src_base) {

        if (!src_base)
            src_base = 30;

        var decimal = 0;

        var number = String(num).replace(/\-/g, "").split("").reverse();

        for (var i = 0; i < number.length; i++) {

            decimal += (reverse_map[number[i]] * (Math.pow(src_base, i)));

        }

        return decimal;

    }

    function convert(num) {

        var results = "";

        var quotient = parseInt(num);

        while (quotient > 0) {

            results = base_map[(quotient % gBase)] + results;

            quotient = Math.floor(quotient / gBase);

        }

        return results;

    }

    function valid(num) {

        var coreId = Math.floor(parseInt(num) / 10);

        var checkDig = parseInt(num) % 10;

        var result = checkDigit(coreId);

        return (checkDig == result);

    }

    function padZeros(number, positions) {

        var zeros = parseInt(positions) - String(number).length;
        var padded = "";

        for (var i = 0; i < zeros; i++) {
            padded += "0";
        }

        padded += String(number);

        return padded;

    }

    function npidValid(npid) {

        var tokens = String(npid).replace(/\-/g, "").split("");

        if ((process.env.NODE_ENV || "production").toLowerCase() != "test")
            console.log(tokens);

        for (var i = 0; i < tokens.length; i++) {

            if (!reverse_map[tokens[i]] && tokens[i] != '0') {

                if ((process.env.NODE_ENV || "production").toLowerCase() != "test")
                    console.log("Exited because of %s for %s", tokens[i], npid);

                return false;

            }

        }

        var number = toDecimal(npid);

        var result = valid(number);

        return result;

    }

    function initialize(num, size, checkDigitSource, srcBase, base) {

        if (!srcBase)
            srcBase = 10;

        if (!base)
            base = 30;

        if (!size)
            size = 6;

        if (checkDigitSource == undefined)
            checkDigitSource = true;

        if (num != undefined && srcBase == 10) {

            num = parseInt(num);

            if (checkDigitSource) {

                num = (num * 10) + checkDigit(num);

            }

        }

        var decimalId = toDecimal(num, srcBase);

        gBase = base;

        var value;

        if (!checkDigitSource) {

            value = padZeros(convert(decimalId), (size - 1));

            var cDigit = checkDigit(decimalId);

            value = value + cDigit;

        } else {

            value = padZeros(convert(decimalId), size);

        }

        return value;

    }

    this.checkDigit = checkDigit;

    this.toDecimal = toDecimal;

    this.valid = valid;

    this.npidValid = npidValid;

    this.padZeros = padZeros;

    this.convert = convert;

    this.init = initialize;

}

module.exports = new NationalPatientIDLite;
