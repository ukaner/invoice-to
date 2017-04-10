'use strict';

angular.module('Application')
    .filter('currency', function(currencyCodes) {
        return function(input, currency) {
            var value = input.toFixed(2);
            return currencyCodes.hasOwnProperty(currency) ? currencyCodes[currency] + value : value;
        }
    });