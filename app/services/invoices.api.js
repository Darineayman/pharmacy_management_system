app.service("invoicesApi", function ($http, apiConfig) {
  var baseUrl = apiConfig.baseUrl + "/invoices";
  var headers = angular.copy(apiConfig.headers);

  this.getAll = function () {
    return $http.get(
      baseUrl +
        "?select=invoice_id,customer_id,created_by,invoice_number,total_amount,payment_method,status,created_at&order=created_at.desc",
      { headers: headers },
    );
  };

  this.create = function (payload) {
    return $http.post(baseUrl, payload, {
      headers: headers,
    });
  };

  this.update = function (id, payload) {
    return $http.patch(baseUrl + "?invoice_id=eq." + id, payload, {
      headers: headers,
    });
  };

  this.remove = function (id) {
    return $http.delete(baseUrl + "?invoice_id=eq." + id, {
      headers: headers,
    });
  };
});
