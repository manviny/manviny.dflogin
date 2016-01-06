'use strict';


angular.module('manviny.dflogin', [
	'ngRoute',
	'ngResource',
	'ngCookies'
])


.run([
	'$rootScope',

	function ($rootScope) {
		try {
			$rootScope.user = JSON.parse(window.localStorage.user)
		} catch (e) {}
	}
])

.run(function($log){
    $log.debug("App running")
})

.run([
	'$cookies', 'APP_API_KEY', '$http', '$rootScope', '$window',

	function ($cookies, APP_API_KEY, $http, $rootScope, $window) {
		$http.defaults.headers.common['X-Dreamfactory-API-Key'] = APP_API_KEY;
		$http.defaults.headers.common['X-DreamFactory-Session-Token'] = $cookies.session_token;
		if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
			$rootScope.isMobile = true;
		}

		angular.element($window).bind('scroll', function() {
			var windowHeight = 'innerHeight' in window ? window.innerHeight : document.documentElement.offsetHeight;
			var body = document.body, html = document.documentElement;
			var docHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight,  html.scrollHeight, html.offsetHeight);
			var windowBottom = windowHeight + window.pageYOffset;
			if (windowBottom >= docHeight) {
				$rootScope.$broadcast('SCROLL_END');
			}
		});
	}
])


.service('LoginHelper', [
	'$http', '$q', '$cookies', '$rootScope',

	function ($http, $q, $cookies, $rootScope) {
		this.initiate = function (options) {
			var deferred = $q.defer();
			
			$http.post('/api/v2/user/session/', options).then(function (result) {
				$http.defaults.headers.common['X-DreamFactory-Session-Token'] = result.data.session_token;
				$cookies.session_token = result.data.session_token;
				
				$rootScope.user = result.data;

				try {
					window.localStorage.user = JSON.stringify(result.data);
				} catch (e) { }

 				deferred.resolve();
			}, deferred.reject);

			return deferred.promise;
		};

		this.register = function (options) {
			var deferred = $q.defer();
			
			$http.post('/api/v2/user/register?login=true', options).then(function (result) {
				console.log(result);
 				deferred.resolve();
			}, deferred.reject);

			return deferred.promise;
		};
	}
])

.controller('LoginCtrl', [
	'$scope', 'LoginHelper', '$location', '$rootScope',

	function ($scope, LoginHelper, $rootScope) {
		console.debug("entrando en la sesión")
		$rootScope.isLoggedIn = false;
		$scope.submit = function () {
			LoginHelper.initiate({
				email: $scope.username,
				password: $scope.password
			}).then(function (data) {
				$rootScope.isLoggedIn = true;
				console.debug("sesión", data)
			});
		};
	}
])

.controller('LogoutCtrl', [ 
  '$http', '$scope', 'LoginHelper',  '$rootScope',

  function ($http, $scope, LoginHelper, $rootScope) {
  		console.debug("cerrando sesión");
    	$rootScope.isLoggedIn = true;
      	$scope.logout = function () {
      		$http({
      			method: 'DELETE',
      			url: '/api/v2/user/session'
      		}).success(function () {
      			delete $http.defaults.headers.common['X-DreamFactory-Session-Token'];
      			console.debug("sesión cerrada");
      		});
      	};
  }

])

.controller('RegisterCtrl', [
	'$scope', 'LoginHelper', '$location', '$rootScope',

	function ($scope, LoginHelper, $rootScope) {
		console.debug("registrandote")
		$rootScope.isLoggedIn = false;
		$scope.register = function () {
			LoginHelper.register({
				email: $scope.username,
				password: $scope.password,
				first_name: $scope.firstName || 'Anonimo',
				last_name: $scope.lastName || 'Anonimo'
			}).then(function () {
				console.debug("te has registrado")
			});
		};
	}
])


