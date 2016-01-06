'use strict';
  /**
   * @memberof manviny
   * @ngdoc factory
   * @name dfIO
   * @param {service} $q promises
   * @description 
   *   Manage all related fucntions to chat
   */ 

	angular.module('manviny.dflogin', [
		'ngRoute',
		'ngResource',
		'ngCookies'
	])


	// App startdet
	.run(function($log){
	    $log.debug("App running")
	})

	// user data global
	.run([
		'$rootScope',
		function ($rootScope) {
			try {
				$rootScope.user = JSON.parse(window.localStorage.user)
			} catch (e) {}
		}
	])

    /**
     * @memberof manviny
     * @ngdoc factory     
     * @desc
     *  . **Creates** user  in DinamoDB  
     *  . saves user in phone  
     * @param {String} name debe ser un email
     */
	.factory('httpInterceptor', function (INSTANCE_URL) {
	 return {
	  request: function (config) {
	   // Prepend instance url before every api call
	   if (config.url.indexOf('/api/v2') > -1) {
	   config.url = INSTANCE_URL + config.url;
	    };
	  return config;
	  }
	  }
	})

.config([
 '$httpProvider',
  function ($httpProvider) {
   $httpProvider.interceptors.push('httpInterceptor');
  }
])

.run([
  '$http', 'DSP_API_KEY',
  function ($http, DSP_API_KEY) {
   $http.defaults.headers.common['X-Dreamfactory-API-Key'] = DSP_API_KEY;
  }
])

.service('Login', [
  '$http', '$q', '$rootScope',
  function ($http, $q, $rootScope) {
   var handleResult = function (result) {
   // set default header for every call
   $http.defaults.headers.common['X-DreamFactory-Session-Token'] = result.data.session_token;
   $rootScope.user = result.data
   };
   // login user
   this.login = function (creds) {
    var deferred = $q.defer();
    $http.post('/api/v2/user/session', creds).then(function (result) {
     handleResult(result);
     deferred.resolve(result.data);
    }, deferred.reject);
    return deferred.promise;
   };
   //register new user
   this.register = function () {
    var deferred = $q.defer();
    $http.post('/api/v2/user/register?login=true', options).then(function (result) {
     handleResult(result)
     deferred.resolve(result.data);
    }, deferred.reject);
    return deferred.promise;
   }
  }
])