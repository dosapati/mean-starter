'use strict';

angular.module('angularRestfulAuth', [
    'ngStorage',
    'ngRoute','ui.router'
])
.config(['$stateProvider','$urlRouterProvider','$routeProvider', '$httpProvider','$locationProvider', function ($stateProvider,$urlRouterProvider,$routeProvider, $httpProvider,$locationProvider) {
  $urlRouterProvider.otherwise("/");
  $locationProvider.html5Mode(true);
  $stateProvider
    .state('anon', {
      url: "/",
      templateUrl: 'views/partials/home.html',
      controller: 'HomeCtrl'
    })
    .state('signin', {
      url: "/signin",
      templateUrl: 'views/partials/signin.html',
      controller: 'HomeCtrl'
    })
    .state('signup', {
      url: "/signup",
      templateUrl: 'views/partials/signup.html',
      controller: 'HomeCtrl'
    })
    .state('user', {
      url: "/me",
      templateUrl: 'views/partials/me.html',
      controller: 'HomeCtrl'
    })



    /*$routeProvider.
        when('/', {
            templateUrl: 'views/partials/home.html',
            controller: 'HomeCtrl'
        }).
        when('/signin', {
            templateUrl: 'views/partials/signin.html',
            controller: 'HomeCtrl'
        }).
        when('/signup', {
            templateUrl: 'views/partials/signup.html',
            controller: 'HomeCtrl'
        }).
        when('/me', {
            templateUrl: 'views/partials/me.html',
            controller: 'HomeCtrl'
        }).
        otherwise({
            redirectTo: '/'
        });*/
    //Note : We can't use state here, since it's circular loop. AngularJs error
    $httpProvider.interceptors.push(['$q', '$location', '$localStorage', function($q, $location, $localStorage) {
            return {
                'request': function (config) {
                    config.headers = config.headers || {};
                    if ($localStorage.token) {
                        config.headers.Authorization = 'Bearer ' + $localStorage.token;
                    }
                    return config;
                },
                'responseError': function(response) {
                    if(response.status === 401 || response.status === 403) {
                        $location.path('/signin');
                        //$state.go('anon.login');
                    }
                    return $q.reject(response);
                }
            };
        }]);

    }
]);