app.service("usersApi", function ($http, apiConfig) {
  var baseUrl = apiConfig.baseUrl + "/users";
  var headers = angular.copy(apiConfig.headers);

  this.getAll = function () {
    return $http.get(baseUrl + "?select=user_id,username", {
      headers: headers
    });
  };
});