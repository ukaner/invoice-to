'use strict';

angular.module('Application')
	.factory('user', ['$resource', function($resource) {
        return $resource('/api/user/:userId', {userId: '@userId'},
            {
                get:    {method:'GET'},
                save:   {method:'POST'},
                query:  {method:'GET', isArray:true},
                remove: {method:'DELETE'},
                delete: {method:'DELETE'}
        });
    }]);




