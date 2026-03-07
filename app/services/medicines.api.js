app.service("medicinesApi", function ($http, apiConfig) {
  var baseUrl = apiConfig.baseUrl + "/medicines";
  var headers = angular.copy(apiConfig.headers);

  this.getAll = function () {
    return $http.get(
      baseUrl + "?select=medicine_id,name,price,quantity,category,supplier_id,image_url,description,expiry_date,created_at&order=created_at.desc",
      { headers: headers }
    );
  };

  this.getForInvoice = function () {
    return $http.get(
      baseUrl + "?select=medicine_id,name,price,quantity&order=name.asc",
      { headers: headers }
    );
  };

  this.create = function (payload) {
    return $http.post(baseUrl, payload, {
      headers: headers
    });
  };

  this.update = function (id, payload) {
    return $http.patch(baseUrl + "?medicine_id=eq." + id, payload, {
      headers: headers
    });
  };

  this.remove = function (id) {
    return $http.delete(baseUrl + "?medicine_id=eq." + id, {
      headers: headers
    });
  };
});