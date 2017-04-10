'use strict';

angular.module('Application')
    .directive("openPopupLink", function() {
    return {
        restrict: 'C',
        link: function(scope, element) {
            element.magnificPopup({
                callbacks: {
                    close: function() {
                        /* Fixes FF regression issue */
                        $(".menu-wrap").hide();
                        setTimeout(function() {
                            $(".menu-wrap").show();
                        }, 100);
                    }
                }
            });
        }
    };
});