'use strict';

angular.module('Application')
    .directive("invoice", function() {
    return {
        restrict: 'EC',
        scope: {},
        controller: 'InvoiceController',
        controllerAs: 'ctrl',
        template: '<ng-include src="getTemplateUrl()"/>',
        bindToController: {
            invoiceId: '='
        },
        link: function(scope, element, attributes) {
             console.log(scope);
             console.log(element);
             console.log(attributes);
            $("#invByName").focus();
        }
    };
});