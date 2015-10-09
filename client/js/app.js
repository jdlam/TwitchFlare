angular.module('TwitchStats', []);

angular.module('TwitchStats')
  .controller('GamesController', ['$scope', '$http', function($scope, $http){

    $scope.welcome = "Welcome to my Twitch Stats App";

  }]);
