app.service("purchasesApi", function ($http, apiConfig) {
    var baseUrl = apiConfig.baseUrl + "/purchases";
    var headers = angular.copy(apiConfig.headers);

    function getErrorMessage(err) {
        return ((err && err.data && err.data.message) || err.message || "").toLowerCase();
    }

    function isDuplicatePurchasePkError(err) {
        var message = getErrorMessage(err);
        return (
            message.indexOf("duplicate key value violates unique constraint") !== -1 &&
            message.indexOf("purchases_pkey") !== -1
        );
    }

    this.getAll = function () {
        return $http.get(
            baseUrl +
            "?select=purchase_id,supplier_id,medicine_id,quantity,price,purchase_date&order=purchase_date.desc",
            { headers: headers }
        );
    };

    this.getLatestId = function () {
        return $http.get(
            baseUrl + "?select=purchase_id&order=purchase_id.desc&limit=1",
            { headers: headers }
        );
    };

    this.create = function (payload) {
        return $http.post(baseUrl, payload, {
            headers: headers
        });
    };

    this.createSafe = function (payload) {
        var self = this;

        return self.create(payload).catch(function (err) {
            if (!isDuplicatePurchasePkError(err)) {
                throw err;
            }

            return self.getLatestId().then(function (res) {
                var rows = (res && res.data) || [];
                var latestId = rows.length ? Number(rows[0].purchase_id || 0) : 0;
                var payloadWithId = angular.extend({}, payload, {
                    purchase_id: latestId + 1
                });

                return self.create(payloadWithId);
            });
        });
    };
});
