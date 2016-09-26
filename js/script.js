var baseURL = window.location.protocol + '//' + window.location.host + '/';

var app = angular.module('Application', ['ngResource']);

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

app.factory('Api', function($resource) {
    var URL = baseURL + 'api.php';
    return $resource(URL);
});

app.factory('Sendmail', function($resource) {
    var URL = baseURL + 'sendmail.php';
    return $resource(URL);
});

app.filter('currency', function(currencyCodes) {
    return function(input, currency) {
        var value = input.toFixed(2);
        return currencyCodes.hasOwnProperty(currency) ? currencyCodes[currency] + value : value;
    };
});

app.directive("contenteditable", function() {
    return {
        restrict: "A",
        require: "ngModel",
        link: function(scope, element, attrs, ngModel) {
            function read() {
                ngModel.$setViewValue(element.html());
            }
            ngModel.$render = function() {
                element.html(ngModel.$viewValue || "");
            };
            element.bind("blur keyup change", function() {
                scope.$apply(read);
            });
        }
    };
});

app.controller('ApplicationController', ApplicationController);
ApplicationController.$inject = ['$scope'];
function ApplicationController($scope) {
    var body = document.body;
    var content = document.querySelector('.content-wrap');
    var openBtn = document.getElementById('open-button');
    var closeBtn = document.getElementById('close-button');

    function toggleMenu() {
        var body = document.body;
        if (classie.has(body, 'show-menu')) {
            classie.remove(body, 'show-menu');
        } else {
            classie.add(body, 'show-menu');
        }
    }

    openBtn.addEventListener('click', toggleMenu);
    if (closeBtn) {
        closeBtn.addEventListener('click', toggleMenu);
    }

    $("#icon-list").children().each(function() {
        $(this).click(function() {
            toggleMenu();
        });
    });

    body.addEventListener('click', function(event) {
        var target = event.target;
        if (classie.has(body, 'show-menu') && target !== openBtn) {
            toggleMenu();
        }
    });

    var ctrl = this;

    // @todo use ng routing instead
    page('', init);
    page('/about', about);
    page('/index.php', init);
    page('/stripe_connect.php', init);
    page('/charge.php', charge);
    page('/:id', invoice);
    page();

    function init() {}

    function about() {
        init();
    }

    function charge() {
        init();
    }

    function invoice(context) {
        init();
        simpleStorage.flush();
        document.title = "Invoice";
        ctrl.invoiceId = context.params.id;
        $('meta[name=robots]').attr('content', 'noindex');
    }

    $scope.clearInvoice = function() {
        simpleStorage.flush();
        window.location.href = baseURL;
    };

    $scope.printInvoice = function() {
        setTimeout(function () {
            window.print();
        }, 1000);
    };
}

app.directive('invoice', InvoiceDirective);
InvoiceDirective.$inject = ['templateBase'];
function InvoiceDirective(templateBase) {
    return {
        restrict: 'EC',
        scope: {},
        controller: 'InvoiceController',
        controllerAs: 'ctrl',
        templateUrl: function() {
            return templateBase + '/invoice.html';
        },
        bindToController: {
            invoiceId: '='
        },
        link: function() {
            $("#invByName").focus();
        }
    };
}

app.controller('InvoiceController', InvoiceController);
InvoiceController.$inject = ['$scope', '$filter', '$compile', 'config', 'currencyCodes', 'Api', 'Sendmail'];
function InvoiceController($scope, $filter, $compile, config, currencyCodes, Api, Sendmail) {
    var ctrl = this;
    var todayDate = $filter('date')(new Date(), 'mediumDate');
    var dueDate = $filter('date')((new Date()).addDays(config.dueDays), 'mediumDate');

    $scope.viewMode = false;

    $scope.invoice = {
        items: [],
        currency: config.currency,
        invNumber: '',
        invBy: '',
        invByName: '',
        invDate: todayDate,
        invTo: '',
        invFor: '',
        invRef: '',
        invTerms: '',
        dueDate: dueDate,
        paymentDate: '',
        payDetails: '',
        vatp: config.vatp,
        paid: false,
        stripe: {
            spk: '',
            at: '',
            su: ''
        }
    };

    $scope.$watch('ctrl.invoiceId', function(data) {
        if (typeof data === 'undefined') {
            ctrl.loadFromLocal();
            if (window.hasOwnProperty('stripe_spk')) {
                $scope.invoice.stripe = {
                    spk: stripe_spk,
                    at: stripe_at,
                    su: stripe_su
                };
            }
        } else {
            $scope.viewMode = true;
            ctrl.loadFromMongo();
        }
        $scope.currency = $scope.invoice.currency;
    });

    $scope.$watch('invoice', function() {
        if ($scope.viewMode == false) {
            ctrl.updateEmailBody();
            ctrl.hasEmptyRow() == false && $scope.addItem();
            ctrl.saveToLocal();
            $(".unit, .price").numeric({negative: false});
        }
    }, true);

    $scope.$watch('currency', function(currency) {
        var lc_currency = currency.toString().toLowerCase();
        if (currencyCodes.hasOwnProperty(lc_currency)) {
            $scope.invoice.currency = lc_currency;
        }
    });

    $scope.email = {
        from: '',
        to: '',
        body: '<p>Hi there,</p><br/>' +
        '<p>Was pleasure working with you on <invFor></invFor>. Appreciate your business and timely payment.</p><br/>' +
        '<p class="invLink" id="invLink">(The invoice link will be here)</p><br/>' +
        '<p>Sincerely,</p>' +
        '<p id="senderName">Jack Smith</p>'
    };

    $scope.addItem = function() {
        $scope.invoice.items.push({
            description: '',
            unit: '',
            price: ''
        });
    };

    $scope.deleteItem = function(index) {
        $scope.invoice.items.splice(index, 1);
    };

    ctrl.loadFromLocal = function() {
        var key = 'invoice';
        if (simpleStorage.hasKey(key)) {
            $scope.invoice = simpleStorage.get(key);
        }
    };

    ctrl.loadFromMongo = function() {
        var query = {
            type: 'get',
            invID: ctrl.invoiceId
        };

        var matchCurrencySymbol = function(symbol) {
            for (var prop in currencyCodes) {
                if (prop === symbol.toLowerCase()) {
                    return prop;
                }
                if (currencyCodes[prop] === symbol) {
                    return prop;
                }
            }
            return '';
        };

        Api.get(query, function(response) {
            $scope.invoice = {
                items: [],
                currency: matchCurrencySymbol(response.currency),
                invNumber: response.invNumber,
                invBy: response.invBy,
                invByName: response.invByName,
                invDate: response.invDate,
                invTo: response.invTo,
                invFor: response.invFor,
                invRef: response.invRef,
                invTerms: response.invTerms,
                dueDate: response.dueDate,
                paymentDate: response.paymentDate,
                payDetails: response.payDetails,
                vatp: response.vatp,
                paid: response.paid ? (response.paid !== 'false') : false,
                stripe: {
                    spk: response.spk,
                    at: response.at,
                    su: response.su
                },
                invId: response.invId
            };

            var isItemDescProperty = function(prop) {
                var match = 'itemDesc';
                return prop.toString().substr(0, match.length) === match;
            };
            var itemDescProperties = Object.getOwnPropertyNames(response).filter(isItemDescProperty).sort();

            angular.forEach(itemDescProperties, function(property) {
                var description = response[property];
                var unit = response[property.replace('Desc', 'Hour')];
                var price = response[property.replace('Desc', 'Price')];
                if (description.length) {
                    $scope.invoice.items.push({
                        description: description,
                        unit: unit,
                        price: price
                    });
                }
            });

            $("#menuSendInvoice").remove();
            setTimeout(function() {
                $('[contenteditable]').removeAttr('contenteditable');
            }, 0);

        }, function(error) {
            console.log('Error', error);
        });
    };

    ctrl.saveToLocal = function() {
        simpleStorage.set("invoice", $scope.invoice);
    };

    ctrl.saveToMongo = function(intent) {
        var desc = [];
        var hour = [];
        var price = [];

        angular.forEach($scope.invoice.items, function(item) {
            desc.push(item.description);
            hour.push(item.unit);
            price.push(item.price);
        });

        var payload = angular.toJson({
            invoice: {
                paid: $scope.invoice.paid,
                staticData: $scope.invoice,
                desc: desc,
                hour: hour,
                price: price,
                totalPrice: $scope.total(),
                currency: $scope.invoice.currency,
                spk: $scope.invoice.stripe.spk,
                at: $scope.invoice.stripe.at,
                su: $scope.invoice.stripe.su
            }
        });

        Api.save({type: 'create'}, payload, function(response) {
            if (response.invId) {
                ctrl.invoiceId = response.invId;
                if (intent == "send") {
                    ctrl.sendMail();
                } else {
                    window.location.href = baseURL + ctrl.invoiceId;
                }
            } else {
                console.log("Missing invoice ID");
            }
        }, function(error) {
            console.log('Error', error);
        });
    };

    ctrl.hasEmptyRow = function() {
        if ($scope.invoice.items.length == 0) {
            return false;
        }
        var initialValue = false;
        return !! $scope.invoice.items.reduce(function(previousValue, currentValue) {
            return previousValue || (!currentValue.description && !currentValue.unit && !currentValue.price);
        }, initialValue);
    };

    $scope.subtotal = function() {
        return $scope.invoice.items.reduce(function(previousValue, currentValue) {
            return previousValue + currentValue.unit * currentValue.price;
        }, 0);
    };

    $scope.vat = function() {
        return $scope.subtotal() * $scope.invoice.vatp / 100;
    };

    $scope.total = function() {
        return $scope.subtotal() + $scope.vat();
    };

    $scope.connectStripe = function() {
        window.location.href = "https://connect.stripe.com/oauth/authorize?response_type=code&client_id=ca_5atlLM2xPkC35t8Inzy9niMkIUJqYUuN&scope=read_write&state=1234";
    };

    $scope.payStripe = function() {
        var form = $('#charge-form');
        var token = function(result) {
            form.append($('<input>').attr({ type: 'hidden', name: 'stripeToken', value: result.id })).submit();
        };
        StripeCheckout.open({
            key: $scope.invoice.stripe.spk,
            amount: $scope.total() * 100,
            currency: $scope.invoice.currency,
            name: 'INVOICE',
            description: $scope.invoice.invByName,
            panelLabel: 'Pay Now ',
            token: token
        });
    };

    $scope.sendInvoice = function() {
        $("#sendButton").prop("disabled", true);
        if (!isValidEmailAddress($scope.email.from) || !isValidEmailAddress($scope.email.to) || $scope.email.body == "") {
            shake($("#sendPopup"));
            $scope.validateField("#sendFrom");
            $scope.validateField("#sendTo");
        } else {
            ctrl.saveToMongo("send");
        }
        $("#sendButton").prop("disabled", false);
    };

    $scope.validateField = function(id) {
        var field = $(id);
        if (!isValidEmailAddress(field.val())) {
            field.removeClass("inputField");
            field.addClass("inputFieldError");
            shake(field);
        } else {
            field.addClass("inputField");
            field.removeClass("inputFieldError");
        }
    };

    ctrl.sendMail = function() {
        var mailSubject = "You've got invoice!";
        var mailBody = prepareEmailBody($scope.email.body);
        var request = {
            from_email: $scope.email.from,
            mailTo: $scope.email.to,
            mailFrom: $scope.email.from,
            mailSubject: mailSubject,
            mailBody: mailBody
        };
        Sendmail.get(request, function(response) {
            var mongoData = angular.toJson({
                invId: ctrl.invoiceId,
                senderEmail: $scope.email.from,
                receiverEmail: $scope.email.to
            });
            Api.save({type: 'save_email'}, mongoData, function(response) {
                window.location.href = baseURL + ctrl.invoiceId;
            }, function(error) {
                console.log('Error', error);
            });
        }, function(error) {
            console.log('Error', error);
        });
    };

    ctrl.updateEmailBody = function() {
        var re = /(<invFor\b[^>]*>)[^<>]*(<\/invFor>)/i;
        $scope.email.body = $scope.email.body.replace(re, "$1" + $scope.invoice.invFor + "$2");
    };

    function shake(arg) {
        TweenMax.fromTo(arg, 0.01, {x: -2}, {x: 2, clearProps: "x", repeat: 20})
    }

    function isValidEmailAddress(emailAddress) {
        var pattern = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
        return pattern.test(emailAddress);
    }

    function prepareEmailBody(html) {
        var wrapped = $("<div>" + html.trim() + "</div>");
        var paragraphs = $(wrapped).find("p");
        var result = "";

        for (var i = 0; i < paragraphs.length; i++) {
            if ($(paragraphs[i]).attr("id") == "invLink") {
                var url = baseURL + ctrl.invoiceId;
                result += url;
            } else {
                var s = "<p>" + $(paragraphs[i]).text() + "</p>";
                result += s;
            }
        }

        return result;
    }
}

app.directive('openPopupLink', DirectiveOpenPopupLink);
function DirectiveOpenPopupLink() {
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
}

Date.prototype.addDays = function(days) {
    var d = new Date(this.valueOf());
    d.setDate(d.getDate() + days);
    return d;
};
