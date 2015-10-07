angular.module('TwitchStats', ['ngCookies']);

angular.module('TwitchStats')
  .controller('UsersController', ['$scope', '$http', '$cookies', function($scope, $http, $cookies){

    $scope.welcome = "Welcome to my Twitch Stats App";

    $scope.users = [];
    $scope.newUser = {};
    $scope.logInUser = {};

    $scope.getUsers = function(){
      $http.get('/api/users').then(function(response){
        $scope.users = response.data;
      });
    };
    $scope.getUsers();

    $scope.createUser = function(){
      $http.post('/api/users', $scope.newUser).then(function(response){
        $scope.users.push(response.data);
        $scope.newUser = {};
      });
    };

    $scope.obtainToken = function(){
      $http.post("/api/users/authentication_token", $scope.logInUser).then(function(reponse){
        $scope.token = reponse.data.token;
        $cookies.put('token', $scope.token);
      });
    };

    $scope.logOut = function(){
      $cookies.remove('token');
      $scope.token = $cookies.get('token');
    };

    $scope.token = $cookies.get('token');

  }]);
