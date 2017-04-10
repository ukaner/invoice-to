'use strict';

angular.module('Application')
	.factory('charge', ['$resource', function($resource) {
        return $resource('/api/stripe/charge/', {},
            {
                save:   {method:'POST'}
        });
    }]);




