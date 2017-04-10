'use strict';

angular.module('Application')
	.factory('connect', ['$resource', function($resource) {
        return $resource('/api/stripe/connect/', {},
            {
                save:   {method:'POST'}
        });
    }]);




