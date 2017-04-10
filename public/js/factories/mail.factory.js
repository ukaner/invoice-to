'use strict';

angular.module('Application')
	.factory('mail', ['$resource', function($resource) {
        return $resource('/api/mail/:mailID', {mailID: '@mailID'},
            {
                get:    {method:'GET'},
                save:   {method:'POST'},
                query:  {method:'GET', isArray:true},
                remove: {method:'DELETE'},
                delete: {method:'DELETE'}
        });
    }]);




