'use strict';
  /**
   * @memberof manviny.dreamfactory
   * @ngdoc module
   * @name dreamfactory
   * @param {service} $q promises
   * @description 
   *   Manage all related fucntions to chat
   */ 

	angular.module('manviny.dreamfactory', [])


    /**
     * user global
     * @memberof manviny
     * @ngdoc run     
     * @name log        
     */
	.run(function($log){
	    $log.debug("App running")
	})

    /**
     * user global
     * @memberof manviny
     * @ngdoc run  
     * @name rootScope           
     */
	.run(['$rootScope', function ($rootScope) {
			try {
				$rootScope.user = JSON.parse(window.localStorage.user)
			} catch (e) {}
		}
	])

    /**
     * @memberof manviny
     * @ngdoc factory     
     * @name httpInterceptor       
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


    /**
     * httpProvider
     * @memberof manviny
     * @ngdoc config   
     * @name httpProvider  
     */
    .config([ '$httpProvider', function ($httpProvider) {
     	$httpProvider.interceptors.push('httpInterceptor');
     }
    ])

    /**
     * '$http', 'DSP_API_KEY'
     * @memberof manviny
     * @ngdoc run  
     * @name DSP_API_KEY          
     */
	.run(['$http', 'DSP_API_KEY',function ($http, DSP_API_KEY) {
	   $http.defaults.headers.common['X-Dreamfactory-API-Key'] = DSP_API_KEY;
	 }])


	/**
     * @memberof manviny	
	 * @ngdoc service
	 * @name DFUser
	 * @description
	 *   allows login, register and logout
	 */     
	.service('DFUser', [ '$http', '$q', '$rootScope', function ($http, $q, $rootScope) {

	    /**
	     * set default header for every call
	     * @memberof DFUser
	     * @function handleResult
	 	 * @name handleResult	     
		 * @param {result} 
		 * @returns {data} data
	     */		 	
		var handleResult = function (result) {
			$http.defaults.headers.common['X-DreamFactory-Session-Token'] = result.data.session_token;
			$rootScope.user = result.data
		};

		/**
		* login user
		* @memberof DFUser
	 	* @function login	 		
		* @param {creds} email,password
		* @returns {Hash} filterd attributes
		*/
		this.login = function (creds) {
			var deferred = $q.defer();
			$http.post('/api/v2/user/session', creds).then(function (result) {
				 handleResult(result);
				 deferred.resolve(result.data);
			}, deferred.reject);
			return deferred.promise;
		};
		/**
		* logout user
		* @memberof DFUser
	 	* @function logout	 		
		* @param {creds} email,password
		* @returns {Hash} filterd attributes
		*/
		this.logout = function (creds) {
			var deferred = $q.defer();
      		$http({
      			method: 'DELETE',
      			url: '/api/v2/user/session'
      		}).success(function (result) {
      			delete $http.defaults.headers.common['X-DreamFactory-Session-Token'];
      			deferred.resolve(result);
      		});
			return deferred.promise;
		};

		/**
		* register new user
		* @memberof DFUser
	 	* @function register	 			
		* @param {creds} email,password,first_name,last_name
		* @returns {Hash} filterd attributes
		*/
		this.register = function () {
			var deferred = $q.defer();
			$http.post('/api/v2/user/register?login=true', options).then(function (result) {
				handleResult(result)
				deferred.resolve(result.data);
			}, deferred.reject);
			return deferred.promise;
		}

		/**
		* register new user
		* @memberof DFUser
	 	* @function getRole	 			
		* @param {creds} email,password,first_name,last_name
		* @returns {Hash} filterd attributes
		*/
		this.getRole = function (roleID) {
			var deferred = $q.defer();
			$http({
			  method: 'POST',
			  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			  url: 'http://dreamfactory.jrc-sistemas-naturales.bitnamiapp.com/rest/system/script/userrole/',
			  data: $.param({ is_user_script:true, id:roleID }), // Make sure to inject the service
			})
			.success(function(response) { 
				console.debug("role data",response.script_result); 
				deferred.resolve(response.script_result)
			});
			return deferred.promise;
		}


	}])


	/**
     * @memberof manviny	
	 * @ngdoc service
	 * @name DFS3
	 * @description
	 *   Services to use S3
	 */     
	.service('DFS3', [ '$http', '$q', '$rootScope', function ($http, $q, $rootScope) {


		/**
		* Get bucket
		* @memberof DFS3
	 	* @function getBucket	 		
		* @param {creds} email,password
		* @returns {Hash} filterd attributes
		*/
		this.getBucket = function (path) {
			var deferred = $q.defer();
			$http.get('/api/v2/S3/'+ path.replace(/^\/|\/$/g, '') +'/?include_folders=true&include_files=true').then(function (result) {
				//  handleResult(result);
				 deferred.resolve(result.data);
			}, deferred.reject);
			return deferred.promise;
		};

		/**
		* creates file in S3
		* @memberof DFS3
	 	* @function getBucket	 		
		* @param {path,name} path in S3, name of the file
		* @returns {Hash} filterd attributes
		*/
		this.createFile = function (path, name) {
			var deferred = $q.defer();
			$http.post('/api/v2/S3/'+ path.replace(/^\/|\/$/g, '') +'/' + name).then(function (result) {
				 deferred.resolve(result.data);
			}, deferred.reject);
			return deferred.promise;
		};


	}])


