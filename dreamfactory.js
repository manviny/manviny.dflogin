'use strict';
   // INSTALL:  bower install manviny/manviny.dreamfactory --save
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
	* UPLOAD FILES
	* @memberof DFS3
    * @ngdoc directive   		
	* @param {path}  path from where to get content
	* @returns {array} array of Objects => {files:files, folders:folders} -> (content_length, content_type, last_modified, name, path, type)
    * @example
    *   Usage:
    *   		<input type="file" file-model="myFile" />
	*			<button ng-click="uploadFile()">upload me</button>		
	*/	
	.directive('fileModel', ['$parse', function ($parse) {
	    return {
	        restrict: 'A',
	        link: function(scope, element, attrs) {
	            var model = $parse(attrs.fileModel);
	            var modelSetter = model.assign;
	            
	            element.bind('change', function(){
	                scope.$apply(function(){
	                    modelSetter(scope, element[0].files[0]);
	                });
	            });
	        }
	    };
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
		* Get bucket files and folders from the given path (1 level, not recursive)
		* @memberof DFS3
	 	* @function getBucketContent	 		
		* @param {path}  path from where to get content
		* @returns {array} array of Objects => {files:files, folders:folders} -> (content_length, content_type, last_modified, name, path, type)
	    * @example
	    *   Usage:
	    *   		DFS3.getBucketContent( || '' || '/' || 'path'|| '/path'|| 'path/' || '/path/')
		*			.then(function (result) { 		
		*/
		this.getBucketContent = function (path) {
			var files = []; var folders = [];
			if(path==undefined) path = '';

			var deferred = $q.defer();
			$http.get('/api/v2/S3/'+ path.replace(/^\/|\/$/g, '') +'/?include_folders=true&include_files=true').then(function (result) {
				angular.forEach(result.data.resource, function(value) {
					if(value.type=='folder'){ folders.push(value) }
					else { files.push(value) }
				});
				deferred.resolve({files:files, folders:folders});
			}, deferred.reject);
			return deferred.promise;
		};

		/**
		* get paths from the given path (all levels under this path)
		* @memberof DFS3
	 	* @function getPaths	 		
		* @param {path} root path from where to get paths
		* @returns {Array} array o Strings with paths
	    * @example
	    *   Usage:
	    *   		DFS3.getPaths( || '' || '/' || 'path'|| '/path'|| 'path/' || '/path/')
		*			.then(function (result) { 		
		*/
		this.getPathsRecursive = function (path) {
			if(path==undefined) path = '';
			var paths = [];
			var deferred = $q.defer();

			// quita primer y ultimo '/'
			$http.get('/api/v2/S3/'+ path.replace(/^\/|\/$/g, '') +'/?as_list=true&as_access_list=true').then(function (result) {
				angular.forEach(result.data.resource, function(value) {
					if(value.slice(-1)!='*') paths.push(value.slice(0, -1));				// quita rutas que terminan en *
				});
				deferred.resolve(paths);
			}, deferred.reject);
			return deferred.promise;
		};

		/**
		* creates EMPTY file in S3
		* @memberof DFS3
	 	* @function createFile	 		
		* @param {path,name} path in S3, name of the file
		* @returns {Hash} filterd attributes
		*/
		this.createFile = function (path, name) {
			var deferred = $q.defer();
			$http.post('/api/v2/S3'+ path.replace(/^\/|\/$/g, '') +'/' + name).then(function (result) {
				 deferred.resolve(result.data);
			}, deferred.reject);
			return deferred.promise;
		};


		/**
		* deletes  file in S3
		* @memberof DFS3
	 	* @function deleteFile	 		
		* @param {path,name} path in S3, name of the file
		* @returns {Hash} filterd attributes
		*/
		this.deleteFile = function (path, name) {
			var deferred = $q.defer();
			$http.delete('/api/v2/S3/'+ path.replace(/^\/|\/$/g, '') +'/' + name).then(function (result) {
				 deferred.resolve(result.data);
			}, deferred.reject);
			return deferred.promise;
		};

		/**
		* creates FOLDER file in S3
		* @memberof DFS3ΩΩΩ
	 	* @function createFolder	 		
		* @param {path,name} path in S3, name of the file
		* @returns {Hash} filterd attributes
		*/
		this.createFolder = function (path, name) {
			var deferred = $q.defer();
			$http.post('/api/v2/S3'+ path.replace(/^\/|\/$/g, '') +'/' + name +'/' ).then(function (result) {
				 deferred.resolve(result.data);
			}, deferred.reject);
			return deferred.promise;
		};


		/**
		* converts path to Breadcrumbs
		* @memberof DFS3
	 	* @function pathToBreadcrumb	 		
		* @param {path,name} path in S3, name of the file
		* @returns {Hash} filterd attributes
		*/
		this.pathToBreadcrumbs = function (path) {
			
			var breadcrumbs = path.split('/');
			breadcrumbs.pop(); 
			return breadcrumbs;
		};

		/**
		* converts Breadcrumbs to path 
		* @memberof DFS3ΩΩΩ
	 	* @function breadcrumbToPath	 		
		* @param {path,name} path in S3, name of the file
		* @returns {Hash} filterd attributes
		*/
		this.breadcrumbsToPath = function (name) {

		};

		/**
		* Uploads a file to S3
		* @memberof DFS3
	 	* @function uploadFile	 		
		* @param {path,name} path in S3, name of the file
		* @returns {Hash} filterd attributes
		*/
		this.uploadFile = function (path, file) {
			var deferred = $q.defer();

		    var fd = new FormData();
		    fd.append("files", file);

		    $http.post( "/api/v2/S3/"+ path  + '/' + file.name, fd, {	
		        headers: {'Content-Type': undefined },
		        transformRequest: angular.identity
		    })  
		    .success(function(data){
		    	deferred.resolve(data);
			})
			.error(function(data){
		    	deferred.reject(data);
			});	

			return deferred.promise;

		};



	}])


