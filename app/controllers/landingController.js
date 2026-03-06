app.controller("LandingController", function($scope, $location){
  $scope.navigate = function(path){
    $location.path(path);
  };
});