'use strict';

angular.module('Application')
    .controller('ApplicationController', ['$scope', '$location',  '$window', 'user',

        function ($scope, $location, $window, user) {

            var baseURL = window.location.protocol + '//' + window.location.host + '/';


            var parameters = $location.search();

            if (parameters.template) {
                $scope.template = parameters.template;
            } else {
                $scope.template = 'default';
            }


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
            //page('/about', about);
            //page('/index.php', init);
            //page('/stripe_connect.php', init);
            //page('/charge.php', charge);
            //page('/template/:template', template);
            page('/:id', invoice);
            //page('/template/:template/:id', templateInvoice);
            page();

            function init() {

            }

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




            (function() {
                var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
                po.src = 'https://apis.google.com/js/platform.js?onload=gapiCallback';
                var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
            })();

            $window.gapiCallback = function(){
                console.log("Google API loaded");

                gapi.load('auth2', function() {

                    console.log('scopes');

                    scopes = 'https://www.googleapis.com/auth/userinfo.email';
                    scopes += ' https://www.googleapis.com/auth/userinfo.profile';
                    scopes += ' https://www.googleapis.com/auth/drive';
                    scopes += ' https://www.googleapis.com/auth/calendar';
                    scopes += ' https://www.googleapis.com/auth/gmail.send';
                    scopes += ' https://www.googleapis.com/auth/plus.login';
                    scopes += ' https://www.googleapis.com/auth/contacts';
                    scopes += ' https://www.googleapis.com/auth/user.addresses.read';
                    scopes += ' https://www.googleapis.com/auth/user.birthday.read';
                    scopes += ' https://www.googleapis.com/auth/user.emails.read';
                    scopes += ' https://www.googleapis.com/auth/user.phonenumbers.read';
                    scopes += ' https://www.googleapis.com/auth/gmail.modify'
                    scopes += ' https://www.googleapis.com/auth/gmail.send'
                    scopes += ' https://www.googleapis.com/auth/gmail.compose'

                    console.log(scopes);

                    gapi.auth2.init(
                            {   // secret 8LTHiLVAK7I4CBdbctcv6-1I
                                client_id: '13080620159-basbjd4bem952iumjdh94tol45n53745',
                                cookiepolicy: 'single_host_origin',
                                scope: scopes
                            }
                    );
                    var GoogleAuth  = gapi.auth2.getAuthInstance();

                    $scope.connectGoogle = function(){

                        console.log('connecting...');

                        GoogleAuth.signIn().then(function(response){

                            console.log(response);

                            var payload = {
                                'google_id': response.El,
                                'img': response.w3.Paa,
                                'email': response.w3.U3,
                                'name_full': response.w3.ig,
                                'name_first': response.w3.ofa,
                                'name_last': response.w3.wea,
                                'access_token': response.Zi.access_token,
                                'expires_at': response.Zi.expires_at,
                                'first_issued_at': response.Zi.first_issued_at
                            };
                            console.log(payload);

                            var userResponse = user.save({}, payload, function() {


                                console.log('user sent, response ....');
                                console.log(userResponse);

                                if(userResponse.result.status == 200) {

                                    console.log('logged in');
                                } else {
                                    console.log('Error', userResponse.result.message);
                                }
                            });
                        });
                    };

                });
            }

            function passGoogleData(authG){

                var authObject = authHandler.save({name:'google'},{
                  "access_token" : authG.Zi['access_token'],
                  "email" : authG.w3['U3'],
                  "google_plus_user_id" : authG.w3['Eea']
                }, function() {
                    console.log("Handshake attempt");
                    handShake(authObject['data'],"google");
                });
            }

            function handShake(data,ref){

                /*

                $scope.userData=data.user;
                $scope.userForm=false;
                $cookies.put('shippn_user', JSON.stringify(data.user));
                //update header
                $scope.$root.body_user_object=data.user;
                $scope.$root.userprofileimg="assets/img/nobody-256.jpg";
                //token set on session
                localStorage.setItem('token', data.token);
                localStorage.setItem('is_phone_verified', data.user.is_phone_verified);
                localStorage.setItem('is_email_verified', data.user.is_email_verified);
                localStorage.setItem('userId', data.user.id);

                if($scope.userData.type==2&&ref=="signin"){
                    if(!Boolean($scope.userData.addresses)){
                        $location.url('/become-a-host/details');
                        return;
                    }else if(localStorage.is_phone_verified==0){
                        $location.url('/become-a-host/');
                        return;
                    }else if(localStorage.is_email_verified==0){
                        $location.url('/become-a-host/');
                        return;
                    }
                }

                if(localStorage.is_phone_verified==0){
                    $scope.userForm=false;
                    $scope.userPhoneVerification=true;
                }else if(localStorage.is_email_verified==0){
                    $scope.userForm=false;
                }else{
                    if($scope.userData.type==2&&!Boolean($scope.userData.addresses)){
                        $location.url('/become-a-host/details');
                        return;
                    }else{
                        $location.url('/');
                        return;
                    }
                }

                if(!data.user.is_phone_verified){
                    $scope.userPhoneVerification=true;
                    ga("set", "page", "/verify_your_phone_number");
                    ga("send", "pageview");
                }else{
                    //Google Analytics Conversion
                    ga("set", "page", "/member_login");
                    ga("send", "pageview");

                    if($cookies.get('shippn_pathafterlogin')!=null){
                        console.log("go back page");
                        var nextLoc=$cookies.get('shippn_pathafterlogin');
                        $cookies.remove('shippn_pathafterlogin');
                        $location.url(nextLoc);
                    }else{
                        console.log("go home");
                        $location.url('./');
                        $route.reload();
                    }
                }

                */
            }





        }
    ]);
