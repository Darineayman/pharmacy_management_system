app.service("suppliersApi", function ($http, apiConfig) {
  var baseUrl = apiConfig.baseUrl + "/suppliers";
  var headers = angular.copy(apiConfig.headers);

  this.getForSuppliersPage = function () {
    return $http.get(
      baseUrl + "?select=supplier_id,name,contact,created_at&order=supplier_id.asc",
      { headers: headers }
    );
  };

  this.getAll = function () {
    return $http.get(
      baseUrl + "?select=supplier_id,name&order=name.asc",
      { headers: headers }
    );
  };

  this.create = function (payload) {
    return $http.post(baseUrl, payload, {
      headers: headers,
    });
  };

  this.update = function (id, payload) {
    return $http.patch(baseUrl + "?supplier_id=eq." + id, payload, {
      headers: headers,
    });
  };

  this.remove = function (id) {
    return $http.delete(baseUrl + "?supplier_id=eq." + id, {
      headers: headers,
    });
  };
});