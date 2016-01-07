# Install dreamfactory login/register

1. **bower install** manviny/manviny.dreamfactory --save  
2. check that all js and css libraries are loaded  
3. **inject** 'manviny/manviny.dreamfactory' into your app module  
4. **add** 'LoginCtrl','RegisterController' to your controller  
5. start using it  



# Needed
```js
# app.js
angular.module('your-app', [..., 'manviny.dreamfactory', ...])
.constant('INSTANCE_URL', 'http://sample-instance.cloud.dreamfactory.com')
.constant('DSP_API_KEY', 'YOUR-API-KEY')

...

# mycontroller.js
.controller('myCtrl', function ($scope, Login) {
  	$scope.login = function(){
  		Login.login({email:'usermail',password:'****'})
  		.then(function(response){alert(JSON.stringify(response))})

````

## use example 
login.html
```html
<div ng-controller="LoginCtrl">
        <button ng-click="login()"> login </button>

```
register.html
```html
<div class="signin-card">

  <h1 class="text-center">Register</h1>
  <form name="registerForm" ng-submit="submit()">

    <md-input-container>
      <label>First name</label>
      <input ng-model="firstName">
    </md-input-container>
    
    <md-input-container>
      <label>Last name</label>
      <input ng-model="lastName">
    </md-input-container>

    <md-input-container>
      <label>Email</label>
      <input type="email" ng-model="username">
    </md-input-container>

    <md-input-container>
      <label>Password</label>
      <input type="password" ng-model="password">
    </md-input-container>

    <div class="text-center">
      <md-button ng-disabled="registerForm.$invalid" type="button" class="md-primary" ng-click="register()">Register</md-button>
    </div>

  </form>
</div>
```
