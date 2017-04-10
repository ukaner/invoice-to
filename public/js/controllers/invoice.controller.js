'use strict';

angular.module('Application')
    .controller('InvoiceController', ['$scope', '$css', '$location', '$filter', '$compile', 'config', 'currencyCodes', 'invoice', 'mail', 'connect', 'charge',

        function($scope, $css, $location, $filter, $compile, config, currencyCodes, invoice, mail, connect, charge) {



            var baseURL = window.location.protocol + '//' + window.location.host + '/';

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
                totalPrice: 0,
                paid: 0,
                sixRule: 0,
                stripe: {
                    spk: '',
                    at: '',
                    su: ''
                }
            };

            var parameters = $location.search();

            if (parameters.template) {
                $scope.template = parameters.template;

                $css.bind('css/templates/' + $scope.template + '.css', $scope);
            } else {
                $css.bind('css/templates/default.css', $scope);
            }

            if (parameters.code) {
                var connectResponse = connect.save({}, {'code':parameters.code}, function () {

                    $scope.invoice.stripe = {
                            spk: connectResponse.data.stripe_publishable_key,
                            at: connectResponse.data.access_token,
                            su: connectResponse.data.stripe_user_id
                        };
                });
            }


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

                    console.log("view mode true");
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

                var invoiceResponse = invoice.get({invId: ctrl.invoiceId}, function() {

                    console.log(invoiceResponse);
                    $scope.invoice = {
                        items: invoiceResponse.data.items,
                        currency: matchCurrencySymbol(invoiceResponse.data.currency),
                        invNumber: invoiceResponse.data.invNumber,
                        invBy: invoiceResponse.data.invBy,
                        invByName: invoiceResponse.data.invByName,
                        invDate: invoiceResponse.data.invDate,
                        invTo: invoiceResponse.data.invTo,
                        invFor: invoiceResponse.data.invFor,
                        invRef: invoiceResponse.data.invRef,
                        invTerms: invoiceResponse.data.invTerms,
                        dueDate: invoiceResponse.data.dueDate,
                        paymentDate: invoiceResponse.data.paymentDate,
                        payDetails: invoiceResponse.data.payDetails,
                        vatp: invoiceResponse.data.vatp,
                        paid: invoiceResponse.data.paid != 0,
                        sixRule: invoiceResponse.data.sixRule != 0,
                        totalPrice: invoiceResponse.data.totalPrice,
                        stripe: invoiceResponse.data.stripe,
                        invId: invoiceResponse.data.invId
                    };

                    $("#menuSendInvoice").remove();
                    setTimeout(function() {
                        $('[contenteditable]').removeAttr('contenteditable');
                    }, 0);

                });
            };

            ctrl.saveToLocal = function() {
                simpleStorage.set("invoice", $scope.invoice);
            };

            ctrl.saveToMongo = function(intent) {
                var desc = [];
                var hour = [];
                var price = [];

                $scope.invoice.totalPrice = $scope.total();

                console.log($scope.invoice);
                console.log(baseURL);

                console.log('saving invoice')
                var invoiceResponse = invoice.save({}, $scope.invoice, function() {


                    console.log('invoice response')
                    console.log(invoiceResponse);

                    if (invoiceResponse.data.invId) {
                        ctrl.invoiceId = invoiceResponse.data.invId;
                        if (intent == "send") {
                            ctrl.sendMail();
                        } else {
                            console.log(baseURL + ctrl.invoiceId);

                            window.location.href = baseURL + ctrl.invoiceId;
                        }
                    } else {
                        console.log("Missing invoice ID");
                    }

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
                window.location.href = "https://connect.stripe.com/oauth/authorize?response_type=code&client_id=ca_AJhJyGnaN523vr6z7tY2COIMHlS3UAkw&scope=read_write&state=1234";
            };

            $scope.payStripe = function() {


                var token = function(result) {


                    console.log('result');
                    console.log(result);

                    var payload = {
                        'invoice_id': ctrl.invoiceId,
                        'token': result,
                    };
                    console.log('payload');
                    console.log(payload);

                    var chargeResponse = charge.save({}, payload, function() {


                        console.log('charge sent, response ....');
                        console.log(chargeResponse);

                        if(chargeResponse.result.status == 200) {
                            console.log(baseURL + ctrl.invoiceId);
                            window.location.href = baseURL + ctrl.invoiceId;
                        } else {
                            console.log('Error', chargeResponse.result.message);
                        }
                    });
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

                console.log('sending mail');

                var mailSubject = "You've got invoice!";
                var mailBody = prepareEmailBody($scope.email.body);

                var payload = {
                    inv_id: ctrl.invoiceId,
                    mail_from: $scope.email.from,
                    mail_to: $scope.email.to,
                    subject: mailSubject,
                    html_body: mailBody
                };

                var mailResponse = mail.save({}, payload, function() {


                    console.log('mail sent, response ....');
                    console.log(mailResponse);

                    if(mailResponse.result.status == 200) {
                        console.log(baseURL + ctrl.invoiceId);
                        window.location.href = baseURL + ctrl.invoiceId;
                    } else {
                        console.log('Error', mailResponse.result.message);
                    }



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

            $scope.getTemplateUrl = function() {

                if ($scope.template != undefined) {
                    return 'js/views/invoice-' + $scope.template +'.html';
                }
                return 'js/views/invoice-default.html';
            }

        }
    ]);

