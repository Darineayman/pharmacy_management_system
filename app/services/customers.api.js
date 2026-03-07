app.service("customersApi", function ($http, apiConfig) {
  var baseUrl = apiConfig.baseUrl + "/customers";
  var headers = angular.copy(apiConfig.headers);

  this.getAll = function () {
    return $http.get(
      baseUrl +
        "?select=customer_id,full_name,phone_number,email,address,loyalty_points,created_at&order=full_name.asc",
      { headers: headers },
    );
  };
  this.create = function (payload) {
    return $http.post(baseUrl, payload, {
      headers: headers,
    });
  };

  this.update = function (id, payload) {
    return $http.patch(baseUrl + "?customer_id=eq." + id, payload, {
      headers: headers,
    });
  };

  this.remove = function (id) {
    return $http.delete(baseUrl + "?customer_id=eq." + id, {
      headers: headers,
    });
  };
});
