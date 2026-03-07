app.service("invoiceItemsApi", function ($http, apiConfig) {
  var baseUrl = apiConfig.baseUrl + "/invoice_items";
  var headers = angular.copy(apiConfig.headers);

  this.getAll = function () {
    return $http.get(
      baseUrl +
        "?select=invoiceItem_id,invoice_id,medicine_id,quantity,line_total",
      { headers: headers },
    );
  };
  this.getByInvoiceId = function (invoiceId) {
    return $http.get(
      baseUrl +
        "?invoice_id=eq." +
        invoiceId +
        "&select=invoiceItem_id,invoice_id,medicine_id,quantity,line_total",
      { headers: headers },
    );
  };

  this.createMany = function (payload) {
    return $http.post(baseUrl, payload, {
      headers: headers,
    });
  };

  this.removeByInvoiceId = function (invoiceId) {
    return $http.delete(baseUrl + "?invoice_id=eq." + invoiceId, {
      headers: headers,
    });
  };
});
