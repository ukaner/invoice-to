var app = angular.module('Application', ['ngResource', 'angularCSS']);


app.config(['$locationProvider', function($locationProvider) {

    $locationProvider.html5Mode(true).hashPrefix('!');
}]);

app.value('currencyCodes', {
    eur: '€',
    usd: '$',
    gbp: '£'
});

app.value('config', {
    currency: 'usd',
    dueDays: 14,
    vatp: 10
});

app.value('templateBase', 'js/views');


Date.prototype.addDays = function(days) {
    var d = new Date(this.valueOf());
    d.setDate(d.getDate() + days);
    return d;
};
