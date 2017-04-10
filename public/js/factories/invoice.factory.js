'use strict';

angular.module('Application')
	.factory('invoice', ['$resource', function($resource) {
        return $resource('/api/invoice/:invId', {invId: '@invId'},
            {
                get:    {method:'GET'},
                save:   {method:'POST'},
                query:  {method:'GET', isArray:true},
                remove: {method:'DELETE'},
                delete: {method:'DELETE'}
        });
    }]);




